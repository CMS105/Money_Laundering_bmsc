from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class PerformanceMetric(BaseModel):
    precision: float = Field(..., description="Precision score (0.0 to 1.0)")
    recall: float = Field(..., description="Recall score (0.0 to 1.0)")
    f1: float = Field(..., description="F1-score (0.0 to 1.0)")
    false_positive_rate: float = Field(..., description="False positive rate (0.0 to 1.0)")


class ComparisonMetrics(BaseModel):
    baseline: PerformanceMetric
    graph_engine: PerformanceMetric
    tabular_ml: Optional[PerformanceMetric] = None


class XAIFeatureDriver(BaseModel):
    feature: str
    weight: float
    description: str


class GraphNode(BaseModel):
    id: str = Field(..., description="Unique account identifier, e.g. ACC_1042")
    label: str = Field(..., description="Human-readable node label, e.g. ACC_1042 (Origin/Exit)")
    role: str = Field(..., description="Node role in cluster: entry, mule, exit, intermediary, etc.")
    risk: float = Field(..., description="Calculated risk score (0-100)")


class GraphEdge(BaseModel):
    id: str = Field(..., description="Transaction identifier, e.g. TX_901")
    source: str = Field(..., description="Source account ID")
    target: str = Field(..., description="Target account ID")
    amount: float = Field(..., description="Transaction amount in INR/USD")
    timestamp: str = Field(..., description="ISO 8601 timestamp of transaction")
    hop_delay_mins: float = Field(..., description="Transit hop latency in minutes")
    from_bank: Optional[str] = "000"
    to_bank: Optional[str] = "000"
    payment_format: Optional[str] = "Wire"


class AlertCluster(BaseModel):
    cluster_id: str = Field(..., description="Unique cluster identifier, e.g. CLU-001")
    typology: str = Field(
        ...,
        description="Laundering pattern typology: CYCLIC_ROUND_TRIPPING, FAN_OUT_IN, MULE_CHAIN",
    )
    risk_score: float = Field(..., description="Overall cluster risk score (0 to 100)")
    total_volume: float = Field(..., description="Total volume laundered across cluster in INR/USD")
    dwell_time_mins: float = Field(..., description="Total dwell time across laundering hops in minutes")
    entry_node: str = Field(..., description="Entry origin account ID")
    exit_node: str = Field(..., description="Exit destination account ID")
    nodes: List[GraphNode] = Field(..., description="List of nodes participating in cluster")
    edges: List[GraphEdge] = Field(..., description="List of directed transaction edges")
    ai_summary: str = Field(..., description="Explainable AI narrative summary of money trail")
    ml_probability: Optional[float] = 0.94
    isolation_score: Optional[float] = 0.88
    xai_feature_drivers: Optional[List[XAIFeatureDriver]] = None


class AnalysisResponse(BaseModel):
    metrics: ComparisonMetrics
    alerts: List[AlertCluster]
    dataset_source: Optional[str] = "Dataset: IBM AML Benchmark"
    sqlite_stats: Optional[Dict[str, int]] = None
    benchmark_3way: Optional[Dict[str, Any]] = None


class InjectRequest(BaseModel):
    typology: Literal["CYCLIC_ROUND_TRIPPING", "FAN_OUT_IN", "MULE_CHAIN"]


class InjectResponse(BaseModel):
    message: str
    injected_cluster: AlertCluster
    total_alerts: int


class ExplainRequest(BaseModel):
    cluster_id: Optional[str] = None
    typology: Optional[str] = None
    nodes: Optional[List[GraphNode]] = None
    edges: Optional[List[GraphEdge]] = None
    total_volume: Optional[float] = None
    dwell_time_mins: Optional[float] = None
    entry_node: Optional[str] = None
    exit_node: Optional[str] = None


class ExplainResponse(BaseModel):
    cluster_id: str
    typology: str
    ai_summary: str
    pattern_description: str
    key_findings: List[str]
    risk_level: str
    recommended_actions: List[str]
    confidence_score: float
    xai_feature_drivers: Optional[List[XAIFeatureDriver]] = None


class IngestTransactionItem(BaseModel):
    timestamp: Optional[str] = None
    from_bank: Optional[str] = "020"
    source_account: str
    to_bank: Optional[str] = "070"
    target_account: str
    amount: float
    currency: Optional[str] = "USD"
    payment_format: Optional[str] = "Wire"
    is_laundering: Optional[bool] = False


class IngestRequest(BaseModel):
    transactions: List[IngestTransactionItem]


class IngestResponse(BaseModel):
    message: str
    inserted_count: int
    total_db_transactions: int
    reanalyzed: bool


class ScamTransaction(BaseModel):
    tx_id: str
    timestamp: str
    amount: float
    victim_info: str
    scam_category: str
    target_account: str
    bank: str
    fir_number: str
    scam_method: str
    status: str = "CONFIRMED MALICIOUS"
    cluster_id: Optional[str] = None


class SuspectBankAccount(BaseModel):
    account_number: str
    bank_name: str
    bank_code: str
    account_type: str = "Savings Conduit"
    balance: float = 0.0
    total_inflow: float = 0.0
    status: str = "ACTIVE INTERCEPT"
    branch: str = "Corporate Branch"
    ifsc_swift: str = "APEX0001"


class SuspectRecord(BaseModel):
    id: str
    name: str
    alias: str
    police_agency: str
    doubt_description: str
    risk_score: float
    risk_level: str
    avatar: str = "👤"
    has_malicious_transactions: bool
    linked_accounts: List[str]
    bank_accounts: List[SuspectBankAccount] = []
    recent_scam_transactions: List[ScamTransaction] = []
    police_clearance_note: Optional[str] = None
    phone_number: Optional[str] = None
    residence_jurisdiction: Optional[str] = None


class SuspectsResponse(BaseModel):
    total_suspects: int
    critical_count: int
    under_inquiry_count: int
    suspects: List[SuspectRecord]
