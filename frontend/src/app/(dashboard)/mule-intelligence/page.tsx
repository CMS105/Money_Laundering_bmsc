'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface MuleRecord {
  mule_id: string;
  account_id: string;
  beneficiary_name: string;
  bank: string;
  pass_through_ratio: number;
  dwell_time_mins: number;
  total_inflow_usd: number;
  total_outflow_usd: number;
  counterparty_in_count: number;
  counterparty_out_count: number;
  isolation_score: number;
  quarantine_status: string;
  typology_role: string;
  linked_syndicate: string;
  police_flag: string;
}

const FALLBACK_MULES: MuleRecord[] = [
  {
    mule_id: 'MULE-8821',
    account_id: '070_ACC_3301',
    beneficiary_name: 'Farhan Enterprises FZE',
    bank: 'Emirates NBD, Dubai',
    pass_through_ratio: 97.2,
    dwell_time_mins: 8.4,
    total_inflow_usd: 3600000.0,
    total_outflow_usd: 3500000.0,
    counterparty_in_count: 7,
    counterparty_out_count: 1,
    isolation_score: 94.6,
    quarantine_status: 'QUARANTINED',
    typology_role: 'Primary Wire Conduit',
    linked_syndicate: 'Dubai-Mumbai Hawala Corridor',
    police_flag: 'Active Interpol Purple Notice',
  },
  {
    mule_id: 'MULE-4419',
    account_id: '010_ACC_4118',
    beneficiary_name: 'Rohan J. Mehta (Student Account)',
    bank: 'ICICI Bank, Bandra West',
    pass_through_ratio: 98.8,
    dwell_time_mins: 3.2,
    total_inflow_usd: 480000.0,
    total_outflow_usd: 475000.0,
    counterparty_in_count: 28,
    counterparty_out_count: 2,
    isolation_score: 92.1,
    quarantine_status: 'QUARANTINED',
    typology_role: 'Funnel Smurf Collector',
    linked_syndicate: 'Digital Arrest Extortion Ring',
    police_flag: 'Delhi Police Cyber Cell First Lead',
  },
  {
    mule_id: 'MULE-6602',
    account_id: '030_ACC_7729',
    beneficiary_name: 'Apex Cargo Clearing Ltd',
    bank: 'Barclays Bank, London',
    pass_through_ratio: 95.0,
    dwell_time_mins: 14.0,
    total_inflow_usd: 1250000.0,
    total_outflow_usd: 1190000.0,
    counterparty_in_count: 3,
    counterparty_out_count: 4,
    isolation_score: 89.4,
    quarantine_status: 'FLAGGED_MONITORING',
    typology_role: 'European Relay Hop',
    linked_syndicate: 'Euro-Med VAT Carousel',
    police_flag: 'NCA Intelligence Inquiry',
  },
  {
    mule_id: 'MULE-9014',
    account_id: '080_ACC_6211',
    beneficiary_name: 'Tariq Mansoor Global Exports',
    bank: 'Mashreq Bank, Deira',
    pass_through_ratio: 99.1,
    dwell_time_mins: 5.1,
    total_inflow_usd: 2800000.0,
    total_outflow_usd: 2780000.0,
    counterparty_in_count: 12,
    counterparty_out_count: 1,
    isolation_score: 96.8,
    quarantine_status: 'QUARANTINED',
    typology_role: 'Aggregator Funnel Hub',
    linked_syndicate: 'Pig-Butchering Investment Shell',
    police_flag: 'ED PMLA Court Warrant',
  },
  {
    mule_id: 'MULE-1185',
    account_id: '040_ACC_2091',
    beneficiary_name: 'Kowloon Swift Trading Ltd',
    bank: 'HSBC Hong Kong',
    pass_through_ratio: 96.5,
    dwell_time_mins: 11.2,
    total_inflow_usd: 1850000.0,
    total_outflow_usd: 1790000.0,
    counterparty_in_count: 6,
    counterparty_out_count: 2,
    isolation_score: 91.0,
    quarantine_status: 'FLAGGED_MONITORING',
    typology_role: 'Southeast Asia Layering',
    linked_syndicate: 'Triad Offshore Capital Flight',
    police_flag: 'HKMA Regulatory Audit',
  },
];

