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
          badgeClass: 'bg-[#4D9477]/15 text-[#A5D6C1] border-[#4D9477]/40',
          accentColor: '#4D9477',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-[#4D9477]" />,
        };
      case 'exit':
        return {
          badge: 'SINK / EXIT',
          badgeClass: 'bg-[#C75B55]/15 text-[#F5C2C0] border-[#C75B55]/40',
          accentColor: '#C75B55',
          icon: <ArrowDownLeft className="w-3.5 h-3.5 text-[#C75B55]" />,
        };
      case 'mule':
      default:
        return {
          badge: 'MULE CONDUIT',
          badgeClass: 'bg-[#D5A24F]/15 text-[#F4D99B] border-[#D5A24F]/40',
          accentColor: '#D5A24F',
          icon: <Shuffle className="w-3.5 h-3.5 text-[#D5A24F]" />,
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
            ? 'border-[#75A99A]/60 bg-[#253F4D] shadow-[0_16px_40px_rgba(18,34,42,0.9),inset_0_1px_0_0_rgba(117,169,154,0.3)] ring-2 ring-[#75A99A]/40'
            : 'border-[#284250] bg-[#1E3541]/95 shadow-[0_12px_28px_-6px_rgba(18,34,42,0.7),inset_0_1px_0_0_rgba(232,229,218,0.1)] hover:border-[#75A99A]/30'
        }`}
      >
        {/* Top Edge Specular Line */}
        <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-[#E8E5DA]/20 to-transparent" />

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="in-left"
          className="!w-2.5 !h-2.5 !-left-1.5 !bg-[#E8E5DA] !border !border-[#172B35] !shadow-[0_0_8px_rgba(232,229,218,0.8)]"
        />
        <Handle
          type="target"
          position={Position.Top}
          id="in-top"
          className="!w-2.5 !h-2.5 !-top-1.5 !bg-[#E8E5DA] !border !border-[#172B35] !shadow-[0_0_8px_rgba(232,229,218,0.8)]"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="out-right"
          className="!w-2.5 !h-2.5 !-right-1.5 !bg-[#75A99A] !border !border-[#172B35] !shadow-[0_0_8px_rgba(117,169,154,0.8)]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="out-bottom"
          className="!w-2.5 !h-2.5 !-bottom-1.5 !bg-[#75A99A] !border !border-[#172B35] !shadow-[0_0_8px_rgba(117,169,154,0.8)]"
        />

        {/* Header: Role & Bank Code */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badgeClass}`}>
            {config.badge}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums">
            <span className="text-[#82918E] bg-[#253F4D] px-1.5 py-0.5 rounded border border-[#284250]">
              Bank {bankCode}
            </span>
            <span className="font-semibold text-[#F5C2C0] bg-[#C75B55]/15 px-1.5 py-0.5 rounded border border-[#C75B55]/30">
              {nodeData.risk ?? 85}% Risk
            </span>
          </div>
        </div>

        {/* Node Body with Icon */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#172B35] border border-[#284250] shadow-[inset_0_1px_0_0_rgba(232,229,218,0.1)] shrink-0">
            {config.icon}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-mono font-bold text-[#E8E5DA] tracking-wide truncate">
              {nodeData.id}
            </div>
            <div className="text-[10px] text-[#82918E] truncate font-sans">
              {nodeData.label || nodeData.id}
            </div>
          </div>
        </div>

        {/* Footer: Surveillance Flag */}
        <div className="pt-2 border-t border-[#284250] flex items-center justify-between text-[10px] font-mono tabular-nums text-[#82918E]">
          <span>Surveillance Status</span>
          <span className="font-medium text-[#E8E5DA]">
            {nodeData.risk >= 90 ? 'Critical Quarantine' : 'Active Intercept'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(AccountNode);
