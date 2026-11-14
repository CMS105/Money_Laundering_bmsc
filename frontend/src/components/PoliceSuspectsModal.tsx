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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#0C0C0E] border border-white/10 rounded-md shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-white/[0.07] flex items-center justify-between bg-[#0C0C0E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#18181B] border border-white/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold tracking-wide uppercase text-[#FAFAFA]">
                  Law Enforcement Suspect Intelligence Registry
                </h2>
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase">
                  {suspects.length} Targets
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">
                Central Cyber Crime Cell, CBI &amp; INTERPOL Surveillance Intercept Feed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/[0.06] text-[#71717A] hover:text-white transition-colors cursor-pointer"
            title="Close Watchlist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column: Directory */}
          <div className="w-72 sm:w-80 border-r border-white/[0.07] flex flex-col bg-[#09090B] shrink-0">
            {/* Search */}
            <div className="p-3 border-b border-white/[0.07] space-y-2">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Search suspect, alias, FIR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1 text-xs bg-[#111114] border border-white/[0.08] rounded text-[#FAFAFA] placeholder-[#52525B] font-mono outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-1">
                {(['ALL', 'MALICIOUS', 'CLEAR'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`flex-1 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                      statusFilter === filter
                        ? 'bg-[#18181B] text-white border border-white/20'
                        : 'text-[#71717A] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {filter === 'ALL'
                      ? 'All'
                      : filter === 'MALICIOUS'
                      ? 'Fraud'
                      : 'Clear'}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSuspects.map((suspect) => {
                const isSelected = selectedSuspect?.id === suspect.id;
                const hasFraud = suspect.has_malicious_transactions;

                return (
                  <div
                    key={suspect.id}
                    onClick={() => {
                      setSelectedSuspect(suspect);
                      setActiveTab(suspect.has_malicious_transactions ? 'SCAMS' : 'ACCOUNTS');
                    }}
                    className={`p-2.5 rounded transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#18181B] border border-white/20'
                        : 'bg-[#0C0C0E] border border-white/[0.04] hover:bg-[#111114]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">{suspect.avatar}</span>
                        <div>
                          <div className="text-xs font-medium text-[#FAFAFA]">
                            {suspect.name}
                          </div>
                          <div className="text-[10px] text-[#71717A] font-mono">
                            {suspect.alias}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-1 py-0.1 rounded border uppercase tabular-nums ${
                          suspect.risk_score >= 90
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {suspect.risk_score}%
                      </span>
                    </div>

                    <div className="text-[10px] text-[#71717A] font-mono truncate mb-1.5">
                      {suspect.police_agency}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[9px] font-mono">
                      <span className="text-[#71717A] flex items-center gap-1">
                        <Building className="w-2.5 h-2.5 text-zinc-400" />
                        {suspect.bank_accounts?.length || suspect.linked_accounts.length} Accounts
                      </span>
                      {hasFraud ? (
                        <span className="text-rose-400 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {suspect.recent_scam_transactions.length} Scam Tx
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Clear / Audit
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Suspect File */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0C0C0E] overflow-y-auto p-5">
            {selectedSuspect ? (
              <div className="space-y-4 max-w-3xl">
                {/* Identification Header */}
                <div className="p-3.5 card-fintech flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded bg-[#18181B] border border-white/10 flex items-center justify-center text-2xl shrink-0">
                      {selectedSuspect.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[#FAFAFA]">
                          {selectedSuspect.name}
                        </h3>
                        <span className="text-[10px] font-mono text-[#71717A] bg-[#18181B] px-1.5 py-0.2 rounded border border-white/[0.06]">
                          Alias: {selectedSuspect.alias}
                        </span>
                      </div>
                      <div className="text-xs text-[#71717A] font-mono mt-0.5 flex items-center gap-2">
                        <span>{selectedSuspect.police_agency}</span>
                        <span>·</span>
                        <span>ID: {selectedSuspect.id}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-[#71717A] font-mono mt-1.5 flex-wrap">
                        {selectedSuspect.residence_jurisdiction && (
                          <div className="flex items-center gap-1 text-zinc-300">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            <span>{selectedSuspect.residence_jurisdiction}</span>
                          </div>
                        )}
                        {selectedSuspect.phone_number && (
                          <div className="flex items-center gap-1 text-zinc-300">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{selectedSuspect.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase tabular-nums ${
                        selectedSuspect.risk_score >= 90
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {selectedSuspect.risk_level} ({selectedSuspect.risk_score}%)
                    </span>
                    <span className="text-[9px] text-[#71717A] font-mono mt-0.5">
                      Threat Index
                    </span>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="flex border-b border-white/[0.07] gap-3">
                  <button
                    onClick={() => setActiveTab('SCAMS')}
                    className={`pb-2 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'SCAMS'
                        ? 'text-rose-400 border-rose-500'
                        : 'text-[#71717A] border-transparent hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Scam Inflows ({selectedSuspect.recent_scam_transactions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ACCOUNTS')}
                    className={`pb-2 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'ACCOUNTS'
                        ? 'text-white border-white'
                        : 'text-[#71717A] border-transparent hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Bank Accounts ({selectedSuspect.bank_accounts?.length || selectedSuspect.linked_accounts.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('DOSSIER')}
                    className={`pb-2 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'DOSSIER'
                        ? 'text-white border-white'
                        : 'text-[#71717A] border-transparent hover:text-white'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Police Dossier</span>
                  </button>
                </div>

                {/* TAB 1: SCAMS VIEW */}
                {activeTab === 'SCAMS' && (
                  <div className="space-y-2.5">
                    {selectedSuspect.has_malicious_transactions &&
                    selectedSuspect.recent_scam_transactions.length > 0 ? (
                      selectedSuspect.recent_scam_transactions.map((tx: ScamTransaction) => (
                        <div
                          key={tx.tx_id}
                          className="p-3.5 card-fintech border-l-2 border-l-rose-500 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-rose-400">
                                {tx.tx_id}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold uppercase">
                                {tx.scam_category}
                              </span>
                              <span className="text-[10px] font-mono text-[#71717A]">
                                {tx.timestamp}
                              </span>
                            </div>

                            <div className="text-xs font-mono font-bold text-rose-300 tabular-nums">
                              {formatAmount(tx.amount)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                            <div className="p-2 rounded bg-[#09090B] border border-white/[0.04]">
                              <span className="text-[#71717A] text-[9px] block uppercase">
                                Victim Profile
                              </span>
                              <span className="text-zinc-200 font-medium">
                                {tx.victim_info}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-[#09090B] border border-white/[0.04]">
                              <span className="text-[#71717A] text-[9px] block uppercase">
                                Conduit Account
                              </span>
                              <span className="text-zinc-200 font-medium">
                                {tx.target_account} ({tx.bank})
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-zinc-300 bg-rose-500/[0.06] border border-rose-500/20 p-2 rounded leading-relaxed">
                            <div className="text-[9px] text-rose-400 font-bold uppercase mb-0.5">
                              Modus Operandi:
                            </div>
                            {tx.scam_method}
                          </div>

                          <div className="pt-1 flex items-center justify-between text-xs font-mono">
                            <span className="text-[#71717A] text-[10px]">
                              FIR Ref: <strong className="text-zinc-300">{tx.fir_number}</strong>
                            </span>

                            {tx.cluster_id && (
                              <button
                                onClick={() => handleLocate(tx.cluster_id)}
                                className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#18181B] hover:bg-white text-zinc-300 hover:text-black text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                              >
                                <span>Locate on Canvas</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 card-fintech text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-semibold text-emerald-300 font-mono uppercase">
                          No Malicious Scamming Transactions Found
                        </h4>
                        <p className="text-xs text-[#71717A] max-w-md mx-auto">
                          Active forensic scan returned zero fraudulent inflows for <strong className="text-zinc-200">{selectedSuspect.name}</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: BANK ACCOUNTS */}
                {activeTab === 'ACCOUNTS' && (
                  <div className="space-y-2">
                    {(selectedSuspect.bank_accounts || []).map((acc: SuspectBankAccount) => (
                      <div
                        key={acc.account_number}
                        className="p-3 card-fintech space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded bg-[#18181B] border border-white/[0.08] flex items-center justify-center">
                              <Building className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-[#FAFAFA] flex items-center gap-1.5">
                                <span>{acc.bank_name}</span>
                                <span className="text-[10px] font-mono text-[#71717A]">
                                  ({acc.bank_code})
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-1 mt-0.5">
                                <span>{acc.account_number}</span>
                                <button
                                  onClick={() => handleCopy(acc.account_number)}
                                  className="hover:text-white cursor-pointer"
                                  title="Copy"
                                >
                                  {copiedAccount === acc.account_number ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border uppercase flex items-center gap-1 ${
                              acc.status === 'FROZEN BY POLICE'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {acc.status === 'FROZEN BY POLICE' ? <Lock className="w-2.5 h-2.5" /> : <Radio className="w-2.5 h-2.5" />}
                            <span>{acc.status}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                          <div className="p-1.5 rounded bg-[#09090B] border border-white/[0.04]">
                            <span className="text-[#71717A] text-[9px] uppercase block">Type</span>
                            <span className="text-zinc-200 font-medium">{acc.account_type}</span>
                          </div>
                          <div className="p-1.5 rounded bg-[#09090B] border border-white/[0.04]">
                            <span className="text-[#71717A] text-[9px] uppercase block">Balance</span>
                            <span className="text-emerald-400 font-bold tabular-nums">{formatAmount(acc.balance)}</span>
                          </div>
                          <div className="p-1.5 rounded bg-[#09090B] border border-white/[0.04]">
                            <span className="text-[#71717A] text-[9px] uppercase block">Total Inflow</span>
                            <span className="text-white font-bold tabular-nums">{formatAmount(acc.total_inflow)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: DOSSIER */}
                {activeTab === 'DOSSIER' && (
                  <div className="space-y-3">
                    <div className="p-3.5 card-fintech space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-zinc-300 font-mono">
                        <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Intelligence Assessment</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {selectedSuspect.doubt_description}
                      </p>
                    </div>

                    <div className="p-3.5 card-fintech space-y-1.5 text-xs font-mono">
                      <div className="text-[10px] font-semibold uppercase text-[#71717A]">
                        Agency &amp; Warrant
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#71717A] block">Agency:</span>
                          <span className="text-zinc-200">{selectedSuspect.police_agency}</span>
                        </div>
                        <div>
                          <span className="text-[#71717A] block">Jurisdiction:</span>
                          <span className="text-zinc-200">{selectedSuspect.residence_jurisdiction || 'Pan-India'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#71717A] text-xs font-mono">
                Select a suspect to view their intelligence file.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
