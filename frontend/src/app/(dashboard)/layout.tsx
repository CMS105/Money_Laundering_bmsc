'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#172B35] text-[#E8E5DA]">
      <Sidebar />
      <main className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}

