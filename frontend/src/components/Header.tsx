import React from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw, BarChart2 } from 'lucide-react';
import { DatasetSummary } from '../types';

interface HeaderProps {
  summary: DatasetSummary | null;
  onRefresh: () => void;
  isLoading: boolean;
  activeView: 'graph' | 'benchmark';
  setActiveView: (view: 'graph' | 'benchmark') => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  onRefresh,
  isLoading,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              GraphSleuth-AML
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
              BUILD BEYOND '26
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Temporal Graph Intelligence for Layered Money Laundering Ring Detection
          </p>
        </div>
      </div>

      {summary && (
        <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-300">
          <div className="flex flex-col">
            <span className="text-slate-500 font-mono uppercase tracking-wider">Total Flow</span>
            <span className="font-semibold text-slate-200">
              ${summary.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-500 font-mono uppercase tracking-wider">Accounts</span>
            <span className="font-semibold text-slate-200">{summary.total_accounts} nodes</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-500 font-mono uppercase tracking-wider">Laundering Ratio</span>
            <span className="font-semibold text-rose-400">
              {(summary.laundering_ratio * 100).toFixed(1)}% ({summary.laundering_transactions} txs)
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center">
          <button
            onClick={() => setActiveView('graph')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'graph'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Graph Canvas</span>
          </button>
          <button
            onClick={() => setActiveView('benchmark')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'benchmark'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Baseline Benchmark</span>
          </button>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Regenerate Dataset</span>
        </button>
      </div>
    </header>
  );
};

