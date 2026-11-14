'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from '@xyflow/react';
import { Clock } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

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
  const { formatAmount } = useCurrency();
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
  const paymentFormat = edgeData.payment_format || 'Wire';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: '#64748B',
          opacity: 0.8,
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
          className="nodrag nopan z-10 flex flex-col items-center gap-0.5 rounded-lg border border-white/[0.12] bg-[#0E1016]/95 px-2.5 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-xl hover:border-white/30 hover:scale-105 transition-all cursor-default select-none"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F8FAFC] font-mono tabular-nums">
            <span>{formatAmount(amount, true)}</span>
            <span className="text-[9px] font-medium text-slate-400 px-1 py-0.2 rounded bg-white/[0.06] border border-white/[0.08]">
              {paymentFormat}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#8B95A5] font-mono tabular-nums">
            <Clock className="w-2.5 h-2.5 text-amber-400" />
            <span>{delay.toFixed(1)}m transit</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(TransactionEdge);
