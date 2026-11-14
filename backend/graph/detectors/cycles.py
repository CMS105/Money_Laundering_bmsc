import uuid
from typing import List, Dict, Any, Set, Tuple, Optional
import networkx as nx
from backend.graph.temporal_graph import TemporalGraph
from backend.data.models import TypologyType
from .models import DetectedAlert


class CycleDetector:
    """
    Detects Directed Temporal Cycles (Round-Trip Laundering Loops):
    A -> B -> ... -> A
    Enforces:
    1. Cycle length between 2 and 6 nodes (including bilateral round-tripping A -> B -> A).
    2. Temporal consistency: checks all valid cycle rotations to find t1 <= t2 <= ... <= tk.
    3. Loop completion within max_loop_duration_seconds.
    4. Capital preservation: Returned amount >= 60% of initial outflow.
    """

    def __init__(
        self,
        min_cycle_len: int = 2,
        max_cycle_len: int = 5,
        max_loop_duration_seconds: int = 86400 * 45,  # 45 days
        min_amount: float = 100.0,
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

        # Build a directed graph filtered to edges above min_amount to prune dust
        simple_dg = nx.DiGraph()
        for u, v, data in mg.edges(data=True):
            if data["amount"] >= self.min_amount:
                simple_dg.add_edge(u, v)

        # 1. Enumerate simple cycles with length bounds
        cycles: List[List[str]] = []
        try:
            cycles = list(nx.simple_cycles(simple_dg, length_bound=self.max_cycle_len))
        except TypeError:
            cycles = [c for c in nx.simple_cycles(simple_dg) if len(c) <= self.max_cycle_len]

        seen_rings: Set[Tuple[str, ...]] = set()

        for cycle_nodes in cycles:
            k = len(cycle_nodes)
            if k < self.min_cycle_len or k > self.max_cycle_len:
                continue

            # Standardize canonical cycle representation for deduplication
            min_idx = cycle_nodes.index(min(cycle_nodes))
            norm_cycle = tuple(cycle_nodes[min_idx:] + cycle_nodes[:min_idx])
            if norm_cycle in seen_rings:
                continue
            seen_rings.add(norm_cycle)

            # Check all cyclic rotations to find a valid chronological start
            valid_seq = None
            best_ordered_nodes = cycle_nodes
            for rot in range(k):
                rotated_nodes = cycle_nodes[rot:] + cycle_nodes[:rot]
                seq = self._find_temporal_sequence(mg, rotated_nodes)
                if seq:
                    valid_seq = seq
                    best_ordered_nodes = rotated_nodes
                    break

            if valid_seq:
                tx_ids, timestamps, amounts = valid_seq
                total_duration = timestamps[-1] - timestamps[0]

                if total_duration <= self.max_loop_duration:
                    initial_amt = amounts[0]
                    final_amt = amounts[-1]
                    retention = (final_amt / initial_amt) if initial_amt > 0 else 0.0

                    # Capital preservation check (at least 60% recovered)
                    if retention >= 0.60:
                        risk_score = min(0.99, 0.82 + (k * 0.03))
                        total_volume = sum(amounts)

                        alert = DetectedAlert(
                            alert_id=f"ALERT_CYCLE_{uuid.uuid4().hex[:8].upper()}",
                            typology=TypologyType.ROUNDTRIP_CYCLE,
                            risk_score=round(risk_score, 3),
                            involved_accounts=best_ordered_nodes,
                            involved_transactions=tx_ids,
                            total_volume=round(total_volume, 2),
                            time_span_seconds=int(total_duration),
                            details={
                                "cycle_length": k,
                                "cycle_path": " -> ".join(best_ordered_nodes + [best_ordered_nodes[0]]),
                                "retention_ratio": round(retention, 4),
                                "initial_amount": round(initial_amt, 2),
                                "returned_amount": round(final_amt, 2),
                                "amount_discrepancy": round(abs(initial_amt - final_amt), 2),
                                "start_time": timestamps[0],
                                "end_time": timestamps[-1],
                                "duration_days": round(total_duration / 86400.0, 1),
                            },
                        )
                        alerts.append(alert)

        return alerts

    def _find_temporal_sequence(
        self, mg: nx.MultiDiGraph, cycle_nodes: List[str]
    ) -> Optional[Tuple[List[str], List[int], List[float]]]:
        """
        Greedily finds a sequence of transactions connecting cycle_nodes[i] -> cycle_nodes[i+1]
        such that t0 <= t1 <= ... <= tk.
        """
        k = len(cycle_nodes)
        curr_t = -1
        selected_tx = []
        selected_ts = []
        selected_amt = []

        for i in range(k):
            u = cycle_nodes[i]
            v = cycle_nodes[(i + 1) % k]

            edges = mg.get_edge_data(u, v)
            if not edges:
                return None

            candidates = sorted(edges.values(), key=lambda e: e["timestamp"])

            valid_edge = None
            for e in candidates:
                if e["timestamp"] >= curr_t and e["amount"] >= self.min_amount:
                    valid_edge = e
                    break

            if valid_edge is None:
                return None

            curr_t = valid_edge["timestamp"]
            selected_tx.append(valid_edge["transaction_id"])
            selected_ts.append(curr_t)
            selected_amt.append(valid_edge["amount"])

        return selected_tx, selected_ts, selected_amt
