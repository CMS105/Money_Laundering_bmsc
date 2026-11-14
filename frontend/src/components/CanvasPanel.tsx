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
    // Topology-specific layout coordinate calculation with generous clearance
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
      } else if (typology === 'MULE_CHAIN') {
        const spacing = 380;
        x = 80 + index * spacing;
        y = 240 + (index % 2 === 1 ? 80 : -40);
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
      },
      style: {
        opacity: idx + 1 <= currentStep ? 1 : 0.2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: idx + 1 <= currentStep ? '#75A99A' : '#4D6877',
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
      <main className="flex-1 min-h-0 w-full h-full min-h-[500px] flex items-center justify-center bg-[#12222A] text-[#82918E]">
        <div className="text-center space-y-2">
          <Network className="w-10 h-10 mx-auto text-[#75A99A]/50 animate-pulse" />
          <p className="text-sm font-medium font-mono text-[#82918E]">Select a cluster from the left panel to inspect graph topology</p>
        </div>
      </main>
    );
  }

  const meta = getTypologyMeta(cluster.typology);
  const currentEdge = cluster.edges[currentStep - 1] || cluster.edges[0];

  return (
    <main className="flex-1 min-h-0 relative w-full h-full min-h-[500px] bg-[#12222A] flex flex-col overflow-hidden">
      {/* Top Architectural Command Pill */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Active Cluster Pill */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#1E3541]/95 border border-[#284250] shadow-[0_12px_28px_rgba(18,34,42,0.8),inset_0_1px_0_0_rgba(232,229,218,0.1)] backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-[#E8E5DA]">
              {cluster.cluster_id}
            </span>
            <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${meta.bgBadge}`}>
              {meta.label}
            </span>
          </div>

          <div className="h-3 w-px bg-[#284250]" />

          <div className="text-xs font-mono font-bold text-[#E8E5DA] tabular-nums">
            {formatAmount(cluster.total_volume, true)}
          </div>

          <div className="h-3 w-px bg-[#284250]" />

          <div className="text-[10px] text-[#82918E] font-mono tabular-nums">
            {cluster.nodes.length} Nodes · {cluster.edges.length} Hops
          </div>
        </div>

        {/* Legend */}
        <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#1E3541]/95 border border-[#284250] shadow-[0_12px_28px_rgba(18,34,42,0.8),inset_0_1px_0_0_rgba(232,229,218,0.1)] backdrop-blur-xl text-[11px] text-[#E8E5DA]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4D9477] shadow-[0_0_6px_rgba(77,148,119,0.7)]" />
            <span className="text-[10px] font-mono text-[#E8E5DA]">Origin / Entry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D5A24F] shadow-[0_0_6px_rgba(213,162,79,0.7)]" />
            <span className="text-[10px] font-mono text-[#E8E5DA]">Mule Conduit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C75B55] shadow-[0_0_6px_rgba(199,91,85,0.7)]" />
            <span className="text-[10px] font-mono text-[#E8E5DA]">Sink / Exit</span>
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
          className="bg-[#12222A]"
          style={{ width: '100%', height: '100%' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.2}
            color="rgba(117, 169, 154, 0.12)"
          />
          <Controls
            className="!bg-[#1E3541] !border-[#284250] !rounded-lg !shadow-2xl overflow-hidden [&>button]:!bg-[#1E3541] [&>button]:!border-[#284250] [&>button]:!fill-[#E8E5DA] hover:[&>button]:!bg-[#253F4D]"
          />
          <MiniMap
            nodeColor={(node) => {
              const role = (node.data?.role as string) || '';
              if (role === 'entry') return '#4D9477';
              if (role === 'exit') return '#C75B55';
              return '#D5A24F';
            }}
            maskColor="rgba(18, 34, 42, 0.85)"
            className="!bg-[#1E3541] !border !border-[#284250] !rounded-lg overflow-hidden !shadow-2xl"
          />
        </ReactFlow>
      </div>

      {/* Floating Glassmorphic Temporal Scrubber Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-xl pointer-events-auto">
        <div className="rounded-xl p-2.5 bg-[#1E3541]/95 border border-[#284250] shadow-[0_20px_50px_rgba(18,34,42,0.85),inset_0_1px_0_0_rgba(232,229,218,0.12)] backdrop-blur-2xl space-y-2">
          {/* Top Scrubber Row: Controls + Timestamp Info */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentStep(1)}
                className="p-1.5 rounded-md hover:bg-[#253F4D] text-[#82918E] hover:text-[#E8E5DA] transition-colors cursor-pointer"
                title="Reset to Step 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-md hover:bg-[#253F4D] text-[#82918E] hover:text-[#E8E5DA] transition-colors cursor-pointer"
                title="Previous Hop"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-md bg-[#75A99A] text-[#172B35] font-bold hover:bg-[#8BBDB0] transition-colors cursor-pointer shadow-sm"
                title={isPlaying ? 'Pause Playback' : 'Replay Money Trail'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                className="p-1.5 rounded-md hover:bg-[#253F4D] text-[#82918E] hover:text-[#E8E5DA] transition-colors cursor-pointer"
                title="Next Hop"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Step Readout */}
            <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-[#E8E5DA]">
              <span className="font-bold text-[#E8E5DA]">
                Step {currentStep} / {totalSteps}
              </span>
              <span className="text-[#82918E]">·</span>
              <div className="flex items-center gap-1 text-[#82918E]">
                <Clock className="w-3 h-3 text-[#D5A24F]" />
                <span>
                  {currentEdge ? `${currentEdge.hop_delay_mins.toFixed(1)}m transit` : '0m'}
                </span>
              </div>
            </div>

            {/* Amount at Current Hop */}
            <div className="text-[11px] font-mono font-bold text-[#4D9477] tabular-nums">
              {currentEdge ? formatAmount(currentEdge.amount, true) : '$0'}
            </div>
          </div>

          {/* Scrubber Range Track with Precision Ticks */}
          <div className="relative pt-1">
            <input
              type="range"
              min={1}
              max={totalSteps}
              step={1}
              value={currentStep}
              onChange={(e) => setCurrentStep(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#253F4D] rounded-lg appearance-none cursor-pointer accent-[#75A99A]"
            />
            {/* Precision Tick Marks */}
            <div className="flex justify-between px-1 pt-1 text-[8px] font-mono text-[#82918E]">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={i + 1 <= currentStep ? 'text-[#E8E5DA] font-bold' : ''}
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
