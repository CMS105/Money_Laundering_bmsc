'use client';

import React from 'react';
import LaunderyLensLogo from './LaunderyLensLogo';

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
    <div className="flex flex-col items-center justify-center p-8 text-center select-none max-w-sm">
      {/* LaunderyLens Brand Mark */}
      <LaunderyLensLogo size="lg" showSubtitle={false} className="mb-6 justify-center" />

      {/* Restrained Lattice & Network Geometric Node Animation */}
      <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
        {/* Outer Rotating Hexagonal Bounds */}
        <div className="absolute inset-0 rounded-lg border border-[#75A99A]/30 animate-[spin_8s_linear_infinite]" />
        
        {/* Inner Counter-Rotating Diamond */}
        <div className="absolute w-10 h-10 border border-[#E8E5DA]/20 rotate-45 animate-[spin_6s_linear_infinite_reverse]" />

        {/* Central Pulse Hub */}
        <div className="w-3 h-3 rounded-full bg-[#75A99A] shadow-[0_0_12px_rgba(117,169,154,0.8)] animate-pulse" />

        {/* Orbiting Satellite Nodes */}
        <span className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-[#E8E5DA]/60" />
        <span className="absolute bottom-2 right-1 w-1.5 h-1.5 rounded-full bg-[#75A99A]/70" />
        <span className="absolute top-3 right-2 w-1.5 h-1.5 rounded-full bg-[#4D9477]/80" />
      </div>

      {/* Headline & Subtitle */}
      <h3 className="text-sm font-bold text-[#E8E5DA] font-sans tracking-wide">
        {label}
      </h3>
      <p className="text-xs text-[#82918E] font-mono mt-1 leading-relaxed">
        {sublabel}
      </p>

      {/* Indeterminate Horizontal Progress Bar */}
      <div className="w-48 h-1 rounded-full bg-[#1E3541] overflow-hidden mt-5 border border-[#284250]">
        <div className="h-full bg-gradient-to-r from-transparent via-[#75A99A] to-transparent w-1/2 animate-[shimmer_1.8s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B35]/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center w-full h-full min-h-[220px]">{content}</div>;
}

