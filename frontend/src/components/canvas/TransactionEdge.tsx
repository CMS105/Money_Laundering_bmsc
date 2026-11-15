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
  currency?: string;
  amount_formatted?: string;
  flag?: string;
  spread_anomaly?: string;
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
  const customAmountFormatted = edgeData.amount_formatted;
  const flag = edgeData.flag;
  const currency = edgeData.currency;

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
          className="nodrag nopan z-10 flex flex-col items-center gap-0.5 rounded border border-white/[0.1] bg-[#0C0C0E]/95 px-2 py-1 shadow-md backdrop-blur-md hover:border-white/25 hover:scale-105 transition-all cursor-default select-none max-w-[200px]"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FAFAFA] font-mono tabular-nums">
            <span className="text-emerald-400 font-bold">
              {customAmountFormatted || formatAmount(amount, true)}
            </span>
            <span className="text-[8px] font-medium text-[#71717A] px-1 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] truncate max-w-[70px]">
              {paymentFormat}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-[#71717A] font-mono tabular-nums">
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              {delay.toFixed(1)}m transit
            </span>
            {currency && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                {currency}
              </span>
            )}
          </div>
          {flag && (
            <div className="text-[8px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded text-center truncate w-full mt-0.5">
              ⚠️ {flag}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(TransactionEdge);
