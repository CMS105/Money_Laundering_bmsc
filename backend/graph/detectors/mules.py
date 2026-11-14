import uuid
from typing import List, Dict, Any, Set, Tuple, Optional
import networkx as nx
from backend.graph.temporal_graph import TemporalGraph
from backend.data.models import TypologyType
from .models import DetectedAlert


class MuleChainDetector:
    """
    Detects Rapid Pass-Through Mule Chains (Layering Chains):
    Source -> Mule 1 -> Mule 2 -> ... -> Destination
    Identified by:
    1. Fast transit latency: t_out - t_in <= max_transit_latency_seconds (e.g. <= 1 hour).
    2. High balance pass-through: |In - Out| / In <= 0.10 (Retention Ratio >= 90%).
    3. Chain length >= 3 transactions (at least 2 consecutive intermediary mules or 1 strong mule).
    """

    def __init__(
        self,
        max_transit_latency_seconds: int = 3600,  # 1 hour
        min_retention_ratio: float = 0.90,
        min_amount: float = 5000.0,
    ):
        self.max_transit_latency = max_transit_latency_seconds
        self.min_retention_ratio = min_retention_ratio
        self.min_amount = min_amount

    def detect(self, tg: TemporalGraph) -> List[DetectedAlert]:
        alerts: List[DetectedAlert] = []
        mg = tg.graph

        if mg.number_of_nodes() == 0:
            return alerts

        # Step 1: Identify all candidate mule nodes
        candidate_mules: Set[str] = set()
        for node in mg.nodes():
            stats = tg.get_node_stats(node)
            # A mule must have both incoming and outgoing edges
            if stats["in_degree"] >= 1 and stats["out_degree"] >= 1:
                if stats["total_in_volume"] >= self.min_amount:
                    if stats["retention_ratio"] >= self.min_retention_ratio:
                        candidate_mules.add(node)

        if not candidate_mules:
            return alerts

        # Step 2: Trace chains traversing through candidate mules
        # Find paths where intermediaries are all candidate mules
        visited_tx_chains: Set[Tuple[str, ...]] = set()

        for mule in candidate_mules:
            # Check incoming edges to this mule
            in_edges = sorted(
                mg.in_edges(mule, data=True),
                key=lambda e: e[2]["timestamp"]
            )
            # Check outgoing edges from this mule
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
                    t_out = out_data["timestamp"]
                    delta_t = t_out - t_in

                    # Check rapid pass-through condition
                    if 0 < delta_t <= self.max_transit_latency:
                        # Check amount pass-through ratio
                        amt_ratio = min(in_data["amount"], out_data["amount"]) / max(in_data["amount"], out_data["amount"])
                        if amt_ratio >= 0.85:
                            chain_key = (in_data["transaction_id"], out_data["transaction_id"])
                            if chain_key in visited_tx_chains:
                                continue
                            visited_tx_chains.add(chain_key)

                            risk_score = min(1.0, 0.75 + (0.20 * amt_ratio))
                            involved = [u, mule, v]

                            alert = DetectedAlert(
                                alert_id=f"ALERT_MULE_{uuid.uuid4().hex[:8].upper()}",
                                typology=TypologyType.MULE_CHAIN,
                                risk_score=round(risk_score, 3),
                                involved_accounts=involved,
                                involved_transactions=[in_data["transaction_id"], out_data["transaction_id"]],
                                total_volume=round(in_data["amount"] + out_data["amount"], 2),
                                time_span_seconds=int(delta_t),
                                details={
                                    "mule_account": mule,
                                    "source": u,
                                    "destination": v,
                                    "transit_latency_seconds": delta_t,
                                    "amount_in": in_data["amount"],
                                    "amount_out": out_data["amount"],
                                    "pass_through_ratio": round(amt_ratio, 4),
                                },
                            )
                            alerts.append(alert)

        return alerts

