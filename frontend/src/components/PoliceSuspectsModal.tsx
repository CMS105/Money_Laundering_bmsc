'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  Building,
  CreditCard,
  Phone,
  MapPin,
  Copy,
  Check,
  Lock,
  Radio,
  FileText,
} from 'lucide-react';
import { SuspectRecord, ScamTransaction, SuspectBankAccount, AlertCluster } from '../types';
import { fetchPoliceSuspects } from '../services/api';
import { SYNTHETIC_POLICE_SUSPECTS } from '../data/suspectsData';
import { useCurrency } from '../context/CurrencyContext';

interface PoliceSuspectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocateCluster?: (clusterId: string) => void;
  alerts?: AlertCluster[];
}

export default function PoliceSuspectsModal({
  isOpen,
  onClose,
  onLocateCluster,
}: PoliceSuspectsModalProps) {
  const { formatAmount } = useCurrency();
  const [suspects, setSuspects] = useState<SuspectRecord[]>(SYNTHETIC_POLICE_SUSPECTS);
  const [selectedSuspect, setSelectedSuspect] = useState<SuspectRecord | null>(
    SYNTHETIC_POLICE_SUSPECTS[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MALICIOUS' | 'CLEAR'>('ALL');
  const [activeTab, setActiveTab] = useState<'SCAMS' | 'ACCOUNTS' | 'DOSSIER'>('SCAMS');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPoliceSuspects()
        .then((res) => {
          if (res && res.suspects && res.suspects.length > 0) {
            setSuspects(res.suspects);
            if (!selectedSuspect) {
              setSelectedSuspect(res.suspects[0]);
            }
          } else {
            setSuspects(SYNTHETIC_POLICE_SUSPECTS);
            setSelectedSuspect(SYNTHETIC_POLICE_SUSPECTS[0]);
          }
        })
        .catch(() => {
          setSuspects(SYNTHETIC_POLICE_SUSPECTS);
          setSelectedSuspect(SYNTHETIC_POLICE_SUSPECTS[0]);
        });
    }
  }, [isOpen, selectedSuspect]);

  if (!isOpen) return null;

  const filteredSuspects = suspects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.police_agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'MALICIOUS' && s.has_malicious_transactions) ||
      (statusFilter === 'CLEAR' && !s.has_malicious_transactions);

    return matchesSearch && matchesFilter;
  });

  const handleLocate = (clusterId?: string) => {
    if (clusterId && onLocateCluster) {
      onLocateCluster(clusterId);
      onClose();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#12222A]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#1E3541] border border-[#284250] rounded-2xl shadow-[0_25px_60px_-15px_rgba(18,34,42,0.95)] flex flex-col overflow-hidden">
        {/* Top Specular Line */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#E8E5DA]/20 to-transparent" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#284250] flex items-center justify-between bg-[#172B35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#253F4D] border border-[#284250] flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-5 h-5 text-[#75A99A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide uppercase text-[#E8E5DA] font-mono">
                  Law Enforcement Suspect Intelligence & FIR Registry
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#253F4D] text-[#75A99A] border border-[#284250] uppercase tracking-wider">
                  Police Watchlist · {suspects.length} Targets
                </span>
              </div>
              <p className="text-xs text-[#82918E] mt-0.5">
                Central Cyber Crime Cell, CBI & INTERPOL Real-Time Intercept Surveillance Feed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#253F4D] hover:bg-[#253F4D]/80 text-[#82918E] hover:text-[#E8E5DA] transition-colors cursor-pointer border border-[#284250]"
              title="Close Watchlist"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: 2 Columns */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column: Suspects Directory */}
          <div className="w-80 sm:w-96 border-r border-[#284250] flex flex-col bg-[#172B35] shrink-0">
            {/* Search & Filter Bar */}
            <div className="p-3.5 border-b border-[#284250] space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#82918E]" />
                <input
                  type="text"
                  placeholder="Search suspect, alias, FIR, bank..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#12222A] border border-[#284250] rounded-lg text-[#E8E5DA] placeholder-[#82918E] focus:outline-none focus:border-[#75A99A]/50 font-sans"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex gap-1">
                {(['ALL', 'MALICIOUS', 'CLEAR'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`flex-1 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                      statusFilter === filter
                        ? 'bg-[#75A99A] text-[#172B35] font-bold border-[#75A99A] shadow-sm'
                        : 'bg-transparent text-[#82918E] border-transparent hover:text-[#E8E5DA] hover:bg-[#253F4D]'
                    }`}
                  >
                    {filter === 'ALL'
                      ? 'All'
                      : filter === 'MALICIOUS'
                      ? 'Flagged Fraud'
                      : 'Clear Record'}
                  </button>
                ))}
              </div>
            </div>

            {/* Suspects List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredSuspects.map((suspect) => {
                const isSelected = selectedSuspect?.id === suspect.id;
                const hasFraud = suspect.has_malicious_transactions;

                return (
                  <div
                    key={suspect.id}
                    onClick={() => {
                      setSelectedSuspect(suspect);
                      if (suspect.has_malicious_transactions) {
                        setActiveTab('SCAMS');
                      } else {
                        setActiveTab('ACCOUNTS');
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#253F4D] border-[#75A99A]/50 shadow-md ring-1 ring-[#75A99A]/30'
                        : 'bg-[#1E3541] border-[#284250] hover:border-[#75A99A]/30 hover:bg-[#253F4D]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl select-none">{suspect.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-[#E8E5DA] flex items-center gap-1.5">
                            {suspect.name}
                          </div>
                          <div className="text-[10px] text-[#82918E] font-mono">
                            {suspect.alias}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tabular-nums ${
                          suspect.risk_score >= 90
                            ? 'bg-[#C75B55]/15 text-[#F5C2C0] border-[#C75B55]/40'
                            : 'bg-[#4D9477]/15 text-[#A5D6C1] border-[#4D9477]/40'
                        }`}
                      >
                        {suspect.risk_score}%
                      </span>
                    </div>

                    <div className="text-[10px] text-[#82918E] font-mono truncate mb-2">
                      {suspect.police_agency}
                    </div>

                    {/* Status & Accounts Count Indicator */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#284250] text-[9px] font-mono">
                      <span className="text-[#82918E] flex items-center gap-1 font-sans">
                        <Building className="w-2.5 h-2.5 text-[#75A99A]" />
                        {suspect.bank_accounts?.length || suspect.linked_accounts.length} Bank Accounts
                      </span>
                      {hasFraud ? (
                        <span className="text-[#F5C2C0] flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-2.5 h-2.5 text-[#C75B55]" />
                          {suspect.recent_scam_transactions.length} Scam Tx
                        </span>
                      ) : (
                        <span className="text-[#A5D6C1] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#4D9477]" />
                          Clear / Inquiry
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Suspect Dossier, Bank Accounts & Scam Transactions */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#12222A] overflow-y-auto custom-scrollbar p-6">
            {selectedSuspect ? (
              <div className="space-y-5 max-w-4xl">
                {/* Suspect Identification Header */}
                <div className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#172B35] border border-[#284250] flex items-center justify-center text-3xl shadow-inner shrink-0">
                      {selectedSuspect.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[#E8E5DA] tracking-wide">
                          {selectedSuspect.name}
                        </h3>
                        <span className="text-xs font-mono text-[#82918E] bg-[#253F4D] px-2 py-0.5 rounded border border-[#284250]">
                          Alias: {selectedSuspect.alias}
                        </span>
                      </div>
                      <div className="text-xs text-[#82918E] font-mono mt-1 flex items-center gap-2 flex-wrap">
                        <span>{selectedSuspect.police_agency}</span>
                        <span>·</span>
                        <span className="text-[#82918E]">Case ID: {selectedSuspect.id}</span>
                      </div>

                      {/* Contact & Jurisdiction Details */}
                      <div className="flex items-center gap-4 text-[10px] text-[#82918E] font-mono mt-2 flex-wrap">
                        {selectedSuspect.residence_jurisdiction && (
                          <div className="flex items-center gap-1 text-[#E8E5DA]">
                            <MapPin className="w-3 h-3 text-[#75A99A]" />
                            <span>{selectedSuspect.residence_jurisdiction}</span>
                          </div>
                        )}
                        {selectedSuspect.phone_number && (
                          <div className="flex items-center gap-1 text-[#E8E5DA]">
                            <Phone className="w-3 h-3 text-[#75A99A]" />
                            <span>{selectedSuspect.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md border uppercase tracking-wider tabular-nums ${
                        selectedSuspect.risk_score >= 90
                          ? 'bg-[#C75B55]/15 text-[#F5C2C0] border-[#C75B55]/40'
                          : 'bg-[#4D9477]/15 text-[#A5D6C1] border-[#4D9477]/40'
                      }`}
                    >
                      {selectedSuspect.risk_level} ({selectedSuspect.risk_score}%)
                    </span>
                    <span className="text-[10px] text-[#82918E] font-mono">
                      Law Enforcement Threat Index
                    </span>
                  </div>
                </div>

                {/* Sub-Tabs: Scams, Bank Accounts, Case Dossier */}
                <div className="flex border-b border-[#284250] gap-2">
                  <button
                    onClick={() => setActiveTab('SCAMS')}
                    className={`pb-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'SCAMS'
                        ? 'text-[#F5C2C0] border-[#C75B55]'
                        : 'text-[#82918E] border-transparent hover:text-[#E8E5DA]'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Malicious Scam Inflows ({selectedSuspect.recent_scam_transactions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ACCOUNTS')}
                    className={`pb-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'ACCOUNTS'
                        ? 'text-[#75A99A] border-[#75A99A]'
                        : 'text-[#82918E] border-transparent hover:text-[#E8E5DA]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bank Accounts ({selectedSuspect.bank_accounts?.length || selectedSuspect.linked_accounts.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('DOSSIER')}
                    className={`pb-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'DOSSIER'
                        ? 'text-[#E8E5DA] border-[#E8E5DA]'
                        : 'text-[#82918E] border-transparent hover:text-[#E8E5DA]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Police Dossier & FIR</span>
                  </button>
                </div>

                {/* TAB 1: SCAMS VIEW */}
                {activeTab === 'SCAMS' && (
                  <div className="space-y-3">
                    {selectedSuspect.has_malicious_transactions &&
                    selectedSuspect.recent_scam_transactions.length > 0 ? (
                      selectedSuspect.recent_scam_transactions.map((tx: ScamTransaction) => (
                        <div
                          key={tx.tx_id}
                          className="p-4 rounded-xl bg-[#1E3541] border border-[#C75B55]/30 shadow-md space-y-2.5 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#C75B55] shadow-[0_0_8px_rgba(199,91,85,0.8)]" />

                          <div className="flex flex-wrap items-center justify-between gap-2 pl-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-[#F5C2C0]">
                                {tx.tx_id}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C75B55]/15 text-[#F5C2C0] border border-[#C75B55]/30 font-bold uppercase">
                                {tx.scam_category}
                              </span>
                              <span className="text-[10px] font-mono text-[#82918E]">
                                {tx.timestamp}
                              </span>
                            </div>

                            <div className="text-sm font-mono font-bold text-[#F5C2C0] tabular-nums">
                              {formatAmount(tx.amount)}
                            </div>
                          </div>

                          <div className="pl-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                            <div className="p-2.5 rounded-lg bg-[#172B35] border border-[#284250]">
                              <span className="text-[#82918E] text-[10px] block uppercase font-sans">
                                Victim Profile
                              </span>
                              <span className="text-[#E8E5DA] font-bold">
                                {tx.victim_info}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-[#172B35] border border-[#284250]">
                              <span className="text-[#82918E] text-[10px] block uppercase font-sans">
                                Target Mule Account
                              </span>
                              <span className="text-[#E8E5DA] font-bold">
                                {tx.target_account} ({tx.bank})
                              </span>
                            </div>
                          </div>

                          <div className="pl-2 text-xs text-[#E8E5DA] bg-[#C75B55]/10 border border-[#C75B55]/20 p-2.5 rounded-lg leading-relaxed">
                            <div className="text-[10px] text-[#F5C2C0] font-bold uppercase tracking-wider mb-0.5">
                              Modus Operandi & Wiretap Evidence:
                            </div>
                            {tx.scam_method}
                          </div>

                          <div className="pl-2 pt-1 flex items-center justify-between text-xs font-mono">
                            <span className="text-[#82918E] text-[11px]">
                              Case FIR: <strong className="text-[#E8E5DA]">{tx.fir_number}</strong>
                            </span>

                            {tx.cluster_id && (
                              <button
                                onClick={() => handleLocate(tx.cluster_id)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#253F4D] hover:bg-[#75A99A] text-[#E8E5DA] hover:text-[#172B35] text-xs font-semibold border border-[#284250] shadow-sm transition-all cursor-pointer font-sans"
                              >
                                <span>Locate on Graph Canvas</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 rounded-xl bg-[#1E3541] border border-[#4D9477]/30 text-center space-y-3 relative overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-[#4D9477]/10 border border-[#4D9477]/20 flex items-center justify-center mx-auto text-[#4D9477]">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-[#A5D6C1] font-mono uppercase tracking-wide">
                            No Malicious Scamming Transactions Found
                          </h4>
                          <p className="text-xs text-[#82918E] max-w-lg mx-auto leading-relaxed">
                            Forensic scan of the active transactional ledger returned zero scamming or fraudulent inflows for{' '}
                            <strong className="text-[#E8E5DA]">{selectedSuspect.name}</strong>.
                          </p>
                        </div>

                        {selectedSuspect.police_clearance_note && (
                          <div className="max-w-xl mx-auto p-3 rounded-lg bg-[#172B35] border border-[#4D9477]/20 text-xs text-[#A5D6C1] font-mono text-left leading-relaxed">
                            <span className="font-bold text-[#4D9477] block mb-0.5 uppercase text-[10px]">
                              Official Police Clearance Certificate:
                            </span>
                            {selectedSuspect.police_clearance_note}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: BANK ACCOUNTS VIEW */}
                {activeTab === 'ACCOUNTS' && (
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-[#82918E] flex items-center justify-between">
                      <span>Verified Banking Channels Registered Under Suspect PAN / Aadhaar</span>
                      <span className="text-[#82918E]">{selectedSuspect.bank_accounts?.length || 0} Accounts Total</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {(selectedSuspect.bank_accounts || []).map((acc: SuspectBankAccount) => (
                        <div
                          key={acc.account_number}
                          className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] hover:border-[#75A99A]/30 transition-all space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#253F4D] border border-[#284250] flex items-center justify-center">
                                <Building className="w-4 h-4 text-[#75A99A]" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#E8E5DA] flex items-center gap-2">
                                  <span>{acc.bank_name}</span>
                                  <span className="text-[10px] font-mono text-[#82918E]">
                                    (Bank Code: {acc.bank_code})
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-[#82918E] flex items-center gap-1.5 mt-0.5">
                                  <span>{acc.account_number}</span>
                                  <button
                                    onClick={() => handleCopy(acc.account_number)}
                                    className="hover:text-[#E8E5DA] cursor-pointer text-[#82918E]"
                                    title="Copy Account Number"
                                  >
                                    {copiedAccount === acc.account_number ? (
                                      <Check className="w-3 h-3 text-[#4D9477]" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Freeze / Status Badge */}
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
                                acc.status === 'FROZEN BY POLICE'
                                  ? 'bg-[#C75B55]/15 text-[#F5C2C0] border-[#C75B55]/30'
                                  : acc.status === 'ACTIVE INTERCEPT'
                                  ? 'bg-[#D5A24F]/15 text-[#F4D99B] border-[#D5A24F]/30'
                                  : acc.status === 'UNDER AUDIT'
                                  ? 'bg-[#75A99A]/15 text-[#A5D6C1] border-[#75A99A]/30'
                                  : 'bg-[#4D9477]/15 text-[#A5D6C1] border-[#4D9477]/30'
                              }`}
                            >
                              {acc.status === 'FROZEN BY POLICE' ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Radio className="w-3 h-3" />
                              )}
                              <span>{acc.status}</span>
                            </span>
                          </div>

                          {/* Account Metrics Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                            <div className="p-2 rounded bg-[#172B35] border border-[#284250]">
                              <span className="text-[#82918E] text-[10px] uppercase block font-sans">
                                Account Type
                              </span>
                              <span className="text-[#E8E5DA] font-bold truncate block">
                                {acc.account_type}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-[#172B35] border border-[#284250]">
                              <span className="text-[#82918E] text-[10px] uppercase block font-sans">
                                Available Balance
                              </span>
                              <span className="text-[#4D9477] font-bold tabular-nums block">
                                {formatAmount(acc.balance)}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-[#172B35] border border-[#284250]">
                              <span className="text-[#82918E] text-[10px] uppercase block font-sans">
                                Total Inflows
                              </span>
                              <span className="text-[#E8E5DA] font-bold tabular-nums block">
                                {formatAmount(acc.total_inflow)}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-[#172B35] border border-[#284250]">
                              <span className="text-[#82918E] text-[10px] uppercase block font-sans">
                                Branch & IFSC
                              </span>
                              <span className="text-[#82918E] text-[10px] truncate block" title={acc.branch}>
                                {acc.ifsc_swift}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: DOSSIER & INTELLIGENCE VIEW */}
                {activeTab === 'DOSSIER' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8E5DA] font-mono">
                        <Fingerprint className="w-4 h-4 text-[#75A99A]" />
                        <span>Intelligence Assessment & Intercept Dossier</span>
                      </div>
                      <p className="text-xs text-[#E8E5DA] leading-relaxed font-sans">
                        {selectedSuspect.doubt_description}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#1E3541] border border-[#284250] space-y-2 text-xs font-mono">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#82918E]">
                        Investigating Agency & Warrant Details
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <span className="text-[#82918E] block font-sans">Investigating Force</span>
                          <span className="text-[#E8E5DA] font-bold">{selectedSuspect.police_agency}</span>
                        </div>
                        <div>
                          <span className="text-[#82918E] block font-sans">Surveillance Jurisdiction</span>
                          <span className="text-[#E8E5DA] font-bold">{selectedSuspect.residence_jurisdiction || 'Pan-India'}</span>
                        </div>
                        <div>
                          <span className="text-[#82918E] block font-sans">Intercept Communication Line</span>
                          <span className="text-[#E8E5DA] font-bold">{selectedSuspect.phone_number || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[#82918E] block font-sans">Active Status</span>
                          <span className="text-[#F5C2C0] font-bold">{selectedSuspect.risk_level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#82918E] text-xs font-mono">
                Select a suspect from the registry to view their intelligence file.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
