'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090B] text-[#FAFAFA]">
      <Sidebar />
      <main className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col bg-[#09090B]">
        {children}
      </main>
    </div>
  );
}
