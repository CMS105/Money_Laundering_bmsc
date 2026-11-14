import uuid
from typing import List, Dict, Any, Set, Tuple, Optional
import networkx as nx
from backend.graph.temporal_graph import TemporalGraph
from backend.data.models import TypologyType
from .models import DetectedAlert


class CycleDetector:
    """
    Detects Directed Temporal Cycles (Washing Loops):
    A -> B -> C -> ... -> A
    Enforces:
    1. Cycle length between 3 and 6 nodes.
    2. Strict temporal monotonicity: t1 < t2 < ... < tk.
    3. Loop completion within max_loop_duration_seconds.
    4. Capital preservation: Amount retains >= 80% across the cycle.
    """

    def __init__(
        self,
        min_cycle_len: int = 3,
        max_cycle_len: int = 6,
        max_loop_duration_seconds: int = 172800,  # 48 hours
        min_amount: float = 1000.0,
    ):
        self.min_cycle_len = min_cycle_len
        self.max_cycle_len = max_cycle_len
        self.max_loop_duration = max_loop_duration_seconds
        self.min_amount = min_amount

    def detect(self, tg: TemporalGraph) -> List[DetectedAlert]:
        alerts: List[DetectedAlert] = []
        mg = tg.graph

        if mg.number_of_nodes() == 0 or mg.number_of_edges() == 0:
            return alerts

        # Build a lightweight directed graph filtered to edges above min_amount
        # to prune low-value retail noise before cycle enumeration
        simple_dg = nx.DiGraph()
        for u, v, data in mg.edges(data=True):
            if data["amount"] >= self.min_amount:
                simple_dg.add_edge(u, v)

        # Find simple cycles with bounded length
        # Using simple_cycles with length filter
        try:
            cycles = list(nx.simple_cycles(simple_dg, length_bound=self.max_cycle_len))
        except TypeError:
            # Fallback if networkx version doesn't support length_bound
            cycles = [c for c in nx.simple_cycles(simple_dg) if len(c) <= self.max_cycle_len]

        seen_rings: Set[Tuple[str, ...]] = set()

        for cycle_nodes in cycles:
            k = len(cycle_nodes)
            if k < self.min_cycle_len:
                continue

            # Standardize cycle representation for deduplication
            min_idx = cycle_nodes.index(min(cycle_nodes))
            norm_cycle = tuple(cycle_nodes[min_idx:] + cycle_nodes[:min_idx])
            if norm_cycle in seen_rings:
                continue
            seen_rings.add(norm_cycle)

            # Check if there exists a valid temporal sequence across the cycle
            valid_seq = self._find_temporal_sequence(mg, cycle_nodes)
            if valid_seq:
                tx_ids, timestamps, amounts = valid_seq
                total_duration = timestamps[-1] - timestamps[0]

                if total_duration <= self.max_loop_duration:
                    initial_amt = amounts[0]
                    final_amt = amounts[-1]
                    retention = (final_amt / initial_amt) if initial_amt > 0 else 0.0

                    # Capital preservation check
                    if retention >= 0.75:
                        risk_score = min(1.0, 0.80 + (k * 0.04))
                        total_volume = sum(amounts)

                        alert = DetectedAlert(
                            alert_id=f"ALERT_CYCLE_{uuid.uuid4().hex[:8].upper()}",
                            typology=TypologyType.ROUNDTRIP_CYCLE,
                            risk_score=round(risk_score, 3),
                            involved_accounts=cycle_nodes,
                            involved_transactions=tx_ids,
                            total_volume=round(total_volume, 2),
                            time_span_seconds=int(total_duration),
                            details={
                                "cycle_length": k,
                                "cycle_path": " -> ".join(cycle_nodes + [cycle_nodes[0]]),
                                "retention_ratio": round(retention, 4),
                                "start_time": timestamps[0],
                                "end_time": timestamps[-1],
                            },
                        )
                        alerts.append(alert)

        return alerts

    def _find_temporal_sequence(
        self, mg: nx.MultiDiGraph, cycle_nodes: List[str]
    ) -> Optional[Tuple[List[str], List[int], List[float]]]:
        """
        Greedily finds a sequence of transactions connecting cycle_nodes[i] -> cycle_nodes[i+1]
        such that t0 < t1 < ... < tk.
        """
        k = len(cycle_nodes)
        curr_t = -1
        selected_tx = []
        selected_ts = []
        selected_amt = []

        for i in range(k):
            u = cycle_nodes[i]
            v = cycle_nodes[(i + 1) % k]

            # Get all directed edges u -> v
            edges = mg.get_edge_data(u, v)
            if not edges:
                return None

            # Sort candidate edges by timestamp
            candidates = sorted(
                edges.values(), key=lambda e: e["timestamp"]
            )

            # Find the earliest edge where timestamp > curr_t
            valid_edge = None
            for e in candidates:
                if e["timestamp"] > curr_t and e["amount"] >= self.min_amount:
                    valid_edge = e
                    break

            if valid_edge is None:
                return None

            curr_t = valid_edge["timestamp"]
            selected_tx.append(valid_edge["transaction_id"])
            selected_ts.append(curr_t)
            selected_amt.append(valid_edge["amount"])

        return selected_tx, selected_ts, selected_amt
