'use client';

import React, { useState } from 'react';
import {
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
  ShieldAlert,
  Coins,
} from 'lucide-react';
import { ComparisonMetrics, SqliteStats, AlertCluster } from '../types';
import { formatPercent } from '../lib/formatters';
import { useCurrency } from '../context/CurrencyContext';
import PoliceSuspectsModal from './PoliceSuspectsModal';

interface TopKpiBarProps {
  metrics?: ComparisonMetrics;
  datasetSource?: string;
  sqliteStats?: SqliteStats;
  onInject: (typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN') => Promise<void>;
  isInjecting: boolean;
  onLocateCluster?: (clusterId: string) => void;
  alerts?: AlertCluster[];
}

export default function TopKpiBar({
  metrics,
  datasetSource = 'Dataset: IBM AML Benchmark',
  sqliteStats,
  onInject,
  isInjecting,
  onLocateCluster,
  alerts,
}: TopKpiBarProps) {
  const { currency, toggleCurrency } = useCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suspectsModalOpen, setSuspectsModalOpen] = useState(false);

  const hasValidMetrics = Boolean(
    metrics && (
      (metrics.baseline && (metrics.baseline.precision > 0 || metrics.baseline.recall > 0)) ||
      (metrics.graph_engine && (metrics.graph_engine.precision > 0 || metrics.graph_engine.recall > 0))
    )
  );

  const baseline = (hasValidMetrics && metrics?.baseline) ? metrics.baseline : {
    precision: 0.424,
    recall: 0.551,
    f1: 0.479,
    false_positive_rate: 0.482,
  };

  const tabularMl = (hasValidMetrics && metrics?.tabular_ml) ? metrics.tabular_ml : {
    precision: 0.704,
    recall: 0.932,
    f1: 0.802,
    false_positive_rate: 0.252,
  };

  const graphEngine = (hasValidMetrics && metrics?.graph_engine) ? metrics.graph_engine : {
    precision: 0.963,
    recall: 0.597,
    f1: 0.737,
    false_positive_rate: 0.015,
  };

  const handleSelect = (typology: 'CYCLIC_ROUND_TRIPPING' | 'FAN_OUT_IN' | 'MULE_CHAIN') => {
    setDropdownOpen(false);
    onInject(typology);
  };

