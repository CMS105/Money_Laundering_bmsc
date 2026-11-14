from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.data.models import TypologyType


class DetectedAlert(BaseModel):
    alert_id: str = Field(..., description="Unique alert identifier")
    typology: TypologyType = Field(..., description="Detected laundering pattern")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk score [0-1]")
    involved_accounts: List[str] = Field(..., description="Accounts participating in this suspicious topology")
    involved_transactions: List[str] = Field(..., description="Transaction IDs participating in the flow")
    total_volume: float = Field(..., description="Total money flow involved in the pattern")
    time_span_seconds: int = Field(..., description="Duration from first to last transaction in seconds")
    details: Dict[str, Any] = Field(default_factory=dict, description="Topological and algorithmic metadata")


class ClusterAnalysisResult(BaseModel):
    total_alerts: int
    alerts_by_typology: Dict[str, int]
    top_alerts: List[DetectedAlert]
    high_risk_accounts: List[str]

