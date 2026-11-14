'use client';

import React from 'react';

interface LaunderLensLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export default function LaunderLensLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
}: LaunderLensLogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Lens Mark */}
      <div
        className={`relative flex items-center justify-center ${iconSizes[size]} rounded bg-[#18181B] border border-white/10 shadow-sm text-white shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-white"
        >
          <circle cx="12" cy="12" r="8" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        </svg>

        {/* Live Indicator Dot */}
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10B981]" />
      </div>

      {/* Typographic Wordmark */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold tracking-tight text-[#FAFAFA] font-sans ${titleSizes[size]}`}>
            LaunderLens
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[9px] text-[#71717A] font-mono tracking-wider uppercase leading-tight truncate">
            Financial Crime OS
          </p>
        )}
      </div>
    </div>
  );
}
