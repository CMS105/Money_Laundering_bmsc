import uuid
from typing import List, Dict, Any, Set, Tuple, Optional
import networkx as nx
from backend.graph.temporal_graph import TemporalGraph
from backend.data.models import TypologyType
from .models import DetectedAlert


class MuleChainDetector:
    """
    Detects Rapid Pass-Through Mule Chains (Layering & Conduit Relays):
    Source -> Mule 1 -> [Mule 2] -> Destination
    Identified by:
    1. Fast transit latency: 0 <= t_out - t_in <= max_transit_latency_seconds.
    2. High balance pass-through: |In - Out| / max(In, Out) <= (1.0 - min_retention_ratio).
    3. Low dwell / holding time at intermediary accounts.
    """

    def __init__(
        self,
        max_transit_latency_seconds: int = 86400 * 14,  # 14 days
        min_retention_ratio: float = 0.70,
        min_amount: float = 200.0,
    ):
        self.max_transit_latency = max_transit_latency_seconds
        self.min_retention_ratio = min_retention_ratio
        self.min_amount = min_amount

    def detect(self, tg: TemporalGraph) -> List[DetectedAlert]:
        alerts: List[DetectedAlert] = []
        mg = tg.graph

        if mg.number_of_nodes() == 0:
            return alerts

        # Step 1: Identify all candidate mule nodes with both in/out flow
        candidate_mules: Set[str] = set()
        for node in mg.nodes():
            stats = tg.get_node_stats(node)
            if stats["in_degree"] >= 1 and stats["out_degree"] >= 1:
                if stats["total_in_volume"] >= self.min_amount:
                    if stats["retention_ratio"] >= self.min_retention_ratio:
                        candidate_mules.add(node)

        if not candidate_mules:
            return alerts

        # Step 2: Trace chains traversing through candidate mules
        visited_tx_chains: Set[Tuple[str, ...]] = set()

        for mule in candidate_mules:
            in_edges = sorted(
                mg.in_edges(mule, data=True),
                key=lambda e: e[2]["timestamp"]
            )
            out_edges = sorted(
                mg.out_edges(mule, data=True),
                key=lambda e: e[2]["timestamp"]
            )

            for u, _, in_data in in_edges:
                if in_data["amount"] < self.min_amount:
                    continue
                t_in = in_data["timestamp"]

                for _, v, out_data in out_edges:
                    if out_data["amount"] < self.min_amount:
                        continue
                    # Avoid trivial immediate loop u == v (handled by CycleDetector)
                    if u == v:
                        continue

                    t_out = out_data["timestamp"]
                    delta_t = t_out - t_in

                    # Check forward chronological sequence and transit latency
                    if 0 <= delta_t <= self.max_transit_latency:
                        in_amt = in_data["amount"]
                        out_amt = out_data["amount"]
                        amt_ratio = min(in_amt, out_amt) / max(in_amt, out_amt, 1.0)

                        if amt_ratio >= self.min_retention_ratio:
                            chain_key = (in_data["transaction_id"], out_data["transaction_id"])
                            if chain_key in visited_tx_chains:
                                continue
                            visited_tx_chains.add(chain_key)

                            risk_score = min(0.99, 0.72 + (0.20 * amt_ratio))
                            if delta_t < 3600:  # sub-1 hour transit velocity boost
                                risk_score = min(0.99, risk_score + 0.06)

                            involved = [u, mule, v]
                            dwell_mins = round(delta_t / 60.0, 1)

                            alert = DetectedAlert(
                                alert_id=f"ALERT_MULE_{uuid.uuid4().hex[:8].upper()}",
                                typology=TypologyType.MULE_CHAIN,
                                risk_score=round(risk_score, 3),
                                involved_accounts=involved,
                                involved_transactions=[in_data["transaction_id"], out_data["transaction_id"]],
                                total_volume=round(in_amt + out_amt, 2),
                                time_span_seconds=int(delta_t),
                                details={
                                    "mule_account": mule,
                                    "source": u,
                                    "destination": v,
                                    "incoming_amount": round(in_amt, 2),
                                    "outgoing_amount": round(out_amt, 2),
                                    "amount_retained": round(abs(in_amt - out_amt), 2),
                                    "retention_ratio": round(amt_ratio, 4),
                                    "dwell_time_mins": dwell_mins,
                                    "transit_latency_hours": round(delta_t / 3600.0, 2),
                                    "hop_count": 2,
                                },
                            )
                            alerts.append(alert)

        return alerts
