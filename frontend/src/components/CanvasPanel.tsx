'use client';

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import { AlertCluster, GraphNode, GraphEdge } from '../types';
import AccountNode from './canvas/AccountNode';
import TransactionEdge from './canvas/TransactionEdge';
import { getTypologyMeta, formatINR } from '../lib/formatters';
import { Maximize2, Shield, Network, Eye } from 'lucide-react';

interface CanvasPanelProps {
  cluster: AlertCluster | null;
}

const nodeTypes = {
  accountNode: AccountNode,
};

const edgeTypes = {
  transactionEdge: TransactionEdge,
};

export default function CanvasPanel({ cluster }: CanvasPanelProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Compute Layout when cluster changes
  useEffect(() => {
    if (!cluster) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const clusterNodes = cluster.nodes;
    const clusterEdges = cluster.edges;
    const typology = cluster.typology;

    // Topology-specific layout coordinate calculation
    const calculatedNodes: Node[] = clusterNodes.map((n, index) => {
      let x = 200;
      let y = 200;

      if (typology === 'CYCLIC_ROUND_TRIPPING') {
        // Circular arrangement
        const total = clusterNodes.length;
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // start from top
        const radius = 175;
        const centerX = 360;
        const centerY = 240;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else if (typology === 'FAN_OUT_IN') {
        // 3-Stage Bipartite / Layered Layout: Entry -> Intermediate Mules -> Exit Consolidator
        const role = (n.role || '').toLowerCase();
        if (role === 'entry') {
          x = 80;
          y = 230;
        } else if (role === 'exit') {
          x = 640;
          y = 230;
        } else {
          // Intermediate mules column
          const muleNodes = clusterNodes.filter(
            (item) => item.role !== 'entry' && item.role !== 'exit'
          );
          const muleIndex = muleNodes.findIndex((m) => m.id === n.id);
          const totalMules = muleNodes.length;
          const spacing = 120;
          const startY = 230 - ((totalMules - 1) * spacing) / 2;
          x = 360;
          y = startY + (muleIndex >= 0 ? muleIndex : index) * spacing;
        }
      } else if (typology === 'MULE_CHAIN') {
        // Sequential Linear Chain (Horizontal Pipeline)
        const total = clusterNodes.length;
        const spacing = 260;
        x = 60 + index * spacing;
        // subtle staggered wave so edges look dynamic
        y = 210 + (index % 2 === 1 ? 50 : -30);
      } else {
        // Generic grid layout
        x = 100 + (index % 3) * 260;
        y = 120 + Math.floor(index / 3) * 180;
      }

      return {
        id: n.id,
        type: 'accountNode',
        position: { x, y },
        data: {
          id: n.id,
          label: n.label,
          role: n.role,
          risk: n.risk,
        },
      };
    });

    const calculatedEdges: Edge[] = clusterEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'transactionEdge',
      animated: true,
      data: {
        amount: e.amount,
        hop_delay_mins: e.hop_delay_mins,
        timestamp: e.timestamp,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: '#38bdf8',
      },
    }));

    setNodes(calculatedNodes);
    setEdges(calculatedEdges);
  }, [cluster, setNodes, setEdges]);

  if (!cluster) {
    return (
      <main className="flex-1 min-h-0 w-full h-full min-h-[500px] flex items-center justify-center bg-slate-950 text-slate-500">
        <div className="text-center space-y-2">
          <Network className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
          <p className="text-sm font-medium">Select a cluster from the left panel to inspect graph</p>
        </div>
      </main>
    );
  }

  const meta = getTypologyMeta(cluster.typology);

  return (
    <main className="flex-1 min-h-0 relative w-full h-full min-h-[500px] bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Canvas Bar: Active Cluster Details & Visual Legend */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Cluster Pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/70 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-black text-cyan-400">
              {cluster.cluster_id}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${meta.bgBadge}`}>
              {meta.label}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-xs font-mono font-bold text-slate-200">
            {formatINR(cluster.total_volume)} Laundered
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-[11px] text-slate-400 font-mono">
            {cluster.nodes.length} Nodes · {cluster.edges.length} Hops
          </div>
        </div>

        {/* Legend */}
        <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/70 shadow-xl backdrop-blur-md text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-300 shadow-sm shadow-cyan-400/50" />
            <span className="font-semibold text-slate-300">Origin / Entry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300 shadow-sm shadow-amber-400/50" />
            <span className="font-semibold text-slate-300">Layering Mule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-300 shadow-sm shadow-rose-400/50" />
            <span className="font-semibold text-slate-300">Exit / Cash-Out</span>
          </div>
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-700">
            <span className="text-cyan-400 font-mono font-bold">⏱️ Hop Latency</span>
          </div>
        </div>
      </div>

      {/* React Flow Interactive Canvas Wrapper */}
      <div
        className="flex-1 min-h-0 w-full h-full min-h-[500px] relative"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.35, duration: 600 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'transactionEdge',
          }}
          className="bg-[#070b14]"
          style={{ width: '100%', height: '100%' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#1e293b"
          />
          <Controls
            className="!bg-slate-900/90 !border-slate-800 !rounded-xl !shadow-2xl overflow-hidden [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!fill-slate-300 hover:[&>button]:!bg-slate-800"
          />
          <MiniMap
            nodeColor={(node) => {
              const role = (node.data?.role as string) || '';
              if (role === 'entry') return '#22d3ee';
              if (role === 'exit') return '#f43f5e';
              return '#fbbf24';
            }}
            maskColor="rgba(15, 23, 42, 0.75)"
            className="!bg-slate-950/80 !border !border-slate-800 !rounded-xl overflow-hidden !shadow-2xl"
          />
        </ReactFlow>
      </div>
    </main>
  );
}
