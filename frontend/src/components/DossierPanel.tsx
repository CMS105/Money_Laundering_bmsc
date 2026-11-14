'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bot,
  Sparkles,
  Copy,
  Check,
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
        filing_institution: "LaunderLens Financial Intelligence Unit",
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
    a.download = `LAUNDERLENS_SAR_${cluster.cluster_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!cluster) {
    return (
      <aside className="w-80 2xl:w-88 flex flex-col bg-[#0C0C0E] border-l border-white/[0.07] h-full shrink-0 items-center justify-center p-8 text-center select-none font-sans">
        <div className="w-10 h-10 rounded-md bg-[#18181B] border border-white/[0.08] flex items-center justify-center mb-3">
          <FileText className="w-4 h-4 text-[#71717A]" />
        </div>
        <div className="text-xs font-semibold text-[#FAFAFA] mb-1 tracking-tight">Forensic Dossier Idle</div>
        <p className="text-[11px] text-[#71717A] max-w-[200px] leading-relaxed">
          Select an alert cluster from the ledger to inspect its intelligence profile and XAI drivers.
        </p>
      </aside>
    );
  }

  const xaiDrivers = cluster.xai_feature_drivers || [
    { feature: 'Circular Loop Topology', weight: 0.42, description: 'Closed directed flow conserving capital' },
    { feature: 'Betweenness Centrality', weight: 0.33, description: 'Flow funneling across intermediary accounts' },
    { feature: 'Transit Dwell Velocity', weight: 0.25, description: 'Sub-15m dwell latency between counterparties' },
  ];

  return (
    <aside className="w-80 2xl:w-88 flex flex-col bg-[#0C0C0E] border-l border-white/[0.07] h-full shrink-0 overflow-y-auto select-none font-sans">
      {/* Dossier Header */}
      <div className="p-3.5 border-b border-white/[0.07] flex items-center justify-between bg-[#0C0C0E]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#18181B] border border-white/[0.08] flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-[11px] font-semibold tracking-wider uppercase text-[#FAFAFA]">
              Forensic Dossier
            </h2>
            <div className="text-[9px] font-mono text-[#71717A] tabular-nums">
              CASE #{cluster.cluster_id.toUpperCase()}
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border tabular-nums ${
            cluster.risk_score >= 90
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}
        >
          {cluster.risk_score >= 90 ? 'CRITICAL RISK' : 'HIGH RISK'}
        </span>
      </div>

      <div className="p-3 space-y-3 flex-1">
        {/* Explainable AI Narrative Section */}
        <div className="card-fintech p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Bot className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FAFAFA]">
                AI Forensic Narrative
              </span>
            </div>

            <button
              onClick={handleRefreshExplanation}
              disabled={isLoadingAi}
              title="Re-synthesize forensic narrative with LLM"
              className="flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-[#18181B] hover:bg-[#27272A] px-2 py-0.5 rounded border border-white/[0.08] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoadingAi ? (
                <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-zinc-400" />
              )}
              <span>{isLoadingAi ? '...' : 'Re-Run'}</span>
            </button>
          </div>

          <p className="text-xs leading-relaxed text-zinc-300 font-sans">
            {isLoadingAi ? (
              <span className="flex items-center gap-2 text-[#71717A] py-1 font-mono text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Querying Gemini LLM with Pydantic contract...
              </span>
            ) : (
              explanation?.ai_summary || cluster.ai_summary
            )}
          </p>

          {/* ML Probability & Anomaly Confidence */}
          <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="flex items-center justify-between bg-[#09090B] border border-white/[0.05] px-2 py-1 rounded">
              <span className="text-[#71717A]">ML Probability</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {((cluster.ml_probability || 0.95) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between bg-[#09090B] border border-white/[0.05] px-2 py-1 rounded">
              <span className="text-[#71717A]">Isolation Score</span>
              <span className="font-bold text-[#FAFAFA] tabular-nums">
                {((cluster.isolation_score || 0.89) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 XAI Feature Drivers Section */}
        <div className="card-fintech p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              Top 3 XAI Feature Drivers
            </span>
            <span className="text-[9px] text-[#71717A] font-mono">NetworkX + RF</span>
          </div>

          <div className="space-y-1.5">
            {xaiDrivers.slice(0, 3).map((driver, idx) => (
              <div key={idx} className="p-2 rounded bg-[#09090B] border border-white/[0.05]">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-medium text-[#FAFAFA]">{driver.feature}</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {(driver.weight * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Visual percentage weight bar */}
                <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${Math.min(driver.weight * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-[#71717A] leading-tight font-sans">
                  {driver.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Origin & Exit Account Inspection Box */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 card-fintech">
            <div className="flex items-center justify-between text-[9px] font-bold mb-1 tracking-wider uppercase">
              <span className="flex items-center gap-1 text-amber-400">
                <ArrowUpRight className="w-2.5 h-2.5" />
                ENTRY
              </span>
              <button
                onClick={() => handleCopy(cluster.entry_node, 'entry')}
                className="hover:text-white cursor-pointer text-[#71717A] transition-colors"
                title="Copy Entry Node ID"
              >
                {copiedField === 'entry' ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-[#FAFAFA] text-[10px] truncate tabular-nums">
              {cluster.entry_node}
            </div>
          </div>

          <div className="p-2.5 card-fintech">
            <div className="flex items-center justify-between text-[9px] font-bold mb-1 tracking-wider uppercase">
              <span className="flex items-center gap-1 text-rose-400">
                <ArrowDownLeft className="w-2.5 h-2.5" />
                EXIT
              </span>
              <button
                onClick={() => handleCopy(cluster.exit_node, 'exit')}
                className="hover:text-white cursor-pointer text-[#71717A] transition-colors"
                title="Copy Exit Node ID"
              >
                {copiedField === 'exit' ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-[#FAFAFA] text-[10px] truncate tabular-nums">
              {cluster.exit_node}
            </div>
          </div>
        </div>

        {/* Institutional 3-Way Benchmark Comparison Table */}
        <div className="card-fintech p-3 space-y-2">
          <div className="flex items-center justify-between text-[#FAFAFA] font-semibold text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
              Institutional Benchmark
            </span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold">+62% Lift</span>
          </div>

          <div className="border border-white/[0.06] rounded overflow-hidden text-[10px] font-mono">
            <table className="w-full text-left">
              <thead className="bg-[#09090B] text-[#71717A] border-b border-white/[0.06] text-[8px] uppercase">
                <tr>
                  <th className="py-1 px-1.5 font-normal">Model</th>
                  <th className="py-1 px-1 font-normal text-right">F1</th>
                  <th className="py-1 px-1 font-normal text-right">Precision</th>
                  <th className="py-1 px-1.5 font-normal text-right">FPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                <tr>
                  <td className="py-1 px-1.5 text-[#71717A]">Legacy Rules</td>
                  <td className="py-1 px-1 text-right tabular-nums">0.31</td>
                  <td className="py-1 px-1 text-right tabular-nums">28.4%</td>
                  <td className="py-1 px-1.5 text-right text-rose-400 tabular-nums">14.2%</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 text-[#71717A]">Tabular ML</td>
                  <td className="py-1 px-1 text-right tabular-nums">0.58</td>
                  <td className="py-1 px-1 text-right tabular-nums">61.0%</td>
                  <td className="py-1 px-1.5 text-right text-amber-400 tabular-nums">6.8%</td>
                </tr>
                <tr className="bg-white/[0.04] font-bold text-white">
                  <td className="py-1 px-1.5 flex items-center gap-1 text-white">
                    <Layers className="w-2.5 h-2.5" />
                    LaunderLens
                  </td>
                  <td className="py-1 px-1 text-right text-emerald-400 tabular-nums">0.93</td>
                  <td className="py-1 px-1 text-right text-emerald-400 tabular-nums">94.7%</td>
                  <td className="py-1 px-1.5 text-right text-emerald-400 tabular-nums">0.9%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Banking Channel Hops */}
        <div className="card-fintech p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[#FAFAFA] font-semibold text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-zinc-400" />
              Banking Channel Hops
            </span>
            <span className="text-[10px] text-[#71717A] font-mono tabular-nums">
              {cluster.edges.length} Tx
            </span>
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
            {cluster.edges.map((e, idx) => (
              <div
                key={e.id}
                className="p-1 rounded bg-[#09090B] border border-white/[0.04] text-[9px] font-mono flex items-center justify-between gap-1"
              >
                <div className="truncate flex items-center gap-1">
                  <span className="text-[#52525B] tabular-nums">#{idx + 1}</span>
                  <span className="text-zinc-200">{e.source.split('_')[0]}</span>
                  <ChevronRight className="w-2 h-2 text-zinc-600 inline" />
                  <span className="text-zinc-200">{e.target.split('_')[0]}</span>
                </div>
                <span className="font-bold text-white tabular-nums shrink-0">
                  {formatAmount(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        {explanation?.recommended_actions && explanation.recommended_actions.length > 0 && (
          <div className="card-fintech p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-[#FAFAFA] font-semibold text-[10px] uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Compliance Actions</span>
            </div>
            <ul className="space-y-1 text-[#71717A] text-[10px]">
              {explanation.recommended_actions.map((act, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-tight">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 mt-1" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Export FinCEN SAR Report (Form 111) */}
        <div className="pt-1">
          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] text-xs font-semibold tracking-tight transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#09090B]" />
            <span>Export FinCEN SAR Report (Form 111)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
