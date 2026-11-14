'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Users,
  Globe2,
  Building2,
  Receipt,
  Share2,
  FileText,
  BarChart3,
  Database,
  Sliders,
  LogOut,
  Coins,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import LaunderyLensLogo from './react-bits/LaunderyLensLogo';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'teal' | 'amber' | 'neutral';
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview & KPIs',
    icon: LayoutDashboard,
  },
  {
    href: '/investigations',
    label: 'Investigations',
    icon: Radio,
    badge: 'LIVE',
    badgeVariant: 'teal',
  },
  {
    href: '/mule-intelligence',
    label: 'Mule Networks',
    icon: Users,
    badge: '18 Flagged',
    badgeVariant: 'amber',
  },
  {
    href: '/cross-border',
    label: 'Cross-Border Flows',
    icon: Globe2,
  },
  {
    href: '/asset-intelligence',
    label: 'Asset Laundering',
    icon: Building2,
  },
  {
    href: '/transactions',
    label: 'Transaction Monitor',
    icon: Receipt,
  },
  {
    href: '/network-analysis',
    label: 'Network Topology',
    icon: Share2,
  },
  {
    href: '/reports',
    label: 'Regulatory SARs',
    icon: FileText,
    badge: 'Form 111',
    badgeVariant: 'teal',
  },
  {
    href: '/model-performance',
    label: 'Model Benchmark',
    icon: BarChart3,
  },
  {
    href: '/datasets',
    label: 'Multi-Source Datasets',
    icon: Database,
  },
  {
    href: '/settings',
    label: 'Engine Settings',
    icon: Sliders,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === href;
  };

  const getBadgeClass = (variant?: 'teal' | 'amber' | 'neutral') => {
    if (variant === 'teal') {
      return 'bg-[#75A99A]/15 text-[#75A99A] border-[#75A99A]/30';
    }
    if (variant === 'amber') {
      return 'bg-[#D5A24F]/15 text-[#D5A24F] border-[#D5A24F]/30';
    }
    return 'bg-[#253F4D] text-[#A3B3AF] border-[#284250]';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#284250] flex items-center justify-between bg-[#12222A]/70">
        <Link href="/dashboard" className="flex items-center group">
          <LaunderyLensLogo size="md" />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded hover:bg-[#1E3541] text-[#82918E]"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#82918E]">
          Surveillance &amp; Intelligence
        </div>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-sans transition-all ${
                active
                  ? 'bg-[#1E3541] text-[#75A99A] border border-[#75A99A]/40 font-semibold shadow-sm'
                  : 'text-[#A3B3AF] hover:text-[#E8E5DA] hover:bg-[#1E3541]/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-[#75A99A]' : 'text-[#82918E]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-medium shrink-0 ${getBadgeClass(
                    item.badgeVariant
                  )}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Currency Switcher */}
      <div className="p-3 border-t border-[#284250] bg-[#12222A]/50">
        <button
          onClick={toggleCurrency}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#1E3541] hover:bg-[#253F4D] border border-[#284250] text-xs font-mono text-[#E8E5DA] transition-colors cursor-pointer"
          title="Toggle reporting currency between USD ($) and INR (₹)"
        >
          <div className="flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-[#75A99A]" />
            <span className="text-[11px] font-sans text-[#A3B3AF]">Reporting Currency</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#253F4D] text-[#75A99A] font-bold text-[11px] border border-[#284250]">
            {currency === 'USD' ? '$ USD' : '₹ INR'}
          </span>
        </button>
      </div>

      {/* Analyst Profile & Sign Out */}
      <div className="p-3 border-t border-[#284250] bg-[#12222A]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#1E3541] border border-[#284250]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#253F4D] border border-[#284250] flex items-center justify-center text-[#75A99A] shrink-0 font-bold text-xs font-mono">
              {user?.name ? user.name.charAt(0) : 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#E8E5DA] truncate">
                {user?.name || 'Sarah Jenkins, CAMS'}
              </p>
              <p className="text-[9px] text-[#82918E] font-mono truncate">
                {user?.badge_id || 'LL-AML-8921'} · L4
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded hover:bg-[#253F4D] text-[#82918E] hover:text-[#C75B55] transition-colors cursor-pointer"
            title="Sign out of AML Surveillance Session"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legal & Compliance footer links */}
        <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-[#82918E] font-mono">
          <Link href="/privacy-policy" className="hover:text-[#E8E5DA] transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#E8E5DA] transition-colors">
            Terms &amp; BSA Safe Harbor
          </Link>
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
          className="p-2 rounded-md bg-[#1E3541] border border-[#284250] text-[#E8E5DA] shadow-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4 text-[#75A99A]" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#172B35] border-r border-[#284250] transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-[#172B35] border-r border-[#284250] flex-col shrink-0 select-none z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
