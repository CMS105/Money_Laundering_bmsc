'use client';

import React from 'react';
import LaunderLensLogo from './LaunderLensLogo';

interface LatticeLoaderProps {
  label?: string;
  sublabel?: string;
  fullscreen?: boolean;
}

export default function LatticeLoader({
  label = 'Preparing your intelligence workspace',
  sublabel = 'Validating financial transaction topology and neural features',
  fullscreen = false,
}: LatticeLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none max-w-sm font-sans">
      <LaunderLensLogo size="lg" showSubtitle={false} className="mb-6 justify-center" />

      {/* Geometric Lattice Animation */}
      <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
        {/* Outer Rotating Bounds */}
        <div className="absolute inset-0 rounded border border-white/20 animate-[spin_8s_linear_infinite]" />
        
        {/* Inner Counter-Rotating Diamond */}
        <div className="absolute w-8 h-8 border border-white/10 rotate-45 animate-[spin_6s_linear_infinite_reverse]" />

        {/* Central Pulse Hub */}
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />

        {/* Orbiting Satellite Nodes */}
        <span className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-white/70" />
        <span className="absolute bottom-2 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="absolute top-3 right-2 w-1.5 h-1.5 rounded-full bg-zinc-500" />
      </div>

      {/* Headline & Subtitle */}
      <h3 className="text-xs font-semibold text-[#FAFAFA] tracking-tight">
        {label}
      </h3>
      <p className="text-[11px] text-[#71717A] font-mono mt-1 leading-relaxed">
        {sublabel}
      </p>

      {/* Indeterminate Horizontal Progress Bar */}
      <div className="w-40 h-0.5 rounded-full bg-[#27272A] overflow-hidden mt-4">
        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent w-1/2 animate-[shimmer_1.8s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center w-full h-full min-h-[220px]">{content}</div>;
}
