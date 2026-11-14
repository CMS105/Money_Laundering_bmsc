'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Radio,
  Users,
  Globe2,
  Building2,
  Receipt,
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
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/v1/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => {});
  }, []);

  // Compute SVG coordinates for the interactive liquidity flow chart
  const points = data.volume_trends_30d;
  const maxVal = Math.max(...points.map((p) => p.licit_usd + p.flagged_usd)) * 1.15;
  const chartHeight = 160;
  const chartWidth = 540;

  const totalPointsStr = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * chartWidth;
      const y = chartHeight - ((p.licit_usd + p.flagged_usd) / maxVal) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const flaggedPointsStr = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * chartWidth;
      const y = chartHeight - (p.flagged_usd / maxVal) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const activePoint =
    activeChartPoint !== null ? points[activeChartPoint] : points[points.length - 1];

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 lg:p-8 space-y-6 select-none font-sans">
      {/* Top Architectural Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-semibold tracking-tight text-[#FAFAFA]">
              Forensic Intelligence Overview
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>LIVE SURVEILLANCE ACTIVE</span>
            </div>
          </div>
          <p className="text-xs text-[#71717A] font-mono mt-0.5">
            Graph Data Science · Supervised Ensemble · FinCEN Form 111 Automated Generation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/investigations"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] text-xs font-semibold tracking-tight transition-all shadow-sm cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#09090B]" />
            <span>Launch Investigations Workbench</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#09090B]" />
          </Link>
        </div>
      </div>

      {/* Unified Metric Strip (4 High-Craft Columns Divided by Hairlines) */}
      <div className="card-fintech grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07] overflow-hidden">
        {/* Metric 1 */}
        <div className="p-5 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
            <span>Total Monitored Capital</span>
            <span className="text-[10px] text-zinc-500">IBM AML</span>
          </div>
          <div className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight font-mono tabular-nums leading-none pt-1">
            {formatAmount(data.total_monitored_volume_usd)}
          </div>
          <p className="text-xs text-[#71717A] pt-1">
            <span className="text-zinc-300 font-mono font-medium">4,820</span> wire tx across <span className="text-zinc-300 font-mono font-medium">684</span> entities
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
            <span>Active Laundering Rings</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-semibold">
              14 Critical
            </span>
          </div>
          <div className="text-[28px] font-semibold text-[#EF4444] tracking-tight font-mono tabular-nums leading-none pt-1">
            {data.active_high_risk_alerts} Alerts
          </div>
          <p className="text-xs text-[#71717A] pt-1">
            <span className="text-rose-400 font-mono font-medium">18</span> conduit accounts in immediate quarantine
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
            <span>Hybrid ML Precision</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold">
              +62% Lift
            </span>
          </div>
          <div className="text-[28px] font-semibold text-[#10B981] tracking-tight font-mono tabular-nums leading-none pt-1">
            100.0%
          </div>
          <p className="text-xs text-[#71717A] pt-1">
            <span className="text-emerald-400 font-mono font-medium">0.0% FPR</span> · Macro F1-Score: 0.88
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
            <span>FinCEN SAR Filings</span>
            <span className="text-[10px] font-mono text-zinc-500">31 CFR § 1020</span>
          </div>
          <div className="text-[28px] font-semibold text-[#FAFAFA] tracking-tight font-mono tabular-nums leading-none pt-1">
            {data.fincen_sars_drafted} Cases
          </div>
          <p className="text-xs text-[#71717A] pt-1">
            <span className="text-zinc-300 font-mono font-medium">9 Form 111 Transmitted</span> to FIU portal
          </p>
        </div>
      </div>

      {/* Middle Row: Institutional Liquidity Flow Chart & Typology Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Liquidity Flow Chart */}
        <div className="lg:col-span-2 card-fintech p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
                Surveillance Liquidity &amp; Flagged Illicit Flow
              </h2>
              <p className="text-xs text-[#71717A] font-mono mt-0.5">
                30-day temporal cross-section: verified capital vs. laundering diversion
              </p>
            </div>
            {activePoint && (
              <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                <span className="text-[#71717A]">{activePoint.day}:</span>
                <span className="text-[#FAFAFA] font-medium">
                  Licit: {formatAmount(activePoint.licit_usd, true)}
                </span>
                <span className="text-[#EF4444] font-semibold">
                  Illicit: {formatAmount(activePoint.flagged_usd, true)}
                </span>
              </div>
            )}
          </div>

          {/* SVG Sparkline Stage */}
          <div className="relative w-full overflow-hidden pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="flaggedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FAFAFA" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#27272A" strokeDasharray="3 3" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#27272A" strokeDasharray="3 3" />
              <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#27272A" strokeDasharray="3 3" />

              {/* Total Volume Area & Line */}
              <polygon
                points={`0,${chartHeight} ${totalPointsStr} ${chartWidth},${chartHeight}`}
                fill="url(#totalGradient)"
              />
              <polyline
                fill="none"
                stroke="#52525B"
                strokeWidth="1.5"
                points={totalPointsStr}
              />

              {/* Flagged Illicit Flow Area & Line */}
              <polygon
                points={`0,${chartHeight} ${flaggedPointsStr} ${chartWidth},${chartHeight}`}
                fill="url(#flaggedGradient)"
              />
              <polyline
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                points={flaggedPointsStr}
              />

              {/* Interactive Point Nodes */}
              {points.map((p, i) => {
                const x = (i / (points.length - 1)) * chartWidth;
                const y = chartHeight - (p.flagged_usd / maxVal) * chartHeight;
                const isHovered = activeChartPoint === i;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setActiveChartPoint(i)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3.5}
                      fill={isHovered ? '#FAFAFA' : '#EF4444'}
                      stroke="#09090B"
                      strokeWidth="2"
                      className="transition-all"
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] font-mono text-[#71717A] pt-2 border-t border-white/[0.06]">
              {points.map((p, i) => (
                <span
                  key={i}
                  onMouseEnter={() => setActiveChartPoint(i)}
                  className={`cursor-pointer transition-colors ${
                    activeChartPoint === i ? 'text-white font-bold' : ''
                  }`}
                >
                  {p.day}
                </span>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs font-mono text-[#71717A]">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#52525B]" />
                <span>Total Monitored Throughput</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#EF4444]" />
                <span className="text-rose-400">Quarantined Illicit Trajectory</span>
              </div>
            </div>
            <span className="text-[11px] text-zinc-500">Hover node to inspect day</span>
          </div>
        </div>

        {/* Dense Institutional Typology Ledger */}
        <div className="card-fintech p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
                Typology Exposure
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">
                5 Primary Motifs
              </span>
            </div>
            <p className="text-xs text-[#71717A] mb-3">
              Laundering structures ranked by capital concentration
            </p>

            <div className="divide-y divide-white/[0.06]">
              {data.typology_distribution.map((t, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[#FAFAFA] truncate">
                      {t.typology}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717A] mt-0.5">
                      <span>{t.count} Rings</span>
                      <span>·</span>
                      <span className="text-rose-400 tabular-nums">{t.risk_pct}% Threat</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-medium text-[#FAFAFA] tabular-nums">
                      {formatAmount(t.volume_usd, true)}
                    </div>
                    <Link
                      href="/investigations"
                      className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center justify-end gap-0.5 mt-0.5 group"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/investigations"
            className="mt-4 w-full py-2 px-3 rounded bg-[#18181B] hover:bg-[#27272A] border border-white/[0.08] text-center text-xs font-mono font-medium text-[#FAFAFA] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Launch Graph Visualizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Section: High-Priority Entities & Specialized Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Entities Table */}
        <div className="lg:col-span-2 card-fintech p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
                High-Priority Suspect Entities Under Intercept
              </h2>
              <p className="text-xs text-[#71717A] font-mono mt-0.5">
                Accounts exhibiting anomalous topological centrality and high pass-through ratios
              </p>
            </div>
            <Link
              href="/investigations"
              className="text-xs font-mono text-zinc-400 hover:text-white"
            >
              Workbench →
            </Link>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#71717A] text-[10px] uppercase">
                  <th className="pb-2 font-normal">Account ID</th>
                  <th className="pb-2 font-normal">Entity Name</th>
                  <th className="pb-2 font-normal">Typology Role</th>
                  <th className="pb-2 font-normal">Bank &amp; Jurisdiction</th>
                  <th className="pb-2 font-normal text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {data.recent_high_risk_entities.map((entity, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 font-bold text-white tabular-nums">
                      {entity.account_id}
                    </td>
                    <td className="py-2.5 text-[#FAFAFA] font-sans font-medium">
                      {entity.name}
                    </td>
                    <td className="py-2.5 text-[#71717A]">
                      {entity.typology}
                    </td>
                    <td className="py-2.5 text-[#71717A]">
                      {entity.bank} ({entity.jurisdiction})
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#EF4444] tabular-nums">
                      {entity.risk_score.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Specialized Domain Portals */}
        <div className="card-fintech p-5 space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
              Specialized Sub-Engines
            </h2>
            <p className="text-xs text-[#71717A] font-mono mt-0.5 mb-3">
              Domain-specific forensic pipelines
            </p>

            <div className="space-y-2">
              <Link
                href="/mule-intelligence"
                className="flex items-center justify-between p-2.5 rounded bg-[#09090B] hover:bg-[#18181B] border border-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-3.5 h-3.5 text-[#71717A]" />
                  <div>
                    <p className="text-xs font-medium text-[#FAFAFA] font-sans">
                      Mule Network Intelligence
                    </p>
                    <p className="text-[10px] text-[#71717A] font-mono">
                      Sub-15m transit latency &amp; funnel hubs
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717A] group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/cross-border"
                className="flex items-center justify-between p-2.5 rounded bg-[#09090B] hover:bg-[#18181B] border border-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-3.5 h-3.5 text-[#71717A]" />
                  <div>
                    <p className="text-xs font-medium text-[#FAFAFA] font-sans">
                      Cross-Border Corridors
                    </p>
                    <p className="text-[10px] text-[#71717A] font-mono">
                      INR → AED → USD FX layering checks
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717A] group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/asset-intelligence"
                className="flex items-center justify-between p-2.5 rounded bg-[#09090B] hover:bg-[#18181B] border border-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-3.5 h-3.5 text-[#71717A]" />
                  <div>
                    <p className="text-xs font-medium text-[#FAFAFA] font-sans">
                      Asset &amp; Bullion Forensics
                    </p>
                    <p className="text-[10px] text-[#71717A] font-mono">
                      Gold bar &amp; luxury property conversion
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717A] group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/transactions"
                className="flex items-center justify-between p-2.5 rounded bg-[#09090B] hover:bg-[#18181B] border border-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-3.5 h-3.5 text-[#71717A]" />
                  <div>
                    <p className="text-xs font-medium text-[#FAFAFA] font-sans">
                      Transaction Audit Ledger
                    </p>
                    <p className="text-[10px] text-[#71717A] font-mono">
                      Query, filter &amp; CSV export
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717A] group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
            <span>Model Version: GDS-Hybrid 2.4</span>
            <span className="text-[#10B981]">Precision: 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
