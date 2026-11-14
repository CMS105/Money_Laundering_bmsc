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
  AlertOctagon,
  RefreshCw,
  Download,
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

    // Set initial explanation based on cluster data
    setExplanation({
      cluster_id: cluster.cluster_id,
      typology: cluster.typology,
      ai_summary: cluster.ai_summary,
      pattern_description: getTypologyMeta(cluster.typology).description,
      key_findings: [
        `High volume velocity: ${formatINRFull(cluster.total_volume)} across ${cluster.edges.length} hops`,
        `Short dwell window of ${cluster.dwell_time_mins} minutes across laundering nodes`,
        `Direct transit link identified between origin ${cluster.entry_node} and destination ${cluster.exit_node}`,
      ],
      risk_level: cluster.risk_score >= 90 ? 'CRITICAL' : 'HIGH',
      recommended_actions: [
        `Issue immediate administrative freeze on entry node ${cluster.entry_node}`,
        `File priority STR / SAR report with Financial Intelligence Unit (FIU-IND)`,
        `Trigger automated KYC forensic re-verification on all participant shell entities`,
      ],
      confidence_score: 0.94,
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
      investigation_dossier: {
        exported_at: new Date().toISOString(),
        cluster_id: cluster.cluster_id,
        typology: cluster.typology,
        risk_score: cluster.risk_score,
        total_volume_inr: cluster.total_volume,
        dwell_time_mins: cluster.dwell_time_mins,
        entry_node: cluster.entry_node,
        exit_node: cluster.exit_node,
        ai_narrative: explanation?.ai_summary || cluster.ai_summary,
        findings: explanation?.key_findings || [],
        recommended_actions: explanation?.recommended_actions || [],
        nodes: cluster.nodes,
        edges: cluster.edges,
      },
    };

    const blob = new Blob([JSON.stringify(exportPacket, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AML_EVIDENCE_${cluster.cluster_id}.json`;
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

  return (
    <aside className="w-80 2xl:w-96 flex flex-col bg-slate-900/70 border-l border-slate-800/80 backdrop-blur-md h-full shrink-0 overflow-y-auto select-none">
      {/* Dossier Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
            Investigator Dossier
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

          {explanation?.confidence_score && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Model Confidence:</span>
              <span className="font-bold text-cyan-300">
                {(explanation.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
          )}
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

        {/* Key Forensic Findings */}
        {explanation?.key_findings && explanation.key_findings.length > 0 && (
          <div className="rounded-xl p-3 bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              <span>Red Flag Anomalies</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              {explanation.key_findings.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export SAR Packet</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
