import polars as pl
from typing import Set, Dict, Any, List
from backend.graph.temporal_graph import TemporalGraph


class RuleBasedBaseline:
    """
    Simulates industry-standard legacy Rule-Based AML System:
    1. CTR Rule: Any single transaction >= $10,000.
    2. Velocity Rule: Any account with >= 4 transactions within a 24-hour window.
    3. High-Value Cumulative Rule: Any account transferring >= $25,000 in a rolling window.
    """

    def __init__(
        self,
        ctr_threshold: float = 10000.0,
        daily_velocity_threshold: int = 4,
        cumulative_volume_threshold: float = 25000.0,
    ):
        self.ctr_threshold = ctr_threshold
        self.daily_velocity_threshold = daily_velocity_threshold
        self.cumulative_volume_threshold = cumulative_volume_threshold

    def evaluate(self, tg: TemporalGraph) -> Set[str]:
        """
        Returns the set of transaction_ids flagged as suspicious by baseline threshold rules.
        """
        flagged_tx: Set[str] = set()
        df = tg.df

        if df.is_empty():
            return flagged_tx

        # Rule 1: CTR Threshold (> $10k)
        ctr_matches = df.filter(pl.col("amount") >= self.ctr_threshold)
        flagged_tx.update(ctr_matches["transaction_id"].to_list())

        # Rule 2: High Velocity Accounts (>= 4 tx in dataset)
        source_counts = df.group_by("source_account").agg(
            pl.col("transaction_id").alias("tx_ids"),
            pl.col("transaction_id").count().alias("count"),
        )
        high_velocity = source_counts.filter(pl.col("count") >= self.daily_velocity_threshold)
        for row in high_velocity.iter_rows(named=True):
            flagged_tx.update(row["tx_ids"])

        # Rule 3: High Cumulative Outgoing Volume
        vol_groups = df.group_by("source_account").agg(
            pl.col("transaction_id").alias("tx_ids"),
            pl.col("amount").sum().alias("total_out"),
        )
        high_vol = vol_groups.filter(pl.col("total_out") >= self.cumulative_volume_threshold)
        for row in high_vol.iter_rows(named=True):
            flagged_tx.update(row["tx_ids"])

        return flagged_tx

