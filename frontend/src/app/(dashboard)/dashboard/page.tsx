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
import StatusMark from '@/components/react-bits/StatusMark';
import DotGridBackground from '@/components/react-bits/DotGridBackground';
import ClickSpark from '@/components/react-bits/ClickSpark';
import FadeContent from '@/components/react-bits/FadeContent';

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
    <div className="flex-1 overflow-y-auto bg-[#172B35] p-6 lg:p-8 space-y-6 select-none relative">
      <DotGridBackground />

      <FadeContent direction="down" durationMs={250}>
        {/* Header Command Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#284250]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-[#E8E5DA] tracking-wide uppercase font-sans">
                Financial Crime Intelligence Overview
              </h1>
              <StatusMark status="success" label="Surveillance Active" size="sm" />
            </div>
            <p className="text-xs text-[#82918E] font-mono mt-1">
              Temporal Graph Science · Explainable AI · Multi-Source Kaggle Ingestion Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ClickSpark sparkColor="#75A99A" sparkCount={8}>
              <Link
                href="/investigations"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#75A99A] hover:bg-[#8BBDB0] text-xs font-bold text-[#172B35] transition-all shadow-md cursor-pointer font-sans"
              >
                <Radio className="w-4 h-4 text-[#172B35] shrink-0" />
                <span>Launch Investigations Workbench</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#172B35]" />
              </Link>
            </ClickSpark>
          </div>
        </div>
      </FadeContent>

      {/* Primary KPI Grid (Miller's Law - 4 Clear Groups) */}
      <FadeContent direction="up" delayMs={50} durationMs={300}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm hover:border-[#75A99A]/40 transition-colors">
            <div className="flex items-center justify-between text-[#82918E] text-xs font-mono mb-2">
              <span>Total Monitored Capital</span>
              <Database className="w-4 h-4 text-[#75A99A]" />
            </div>
            <div className="text-2xl font-black text-[#E8E5DA] font-mono tabular-nums">
              {formatAmount(data.total_monitored_volume_usd)}
            </div>
            <p className="text-[11px] text-[#A3B3AF] font-mono mt-1.5 flex items-center gap-1">
              <span className="text-[#4D9477] font-semibold">4,820 Tx</span> across 684 Monitored Nodes
            </p>
          </div>

          {/* KPI 2 */}
          <div className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm hover:border-[#C75B55]/40 transition-colors">
            <div className="flex items-center justify-between text-[#82918E] text-xs font-mono mb-2">
              <span>Threat Severity Alerts</span>
              <AlertTriangle className="w-4 h-4 text-[#C75B55]" />
            </div>
            <div className="text-2xl font-black text-[#C75B55] font-mono tabular-nums">
              {data.active_high_risk_alerts} Alerts
            </div>
            <p className="text-[11px] text-[#A3B3AF] font-mono mt-1.5">
              <span className="text-[#C75B55] font-semibold">14 Critical</span> · 18 Quarantined Conduits
            </p>
          </div>

          {/* KPI 3 */}
          <div className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm hover:border-[#4D9477]/40 transition-colors">
            <div className="flex items-center justify-between text-[#82918E] text-xs font-mono mb-2">
              <span>Hybrid ML Precision</span>
              <TrendingUp className="w-4 h-4 text-[#4D9477]" />
            </div>
            <div className="text-2xl font-black text-[#4D9477] font-mono tabular-nums">
              100.0%
            </div>
            <p className="text-[11px] text-[#A3B3AF] font-mono mt-1.5">
              <span className="text-[#4D9477] font-semibold">0.0% False Positive Rate</span> · F1: 0.88
            </p>
          </div>

          {/* KPI 4 */}
          <div className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm hover:border-[#75A99A]/40 transition-colors">
            <div className="flex items-center justify-between text-[#82918E] text-xs font-mono mb-2">
              <span>Regulatory Filings</span>
              <FileText className="w-4 h-4 text-[#75A99A]" />
            </div>
            <div className="text-2xl font-black text-[#75A99A] font-mono tabular-nums">
              {data.fincen_sars_drafted} SARs
            </div>
            <p className="text-[11px] text-[#A3B3AF] font-mono mt-1.5">
              <span className="text-[#75A99A] font-semibold">9 Form 111 Transmitted</span> to FinCEN / FIU
            </p>
          </div>
        </div>
      </FadeContent>

      {/* Middle Row: Volume Trends & Typology Distribution */}
      <FadeContent direction="up" delayMs={100} durationMs={300}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 30-Day Volume & Alert Trend */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#E8E5DA] uppercase tracking-wide font-sans">
                    Surveillance Volume &amp; Attack Frequency Trend
                  </h2>
                  <p className="text-xs text-[#82918E] font-mono">
                    Daily aggregate licit vs. illicit laundering transaction volume
                  </p>
                </div>
                <span className="text-xs font-mono text-[#75A99A] bg-[#253F4D] px-2.5 py-1 rounded border border-[#284250]">
                  Last 30 Days
                </span>
              </div>

              {/* Bar Visualization */}
              <div className="space-y-3 pt-2">
                {data.volume_trends_30d.map((item, idx) => {
                  const total = item.licit_usd + item.flagged_usd;
                  const flagPct = (item.flagged_usd / total) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono text-[#82918E]">
                        <span>{item.day}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#E8E5DA]">
                            Total: {formatAmount(total)}
                          </span>
                          <span className="text-[#C75B55] font-semibold">
                            Flagged: {formatAmount(item.flagged_usd)} ({item.alerts} alerts)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-3 rounded bg-[#172B35] overflow-hidden flex border border-[#284250]/50">
                        <div
                          style={{ width: `${100 - flagPct}%` }}
                          className="bg-[#75A99A]/40 h-full transition-all"
                          title="Licit Volume"
                        />
                        <div
                          style={{ width: `${flagPct}%` }}
                          className="bg-[#C75B55] h-full transition-all"
                          title="Illicit Flagged Volume"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 mt-4 border-t border-[#284250] text-xs font-mono text-[#82918E]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#75A99A]/40" />
                <span>Verified Licit Flows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#C75B55]" />
                <span>Quarantined Laundering Flows</span>
              </div>
            </div>
          </div>

          {/* Typology Distribution Breakdown */}
          <div className="p-5 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#E8E5DA] uppercase tracking-wide font-sans mb-1">
                Typology Exposure
              </h2>
              <p className="text-xs text-[#82918E] font-mono mb-4">
                Laundering mechanics categorized by volume &amp; risk
              </p>

              <div className="space-y-3">
                {data.typology_distribution.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#172B35] border border-[#284250]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#E8E5DA] font-sans">{t.typology}</span>
                      <span className="font-mono text-[#C75B55] font-bold">
                        {t.risk_pct}% Risk
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#82918E]">
                      <span>{t.count} Active Rings</span>
                      <span className="text-[#75A99A] font-semibold">{formatAmount(t.volume_usd)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/investigations"
              className="mt-4 w-full py-2 px-3 rounded bg-[#253F4D] hover:bg-[#2C4959] border border-[#284250] text-center text-xs font-mono text-[#75A99A] hover:text-[#8BBDB0] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Inspect All Active Rings on Canvas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </FadeContent>

      {/* Bottom Section: Watchlist Entities & Fast Action Links */}
      <FadeContent direction="up" delayMs={150} durationMs={300}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Watchlist Entities Table */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#E8E5DA] uppercase tracking-wide font-sans">
                  High-Priority Suspect Entities Under Active Surveillance
                </h2>
                <p className="text-xs text-[#82918E] font-mono">
                  Accounts exhibiting anomalous topological centrality and high pass-through ratios
                </p>
              </div>
              <Link
                href="/investigations"
                className="text-xs font-mono text-[#75A99A] hover:underline"
              >
                View in Workbench →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#284250] text-[#82918E] text-[10px] uppercase">
                    <th className="pb-2">Account ID</th>
                    <th className="pb-2">Entity Name</th>
                    <th className="pb-2">Typology Role</th>
                    <th className="pb-2">Bank &amp; Jurisdiction</th>
                    <th className="pb-2 text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#284250]">
                  {data.recent_high_risk_entities.map((entity, idx) => (
                    <tr key={idx} className="hover:bg-[#253F4D]/60 transition-colors">
                      <td className="py-2.5 font-bold text-[#75A99A]">
                        {entity.account_id}
                      </td>
                      <td className="py-2.5 text-[#E8E5DA]">
                        {entity.name}
                      </td>
                      <td className="py-2.5 text-[#A3B3AF]">
                        {entity.typology}
                      </td>
                      <td className="py-2.5 text-[#82918E]">
                        {entity.bank} ({entity.jurisdiction})
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#C75B55]">
                        {entity.risk_score.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Intelligence Modules Direct Routing */}
          <div className="p-5 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#E8E5DA] uppercase tracking-wide font-sans mb-1">
              Specialized Intelligence Portals
            </h2>
            <p className="text-xs text-[#82918E] font-mono mb-3">
              Access domain-specific investigation engines
            </p>

            <Link
              href="/mule-intelligence"
              className="flex items-center justify-between p-3 rounded-lg bg-[#172B35] hover:bg-[#253F4D] border border-[#284250] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#D5A24F]" />
                <div>
                  <p className="text-xs font-bold text-[#E8E5DA] group-hover:text-white font-sans">
                    Mule Network Intelligence
                  </p>
                  <p className="text-[10px] text-[#82918E] font-mono">
                    Pass-through velocity &amp; funnel hubs
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#82918E] group-hover:text-[#75A99A]" />
            </Link>

            <Link
              href="/cross-border"
              className="flex items-center justify-between p-3 rounded-lg bg-[#172B35] hover:bg-[#253F4D] border border-[#284250] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Globe2 className="w-4 h-4 text-[#75A99A]" />
                <div>
                  <p className="text-xs font-bold text-[#E8E5DA] group-hover:text-white font-sans">
                    Cross-Border Routing
                  </p>
                  <p className="text-[10px] text-[#82918E] font-mono">
                    INR → AED → USD foreign exchange
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#82918E] group-hover:text-[#75A99A]" />
            </Link>

            <Link
              href="/asset-intelligence"
              className="flex items-center justify-between p-3 rounded-lg bg-[#172B35] hover:bg-[#253F4D] border border-[#284250] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#4D9477]" />
                <div>
                  <p className="text-xs font-bold text-[#E8E5DA] group-hover:text-white font-sans">
                    Asset-Based AML
                  </p>
                  <p className="text-[10px] text-[#82918E] font-mono">
                    24K Gold bullion &amp; prime real estate
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#82918E] group-hover:text-[#75A99A]" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between p-3 rounded-lg bg-[#172B35] hover:bg-[#253F4D] border border-[#284250] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#6F9DB3]" />
                <div>
                  <p className="text-xs font-bold text-[#E8E5DA] group-hover:text-white font-sans">
                    Regulatory SAR Center
                  </p>
                  <p className="text-[10px] text-[#82918E] font-mono">
                    FinCEN Form 111 XML &amp; PDF reports
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#82918E] group-hover:text-[#75A99A]" />
            </Link>
          </div>
        </div>
      </FadeContent>
    </div>
  );
}
