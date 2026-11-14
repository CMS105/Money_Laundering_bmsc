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
          strokeWidth: 1.5,
          stroke: '#52525B',
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
          className="nodrag nopan z-10 flex flex-col items-center gap-0.5 rounded border border-white/[0.1] bg-[#0C0C0E]/95 px-2 py-0.5 shadow-md backdrop-blur-md hover:border-white/25 hover:scale-105 transition-all cursor-default select-none"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FAFAFA] font-mono tabular-nums">
            <span>{formatAmount(amount, true)}</span>
            <span className="text-[8px] font-medium text-[#71717A] px-1 py-0.1 rounded bg-white/[0.04] border border-white/[0.06]">
              {paymentFormat}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-[#71717A] font-mono tabular-nums">
            <Clock className="w-2.5 h-2.5 text-amber-400" />
            <span>{delay.toFixed(1)}m transit</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(TransactionEdge);
