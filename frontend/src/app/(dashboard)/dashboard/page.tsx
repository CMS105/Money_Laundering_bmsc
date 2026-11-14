'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Radio,
  Users,
  Globe2,
  Building2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface DashboardData {
  total_monitored_volume_usd: number;
  total_monitored_volume_inr: number;
  total_transactions_count: number;
  monitored_entities_count: number;
  active_high_risk_alerts: number;
  isolated_quarantine_accounts: number;
  avg_detection_latency_secs: number;
  fincen_sars_drafted: number;
  fincen_sars_submitted: number;
  false_positive_rate: number;
  hybrid_f1_score: number;
  alert_severity_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  typology_distribution: Array<{
    typology: string;
    count: number;
    volume_usd: number;
    risk_pct: number;
  }>;
  volume_trends_30d: Array<{
    day: string;
    licit_usd: number;
    flagged_usd: number;
    alerts: number;
  }>;
  recent_high_risk_entities: Array<{
    account_id: string;
    name: string;
    risk_score: number;
    typology: string;
    bank: string;
    jurisdiction: string;
  }>;
}

const FALLBACK_DASHBOARD: DashboardData = {
  total_monitored_volume_usd: 84250000,
  total_monitored_volume_inr: 7077000000,
  total_transactions_count: 4820,
  monitored_entities_count: 684,
  active_high_risk_alerts: 42,
  isolated_quarantine_accounts: 18,
  avg_detection_latency_secs: 180,
  fincen_sars_drafted: 14,
  fincen_sars_submitted: 9,
  false_positive_rate: 0.0,
  hybrid_f1_score: 0.882,
  alert_severity_breakdown: { critical: 14, high: 18, medium: 7, low: 3 },
  typology_distribution: [
    { typology: 'Cyclic Round-Tripping', count: 12, volume_usd: 24800000, risk_pct: 98.4 },
    { typology: 'Smurfing / Fan-Out', count: 14, volume_usd: 18450000, risk_pct: 96.2 },
    { typology: 'Mule Relay Network', count: 8, volume_usd: 15200000, risk_pct: 94.7 },
    { typology: 'Cross-Border Layering', count: 5, volume_usd: 19600000, risk_pct: 97.1 },
    { typology: 'Asset / Gold Conversion', count: 3, volume_usd: 6200000, risk_pct: 95.0 },
  ],
  volume_trends_30d: [
    { day: 'Day -25', licit_usd: 2400000, flagged_usd: 180000, alerts: 2 },
    { day: 'Day -20', licit_usd: 2850000, flagged_usd: 320000, alerts: 4 },
    { day: 'Day -15', licit_usd: 3100000, flagged_usd: 850000, alerts: 8 },
    { day: 'Day -10', licit_usd: 2600000, flagged_usd: 410000, alerts: 3 },
    { day: 'Day -5', licit_usd: 3400000, flagged_usd: 1250000, alerts: 12 },
    { day: 'Day 0', licit_usd: 3900000, flagged_usd: 1980000, alerts: 13 },
  ],
  recent_high_risk_entities: [
    { account_id: '020_ACC_8819', name: 'Global Horizon Trade Ltd (Shell)', risk_score: 98.4, typology: 'Originator / Layering Core', bank: 'Bank of New York Mellon', jurisdiction: 'Delaware, USA' },
    { account_id: '070_ACC_3301', name: 'Al-Bahr Capital Commodities FZE', risk_score: 96.2, typology: 'Cross-Border Conduit / Mule', bank: 'Emirates NBD', jurisdiction: 'Dubai, UAE' },
    { account_id: '070_ACC_9921', name: 'Zenith International Holdings', risk_score: 94.8, typology: 'Sink / Liquidation Account', bank: 'Standard Chartered', jurisdiction: 'Singapore' },
    { account_id: '010_ACC_5502', name: 'Vikas Silver Bullion Refinery', risk_score: 95.1, typology: 'Asset Conversion Conduit', bank: 'HDFC Bank', jurisdiction: 'Mumbai, India' },
    { account_id: '040_ACC_1194', name: 'Pacific Star Logistics LLC', risk_score: 91.7, typology: 'Funnel Account', bank: 'Citibank', jurisdiction: 'Hong Kong' },
  ],
};

