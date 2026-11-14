'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] p-8 space-y-6 max-w-4xl font-mono text-xs text-[#94A3B8] leading-relaxed">
      <div className="border-b border-[#263449] pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
          <h1 className="text-xl font-black text-[#E5E7EB] uppercase tracking-wide">
            Privacy Policy &amp; Data Governance Charter
          </h1>
        </div>
        <p className="text-[11px] text-[#64748B] mt-1">
          LaunderyLens Financial Intelligence Platform · Last Revised: November 14, 2026
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] space-y-4">
        <h2 className="text-sm font-bold text-[#E5E7EB] uppercase">
          1. Statutory Authority and Purpose
        </h2>
        <p>
          LaunderyLens processes financial transaction records, counterparty entity relationships, and beneficial ownership telemetry strictly pursuant to anti-money laundering (AML) and counter-terrorist financing (CFT) statutory frameworks, including the Bank Secrecy Act (BSA, 31 U.S.C. § 5311 et seq.), Title III of the USA PATRIOT Act, the Financial Crimes Enforcement Network (FinCEN) regulations (31 CFR Chapter X), and India&apos;s Prevention of Money Laundering Act (PMLA, 2002).
        </p>

        <h2 className="text-sm font-bold text-[#E5E7EB] uppercase pt-2">
          2. SAR Confidentiality &amp; Anti-Tipping Off Provisions
        </h2>
        <p>
          Pursuant to 31 U.S.C. § 5318(g)(2) and 31 CFR § 1020.320(e), unauthorized disclosure of a Suspicious Activity Report (SAR) or any information that would reveal the existence of a SAR is strictly prohibited by federal and international law. All analysts, auditors, and law enforcement personnel accessing LaunderyLens are subject to statutory confidentiality obligations.
        </p>

        <h2 className="text-sm font-bold text-[#E5E7EB] uppercase pt-2">
          3. Cryptographic Data Security
        </h2>
        <p>
          All transaction telemetry, graph topology databases, and SQLite ledger partitions are encrypted at rest utilizing FIPS 140-3 validated AES-256 encryption. Telemetry in transit between browser clients, FastAPI graph calculation microservices, and persistent storage is protected via TLS 1.3 with mandatory forward secrecy.
        </p>

        <h2 className="text-sm font-bold text-[#E5E7EB] uppercase pt-2">
          4. Retention and Audit Trails
        </h2>
        <p>
          Audit logs capturing query execution, cluster isolation actions, and SAR report generation are maintained immutably for a mandatory statutory retention period of not less than five (5) years pursuant to 31 CFR § 1010.430.
        </p>
      </div>
    </div>
  );
}
