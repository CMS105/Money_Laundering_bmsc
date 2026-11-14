export type LaunderingTypology = 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN' | string;

export interface PerformanceMetric {
  precision: number;
  recall: number;
  f1: number;
  false_positive_rate: number;
}

export interface ComparisonMetrics {
  baseline: PerformanceMetric;
  tabular_ml?: PerformanceMetric;
  graph_engine: PerformanceMetric;
}

export interface XAIFeatureDriver {
  feature: string;
  weight: number;
  description: string;
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
  from_bank?: string;
  to_bank?: string;
  payment_format?: string;
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
  ml_probability?: number;
  isolation_score?: number;
  xai_feature_drivers?: XAIFeatureDriver[];
}

export interface SqliteStats {
  transactions: number;
  detected_clusters: number;
  sar_reports: number;
}

export interface AnalysisResponse {
  metrics: ComparisonMetrics;
  alerts: AlertCluster[];
  dataset_source?: string;
  sqlite_stats?: SqliteStats;
  benchmark_3way?: Record<string, unknown>;
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
  xai_feature_drivers?: XAIFeatureDriver[];
}

export interface SarReportRecord {
  sar_id: string;
  cluster_id: string;
  threat_level: string;
  narrative: string;
  created_at: string;
}

export interface SarHistoryResponse {
  total_sars: number;
  reports: SarReportRecord[];
}
