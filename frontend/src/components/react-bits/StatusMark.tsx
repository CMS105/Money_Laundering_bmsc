'use client';

import React from 'react';

export type StatusVariant = 'active' | 'success' | 'warning' | 'critical' | 'neutral';

interface StatusMarkProps {
  status?: StatusVariant;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusMark({
  status = 'active',
  label,
  pulse = true,
  size = 'md',
  className = '',
}: StatusMarkProps) {
  const colorMap: Record<StatusVariant, { dot: string; ring: string; text: string; bg: string; border: string }> = {
    active: {
      dot: 'bg-[#75A99A]',
      ring: 'bg-[#75A99A]/30',
      text: 'text-[#75A99A]',
      bg: 'bg-[#75A99A]/10',
      border: 'border-[#75A99A]/30',
    },
    success: {
      dot: 'bg-[#4D9477]',
      ring: 'bg-[#4D9477]/30',
      text: 'text-[#4D9477]',
      bg: 'bg-[#4D9477]/10',
      border: 'border-[#4D9477]/30',
    },
    warning: {
      dot: 'bg-[#D5A24F]',
      ring: 'bg-[#D5A24F]/30',
      text: 'text-[#D5A24F]',
      bg: 'bg-[#D5A24F]/10',
      border: 'border-[#D5A24F]/30',
    },
    critical: {
      dot: 'bg-[#C75B55]',
      ring: 'bg-[#C75B55]/30',
      text: 'text-[#C75B55]',
      bg: 'bg-[#C75B55]/10',
      border: 'border-[#C75B55]/30',
    },
    neutral: {
      dot: 'bg-[#82918E]',
      ring: 'bg-[#82918E]/30',
      text: 'text-[#82918E]',
      bg: 'bg-[#82918E]/10',
      border: 'border-[#82918E]/30',
    },
  };

  const current = colorMap[status];
  const textSize = size === 'sm' ? 'text-[10px] py-0.5 px-1.5' : 'text-[11px] py-0.5 px-2';
  const dotBox = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const innerDot = size === 'sm' ? 'h-1 w-1' : 'h-1.5 w-1.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono font-medium ${textSize} ${current.bg} ${current.border} ${current.text} ${className}`}
    >
      <span className={`relative flex items-center justify-center ${dotBox}`}>
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ring}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${innerDot} ${current.dot}`} />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}
