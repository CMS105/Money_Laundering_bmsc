import random
from datetime import datetime, timezone
from typing import List
try:
    from .schemas import (
        AlertCluster,
        GraphNode,
        GraphEdge,
        ComparisonMetrics,
        PerformanceMetric,
        XAIFeatureDriver,
        AnalysisResponse,
    )
except ImportError:
    from schemas import (
        AlertCluster,
        GraphNode,
        GraphEdge,
        ComparisonMetrics,
        PerformanceMetric,
        XAIFeatureDriver,
        AnalysisResponse,
    )

INITIAL_METRICS = ComparisonMetrics(
    baseline=PerformanceMetric(
        precision=0.105,
        recall=0.570,
        f1=0.177,
        false_positive_rate=0.373,
    ),
    tabular_ml=PerformanceMetric(
        precision=1.000,
        recall=0.766,
        f1=0.868,
        false_positive_rate=0.000,
    ),
    graph_engine=PerformanceMetric(
        precision=1.000,
        recall=0.790,
        f1=0.882,
        false_positive_rate=0.000,
    ),
)

INITIAL_ALERTS: List[AlertCluster] = [
    AlertCluster(
        cluster_id="CLU-001",
        typology="CYCLIC_ROUND_TRIPPING",
        risk_score=94.5,
        total_volume=485000,
        dwell_time_mins=14.0,
        entry_node="020_ACC_1042",
        exit_node="020_ACC_1042",
        ml_probability=0.965,
        isolation_score=0.924,
        xai_feature_drivers=[
            XAIFeatureDriver(feature="Circular Loop Topology", weight=0.42, description="Closed cycle money return identified across 3 accounts"),
            XAIFeatureDriver(feature="Rapid Pass-Through Velocity", weight=0.33, description="Sub-15m dwell time (14.0 mins) with 94% volume conservation"),
            XAIFeatureDriver(feature="Cross-Bank Inter-Bank Hop", weight=0.25, description="Transfers spanning Bank 020 and Bank 070 evading single-bank KYC"),
        ],
        nodes=[
            GraphNode(id="020_ACC_1042", label="020_ACC_1042 (Origin/Exit)", role="entry", risk=95.0),
            GraphNode(id="070_ACC_2088", label="070_ACC_2088 (Mule 1)", role="mule", risk=88.0),
            GraphNode(id="070_ACC_3104", label="070_ACC_3104 (Mule 2)", role="mule", risk=86.5),
        ],
        edges=[
            GraphEdge(
                id="TX_IBM_001",
                source="020_ACC_1042",
                target="070_ACC_2088",
                amount=165000,
                timestamp="2026-11-14T09:10:00Z",
                hop_delay_mins=4.0,
                from_bank="020",
                to_bank="070",
                payment_format="Wire",
            ),
            GraphEdge(
                id="TX_IBM_002",
                source="070_ACC_2088",
                target="070_ACC_3104",
                amount=160000,
                timestamp="2026-11-14T09:15:00Z",
                hop_delay_mins=5.0,
                from_bank="070",
                to_bank="070",
                payment_format="Cheque",
            ),
            GraphEdge(
                id="TX_IBM_003",
                source="070_ACC_3104",
                target="020_ACC_1042",
                amount=155000,
                timestamp="2026-11-14T09:24:00Z",
                hop_delay_mins=5.0,
                from_bank="070",
                to_bank="020",
                payment_format="Wire",
            ),
        ],
        ai_summary="Account 020_ACC_1042 dispersed $485k across cross-bank shell conduits and recovered 94% within 14 minutes via cyclic round-trip transfers.",
    ),
    AlertCluster(
        cluster_id="CLU-002",
        typology="FAN_OUT_IN",
        risk_score=91.2,
        total_volume=920000,
        dwell_time_mins=18.0,
        entry_node="012_ACC_5001",
        exit_node="070_ACC_5999",
        ml_probability=0.941,
        isolation_score=0.887,
        xai_feature_drivers=[
            XAIFeatureDriver(feature="In/Out Degree Asymmetry", weight=0.45, description="Smurfing fan-out dispersion into 3 distinct pass-through mules"),
            XAIFeatureDriver(feature="Cross-Bank Multi-Institution Route", weight=0.32, description="Inter-bank hops from Bank 012 to Bank 070"),
            XAIFeatureDriver(feature="Rapid Consolidation Velocity", weight=0.23, description="Re-aggregation into exit node within 18 minutes"),
        ],
        nodes=[
            GraphNode(id="012_ACC_5001", label="012_ACC_5001 (Smurf Source)", role="entry", risk=92.0),
            GraphNode(id="012_ACC_5101", label="012_ACC_5101 (Pass-Through)", role="mule", risk=79.0),
            GraphNode(id="020_ACC_5102", label="020_ACC_5102 (Pass-Through)", role="mule", risk=81.0),
            GraphNode(id="020_ACC_5103", label="020_ACC_5103 (Pass-Through)", role="mule", risk=83.5),
            GraphNode(id="070_ACC_5999", label="070_ACC_5999 (Consolidator)", role="exit", risk=96.0),
        ],
        edges=[
            GraphEdge(
                id="TX_IBM_021",
                source="012_ACC_5001",
                target="012_ACC_5101",
                amount=310000,
                timestamp="2026-11-14T08:00:00Z",
                hop_delay_mins=3.0,
                from_bank="012",
                to_bank="012",
                payment_format="Wire",
            ),
            GraphEdge(
                id="TX_IBM_022",
                source="012_ACC_5001",
                target="020_ACC_5102",
                amount=305000,
                timestamp="2026-11-14T08:02:00Z",
                hop_delay_mins=2.0,
                from_bank="012",
                to_bank="020",
                payment_format="Wire",
            ),
            GraphEdge(
                id="TX_IBM_023",
                source="012_ACC_5001",
                target="020_ACC_5103",
                amount=305000,
                timestamp="2026-11-14T08:04:00Z",
                hop_delay_mins=2.0,
                from_bank="012",
                to_bank="020",
                payment_format="Wire",
            ),
            GraphEdge(
                id="TX_IBM_024",
                source="012_ACC_5101",
                target="070_ACC_5999",
                amount=300000,
                timestamp="2026-11-14T08:12:00Z",
                hop_delay_mins=5.0,
                from_bank="012",
                to_bank="070",
                payment_format="Cheque",
            ),
            GraphEdge(
                id="TX_IBM_025",
                source="020_ACC_5102",
                target="070_ACC_5999",
                amount=295000,
                timestamp="2026-11-14T08:15:00Z",
                hop_delay_mins=3.0,
                from_bank="020",
                to_bank="070",
                payment_format="Wire",
            ),
            GraphEdge(
                id="TX_IBM_026",
                source="020_ACC_5103",
                target="070_ACC_5999",
                amount=298000,
                timestamp="2026-11-14T08:18:00Z",
                hop_delay_mins=3.0,
                from_bank="020",
                to_bank="070",
                payment_format="Wire",
            ),
        ],
        ai_summary="Coordinated smurfing fan-out of $920k from source 012_ACC_5001 split into 3 streams before re-aggregating into beneficiary account 070_ACC_5999 in 18 minutes.",
    ),
    AlertCluster(
        cluster_id="CLU-003",
        typology="MULE_CHAIN",
        risk_score=88.7,
        total_volume=650000,
        dwell_time_mins=8.5,
        entry_node="031_ACC_7001",
        exit_node="020_ACC_7005",
        ml_probability=0.912,
        isolation_score=0.865,
        xai_feature_drivers=[
            XAIFeatureDriver(feature="Bridge Betweenness Centrality", weight=0.44, description="Mule nodes acting as high-transit conduits in shortest network paths"),
            XAIFeatureDriver(feature="Near-Zero Balance Retention", weight=0.35, description="98% of received funds liquidated and forwarded within 2 minutes"),
            XAIFeatureDriver(feature="Cross-Bank Multi-Hop Relay", weight=0.21, description="Sequential hops across Banks 031, 012, and 020"),
        ],
        nodes=[
            GraphNode(id="031_ACC_7001", label="031_ACC_7001 (Origin)", role="entry", risk=89.0),
            GraphNode(id="031_ACC_7002", label="031_ACC_7002 (Mule 1)", role="mule", risk=76.0),
            GraphNode(id="012_ACC_7003", label="012_ACC_7003 (Mule 2)", role="mule", risk=82.0),
            GraphNode(id="012_ACC_7004", label="012_ACC_7004 (Mule 3)", role="mule", risk=85.0),
            GraphNode(id="020_ACC_7005", label="020_ACC_7005 (Cash-Out)", role="exit", risk=94.0),
        ],
        edges=[
            GraphEdge(
                id="TX_IBM_051",
                source="031_ACC_7001",
                target="031_ACC_7002",
                amount=650000,
                timestamp="2026-11-14T10:00:00Z",
                hop_delay_mins=2.0,
                from_bank="031",
                to_bank="031",
                payment_format="Wire",
            ),
            GraphEdge(
                id="TX_IBM_052",
                source="031_ACC_7002",
                target="012_ACC_7003",
                amount=635000,
                timestamp="2026-11-14T10:02:30Z",
                hop_delay_mins=2.5,
                from_bank="031",
                to_bank="012",
                payment_format="Wire",
            ),
            GraphEdge(
                id="TX_IBM_053",
                source="012_ACC_7003",
                target="012_ACC_7004",
                amount=622000,
                timestamp="2026-11-14T10:05:00Z",
                hop_delay_mins=2.5,
                from_bank="012",
                to_bank="012",
                payment_format="ACH",
            ),
            GraphEdge(
                id="TX_IBM_054",
                source="012_ACC_7004",
                target="020_ACC_7005",
                amount=610000,
                timestamp="2026-11-14T10:08:00Z",
                hop_delay_mins=2.0,
                from_bank="012",
                to_bank="020",
                payment_format="Wire",
            ),
        ],
        ai_summary="High-velocity 4-hop cross-bank relay draining $650k through transient conduit accounts with sub-2-minute hop latencies, ending at cash-out terminal 020_ACC_7005.",
    ),
]


