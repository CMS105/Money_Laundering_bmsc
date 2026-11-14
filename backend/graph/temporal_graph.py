import networkx as nx
import polars as pl
from typing import Dict, List, Any, Optional, Tuple, Set


class TemporalGraph:
    """
    High-performance temporal directed multigraph for financial transactions.
    Backed by Polars for vectorized filtering and NetworkX for graph path analysis.
    """

    def __init__(self, df: Optional[pl.DataFrame] = None):
        self.df: pl.DataFrame = pl.DataFrame()
        self.graph: nx.MultiDiGraph = nx.MultiDiGraph()
        self.node_stats: Dict[str, Dict[str, Any]] = {}
        if df is not None:
            self.load_dataframe(df)

    def load_dataframe(self, df: pl.DataFrame) -> "TemporalGraph":
        """
        Builds the temporal graph from a Polars DataFrame of transactions.
        Required columns: transaction_id, timestamp, source_account, target_account, amount
        """
        self.df = df.sort("timestamp")
        self.graph.clear()
        self.node_stats.clear()

        # Extract unique accounts and initialize stats
        sources = self.df["source_account"].to_list()
        targets = self.df["target_account"].to_list()
        amounts = self.df["amount"].to_list()
        timestamps = self.df["timestamp"].to_list()
        tx_ids = self.df["transaction_id"].to_list()
        
        # Optional ground truth columns
        is_laundering = self.df["is_laundering"].to_list() if "is_laundering" in self.df.columns else [False] * len(sources)
        typology = self.df["typology"].to_list() if "typology" in self.df.columns else ["NORMAL"] * len(sources)
        pattern_id = self.df["pattern_id"].to_list() if "pattern_id" in self.df.columns else [None] * len(sources)

        # Batch populate NetworkX MultiDiGraph
        for i in range(len(sources)):
            u = sources[i]
            v = targets[i]
            amt = float(amounts[i])
            ts = int(timestamps[i])
            tx_id = tx_ids[i]
            is_l = bool(is_laundering[i])
            typ = str(typology[i])
            pid = pattern_id[i]

            self.graph.add_edge(
                u,
                v,
                key=tx_id,
                transaction_id=tx_id,
                amount=amt,
                timestamp=ts,
                is_laundering=is_l,
                typology=typ,
                pattern_id=pid,
            )

        # Vectorized compute of node-level flow metrics
        self._compute_node_metrics()
        return self

    def _compute_node_metrics(self):
        """
        Vectorized computation of node aggregated volumes, in/out degrees, and balance delta.
        """
        out_flows = (
            self.df.group_by("source_account")
            .agg([
                pl.col("amount").sum().alias("total_out_volume"),
                pl.col("amount").count().alias("out_degree"),
                pl.col("timestamp").min().alias("first_out_ts"),
                pl.col("timestamp").max().alias("last_out_ts"),
            ])
            .rename({"source_account": "account"})
        )

        in_flows = (
            self.df.group_by("target_account")
            .agg([
                pl.col("amount").sum().alias("total_in_volume"),
                pl.col("amount").count().alias("in_degree"),
                pl.col("timestamp").min().alias("first_in_ts"),
                pl.col("timestamp").max().alias("last_in_ts"),
            ])
            .rename({"target_account": "account"})
        )

        merged = out_flows.join(in_flows, on="account", how="full", coalesce=True).fill_null(0)
        
        # Update node_stats dictionary for O(1) lookups
        for row in merged.iter_rows(named=True):
            acc = row["account"]
            tot_in = float(row.get("total_in_volume", 0.0) or 0.0)
            tot_out = float(row.get("total_out_volume", 0.0) or 0.0)
            in_deg = int(row.get("in_degree", 0) or 0)
            out_deg = int(row.get("out_degree", 0) or 0)
            
            # Flow retention ratio (for mule analysis): 1.0 means perfectly matched pass-through
            denom = max(tot_in, tot_out, 1.0)
            balance_delta = abs(tot_in - tot_out)
            retention_ratio = 1.0 - (balance_delta / denom)

            self.node_stats[acc] = {
                "account": acc,
                "total_in_volume": tot_in,
                "total_out_volume": tot_out,
                "in_degree": in_deg,
                "out_degree": out_deg,
                "net_flow": tot_in - tot_out,
                "retention_ratio": round(retention_ratio, 4),
            }
            if self.graph.has_node(acc):
                self.graph.nodes[acc].update(self.node_stats[acc])

    def get_node_stats(self, account: str) -> Dict[str, Any]:
        return self.node_stats.get(account, {
            "account": account,
            "total_in_volume": 0.0,
            "total_out_volume": 0.0,
            "in_degree": 0,
            "out_degree": 0,
            "net_flow": 0.0,
            "retention_ratio": 0.0,
        })

    def to_react_flow_json(
        self,
        subgraph_nodes: Optional[Set[str]] = None,
        max_edges: int = 300,
    ) -> Dict[str, Any]:
        """
        Exports the graph (or a suspicious subgraph) into React Flow format:
        nodes: [{ id, data: { label, total_in, total_out, risk }, position }]
        edges: [{ id, source, target, label, data: { amount, timestamp, typology } }]
        """
        nodes_to_export = subgraph_nodes if subgraph_nodes is not None else set(self.graph.nodes())
        
        rf_nodes = []
        import math
        node_list = list(nodes_to_export)
        n = len(node_list)
        radius = max(200, n * 35)

        for i, node in enumerate(node_list):
            stats = self.get_node_stats(node)
            angle = (2 * math.pi * i) / max(n, 1)
            x = round(radius * math.cos(angle) + radius + 50)
            y = round(radius * math.sin(angle) + radius + 50)

            rf_nodes.append({
                "id": node,
                "data": {
                    "label": node,
                    "in_degree": stats["in_degree"],
                    "out_degree": stats["out_degree"],
                    "total_in_volume": stats["total_in_volume"],
                    "total_out_volume": stats["total_out_volume"],
                    "retention_ratio": stats["retention_ratio"],
                },
                "position": {"x": x, "y": y},
            })

        rf_edges = []
        edge_count = 0
        for u, v, key, data in self.graph.edges(keys=True, data=True):
            if subgraph_nodes and (u not in subgraph_nodes or v not in subgraph_nodes):
                continue
            if edge_count >= max_edges:
                break

            rf_edges.append({
                "id": str(key),
                "source": u,
                "target": v,
                "label": f"${data['amount']:,.0f}",
                "data": {
                    "amount": data["amount"],
                    "timestamp": data["timestamp"],
                    "is_laundering": data.get("is_laundering", False),
                    "typology": data.get("typology", "NORMAL"),
                    "pattern_id": data.get("pattern_id"),
                },
                "animated": data.get("is_laundering", False),
            })
            edge_count += 1

        return {"nodes": rf_nodes, "edges": rf_edges}

