'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Coins,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function SettingsPage() {
  const { currency, toggleCurrency } = useCurrency();
  const [structuringThreshold, setStructuringThreshold] = useState(10000);
  const [transitLatencyMins, setTransitLatencyMins] = useState(30);
  const [criticalCutoff, setCriticalCutoff] = useState(85);
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [aiModel, setAiModel] = useState('LaunderLens Hybrid Graph Model (XAI + FinCEN Grammar)');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 space-y-6">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#111114] border border-[#10B981] shadow-2xl text-xs font-mono text-[#FAFAFA]">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>Surveillance thresholds and engine settings updated successfully.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#FAFAFA] tracking-wide uppercase">
              Surveillance Engine &amp; System Configuration
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAFAFA]/15 text-[#FAFAFA] border border-[#FAFAFA]/30">
              Admin &amp; Threshold Tuning
            </span>
          </div>
          <p className="text-xs text-[#71717A] font-mono mt-1">
            Configure AML detection thresholds, currency parameters, and automated debit quarantine triggers
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Section 1: AML Detection Thresholds */}
        <div className="p-5 rounded-md bg-[#111114] border border-[#27272A] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FAFAFA]" />
            Regulatory &amp; Graph Detection Thresholds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* CTR Structuring Threshold */}
            <div>
              <label className="block text-[#71717A] mb-1.5">
                CTR Structuring Threshold (USD)
              </label>
              <input
                type="number"
                value={structuringThreshold}
                onChange={(e) => setStructuringThreshold(Number(e.target.value))}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#FAFAFA] rounded-md px-3 py-2 text-xs font-mono text-[#FAFAFA] outline-none"
              />
              <p className="text-[10px] text-[#71717A] mt-1">
                Transactions structured between 85% and 99% of this limit trigger smurfing alerts.
              </p>
            </div>

            {/* Rapid Pass-Through Latency */}
            <div>
              <label className="block text-[#71717A] mb-1.5">
                Max Conduit Dwell Time (Minutes)
              </label>
              <input
                type="number"
                value={transitLatencyMins}
                onChange={(e) => setTransitLatencyMins(Number(e.target.value))}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#FAFAFA] rounded-md px-3 py-2 text-xs font-mono text-[#FAFAFA] outline-none"
              />
              <p className="text-[10px] text-[#71717A] mt-1">
                Accounts receiving and forwarding funds under this window trigger money mule alerts.
              </p>
            </div>

            {/* Critical Cutoff */}
            <div>
              <label className="block text-[#71717A] mb-1.5">
                Critical Threat Score Cutoff (%)
              </label>
              <input
                type="number"
                value={criticalCutoff}
                onChange={(e) => setCriticalCutoff(Number(e.target.value))}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#FAFAFA] rounded-md px-3 py-2 text-xs font-mono text-[#FAFAFA] outline-none"
              />
              <p className="text-[10px] text-[#71717A] mt-1">
                Alerts scoring above this cutoff require immediate 24-hour statutory FinCEN filing.
              </p>
            </div>

            {/* Auto Quarantine Toggle */}
            <div className="flex flex-col justify-center">
              <label className="block text-[#71717A] mb-1.5">
                Automated Conduit Quarantine
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAutoQuarantine(!autoQuarantine)}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-mono border transition-colors ${
                    autoQuarantine
                      ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                      : 'bg-[#09090B] text-[#71717A] border-[#27272A]'
                  }`}
                >
                  {autoQuarantine ? 'ENABLED (Auto Debit Restraint)' : 'DISABLED (Manual Analyst Review)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Currency & Storage Parameters */}
        <div className="p-5 rounded-md bg-[#111114] border border-[#27272A] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wide flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FAFAFA]" />
            Reporting Currency &amp; Database Ledger
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[#71717A] mb-1.5">
                Default Display Currency
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCurrency}
                  className="px-4 py-2 rounded bg-[#09090B] border border-[#27272A] text-[#FAFAFA] font-bold text-xs"
                >
                  Current: {currency === 'USD' ? 'USD ($)' : 'INR (₹)'} (Click to Switch)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#71717A] mb-1.5">
                Fixed FX Exchange Rate (USD to INR)
              </label>
              <input
                type="text"
                disabled
                value="1 USD = ₹84.00 INR"
                className="w-full bg-[#09090B] border border-[#27272A] rounded-md px-3 py-2 text-xs font-mono text-[#71717A] outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[#71717A] mb-1.5">
                SQLite Forensic Ledger File Path
              </label>
              <input
                type="text"
                disabled
                value="backend/data/aml_ledger.db"
                className="w-full bg-[#09090B] border border-[#27272A] rounded-md px-3 py-2 text-xs font-mono text-[#71717A] outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[#71717A] mb-1.5">
                AI Narrative Generator Model
              </label>
              <input
                type="text"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#FAFAFA] rounded-md px-3 py-2 text-xs font-mono text-[#FAFAFA] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#FAFAFA]/40 hover:border-[#FAFAFA] text-xs font-mono font-bold text-[#FAFAFA] transition-colors cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4 text-[#FAFAFA]" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
