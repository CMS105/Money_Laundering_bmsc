'use client';

import React, { useRef, useState, useCallback, ReactNode, MouseEvent } from 'react';

interface SpatialCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  tiltIntensity?: number;
  interactive?: boolean;
}

export default function SpatialCard({
  children,
  className = '',
  onClick,
  selected = false,
  tiltIntensity = 2.5,
  interactive = true,
}: SpatialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!interactive || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to 1
      const normY = (y / rect.height) * 2 - 1; // -1 to 1

      setRotateX(-normY * tiltIntensity);
      setRotateY(normX * tiltIntensity);
      setSpotlightPos({
        x: Math.round((x / rect.width) * 100),
        y: Math.round((y / rect.height) * 100),
      });
    },
    [interactive, tiltIntensity]
  );

  const handleMouseEnter = useCallback(() => {
    if (!interactive) return;
    setIsHovered(true);
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return;
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  }, [interactive]);

  return (
    <div
      style={{ perspective: '1000px' }}
      className="relative select-none"
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease',
        }}
        className={`relative rounded-xl overflow-hidden backdrop-blur-xl border transition-colors ${
          selected
            ? 'border-white/30 bg-[#141824] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.22)]'
            : 'border-white/[0.07] bg-[#0E1016]/90 hover:border-white/[0.14] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
        } ${className}`}
      >
        {/* Mouse Tracking Radial Specular Border Glow */}
        {isHovered && interactive && (
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-100"
            style={{
              background: `radial-gradient(400px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(255, 255, 255, 0.08), transparent 60%)`,
            }}
          />
        )}

        {/* Selected subtle aura */}
        {selected && (
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
        )}

        {/* Card Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
