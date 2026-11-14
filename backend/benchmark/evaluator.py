from typing import Set, Dict, Any
from pydantic import BaseModel, Field
import polars as pl
from backend.graph.temporal_graph import TemporalGraph
from backend.graph.detectors.composite_scorer import CompositeScorer
from .baseline import RuleBasedBaseline


class MetricScores(BaseModel):
    system_name: str
    true_positives: int
    false_positives: int
    false_negatives: int
    true_negatives: int
    precision: float
    recall: float
    f1_score: float
    false_positive_rate: float


class ComparativeBenchmarkResult(BaseModel):
    total_transactions: int
    actual_laundering_transactions: int
    baseline_metrics: MetricScores
    graph_metrics: MetricScores
    precision_lift_percent: float
    recall_lift_percent: float
    f1_lift_percent: float
    false_positive_reduction_percent: float


class BenchmarkEvaluator:
    """
    Evaluates both Rule-Based Baseline and GraphSleuth Topology Engine
    against ground-truth labels and computes comparative Precision, Recall, and F1.
    """

    def __init__(
        self,
        baseline: RuleBasedBaseline = None,
        composite_scorer: CompositeScorer = None,
    ):
        self.baseline = baseline or RuleBasedBaseline()
        self.composite_scorer = composite_scorer or CompositeScorer()

    def run_benchmark(self, tg: TemporalGraph) -> ComparativeBenchmarkResult:
        df = tg.df
        all_tx_ids = set(df["transaction_id"].to_list())
        
        # Ground truth positives
        gt_df = df.filter(pl.col("is_laundering") == True)
        ground_truth_positives = set(gt_df["transaction_id"].to_list())
        ground_truth_negatives = all_tx_ids - ground_truth_positives

        # 1. Evaluate Rule-Based Baseline
        baseline_flagged = self.baseline.evaluate(tg)
        baseline_metrics = self._compute_metrics(
            "Threshold Baseline Rules",
            flagged=baseline_flagged,
            positives=ground_truth_positives,
            negatives=ground_truth_negatives,
        )

        # 2. Evaluate GraphSleuth Topology Engine
        cluster_result = self.composite_scorer.analyze(tg)
        graph_flagged: Set[str] = set()
        for alert in cluster_result.top_alerts:
            graph_flagged.update(alert.involved_transactions)

        graph_metrics = self._compute_metrics(
            "GraphSleuth Topology Engine",
            flagged=graph_flagged,
            positives=ground_truth_positives,
            negatives=ground_truth_negatives,
        )

        # 3. Calculate Lift and Reduction
        p_lift = ((graph_metrics.precision - baseline_metrics.precision) / max(baseline_metrics.precision, 0.0001)) * 100.0
        r_lift = ((graph_metrics.recall - baseline_metrics.recall) / max(baseline_metrics.recall, 0.0001)) * 100.0
        f1_lift = ((graph_metrics.f1_score - baseline_metrics.f1_score) / max(baseline_metrics.f1_score, 0.0001)) * 100.0
        
        fp_reduction = 0.0
        if baseline_metrics.false_positives > 0:
            fp_reduction = ((baseline_metrics.false_positives - graph_metrics.false_positives) / baseline_metrics.false_positives) * 100.0

        return ComparativeBenchmarkResult(
            total_transactions=len(all_tx_ids),
            actual_laundering_transactions=len(ground_truth_positives),
            baseline_metrics=baseline_metrics,
            graph_metrics=graph_metrics,
            precision_lift_percent=round(p_lift, 2),
            recall_lift_percent=round(r_lift, 2),
            f1_lift_percent=round(f1_lift, 2),
            false_positive_reduction_percent=round(fp_reduction, 2),
        )

    def _compute_metrics(
        self,
        name: str,
        flagged: Set[str],
        positives: Set[str],
        negatives: Set[str],
    ) -> MetricScores:
        tp = len(flagged & positives)
        fp = len(flagged - positives)
        fn = len(positives - flagged)
        tn = len(negatives - flagged)

        precision = (tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = (tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
        fpr = (fp / (fp + tn)) if (fp + tn) > 0 else 0.0

        return MetricScores(
            system_name=name,
            true_positives=tp,
            false_positives=fp,
            false_negatives=fn,
            true_negatives=tn,
            precision=round(precision, 4),
            recall=round(recall, 4),
            f1_score=round(f1, 4),
            false_positive_rate=round(fpr, 4),
        )

