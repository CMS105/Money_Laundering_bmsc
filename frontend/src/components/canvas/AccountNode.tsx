'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ShieldAlert, ArrowUpRight, ArrowDownLeft, Shuffle } from 'lucide-react';

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
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
          borderClass: selected ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-cyan-500/50 hover:border-cyan-400',
          bgGradient: 'from-cyan-950/80 via-slate-900/90 to-slate-950',
          icon: <ArrowUpRight className="w-4 h-4 text-cyan-400" />,
          accentDot: 'bg-cyan-400',
        };
      case 'exit':
        return {
          badge: 'SINK / EXIT',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
          borderClass: selected ? 'border-rose-400 ring-2 ring-rose-400/50' : 'border-rose-500/50 hover:border-rose-400',
          bgGradient: 'from-rose-950/80 via-slate-900/90 to-slate-950',
          icon: <ArrowDownLeft className="w-4 h-4 text-rose-400" />,
          accentDot: 'bg-rose-400',
        };
      case 'mule':
      default:
        return {
          badge: 'MULE / CONDUIT',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          borderClass: selected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-amber-500/50 hover:border-amber-400',
          bgGradient: 'from-amber-950/70 via-slate-900/90 to-slate-950',
          icon: <Shuffle className="w-4 h-4 text-amber-400" />,
          accentDot: 'bg-amber-400',
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div
      className={`relative min-w-[210px] rounded-xl border p-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 bg-gradient-to-b ${config.bgGradient} ${config.borderClass}`}
    >
      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="in-left"
        className="!w-3 !h-3 !-left-1.5 !bg-sky-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="in-top"
        className="!w-3 !h-3 !-top-1.5 !bg-sky-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.accentDot} animate-ping`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
            {config.badge}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/60">
          <ShieldAlert className="w-3 h-3 text-red-400" />
          <span className="text-[11px] font-bold text-red-300">{nodeData.risk ?? 85}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
          {config.icon}
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-black text-slate-100 tracking-wide font-mono truncate">
            {nodeData.id}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {nodeData.label || nodeData.id}
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span>KYC Risk Score</span>
        <span className="font-semibold text-slate-200">{nodeData.risk >= 90 ? 'Critical Severity' : 'High Alert'}</span>
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="out-right"
        className="!w-3 !h-3 !-right-1.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out-bottom"
        className="!w-3 !h-3 !-bottom-1.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(AccountNode);
