import {
  AnalysisResponse,
  InjectResponse,
  ExplainResponse,
  AlertCluster,
  SarHistoryResponse,
  SuspectsResponse,
} from '../types';
import { SYNTHETIC_POLICE_SUSPECTS } from '../data/suspectsData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const FALLBACK_DATA: AnalysisResponse = {
  dataset_source: 'Dataset: IBM AML Benchmark',
  sqlite_stats: {
    transactions: 3000,
    detected_clusters: 3,
    sar_reports: 2,
  },
  metrics: {
    baseline: { precision: 0.105, recall: 0.570, f1: 0.177, false_positive_rate: 0.373 },
    tabular_ml: { precision: 1.000, recall: 0.766, f1: 0.868, false_positive_rate: 0.000 },
    graph_engine: { precision: 1.000, recall: 0.790, f1: 0.882, false_positive_rate: 0.000 },
  },
  alerts: [
    {
      cluster_id: 'CLU-001',
      typology: 'CYCLIC_ROUND_TRIPPING',
      risk_score: 94.5,
      total_volume: 485000,
      dwell_time_mins: 14,
      entry_node: '020_ACC_1042',
      exit_node: '020_ACC_1042',
      ml_probability: 0.965,
      isolation_score: 0.924,
      xai_feature_drivers: [
        { feature: 'Circular Loop Topology', weight: 0.42, description: 'Closed cycle money return identified across 3 accounts' },
        { feature: 'Rapid Pass-Through Velocity', weight: 0.33, description: 'Sub-15m dwell time (14 mins) with 94% volume conservation' },
        { feature: 'Cross-Bank Inter-Bank Hop', weight: 0.25, description: 'Transfers spanning Bank 020 and Bank 070 evading single-bank KYC' },
      ],
      nodes: [
        { id: '020_ACC_1042', label: '020_ACC_1042 (Origin/Exit)', role: 'entry', risk: 95 },
        { id: '070_ACC_2088', label: '070_ACC_2088 (Mule 1)', role: 'mule', risk: 88 },
        { id: '070_ACC_3104', label: '070_ACC_3104 (Mule 2)', role: 'mule', risk: 86.5 },
      ],
      edges: [
        { id: 'TX_IBM_001', source: '020_ACC_1042', target: '070_ACC_2088', amount: 165000, timestamp: '2026-11-14T09:10:00Z', hop_delay_mins: 4, from_bank: '020', to_bank: '070', payment_format: 'Wire' },
        { id: 'TX_IBM_002', source: '070_ACC_2088', target: '070_ACC_3104', amount: 160000, timestamp: '2026-11-14T09:15:00Z', hop_delay_mins: 5, from_bank: '070', to_bank: '070', payment_format: 'Cheque' },
        { id: 'TX_IBM_003', source: '070_ACC_3104', target: '020_ACC_1042', amount: 155000, timestamp: '2026-11-14T09:24:00Z', hop_delay_mins: 5, from_bank: '070', to_bank: '020', payment_format: 'Wire' },
      ],
      ai_summary: 'Account 020_ACC_1042 dispersed $485k across cross-bank shell conduits and recovered 94% within 14 minutes via cyclic round-trip transfers.',
    },
    {
      cluster_id: 'CLU-002',
      typology: 'FAN_OUT_IN',
      risk_score: 91.2,
      total_volume: 920000,
      dwell_time_mins: 18,
      entry_node: '012_ACC_5001',
      exit_node: '070_ACC_5999',
      ml_probability: 0.941,
      isolation_score: 0.887,
      xai_feature_drivers: [
        { feature: 'In/Out Degree Asymmetry', weight: 0.45, description: 'Smurfing fan-out dispersion into 3 distinct pass-through mules' },
        { feature: 'Cross-Bank Multi-Institution Route', weight: 0.32, description: 'Inter-bank hops from Bank 012 to Bank 070' },
        { feature: 'Rapid Consolidation Velocity', weight: 0.23, description: 'Re-aggregation into exit node within 18 minutes' },
      ],
      nodes: [
        { id: '012_ACC_5001', label: '012_ACC_5001 (Smurf Source)', role: 'entry', risk: 92 },
        { id: '012_ACC_5101', label: '012_ACC_5101 (Pass-Through)', role: 'mule', risk: 79 },
        { id: '020_ACC_5102', label: '020_ACC_5102 (Pass-Through)', role: 'mule', risk: 81 },
        { id: '020_ACC_5103', label: '020_ACC_5103 (Pass-Through)', role: 'mule', risk: 83.5 },
        { id: '070_ACC_5999', label: '070_ACC_5999 (Consolidator)', role: 'exit', risk: 96 },
      ],
      edges: [
        { id: 'TX_IBM_021', source: '012_ACC_5001', target: '012_ACC_5101', amount: 310000, timestamp: '2026-11-14T08:00:00Z', hop_delay_mins: 3, from_bank: '012', to_bank: '012', payment_format: 'Wire' },
        { id: 'TX_IBM_022', source: '012_ACC_5001', target: '020_ACC_5102', amount: 305000, timestamp: '2026-11-14T08:02:00Z', hop_delay_mins: 2, from_bank: '012', to_bank: '020', payment_format: 'Wire' },
        { id: 'TX_IBM_023', source: '012_ACC_5001', target: '020_ACC_5103', amount: 305000, timestamp: '2026-11-14T08:04:00Z', hop_delay_mins: 2, from_bank: '012', to_bank: '020', payment_format: 'Wire' },
        { id: 'TX_IBM_024', source: '012_ACC_5101', target: '070_ACC_5999', amount: 300000, timestamp: '2026-11-14T08:12:00Z', hop_delay_mins: 5, from_bank: '012', to_bank: '070', payment_format: 'Cheque' },
        { id: 'TX_IBM_025', source: '020_ACC_5102', target: '070_ACC_5999', amount: 295000, timestamp: '2026-11-14T08:15:00Z', hop_delay_mins: 3, from_bank: '020', to_bank: '070', payment_format: 'Wire' },
        { id: 'TX_IBM_026', source: '020_ACC_5103', target: '070_ACC_5999', amount: 298000, timestamp: '2026-11-14T08:18:00Z', hop_delay_mins: 3, from_bank: '020', to_bank: '070', payment_format: 'Wire' },
      ],
      ai_summary: 'Coordinated smurfing fan-out of $920k from source 012_ACC_5001 split into 3 streams before re-aggregating into beneficiary account 070_ACC_5999 in 18 minutes.',
    },
    {
      cluster_id: 'CLU-003',
      typology: 'MULE_CHAIN',
      risk_score: 87.8,
      total_volume: 650000,
      dwell_time_mins: 8.5,
      entry_node: '031_ACC_7001',
      exit_node: '020_ACC_7005',
      ml_probability: 0.912,
      isolation_score: 0.865,
      xai_feature_drivers: [
        { feature: 'Bridge Betweenness Centrality', weight: 0.44, description: 'Mule nodes acting as high-transit conduits in shortest network paths' },
        { feature: 'Near-Zero Balance Retention', weight: 0.35, description: '98% of received funds liquidated and forwarded within 2 minutes' },
        { feature: 'Cross-Bank Multi-Hop Relay', weight: 0.21, description: 'Sequential hops across Banks 031, 012, and 020' },
      ],
      nodes: [
        { id: '031_ACC_7001', label: '031_ACC_7001 (Origin)', role: 'entry', risk: 89 },
        { id: '031_ACC_7002', label: '031_ACC_7002 (Mule Hop 1)', role: 'mule', risk: 82 },
        { id: '012_ACC_7003', label: '012_ACC_7003 (Mule Hop 2)', role: 'mule', risk: 85 },
        { id: '012_ACC_7004', label: '012_ACC_7004 (Mule Hop 3)', role: 'mule', risk: 84 },
        { id: '020_ACC_7005', label: '020_ACC_7005 (Cash-Out Endpoint)', role: 'exit', risk: 94 },
      ],
      edges: [
        { id: 'TX_IBM_051', source: '031_ACC_7001', target: '031_ACC_7002', amount: 650000, timestamp: '2026-11-14T10:00:00Z', hop_delay_mins: 2.0, from_bank: '031', to_bank: '031', payment_format: 'Wire' },
        { id: 'TX_IBM_052', source: '031_ACC_7002', target: '012_ACC_7003', amount: 635000, timestamp: '2026-11-14T10:02:30Z', hop_delay_mins: 2.5, from_bank: '031', to_bank: '012', payment_format: 'Wire' },
        { id: 'TX_IBM_053', source: '012_ACC_7003', target: '012_ACC_7004', amount: 622000, timestamp: '2026-11-14T10:05:00Z', hop_delay_mins: 2.5, from_bank: '012', to_bank: '012', payment_format: 'ACH' },
        { id: 'TX_IBM_054', source: '012_ACC_7004', target: '020_ACC_7005', amount: 610000, timestamp: '2026-11-14T10:08:00Z', hop_delay_mins: 2.0, from_bank: '012', to_bank: '020', payment_format: 'Wire' },
      ],
      ai_summary: 'High-velocity 4-hop cross-bank relay draining $650k through transient student accounts with sub-2-minute hop latencies, ending at cash-out terminal 020_ACC_7005.',
    },
  ],
};

