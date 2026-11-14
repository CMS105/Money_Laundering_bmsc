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
import { getTypologyMeta } from '../lib/formatters';
import { useCurrency } from '../context/CurrencyContext';
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
  const { formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTypology, setFilterTypology] = useState<string>('ALL');

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
    <aside className="w-80 2xl:w-88 flex flex-col bg-[#0C0C0E] border-r border-white/[0.07] h-full shrink-0 select-none font-sans">
      {/* Header */}
      <div className="p-3 border-b border-white/[0.07] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
              Suspicious Clusters
            </h2>
          </div>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#18181B] text-zinc-400 border border-white/[0.08] tabular-nums">
            {filteredAlerts.length} Ranked
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Filter by account, cluster ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#09090B] border border-white/[0.08] rounded pl-7 pr-3 py-1 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:outline-none focus:border-white/30 font-mono transition-colors"
          />
        </div>

        {/* Typology Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] font-mono">
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
                className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#18181B] text-white border border-white/20'
                    : 'text-[#71717A] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk-Ranked Cluster List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 text-[#71717A] text-xs font-mono">
            No clusters match filters.
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
                tiltIntensity={1.5}
                className="cursor-pointer p-3 group"
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}

                {/* Top Row: Cluster ID & Risk Score Badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#71717A] tabular-nums">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FAFAFA] tracking-wide">
                      {cluster.cluster_id}
                    </span>
                    {cluster.cluster_id.includes('LIVE') && (
                      <span className="text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Risk Score Pill */}
                  <div
                    className={`flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold tabular-nums ${
                      isCritical
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <Flame className="w-2.5 h-2.5 fill-current" />
                    <span>{cluster.risk_score.toFixed(1)}</span>
                  </div>
                </div>

                {/* Typology Badge & ML Confidence */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#18181B] text-zinc-300 border border-white/[0.08]">
                    {meta.label}
                  </span>

                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                    ML {Math.round(mlProb * 100)}% Conf
                  </span>
                </div>

                {/* Stats Row: Volume & Dwell Time */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-white/[0.06] tabular-nums">
                  <div>
                    <span className="text-[#71717A] block font-sans text-[9px] uppercase">Laundered</span>
                    <span className="font-semibold text-[#FAFAFA]">
                      {formatAmount(cluster.total_volume, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block font-sans text-[9px] uppercase">Dwell Time</span>
                    <div className="flex items-center gap-1 text-zinc-300">
                      <Clock className="w-2.5 h-2.5 text-zinc-400" />
                      <span>{cluster.dwell_time_mins.toFixed(0)}m</span>
                    </div>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="mt-2 pt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[9px] text-[#71717A] font-mono">
                  <span className="truncate max-w-[100px]" title={cluster.entry_node}>
                    {cluster.entry_node}
                  </span>
                  <ArrowRight className="w-2.5 h-2.5 text-zinc-600 shrink-0" />
                  <span className="truncate max-w-[100px]" title={cluster.exit_node}>
                    {cluster.exit_node}
                  </span>
                </div>

                {/* Focus / Dossier Trigger Hints */}
                <div className="mt-1.5 pt-1.5 border-t border-white/[0.04] flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity text-[9px] font-mono">
                  <div className="flex items-center gap-1 text-zinc-300">
                    <Eye className="w-2.5 h-2.5" />
                    <span>Focus Subgraph</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#71717A]">
                    <FileSearch className="w-2.5 h-2.5" />
                    <span>SAR Dossier</span>
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
