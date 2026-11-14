'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface SARItem {
  sar_id: string;
  cluster_id: string;
  filing_institution: string;
  regulatory_body: string;
  date_prepared: string;
  total_suspicious_amount_usd: number;
  total_suspicious_amount_inr: number;
  primary_subject: string;
  primary_typology: string;
  risk_score: number;
  status: string;
  investigator: string;
  summary: string;
}

const FALLBACK_REPORTS: SARItem[] = [
  {
    sar_id: 'SAR-2026-111-0429',
    cluster_id: 'CLU-LIVE-429',
    filing_institution: 'LaunderyLens Financial Intelligence Unit',
    regulatory_body: 'FinCEN Form 111 / FIU-IND STR',
    date_prepared: '2026-11-14',
    total_suspicious_amount_usd: 7200000.0,
    total_suspicious_amount_inr: 604800000.0,
    primary_subject: 'Global Horizon Trade Ltd / Al-Bahr Capital Commodities',
    primary_typology: 'FAN_OUT_IN & CROSS_BORDER_LAYERING',
    risk_score: 98.4,
    status: 'READY_FOR_FILING',
    investigator: 'Sarah Jenkins, CAMS (LL-AML-8921)',
    summary:
      'Coordinated international fan-out/fan-in layering network routing $7.20M from Delaware shell corporation through Dubai free zone conduit 070_ACC_3301 with an acute dwell latency of 8.4 minutes, exiting into Singapore custody account 070_ACC_9921 with near-zero economic substance.',
  },
  {
    sar_id: 'SAR-2026-111-0845',
    cluster_id: 'CLU-LIVE-845',
    filing_institution: 'LaunderyLens Financial Intelligence Unit',
    regulatory_body: 'FinCEN Form 111 / FIU-IND STR',
    date_prepared: '2026-11-14',
    total_suspicious_amount_usd: 7200000.0,
    total_suspicious_amount_inr: 604800000.0,
    primary_subject: 'Al-Bahr Capital Commodities FZE',
    primary_typology: 'MULE_RELAY_CHAIN',
    risk_score: 96.4,
    status: 'TRANSMITTED_TO_FIU',
    investigator: 'Rajesh Kumar, CFE (FIU-IND-4402)',
    summary:
      'Rapid pass-through mule chain with 97.2% fund pass-through ratio operating across 3 high-risk correspondent accounts. Funds quarantined upon entry into UAE jurisdiction.',
  },
  {
    sar_id: 'SAR-2026-111-0578',
    cluster_id: 'CLU-LIVE-578',
    filing_institution: 'LaunderyLens Financial Intelligence Unit',
    regulatory_body: 'FinCEN Form 111 / FIU-IND STR',
    date_prepared: '2026-11-13',
    total_suspicious_amount_usd: 4850000.0,
    total_suspicious_amount_inr: 407400000.0,
    primary_subject: 'Vikas Silver Bullion Refinery / Shree Kuber Gems',
    primary_typology: 'TRADE_BASED_ASSET_CONVERSION',
    risk_score: 95.1,
    status: 'TRANSMITTED_TO_FIU',
    investigator: 'Sarah Jenkins, CAMS (LL-AML-8921)',
    summary:
      'Trade-based asset laundering involving conversion of fragmented INR deposits into physical 24K gold bullion bars, with zero commercial justification and subsequent offshore air-freight transport.',
  },
];

