'use client';

import React, { useState } from 'react';
import {
  Search,
  Clock,
  Layers,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { AlertCluster } from '../types';
import { formatINR, getTypologyMeta } from '../lib/formatters';

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
    <aside className="w-80 2xl:w-96 flex flex-col bg-slate-900/70 border-r border-slate-800/80 backdrop-blur-md h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Suspicious Clusters
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {filteredAlerts.length} Ranked
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search cluster, account ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Typology Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          {['ALL', 'CYCLIC_ROUND_TRIPPING', 'FAN_OUT_IN', 'MULE_CHAIN'].map((typologyKey) => {
            const isActive = filterTypology === typologyKey;
            const label =
              typologyKey === 'ALL'
                ? 'All'
                : typologyKey === 'CYCLIC_ROUND_TRIPPING'
                ? 'Cyclic'
                : typologyKey === 'FAN_OUT_IN'
                ? 'Fan-Out'
                : 'Mule Chain';

            return (
              <button
                key={typologyKey}
                onClick={() => setFilterTypology(typologyKey)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk-Ranked Cluster List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No clusters match the search filters.
          </div>
        ) : (
          filteredAlerts.map((cluster, index) => {
            const isSelected = cluster.cluster_id === selectedClusterId;
            const meta = getTypologyMeta(cluster.typology);
            const isCritical = cluster.risk_score >= 90;

            return (
              <div
                key={cluster.cluster_id}
                onClick={() => onSelectCluster(cluster)}
                className={`relative group rounded-xl p-3 border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r" />
                )}

                {/* Top Row: Cluster ID & Risk Score Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-mono font-black text-slate-100 tracking-wide">
                      {cluster.cluster_id}
                    </span>
                    {cluster.cluster_id.includes('LIVE') && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Risk Score Pill */}
                  <div className="flex items-center gap-1.5">
                    {cluster.ml_probability && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30" title="Supervised ML Laundering Probability">
                        ML {(cluster.ml_probability * 100).toFixed(0)}%
                      </span>
                    )}
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                        isCritical
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{cluster.risk_score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Typology Badge */}
                <div className="mb-2">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.bgBadge}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Stats Row: Total Volume & Dwell Time */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/70">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Volume Laundered</span>
                    <span className="font-bold text-cyan-300">
                      {formatINR(cluster.total_volume)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Dwell Time</span>
                    <div className="flex items-center gap-1 font-bold text-slate-200">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{cluster.dwell_time_mins.toFixed(0)}m</span>
                    </div>
                  </div>
                </div>

                {/* Topology quick trail */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    {cluster.nodes.length} nodes · {cluster.edges.length} hops
                  </span>
                  <div className="flex items-center gap-0.5 text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
