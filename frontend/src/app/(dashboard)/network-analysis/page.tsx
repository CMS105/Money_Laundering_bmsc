'use client';

import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface NetworkAnalysisData {
  graph_metrics: {
    node_count: number;
    edge_count: number;
    average_degree: number;
    graph_density: number;
    clustering_coefficient: number;
    number_of_communities: number;
    diameter: number;
    strongly_connected_components: number;
  };
  top_centrality_nodes: Array<{
    account_id: string;
    name: string;
    betweenness_centrality: number;
    pagerank: number;
    in_degree: number;
    out_degree: number;
    community_id: number;
    role: string;
    risk_score: number;
  }>;
  communities: Array<{
    id: number;
    name: string;
    size: number;
    risk_level: string;
    total_volume_usd: number;
  }>;
}

const FALLBACK_NETWORK: NetworkAnalysisData = {
  graph_metrics: {
    node_count: 684,
    edge_count: 3120,
    average_degree: 9.12,
    graph_density: 0.0133,
    clustering_coefficient: 0.384,
    number_of_communities: 14,
    diameter: 7,
    strongly_connected_components: 9,
  },
  top_centrality_nodes: [
    {
      account_id: '020_ACC_8819',
      name: 'Global Horizon Trade Ltd',
      betweenness_centrality: 0.184,
      pagerank: 0.048,
      in_degree: 24,
      out_degree: 19,
      community_id: 1,
      role: 'Global Core Hub / Choke-Point',
      risk_score: 98.4,
    },
    {
      account_id: '070_ACC_3301',
      name: 'Al-Bahr Capital Commodities',
      betweenness_centrality: 0.162,
      pagerank: 0.042,
      in_degree: 18,
      out_degree: 12,
      community_id: 1,
      role: 'Conduit Choke-Point',
      risk_score: 96.2,
    },
    {
      account_id: '070_ACC_9921',
      name: 'Zenith International Holdings',
      betweenness_centrality: 0.141,
      pagerank: 0.039,
      in_degree: 22,
      out_degree: 3,
      community_id: 1,
      role: 'Capital Sink',
      risk_score: 94.8,
    },
    {
      account_id: '010_ACC_4118',
      name: 'Rohan J. Mehta (Mule)',
      betweenness_centrality: 0.129,
      pagerank: 0.035,
      in_degree: 28,
      out_degree: 2,
      community_id: 2,
      role: 'Smurf Collector Funnel',
      risk_score: 92.1,
    },
    {
      account_id: '010_ACC_5502',
      name: 'Vikas Silver Bullion',
      betweenness_centrality: 0.118,
      pagerank: 0.031,
      in_degree: 14,
      out_degree: 11,
      community_id: 3,
      role: 'Asset Liquidation Node',
      risk_score: 95.1,
    },
  ],
  communities: [
    { id: 1, name: 'Dubai-US Offshore Round-Tripping Ring', size: 42, risk_level: 'CRITICAL', total_volume_usd: 24800000.0 },
    { id: 2, name: 'Mumbai Cyber Digital Arrest Smurf Syndicate', size: 36, risk_level: 'CRITICAL', total_volume_usd: 18450000.0 },
    { id: 3, name: 'Zaveri Bazaar Bullion Physical Layering Ring', size: 18, risk_level: 'CRITICAL', total_volume_usd: 6200000.0 },
    { id: 4, name: 'European VAT Cross-Border Cargo Network', size: 24, risk_level: 'HIGH', total_volume_usd: 12500000.0 },
    { id: 5, name: 'Hong Kong Trade Mirror-Invoicing Shells', size: 29, risk_level: 'HIGH', total_volume_usd: 15800000.0 },
  ],
};

