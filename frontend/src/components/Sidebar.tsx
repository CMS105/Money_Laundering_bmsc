'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Share2,
  FileText,
  BarChart3,
  Database,
  Receipt,
  Globe2,
  Coins,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const PRIMARY_ROUTES: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/investigations',
    label: 'Investigations Canvas',
    icon: Radio,
  },
  {
    href: '/mule-intelligence',
    label: 'Typology Rings',
    icon: Share2,
  },
  {
    href: '/reports',
    label: 'Regulatory SARs',
    icon: FileText,
  },
  {
    href: '/model-performance',
    label: 'Model Benchmark',
    icon: BarChart3,
  },
  {
    href: '/datasets',
    label: 'IBM Dataset & SQLite',
    icon: Database,
  },
];

const SECONDARY_ROUTES: NavItem[] = [
  {
    href: '/transactions',
    label: 'Transaction Ledger',
    icon: Receipt,
  },
  {
    href: '/cross-border',
    label: 'Cross-Border Corridors',
    icon: Globe2,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === href;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-[#0C0C0E] border-r border-white/[0.07] text-[#FAFAFA] select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-white/[0.07] flex items-center justify-between shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded bg-[#18181B] border border-white/[0.12] flex items-center justify-center text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-white"
            >
              <circle cx="12" cy="12" r="8" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-tight text-[#FAFAFA] font-sans">
              LaunderLens
            </span>
            <span className="text-[9px] font-mono text-[#71717A] tracking-wider uppercase">
              Financial Crime OS
            </span>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded hover:bg-white/[0.06] text-[#71717A]"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <div>
          <div className="px-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Core Intelligence
          </div>
          <div className="space-y-0.5">
            {PRIMARY_ROUTES.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-sans transition-colors rounded-r-sm ${
                    active
                      ? 'bg-[#18181B] text-[#FAFAFA] border-l-2 border-white font-medium pl-2'
                      : 'text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#111114] border-l-2 border-transparent'
                  }`}
                >
                  <Icon
                    strokeWidth={1.5}
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-white' : 'text-[#71717A]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Forensic Surveillance
          </div>
          <div className="space-y-0.5">
            {SECONDARY_ROUTES.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-sans transition-colors rounded-r-sm ${
                    active
                      ? 'bg-[#18181B] text-[#FAFAFA] border-l-2 border-white font-medium pl-2'
                      : 'text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#111114] border-l-2 border-transparent'
                  }`}
                >
                  <Icon
                    strokeWidth={1.5}
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-white' : 'text-[#71717A]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Currency Switcher */}
      <div className="px-3 py-2 border-t border-white/[0.07] bg-[#0C0C0E]">
        <button
          onClick={toggleCurrency}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#111114] hover:bg-[#18181B] border border-white/[0.07] text-xs font-mono text-[#FAFAFA] transition-colors cursor-pointer"
          title="Toggle reporting currency between USD ($) and INR (₹)"
        >
          <div className="flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-[#71717A]" strokeWidth={1.5} />
            <span className="text-[11px] font-sans text-[#71717A]">Currency</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-[#18181B] text-[#FAFAFA] font-bold text-[10px] border border-white/[0.08] tabular-nums">
            {currency === 'USD' ? '$ USD' : '₹ INR'}
          </span>
        </button>
      </div>

      {/* Live System Telemetry Badge & Sign Out */}
      <div className="p-3 border-t border-white/[0.07] bg-[#0C0C0E] space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#111114] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[9px] font-mono tracking-wider font-semibold text-[#A1A1AA] uppercase">
              ENGINE: ONLINE · SQLITE SYNCED
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1 rounded hover:bg-[#18181B] text-[#71717A] hover:text-[#EF4444] transition-colors cursor-pointer"
            title="Sign out of AML Surveillance Session"
          >
            <LogOut className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center justify-between px-1 text-[9px] text-[#52525B] font-mono">
          <Link href="/privacy-policy" className="hover:text-[#A1A1AA] transition-colors">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#A1A1AA] transition-colors">
            31 U.S.C. Safe Harbor
          </Link>
          <span>·</span>
          <span>v2.4.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md bg-[#0C0C0E] border border-white/[0.1] text-white shadow-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-60 bg-[#0C0C0E] border-r border-white/[0.07] transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-60 h-screen bg-[#0C0C0E] border-r border-white/[0.07] flex-col shrink-0 select-none z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
