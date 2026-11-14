'use client';

import React from 'react';

interface FadeContentProps {
  children: React.ReactNode;
  delayMs?: number;
  durationMs?: number;
  direction?: 'up' | 'down' | 'none';
  className?: string;
}

export default function FadeContent({
  children,
  delayMs = 0,
  durationMs = 280,
  direction = 'up',
  className = '',
}: FadeContentProps) {
  const directionClass =
    direction === 'up'
      ? 'translate-y-1.5'
      : direction === 'down'
      ? '-translate-y-1.5'
      : '';

  return (
    <div
      className={`animate-in fade-in fill-mode-both ${directionClass} ${className}`}
      style={{
        animationDuration: `${durationMs}ms`,
        animationDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}