export default function NetworkAnalysisPage() {
  const { formatAmount } = useCurrency();
  const [data, setData] = useState<NetworkAnalysisData>(FALLBACK_NETWORK);

  useEffect(() => {
    fetch('/api/v1/network-analysis')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.graph_metrics) setData(json);
      })
      .catch(() => {});
  }, []);

  const gm = data.graph_metrics;

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#FAFAFA] tracking-wide uppercase">
              Network Science &amp; Graph Topology Engine
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAFAFA]/15 text-[#FAFAFA] border border-[#FAFAFA]/30">
              NetworkX Digraph
            </span>
          </div>
          <p className="text-xs text-[#71717A] font-mono mt-1">
            Betweenness centrality choke-points · Louvain modularity communities · Temporal cycle detection
          </p>
        </div>
      </div>

      {/* Graph Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">Nodes</p>
          <p className="text-lg font-black text-[#FAFAFA] font-mono mt-0.5">{gm.node_count}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">Edges</p>
          <p className="text-lg font-black text-[#FAFAFA] font-mono mt-0.5">{gm.edge_count}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">Avg Degree</p>
          <p className="text-lg font-black text-[#FAFAFA] font-mono mt-0.5">{gm.average_degree}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">Density</p>
          <p className="text-lg font-black text-[#FAFAFA] font-mono mt-0.5">{gm.graph_density}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">Clustering Coeff</p>
          <p className="text-lg font-black text-[#10B981] font-mono mt-0.5">{gm.clustering_coefficient}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">Communities</p>
          <p className="text-lg font-black text-[#F59E0B] font-mono mt-0.5">{gm.number_of_communities}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">Diameter</p>
          <p className="text-lg font-black text-[#FAFAFA] font-mono mt-0.5">{gm.diameter}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111114] border border-[#27272A] text-center">
          <p className="text-[10px] text-[#71717A] font-mono uppercase">SCC Components</p>
          <p className="text-lg font-black text-[#EF4444] font-mono mt-0.5">{gm.strongly_connected_components}</p>
        </div>
      </div>

      {/* Centrality Choke-Points Table */}
      <div className="p-5 rounded-md bg-[#111114] border border-[#27272A] shadow-sm">
        <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wide mb-1">
          Top Betweenness Centrality Choke-Points &amp; Hub Nodes
        </h2>
        <p className="text-xs text-[#71717A] font-mono mb-4">
          Nodes bridging disconnected banking components—critical points for transaction intercept
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A] text-[10px] uppercase">
                <th className="pb-2.5">Account ID</th>
                <th className="pb-2.5">Entity Name</th>
                <th className="pb-2.5">Betweenness Centrality</th>
                <th className="pb-2.5">PageRank</th>
                <th className="pb-2.5">Degree (In / Out)</th>
                <th className="pb-2.5">Topological Role</th>
                <th className="pb-2.5 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {data.top_centrality_nodes.map((node) => (
                <tr key={node.account_id} className="hover:bg-[#18181B]/50 transition-colors">
                  <td className="py-3 font-bold text-[#FAFAFA]">
                    {node.account_id}
                  </td>
                  <td className="py-3 font-bold text-[#FAFAFA]">
                    {node.name}
                  </td>
                  <td className="py-3 font-bold text-[#F59E0B] tabular-nums">
                    {node.betweenness_centrality.toFixed(4)}
                  </td>
                  <td className="py-3 text-[#10B981] tabular-nums">
                    {node.pagerank.toFixed(4)}
                  </td>
                  <td className="py-3 text-[#71717A]">
                    In: {node.in_degree} | Out: {node.out_degree}
                  </td>
                  <td className="py-3 text-[#FAFAFA]">
                    {node.role}
                  </td>
                  <td className="py-3 text-right font-bold text-[#EF4444]">
                    {node.risk_score.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Communities Table */}
      <div className="p-5 rounded-md bg-[#111114] border border-[#27272A] shadow-sm">
        <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wide mb-1">
          Louvain Modularity Communities &amp; Laundering Rings
        </h2>
        <p className="text-xs text-[#71717A] font-mono mb-4">
          Isolated subgraphs with dense internal connectivity and high reciprocal flow
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.communities.map((comm) => (
            <div key={comm.id} className="p-4 rounded-lg bg-[#09090B] border border-[#27272A] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FAFAFA] font-bold">Community #{comm.id}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    comm.risk_level === 'CRITICAL'
                      ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                      : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                  }`}
                >
                  {comm.risk_level}
                </span>
              </div>
              <p className="text-xs font-bold text-[#FAFAFA]">{comm.name}</p>
              <div className="flex items-center justify-between text-xs font-mono text-[#71717A] pt-1 border-t border-[#27272A]">
                <span>{comm.size} Entities</span>
                <span className="text-[#FAFAFA] font-bold">{formatAmount(comm.total_volume_usd)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
