'use client';

import React, { useState, useEffect } from 'react';

interface CrossBorderRoute {
  route_id: string;
  origin_country: string;
  origin_city: string;
  origin_bank: string;
  intermediary_country: string;
  intermediary_bank: string;
  destination_country: string;
  destination_city: string;
  destination_bank: string;
  source_currency: string;
  source_amount: number;
  intermediary_currency: string;
  intermediary_amount: number;
  destination_currency: string;
  destination_amount: number;
  fx_spread_anomaly_pct: number;
  transit_duration_hours: number;
  fatf_jurisdiction_risk: string;
  risk_score: number;
  typology: string;
}

const FALLBACK_ROUTES: CrossBorderRoute[] = [
  {
    route_id: 'XB-ROUTE-101',
    origin_country: 'India (IN)',
    origin_city: 'Mumbai',
    origin_bank: 'State Bank of India (SBININBB)',
    intermediary_country: 'United Arab Emirates (AE)',
    intermediary_bank: 'First Abu Dhabi Bank (FABAAEAD)',
    destination_country: 'United States (US)',
    destination_city: 'Wilmington, DE',
    destination_bank: 'JPMorgan Chase (CHASUS33)',
    source_currency: 'INR',
    source_amount: 298000000.0,
    intermediary_currency: 'AED',
    intermediary_amount: 13180000.0,
    destination_currency: 'USD',
    destination_amount: 3580000.0,
    fx_spread_anomaly_pct: 3.8,
    transit_duration_hours: 1.4,
    fatf_jurisdiction_risk: 'HIGH (FATF Enhanced Due Diligence / Grey List Corridor)',
    risk_score: 97.4,
    typology: 'Smurfed INR to Offshore AED to Clean USD Liquidation',
  },
  {
    route_id: 'XB-ROUTE-102',
    origin_country: 'Singapore (SG)',
    origin_city: 'Singapore',
    origin_bank: 'DBS Bank (DBSSSGSG)',
    intermediary_country: 'British Virgin Islands (VG)',
    intermediary_bank: 'VP Bank BVI (VPBIVGVG)',
    destination_country: 'United Kingdom (GB)',
    destination_city: 'London',
    destination_bank: 'Coutts & Co (COUTGB22)',
    source_currency: 'SGD',
    source_amount: 4200000.0,
    intermediary_currency: 'USD',
    intermediary_amount: 3120000.0,
    destination_currency: 'GBP',
    destination_amount: 2480000.0,
    fx_spread_anomaly_pct: 2.1,
    transit_duration_hours: 2.8,
    fatf_jurisdiction_risk: 'MEDIUM-HIGH (Secrecy Jurisdiction & Nominal Trust)',
    risk_score: 92.5,
    typology: 'Nominee Shell Trust Layering for Real Estate Purchase',
  },
  {
    route_id: 'XB-ROUTE-103',
    origin_country: 'Cyprus (CY)',
    origin_city: 'Limassol',
    origin_bank: 'Bank of Cyprus (BCYPCY2N)',
    intermediary_country: 'Seychelles (SC)',
    intermediary_bank: 'Nouvobanq (SIMLSC22)',
    destination_country: 'India (IN)',
    destination_city: 'New Delhi',
    destination_bank: 'Axis Bank (UTIBINBB)',
    source_currency: 'EUR',
    source_amount: 1900000.0,
    intermediary_currency: 'USD',
    intermediary_amount: 2050000.0,
    destination_currency: 'INR',
    destination_amount: 172000000.0,
    fx_spread_anomaly_pct: 4.2,
    transit_duration_hours: 3.1,
    fatf_jurisdiction_risk: 'HIGH (Round-Tripping FDI Tax Havens)',
    risk_score: 96.0,
    typology: 'Round-Tripping Capital Re-injection into Private Equity',
  },
  {
    route_id: 'XB-ROUTE-104',
    origin_country: 'Hong Kong (HK)',
    origin_city: 'Hong Kong',
    origin_bank: 'Standard Chartered HK (SCBLHKHH)',
    intermediary_country: 'Panama (PA)',
    intermediary_bank: 'Multibank Panama (MULTIXX)',
    destination_country: 'United States (US)',
    destination_city: 'Miami, FL',
    destination_bank: 'Bank of America (BOFAUS3N)',
    source_currency: 'HKD',
    source_amount: 22000000.0,
    intermediary_currency: 'USD',
    intermediary_amount: 2810000.0,
    destination_currency: 'USD',
    destination_amount: 2795000.0,
    fx_spread_anomaly_pct: 1.9,
    transit_duration_hours: 0.8,
    fatf_jurisdiction_risk: 'CRITICAL (Panama Free Trade Zone Mirror Invoicing)',
    risk_score: 98.1,
    typology: 'Trade-Based Over-Invoicing & Luxury Condo Purchase',
  },
];