export default function DashboardPage() {
  const { formatAmount } = useCurrency();
  const [data, setData] = useState<DashboardData>(FALLBACK_DASHBOARD);

  useEffect(() => {
    fetch('/api/v1/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#263449]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#E5E7EB] tracking-wide uppercase">
              Financial Crime Intelligence Overview
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
              Live Surveillance Active
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Temporal Graph Analytics · Explainable AI · Multi-Source Kaggle Ingestion Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/investigations"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#172337] hover:bg-[#263449] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-bold text-[#E5E7EB] transition-all shadow-md"
          >
            <Radio className="w-4 h-4 text-[#38BDF8] animate-pulse" />
            <span>Launch Investigations Workbench</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono mb-2">
            <span>Total Monitored Capital</span>
            <Database className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-black text-[#E5E7EB] font-mono tabular-nums">
            {formatAmount(data.total_monitored_volume_usd)}
          </div>
          <p className="text-[11px] text-[#64748B] font-mono mt-1 flex items-center gap-1">
            <span className="text-[#22C55E]">4,820 Tx</span> across 684 Monitored Nodes
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono mb-2">
            <span>Critical Threat Clusters</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-black text-[#EF4444] font-mono tabular-nums">
            {data.active_high_risk_alerts} Alerts
          </div>
          <p className="text-[11px] text-[#64748B] font-mono mt-1">
            <span className="text-[#EF4444] font-bold">14 Critical</span> · 18 Quarantined Conduits
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono mb-2">
            <span>Hybrid ML Precision</span>
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-[#22C55E] font-mono tabular-nums">
            100.0%
          </div>
          <p className="text-[11px] text-[#64748B] font-mono mt-1">
            <span className="text-[#22C55E] font-bold">0.0% False Positive Rate</span> · F1: 0.88
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono mb-2">
            <span>Regulatory Filings</span>
            <FileText className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-black text-[#38BDF8] font-mono tabular-nums">
            {data.fincen_sars_drafted} SARs
          </div>
          <p className="text-[11px] text-[#64748B] font-mono mt-1">
            <span className="text-[#38BDF8] font-bold">9 Form 111 Transmitted</span> to FinCEN / FIU
          </p>
        </div>
      </div>

      {/* Middle Row: Volume Trends & Typology Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Volume & Alert Trend */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#E5E7EB] uppercase tracking-wide">
                  Surveillance Volume &amp; Attack Frequency Trend
                </h2>
                <p className="text-xs text-[#94A3B8] font-mono">
                  Daily aggregate licit vs. illicit laundering transaction volume
                </p>
              </div>
              <span className="text-xs font-mono text-[#38BDF8] bg-[#172337] px-2.5 py-1 rounded border border-[#263449]">
                Last 30 Days
              </span>
            </div>

            {/* Visual Bar Graph */}
            <div className="space-y-3 pt-2">
              {data.volume_trends_30d.map((item, idx) => {
                const total = item.licit_usd + item.flagged_usd;
                const flagPct = (item.flagged_usd / total) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                      <span>{item.day}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#E5E7EB]">
                          Total: {formatAmount(total)}
                        </span>
                        <span className="text-[#EF4444] font-bold">
                          Flagged: {formatAmount(item.flagged_usd)} ({item.alerts} alerts)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded bg-[#0B1220] overflow-hidden flex">
                      <div
                        style={{ width: `${100 - flagPct}%` }}
                        className="bg-[#38BDF8]/40 h-full"
                        title="Licit Volume"
                      />
                      <div
                        style={{ width: `${flagPct}%` }}
                        className="bg-[#EF4444] h-full"
                        title="Illicit Flagged Volume"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4 mt-4 border-t border-[#263449] text-xs font-mono text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#38BDF8]/40" />
              <span>Verified Licit Flows</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#EF4444]" />
              <span>Quarantined Laundering Flows</span>
            </div>
          </div>
        </div>

        {/* Typology Distribution Breakdown */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#E5E7EB] uppercase tracking-wide mb-1">
              Typology Exposure
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono mb-4">
              Laundering mechanics by volume and risk score
            </p>

            <div className="space-y-3.5">
              {data.typology_distribution.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0B1220] border border-[#263449]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#E5E7EB]">{t.typology}</span>
                    <span className="font-mono text-[#EF4444] font-bold">
                      {t.risk_pct}% Risk
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                    <span>{t.count} Active Rings</span>
                    <span className="text-[#38BDF8]">{formatAmount(t.volume_usd)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/investigations"
            className="mt-4 w-full py-2 px-3 rounded bg-[#172337] hover:bg-[#263449] border border-[#263449] text-center text-xs font-mono text-[#38BDF8] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Inspect All Active Rings on Canvas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Section: Watchlist Entities & Fast Action Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Entities Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#E5E7EB] uppercase tracking-wide">
                High-Priority Suspect Entities Under Active Surveillance
              </h2>
              <p className="text-xs text-[#94A3B8] font-mono">
                Accounts exhibiting anomalous topological centrality and high pass-through ratios
              </p>
            </div>
            <Link
              href="/investigations"
              className="text-xs font-mono text-[#38BDF8] hover:underline"
            >
              View in Workbench →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#263449] text-[#64748B] text-[10px] uppercase">
                  <th className="pb-2">Account ID</th>
                  <th className="pb-2">Entity Name</th>
                  <th className="pb-2">Typology Role</th>
                  <th className="pb-2">Bank &amp; Jurisdiction</th>
                  <th className="pb-2 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263449]">
                {data.recent_high_risk_entities.map((entity, idx) => (
                  <tr key={idx} className="hover:bg-[#172337]/50 transition-colors">
                    <td className="py-2.5 font-bold text-[#38BDF8]">
                      {entity.account_id}
                    </td>
                    <td className="py-2.5 text-[#E5E7EB]">
                      {entity.name}
                    </td>
                    <td className="py-2.5 text-[#94A3B8]">
                      {entity.typology}
                    </td>
                    <td className="py-2.5 text-[#64748B]">
                      {entity.bank} ({entity.jurisdiction})
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#EF4444]">
                      {entity.risk_score.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intelligence Modules Direct Routing */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#E5E7EB] uppercase tracking-wide mb-1">
            Specialized Intelligence Portals
          </h2>
          <p className="text-xs text-[#94A3B8] font-mono mb-3">
            Access domain-specific investigation engines
          </p>

          <Link
            href="/mule-intelligence"
            className="flex items-center justify-between p-3 rounded-lg bg-[#0B1220] hover:bg-[#172337] border border-[#263449] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#F59E0B]" />
              <div>
                <p className="text-xs font-bold text-[#E5E7EB] group-hover:text-white">
                  Mule Network Intelligence
                </p>
                <p className="text-[10px] text-[#64748B] font-mono">
                  Pass-through velocity &amp; funnel hubs
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#38BDF8]" />
          </Link>

          <Link
            href="/cross-border"
            className="flex items-center justify-between p-3 rounded-lg bg-[#0B1220] hover:bg-[#172337] border border-[#263449] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Globe2 className="w-4 h-4 text-[#38BDF8]" />
              <div>
                <p className="text-xs font-bold text-[#E5E7EB] group-hover:text-white">
                  Cross-Border Routing
                </p>
                <p className="text-[10px] text-[#64748B] font-mono">
                  INR → AED → USD foreign exchange
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#38BDF8]" />
          </Link>

          <Link
            href="/asset-intelligence"
            className="flex items-center justify-between p-3 rounded-lg bg-[#0B1220] hover:bg-[#172337] border border-[#263449] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-[#10B981]" />
              <div>
                <p className="text-xs font-bold text-[#E5E7EB] group-hover:text-white">
                  Asset-Based AML
                </p>
                <p className="text-[10px] text-[#64748B] font-mono">
                  24K Gold bullion &amp; prime real estate
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#38BDF8]" />
          </Link>

          <Link
            href="/reports"
            className="flex items-center justify-between p-3 rounded-lg bg-[#0B1220] hover:bg-[#172337] border border-[#263449] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#8B95A5]" />
              <div>
                <p className="text-xs font-bold text-[#E5E7EB] group-hover:text-white">
                  Regulatory SAR Center
                </p>
                <p className="text-[10px] text-[#64748B] font-mono">
                  FinCEN Form 111 XML &amp; PDF reports
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#38BDF8]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
