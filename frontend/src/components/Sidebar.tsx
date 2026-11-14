'use client';

import React from 'react';
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
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
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
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    href: '/mule-intelligence',
    label: 'Mule Intelligence',
    icon: Users,
    badge: '18 Flagged',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
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
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
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

  const isActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === href;
  };

  return (
    <aside className="w-64 h-screen bg-[#0F172A] border-r border-[#263449] flex flex-col shrink-0 select-none z-40">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#263449] flex items-center justify-between bg-[#0B1220]/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#172337] border border-[#263449] flex items-center justify-center text-[#38BDF8] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] group-hover:border-[#38BDF8]/50 transition-colors">
            <ShieldAlert className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-[#E5E7EB] group-hover:text-white transition-colors">
                LaunderyLens
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            </div>
            <p className="text-[10px] text-[#94A3B8] font-mono tracking-tight">
              AML Forensic Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          Surveillance & Modules
        </div>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                active
                  ? 'bg-[#172337] text-[#38BDF8] border border-[#263449] shadow-sm font-semibold'
                  : 'text-[#94A3B8] hover:text-[#E5E7EB] hover:bg-[#111C2E]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#38BDF8]' : 'text-[#64748B]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-medium shrink-0 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Currency Switcher & Utilities */}
      <div className="p-3 border-t border-[#263449] space-y-2 bg-[#0B1220]/40">
        <button
          onClick={toggleCurrency}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#111C2E] hover:bg-[#172337] border border-[#263449] text-xs font-mono text-[#E5E7EB] transition-colors"
          title="Toggle display currency between USD ($) and INR (₹)"
        >
          <div className="flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-[11px] font-sans text-[#94A3B8]">Reporting Currency</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#172337] text-[#38BDF8] font-bold text-[11px] border border-[#263449]">
            {currency === 'USD' ? '$ USD' : '₹ INR'}
          </span>
        </button>
      </div>

      {/* Analyst Session Card & Logout */}
      <div className="p-3 border-t border-[#263449] bg-[#0F172A]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#111C2E] border border-[#263449]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#172337] border border-[#263449] flex items-center justify-center text-[#38BDF8] shrink-0 font-bold text-xs font-mono">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#E5E7EB] truncate">
                {user?.name || 'Lead Investigator'}
              </p>
              <p className="text-[9px] text-[#94A3B8] font-mono truncate">
                {user?.badge_id || 'FIU-SEC-402'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded hover:bg-[#172337] text-[#94A3B8] hover:text-[#EF4444] transition-colors"
            title="Sign out of AML Surveillance Session"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legal & Compliance footer links */}
        <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-[#64748B]">
          <Link href="/privacy-policy" className="hover:text-[#94A3B8] transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#94A3B8] transition-colors">
            Terms & Compliance
          </Link>
        </div>
      </div>
    </aside>
  );
}
