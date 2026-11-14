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
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          accentColor: '#10B981',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'exit':
        return {
          badge: 'SINK / EXIT',
          badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          accentColor: '#EF4444',
          icon: <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'mule':
      default:
        return {
          badge: 'MULE CONDUIT',
          badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          accentColor: '#F59E0B',
          icon: <Shuffle className="w-3.5 h-3.5 text-amber-400" />,
        };
    }
  };

  const config = getRoleConfig();
  const bankCode = nodeData.id.includes('_') ? nodeData.id.split('_')[0] : 'BNK';

  return (
    <div
      style={{ perspective: '800px' }}
      className="relative select-none"
    >
      <div
        className={`relative min-w-[220px] rounded-xl p-3.5 backdrop-blur-2xl transition-all duration-200 border ${
          selected
            ? 'border-white/40 bg-[#161B29] shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.25)] ring-2 ring-white/20'
            : 'border-white/[0.08] bg-[#0E1016]/95 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:border-white/[0.18]'
        }`}
      >
        {/* Top Edge Specular Line */}
        <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="in-left"
          className="!w-2.5 !h-2.5 !-left-1.5 !bg-[#F8FAFC] !border !border-slate-900 !shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
        <Handle
          type="target"
          position={Position.Top}
          id="in-top"
          className="!w-2.5 !h-2.5 !-top-1.5 !bg-[#F8FAFC] !border !border-slate-900 !shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="out-right"
          className="!w-2.5 !h-2.5 !-right-1.5 !bg-[#10B981] !border !border-slate-900 !shadow-[0_0_8px_rgba(16,185,129,0.8)]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="out-bottom"
          className="!w-2.5 !h-2.5 !-bottom-1.5 !bg-[#10B981] !border !border-slate-900 !shadow-[0_0_8px_rgba(16,185,129,0.8)]"
        />

        {/* Header: Role & Bank Code */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badgeClass}`}>
            {config.badge}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums">
            <span className="text-[#8B95A5] bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.06]">
              Bank {bankCode}
            </span>
            <span className="font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              {nodeData.risk ?? 85}% Risk
            </span>
          </div>
        </div>

        {/* Node Body with 3D Depth Icon */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#141824] border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] shrink-0">
            {config.icon}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-mono font-bold text-[#F8FAFC] tracking-wide truncate">
              {nodeData.id}
            </div>
            <div className="text-[10px] text-[#8B95A5] truncate font-sans">
              {nodeData.label || nodeData.id}
            </div>
          </div>
        </div>

        {/* Footer: Surveillance Flag */}
        <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
          <span>Surveillance Status</span>
          <span className="font-medium text-slate-200">
            {nodeData.risk >= 90 ? 'Critical Quarantine' : 'Active Intercept'}
          </span>
        </div>

        {/* Output Handles */}
        <Handle
          type="source"
          position={Position.Right}
          id="out-right"
          className="!w-2.5 !h-2.5 !-right-1.5 !bg-[#F8FAFC] !border !border-slate-900 !shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="out-bottom"
          className="!w-2.5 !h-2.5 !-bottom-1.5 !bg-[#F8FAFC] !border !border-slate-900 !shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      </div>
    </div>
  );
};

export default memo(AccountNode);
