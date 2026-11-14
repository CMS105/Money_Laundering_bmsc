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
    <aside className="w-80 2xl:w-96 flex flex-col bg-[#1E3541]/95 border-r border-[#284250] backdrop-blur-2xl h-full shrink-0 select-none shadow-[4px_0_24px_rgba(18,34,42,0.6)]">
      {/* Header */}
      <div className="p-3.5 border-b border-[#284250] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#75A99A]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E8E5DA]">
              Suspicious Clusters
            </h2>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#253F4D] text-[#E8E5DA] border border-[#284250] tabular-nums">
            {filteredAlerts.length} Ranked
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#82918E]" />
          <input
            type="text"
            placeholder="Filter by account, cluster ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#172B35] border border-[#284250] rounded-lg pl-8 pr-12 py-1.5 text-xs text-[#E8E5DA] placeholder-[#82918E] focus:outline-none focus:border-[#75A99A]/50 transition-colors font-sans"
          />
          <span className="absolute right-2.5 top-2 text-[10px] font-mono text-[#82918E]">
            /
          </span>
        </div>

        {/* Typology Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] custom-scrollbar">
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
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer text-xs ${
                  isActive
                    ? 'bg-[#75A99A] text-[#172B35] font-semibold shadow-sm'
                    : 'text-[#E8E5DA]/70 hover:text-[#E8E5DA] hover:bg-[#253F4D]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk-Ranked SpatialCard Cluster List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-[#82918E] text-xs font-mono">
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
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#75A99A] rounded-r shadow-[0_0_8px_rgba(117,169,154,0.8)]" />
                )}

                {/* Top Row: Cluster ID & Risk Score Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-semibold text-[#82918E] tabular-nums">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#E8E5DA] tracking-wide">
                      {cluster.cluster_id}
                    </span>
                    {cluster.cluster_id.includes('LIVE') && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#C75B55]/20 text-[#F5C2C0] border border-[#C75B55]/40 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Risk Score Pill */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold tabular-nums ${
                        isCritical
                          ? 'bg-[#C75B55]/15 text-[#F5C2C0] border-[#C75B55]/40'
                          : 'bg-[#D5A24F]/15 text-[#F4D99B] border-[#D5A24F]/40'
                      }`}
                    >
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{cluster.risk_score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Typology Badge & ML Probability Micro-bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-block text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.bgBadge}`}>
                    {meta.label}
                  </span>

                  {/* Supervised ML probability readout */}
                  <span className="text-[10px] font-mono font-medium text-[#75A99A] tabular-nums">
                    ML {Math.round(mlProb * 100)}% Conf
                  </span>
                </div>

                {/* Stats Row: Total Volume & Dwell Time */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-[#284250] tabular-nums">
                  <div>
                    <span className="text-[#82918E] text-[10px] block font-sans">Volume Laundered</span>
                    <span className="font-semibold text-[#E8E5DA]">
                      {formatAmount(cluster.total_volume, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#82918E] text-[10px] block font-sans">Dwell Time</span>
                    <div className="flex items-center gap-1 font-semibold text-[#E8E5DA]">
                      <Clock className="w-3 h-3 text-[#D5A24F]" />
                      <span>{cluster.dwell_time_mins.toFixed(0)}m</span>
                    </div>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="mt-2.5 pt-2 border-t border-[#284250]/60 flex items-center justify-between text-[10px] text-[#82918E] font-mono">
                  <span className="truncate max-w-[110px]" title={cluster.entry_node}>
                    {cluster.entry_node}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#75A99A] shrink-0" />
                  <span className="truncate max-w-[110px]" title={cluster.exit_node}>
                    {cluster.exit_node}
                  </span>
                </div>

                {/* Tactile Isolate & Inspect Triggers */}
                <div className="mt-2 pt-2 border-t border-[#284250]/60 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-[10px] text-[#75A99A] font-medium font-sans">
                    <Eye className="w-3 h-3" />
                    <span>Focus Subgraph</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#82918E] font-mono">
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
