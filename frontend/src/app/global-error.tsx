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
      <body className="min-h-screen w-full flex items-center justify-center bg-[#172B35] text-[#E8E5DA] p-6 font-sans">
        <div className="w-full max-w-md p-8 rounded-xl bg-[#1E3541] border border-[#284250] shadow-2xl text-center">
          <h1 className="text-lg font-bold text-[#E8E5DA] mb-2">
            Workspace Recovery Needed
          </h1>
          <p className="text-xs text-[#82918E] mb-6">
            A critical root application error occurred. Click below to recover the session.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#75A99A] hover:bg-[#8BBDB0] text-xs font-bold text-[#172B35] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restart LaunderyLens Session</span>
          </button>
        </div>
      </body>
    </html>
  );
}
