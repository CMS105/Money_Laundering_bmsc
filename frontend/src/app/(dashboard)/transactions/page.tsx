'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface TransactionItem {
  tx_id: string;
  timestamp: string;
  source_account: string;
  source_name: string;
  source_bank: string;
  target_account: string;
  target_name: string;
  target_bank: string;
  amount_usd: number;
  amount_inr: number;
  payment_format: string;
  typology: string;
  risk_level: string;
  risk_score: number;
  is_flagged: boolean;
  status: string;
}

const FALLBACK_TXS: TransactionItem[] = [
  {
    tx_id: 'TX-2026-9901',
    timestamp: '2026-11-14 18:24:10',
    source_account: '020_ACC_8819',
    source_name: 'Global Horizon Trade Ltd',
    source_bank: 'Bank of New York Mellon',
    target_account: '070_ACC_3301',
    target_name: 'Al-Bahr Capital Commodities',
    target_bank: 'Emirates NBD',
    amount_usd: 3600000.0,
    amount_inr: 302400000.0,
    payment_format: 'Fedwire / SWIFT MT103',
    typology: 'Cross-Border Layering',
    risk_level: 'CRITICAL',
    risk_score: 98.4,
    is_flagged: true,
    status: 'FROZEN_PENDING_SAR',
  },
  {
    tx_id: 'TX-2026-9902',
    timestamp: '2026-11-14 18:32:44',
    source_account: '070_ACC_3301',
    source_name: 'Al-Bahr Capital Commodities',
    source_bank: 'Emirates NBD',
    target_account: '070_ACC_9921',
    target_name: 'Zenith International Holdings',
    target_bank: 'Standard Chartered',
    amount_usd: 3500000.0,
    amount_inr: 294000000.0,
    payment_format: 'SWIFT Wire',
    typology: 'Rapid Pass-Through Mule',
    risk_level: 'CRITICAL',
    risk_score: 96.8,
    is_flagged: true,
    status: 'UNDER_INVESTIGATION',
  },
  {
    tx_id: 'TX-2026-9840',
    timestamp: '2026-11-14 16:15:20',
    source_account: '010_ACC_5502',
    source_name: 'Vikas Silver Bullion',
    source_bank: 'HDFC Bank',
    target_account: '010_ACC_9122',
    target_name: 'Zaveri Vault Custody',
    target_bank: 'Axis Bank',
    amount_usd: 1850000.0,
    amount_inr: 155400000.0,
    payment_format: 'RTGS Real-Time',
    typology: 'Asset Conversion',
    risk_level: 'CRITICAL',
    risk_score: 95.1,
    is_flagged: true,
    status: 'SAR_SUBMITTED',
  },
  {
    tx_id: 'TX-2026-9812',
    timestamp: '2026-11-14 15:40:05',
    source_account: '010_ACC_4118',
    source_name: 'Rohan J. Mehta (Mule)',
    source_bank: 'ICICI Bank',
    target_account: '080_ACC_6211',
    target_name: 'Tariq Mansoor Global',
    target_bank: 'Mashreq Bank',
    amount_usd: 475000.0,
    amount_inr: 39900000.0,
    payment_format: 'UPI / IMPS Aggregation',
    typology: 'Smurfing Funnel Aggregation',
    risk_level: 'HIGH',
    risk_score: 92.1,
    is_flagged: true,
    status: 'FROZEN_POLICE_WARRANT',
  },
  {
    tx_id: 'TX-2026-9770',
    timestamp: '2026-11-14 14:12:11',
    source_account: '040_ACC_1194',
    source_name: 'Pacific Star Logistics',
    source_bank: 'Citibank',
    target_account: '020_ACC_8819',
    target_name: 'Global Horizon Trade Ltd',
    target_bank: 'Bank of New York Mellon',
    amount_usd: 2800000.0,
    amount_inr: 235200000.0,
    payment_format: 'ACH Credit',
    typology: 'Cyclic Round-Tripping',
    risk_level: 'CRITICAL',
    risk_score: 98.9,
    is_flagged: true,
    status: 'QUARANTINED',
  },
  {
    tx_id: 'TX-2026-9650',
    timestamp: '2026-11-14 12:05:40',
    source_account: '001_ACC_3310',
    source_name: 'Pfizer Global Procurement',
    source_bank: 'JPMorgan Chase',
    target_account: '002_ACC_8820',
    target_name: 'Apollo Hospitals Enterprise',
    target_bank: 'State Bank of India',
    amount_usd: 450000.0,
    amount_inr: 37800000.0,
    payment_format: 'Commercial Letter of Credit',
    typology: 'Legitimate Commercial Trade',
    risk_level: 'NORMAL',
    risk_score: 4.2,
    is_flagged: false,
    status: 'CLEARED',
  },
  {
    tx_id: 'TX-2026-9520',
    timestamp: '2026-11-14 10:45:18',
    source_account: '005_ACC_7711',
    source_name: 'Tata Consultancy Services Ltd',
    source_bank: 'HDFC Bank',
    target_account: '006_ACC_4422',
    target_name: 'Microsoft Corp Ireland',
    target_bank: 'Bank of Ireland',
    amount_usd: 890000.0,
    amount_inr: 74760000.0,
    payment_format: 'BACS Wire',
    typology: 'Corporate Software License',
    risk_level: 'NORMAL',
    risk_score: 2.1,
    is_flagged: false,
    status: 'CLEARED',
  },
];