export default function MuleIntelligencePage() {
  const { formatAmount } = useCurrency();
  const [mules, setMules] = useState<MuleRecord[]>(FALLBACK_MULES);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/mule-intelligence')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.mules) setMules(data.mules);
      })
      .catch(() => {});
  }, []);

  const handleToggleQuarantine = (account_id: string) => {
    setMules((prev) =>
      prev.map((m) => {
        if (m.account_id === account_id) {
          const nextStatus = m.quarantine_status === 'QUARANTINED' ? 'FLAGGED_MONITORING' : 'QUARANTINED';
          setToast(`Account ${account_id} quarantine status changed to ${nextStatus}.`);
          setTimeout(() => setToast(null), 4000);
          return { ...m, quarantine_status: nextStatus };
        }
        return m;
      })
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#111C2E] border border-[#38BDF8] shadow-2xl text-xs font-mono text-[#E5E7EB]">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#263449]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#E5E7EB] tracking-wide uppercase">
              Money Mule &amp; Conduit Account Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
              5 Flagged Networks
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Rapid pass-through detection · Dwell latency analysis · Funnel hub isolation
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449]">
          <p className="text-xs font-mono text-[#94A3B8]">Average Pass-Through Ratio</p>
          <p className="text-2xl font-black font-mono text-[#EF4444] mt-1 tabular-nums">97.3%</p>
          <p className="text-[11px] text-[#64748B] font-mono mt-1">&lt; 3% capital retained on account</p>
        </div>
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449]">
          <p className="text-xs font-mono text-[#94A3B8]">Average Dwell Latency</p>
          <p className="text-2xl font-black font-mono text-[#F59E0B] mt-1 tabular-nums">8.4 mins</p>
          <p className="text-[11px] text-[#64748B] font-mono mt-1">Immediate liquidation into crypto/offshore</p>
        </div>
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449]">
          <p className="text-xs font-mono text-[#94A3B8]">Quarantined Conduits</p>
          <p className="text-2xl font-black font-mono text-[#22C55E] mt-1 tabular-nums">
            {mules.filter((m) => m.quarantine_status === 'QUARANTINED').length} / {mules.length}
          </p>
          <p className="text-[11px] text-[#64748B] font-mono mt-1">Under statutory debit freeze</p>
        </div>
        <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449]">
          <p className="text-xs font-mono text-[#94A3B8]">Total Intercepted Conduit Flow</p>
          <p className="text-2xl font-black font-mono text-[#38BDF8] mt-1 tabular-nums">
            {formatAmount(mules.reduce((acc, m) => acc + m.total_inflow_usd, 0))}
          </p>
          <p className="text-[11px] text-[#64748B] font-mono mt-1">Aggregated across 5 detected rings</p>
        </div>
      </div>

      {/* Mule Accounts Table */}
      <div className="p-5 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm">
        <h2 className="text-sm font-bold text-[#E5E7EB] uppercase tracking-wide mb-1">
          Identified Money Mule Profiles &amp; Surveillance Status
        </h2>
        <p className="text-xs text-[#94A3B8] font-mono mb-4">
          Ranked by pass-through velocity and law enforcement priority notice
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#263449] text-[#64748B] text-[10px] uppercase">
                <th className="pb-2">Mule ID / Account</th>
                <th className="pb-2">Beneficiary &amp; Bank</th>
                <th className="pb-2">Pass-Through %</th>
                <th className="pb-2">Latency</th>
                <th className="pb-2">Inflow / Outflow</th>
                <th className="pb-2">Counterparties</th>
                <th className="pb-2">Law Enforcement Notice</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449]">
              {mules.map((mule) => (
                <tr key={mule.mule_id} className="hover:bg-[#172337]/50 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-[#38BDF8] block">{mule.mule_id}</span>
                    <span className="text-[11px] text-[#94A3B8]">{mule.account_id}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-[#E5E7EB] block">{mule.beneficiary_name}</span>
                    <span className="text-[11px] text-[#64748B]">{mule.bank}</span>
                  </td>
                  <td className="py-3 font-bold text-[#EF4444] tabular-nums">
                    {mule.pass_through_ratio.toFixed(1)}%
                  </td>
                  <td className="py-3 text-[#F59E0B] tabular-nums">
                    {mule.dwell_time_mins} mins
                  </td>
                  <td className="py-3 tabular-nums">
                    <span className="text-[#22C55E] block">+{formatAmount(mule.total_inflow_usd)}</span>
                    <span className="text-[#EF4444] block">-{formatAmount(mule.total_outflow_usd)}</span>
                  </td>
                  <td className="py-3 text-[#94A3B8]">
                    In: {mule.counterparty_in_count} | Out: {mule.counterparty_out_count}
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 px-1.5 py-0.5 rounded block w-fit">
                      {mule.police_flag}
                    </span>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">{mule.linked_syndicate}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        mule.quarantine_status === 'QUARANTINED'
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                      }`}
                    >
                      {mule.quarantine_status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleQuarantine(mule.account_id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border ${
                        mule.quarantine_status === 'QUARANTINED'
                          ? 'bg-[#172337] text-[#94A3B8] border-[#263449] hover:text-white'
                          : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 hover:bg-[#EF4444]/30'
                      }`}
                    >
                      {mule.quarantine_status === 'QUARANTINED' ? 'Unfreeze' : 'Quarantine'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
