'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, LayoutDashboard, AlertCircle } from 'lucide-react';
import LaunderyLensLogo from '@/components/react-bits/LaunderyLensLogo';
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
    console.error(`[${id}] LaunderyLens Runtime Error:`, error.message);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#172B35] text-[#E8E5DA] p-6 relative select-none">
      <DotGridBackground />

      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#1E3541] border border-[#284250] shadow-2xl text-center">
        {/* Brand Header */}
        <LaunderyLensLogo size="md" showSubtitle={false} className="justify-center mb-6" />

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#253F4D] border border-[#284250] text-[#C75B55] mb-4">
          <AlertCircle className="w-6 h-6 text-[#C75B55]" />
        </div>

        <h1 className="text-lg font-bold text-[#E8E5DA] font-sans tracking-wide">
          Something went wrong
        </h1>
        <p className="text-xs text-[#82918E] font-mono mt-2 leading-relaxed">
          An unexpected error interrupted data rendering. System state has been quarantined to protect forensic data integrity.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pt-5 border-t border-[#284250]">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#75A99A] hover:bg-[#8BBDB0] text-xs font-mono font-bold text-[#172B35] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#253F4D] hover:bg-[#2C4959] border border-[#284250] text-xs font-mono text-[#E8E5DA] transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#82918E]" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {incidentId && (
          <p className="text-[10px] text-[#82918E] font-mono mt-5">
            Correlation ID: <span className="text-[#E8E5DA] font-bold">{incidentId}</span>
          </p>
        )}
      </div>
    </div>
  );
}

