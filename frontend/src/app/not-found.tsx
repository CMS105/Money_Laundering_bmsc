'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard, ShieldAlert } from 'lucide-react';
import LaunderLensLogo from '@/components/react-bits/LaunderLensLogo';
import DotGridBackground from '@/components/react-bits/DotGridBackground';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090B] text-[#FAFAFA] p-6 relative select-none">
      <DotGridBackground />

      <div className="relative z-10 w-full max-w-md p-8 rounded-md bg-[#111114] border border-[rgba(255,255,255,0.08)] shadow-2xl text-center">
        {/* Brand Header */}
        <LaunderLensLogo size="md" showSubtitle={false} className="justify-center mb-6" />

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.08)] text-[#F59E0B] mb-4">
          <ShieldAlert className="w-6 h-6 text-[#F59E0B]" />
        </div>

        <h1 className="text-lg font-bold text-[#FAFAFA] font-sans tracking-wide">
          We couldn&apos;t find this page
        </h1>
        <p className="text-xs text-[#71717A] font-mono mt-2 leading-relaxed">
          The requested intelligence view or record address may have moved or does not exist in the active surveillance index.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pt-5 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#FAFAFA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Go Back</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#FAFAFA] hover:bg-[#8BBDB0] text-xs font-mono font-bold text-[#09090B] transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <p className="text-[10px] text-[#71717A] font-mono mt-5">
          Incident Code: <span className="text-[#FAFAFA]">404-RESOURCE-NOT-INDEXED</span>
        </p>
      </div>
    </div>
  );
}

