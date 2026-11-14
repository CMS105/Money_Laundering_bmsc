from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class TemporalTrailStep(BaseModel):
    step_number: int
    timestamp: int
    formatted_time: str
    source_account: str
    target_account: str
    amount: float
    description: str
    from_bank: Optional[str] = "000"
    to_bank: Optional[str] = "000"
    payment_format: Optional[str] = "Wire"


class XAIFeatureDriver(BaseModel):
    feature: str
    weight: float
    description: str


class SARReport(BaseModel):
    sar_id: str = Field(..., description="Unique SAR Filing ID")
    alert_id: str
    filing_date: str
    filing_institution: str = "LaunderyLens Financial Intelligence Unit"
    primary_typology: str
    risk_score: float
    threat_level: str  # CRITICAL, HIGH, MEDIUM
    suspect_accounts: List[str]
    total_volume_usd: float
    transaction_count: int
    time_span_hours: float
    narrative_summary: str
    chronological_trail: List[TemporalTrailStep]
    red_flag_indicators: List[str]
    recommended_action: str
    fincen_xml_snippet: Optional[str] = None
    xai_feature_drivers: Optional[List[XAIFeatureDriver]] = None
    ml_probability: Optional[float] = None
    isolation_score: Optional[float] = None
