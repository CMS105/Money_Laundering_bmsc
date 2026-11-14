from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class PerformanceMetric(BaseModel):
    precision: float = Field(..., description="Precision score (0.0 to 1.0)")
    recall: float = Field(..., description="Recall score (0.0 to 1.0)")
    f1: float = Field(..., description="F1-score (0.0 to 1.0)")
    false_positive_rate: float = Field(..., description="False positive rate (0.0 to 1.0)")


class ComparisonMetrics(BaseModel):
    baseline: PerformanceMetric
    graph_engine: PerformanceMetric


class GraphNode(BaseModel):
    id: str = Field(..., description="Unique account identifier, e.g. ACC_1042")
    label: str = Field(..., description="Human-readable node label, e.g. ACC_1042 (Origin/Exit)")
    role: str = Field(..., description="Node role in cluster: entry, mule, exit, intermediary, etc.")
    risk: float = Field(..., description="Calculated risk score (0-100)")


class GraphEdge(BaseModel):
    id: str = Field(..., description="Transaction identifier, e.g. TX_901")
    source: str = Field(..., description="Source account ID")
    target: str = Field(..., description="Target account ID")
    amount: float = Field(..., description="Transaction amount in INR")
    timestamp: str = Field(..., description="ISO 8601 timestamp of transaction")
    hop_delay_mins: float = Field(..., description="Transit hop latency in minutes")


class AlertCluster(BaseModel):
    cluster_id: str = Field(..., description="Unique cluster identifier, e.g. CLU-001")
    typology: str = Field(
        ...,
        description="Laundering pattern typology: CYCLIC_ROUND_TRIPPING, FAN_OUT_IN, MULE_CHAIN",
    )
    risk_score: float = Field(..., description="Overall cluster risk score (0 to 100)")
    total_volume: float = Field(..., description="Total volume laundered across cluster in INR")
    dwell_time_mins: float = Field(..., description="Total dwell time across laundering hops in minutes")
    entry_node: str = Field(..., description="Entry origin account ID")
    exit_node: str = Field(..., description="Exit destination account ID")
    nodes: List[GraphNode] = Field(..., description="List of nodes participating in cluster")
    edges: List[GraphEdge] = Field(..., description="List of directed transaction edges")
    ai_summary: str = Field(..., description="Explainable AI narrative summary of money trail")


class AnalysisResponse(BaseModel):
    metrics: ComparisonMetrics
    alerts: List[AlertCluster]


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
