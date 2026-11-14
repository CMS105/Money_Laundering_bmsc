'use client';

import React from 'react';

interface LaunderyLensLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export default function LaunderyLensLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
}: LaunderyLensLogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Lens & Protective Polygon Mark */}
      <div
        className={`relative flex items-center justify-center ${iconSizes[size]} rounded-md bg-[#1E3541] border border-[#284250] shadow-sm text-[#75A99A] group-hover:border-[#75A99A]/60 transition-colors shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/4 h-3/4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Protective Hexagonal Grid Shell */}
          <polygon points="12 2 20 6.5 20 17.5 12 22 4 17.5 4 6.5" stroke="#75A99A" strokeWidth="1.5" />
          {/* Optical Focus Lens */}
          <circle cx="12" cy="12" r="4.5" stroke="#E8E5DA" strokeWidth="1.8" />
          {/* Central Target & Focal Ray */}
          <circle cx="12" cy="12" r="1.5" fill="#75A99A" />
          <path d="M12 4.5v1.5M12 18v1.5M4.5 12h1.5M18 12h1.5" stroke="#75A99A" strokeWidth="1.5" />
        </svg>

        {/* Live System Indicator Dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4D9477] border border-[#172B35]" />
      </div>

      {/* Typographic Wordmark */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-wide text-[#E8E5DA] uppercase font-sans ${titleSizes[size]}`}>
            LaunderyLens
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] text-[#82918E] font-mono tracking-tight leading-tight truncate">
            Financial Crime Intelligence
          </p>
        )}
      </div>
    </div>
  );
}