export default function TransactionsPage() {
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<TransactionItem[]>(FALLBACK_TXS);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/v1/transactions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.transactions) setTransactions(data.transactions);
      })
      .catch(() => {});
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.tx_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.source_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.target_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.target_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === 'ALL' || tx.risk_level.toUpperCase() === riskFilter.toUpperCase();
    return matchesSearch && matchesRisk;
  });

  const handleExportCsv = () => {
    const headers = ['TxID,Timestamp,Source,SourceName,Target,TargetName,AmountUSD,PaymentFormat,Typology,RiskLevel,RiskScore,Status'];
    const rows = filtered.map(
      (t) =>
        `"${t.tx_id}","${t.timestamp}","${t.source_account}","${t.source_name}","${t.target_account}","${t.target_name}",${t.amount_usd},"${t.payment_format}","${t.typology}","${t.risk_level}",${t.risk_score},"${t.status}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LAUNDERYLENS_TRANSACTIONS_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#FAFAFA] tracking-wide uppercase">
              Financial Transaction Ledger &amp; Surveillance Monitor
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAFAFA]/15 text-[#FAFAFA] border border-[#FAFAFA]/30">
              {filtered.length} Displayed
            </span>
          </div>
          <p className="text-xs text-[#71717A] font-mono mt-1">
            Real-time interbank transaction surveillance · Multi-currency audit trail · Machine learning threat scoring
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono font-bold text-[#FAFAFA] transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#FAFAFA]" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-md bg-[#111114] border border-[#27272A]">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TxID, account, entity..."
            className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#FAFAFA] rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-[#FAFAFA] placeholder-[#71717A] outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#71717A] text-[11px]">Risk Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'NORMAL'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                riskFilter === lvl
                  ? 'bg-[#18181B] text-[#FAFAFA] border-[#FAFAFA]/50'
                  : 'bg-[#09090B] text-[#71717A] border-[#27272A] hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-md bg-[#111114] border border-[#27272A] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A] text-[10px] uppercase">
                <th className="pb-2.5">Tx ID &amp; Time</th>
                <th className="pb-2.5">Originator Account</th>
                <th className="pb-2.5">Beneficiary Account</th>
                <th className="pb-2.5">Amount</th>
                <th className="pb-2.5">Channel</th>
                <th className="pb-2.5">Typology</th>
                <th className="pb-2.5">Risk Rating</th>
                <th className="pb-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {filtered.map((tx) => (
                <tr key={tx.tx_id} className="hover:bg-[#18181B]/50 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-[#FAFAFA] block">{tx.tx_id}</span>
                    <span className="text-[10px] text-[#71717A]">{tx.timestamp}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-[#FAFAFA] block">{tx.source_name}</span>
                    <span className="text-[11px] text-[#71717A]">{tx.source_account}</span>
                    <span className="text-[10px] text-[#71717A] block">{tx.source_bank}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-[#FAFAFA] block">{tx.target_name}</span>
                    <span className="text-[11px] text-[#71717A]">{tx.target_account}</span>
                    <span className="text-[10px] text-[#71717A] block">{tx.target_bank}</span>
                  </td>
                  <td className="py-3 font-bold text-[#FAFAFA] tabular-nums">
                    {formatAmount(tx.amount_usd)}
                  </td>
                  <td className="py-3 text-[#71717A] text-[11px]">
                    {tx.payment_format}
                  </td>
                  <td className="py-3 text-[#FAFAFA]">
                    {tx.typology}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        tx.risk_level === 'CRITICAL'
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                          : tx.risk_level === 'HIGH'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                          : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                      }`}
                    >
                      {tx.risk_level} ({tx.risk_score.toFixed(1)}%)
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-[10px] text-[#71717A] bg-[#09090B] px-2 py-0.5 rounded border border-[#27272A]">
                      {tx.status}
                    </span>
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
