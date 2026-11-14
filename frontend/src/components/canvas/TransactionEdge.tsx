'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from '@xyflow/react';
import { Clock, IndianRupee } from 'lucide-react';
import { formatINR } from '../../lib/formatters';

interface TransactionEdgeData {
  amount: number;
  hop_delay_mins: number;
  timestamp?: string;
  payment_format?: string;
}

const TransactionEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = (data || {}) as unknown as TransactionEdgeData;
  const amount = edgeData.amount ?? 0;
  const delay = edgeData.hop_delay_mins ?? 0;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2.5,
          stroke: '#38bdf8',
          opacity: 0.85,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan z-10 flex flex-col items-center gap-0.5 rounded-lg border border-cyan-500/30 bg-slate-900/90 px-2.5 py-1 shadow-lg backdrop-blur-md hover:border-cyan-400 hover:scale-105 transition-all"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 font-mono">
            <IndianRupee className="w-3 h-3 text-cyan-400" />
            <span>{formatINR(amount)}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <Clock className="w-2.5 h-2.5 text-amber-400" />
            <span>{delay.toFixed(1)}m delay</span>
            {edgeData.payment_format && (
              <span className="text-[9px] text-slate-500 font-sans border-l border-slate-700 pl-1">
                {edgeData.payment_format}
              </span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(TransactionEdge);
