'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, LayoutDashboard, AlertCircle } from 'lucide-react';
import LaunderLensLogo from '@/components/react-bits/LaunderLensLogo';
import DotGridBackground from '@/components/react-bits/DotGridBackground';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [incidentId, setIncidentId] = useState<string>('');

  useEffect(() => {
    // Generate a secure incident correlation ID without exposing internal stack traces
    const id = `LL-INC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setIncidentId(id);
    console.error(`[${id}] LaunderLens Runtime Error:`, error.message);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090B] text-[#FAFAFA] p-6 relative select-none">
      <DotGridBackground />

      <div className="relative z-10 w-full max-w-md p-8 rounded-md bg-[#111114] border border-[rgba(255,255,255,0.08)] shadow-2xl text-center">
        {/* Brand Header */}
        <LaunderLensLogo size="md" showSubtitle={false} className="justify-center mb-6" />

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.08)] text-[#EF4444] mb-4">
          <AlertCircle className="w-6 h-6 text-[#EF4444]" />
        </div>

        <h1 className="text-lg font-bold text-[#FAFAFA] font-sans tracking-wide">
          Something went wrong
        </h1>
        <p className="text-xs text-[#71717A] font-mono mt-2 leading-relaxed">
          An unexpected error interrupted data rendering. System state has been quarantined to protect forensic data integrity.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pt-5 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#FAFAFA] hover:bg-[#8BBDB0] text-xs font-mono font-bold text-[#09090B] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#FAFAFA] transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {incidentId && (
          <p className="text-[10px] text-[#71717A] font-mono mt-5">
            Correlation ID: <span className="text-[#FAFAFA] font-bold">{incidentId}</span>
          </p>
        )}
      </div>
    </div>
  );
}