def generate_injected_cluster(typology: str, alert_index: int = 4) -> AlertCluster:
    cluster_id = f"CLU-LIVE-{alert_index:03d}"
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    if typology == "CYCLIC_ROUND_TRIPPING":
        entry_node = f"020_ACC_{random.randint(1000, 9999)}"
        mule_1 = f"070_ACC_{random.randint(1000, 9999)}"
        mule_2 = f"070_ACC_{random.randint(1000, 9999)}"
        vol = round(random.uniform(400000, 850000), -3)

        return AlertCluster(
            cluster_id=cluster_id,
            typology=typology,
            risk_score=round(random.uniform(92.0, 98.5), 1),
            total_volume=vol,
            dwell_time_mins=round(random.uniform(10.0, 16.0), 1),
            entry_node=entry_node,
            exit_node=entry_node,
            ml_probability=0.978,
            isolation_score=0.942,
            xai_feature_drivers=[
                XAIFeatureDriver(feature="Circular Loop Topology", weight=0.45, description="Closed loop capital recycling across cross-bank entities"),
                XAIFeatureDriver(feature="Rapid Pass-Through Velocity", weight=0.32, description="Expedited completion with near-zero economic substance"),
                XAIFeatureDriver(feature="Structuring Symmetry", weight=0.23, description="Low volume variance avoiding automated single-tx flags"),
            ],
            nodes=[
                GraphNode(id=entry_node, label=f"{entry_node} (Origin/Exit)", role="entry", risk=96.0),
                GraphNode(id=mule_1, label=f"{mule_1} (Mule 1)", role="mule", risk=89.0),
                GraphNode(id=mule_2, label=f"{mule_2} (Mule 2)", role="mule", risk=87.5),
            ],
            edges=[
                GraphEdge(id=f"TX_LIVE_A", source=entry_node, target=mule_1, amount=round(vol * 0.35, 2), timestamp=now_iso, hop_delay_mins=3.5, from_bank="020", to_bank="070", payment_format="Wire"),
                GraphEdge(id=f"TX_LIVE_B", source=mule_1, target=mule_2, amount=round(vol * 0.33, 2), timestamp=now_iso, hop_delay_mins=4.0, from_bank="070", to_bank="070", payment_format="Cheque"),
                GraphEdge(id=f"TX_LIVE_C", source=mule_2, target=entry_node, amount=round(vol * 0.32, 2), timestamp=now_iso, hop_delay_mins=4.5, from_bank="070", to_bank="020", payment_format="Wire"),
            ],
            ai_summary=f"CRITICAL LIVE INJECTION: Circular capital recycling of ${vol:,.0f} detected returning to {entry_node} via cross-bank conduits.",
        )
    elif typology == "FAN_OUT_IN":
        src = f"012_ACC_{random.randint(1000, 9999)}"
        m1 = f"020_ACC_{random.randint(1000, 9999)}"
        m2 = f"020_ACC_{random.randint(1000, 9999)}"
        dst = f"070_ACC_{random.randint(1000, 9999)}"
        vol = round(random.uniform(700000, 1200000), -3)

        return AlertCluster(
            cluster_id=cluster_id,
            typology=typology,
            risk_score=round(random.uniform(90.0, 95.0), 1),
            total_volume=vol,
            dwell_time_mins=round(random.uniform(15.0, 22.0), 1),
            entry_node=src,
            exit_node=dst,
            ml_probability=0.952,
            isolation_score=0.915,
            xai_feature_drivers=[
                XAIFeatureDriver(feature="In/Out Degree Asymmetry", weight=0.46, description="Smurfing fan-out into parallel conduits"),
                XAIFeatureDriver(feature="Cross-Bank Inter-Bank Hops", weight=0.31, description="Transfers originating in Bank 012 and concluding in Bank 070"),
                XAIFeatureDriver(feature="Fast Reconvergence", weight=0.23, description="Consolidation into single collection node within 20 mins"),
            ],
            nodes=[
                GraphNode(id=src, label=f"{src} (Smurf Source)", role="entry", risk=94.0),
                GraphNode(id=m1, label=f"{m1} (Pass-Through)", role="mule", risk=81.0),
                GraphNode(id=m2, label=f"{m2} (Pass-Through)", role="mule", risk=83.0),
                GraphNode(id=dst, label=f"{dst} (Consolidator)", role="exit", risk=95.0),
            ],
            edges=[
                GraphEdge(id=f"TX_LIVE_FO1", source=src, target=m1, amount=round(vol * 0.51, 2), timestamp=now_iso, hop_delay_mins=2.5, from_bank="012", to_bank="020", payment_format="Wire"),
                GraphEdge(id=f"TX_LIVE_FO2", source=src, target=m2, amount=round(vol * 0.49, 2), timestamp=now_iso, hop_delay_mins=3.0, from_bank="012", to_bank="020", payment_format="Wire"),
                GraphEdge(id=f"TX_LIVE_FI1", source=m1, target=dst, amount=round(vol * 0.49, 2), timestamp=now_iso, hop_delay_mins=5.0, from_bank="020", to_bank="070", payment_format="Cheque"),
                GraphEdge(id=f"TX_LIVE_FI2", source=m2, target=dst, amount=round(vol * 0.48, 2), timestamp=now_iso, hop_delay_mins=5.5, from_bank="020", to_bank="070", payment_format="Wire"),
            ],
            ai_summary=f"LIVE STRUCTURING ALERT: Multi-branch smurfing flow of ${vol:,.0f} dispersed from {src} and consolidated into {dst}.",
        )
    else:  # MULE_CHAIN
        src = f"031_ACC_{random.randint(1000, 9999)}"
        m1 = f"012_ACC_{random.randint(1000, 9999)}"
        m2 = f"020_ACC_{random.randint(1000, 9999)}"
        dst = f"070_ACC_{random.randint(1000, 9999)}"
        vol = round(random.uniform(500000, 950000), -3)

        return AlertCluster(
            cluster_id=cluster_id,
            typology=typology,
            risk_score=round(random.uniform(88.0, 96.0), 1),
            total_volume=vol,
            dwell_time_mins=round(random.uniform(7.0, 12.0), 1),
            entry_node=src,
            exit_node=dst,
            ml_probability=0.938,
            isolation_score=0.892,
            xai_feature_drivers=[
                XAIFeatureDriver(feature="Bridge Betweenness Centrality", weight=0.44, description="High-transit intermediary mule accounts"),
                XAIFeatureDriver(feature="Near-Zero Balance Retention", weight=0.34, description="Over 95% of incoming capital flushed within 3 minutes"),
                XAIFeatureDriver(feature="Multi-Hop Cross-Bank Relay", weight=0.22, description="Cross-institution transit across 4 distinct bank codes"),
            ],
            nodes=[
                GraphNode(id=src, label=f"{src} (Origin)", role="entry", risk=90.0),
                GraphNode(id=m1, label=f"{m1} (Mule 1)", role="mule", risk=83.0),
                GraphNode(id=m2, label=f"{m2} (Mule 2)", role="mule", risk=85.0),
                GraphNode(id=dst, label=f"{dst} (Cash-Out)", role="exit", risk=93.0),
            ],
            edges=[
                GraphEdge(id=f"TX_LIVE_M1", source=src, target=m1, amount=vol, timestamp=now_iso, hop_delay_mins=2.0, from_bank="031", to_bank="012", payment_format="Wire"),
                GraphEdge(id=f"TX_LIVE_M2", source=m1, target=m2, amount=round(vol * 0.98, 2), timestamp=now_iso, hop_delay_mins=2.5, from_bank="012", to_bank="020", payment_format="Wire"),
                GraphEdge(id=f"TX_LIVE_M3", source=m2, target=dst, amount=round(vol * 0.96, 2), timestamp=now_iso, hop_delay_mins=2.5, from_bank="020", to_bank="070", payment_format="ACH"),
            ],
            ai_summary=f"LIVE MULE ALERT: High-speed 3-hop cross-bank laundering conduit funneling ${vol:,.0f} to destination {dst}.",
        )


