export type LaunderingTypology = 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN' | string;

export interface PerformanceMetric {
  precision: number;
  recall: number;
  f1: number;
  false_positive_rate: number;
}

export interface ComparisonMetrics {
  baseline: PerformanceMetric;
  graph_engine: PerformanceMetric;
}

export interface GraphNode {
  id: string;
  label: string;
  role: 'entry' | 'mule' | 'exit' | string;
  risk: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  timestamp: string;
  hop_delay_mins: number;
}

export interface AlertCluster {
  cluster_id: string;
  typology: LaunderingTypology;
  risk_score: number;
  total_volume: number;
  dwell_time_mins: number;
  entry_node: string;
  exit_node: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  ai_summary: string;
}

export interface AnalysisResponse {
  metrics: ComparisonMetrics;
  alerts: AlertCluster[];
}

export interface InjectRequest {
  typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN';
}

export interface InjectResponse {
  message: string;
  injected_cluster: AlertCluster;
  total_alerts: number;
}

export interface ExplainResponse {
  cluster_id: string;
  typology: string;
  ai_summary: string;
  pattern_description: string;
  key_findings: string[];
  risk_level: string;
  recommended_actions: string[];
  confidence_score: number;
}
