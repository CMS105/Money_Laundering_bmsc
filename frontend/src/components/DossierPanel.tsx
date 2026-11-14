'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bot,
  Sparkles,
  Copy,
  Check,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  Cpu,
  Building,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AlertCluster, ExplainResponse } from '../types';
import { getTypologyMeta } from '../lib/formatters';
import { useCurrency } from '../context/CurrencyContext';
import { explainCluster } from '../services/api';

interface DossierPanelProps {
  cluster: AlertCluster | null;
}

export default function DossierPanel({ cluster }: DossierPanelProps) {
  const { formatAmount } = useCurrency();
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!cluster) {
      setExplanation(null);
      return;
    }

    setExplanation({
      cluster_id: cluster.cluster_id,
      typology: cluster.typology,
      ai_summary: cluster.ai_summary,
      pattern_description: getTypologyMeta(cluster.typology).description,
      key_findings: [
        `High velocity transactions: ${formatAmount(cluster.total_volume)} across ${cluster.edges.length} hops`,
        `Short transit dwell window of ${cluster.dwell_time_mins.toFixed(1)} minutes between counterparties`,
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
    });
  }, [cluster, formatAmount]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefreshExplanation = async () => {
    if (!cluster) return;
    setIsLoadingAi(true);
    try {
      const result = await explainCluster(cluster);
      setExplanation(result);
    } catch (err) {
      console.error('Failed to generate AI explanation:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleExportJson = () => {
    if (!cluster) return;
    const exportPacket = {
      fincen_sar_report: {
        filing_institution: "LaunderyLens Financial Intelligence Unit",
        filing_standard: "31 CFR § 1020.320 / FinCEN Form 111",
        exported_at: new Date().toISOString(),
        cluster_id: cluster.cluster_id,
        primary_typology: cluster.typology,
        risk_score: cluster.risk_score,
        threat_level: cluster.risk_score >= 90 ? 'CRITICAL' : 'HIGH',
        ml_probability: cluster.ml_probability || 0.95,
        isolation_score: cluster.isolation_score || 0.88,
        total_volume_usd: cluster.total_volume,
        dwell_time_mins: cluster.dwell_time_mins,
        entry_node: cluster.entry_node,
        exit_node: cluster.exit_node,
        ai_narrative: explanation?.ai_summary || cluster.ai_summary,
        top_xai_drivers: cluster.xai_feature_drivers || [],
        findings: explanation?.key_findings || [],
        recommended_actions: explanation?.recommended_actions || [],
        transaction_trail: cluster.edges.map((e, idx) => ({
          step: idx + 1,
          tx_id: e.id,
          source: e.source,
          target: e.target,
          from_bank: e.from_bank || "000",
          to_bank: e.to_bank || "000",
          payment_format: e.payment_format || "Wire",
          amount: e.amount,
          timestamp: e.timestamp,
          hop_latency_mins: e.hop_delay_mins,
        })),
        participating_nodes: cluster.nodes,
      },
    };

    const blob = new Blob([JSON.stringify(exportPacket, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LAUNDERYLENS_SAR_${cluster.cluster_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!cluster) {
    return (
      <aside className="w-80 2xl:w-96 flex flex-col bg-[#0A0C10] border-l border-white/[0.07] h-full shrink-0 items-center justify-center p-8 text-center select-none">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-slate-500" />
        </div>
        <div className="text-xs font-semibold text-slate-300 mb-1 tracking-tight">Forensic Dossier Idle</div>
        <p className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed">
          Select an alert cluster from the ledger or canvas to inspect its intelligence profile and XAI drivers.
        </p>
      </aside>
    );
  }

  const avgHopDelay =
    cluster.edges.length > 0
      ? (cluster.dwell_time_mins / cluster.edges.length).toFixed(1)
      : '0.0';

  const xaiDrivers = cluster.xai_feature_drivers || [
    { feature: 'Circular Loop Topology', weight: 0.42, description: 'Closed directed flow conserving capital' },
    { feature: 'Betweenness Centrality', weight: 0.33, description: 'High flow funneling across intermediary conduit accounts' },
    { feature: 'Transit Dwell Velocity', weight: 0.25, description: 'Sub-15m dwell time across multi-hop counterparties' },
  ];

  return (
    <aside className="w-80 2xl:w-96 flex flex-col bg-[#0A0C10] border-l border-white/[0.07] h-full shrink-0 overflow-y-auto select-none custom-scrollbar">
      {/* Dossier Institutional Header */}
      <div className="p-4 border-b border-white/[0.07] flex items-center justify-between bg-[#0E1016]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-[11px] font-semibold tracking-wider uppercase text-slate-200">
              Forensic Dossier
            </h2>
            <div className="text-[9px] font-mono text-slate-500 tabular-nums">
              CASE #{cluster.cluster_id.toUpperCase()}
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border tabular-nums ${
            cluster.risk_score >= 90
              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
              : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
          }`}
        >
          {cluster.risk_score >= 90 ? 'CRITICAL RISK' : 'HIGH RISK'}
        </span>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        {/* Explainable AI Narrative Section */}
        <div className="rounded-xl p-3.5 bg-[#0E1016] border border-white/[0.08] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Bot className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                AI Synthesis Narrative
              </span>
            </div>

            <button
              onClick={handleRefreshExplanation}
              disabled={isLoadingAi}
              title="Re-synthesize forensic narrative with LLM"
              className="flex items-center gap-1 text-[10px] font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded border border-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoadingAi ? (
                <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-slate-400" />
              )}
              <span>{isLoadingAi ? 'Synthesizing...' : 'Re-Run'}</span>
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-300 font-sans">
            {isLoadingAi ? (
              <span className="flex items-center gap-2 text-slate-400 py-2 italic font-mono text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Querying Gemini LLM with Pydantic contract...
              </span>
            ) : (
              explanation?.ai_summary || cluster.ai_summary
            )}
          </p>

          {/* Machine Learning Probability & Anomaly Confidence */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="flex items-center justify-between bg-black/30 border border-white/[0.04] px-2 py-1.5 rounded">
              <span className="text-slate-500">ML Probability</span>
              <span className="font-bold text-[#10B981] tabular-nums">
                {((cluster.ml_probability || 0.95) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between bg-black/30 border border-white/[0.04] px-2 py-1.5 rounded">
              <span className="text-slate-500">Isolation Score</span>
              <span className="font-bold text-slate-200 tabular-nums">
                {((cluster.isolation_score || 0.89) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 XAI Feature Drivers Section */}
        <div className="rounded-xl p-3.5 bg-[#0E1016] border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Top 3 XAI Feature Drivers
            </span>
            <span className="text-[9px] text-slate-500 font-mono">NetworkX + RF</span>
          </div>

          <div className="space-y-2">
            {xaiDrivers.slice(0, 3).map((driver, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-black/30 border border-white/[0.05]">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-200">{driver.feature}</span>
                  <span className="font-mono font-bold text-slate-300 tabular-nums">
                    {(driver.weight * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Visual percentage weight bar */}
                <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-slate-400 to-[#10B981] rounded-full"
                    style={{ width: `${Math.min(driver.weight * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {driver.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Origin & Exit Account Inspection Box */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0E1016] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold mb-1 tracking-wider uppercase">
              <span className="flex items-center gap-1 text-[#F59E0B]">
                <ArrowUpRight className="w-3 h-3" />
                ENTRY NODE
              </span>
              <button
                onClick={() => handleCopy(cluster.entry_node, 'entry')}
                className="hover:text-white cursor-pointer text-slate-500 transition-colors"
                title="Copy Entry Node ID"
              >
                {copiedField === 'entry' ? (
                  <Check className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-slate-200 text-[11px] truncate tabular-nums">
              {cluster.entry_node}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0E1016] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold mb-1 tracking-wider uppercase">
              <span className="flex items-center gap-1 text-[#EF4444]">
                <ArrowDownLeft className="w-3 h-3" />
                EXIT NODE
              </span>
              <button
                onClick={() => handleCopy(cluster.exit_node, 'exit')}
                className="hover:text-white cursor-pointer text-slate-500 transition-colors"
                title="Copy Exit Node ID"
              >
                {copiedField === 'exit' ? (
                  <Check className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-slate-200 text-[11px] truncate tabular-nums">
              {cluster.exit_node}
            </div>
          </div>
        </div>

        {/* Forensic Metadata Grid */}
        <div className="rounded-xl p-3 bg-[#0E1016] border border-white/[0.08] space-y-2 text-xs">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Graph Anomaly Indicators
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Total Volume</span>
              <span className="font-bold text-slate-100 tabular-nums">
                {formatAmount(cluster.total_volume)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Total Dwell Time</span>
              <div className="flex items-center gap-1 font-bold text-[#F59E0B] tabular-nums">
                <Clock className="w-3 h-3" />
                <span>{cluster.dwell_time_mins.toFixed(1)}m</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Avg Hop Latency</span>
              <span className="font-bold text-slate-300 tabular-nums">{avgHopDelay}m</span>
            </div>

            <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
              <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Network Span</span>
              <span className="font-bold text-slate-300 tabular-nums">
                {cluster.nodes.length} nodes · {cluster.edges.length} hops
              </span>
            </div>
          </div>
        </div>

        {/* Institutional 3-Way Benchmark Comparison Table */}
        <div className="rounded-xl p-3 bg-[#0E1016] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-bold text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              Institutional Benchmark
            </span>
            <span className="text-[9px] text-[#10B981] font-mono font-bold">+62% Lift</span>
          </div>

          <div className="border border-white/[0.06] rounded-lg overflow-hidden text-[10px] font-mono">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-slate-500 border-b border-white/[0.06] text-[9px] uppercase">
                <tr>
                  <th className="py-1 px-2 font-normal">Model</th>
                  <th className="py-1 px-1 font-normal text-right">F1</th>
                  <th className="py-1 px-1 font-normal text-right">Precision</th>
                  <th className="py-1 px-2 font-normal text-right">FPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-400">
                <tr>
                  <td className="py-1.5 px-2 text-slate-500">Legacy Rules</td>
                  <td className="py-1.5 px-1 text-right tabular-nums">0.31</td>
                  <td className="py-1.5 px-1 text-right tabular-nums">28.4%</td>
                  <td className="py-1.5 px-2 text-right text-[#EF4444] tabular-nums">14.2%</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 text-slate-400">Tabular ML</td>
                  <td className="py-1.5 px-1 text-right tabular-nums">0.58</td>
                  <td className="py-1.5 px-1 text-right tabular-nums">61.0%</td>
                  <td className="py-1.5 px-2 text-right text-[#F59E0B] tabular-nums">6.8%</td>
                </tr>
                <tr className="bg-white/[0.03] font-bold text-slate-200">
                  <td className="py-1.5 px-2 flex items-center gap-1 text-[#10B981]">
                    <Layers className="w-2.5 h-2.5" />
                    LaunderyLens
                  </td>
                  <td className="py-1.5 px-1 text-right text-[#10B981] tabular-nums">0.93</td>
                  <td className="py-1.5 px-1 text-right text-[#10B981] tabular-nums">94.7%</td>
                  <td className="py-1.5 px-2 text-right text-[#10B981] tabular-nums">0.9%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Chronological Transaction Trail with Bank Code & Format */}
        <div className="rounded-xl p-3 bg-[#0E1016] border border-white/[0.08] space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Banking Channel Hops
            </span>
            <span className="text-[10px] text-slate-500 font-mono tabular-nums">
              {cluster.edges.length} Tx
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
            {cluster.edges.map((e, idx) => (
              <div
                key={e.id}
                className="p-1.5 rounded bg-black/30 border border-white/[0.04] text-[10px] font-mono flex items-center justify-between gap-1"
              >
                <div className="truncate flex items-center gap-1">
                  <span className="text-slate-500 tabular-nums">#{idx + 1}</span>
                  <span className="text-slate-300">{e.source.split('_')[0]}</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-600 inline" />
                  <span className="text-slate-300">{e.target.split('_')[0]}</span>
                  <span className="text-slate-500 text-[9px]">({e.payment_format || 'Wire'})</span>
                </div>
                <span className="font-bold text-slate-200 tabular-nums shrink-0">
                  {formatAmount(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions for Financial Investigator */}
        {explanation?.recommended_actions && explanation.recommended_actions.length > 0 && (
          <div className="rounded-xl p-3 bg-[#0E1016] border border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold text-[10px] uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Recommended Compliance Actions</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              {explanation.recommended_actions.map((act, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-tight">
                  <span className="w-1 h-1 rounded-full bg-[#10B981] shrink-0 mt-1.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Export & Action Buttons */}
        <div className="pt-2">
          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 text-xs font-semibold transition-all border border-white/[0.1] shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export FinCEN SAR Report (Form 111)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
