'use client';

import React from 'react';

interface DotGridBackgroundProps {
  className?: string;
  dotColor?: string;
  spacing?: number;
  opacity?: number;
}

export default function DotGridBackground({
  className = '',
  dotColor = 'rgba(232, 229, 218, 0.05)',
  spacing = 24,
  opacity = 1,
}: DotGridBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