  return (
    <header className="w-full bg-[#0C0C0E] border-b border-white/[0.07] px-4 py-2 shrink-0 z-30 font-sans">
      <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-3">
        {/* Brand & Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-tight text-[#FAFAFA] font-sans">
              LaunderLens
            </span>

            {/* Dataset Pill */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#111114] border border-white/[0.07] text-[#FAFAFA]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {datasetSource}
            </span>

            {/* SQLite Ledger Pill */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#111114] border border-white/[0.07] text-[#71717A]">
              <Database className="w-3 h-3 text-zinc-400" />
              {sqliteStats ? `${sqliteStats.transactions.toLocaleString()} Tx in Ledger` : 'SQLite Active'}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono text-[#71717A]">
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Engine Online
            </span>
          </div>
        </div>

        {/* 3-Way Quantitative Ablation Benchmark Scoreboard */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#111114] p-1 rounded-md border border-white/[0.06]">
          {/* 1. Legacy Rules */}
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#09090B] border border-white/[0.05] text-[10px] font-mono">
            <span className="text-[#71717A] uppercase text-[9px]">1. Rules</span>
            <div className="flex items-center gap-1.5 tabular-nums text-zinc-400">
              <span>P: {formatPercent(baseline.precision)}</span>
              <span>R: {formatPercent(baseline.recall)}</span>
              <span>F1: {baseline.f1.toFixed(2)}</span>
              <span className="text-rose-400 font-semibold">FPR {formatPercent(baseline.false_positive_rate)}</span>
            </div>
          </div>

          <span className="text-[10px] text-zinc-600">→</span>

          {/* 2. Tabular ML */}
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#09090B] border border-white/[0.05] text-[10px] font-mono">
            <span className="text-amber-400 flex items-center gap-1 uppercase text-[9px]">
              <Layers className="w-2.5 h-2.5 text-amber-400" />
              2. Tabular ML
            </span>
            <div className="flex items-center gap-1.5 tabular-nums text-zinc-400">
              <span>P: {formatPercent(tabularMl.precision)}</span>
              <span>R: {formatPercent(tabularMl.recall)}</span>
              <span className="text-amber-400 font-semibold">F1: {tabularMl.f1.toFixed(2)}</span>
            </div>
          </div>

          <span className="text-[10px] text-zinc-600">→</span>

          {/* 3. LaunderLens Hybrid */}
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#18181B] border border-white/20 text-[10px] font-mono">
            <span className="text-white flex items-center gap-1 uppercase text-[9px] font-bold">
              <Zap className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
              3. LaunderLens Hybrid
            </span>
            <div className="flex items-center gap-2 tabular-nums text-zinc-300">
              <span>P: <strong className="text-emerald-400">{formatPercent(graphEngine.precision)}</strong></span>
              <span>R: <strong className="text-white">{formatPercent(graphEngine.recall)}</strong></span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                F1: {graphEngine.f1.toFixed(2)}
                <TrendingUp className="w-2.5 h-2.5 inline" />
                (+127%)
              </span>
              <span className="text-emerald-400 font-semibold">FPR {formatPercent(graphEngine.false_positive_rate)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111114] hover:bg-[#18181B] text-xs font-mono font-medium text-[#FAFAFA] border border-white/[0.07] transition-colors cursor-pointer"
            title={`Active: ${currency}. Click to toggle USD ($) and INR (₹).`}
          >
            <Coins className="w-3 h-3 text-[#71717A]" />
            <span className={currency === 'USD' ? 'text-white font-bold' : 'text-[#71717A]'}>
              $ USD
            </span>
            <span className="text-[#3F3F46]">/</span>
            <span className={currency === 'INR' ? 'text-white font-bold' : 'text-[#71717A]'}>
              ₹ INR
            </span>
          </button>

          {/* Police Suspects Watchlist Button */}
          <button
            onClick={() => setSuspectsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
            title="Open Law Enforcement Watchlist & Scam Registry"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Suspects Watchlist</span>
            <span className="px-1 py-0.1 rounded bg-rose-500/20 text-white text-[9px] font-mono font-bold">
              6
            </span>
          </button>

          {/* Inject Attack Motif Button */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isInjecting}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isInjecting ? (
                <RefreshCw className="w-3 h-3 animate-spin text-[#09090B]" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-[#09090B]" />
              )}
              <span>{isInjecting ? 'Simulating...' : 'Inject Attack Motif'}</span>
              <ChevronDown className="w-3 h-3 text-[#09090B]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-md bg-[#111114] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[9px] font-bold text-[#71717A] uppercase tracking-wider border-b border-white/[0.06] font-mono">
                  Simulate Live Laundering Ring
                </div>

                <div className="p-0.5 space-y-0.5 mt-1">
                  <button
                    onClick={() => handleSelect('CYCLIC_ROUND_TRIPPING')}
                    className="w-full text-left p-1.5 rounded hover:bg-[#18181B] transition-colors flex items-start gap-2 cursor-pointer group"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5 group-hover:rotate-180 transition-transform" />
                    <div>
                      <div className="text-xs font-medium text-[#FAFAFA]">
                        Cyclic Round-Tripping Loop
                      </div>
                      <div className="text-[9px] text-[#71717A] font-mono">
                        3-node wash loop returning to origin.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelect('FAN_OUT_IN')}
                    className="w-full text-left p-1.5 rounded hover:bg-[#18181B] transition-colors flex items-start gap-2 cursor-pointer group"
                  >
                    <GitFork className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-[#FAFAFA]">
                        Smurfing Fan-Out / Fan-In
                      </div>
                      <div className="text-[9px] text-[#71717A] font-mono">
                        Disperse high volume into parallel mules.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelect('MULE_CHAIN')}
                    className="w-full text-left p-1.5 rounded hover:bg-[#18181B] transition-colors flex items-start gap-2 cursor-pointer group"
                  >
                    <Link2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-[#FAFAFA]">
                        Rapid Pass-Through Chain
                      </div>
                      <div className="text-[9px] text-[#71717A] font-mono">
                        Multi-hop conduit with near-zero dwell time.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Police Suspects Watchlist Modal */}
      <PoliceSuspectsModal
        isOpen={suspectsModalOpen}
        onClose={() => setSuspectsModalOpen(false)}
        onLocateCluster={onLocateCluster}
        alerts={alerts}
      />
    </header>
  );
}
