'use client';

import React, { useRef } from 'react';

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ClickSpark({
  children,
  sparkColor = '#75A99A',
  sparkCount = 6,
  className = '',
  onClick,
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(e);

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      const angle = (i * (360 / sparkCount) * Math.PI) / 180;
      const distance = 16 + Math.random() * 8;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      spark.style.position = 'absolute';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.width = '3px';
      spark.style.height = '3px';
      spark.style.borderRadius = '50%';
      spark.style.backgroundColor = sparkColor;
      spark.style.pointerEvents = 'none';
      spark.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
      spark.style.transform = 'translate(-50%, -50%) scale(1)';
      spark.style.opacity = '1';
      spark.style.zIndex = '50';

      containerRef.current?.appendChild(spark);

      requestAnimationFrame(() => {
        spark.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => {
        spark.remove();
      }, 420);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative inline-block overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

