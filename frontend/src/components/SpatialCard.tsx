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
            ? 'border-[#75A99A]/50 bg-[#253F4D] shadow-[0_12px_32px_-8px_rgba(18,34,42,0.8),inset_0_1px_0_0_rgba(117,169,154,0.3)] ring-1 ring-[#75A99A]/30'
            : 'border-[#284250] bg-[#1E3541]/90 hover:border-[#75A99A]/30 hover:bg-[#1E3541] shadow-[0_8px_24px_-8px_rgba(18,34,42,0.6),inset_0_1px_0_0_rgba(232,229,218,0.06)]'
        } ${className}`}
      >
        {/* Mouse Tracking Radial Specular Border Glow with Muted Teal sheen */}
        {isHovered && interactive && (
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-100"
            style={{
              background: `radial-gradient(400px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(117, 169, 154, 0.12), transparent 60%)`,
            }}
          />
        )}

        {/* Selected subtle aura */}
        {selected && (
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#75A99A]/[0.08] to-transparent" />
        )}

        {/* Card Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
