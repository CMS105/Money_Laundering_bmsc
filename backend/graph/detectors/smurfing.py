import uuid
from typing import List, Dict, Any, Set
import numpy as np
import polars as pl
from backend.graph.temporal_graph import TemporalGraph
from backend.data.models import TypologyType
from .models import DetectedAlert


class SmurfingDetector:
    """
    Detects Fan-Out (dispersion) and Fan-In (aggregation) smurfing typologies.
    Flags structured amounts just below regulatory reporting thresholds ($8,000 - $9,999)
    with low variance and temporal proximity.
    """

    def __init__(
        self,
        min_fan_degree: int = 3,
        max_window_seconds: int = 86400,  # 24 hours
        ctr_threshold: float = 10000.0,
        smurf_min_amount: float = 5000.0,
    ):
        self.min_fan_degree = min_fan_degree
        self.max_window_seconds = max_window_seconds
        self.ctr_threshold = ctr_threshold
        self.smurf_min_amount = smurf_min_amount

    def detect(self, tg: TemporalGraph) -> List[DetectedAlert]:
        alerts: List[DetectedAlert] = []
        df = tg.df

        if df.is_empty():
            return alerts

        # 1. Detect Fan-Out (Dispersion: 1 Source -> Many Intermediaries)
        # Filter transactions in typical structuring range [smurf_min_amount, ctr_threshold)
        struct_df = df.filter(
            (pl.col("amount") >= self.smurf_min_amount) & (pl.col("amount") < self.ctr_threshold)
        )

        if not struct_df.is_empty():
            # Group by source_account
            source_groups = (
                struct_df.group_by("source_account")
                .agg([
                    pl.col("target_account").n_unique().alias("distinct_targets"),
                    pl.col("target_account").alias("targets"),
                    pl.col("amount").alias("amounts"),
                    pl.col("timestamp").alias("timestamps"),
                    pl.col("transaction_id").alias("tx_ids"),
                    pl.col("amount").sum().alias("total_amt"),
                    pl.col("timestamp").min().alias("min_ts"),
                    pl.col("timestamp").max().alias("max_ts"),
                ])
                .filter(pl.col("distinct_targets") >= self.min_fan_degree)
            )

            for row in source_groups.iter_rows(named=True):
                time_span = row["max_ts"] - row["min_ts"]
                if time_span <= self.max_window_seconds:
                    amounts = row["amounts"]
                    mean_amt = float(np.mean(amounts))
                    std_amt = float(np.std(amounts))
                    cv = (std_amt / mean_amt) if mean_amt > 0 else 1.0

                    # Low coefficient of variation indicates structured amounts
                    if cv < 0.25:
                        risk_score = min(1.0, 0.70 + (row["distinct_targets"] * 0.05))
                        involved = [row["source_account"]] + list(set(row["targets"]))
                        
                        alert = DetectedAlert(
                            alert_id=f"ALERT_SMURF_OUT_{uuid.uuid4().hex[:8].upper()}",
                            typology=TypologyType.SMURFING,
                            risk_score=round(risk_score, 3),
                            involved_accounts=involved,
                            involved_transactions=row["tx_ids"],
                            total_volume=round(float(row["total_amt"]), 2),
                            time_span_seconds=int(time_span),
                            details={
                                "direction": "FAN_OUT",
                                "source_account": row["source_account"],
                                "distinct_targets": row["distinct_targets"],
                                "mean_amount": round(mean_amt, 2),
                                "coefficient_of_variation": round(cv, 4),
                            },
                        )
                        alerts.append(alert)

        # 2. Detect Fan-In (Aggregation: Many Intermediaries -> 1 Accumulator)
        if not struct_df.is_empty():
            target_groups = (
                struct_df.group_by("target_account")
                .agg([
                    pl.col("source_account").n_unique().alias("distinct_sources"),
                    pl.col("source_account").alias("sources"),
                    pl.col("amount").alias("amounts"),
                    pl.col("timestamp").alias("timestamps"),
                    pl.col("transaction_id").alias("tx_ids"),
                    pl.col("amount").sum().alias("total_amt"),
                    pl.col("timestamp").min().alias("min_ts"),
                    pl.col("timestamp").max().alias("max_ts"),
                ])
                .filter(pl.col("distinct_sources") >= self.min_fan_degree)
            )

            for row in target_groups.iter_rows(named=True):
                time_span = row["max_ts"] - row["min_ts"]
                if time_span <= self.max_window_seconds:
                    amounts = row["amounts"]
                    mean_amt = float(np.mean(amounts))
                    std_amt = float(np.std(amounts))
                    cv = (std_amt / mean_amt) if mean_amt > 0 else 1.0

                    if cv < 0.25:
                        risk_score = min(1.0, 0.72 + (row["distinct_sources"] * 0.05))
                        involved = [row["target_account"]] + list(set(row["sources"]))

                        alert = DetectedAlert(
                            alert_id=f"ALERT_SMURF_IN_{uuid.uuid4().hex[:8].upper()}",
                            typology=TypologyType.SMURFING,
                            risk_score=round(risk_score, 3),
                            involved_accounts=involved,
                            involved_transactions=row["tx_ids"],
                            total_volume=round(float(row["total_amt"]), 2),
                            time_span_seconds=int(time_span),
                            details={
                                "direction": "FAN_IN",
                                "target_account": row["target_account"],
                                "distinct_sources": row["distinct_sources"],
                                "mean_amount": round(mean_amt, 2),
                                "coefficient_of_variation": round(cv, 4),
                            },
                        )
                        alerts.append(alert)

        return alerts