export default function CrossBorderPage() {
  const [routes, setRoutes] = useState<CrossBorderRoute[]>(FALLBACK_ROUTES);

  useEffect(() => {
    fetch('/api/v1/cross-border')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.routes) setRoutes(data.routes);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#263449]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#E5E7EB] tracking-wide uppercase">
              Cross-Border &amp; Multi-Currency Routing Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
              4 Active Corridors
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            INR → AED → USD foreign exchange telemetry · FATF Enhanced Due Diligence · SWIFT MT103 routing
          </p>
        </div>
      </div>

      {/* Corridors Grid */}
      <div className="space-y-4">
        {routes.map((route) => (
          <div
            key={route.route_id}
            className="p-5 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm space-y-4"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#263449] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#172337] px-2 py-0.5 rounded border border-[#263449]">
                  {route.route_id}
                </span>
                <span className="text-sm font-bold text-[#E5E7EB]">
                  {route.typology}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 px-2 py-0.5 rounded">
                  {route.risk_score.toFixed(1)}% Threat Score
                </span>
              </div>
            </div>

            {/* 3-Hop Multi-Currency Visual Chain */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Origin */}
              <div className="p-3 rounded-lg bg-[#0B1220] border border-[#263449]">
                <p className="text-[10px] uppercase font-mono text-[#64748B]">Originating Node</p>
                <p className="text-xs font-bold text-[#E5E7EB] mt-0.5">{route.origin_city}, {route.origin_country}</p>
                <p className="text-[11px] text-[#94A3B8] font-mono">{route.origin_bank}</p>
                <p className="text-xs font-bold text-[#22C55E] font-mono mt-2 tabular-nums">
                  {route.source_currency} {route.source_amount.toLocaleString()}
                </p>
              </div>

              {/* Intermediary Hop */}
              <div className="p-3 rounded-lg bg-[#0B1220] border border-[#263449]">
                <p className="text-[10px] uppercase font-mono text-[#F59E0B]">Intermediary Offshore Conduit</p>
                <p className="text-xs font-bold text-[#E5E7EB] mt-0.5">{route.intermediary_country}</p>
                <p className="text-[11px] text-[#94A3B8] font-mono">{route.intermediary_bank}</p>
                <p className="text-xs font-bold text-[#F59E0B] font-mono mt-2 tabular-nums">
                  {route.intermediary_currency} {route.intermediary_amount.toLocaleString()}
                </p>
              </div>

              {/* Destination */}
              <div className="p-3 rounded-lg bg-[#0B1220] border border-[#263449]">
                <p className="text-[10px] uppercase font-mono text-[#EF4444]">Destination Liquidation Sink</p>
                <p className="text-xs font-bold text-[#E5E7EB] mt-0.5">{route.destination_city}, {route.destination_country}</p>
                <p className="text-[11px] text-[#94A3B8] font-mono">{route.destination_bank}</p>
                <p className="text-xs font-bold text-[#38BDF8] font-mono mt-2 tabular-nums">
                  {route.destination_currency} {route.destination_amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Compliance Telemetry Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs font-mono text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="text-[#EF4444] font-bold">FATF Assessment:</span>
                <span className="text-[#E5E7EB]">{route.fatf_jurisdiction_risk}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>FX Spread Discrepancy: <strong className="text-[#F59E0B]">{route.fx_spread_anomaly_pct}%</strong></span>
                <span>Transit Window: <strong className="text-[#E5E7EB]">{route.transit_duration_hours} hours</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
