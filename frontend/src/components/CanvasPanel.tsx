'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { AlertCluster } from '../types';
import AccountNode from './canvas/AccountNode';
import TransactionEdge from './canvas/TransactionEdge';
import { getTypologyMeta } from '../lib/formatters';
import { useCurrency } from '../context/CurrencyContext';
import {
  Network,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
} from 'lucide-react';

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
  const { formatAmount } = useCurrency();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Temporal Scrubber state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = cluster?.edges?.length || 1;

  // Compute Layout when cluster changes
  useEffect(() => {
    if (!cluster) {
      setNodes([]);
      setEdges([]);
      setCurrentStep(1);
      setIsPlaying(false);
      return;
    }
    const clusterNodes = cluster.nodes;
    const clusterEdges = cluster.edges;
    const typology = cluster.typology;

    const calculatedNodes: Node[] = clusterNodes.map((n, index) => {
      let x = 200;
      let y = 200;

      if (typology === 'CYCLIC_ROUND_TRIPPING') {
        const total = clusterNodes.length;
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const radius = 260;
        const centerX = 480;
        const centerY = 280;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else if (typology === 'FAN_OUT_IN') {
        const role = (n.role || '').toLowerCase();
        if (role === 'entry') {
          x = 60;
          y = 260;
        } else if (role === 'exit') {
          x = 940;
          y = 260;
        } else {
          const muleNodes = clusterNodes.filter(
            (item) => item.role !== 'entry' && item.role !== 'exit'
          );
          const muleIndex = muleNodes.findIndex((m) => m.id === n.id);
          const totalMules = muleNodes.length;
          const spacing = 220;
          const startY = 260 - ((totalMules - 1) * spacing) / 2;
          x = 500;
          y = startY + (muleIndex >= 0 ? muleIndex : index) * spacing;
        }
      } else if (
        typology === 'MULE_CHAIN' ||
        typology === 'CROSS_BORDER_FX' ||
        typology === 'CROSS_BORDER' ||
        typology === 'ASSET_LAUNDERING' ||
        typology === 'ASSET'
      ) {
        const spacing = 350;
        x = 80 + index * spacing;
        y = 240 + (index % 2 === 1 ? 60 : -30);
      } else {
        x = 100 + (index % 3) * 380;
        y = 120 + Math.floor(index / 3) * 240;
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
          currency: n.currency,
          jurisdiction: n.jurisdiction,
          entity_name: n.entity_name,
          bank: n.bank,
          balance: n.balance,
          badge: n.badge,
        },
      };
    });

    const calculatedEdges: Edge[] = clusterEdges.map((e, idx) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'transactionEdge',
      animated: true,
      data: {
        amount: e.amount,
        hop_delay_mins: e.hop_delay_mins,
        timestamp: e.timestamp,
        payment_format: e.payment_format,
        currency: e.currency,
        amount_formatted: e.amount_formatted,
        flag: e.flag,
        spread_anomaly: e.spread_anomaly,
      },
      style: {
        opacity: idx + 1 <= currentStep ? 1 : 0.2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: idx + 1 <= currentStep ? '#FAFAFA' : '#52525B',
      },
    }));

    setNodes(calculatedNodes);
    setEdges(calculatedEdges);
  }, [cluster, currentStep, setNodes, setEdges]);

  // Handle temporal playback timer
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return totalSteps;
          }
          return prev + 1;
        });
      }, 1500);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalSteps]);

  if (!cluster) {
    return (
      <main className="flex-1 min-h-0 w-full h-full min-h-[500px] flex items-center justify-center bg-[#09090B] text-[#71717A]">
        <div className="text-center space-y-2">
          <Network className="w-8 h-8 mx-auto text-zinc-600 animate-pulse" />
          <p className="text-xs font-mono text-[#71717A]">Select a cluster from the ledger to inspect graph topology</p>
        </div>
      </main>
    );
  }

  const meta = getTypologyMeta(cluster.typology);
  const currentEdge = cluster.edges[currentStep - 1] || cluster.edges[0];

  return (
    <main className="flex-1 min-h-0 relative w-full h-full min-h-[500px] bg-[#09090B] flex flex-col overflow-hidden font-sans">
      {/* Top Floating Command Pill */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Active Cluster Pill */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-[#0C0C0E]/95 border border-white/[0.08] shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-[#FAFAFA]">
              {cluster.cluster_id}
            </span>
            <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded bg-[#18181B] text-zinc-300 border border-white/[0.08]">
              {meta.label}
            </span>
          </div>

          <div className="h-3 w-px bg-white/[0.08]" />

          <div className="text-xs font-mono font-semibold text-[#FAFAFA] tabular-nums">
            {formatAmount(cluster.total_volume, true)}
          </div>

          <div className="h-3 w-px bg-white/[0.08]" />

          <div className="text-[10px] text-[#71717A] font-mono tabular-nums">
            {cluster.nodes.length} Nodes · {cluster.edges.length} Hops
          </div>
        </div>

        {/* Legend */}
        <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#0C0C0E]/95 border border-white/[0.08] shadow-lg backdrop-blur-md text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Mule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Sink</span>
          </div>
        </div>
      </div>

      {/* React Flow Interactive Stage */}
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
          className="bg-[#09090B]"
          style={{ width: '100%', height: '100%' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#1F1F23"
          />
          <Controls
            className="!bg-[#0C0C0E] !border-white/[0.08] !rounded-md !shadow-xl overflow-hidden [&>button]:!bg-[#0C0C0E] [&>button]:!border-white/[0.06] [&>button]:!fill-[#FAFAFA] hover:[&>button]:!bg-white/[0.06]"
          />
          <MiniMap
            nodeColor={(node) => {
              const role = (node.data?.role as string) || '';
              if (role === 'entry') return '#10B981';
              if (role === 'exit') return '#EF4444';
              return '#F59E0B';
            }}
            maskColor="rgba(9, 9, 11, 0.85)"
            className="!bg-[#0C0C0E] !border !border-white/[0.08] !rounded-md overflow-hidden !shadow-xl"
          />
        </ReactFlow>
      </div>

      {/* Floating Glassmorphic Temporal Scrubber Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-lg pointer-events-auto">
        <div className="rounded-md p-2.5 backdrop-blur-md bg-zinc-950/80 border border-white/10 shadow-2xl space-y-2">
          {/* Top Scrubber Row: Controls + Timestamp Info */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentStep(1)}
                className="p-1 rounded hover:bg-white/[0.06] text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
                title="Reset to Step 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="p-1 rounded hover:bg-white/[0.06] text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
                title="Previous Hop"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded bg-[#FAFAFA] text-[#09090B] font-semibold hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
                title={isPlaying ? 'Pause' : 'Replay Trail'}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                className="p-1 rounded hover:bg-white/[0.06] text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
                title="Next Hop"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Step Readout */}
            <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-zinc-300">
              <span className="font-semibold text-white">
                Step {currentStep} / {totalSteps}
              </span>
              <span className="text-[#52525B]">·</span>
              <div className="flex items-center gap-1 text-[#71717A]">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>
                  {currentEdge ? `${currentEdge.hop_delay_mins.toFixed(1)}m transit` : '0m'}
                </span>
              </div>
            </div>

            {/* Amount at Current Hop */}
            <div className="text-[11px] font-mono font-bold text-white tabular-nums">
              {currentEdge ? formatAmount(currentEdge.amount, true) : '$0'}
            </div>
          </div>

          {/* Scrubber Range Track with Precision Ticks */}
          <div className="relative pt-0.5">
            <input
              type="range"
              min={1}
              max={totalSteps}
              step={1}
              value={currentStep}
              onChange={(e) => setCurrentStep(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-[#27272A] rounded appearance-none cursor-pointer accent-[#FAFAFA]"
            />
            {/* Precision Tick Marks */}
            <div className="flex justify-between px-0.5 pt-1 text-[8px] font-mono text-[#52525B]">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={i + 1 <= currentStep ? 'text-zinc-300 font-semibold' : ''}
                >
                  T{i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
