import uuid
from typing import List, Dict, Any, Set
import numpy as np
import polars as pl
from backend.graph.temporal_graph import TemporalGraph
from backend.data.models import TypologyType
from .models import DetectedAlert


class SmurfingDetector:
    """
    Detects Fan-Out (dispersion), Fan-In (aggregation), and Structured Smurfing typologies.
    Flags:
    1. Fan-Out Dispersion: 1 account transferring to >= min_fan_degree target accounts.
    2. Fan-In Aggregation: >= min_fan_degree source accounts transferring to 1 target account.
    3. Structured Smurfing: Transfers clustered just below CTR ($10k) with low variance.
    """

    def __init__(
        self,
        min_fan_degree: int = 3,
        max_window_seconds: int = 86400 * 30,  # 30-day temporal window
        ctr_threshold: float = 10000.0,
        smurf_min_amount: float = 2000.0,
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

        seen_sources: Set[str] = set()
        seen_targets: Set[str] = set()

        # -------------------------------------------------------------
        # 1. Detect Fan-Out (Dispersion: 1 Source -> Multiple Targets)
        # -------------------------------------------------------------
        source_groups = (
            df.group_by("source_account")
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
            src = row["source_account"]
            if src in seen_sources:
                continue

            time_span = row["max_ts"] - row["min_ts"]
            if time_span <= self.max_window_seconds:
                amounts = row["amounts"]
                mean_amt = float(np.mean(amounts))
                std_amt = float(np.std(amounts))
                cv = (std_amt / mean_amt) if mean_amt > 0 else 1.0

                # Determine if structured smurfing (low CV and near CTR) or general fan-out
                is_structuring = (cv < 0.35) and any(
                    self.smurf_min_amount <= a <= self.ctr_threshold * 1.5 for a in amounts
                )
                typology = TypologyType.SMURFING if is_structuring else TypologyType.FAN_OUT

                # Risk score based on degree, variance, and total volume
                base_score = 0.75 if is_structuring else 0.70
                risk_score = min(0.99, base_score + (min(row["distinct_targets"], 20) * 0.015))
                if row["total_amt"] > 100000:
                    risk_score = min(0.99, risk_score + 0.05)

                involved = [src] + list(set(row["targets"]))
                seen_sources.add(src)

                alert = DetectedAlert(
                    alert_id=f"ALERT_FAN_OUT_{uuid.uuid4().hex[:8].upper()}",
                    typology=typology,
                    risk_score=round(risk_score, 3),
                    involved_accounts=involved,
                    involved_transactions=row["tx_ids"],
                    total_volume=round(float(row["total_amt"]), 2),
                    time_span_seconds=int(time_span),
                    details={
                        "direction": "FAN_OUT",
                        "source_account": src,
                        "distinct_targets": row["distinct_targets"],
                        "mean_amount": round(mean_amt, 2),
                        "coefficient_of_variation": round(cv, 4),
                        "is_structuring": is_structuring,
                        "time_span_days": round(time_span / 86400.0, 1),
                    },
                )
                alerts.append(alert)

        # -------------------------------------------------------------
        # 2. Detect Fan-In (Aggregation: Multiple Sources -> 1 Target)
        # -------------------------------------------------------------
        target_groups = (
            df.group_by("target_account")
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
            tgt = row["target_account"]
            if tgt in seen_targets:
                continue

            time_span = row["max_ts"] - row["min_ts"]
            if time_span <= self.max_window_seconds:
                amounts = row["amounts"]
                mean_amt = float(np.mean(amounts))
                std_amt = float(np.std(amounts))
                cv = (std_amt / mean_amt) if mean_amt > 0 else 1.0

                is_structuring = (cv < 0.35) and any(
                    self.smurf_min_amount <= a <= self.ctr_threshold * 1.5 for a in amounts
                )
                typology = TypologyType.SMURFING if is_structuring else TypologyType.FAN_IN

                base_score = 0.75 if is_structuring else 0.70
                risk_score = min(0.99, base_score + (min(row["distinct_sources"], 20) * 0.015))
                if row["total_amt"] > 100000:
                    risk_score = min(0.99, risk_score + 0.05)

                involved = [tgt] + list(set(row["sources"]))
                seen_targets.add(tgt)

                alert = DetectedAlert(
                    alert_id=f"ALERT_FAN_IN_{uuid.uuid4().hex[:8].upper()}",
                    typology=typology,
                    risk_score=round(risk_score, 3),
                    involved_accounts=involved,
                    involved_transactions=row["tx_ids"],
                    total_volume=round(float(row["total_amt"]), 2),
                    time_span_seconds=int(time_span),
                    details={
                        "direction": "FAN_IN",
                        "target_account": tgt,
                        "distinct_sources": row["distinct_sources"],
                        "mean_amount": round(mean_amt, 2),
                        "coefficient_of_variation": round(cv, 4),
                        "is_structuring": is_structuring,
                        "time_span_days": round(time_span / 86400.0, 1),
                    },
                )
                alerts.append(alert)

        return alerts
