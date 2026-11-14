'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full flex items-center justify-center bg-[#09090B] text-[#FAFAFA] p-6 font-sans">
        <div className="w-full max-w-md p-8 rounded-md bg-[#111114] border border-[rgba(255,255,255,0.08)] shadow-2xl text-center">
          <h1 className="text-lg font-bold text-[#FAFAFA] mb-2">
            Workspace Recovery Needed
          </h1>
          <p className="text-xs text-[#71717A] mb-6">
            A critical root application error occurred. Click below to recover the session.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#FAFAFA] hover:bg-[#8BBDB0] text-xs font-bold text-[#09090B] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restart LaunderLens Session</span>
          </button>
        </div>
      </body>
    </html>
  );
}