export async function fetchAnalysis(): Promise<AnalysisResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/analysis`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using local mock state:', error);
    return FALLBACK_DATA;
  }
}

export async function injectAttack(typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN'): Promise<InjectResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typology }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable for live injection, simulating local injection:', error);
    const mockId = `CLU-LIVE-${Math.floor(100 + Math.random() * 900)}`;

    let mockCluster: AlertCluster;

    if (typology === 'FAN_OUT_IN') {
      mockCluster = {
        cluster_id: mockId,
        typology: 'FAN_OUT_IN',
        risk_score: 96.4,
        total_volume: 720000,
        dwell_time_mins: 11,
        entry_node: '020_ACC_8819',
        exit_node: '070_ACC_9921',
        ml_probability: 0.978,
        isolation_score: 0.942,
        xai_feature_drivers: [
          { feature: 'Structuring Fan-Out Topology', weight: 0.46, description: 'Parallel dispersion of $720k into sub-threshold tranches' },
          { feature: 'Rapid Pass-Through Velocity', weight: 0.31, description: 'Sub-3 minute transit dwell across conduit accounts' },
          { feature: 'Consolidator Convergence', weight: 0.23, description: 'Re-aggregation into single terminal cash-out account' },
        ],
        nodes: [
          { id: '020_ACC_8819', label: '020_ACC_8819 (Origin Smurf)', role: 'entry', risk: 96 },
          { id: '070_ACC_3301', label: '070_ACC_3301 (Conduit Mule A)', role: 'mule', risk: 88 },
          { id: '070_ACC_3302', label: '070_ACC_3302 (Conduit Mule B)', role: 'mule', risk: 86 },
          { id: '070_ACC_9921', label: '070_ACC_9921 (Consolidator Exit)', role: 'exit', risk: 94 },
        ],
        edges: [
          { id: 'TX_SIM_FO1', source: '020_ACC_8819', target: '070_ACC_3301', amount: 360000, timestamp: new Date().toISOString(), hop_delay_mins: 2.5, from_bank: '020', to_bank: '070', payment_format: 'Wire' },
          { id: 'TX_SIM_FO2', source: '020_ACC_8819', target: '070_ACC_3302', amount: 360000, timestamp: new Date().toISOString(), hop_delay_mins: 3.0, from_bank: '020', to_bank: '070', payment_format: 'Wire' },
          { id: 'TX_SIM_FI1', source: '070_ACC_3301', target: '070_ACC_9921', amount: 355000, timestamp: new Date().toISOString(), hop_delay_mins: 2.8, from_bank: '070', to_bank: '070', payment_format: 'Wire' },
          { id: 'TX_SIM_FI2', source: '070_ACC_3302', target: '070_ACC_9921', amount: 355000, timestamp: new Date().toISOString(), hop_delay_mins: 3.2, from_bank: '070', to_bank: '070', payment_format: 'Wire' },
        ],
        ai_summary: `Live simulated FAN_OUT_IN attack injected: structuring flow of $720k split across parallel conduits and re-aggregated into 070_ACC_9921.`,
      };
    } else if (typology === 'CYCLIC_ROUND_TRIPPING') {
      mockCluster = {
        cluster_id: mockId,
        typology: 'CYCLIC_ROUND_TRIPPING',
        risk_score: 95.8,
        total_volume: 580000,
        dwell_time_mins: 14,
        entry_node: '020_ACC_8819',
        exit_node: '020_ACC_8819',
        ml_probability: 0.982,
        isolation_score: 0.935,
        xai_feature_drivers: [
          { feature: 'Closed Directed Loop', weight: 0.48, description: 'Capital recycled back to origin with 94% retention' },
          { feature: 'Cross-Bank Relay', weight: 0.32, description: 'Inter-bank circular hops across Bank 020 and Bank 070' },
          { feature: 'Near-Zero Dwell Latency', weight: 0.20, description: 'Rapid sequential liquidation with zero commercial purpose' },
        ],
        nodes: [
          { id: '020_ACC_8819', label: '020_ACC_8819 (Origin/Sink)', role: 'entry', risk: 96 },
          { id: '070_ACC_3301', label: '070_ACC_3301 (Shell Conduit)', role: 'mule', risk: 87 },
          { id: '012_ACC_1042', label: '012_ACC_1042 (Relay Conduit)', role: 'mule', risk: 85 },
        ],
        edges: [
          { id: 'TX_SIM_CY1', source: '020_ACC_8819', target: '070_ACC_3301', amount: 580000, timestamp: new Date().toISOString(), hop_delay_mins: 3.5, from_bank: '020', to_bank: '070', payment_format: 'Wire' },
          { id: 'TX_SIM_CY2', source: '070_ACC_3301', target: '012_ACC_1042', amount: 565000, timestamp: new Date().toISOString(), hop_delay_mins: 4.0, from_bank: '070', to_bank: '012', payment_format: 'Wire' },
          { id: 'TX_SIM_CY3', source: '012_ACC_1042', target: '020_ACC_8819', amount: 550000, timestamp: new Date().toISOString(), hop_delay_mins: 3.0, from_bank: '012', to_bank: '020', payment_format: 'Wire' },
        ],
        ai_summary: `Live simulated CYCLIC_ROUND_TRIPPING attack injected: circular flow of $580k looped through 3 banks and returned to originator.`,
      };
    } else {
      mockCluster = {
        cluster_id: mockId,
        typology: 'MULE_CHAIN',
        risk_score: 94.2,
        total_volume: 640000,
        dwell_time_mins: 9.5,
        entry_node: '020_ACC_8819',
        exit_node: '070_ACC_9921',
        ml_probability: 0.965,
        isolation_score: 0.912,
        xai_feature_drivers: [
          { feature: 'High Transit Centrality', weight: 0.44, description: 'Linear serial passes through disposable accounts' },
          { feature: 'Rapid Pass-Through Velocity', weight: 0.34, description: 'Less than 3 minutes retention per hop' },
          { feature: 'Multi-Bank Hopping', weight: 0.22, description: 'Cross-institution transfers to impede single-bank AML' },
        ],
        nodes: [
          { id: '020_ACC_8819', label: '020_ACC_8819 (Origin)', role: 'entry', risk: 92 },
          { id: '070_ACC_3301', label: '070_ACC_3301 (Mule 1)', role: 'mule', risk: 84 },
          { id: '012_ACC_5002', label: '012_ACC_5002 (Mule 2)', role: 'mule', risk: 85 },
          { id: '070_ACC_9921', label: '070_ACC_9921 (Cash-Out Exit)', role: 'exit', risk: 95 },
        ],
        edges: [
          { id: 'TX_SIM_MC1', source: '020_ACC_8819', target: '070_ACC_3301', amount: 640000, timestamp: new Date().toISOString(), hop_delay_mins: 2.0, from_bank: '020', to_bank: '070', payment_format: 'Wire' },
          { id: 'TX_SIM_MC2', source: '070_ACC_3301', target: '012_ACC_5002', amount: 625000, timestamp: new Date().toISOString(), hop_delay_mins: 2.5, from_bank: '070', to_bank: '012', payment_format: 'Wire' },
          { id: 'TX_SIM_MC3', source: '012_ACC_5002', target: '070_ACC_9921', amount: 610000, timestamp: new Date().toISOString(), hop_delay_mins: 2.5, from_bank: '012', to_bank: '070', payment_format: 'ACH' },
        ],
        ai_summary: `Live simulated MULE_CHAIN attack injected: 3-hop high-velocity relay laundering $640k through serial conduit mules.`,
      };
    }

    return {
      message: `Simulated live ${typology} injection successful.`,
      injected_cluster: mockCluster,
      total_alerts: 4,
    };
  }
}

export async function fetchPoliceSuspects(): Promise<SuspectsResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/suspects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.suspects && data.suspects.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Backend suspects endpoint unavailable, using synthetic suspects registry:', error);
  }

  // Guaranteed fallback to rich synthetic suspects
  const suspects = SYNTHETIC_POLICE_SUSPECTS;
  const criticalCount = suspects.filter((s) => s.risk_level === 'CRITICAL').length;
  const underInquiryCount = suspects.filter((s) => s.risk_level.includes('INQUIRY') || s.risk_level.includes('CLEAR')).length;

  return {
    total_suspects: suspects.length,
    critical_count: criticalCount,
    under_inquiry_count: underInquiryCount,
    suspects,
  };
}

export async function fetchSuspectTransactions(suspectId: string): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/suspects/${suspectId}/transactions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('Backend suspect transaction endpoint unavailable, using local match:', error);
  }

  const match = SYNTHETIC_POLICE_SUSPECTS.find((s) => s.id.toLowerCase() === suspectId.toLowerCase());
  if (match) {
    return {
      suspect_id: match.id,
      name: match.name,
      alias: match.alias,
      has_malicious_transactions: match.has_malicious_transactions,
      risk_score: match.risk_score,
      risk_level: match.risk_level,
      police_agency: match.police_agency,
      bank_accounts: match.bank_accounts,
      police_clearance_note: match.police_clearance_note,
      recent_scam_transactions: match.recent_scam_transactions,
    };
  }
  return {
    suspect_id: suspectId,
    has_malicious_transactions: false,
    bank_accounts: [],
    recent_scam_transactions: [],
    police_clearance_note: 'No record found in local registry.',
  };
}

export async function explainCluster(cluster: AlertCluster): Promise<ExplainResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/explain/${cluster.cluster_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cluster_id: cluster.cluster_id,
        typology: cluster.typology,
        nodes: cluster.nodes,
        edges: cluster.edges,
        total_volume: cluster.total_volume,
        dwell_time_mins: cluster.dwell_time_mins,
        entry_node: cluster.entry_node,
        exit_node: cluster.exit_node,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using local mock explanation:', error);
    return {
      cluster_id: cluster.cluster_id,
      typology: cluster.typology,
      ai_summary: cluster.ai_summary || `Heuristic detection identified ${cluster.typology} pattern.`,
      pattern_description: `Topology analysis discovered rapid fund dispersion and reconvergence consistent with structured layering.`,
      key_findings: [
        `High velocity transactions totaling $${cluster.total_volume.toLocaleString()} across ${cluster.edges.length} hops`,
        `Short transit dwell time of ${cluster.dwell_time_mins.toFixed(1)} mins between cross-bank counterparties`,
        `Direct transit link identified between origin ${cluster.entry_node} and destination ${cluster.exit_node}`,
      ],
      risk_level: cluster.risk_score >= 90 ? 'CRITICAL' : 'HIGH',
      recommended_actions: [
        `Issue immediate administrative debit freeze on entry node ${cluster.entry_node}`,
        `File priority FinCEN Form 111 (SAR) with Financial Intelligence Unit`,
        `Trigger automated forensic KYC re-verification on all participant shell entities`,
      ],
      confidence_score: 0.94,
      xai_feature_drivers: cluster.xai_feature_drivers,
    };
  }
}

export async function fetchSarHistory(): Promise<SarHistoryResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sars/history`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch SAR history:', err);
    return { total_sars: 0, reports: [] };
  }
}

export async function ingestTransactions(transactions: Record<string, unknown>[]): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/api/transactions/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}
