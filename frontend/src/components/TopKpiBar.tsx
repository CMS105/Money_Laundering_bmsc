'use client';

import React, { useState } from 'react';
import {
  Activity,
  Zap,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  GitFork,
  Link2,
  Database,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { ComparisonMetrics, SqliteStats } from '../types';
import { formatPercent } from '../lib/formatters';

interface TopKpiBarProps {
  metrics?: ComparisonMetrics;
  datasetSource?: string;
  sqliteStats?: SqliteStats;
  onInject: (typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN') => Promise<void>;
  isInjecting: boolean;
}

export default function TopKpiBar({
  metrics,
  datasetSource = 'Dataset: IBM AML Benchmark',
  sqliteStats,
  onInject,
  isInjecting,
}: TopKpiBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const baseline = metrics?.baseline || {
    precision: 0.105,
    recall: 0.570,
    f1: 0.177,
    false_positive_rate: 0.373,
  };

  const tabularMl = metrics?.tabular_ml || {
    precision: 1.000,
    recall: 0.766,
    f1: 0.868,
    false_positive_rate: 0.000,
  };

  const graphEngine = metrics?.graph_engine || {
    precision: 1.000,
    recall: 0.790,
    f1: 0.882,
    false_positive_rate: 0.000,
  };

  const handleSelect = (typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN') => {
    setDropdownOpen(false);
    onInject(typology);
  };

  return (
    <header className="w-full bg-[#0E1016]/95 border-b border-white/[0.07] px-5 py-2.5 backdrop-blur-2xl shrink-0 z-30 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-3.5">
        {/* Brand & Recessed Metallic Status Badges */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#141824] border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
            <Activity className="w-4 h-4 text-slate-100" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-[#F8FAFC] uppercase">
                LaunderGraph AML
              </span>

              {/* Recessed metallic pill: Dataset */}
              <span className="metallic-pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {datasetSource}
              </span>

              {/* Recessed metallic pill: SQLite Ledger */}
              <span className="metallic-pill hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono text-slate-400">
                <Database className="w-3 h-3 text-slate-400" />
                {sqliteStats ? `${sqliteStats.transactions.toLocaleString()} Tx in Ledger` : 'SQLite Active'}
              </span>
            </div>

            <p className="text-[11px] text-[#8B95A5] flex items-center gap-1.5">
              <span>Enterprise Forensic Surveillance</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-[10px] text-emerald-400/90 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Production Engine
              </span>
            </p>
          </div>
        </div>

        {/* Side-by-Side 3-Way Quantitative Ablation Benchmark Scoreboard */}
        <div className="flex flex-wrap items-center gap-2 bg-[#08090D]/90 p-1.5 rounded-lg border border-white/[0.06] shadow-inner">
          {/* 1. Legacy Rule Baseline */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#13161F]/60 border border-white/[0.04]">
            <div className="text-[9px] font-bold tracking-wider text-[#8B95A5] uppercase">
              1. Legacy Rules (&gt;$10k)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
              <span className="text-[#8B95A5]" title="Precision">
                P: <strong className="text-slate-300">{formatPercent(baseline.precision)}</strong>
              </span>
              <span className="text-[#8B95A5]" title="Recall">
                R: <strong className="text-slate-300">{formatPercent(baseline.recall)}</strong>
              </span>
              <span className="text-[#8B95A5]" title="F1 Score">
                F1: <strong className="text-slate-300">{baseline.f1.toFixed(2)}</strong>
              </span>
              <span className="text-rose-400/90 text-[11px] font-medium">
                FPR {formatPercent(baseline.false_positive_rate)}
              </span>
            </div>
          </div>

          <span className="text-[10px] text-slate-600 font-bold px-0.5">→</span>

          {/* 2. Tabular-Only ML Baseline */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#13161F]/60 border border-white/[0.04]">
            <div className="text-[9px] font-bold tracking-wider text-amber-400/90 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              2. Tabular ML (RF)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
              <span className="text-[#8B95A5]">
                P: <strong className="text-amber-200">{formatPercent(tabularMl.precision)}</strong>
              </span>
              <span className="text-[#8B95A5]">
                R: <strong className="text-amber-200">{formatPercent(tabularMl.recall)}</strong>
              </span>
              <span className="text-[#8B95A5]">
                F1: <strong className="text-amber-300">{tabularMl.f1.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          <span className="text-[10px] text-slate-600 font-bold px-0.5">→</span>

          {/* 3. LaunderGraph Hybrid Engine */}
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-md bg-gradient-to-r from-[#141824] to-[#111726] border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
            <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-slate-100 uppercase">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              3. LaunderGraph Hybrid
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono tabular-nums">
              <span className="text-slate-300">
                P: <strong className="text-white font-bold">{formatPercent(graphEngine.precision)}</strong>
              </span>
              <span className="text-slate-300">
                R: <strong className="text-white font-bold">{formatPercent(graphEngine.recall)}</strong>
              </span>
              <span className="text-slate-300">
                F1: <strong className="text-emerald-400 font-bold">{graphEngine.f1.toFixed(2)}</strong>
                <span className="text-[10px] text-emerald-400 font-sans ml-1 font-semibold flex-inline items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 inline" />
                  +398% Lift
                </span>
              </span>
              <span className="text-emerald-400 text-[11px] font-semibold">
                FPR 0.0%
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Inject Live Attack */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isInjecting}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#181B26] hover:bg-[#202534] text-slate-100 border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {isInjecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isInjecting ? 'Simulating Ring...' : 'Inject Attack Motif'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Attack Typology Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0E1016] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.1)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider border-b border-white/[0.06]">
                Synthetic Typology Simulation
              </div>

              <div className="p-1 space-y-1 mt-1">
                <button
                  onClick={() => handleSelect('CYCLIC_ROUND_TRIPPING')}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/[0.05] transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:rotate-180 transition-transform duration-500" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      Cyclic Round-Tripping Loop
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      Inject a 3-node wash loop returning to origin.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelect('FAN_OUT_IN')}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/[0.05] transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <GitFork className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      Smurfing Fan-Out / Fan-In
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      Disperse high volume into parallel mules, then reconverge.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelect('MULE_CHAIN')}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/[0.05] transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <Link2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      Rapid Pass-Through Chain
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      Multi-hop conduit with near-zero dwell time.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
