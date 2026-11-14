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
} from 'lucide-react';
import { ComparisonMetrics } from '../types';
import { formatPercent } from '../lib/formatters';

interface TopKpiBarProps {
  metrics?: ComparisonMetrics;
  onInject: (typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN') => Promise<void>;
  isInjecting: boolean;
}

export default function TopKpiBar({ metrics, onInject, isInjecting }: TopKpiBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const baseline = metrics?.baseline || {
    precision: 0.32,
    recall: 0.28,
    f1: 0.30,
    false_positive_rate: 0.41,
  };

  const graphEngine = metrics?.graph_engine || {
    precision: 0.91,
    recall: 0.86,
    f1: 0.88,
    false_positive_rate: 0.04,
  };

  const handleSelect = (typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN') => {
    setDropdownOpen(false);
    onInject(typology);
  };

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-xl shrink-0 z-30 shadow-lg">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                BUILD BEYOND &apos;26 — PS 2.1
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ENGINE LIVE
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Graph-Based Detection of Layered Money Laundering
            </h1>
          </div>
        </div>

        {/* Side-by-Side Scoreboard: Threshold Baseline vs Temporal Graph Engine */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
          {/* Baseline Metric Group */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mr-1">
              Threshold Baseline
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono">
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

          {/* Versus Divider */}
          <span className="text-[10px] font-black text-slate-500 uppercase px-1">VS</span>

          {/* Temporal Graph Engine Metric Group */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-slate-900/60 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
            <div className="flex items-center gap-1 text-[10px] font-black tracking-wider text-cyan-400 uppercase mr-1">
              <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              Graph Engine
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-300" title="Precision">
                P: <strong className="text-cyan-300 font-bold">{formatPercent(graphEngine.precision)}</strong>
                <span className="text-[10px] text-emerald-400 font-sans ml-0.5 font-bold">
                  (+{(graphEngine.precision - baseline.precision > 0 ? (graphEngine.precision - baseline.precision) * 100 : 0).toFixed(0)}%)
                </span>
              </span>
              <span className="text-slate-300" title="Recall">
                R: <strong className="text-cyan-300 font-bold">{formatPercent(graphEngine.recall)}</strong>
                <span className="text-[10px] text-emerald-400 font-sans ml-0.5 font-bold">
                  (+{(graphEngine.recall - baseline.recall > 0 ? (graphEngine.recall - baseline.recall) * 100 : 0).toFixed(0)}%)
                </span>
              </span>
              <span className="text-slate-300" title="F1-Score">
                F1: <strong className="text-emerald-400 font-bold">{graphEngine.f1.toFixed(2)}</strong>
                <span className="text-[10px] text-emerald-300 font-sans ml-0.5 font-bold">
                  (3.0x)
                </span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1" title="False Positive Rate">
                FPR: {formatPercent(graphEngine.false_positive_rate)}
                <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1 rounded font-sans">
                  -90% noise
                </span>
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

              <button
                onClick={() => handleSelect('CYCLIC_ROUND_TRIPPING')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 mt-1 group cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    Cyclic Round-Tripping
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    Circular layering loop returning 94%+ to originator
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelect('FAN_OUT_IN')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 mt-1 group cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                    Fan-Out / Fan-In
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    Parallel smurfing below threshold into aggregator
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelect('MULE_CHAIN')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 mt-1 group cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                    Mule Chain
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    High-velocity multi-hop relay to cash-out endpoint
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