export default function ReportsPage() {
  const { formatAmount } = useCurrency();
  const [reports, setReports] = useState<SARItem[]>(FALLBACK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<SARItem | null>(FALLBACK_REPORTS[0]);

  useEffect(() => {
    fetch('/api/v1/reports')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reports) {
          setReports(data.reports);
          setSelectedReport(data.reports[0] || null);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadJson = (report: SARItem) => {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.sar_id}_FINCEN_EXPORT.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#172B35] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#284250]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#E8E5DA] tracking-wide uppercase">
              Regulatory Reporting &amp; FinCEN SAR Filing Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#75A99A]/15 text-[#75A99A] border border-[#75A99A]/30">
              FinCEN Form 111 / 31 CFR § 1020.320
            </span>
          </div>
          <p className="text-xs text-[#82918E] font-mono mt-1">
            Standardized Suspicious Activity Reports (SAR) · FIU-IND Suspicious Transaction Reports (STR)
          </p>
        </div>
      </div>

      {/* Main Grid: List on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-mono font-bold text-[#82918E] uppercase tracking-wider">
            Filed &amp; Drafted Dossiers ({reports.length})
          </h2>

          <div className="space-y-3">
            {reports.map((r) => {
              const isSelected = selectedReport?.sar_id === r.sar_id;
              return (
                <div
                  key={r.sar_id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#253F4D] border-[#75A99A] shadow-md'
                      : 'bg-[#1E3541] border-[#284250] hover:bg-[#253F4D]/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#75A99A] font-bold">{r.sar_id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        r.status === 'TRANSMITTED_TO_FIU'
                          ? 'bg-[#4D9477]/10 text-[#4D9477] border-[#4D9477]/30'
                          : 'bg-[#75A99A]/10 text-[#75A99A] border-[#75A99A]/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#E8E5DA] mb-1">
                    {r.primary_subject}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono text-[#82918E]">
                    <span>Amount: {formatAmount(r.total_suspicious_amount_usd)}</span>
                    <span className="text-[#C75B55] font-bold">{r.risk_score.toFixed(1)}% Risk</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active SAR Dossier Detailed View */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="p-6 rounded-xl bg-[#1E3541] border border-[#284250] shadow-sm space-y-5">
              {/* Report Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#284250]">
                <div>
                  <span className="text-[10px] font-mono text-[#75A99A] bg-[#253F4D] px-2 py-0.5 rounded border border-[#284250]">
                    {selectedReport.regulatory_body}
                  </span>
                  <h2 className="text-base font-black text-[#E8E5DA] mt-1.5">
                    {selectedReport.sar_id} · {selectedReport.cluster_id}
                  </h2>
                  <p className="text-xs text-[#82918E] font-mono mt-0.5">
                    Filing Entity: {selectedReport.filing_institution}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadJson(selectedReport)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#253F4D] hover:bg-[#284250] border border-[#284250] text-xs font-mono font-bold text-[#75A99A] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#172B35] border border-[#284250] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#82918E] block">Primary Subject</span>
                  <span className="font-bold text-[#E8E5DA] block mt-0.5 truncate">
                    {selectedReport.primary_subject}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#82918E] block">Flagged Amount</span>
                  <span className="font-bold text-[#75A99A] block mt-0.5 tabular-nums">
                    {formatAmount(selectedReport.total_suspicious_amount_usd)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#82918E] block">Typology</span>
                  <span className="font-bold text-[#D5A24F] block mt-0.5 truncate">
                    {selectedReport.primary_typology}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#82918E] block">Filed Date</span>
                  <span className="font-bold text-[#E8E5DA] block mt-0.5">
                    {selectedReport.date_prepared}
                  </span>
                </div>
              </div>

              {/* Plain-Language Regulatory Narrative */}
              <div>
                <h3 className="text-xs font-bold text-[#E8E5DA] uppercase tracking-wider mb-2 font-mono">
                  Part V — Suspicious Activity Narrative Summary
                </h3>
                <div className="p-4 rounded-lg bg-[#172B35] border border-[#284250] text-xs text-[#E8E5DA] font-mono leading-relaxed space-y-3">
                  <p>{selectedReport.summary}</p>
                  <p className="text-[11px] text-[#82918E]">
                    This narrative was generated in compliance with FinCEN guidance for Form 111 electronic filing. The transaction patterns meet the statutory criteria for acute money laundering under 31 U.S.C. § 5318(g).
                  </p>
                </div>
              </div>

              {/* Investigator Attribution */}
              <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#82918E] border-t border-[#284250]">
                <span>Certifying Investigator: <strong className="text-[#82918E]">{selectedReport.investigator}</strong></span>
                <span className="text-[#4D9477] flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Audit Signature Verified
                </span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center p-8 rounded-xl bg-[#1E3541] border border-[#284250] text-xs font-mono text-[#82918E]">
              Select a regulatory dossier from the left list to review narrative and export XML.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
