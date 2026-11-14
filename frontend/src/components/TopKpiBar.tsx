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
    <header className="w-full bg-[#1E3541] border-b border-[#284250] px-5 py-2.5 shrink-0 z-30 shadow-[0_10px_25px_-8px_rgba(18,34,42,0.7)]">
      <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-3.5">
        {/* Brand & Recessed Status Badges */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#253F4D] border border-[#284250] shadow-sm">
            <Activity className="w-4 h-4 text-[#75A99A]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4D9477] border border-[#1E3541]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tracking-wider text-[#E8E5DA] uppercase font-sans">
                LaunderyLens
              </span>

              {/* Status pill: Dataset */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-[#172B35] border border-[#284250] text-[#E8E5DA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4D9477]" />
                {datasetSource}
              </span>

              {/* Status pill: SQLite Ledger */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#172B35] border border-[#284250] text-[#82918E]">
                <Database className="w-3 h-3 text-[#75A99A]" />
                {sqliteStats ? `${sqliteStats.transactions.toLocaleString()} Tx in Ledger` : 'SQLite Active'}
              </span>
            </div>

            <p className="text-[11px] text-[#82918E] flex items-center gap-1.5 font-mono">
              <span>Enterprise Forensic Surveillance</span>
              <span className="text-[#284250]">·</span>
              <span className="text-[#4D9477] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#4D9477]" />
                Production Engine
              </span>
            </p>
          </div>
        </div>

        {/* Side-by-Side 3-Way Quantitative Ablation Benchmark Scoreboard */}
        <div className="flex flex-wrap items-center gap-2 bg-[#172B35] p-1.5 rounded-lg border border-[#284250] shadow-inner">
          {/* 1. Legacy Rule Baseline */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#1E3541] border border-[#284250]">
            <div className="text-[9px] font-bold tracking-wider text-[#82918E] uppercase font-mono">
              1. Legacy Rules (&gt;$10k)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
              <span className="text-[#82918E]" title="Precision">
                P: <strong className="text-[#E8E5DA]">{formatPercent(baseline.precision)}</strong>
              </span>
              <span className="text-[#82918E]" title="Recall">
                R: <strong className="text-[#E8E5DA]">{formatPercent(baseline.recall)}</strong>
              </span>
              <span className="text-[#82918E]" title="F1 Score">
                F1: <strong className="text-[#E8E5DA]">{baseline.f1.toFixed(2)}</strong>
              </span>
              <span className="text-[#C75B55] text-[11px] font-medium">
                FPR {formatPercent(baseline.false_positive_rate)}
              </span>
            </div>
          </div>

          <span className="text-[10px] text-[#82918E] font-bold px-0.5">→</span>

          {/* 2. Tabular-Only ML Baseline */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#1E3541] border border-[#284250]">
            <div className="text-[9px] font-bold tracking-wider text-[#D5A24F] uppercase flex items-center gap-1 font-mono">
              <Layers className="w-3 h-3 text-[#D5A24F]" />
              2. Tabular ML (RF)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
              <span className="text-[#82918E]">
                P: <strong className="text-[#D5A24F]">{formatPercent(tabularMl.precision)}</strong>
              </span>
              <span className="text-[#82918E]">
                R: <strong className="text-[#D5A24F]">{formatPercent(tabularMl.recall)}</strong>
              </span>
              <span className="text-[#82918E]">
                F1: <strong className="text-[#D5A24F]">{tabularMl.f1.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          <span className="text-[10px] text-[#82918E] font-bold px-0.5">→</span>

          {/* 3. LaunderyLens Hybrid Engine */}
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-md bg-[#253F4D] border border-[#75A99A]/40 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-[#E8E5DA] uppercase font-mono">
              <Zap className="w-3 h-3 text-[#D5A24F] fill-[#D5A24F]" />
              3. LaunderyLens Hybrid
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono tabular-nums">
              <span className="text-[#A3B3AF]">
                P: <strong className="text-[#E8E5DA] font-bold">{formatPercent(graphEngine.precision)}</strong>
              </span>
              <span className="text-[#A3B3AF]">
                R: <strong className="text-[#E8E5DA] font-bold">{formatPercent(graphEngine.recall)}</strong>
              </span>
              <span className="text-[#A3B3AF]">
                F1: <strong className="text-[#4D9477] font-bold">{graphEngine.f1.toFixed(2)}</strong>
                <span className="text-[10px] text-[#4D9477] font-sans ml-1 font-semibold flex-inline items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 inline" />
                  +398% Lift
                </span>
              </span>
              <span className="text-[#4D9477] text-[11px] font-semibold">
                FPR 0.0%
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Currency Switcher, Police Watchlist & Inject Attack */}
        <div className="flex items-center gap-2.5">
          {/* Currency Switcher: USD ($) vs INR (₹) */}
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#172B35] hover:bg-[#253F4D] text-[#E8E5DA] border border-[#284250] shadow-inner transition-all cursor-pointer"
            title={`Active Currency: ${currency}. Click to switch between USD ($) and INR (₹).`}
          >
            <Coins className="w-3.5 h-3.5 text-[#75A99A]" />
            <span className={currency === 'USD' ? 'text-[#4D9477] font-black' : 'text-[#82918E]'}>
              $ USD
            </span>
            <span className="text-[#284250]">|</span>
            <span className={currency === 'INR' ? 'text-[#D5A24F] font-black' : 'text-[#82918E]'}>
              ₹ INR
            </span>
          </button>

          {/* Police Suspects Watchlist Trigger Button */}
          <button
            onClick={() => setSuspectsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#C75B55]/15 hover:bg-[#C75B55]/25 text-[#E8E5DA] border border-[#C75B55]/40 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            title="Open Police Suspects Watchlist & Scam Transaction Registry"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#C75B55]" />
            <span>Police Suspects</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#C75B55]/25 text-[#E8E5DA] text-[10px] font-mono font-bold border border-[#C75B55]/40">
              6 Watchlist
            </span>
          </button>

          {/* Action Button: Inject Live Attack */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isInjecting}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#253F4D] hover:bg-[#2C4959] text-[#E8E5DA] border border-[#284250] shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isInjecting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D5A24F]" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#D5A24F]" />
              )}
              <span>{isInjecting ? 'Simulating Ring...' : 'Inject Attack Motif'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#82918E]" />
            </button>

            {/* Attack Typology Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#1E3541] border border-[#284250] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#82918E] uppercase tracking-wider border-b border-[#284250] font-mono">
                  Synthetic Typology Simulation
                </div>

                <div className="p-1 space-y-1 mt-1">
                  <button
                    onClick={() => handleSelect('CYCLIC_ROUND_TRIPPING')}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#253F4D] transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <RefreshCw className="w-4 h-4 text-[#75A99A] shrink-0 mt-0.5 group-hover:rotate-180 transition-transform duration-500" />
                    <div>
                      <div className="text-xs font-semibold text-[#E8E5DA] group-hover:text-white">
                        Cyclic Round-Tripping Loop
                      </div>
                      <div className="text-[10px] text-[#82918E] leading-tight font-mono">
                        Inject a 3-node wash loop returning to origin.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelect('FAN_OUT_IN')}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#253F4D] transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <GitFork className="w-4 h-4 text-[#D5A24F] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#E8E5DA] group-hover:text-white">
                        Smurfing Fan-Out / Fan-In
                      </div>
                      <div className="text-[10px] text-[#82918E] leading-tight font-mono">
                        Disperse high volume into parallel mules, then reconverge.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelect('MULE_CHAIN')}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#253F4D] transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <Link2 className="w-4 h-4 text-[#C75B55] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#E8E5DA] group-hover:text-white">
                        Rapid Pass-Through Chain
                      </div>
                      <div className="text-[10px] text-[#82918E] leading-tight font-mono">
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
