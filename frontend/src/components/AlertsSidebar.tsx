import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, FileText, ChevronRight, Filter } from 'lucide-react';
import { ClusterAnalysisResult, DetectedAlert } from '../types';

interface AlertsSidebarProps {
  analysis: ClusterAnalysisResult | null;
  selectedAlert: DetectedAlert | null;
  onSelectAlert: (alert: DetectedAlert) => void;
  onOpenSAR: (alert: DetectedAlert) => void;
  onClearFilter: () => void;
}

export const AlertsSidebar: React.FC<AlertsSidebarProps> = ({
  analysis,
  selectedAlert,
  onSelectAlert,
  onOpenSAR,
  onClearFilter,
}) => {
  const [filterTypology, setFilterTypology] = useState<string>('ALL');

  if (!analysis) {
    return (
      <div className="w-96 border-r border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-500 font-mono">
        Running graph topology detection algorithms...
      </div>
    );
  }

  const alerts = analysis.top_alerts.filter((a) => {
    if (filterTypology === 'ALL') return true;
    return a.typology === filterTypology;
  });

  const getTypologyBadge = (typology: string) => {
    switch (typology) {
      case 'SMURFING':
        return (
          <span className="bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
            SMURFING / FAN-OUT
          </span>
        );
      case 'ROUNDTRIP_CYCLE':
        return (
          <span className="bg-rose-950/80 text-rose-400 border border-rose-800/60 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
            WASHING LOOP CYCLE
          </span>
        );
      case 'MULE_CHAIN':
        return (
          <span className="bg-purple-950/80 text-purple-400 border border-purple-800/60 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
            MULE CONDUIT
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
            {typology}
          </span>
        );
    }
  };

  return (
    <div className="w-96 border-r border-slate-800 bg-slate-900/40 flex flex-col h-[calc(100vh-73px)]">
      {/* Header and Filter */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-slate-200">Suspicious Clusters</h2>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono">
              {analysis.total_alerts}
            </span>
          </div>
          {selectedAlert && (
            <button
              onClick={onClearFilter}
              className="text-[11px] text-cyan-400 hover:underline font-mono"
            >
              Reset Canvas
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
          {['ALL', 'SMURFING', 'ROUNDTRIP_CYCLE', 'MULE_CHAIN'].map((typ) => (
            <button
              key={typ}
              onClick={() => setFilterTypology(typ)}
              className={`px-2.5 py-1 rounded-md transition font-medium whitespace-nowrap ${
                filterTypology === typ
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {typ === 'ALL'
                ? `All (${analysis.total_alerts})`
                : typ === 'ROUNDTRIP_CYCLE'
                ? `Cycles (${analysis.alerts_by_typology['ROUNDTRIP_CYCLE'] || 0})`
                : typ === 'SMURFING'
                ? `Smurfing (${analysis.alerts_by_typology['SMURFING'] || 0})`
                : `Mules (${analysis.alerts_by_typology['MULE_CHAIN'] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
        {alerts.map((alert) => {
          const isSelected = selectedAlert?.alert_id === alert.alert_id;
          return (
            <div
              key={alert.alert_id}
              onClick={() => onSelectAlert(alert)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {getTypologyBadge(alert.typology)}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-mono text-slate-400">Risk:</span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      alert.risk_score >= 0.85
                        ? 'text-rose-400'
                        : alert.risk_score >= 0.70
                        ? 'text-amber-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {(alert.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 font-mono flex items-center justify-between mb-1.5">
                <span className="text-slate-400">Total Volume:</span>
                <span className="font-semibold text-slate-100">
                  ${alert.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between mb-3">
                <span>{alert.involved_accounts.length} entities involved</span>
                <span>{(alert.time_span_seconds / 3600).toFixed(1)}h duration</span>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-[11px] text-cyan-400 font-mono group-hover:underline flex items-center">
                  <span>Isolate on Graph</span>
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSAR(alert);
                  }}
                  className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] font-medium border border-slate-700 transition"
                >
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span>Generate SAR</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

