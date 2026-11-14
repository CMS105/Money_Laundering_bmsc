import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DetectedAlert } from '../types';

interface GraphCanvasProps {
  graphData: { nodes: any[]; edges: any[] } | null;
  selectedAlert: DetectedAlert | null;
  timeFilterTimestamp?: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  selectedAlert,
  timeFilterTimestamp,
}) => {
  if (!graphData) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm bg-slate-950">
        Loading transaction graph topology...
      </div>
    );
  }

  // Filter edges if temporal slider is active
  const filteredEdges = useMemo(() => {
    let edges = graphData.edges;
    if (timeFilterTimestamp !== undefined && timeFilterTimestamp > 0) {
      edges = edges.filter((e) => (e.data?.timestamp || 0) <= timeFilterTimestamp);
    }
    return edges.map((e) => {
      const isLaundering = e.data?.is_laundering;
      let strokeColor = '#475569'; // default slate-600
      if (isLaundering) {
        if (e.data?.typology === 'SMURFING') strokeColor = '#f59e0b'; // amber
        else if (e.data?.typology === 'ROUNDTRIP_CYCLE') strokeColor = '#f43f5e'; // rose
        else if (e.data?.typology === 'MULE_CHAIN') strokeColor = '#a855f7'; // purple
      }

      return {
        ...e,
        style: {
          stroke: strokeColor,
          strokeWidth: isLaundering ? 2.5 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 15,
          height: 15,
        },
      };
    });
  }, [graphData.edges, timeFilterTimestamp]);

  // Style nodes
  const styledNodes = useMemo(() => {
    const suspectSet = new Set(selectedAlert ? selectedAlert.involved_accounts : []);

    return graphData.nodes.map((n) => {
      const isSuspect = suspectSet.has(n.id);
      let border = 'border-slate-700 bg-slate-900 text-slate-200';
      if (isSuspect) {
        border = 'border-rose-500 bg-rose-950/80 text-rose-100 shadow-lg shadow-rose-500/20';
      }

      return {
        ...n,
        style: {
          padding: '8px 12px',
          borderRadius: '8px',
          borderWidth: isSuspect ? '2px' : '1px',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: isSuspect ? 'bold' : 'normal',
        },
        className: border,
      };
    });
  }, [graphData.nodes, selectedAlert]);

  return (
    <div className="flex-1 h-[calc(100vh-73px)] relative bg-slate-950">
      <ReactFlow
        nodes={styledNodes}
        edges={filteredEdges}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
      >
        <Controls className="fill-slate-200" />
        <MiniMap
          nodeStrokeColor="#38bdf8"
          nodeColor="#0f172a"
          maskColor="rgba(3, 7, 18, 0.7)"
          className="rounded-lg shadow-lg"
        />
        <Background color="#1e293b" gap={20} size={1} />
      </ReactFlow>

      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 text-xs space-y-2 shadow-lg pointer-events-auto">
        <span className="font-semibold text-slate-200 font-mono text-[11px] block">
          Topology Flow Legend
        </span>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-rose-500 rounded" />
          <span className="text-rose-400 font-mono text-[11px]">Round-Trip Washing Loop</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-amber-500 rounded" />
          <span className="text-amber-400 font-mono text-[11px]">Smurfing Dispersion / Inflow</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-purple-500 rounded" />
          <span className="text-purple-400 font-mono text-[11px]">Rapid Mule Conduit Chain</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-slate-600 rounded" />
          <span className="text-slate-400 font-mono text-[11px]">Normal Retail Traffic</span>
        </div>
      </div>
    </div>
  );
};

