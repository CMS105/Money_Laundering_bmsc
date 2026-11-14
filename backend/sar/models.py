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


class SARReport(BaseModel):
    sar_id: str = Field(..., description="Unique SAR Filing ID")
    alert_id: str
    filing_date: str
    filing_institution: str = "GraphSleuth National Bank AML Monitoring Unit"
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

