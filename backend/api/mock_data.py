import random
from datetime import datetime, timezone
from typing import List
from .schemas import AlertCluster, GraphNode, GraphEdge, ComparisonMetrics, PerformanceMetric

INITIAL_METRICS = ComparisonMetrics(
    baseline=PerformanceMetric(
        precision=0.32,
        recall=0.28,
        f1=0.30,
        false_positive_rate=0.41,
    ),
    graph_engine=PerformanceMetric(
        precision=0.91,
        recall=0.86,
        f1=0.88,
        false_positive_rate=0.04,
    ),
)

INITIAL_ALERTS: List[AlertCluster] = [
    AlertCluster(
        cluster_id="CLU-001",
        typology="CYCLIC_ROUND_TRIPPING",
        risk_score=94.5,
        total_volume=485000,
        dwell_time_mins=14.0,
        entry_node="ACC_1042",
        exit_node="ACC_1042",
        nodes=[
            GraphNode(id="ACC_1042", label="ACC_1042 (Origin/Exit)", role="entry", risk=95.0),
            GraphNode(id="ACC_2088", label="ACC_2088 (Mule 1)", role="mule", risk=88.0),
            GraphNode(id="ACC_3104", label="ACC_3104 (Mule 2)", role="mule", risk=86.5),
        ],
        edges=[
            GraphEdge(
                id="TX_901",
                source="ACC_1042",
                target="ACC_2088",
                amount=165000,
                timestamp="2026-11-14T09:10:00Z",
                hop_delay_mins=4.0,
            ),
            GraphEdge(
                id="TX_902",
                source="ACC_2088",
                target="ACC_3104",
                amount=160000,
                timestamp="2026-11-14T09:15:00Z",
                hop_delay_mins=5.0,
            ),
            GraphEdge(
                id="TX_903",
                source="ACC_3104",
                target="ACC_1042",
                amount=155000,
                timestamp="2026-11-14T09:24:00Z",
                hop_delay_mins=5.0,
            ),
        ],
        ai_summary="Account ACC_1042 dispersed ₹4.85L across shell accounts and recovered 94% within 14 minutes via cyclic transfers.",
    ),
    AlertCluster(
        cluster_id="CLU-002",
        typology="FAN_OUT_IN",
        risk_score=91.2,
        total_volume=920000,
        dwell_time_mins=18.0,
        entry_node="ACC_5001",
        exit_node="ACC_5999",
        nodes=[
            GraphNode(id="ACC_5001", label="ACC_5001 (Smurf Source)", role="entry", risk=92.0),
            GraphNode(id="ACC_5101", label="ACC_5101 (Pass-Through)", role="mule", risk=79.0),
            GraphNode(id="ACC_5102", label="ACC_5102 (Pass-Through)", role="mule", risk=81.0),
            GraphNode(id="ACC_5103", label="ACC_5103 (Pass-Through)", role="mule", risk=83.5),
            GraphNode(id="ACC_5999", label="ACC_5999 (Consolidator)", role="exit", risk=96.0),
        ],
        edges=[
            GraphEdge(
                id="TX_921",
                source="ACC_5001",
                target="ACC_5101",
                amount=310000,
                timestamp="2026-11-14T08:00:00Z",
                hop_delay_mins=3.0,
            ),
            GraphEdge(
                id="TX_922",
                source="ACC_5001",
                target="ACC_5102",
                amount=305000,
                timestamp="2026-11-14T08:02:00Z",
                hop_delay_mins=2.0,
            ),
            GraphEdge(
                id="TX_923",
                source="ACC_5001",
                target="ACC_5103",
                amount=305000,
                timestamp="2026-11-14T08:04:00Z",
                hop_delay_mins=2.0,
            ),
            GraphEdge(
                id="TX_924",
                source="ACC_5101",
                target="ACC_5999",
                amount=300000,
                timestamp="2026-11-14T08:12:00Z",
                hop_delay_mins=5.0,
            ),
            GraphEdge(
                id="TX_925",
                source="ACC_5102",
                target="ACC_5999",
                amount=298000,
                timestamp="2026-11-14T08:15:00Z",
                hop_delay_mins=4.0,
            ),
            GraphEdge(
                id="TX_926",
                source="ACC_5103",
                target="ACC_5999",
                amount=302000,
                timestamp="2026-11-14T08:18:00Z",
                hop_delay_mins=2.0,
            ),
        ],
        ai_summary="Structured fan-out of ₹9.20L from ACC_5001 split across 3 intermediary mules below reporting thresholds, rapidly reconverging to aggregator ACC_5999 within 18 minutes.",
    ),
    AlertCluster(
        cluster_id="CLU-003",
        typology="MULE_CHAIN",
        risk_score=87.8,
        total_volume=650000,
        dwell_time_mins=8.0,
        entry_node="ACC_7001",
        exit_node="ACC_7005",
        nodes=[
            GraphNode(id="ACC_7001", label="ACC_7001 (Compromised Org)", role="entry", risk=89.0),
            GraphNode(id="ACC_7002", label="ACC_7002 (Mule Hop 1)", role="mule", risk=82.0),
            GraphNode(id="ACC_7003", label="ACC_7003 (Mule Hop 2)", role="mule", risk=85.0),
            GraphNode(id="ACC_7004", label="ACC_7004 (Mule Hop 3)", role="mule", risk=84.0),
            GraphNode(id="ACC_7005", label="ACC_7005 (Cash-Out Endpoint)", role="exit", risk=93.0),
        ],
        edges=[
            GraphEdge(
                id="TX_951",
                source="ACC_7001",
                target="ACC_7002",
                amount=650000,
                timestamp="2026-11-14T10:00:00Z",
                hop_delay_mins=1.5,
            ),
            GraphEdge(
                id="TX_952",
                source="ACC_7002",
                target="ACC_7003",
                amount=635000,
                timestamp="2026-11-14T10:02:00Z",
                hop_delay_mins=2.0,
            ),
            GraphEdge(
                id="TX_953",
                source="ACC_7003",
                target="ACC_7004",
                amount=620000,
                timestamp="2026-11-14T10:04:30Z",
                hop_delay_mins=2.5,
            ),
            GraphEdge(
                id="TX_954",
                source="ACC_7004",
                target="ACC_7005",
                amount=610000,
                timestamp="2026-11-14T10:08:00Z",
                hop_delay_mins=2.0,
            ),
        ],
        ai_summary="High-velocity 4-hop relay draining ₹6.50L through transient student accounts with sub-2-minute hop latencies, ending at cash-out terminal ACC_7005.",
    ),
]


