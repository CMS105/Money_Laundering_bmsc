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
} from 'lucide-react';
import { AlertCluster, ExplainResponse } from '../types';
import { formatINRFull, getTypologyMeta } from '../lib/formatters';
import { explainCluster } from '../services/api';

interface DossierPanelProps {
  cluster: AlertCluster | null;
}

export default function DossierPanel({ cluster }: DossierPanelProps) {
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // When cluster changes, reset or generate initial explanation
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
        `High velocity transactions: ${formatINRFull(cluster.total_volume)} across ${cluster.edges.length} hops`,
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
  }, [cluster]);

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
        filing_institution: "LaunderGraph National Bank AML Intelligence Unit",
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
    a.download = `LAUNDERGRAPH_SAR_${cluster.cluster_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!cluster) {
    return (
      <aside className="w-80 2xl:w-96 flex flex-col bg-slate-900/70 border-l border-slate-800/80 backdrop-blur-md h-full shrink-0 items-center justify-center p-6 text-slate-500 text-xs">
        Select a cluster to view forensic dossier
      </aside>
    );
  }

  const avgHopDelay =
    cluster.edges.length > 0
      ? (cluster.dwell_time_mins / cluster.edges.length).toFixed(1)
      : '0.0';

  const xaiDrivers = cluster.xai_feature_drivers || [
    { feature: 'PageRank Loop Topology', weight: 0.42, description: 'Closed directed flow conserving capital' },
    { feature: 'Rapid Pass-Through Velocity', weight: 0.33, description: 'Sub-15m dwell time across conduit nodes' },
    { feature: 'Cross-Bank Relay Channel', weight: 0.25, description: 'Inter-bank transfers spanning distinct institutions' },
  ];

  return (
    <aside className="w-80 2xl:w-96 flex flex-col bg-slate-900/70 border-l border-slate-800/80 backdrop-blur-md h-full shrink-0 overflow-y-auto select-none">
      {/* Dossier Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
            LaunderGraph Dossier
          </h2>
        </div>
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
            cluster.risk_score >= 90
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
          }`}
        >
          {cluster.risk_score >= 90 ? 'Critical Severity' : 'High Alert'}
        </span>
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* Explainable AI Narrative Section */}
        <div className="rounded-xl p-3 bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Bot className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                AI Money-Trail Summary
              </span>
            </div>

            <button
              onClick={handleRefreshExplanation}
              disabled={isLoadingAi}
              title="Call Gemini/LLM for fresh plain-language explanation"
              className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoadingAi ? (
                <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-cyan-400" />
              )}
              <span>{isLoadingAi ? 'Synthesizing...' : 'Re-Analyze'}</span>
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-200 font-sans">
            {isLoadingAi ? (
              <span className="flex items-center gap-2 text-cyan-300 py-2 italic font-mono text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Querying Gemini LLM with Pydantic contract...
              </span>
            ) : (
              explanation?.ai_summary || cluster.ai_summary
            )}
          </p>

          {/* Machine Learning Probability & Confidence */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 px-2 py-1 rounded">
              <span>ML Probability:</span>
              <span className="font-bold text-emerald-400">
                {((cluster.ml_probability || 0.95) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 px-2 py-1 rounded">
              <span>Isolation Anomaly:</span>
              <span className="font-bold text-cyan-300">
                {((cluster.isolation_score || 0.89) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 XAI Feature Drivers Section */}
        <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Top 3 XAI Feature Drivers
            </span>
            <span className="text-[9px] text-slate-400 font-mono">GDS + Random Forest</span>
          </div>

          <div className="space-y-2">
            {xaiDrivers.slice(0, 3).map((driver, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-200">{driver.feature}</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {(driver.weight * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Visual percentage weight bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(driver.weight * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {driver.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Origin & Exit Account Inspection Box */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-cyan-500/30">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                ENTRY NODE
              </span>
              <button
                onClick={() => handleCopy(cluster.entry_node, 'entry')}
                className="hover:text-cyan-200 cursor-pointer"
                title="Copy Entry Node ID"
              >
                {copiedField === 'entry' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-slate-100 truncate">
              {cluster.entry_node}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-rose-500/30">
            <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3" />
                EXIT NODE
              </span>
              <button
                onClick={() => handleCopy(cluster.exit_node, 'exit')}
                className="hover:text-rose-200 cursor-pointer"
                title="Copy Exit Node ID"
              >
                {copiedField === 'exit' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-slate-100 truncate">
              {cluster.exit_node}
            </div>
          </div>
        </div>

        {/* Forensic Metadata Grid */}
        <div className="rounded-xl p-3 bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Graph Anomaly Indicators
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Volume</span>
              <span className="font-bold text-cyan-300">
                {formatINRFull(cluster.total_volume)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Dwell Time</span>
              <div className="flex items-center gap-1 font-bold text-amber-300">
                <Clock className="w-3 h-3" />
                <span>{cluster.dwell_time_mins.toFixed(1)} mins</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Avg Hop Latency</span>
              <span className="font-bold text-slate-200">{avgHopDelay} mins</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Network Size</span>
              <span className="font-bold text-slate-200">
                {cluster.nodes.length} nodes · {cluster.edges.length} hops
              </span>
            </div>
          </div>
        </div>

        {/* Chronological Transaction Trail with Bank Code & Format */}
        <div className="rounded-xl p-3 bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold text-[11px]">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              Banking Channel Hops
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {cluster.edges.length} Transactions
            </span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {cluster.edges.map((e, idx) => (
              <div
                key={e.id}
                className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono flex items-center justify-between gap-1"
              >
                <div className="truncate">
                  <span className="text-cyan-400 font-bold">#{idx + 1}</span>{' '}
                  <span className="text-slate-300">{e.source.split('_')[0]}</span>{' '}
                  <span className="text-slate-500">→</span>{' '}
                  <span className="text-slate-300">{e.target.split('_')[0]}</span>{' '}
                  <span className="text-slate-400">({e.payment_format || 'Wire'})</span>
                </div>
                <span className="font-bold text-emerald-400 shrink-0">
                  ${e.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions for Financial Investigator */}
        {explanation?.recommended_actions && explanation.recommended_actions.length > 0 && (
          <div className="rounded-xl p-3 bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Recommended Compliance Actions</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              {explanation.recommended_actions.map((act, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Export & Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-200 text-xs font-bold transition-colors border border-cyan-500/30 shadow-md shadow-cyan-950/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export LaunderGraph FinCEN SAR</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
