import pytest
import polars as pl
from fastapi.testclient import TestClient

from backend.graph.temporal_graph import TemporalGraph
from backend.graph.detectors.smurfing import SmurfingDetector
from backend.graph.detectors.cycles import CycleDetector
from backend.graph.detectors.mules import MuleChainDetector
from backend.graph.detectors.composite_scorer import CompositeScorer
from backend.benchmark.baseline import RuleBasedBaseline
from backend.benchmark.evaluator import BenchmarkEvaluator
from backend.api.main import app


@pytest.fixture
def sample_temporal_graph():
    """Builds a small, deterministic synthetic dataset with ground-truth typologies."""
    # 1. Normal background
    data = [
        {"transaction_id": "TX_NORM_1", "timestamp": 1000, "source_account": "ACC_A", "target_account": "ACC_B", "amount": 250.0, "is_laundering": False},
        {"transaction_id": "TX_NORM_2", "timestamp": 1500, "source_account": "ACC_C", "target_account": "ACC_D", "amount": 400.0, "is_laundering": False},
    ]

    # 2. Fan-Out (Dispersion: ACC_SRC -> ACC_T1, ACC_T2, ACC_T3)
    data.extend([
        {"transaction_id": "TX_FO_1", "timestamp": 2000, "source_account": "ACC_SRC", "target_account": "ACC_T1", "amount": 8500.0, "is_laundering": True},
        {"transaction_id": "TX_FO_2", "timestamp": 2060, "source_account": "ACC_SRC", "target_account": "ACC_T2", "amount": 8600.0, "is_laundering": True},
        {"transaction_id": "TX_FO_3", "timestamp": 2120, "source_account": "ACC_SRC", "target_account": "ACC_T3", "amount": 8550.0, "is_laundering": True},
    ])

    # 3. Directed Cycle (Loop: ACC_CYC1 -> ACC_CYC2 -> ACC_CYC3 -> ACC_CYC1)
    data.extend([
        {"transaction_id": "TX_CYC_1", "timestamp": 3000, "source_account": "ACC_CYC1", "target_account": "ACC_CYC2", "amount": 50000.0, "is_laundering": True},
        {"transaction_id": "TX_CYC_2", "timestamp": 3300, "source_account": "ACC_CYC2", "target_account": "ACC_CYC3", "amount": 49000.0, "is_laundering": True},
        {"transaction_id": "TX_CYC_3", "timestamp": 3600, "source_account": "ACC_CYC3", "target_account": "ACC_CYC1", "amount": 48500.0, "is_laundering": True},
    ])

    # 4. Rapid Pass-Through Mule Chain (ACC_ORIG -> ACC_MULE -> ACC_TERM)
    data.extend([
        {"transaction_id": "TX_MUL_1", "timestamp": 5000, "source_account": "ACC_ORIG", "target_account": "ACC_MULE", "amount": 20000.0, "is_laundering": True},
        {"transaction_id": "TX_MUL_2", "timestamp": 5300, "source_account": "ACC_MULE", "target_account": "ACC_TERM", "amount": 19600.0, "is_laundering": True},
    ])

    df = pl.DataFrame(data)
    return TemporalGraph(df)


def test_temporal_graph_construction(sample_temporal_graph):
    tg = sample_temporal_graph
    assert tg.graph.number_of_nodes() > 0
    assert tg.graph.number_of_edges() == 10
    stats = tg.get_node_stats("ACC_MULE")
    assert stats["in_degree"] == 1
    assert stats["out_degree"] == 1
    assert stats["retention_ratio"] >= 0.95


def test_fan_out_detector(sample_temporal_graph):
    detector = SmurfingDetector(min_fan_degree=3)
    alerts = detector.detect(sample_temporal_graph)
    assert len(alerts) >= 1
    fo_alert = next((a for a in alerts if a.details.get("direction") == "FAN_OUT"), None)
    assert fo_alert is not None
    assert fo_alert.details["source_account"] == "ACC_SRC"
    assert fo_alert.details["distinct_targets"] == 3
    assert fo_alert.risk_score >= 0.70


def test_cycle_detector(sample_temporal_graph):
    detector = CycleDetector(min_cycle_len=2, max_cycle_len=4)
    alerts = detector.detect(sample_temporal_graph)
    assert len(alerts) >= 1
    cycle_alert = alerts[0]
    assert len(cycle_alert.involved_accounts) == 3
    assert "ACC_CYC1" in cycle_alert.involved_accounts
    assert cycle_alert.details["retention_ratio"] >= 0.90
    assert cycle_alert.risk_score >= 0.80


def test_mule_chain_detector(sample_temporal_graph):
    detector = MuleChainDetector(max_transit_latency_seconds=3600, min_retention_ratio=0.85)
    alerts = detector.detect(sample_temporal_graph)
    assert len(alerts) >= 1
    mule_alert = next((a for a in alerts if a.details.get("mule_account") == "ACC_MULE"), None)
    assert mule_alert is not None
    assert mule_alert.details["source"] == "ACC_ORIG"
    assert mule_alert.details["destination"] == "ACC_TERM"
    assert mule_alert.details["dwell_time_mins"] == 5.0


def test_composite_scorer_ranking(sample_temporal_graph):
    scorer = CompositeScorer()
    res = scorer.analyze(sample_temporal_graph)
    assert res.total_alerts >= 3
    # Verify ranking by risk_score descending
    scores = [a.risk_score for a in res.top_alerts]
    assert scores == sorted(scores, reverse=True)


def test_benchmark_evaluator_metrics(sample_temporal_graph):
    scorer = CompositeScorer()
    evaluator = BenchmarkEvaluator(composite_scorer=scorer)
    bm = evaluator.run_benchmark(sample_temporal_graph)
    assert bm.total_transactions == 10
    assert bm.actual_laundering_transactions == 8
    assert 0.0 <= bm.baseline_metrics.precision <= 1.0
    assert 0.0 <= bm.baseline_metrics.recall <= 1.0
    assert 0.0 <= bm.graph_metrics.precision <= 1.0
    assert 0.0 <= bm.graph_metrics.recall <= 1.0


def test_api_endpoints():
    from backend.api.main import health_check, get_analysis, get_sar_for_cluster

    # 1. Health check
    h = health_check()
    assert h["status"] in ("ok", "healthy")
    assert h["alerts_count"] >= 3

    # 2. Analysis endpoint
    analysis = get_analysis()
    assert len(analysis.alerts) >= 3
    assert analysis.dataset_source is not None
    assert analysis.metrics.baseline.precision > 0.0
    assert analysis.metrics.graph_engine.precision >= analysis.metrics.baseline.precision

    # 3. SAR generation endpoint
    first_cluster_id = analysis.alerts[0].cluster_id
    sar = get_sar_for_cluster(first_cluster_id)
    assert sar["alert_id"] == first_cluster_id
    assert "chronological_trail" in sar
    assert len(sar["chronological_trail"]) > 0
    assert "narrative_summary" in sar

