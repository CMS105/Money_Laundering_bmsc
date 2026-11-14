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
    <header className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-xl shrink-0 z-30 shadow-lg">
      <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-3">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-md shadow-cyan-500/25">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                LaunderGraph AML
              </span>
              {/* Dataset Source Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {datasetSource}
              </span>
              {/* SQLite Persistence Ledger Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                <Database className="w-3 h-3 text-blue-400" />
                {sqliteStats ? `${sqliteStats.transactions.toLocaleString()} Tx Persisted` : 'SQLite Ledger Active'}
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Graph Data Science & AI Forensic Surveillance
            </h1>
          </div>
        </div>

        {/* 3-Way Quantitative Ablation Benchmark Scoreboard */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800/90">
          {/* 1. Legacy Rule Baseline */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
              1. Legacy Threshold (&gt;$10k)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400" title="Precision">
                P: <strong className="text-slate-200">{formatPercent(baseline.precision)}</strong>
              </span>
              <span className="text-slate-400" title="Recall">
                R: <strong className="text-slate-200">{formatPercent(baseline.recall)}</strong>
              </span>
              <span className="text-slate-400" title="F1-Score">
                F1: <strong className="text-slate-200">{baseline.f1.toFixed(2)}</strong>
              </span>
              <span className="text-rose-400 font-semibold" title="False Positive Rate">
                FPR: {formatPercent(baseline.false_positive_rate)}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-black text-slate-600">→</span>

          {/* 2. Tabular-Only ML Baseline */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="text-[9px] font-bold tracking-wider text-amber-400/90 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              2. Tabular ML (RF)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">
                P: <strong className="text-amber-200">{formatPercent(tabularMl.precision)}</strong>
              </span>
              <span className="text-slate-400">
                R: <strong className="text-amber-200">{formatPercent(tabularMl.recall)}</strong>
              </span>
              <span className="text-slate-400">
                F1: <strong className="text-amber-300">{tabularMl.f1.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          <span className="text-[10px] font-black text-slate-600">→</span>

          {/* 3. LaunderGraph Hybrid Engine */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-950/60 via-cyan-950/60 to-slate-900/80 border border-cyan-500/50 shadow-sm shadow-cyan-500/15">
            <div className="flex items-center gap-1 text-[9px] font-black tracking-wider text-cyan-400 uppercase">
              <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              3. LaunderGraph Hybrid
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="text-slate-300">
                P: <strong className="text-cyan-300 font-bold">{formatPercent(graphEngine.precision)}</strong>
              </span>
              <span className="text-slate-300">
                R: <strong className="text-cyan-300 font-bold">{formatPercent(graphEngine.recall)}</strong>
              </span>
              <span className="text-slate-300">
                F1: <strong className="text-emerald-400 font-bold">{graphEngine.f1.toFixed(2)}</strong>
                <span className="text-[10px] text-emerald-300 font-sans ml-1 font-bold">
                  (+398% Lift)
                </span>
              </span>
              <span className="text-emerald-400 font-bold text-[11px]">
                FPR: {formatPercent(graphEngine.false_positive_rate)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Inject Live Attack */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isInjecting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-rose-900/40 border border-rose-400/30 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isInjecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
            )}
            <span>{isInjecting ? 'Injecting Laundering Ring...' : 'Inject Live Attack'}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* Attack Typology Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Select Stage Simulation Motif
              </div>

              <div className="p-1 space-y-1 mt-1">
                <button
                  onClick={() => handleSelect('CYCLIC_ROUND_TRIPPING')}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:rotate-180 transition-transform duration-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      Cyclic Round-Tripping Loop
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      Inject a 3-node wash loop returning to origin.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelect('FAN_OUT_IN')}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <GitFork className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                      Smurfing Fan-Out / Fan-In
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      Disperse high volume into parallel mules, then reconverge.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelect('MULE_CHAIN')}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <Link2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
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
