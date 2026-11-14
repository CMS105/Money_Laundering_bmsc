'use client';

import React, { useState } from 'react';
import {
  Search,
  Clock,
  Layers,
  Flame,
  ArrowRight,
  Eye,
  FileSearch,
} from 'lucide-react';
import { AlertCluster } from '../types';
import { formatINR, getTypologyMeta } from '../lib/formatters';
import SpatialCard from './SpatialCard';

interface ClusterListPanelProps {
  alerts: AlertCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (cluster: AlertCluster) => void;
  isLoading?: boolean;
}

export default function ClusterListPanel({
  alerts,
  selectedClusterId,
  onSelectCluster,
}: ClusterListPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTypology, setFilterTypology] = useState<string>('ALL');

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.cluster_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.typology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.entry_node.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.exit_node.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterTypology === 'ALL' || alert.typology === filterTypology;

    return matchesSearch && matchesFilter;
  });

  return (
    <aside className="w-80 2xl:w-96 flex flex-col bg-[#0E1016]/90 border-r border-white/[0.07] backdrop-blur-2xl h-full shrink-0 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="p-3.5 border-b border-white/[0.07] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-300" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Suspicious Clusters
            </h2>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08] tabular-nums">
            {filteredAlerts.length} Ranked
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by account, cluster ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#08090D] border border-white/[0.08] rounded-lg pl-8 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/30 transition-colors"
          />
          <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-600">
            /
          </span>
        </div>

        {/* Typology Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
          {['ALL', 'CYCLIC_ROUND_TRIPPING', 'FAN_OUT_IN', 'MULE_CHAIN'].map((typologyKey) => {
            const isActive = filterTypology === typologyKey;
            const label =
              typologyKey === 'ALL'
                ? 'All'
                : typologyKey === 'CYCLIC_ROUND_TRIPPING'
                ? 'Cycle'
                : typologyKey === 'FAN_OUT_IN'
                ? 'Smurfing'
                : 'Mule Relay';

            return (
              <button
                key={typologyKey}
                onClick={() => setFilterTypology(typologyKey)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.12] text-white border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk-Ranked SpatialCard Cluster List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-xs font-mono">
            No clusters match the search filters.
          </div>
        ) : (
          filteredAlerts.map((cluster, index) => {
            const isSelected = cluster.cluster_id === selectedClusterId;
            const meta = getTypologyMeta(cluster.typology);
            const isCritical = cluster.risk_score >= 90;
            const mlProb = cluster.ml_probability || 0.95;

            return (
              <SpatialCard
                key={cluster.cluster_id}
                onClick={() => onSelectCluster(cluster)}
                selected={isSelected}
                tiltIntensity={2.5}
                className="cursor-pointer p-3.5 group"
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}

                {/* Top Row: Cluster ID & Risk Score Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 tabular-nums">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#F8FAFC] tracking-wide">
                      {cluster.cluster_id}
                    </span>
                    {cluster.cluster_id.includes('LIVE') && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Risk Score Pill */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold tabular-nums ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{cluster.risk_score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Typology Badge & ML Probability Micro-bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.bgBadge}`}>
                    {meta.label}
                  </span>

                  {/* Supervised ML probability readout */}
                  <span className="text-[10px] font-mono font-medium text-emerald-400/90 tabular-nums">
                    ML {Math.round(mlProb * 100)}% Conf
                  </span>
                </div>

                {/* Stats Row: Total Volume & Dwell Time */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-white/[0.06] tabular-nums">
                  <div>
                    <span className="text-[#8B95A5] text-[10px] block">Volume Laundered</span>
                    <span className="font-semibold text-slate-100">
                      {formatINR(cluster.total_volume)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8B95A5] text-[10px] block">Dwell Time</span>
                    <div className="flex items-center gap-1 font-semibold text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{cluster.dwell_time_mins.toFixed(0)}m</span>
                    </div>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="truncate max-w-[110px]" title={cluster.entry_node}>
                    {cluster.entry_node}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="truncate max-w-[110px]" title={cluster.exit_node}>
                    {cluster.exit_node}
                  </span>
                </div>

                {/* Tactile Isolate & Inspect Triggers */}
                <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium">
                    <Eye className="w-3 h-3" />
                    <span>Focus Subgraph</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <FileSearch className="w-3 h-3" />
                    <span>View Dossier</span>
                  </div>
                </div>
              </SpatialCard>
            );
          })
        )}
      </div>
    </aside>
  );
}
