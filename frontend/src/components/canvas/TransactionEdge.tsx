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
          stroke: '#4D6877',
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
          className="nodrag nopan z-10 flex flex-col items-center gap-0.5 rounded-lg border border-[#284250] bg-[#1E3541]/95 px-2.5 py-1 shadow-[0_8px_20px_rgba(18,34,42,0.8),inset_0_1px_0_0_rgba(232,229,218,0.1)] backdrop-blur-xl hover:border-[#75A99A]/50 hover:scale-105 transition-all cursor-default select-none"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E8E5DA] font-mono tabular-nums">
            <span>{formatAmount(amount, true)}</span>
            <span className="text-[9px] font-medium text-[#82918E] px-1 py-0.2 rounded bg-[#253F4D] border border-[#284250]">
              {paymentFormat}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#82918E] font-mono tabular-nums">
            <Clock className="w-2.5 h-2.5 text-[#D5A24F]" />
            <span>{delay.toFixed(1)}m transit</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(TransactionEdge);
