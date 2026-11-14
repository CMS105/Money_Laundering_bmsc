from typing import List, Dict, Any, Set
from backend.graph.temporal_graph import TemporalGraph
from .models import DetectedAlert, ClusterAnalysisResult
from .smurfing import SmurfingDetector
from .cycles import CycleDetector
from .mules import MuleChainDetector


class CompositeScorer:
    """
    Orchestrates all graph typology detectors, performs multi-criteria risk scoring,
    and ranks suspicious clusters by descending severity.
    """

    def __init__(
        self,
        smurfing_detector: SmurfingDetector = None,
        cycle_detector: CycleDetector = None,
        mule_detector: MuleChainDetector = None,
    ):
        self.smurfing_detector = smurfing_detector or SmurfingDetector()
        self.cycle_detector = cycle_detector or CycleDetector()
        self.mule_detector = mule_detector or MuleChainDetector()

    def analyze(self, tg: TemporalGraph) -> ClusterAnalysisResult:
        all_alerts: List[DetectedAlert] = []

        # 1. Run all three specialized detectors
        smurf_alerts = self.smurfing_detector.detect(tg)
        cycle_alerts = self.cycle_detector.detect(tg)
        mule_alerts = self.mule_detector.detect(tg)

        all_alerts.extend(smurf_alerts)
        all_alerts.extend(cycle_alerts)
        all_alerts.extend(mule_alerts)

        # 2. Sort by descending risk score
        all_alerts.sort(key=lambda a: (a.risk_score, a.total_volume), reverse=True)

        # 3. Compute typology breakdown
        typology_counts: Dict[str, int] = {}
        high_risk_accounts_set: Set[str] = set()

        for alert in all_alerts:
            typ_str = alert.typology.value
            typology_counts[typ_str] = typology_counts.get(typ_str, 0) + 1
            if alert.risk_score >= 0.70:
                high_risk_accounts_set.update(alert.involved_accounts)

        return ClusterAnalysisResult(
            total_alerts=len(all_alerts),
            alerts_by_typology=typology_counts,
            top_alerts=all_alerts,
            high_risk_accounts=sorted(list(high_risk_accounts_set)),
        )