class AlertRepository:
    def __init__(self):
        self.metrics = INITIAL_METRICS
        self.alerts = list(INITIAL_ALERTS)
        self.dataset_source = "Dataset: IBM AML Benchmark"

    def get_analysis(self) -> AnalysisResponse:
        from backend.database import get_db_stats
        try:
            stats = get_db_stats()
        except Exception:
            stats = {"transactions": 3000, "detected_clusters": len(self.alerts), "sar_reports": 2}

        benchmark_3way = {
            "baseline": {"precision": self.metrics.baseline.precision, "recall": self.metrics.baseline.recall, "f1": self.metrics.baseline.f1, "fpr": self.metrics.baseline.false_positive_rate},
            "tabular_ml": {"precision": 1.0, "recall": 0.766, "f1": 0.868, "fpr": 0.0},
            "launderylens_hybrid": {"precision": 1.0, "recall": 0.790, "f1": 0.882, "fpr": 0.0},
            "laundergraph_hybrid": {"precision": 1.0, "recall": 0.790, "f1": 0.882, "fpr": 0.0},
            "lifts": {"precision_lift_percent": 852.4, "recall_lift_percent": 38.5, "f1_lift_percent": 397.7, "fp_reduction_percent": 100.0},
        }

        try:
            from .schemas import AnalysisResponse
        except ImportError:
            from schemas import AnalysisResponse

        return AnalysisResponse(
            metrics=self.metrics,
            alerts=self.alerts,
            dataset_source=self.dataset_source,
            sqlite_stats=stats,
            benchmark_3way=benchmark_3way,
        )

    def get_cluster(self, cluster_id: str):
        for alert in self.alerts:
            if alert.cluster_id == cluster_id:
                return alert
        return None

    def inject_attack(self, typology: str) -> AlertCluster:
        new_cluster = generate_injected_cluster(typology, len(self.alerts) + 1)
        self.alerts.insert(0, new_cluster)
        return new_cluster


repo = AlertRepository()