class AlertRepository:
    def __init__(self):
        self.metrics: ComparisonMetrics = INITIAL_METRICS
        # Keep an active list of clusters that can be modified when live attacks are injected
        self.alerts: List[AlertCluster] = [alert.model_copy(deep=True) for alert in INITIAL_ALERTS]
        self._inject_counter = 100

    def get_analysis(self):
        return {
            "metrics": self.metrics.model_dump(),
            "alerts": [alert.model_dump() for alert in self.alerts],
        }

    def get_cluster(self, cluster_id: str) -> AlertCluster | None:
        for alert in self.alerts:
            if alert.cluster_id.upper() == cluster_id.upper():
                return alert
        return None

    def inject_attack(self, typology: str) -> AlertCluster:
        self._inject_counter += 1
        cid = f"CLU-LIVE-{self._inject_counter}"
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        if typology == "CYCLIC_ROUND_TRIPPING":
            origin_id = f"ACC_{random.randint(8100, 8999)}"
            mule1 = f"ACC_{random.randint(3200, 3999)}"
            mule2 = f"ACC_{random.randint(4200, 4999)}"
            volume = random.choice([520000, 680000, 750000, 840000])
            cluster = AlertCluster(
                cluster_id=cid,
                typology="CYCLIC_ROUND_TRIPPING",
                risk_score=round(random.uniform(92.0, 98.5), 1),
                total_volume=volume,
                dwell_time_mins=round(random.uniform(9.0, 16.0), 1),
                entry_node=origin_id,
                exit_node=origin_id,
                nodes=[
                    GraphNode(id=origin_id, label=f"{origin_id} (Origin/Sink)", role="entry", risk=96.0),
                    GraphNode(id=mule1, label=f"{mule1} (Injected Mule 1)", role="mule", risk=89.0),
                    GraphNode(id=mule2, label=f"{mule2} (Injected Mule 2)", role="mule", risk=87.5),
                ],
                edges=[
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_1",
                        source=origin_id,
                        target=mule1,
                        amount=volume,
                        timestamp=now_iso,
                        hop_delay_mins=3.5,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_2",
                        source=mule1,
                        target=mule2,
                        amount=volume - 15000,
                        timestamp=now_iso,
                        hop_delay_mins=4.0,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_3",
                        source=mule2,
                        target=origin_id,
                        amount=volume - 30000,
                        timestamp=now_iso,
                        hop_delay_mins=4.5,
                    ),
                ],
                ai_summary=f"LIVE INJECTION: Account {origin_id} initiated a cyclic round-trip of ₹{volume/100000:.2f}L through 2 intermediary mule entities, cycling 95% of proceeds back within 12 minutes.",
            )

        elif typology == "FAN_OUT_IN":
            origin_id = f"ACC_{random.randint(6100, 6999)}"
            exit_id = f"ACC_{random.randint(9100, 9999)}"
            mule1 = f"ACC_{random.randint(1100, 1999)}"
            mule2 = f"ACC_{random.randint(2100, 2999)}"
            mule3 = f"ACC_{random.randint(5100, 5999)}"
            volume = random.choice([850000, 1050000, 1200000, 1400000])
            slice_amt = round(volume / 3, 2)
            cluster = AlertCluster(
                cluster_id=cid,
                typology="FAN_OUT_IN",
                risk_score=round(random.uniform(91.0, 97.0), 1),
                total_volume=volume,
                dwell_time_mins=round(random.uniform(12.0, 22.0), 1),
                entry_node=origin_id,
                exit_node=exit_id,
                nodes=[
                    GraphNode(id=origin_id, label=f"{origin_id} (Smurfing Origin)", role="entry", risk=94.0),
                    GraphNode(id=mule1, label=f"{mule1} (Fan-Out Mule A)", role="mule", risk=81.0),
                    GraphNode(id=mule2, label=f"{mule2} (Fan-Out Mule B)", role="mule", risk=82.0),
                    GraphNode(id=mule3, label=f"{mule3} (Fan-Out Mule C)", role="mule", risk=84.0),
                    GraphNode(id=exit_id, label=f"{exit_id} (Funnel Collector)", role="exit", risk=97.0),
                ],
                edges=[
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_1",
                        source=origin_id,
                        target=mule1,
                        amount=slice_amt,
                        timestamp=now_iso,
                        hop_delay_mins=2.0,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_2",
                        source=origin_id,
                        target=mule2,
                        amount=slice_amt,
                        timestamp=now_iso,
                        hop_delay_mins=2.5,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_3",
                        source=origin_id,
                        target=mule3,
                        amount=slice_amt,
                        timestamp=now_iso,
                        hop_delay_mins=3.0,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_4",
                        source=mule1,
                        target=exit_id,
                        amount=slice_amt - 4000,
                        timestamp=now_iso,
                        hop_delay_mins=4.0,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_5",
                        source=mule2,
                        target=exit_id,
                        amount=slice_amt - 3500,
                        timestamp=now_iso,
                        hop_delay_mins=4.5,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_6",
                        source=mule3,
                        target=exit_id,
                        amount=slice_amt - 5000,
                        timestamp=now_iso,
                        hop_delay_mins=5.0,
                    ),
                ],
                ai_summary=f"LIVE INJECTION: Smurfing pattern detected where {origin_id} dispersed ₹{volume/100000:.2f}L across 3 accounts simultaneously, converging to exit account {exit_id}.",
            )

        else:  # MULE_CHAIN
            origin_id = f"ACC_{random.randint(7100, 7500)}"
            h1 = f"ACC_{random.randint(7501, 7700)}"
            h2 = f"ACC_{random.randint(7701, 7900)}"
            exit_id = f"ACC_{random.randint(7901, 8099)}"
            volume = random.choice([490000, 580000, 720000])
            cluster = AlertCluster(
                cluster_id=cid,
                typology="MULE_CHAIN",
                risk_score=round(random.uniform(88.0, 95.0), 1),
                total_volume=volume,
                dwell_time_mins=round(random.uniform(5.0, 10.0), 1),
                entry_node=origin_id,
                exit_node=exit_id,
                nodes=[
                    GraphNode(id=origin_id, label=f"{origin_id} (Compromised Origin)", role="entry", risk=91.0),
                    GraphNode(id=h1, label=f"{h1} (Hop 1)", role="mule", risk=83.0),
                    GraphNode(id=h2, label=f"{h2} (Hop 2)", role="mule", risk=86.0),
                    GraphNode(id=exit_id, label=f"{exit_id} (Offshore Cash-out)", role="exit", risk=94.0),
                ],
                edges=[
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_1",
                        source=origin_id,
                        target=h1,
                        amount=volume,
                        timestamp=now_iso,
                        hop_delay_mins=1.5,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_2",
                        source=h1,
                        target=h2,
                        amount=volume - 12000,
                        timestamp=now_iso,
                        hop_delay_mins=2.0,
                    ),
                    GraphEdge(
                        id=f"TX_LIVE_{self._inject_counter}_3",
                        source=h2,
                        target=exit_id,
                        amount=volume - 25000,
                        timestamp=now_iso,
                        hop_delay_mins=1.8,
                    ),
                ],
                ai_summary=f"LIVE INJECTION: Rapid multi-hop transit chain siphoning ₹{volume/100000:.2f}L from {origin_id} across 3 hops in under 7 minutes to cash-out terminal {exit_id}.",
            )

        # Prepend to alerts list so the newly injected cluster appears at the very top!
        self.alerts.insert(0, cluster)
        return cluster


# Singleton repo instance
repo = AlertRepository()
