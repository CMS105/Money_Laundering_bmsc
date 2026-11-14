'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Coins,
  Car,
  Gem,
  AlertTriangle,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface AssetInvestigation {
  asset_id: string;
  category: string;
  title: string;
  location: string;
  declared_value_usd: number;
  declared_value_inr: number;
  market_appraisal_usd: number;
  cash_component_pct: number;
  purchaser_entity: string;
  ubo_individual: string;
  funding_bank_account: string;
  counterparty_seller: string;
  risk_score: number;
  red_flag: string;
}

const FALLBACK_ASSETS: AssetInvestigation[] = [
  {
    asset_id: 'ASSET-GOLD-01',
    category: 'Precious Metals / 24K Gold Bullion',
    title: '50kg Minted Gold Cast Bars (999.9 Purity)',
    location: 'Zaveri Bazaar Precious Metal Exchange, Mumbai',
    declared_value_usd: 3850000.0,
    declared_value_inr: 323400000.0,
    market_appraisal_usd: 3860000.0,
    cash_component_pct: 42.0,
    purchaser_entity: 'Shree Kuber Gems & Import Pvt Ltd',
    ubo_individual: 'Dinesh G. Agarwal (Watchlist)',
    funding_bank_account: '010_ACC_5502 (HDFC Bank)',
    counterparty_seller: 'Al-Etihad Gold Refinery DMCC, Dubai',
    risk_score: 96.5,
    red_flag: 'Cash consideration paid in fragmented ₹49,000 tranches below PAN declaration limit; immediate export to UAE free port.',
  },
  {
    asset_id: 'ASSET-PROP-02',
    category: 'High-Value Prime Real Estate',
    title: 'Duplex Penthouse, Palm Jumeirah Signature Villa',
    location: 'Palm Jumeirah Frond N, Dubai, UAE',
    declared_value_usd: 8200000.0,
    declared_value_inr: 688800000.0,
    market_appraisal_usd: 10500000.0,
    cash_component_pct: 35.0,
    purchaser_entity: 'Blue Ocean Horizon SPV (Cayman Islands)',
    ubo_individual: 'Unknown / Disguised via Bearer Share Nominee',
    funding_bank_account: '070_ACC_3301 (Emirates NBD)',
    counterparty_seller: 'Emaar Properties PJSC',
    risk_score: 98.2,
    red_flag: 'Severe 22% under-valuation on contract with side-cash envelope; funded directly from conduit account 070_ACC_3301 within 2 hours of wire arrival.',
  },
  {
    asset_id: 'ASSET-PROP-03',
    category: 'Commercial Real Estate',
    title: 'Commercial Logistics Warehouse (85,000 sq ft)',
    location: 'Bhiwandi Industrial Hub, Maharashtra, India',
    declared_value_usd: 2400000.0,
    declared_value_inr: 201600000.0,
    market_appraisal_usd: 2450000.0,
    cash_component_pct: 55.0,
    purchaser_entity: 'Om Logistics Infrastructure LLP',
    ubo_individual: 'Sanjay R. Singhania',
    funding_bank_account: '010_ACC_4118 (ICICI Bank)',
    counterparty_seller: 'Apex Realty Developers',
    risk_score: 93.8,
    red_flag: '55% unregistered cash component financed through 28 student mule deposits; shell LLP incorporated 11 days prior to deed registration.',
  },
  {
    asset_id: 'ASSET-LUX-04',
    category: 'Luxury Automotive & Supercars',
    title: 'Fleet of 4x Rolls Royce Spectre & Ferrari SF90 Stradale',
    location: 'Mayfair Highline Showroom, London, UK',
    declared_value_usd: 2100000.0,
    declared_value_inr: 176400000.0,
    market_appraisal_usd: 2120000.0,
    cash_component_pct: 28.0,
    purchaser_entity: 'Mayfair Premier Executive Hire Ltd',
    ubo_individual: 'Tariq Mansoor',
    funding_bank_account: '030_ACC_7729 (Barclays Bank)',
    counterparty_seller: 'HR Owen Luxury Motors',
    risk_score: 91.4,
    red_flag: 'Vehicles leased back to offshore holding entities within 48 hours for immediate cross-border asset pledging.',
  },
];

export default function AssetIntelligencePage() {
  const { formatAmount } = useCurrency();
  const [assets, setAssets] = useState<AssetInvestigation[]>(FALLBACK_ASSETS);

  useEffect(() => {
    fetch('/api/v1/asset-intelligence')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.assets) setAssets(data.assets);
      })
      .catch(() => {});
  }, []);

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Gold') || cat.includes('Metals')) return Gem;
    if (cat.includes('Real Estate')) return Building2;
    if (cat.includes('Automotive')) return Car;
    return Coins;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#263449]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#E5E7EB] tracking-wide uppercase">
              Asset-Based &amp; Trade-Based Laundering Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              High-Value Physical Asset Tracing
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            24K Gold bullion conversion · Offshore real estate SPVs · Beneficial ownership obfuscation
          </p>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {assets.map((asset) => {
          const Icon = getCategoryIcon(asset.category);
          return (
            <div
              key={asset.asset_id}
              className="p-5 rounded-xl bg-[#111C2E] border border-[#263449] shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#172337] border border-[#263449] flex items-center justify-center text-[#38BDF8]">
                      <Icon className="w-4 h-4 text-[#38BDF8]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">
                        {asset.category}
                      </span>
                      <h2 className="text-sm font-bold text-[#E5E7EB]">
                        {asset.title}
                      </h2>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 px-2 py-0.5 rounded shrink-0">
                    {asset.risk_score.toFixed(1)}% Threat
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] font-mono mb-3">
                  📍 {asset.location}
                </p>

                {/* Valuation Cards */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-[#0B1220] border border-[#263449] mb-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#64748B] block">Declared Price</span>
                    <span className="text-xs font-bold text-[#E5E7EB] tabular-nums block mt-0.5">
                      {formatAmount(asset.declared_value_usd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block">Fair Market Estimate</span>
                    <span className="text-xs font-bold text-[#38BDF8] tabular-nums block mt-0.5">
                      {formatAmount(asset.market_appraisal_usd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block">Cash Component %</span>
                    <span className="text-xs font-bold text-[#EF4444] tabular-nums block mt-0.5">
                      {asset.cash_component_pct}% Cash
                    </span>
                  </div>
                </div>

                {/* Entity Details */}
                <div className="space-y-1.5 text-xs font-mono text-[#94A3B8]">
                  <p>
                    <strong className="text-[#E5E7EB]">Acquiring Entity:</strong> {asset.purchaser_entity}
                  </p>
                  <p>
                    <strong className="text-[#E5E7EB]">Ultimate Beneficial Owner (UBO):</strong>{' '}
                    <span className="text-[#EF4444] font-semibold">{asset.ubo_individual}</span>
                  </p>
                  <p>
                    <strong className="text-[#E5E7EB]">Linked Funding Account:</strong>{' '}
                    <span className="text-[#38BDF8]">{asset.funding_bank_account}</span>
                  </p>
                </div>
              </div>

              {/* Red Flag Alert Box */}
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/25 text-xs text-[#EF4444] font-mono">
                <p className="font-bold mb-0.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Forensic Red Flag:
                </p>
                <p className="text-[11px] leading-relaxed text-[#E5E7EB]">{asset.red_flag}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
