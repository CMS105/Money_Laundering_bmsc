'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowUpRight, ArrowDownLeft, Shuffle } from 'lucide-react';

interface AccountNodeData {
  id: string;
  label: string;
  role: 'entry' | 'mule' | 'exit' | string;
  risk: number;
}

const AccountNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as AccountNodeData;
  const role = (nodeData.role || 'mule').toLowerCase();

  const getRoleConfig = () => {
    switch (role) {
      case 'entry':
        return {
          badge: 'ORIGIN / ENTRY',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          accentColor: '#10B981',
          icon: <ArrowUpRight className="w-3 h-3 text-emerald-400" />,
        };
      case 'exit':
        return {
          badge: 'SINK / EXIT',
          badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          accentColor: '#EF4444',
          icon: <ArrowDownLeft className="w-3 h-3 text-rose-400" />,
        };
      case 'mule':
      default:
        return {
          badge: 'MULE CONDUIT',
          badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
          accentColor: '#F59E0B',
          icon: <Shuffle className="w-3 h-3 text-amber-400" />,
        };
    }
  };

  const config = getRoleConfig();
  const bankCode = nodeData.id.includes('_') ? nodeData.id.split('_')[0] : 'BNK';

  return (
    <div style={{ perspective: '800px' }} className="relative select-none font-sans">
      <div
        className={`relative min-w-[210px] rounded-md p-3 backdrop-blur-md transition-colors duration-150 ${
          selected
            ? 'bg-[#18181B] border-t border-white/30 border-x border-b border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.9)] ring-1 ring-white/20'
            : 'bg-[#111114] border-t border-white/[0.12] border-x border-b border-white/[0.05] shadow-md hover:border-white/[0.18]'
        }`}
      >
        {/* Top Edge Specular Line */}
        <div className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="in-left"
          className="!w-2 !h-2 !-left-1 !bg-[#FAFAFA] !border !border-[#09090B]"
        />
        <Handle
          type="target"
          position={Position.Top}
          id="in-top"
          className="!w-2 !h-2 !-top-1 !bg-[#FAFAFA] !border !border-[#09090B]"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="out-right"
          className="!w-2 !h-2 !-right-1 !bg-[#FAFAFA] !border !border-[#09090B]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="out-bottom"
          className="!w-2 !h-2 !-bottom-1 !bg-[#FAFAFA] !border !border-[#09090B]"
        />

        {/* Header: Role & Bank Code */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[8px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border ${config.badgeClass}`}>
            {config.badge}
          </span>
          <div className="flex items-center gap-1 font-mono text-[9px] tabular-nums">
            <span className="text-[#71717A] bg-white/[0.04] px-1 py-0.2 rounded border border-white/[0.06]">
              Bank {bankCode}
            </span>
            <span className="font-semibold text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20">
              {nodeData.risk ?? 85}%
            </span>
          </div>
        </div>

        {/* Node Body with Icon */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-[#18181B] border border-white/10 shrink-0">
            {config.icon}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-mono font-bold text-[#FAFAFA] tracking-wide truncate">
              {nodeData.id}
            </div>
            <div className="text-[10px] text-[#71717A] truncate font-sans">
              {nodeData.label || nodeData.id}
            </div>
          </div>
        </div>

        {/* Footer: Surveillance Flag */}
        <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono tabular-nums text-[#71717A]">
          <span>Surveillance</span>
          <span className="font-medium text-zinc-300">
            {nodeData.risk >= 90 ? 'Quarantined' : 'Intercept'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(AccountNode);
