export interface DatasetSummary {
  total_transactions: number;
  total_accounts: number;
  total_volume: number;
  laundering_transactions: number;
  laundering_ratio: number;
  smurfing_rings: number;
  cycle_rings: number;
  mule_chains: number;
}

export interface MetricScores {
  system_name: string;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  true_negatives: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
}

export interface ComparativeBenchmarkResult {
  total_transactions: number;
  actual_laundering_transactions: number;
  baseline_metrics: MetricScores;
  graph_metrics: MetricScores;
  precision_lift_percent: number;
  recall_lift_percent: number;
  f1_lift_percent: number;
  false_positive_reduction_percent: number;
}

export interface DetectedAlert {
  alert_id: string;
  typology: 'SMURFING' | 'ROUNDTRIP_CYCLE' | 'MULE_CHAIN' | 'NORMAL';
  risk_score: number;
  involved_accounts: string[];
  involved_transactions: string[];
  total_volume: number;
  time_span_seconds: number;
  details: Record<string, any>;
}

export interface ClusterAnalysisResult {
  total_alerts: number;
  alerts_by_typology: Record<string, number>;
  top_alerts: DetectedAlert[];
  high_risk_accounts: string[];
}

export interface TemporalTrailStep {
  step_number: number;
  timestamp: number;
  formatted_time: string;
  source_account: string;
  target_account: string;
  amount: number;
  description: string;
}

export interface SARReport {
  sar_id: string;
  alert_id: string;
  filing_date: string;
  filing_institution: string;
  primary_typology: string;
  risk_score: number;
  threat_level: string;
  suspect_accounts: string[];
  total_volume_usd: number;
  transaction_count: number;
  time_span_hours: number;
  narrative_summary: string;
  chronological_trail: TemporalTrailStep[];
  red_flag_indicators: string[];
  recommended_action: string;
  fincen_xml_snippet?: string;
}

