'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  FileText,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
  Zap,
  X,
  ExternalLink,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import AccountNode from '@/components/canvas/AccountNode';
import TransactionEdge from '@/components/canvas/TransactionEdge';

interface FxNodeData {
  id: string;
  label: string;
  role: string;
  risk: number;
  currency: string;
  jurisdiction: string;
  entity_name: string;
  bank: string;
  balance: string;
  badge: string;
  [key: string]: unknown;
}

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

// Dedicated Multi-Currency FX Network Ring Nodes
const FX_RING_NODES: Node[] = [
  {
    id: '010_ACC_4410',
    type: 'accountNode',
    position: { x: 50, y: 150 },
    data: {
      id: '010_ACC_4410',
      label: 'Apex Exports Mumbai',
      role: 'entry',
      risk: 96.0,
      currency: 'INR',
      jurisdiction: 'India (IN)',
      entity_name: 'Apex Exports Mumbai',
      bank: 'SBI Mumbai (SBININBB)',
      balance: '₹4.15 Cr INR',
      badge: 'INR ORIGINATOR',
    },
  },
  {
    id: '010_ACC_4418',
    type: 'accountNode',
    position: { x: 370, y: 80 },
    data: {
      id: '010_ACC_4418',
      label: 'Deccan Trading Co',
      role: 'mule',
      risk: 89.0,
      currency: 'INR',
      jurisdiction: 'India (IN)',
      entity_name: 'Deccan Trading Co',
      bank: 'HDFC Mumbai (HDFCINBB)',
      balance: '₹4.10 Cr INR',
      badge: 'INR SMURF SPLIT',
    },
  },
  {
    id: '070_ACC_3301',
    type: 'accountNode',
    position: { x: 690, y: 200 },
    data: {
      id: '070_ACC_3301',
      label: 'Al-Bahr Capital FZE',
      role: 'mule',
      risk: 94.5,
      currency: 'AED',
      jurisdiction: 'Dubai, UAE (AE)',
      entity_name: 'Al-Bahr Capital Commodities FZE',
      bank: 'Emirates NBD (EBILAEAD)',
      balance: 'AED 1,820,000',
      badge: 'OFFSHORE FX BRIDGE',
    },
  },
  {
    id: '020_ACC_8819',
    type: 'accountNode',
    position: { x: 1010, y: 90 },
    data: {
      id: '020_ACC_8819',
      label: 'Global Horizon Trade',
      role: 'mule',
      risk: 92.0,
      currency: 'USD',
      jurisdiction: 'Delaware, United States (US)',
      entity_name: 'Global Horizon Trade Ltd',
      bank: 'BNY Mellon (BKTRUS33)',
      balance: '$495,200 USD',
      badge: 'USD LAYERING CORE',
    },
  },
  {
    id: '070_ACC_9921',
    type: 'accountNode',
    position: { x: 1330, y: 160 },
    data: {
      id: '070_ACC_9921',
      label: 'Zenith Holdings SG',
      role: 'exit',
      risk: 97.5,
      currency: 'USD',
      jurisdiction: 'Singapore (SG)',
      entity_name: 'Zenith International Holdings',
      bank: 'DBS Bank (DBSSSGSG)',
      balance: '$489,000 USD',
      badge: 'LIQUIDATION SINK',
    },
  },
];

const FX_RING_EDGES_RAW = [
  {
    id: 'TX_FX_001',
    source: '010_ACC_4410',
    target: '010_ACC_4418',
    amount: 41500000,
    currency: 'INR',
    amount_formatted: '₹4.15 Cr INR',
    timestamp: '2026-11-14T06:15:00Z',
    hop_delay_mins: 14.0,
    from_bank: '010 (SBI Mumbai)',
    to_bank: '010 (HDFC Mumbai)',
    payment_format: 'RTGS / Domestic Wire',
    flag: 'Smurf Structuring Split',
    step: 1,
  },
  {
    id: 'TX_FX_002',
    source: '010_ACC_4418',
    target: '070_ACC_3301',
    amount: 1820000,
    currency: 'AED',
    amount_formatted: 'AED 1,820,000',
    timestamp: '2026-11-14T06:42:00Z',
    hop_delay_mins: 27.0,
    from_bank: '010 (HDFC Mumbai)',
    to_bank: '070 (Emirates NBD)',
    payment_format: 'SWIFT MT103',
    flag: 'TBML Over-Invoicing (+24.5% FX Spread)',
    step: 2,
  },
  {
    id: 'TX_FX_003',
    source: '070_ACC_3301',
    target: '020_ACC_8819',
    amount: 495200,
    currency: 'USD',
    amount_formatted: '$495,200 USD',
    timestamp: '2026-11-14T07:15:00Z',
    hop_delay_mins: 33.0,
    from_bank: '070 (Emirates NBD)',
    to_bank: '020 (BNY Mellon DE)',
    payment_format: 'Fedwire',
    flag: 'Free Zone FX Conduit',
    step: 3,
  },
  {
    id: 'TX_FX_004',
    source: '020_ACC_8819',
    target: '070_ACC_9921',
    amount: 489000,
    currency: 'USD',
    amount_formatted: '$489,000 USD',
    timestamp: '2026-11-14T07:57:00Z',
    hop_delay_mins: 42.0,
    from_bank: '020 (BNY Mellon DE)',
    to_bank: '070 (DBS Singapore)',
    payment_format: 'CHIPS / SWIFT',
    flag: 'Singapore Liquidation Sink',
    step: 4,
  },
];

const nodeTypes = {
  accountNode: AccountNode,
};

const edgeTypes = {
  transactionEdge: TransactionEdge,
};

export default function CrossBorderPage() {
  const [routes, setRoutes] = useState<CrossBorderRoute[]>(FALLBACK_ROUTES);
  const [nodes, , onNodesChange] = useNodesState<Node>(FX_RING_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Temporal Scrubber
  const [currentStep, setCurrentStep] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Selected Node Inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string>('070_ACC_3301');

  // SAR Modal
  const [isSarModalOpen, setIsSarModalOpen] = useState<boolean>(false);
  const [copiedSar, setCopiedSar] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/v1/cross-border')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.routes) setRoutes(data.routes);
      })
      .catch(() => {});
  }, []);

  // Update edges according to current playback step
  useEffect(() => {
    const activeEdges: Edge[] = FX_RING_EDGES_RAW.map((e) => {
      const isVisible = e.step <= currentStep;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'transactionEdge',
        animated: isVisible,
        data: {
          amount: e.amount,
          amount_formatted: e.amount_formatted,
          currency: e.currency,
          hop_delay_mins: e.hop_delay_mins,
          timestamp: e.timestamp,
          payment_format: e.payment_format,
          flag: e.flag,
        },
        style: {
          opacity: isVisible ? 1 : 0.15,
          stroke: isVisible ? '#10B981' : '#52525B',
          strokeWidth: isVisible ? 2 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isVisible ? '#10B981' : '#52525B',
        },
      };
    });
    setEdges(activeEdges);
  }, [currentStep, setEdges]);

  // Handle temporal playback timer
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 4) {
            setIsPlaying(false);
            return 4;
          }
          return prev + 1;
        });
      }, 1600);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  const selectedNode = FX_RING_NODES.find((n) => n.id === selectedNodeId) || FX_RING_NODES[2];

  const handleCopySar = () => {
    const sarJson = JSON.stringify(
      {
        sar_id: 'SAR-2026-RING-FX-7740',
        alert_id: 'RING-FX-7740',
        filing_institution: 'LaunderLens FIU Surveillance Center',
        statutory_regulation: 'FinCEN Form 111 & FIU-IND Cross-Border TBML Filing (31 CFR § 1020.320 / FEMA § 4)',
        threat_level: 'CRITICAL (96.8%)',
        primary_typology: 'CROSS_BORDER_FX_SMUGGLING',
        total_volume_laundered: {
          inr: 41500000,
          aed: 1820000,
          usd: 495200,
        },
        corridor_path: 'Mumbai (IN) → Dubai (AE) → Delaware (US) → Singapore (SG)',
        transit_duration_mins: 102,
        suspect_entities: FX_RING_NODES.map((n) => {
          const d = n.data as unknown as FxNodeData;
          return {
            account_id: n.id,
            legal_name: d.entity_name,
            jurisdiction: d.jurisdiction,
            bank: d.bank,
            role: d.role,
          };
        }),
        hop_sequence: FX_RING_EDGES_RAW,
        red_flags: [
          'Cross-Border FX Velocity: Multi-currency transit executed in under 102 mins across 4 central bank jurisdictions.',
          'Jurisdiction Risk Jump: Rapid pass-through from FATF enhanced-monitoring corridor through UAE Free Zone entity into Delaware shell LLC.',
          'TBML Over-Invoicing Spread: 24.5% markup discrepancy between Mumbai export declaration and Dubai customs tariff index.',
          'Betweenness Centrality: 070_ACC_3301 acts as a critical choke-point linking Asian capital to US banking core.',
        ],
        recommended_action: 'Immediate cross-border asset freezing order under PMLA § 17 and FinCEN 311 Special Measures.',
      },
      null,
      2
    );
    navigator.clipboard.writeText(sarJson);
    setCopiedSar(true);
    setTimeout(() => setCopiedSar(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#FAFAFA] tracking-wide uppercase">
              Cross-Border &amp; Multi-Currency Routing Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              Corridor RING-FX-7740 Active
            </span>
          </div>
          <p className="text-xs text-[#71717A] font-mono mt-1">
            Heterogeneous multi-currency graph surveillance · INR → Dubai AED → USD foreign exchange telemetry · FATF grey-list corridor
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/investigations?typology=cross-border"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#18181B] hover:bg-[#27272A] text-xs font-mono font-semibold text-[#FAFAFA] border border-white/[0.1] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            Open in Workbench
          </Link>
          <button
            onClick={() => setIsSarModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#FAFAFA] hover:bg-white text-xs font-mono font-bold text-[#09090B] shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#09090B]" />
            Generate Cross-Border SAR
          </button>
        </div>
      </div>

      {/* Main Interactive Graph Visualizer Card */}
      <div className="rounded-md bg-[#111114] border border-[#27272A] shadow-md overflow-hidden space-y-0">
        {/* Graph Header Toolbar */}
        <div className="p-4 bg-[#0C0C0E] border-b border-[#27272A] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold font-mono text-[#FAFAFA] tracking-wider uppercase">
                RING-FX-7740: Multi-Currency Corridor
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
              96.8% Threat Score
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              ₹4.15 Cr INR → AED 1.82M → $495.2K USD
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              102 mins Dwell
            </span>
          </div>

          {/* Temporal Playback Scrubber */}
          <div className="flex items-center gap-2 bg-[#18181B] px-3 py-1.5 rounded-md border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase text-[#71717A] mr-1">
              Temporal Trail:
            </span>
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep <= 1}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-white cursor-pointer"
              title="Previous Hop"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded bg-white text-[#09090B] hover:bg-zinc-200 cursor-pointer font-bold"
              title={isPlaying ? 'Pause' : 'Play Money Trail'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              disabled={currentStep >= 4}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-white cursor-pointer"
              title="Next Hop"
            >
              <SkipForward className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(1);
              }}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              title="Reset Timeline"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1 ml-2 text-[10px] font-mono text-zinc-300">
              <span>Hop</span>
              <strong className="text-emerald-400 font-bold">{currentStep}</strong>
              <span>of 4</span>
            </div>
          </div>
        </div>

        {/* ReactFlow Interactive Canvas */}
        <div className="h-[430px] w-full bg-[#09090B] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#27272A" gap={18} size={1} variant={BackgroundVariant.Dots} />
            <Controls className="!bg-[#111114] !border !border-white/[0.1] !rounded-md overflow-hidden !fill-white" />
            <MiniMap
              nodeColor={() => '#10B981'}
              maskColor="rgba(9, 9, 11, 0.85)"
              className="!bg-[#0C0C0E] !border !border-[#27272A] !rounded-md"
            />
          </ReactFlow>

          {/* Canvas Floating Legend */}
          <div className="absolute bottom-3 left-3 bg-[#0C0C0E]/90 border border-white/[0.1] backdrop-blur-md rounded-md p-2.5 text-[10px] font-mono space-y-1.5 shadow-lg select-none">
            <span className="text-zinc-400 uppercase text-[9px] block font-bold">Corridor Pipeline:</span>
            <div className="flex items-center gap-3 text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ₹ INR Origin
              </span>
              <span className="text-zinc-600">→</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                AED Dubai Bridge
              </span>
              <span className="text-zinc-600">→</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                $ USD Liquidation
              </span>
            </div>
          </div>
        </div>

        {/* Inspector & XAI Telemetry Footer Grid */}
        <div className="p-5 bg-[#0C0C0E] border-t border-[#27272A] grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Node Inspector */}
          <div className="lg:col-span-1 p-4 rounded-md bg-[#111114] border border-[#27272A] space-y-3">
            {(() => {
              const nodeData = selectedNode.data as unknown as FxNodeData;
              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                    <span className="text-xs font-bold font-mono text-[#FAFAFA] uppercase flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-400" />
                      Inspected Node Dossier
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {nodeData.currency || 'USD'} Account
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#71717A]">
                      <span>Account ID:</span>
                      <strong className="text-white font-bold">{selectedNode.id}</strong>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>Entity Name:</span>
                      <strong className="text-white">{nodeData.entity_name}</strong>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>Jurisdiction:</span>
                      <strong className="text-cyan-400">{nodeData.jurisdiction}</strong>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>Bank Institution:</span>
                      <strong className="text-zinc-300">{nodeData.bank}</strong>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>Operating Balance:</span>
                      <strong className="text-emerald-400 font-bold">{nodeData.balance}</strong>
                    </div>
                    <div className="flex justify-between text-[#71717A]">
                      <span>Corridor Role:</span>
                      <span className="text-amber-300 font-bold uppercase text-[10px]">
                        {nodeData.badge || nodeData.role}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Explainable AI Driver Contributions */}
          <div className="lg:col-span-2 p-4 rounded-md bg-[#111114] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <span className="text-xs font-bold font-mono text-[#FAFAFA] uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Cross-Border XAI Feature Driver Attributions
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                GDS Model Confidence: 98.2%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A] space-y-1">
                <div className="flex justify-between">
                  <span className="text-white font-medium">Cross-Border FX Velocity</span>
                  <span className="text-emerald-400 font-bold">38.0%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-zinc-800 overflow-hidden">
                  <div style={{ width: '38%' }} className="h-full bg-emerald-400 rounded" />
                </div>
                <p className="text-[10px] text-zinc-400 pt-0.5">
                  Transit through 4 sovereign jurisdictions in 102 mins.
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A] space-y-1">
                <div className="flex justify-between">
                  <span className="text-white font-medium">Jurisdiction Risk Jump</span>
                  <span className="text-rose-400 font-bold">29.0%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-zinc-800 overflow-hidden">
                  <div style={{ width: '29%' }} className="h-full bg-rose-400 rounded" />
                </div>
                <p className="text-[10px] text-zinc-400 pt-0.5">
                  FATF grey-list corridor routed into Delaware shell LLC.
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A] space-y-1">
                <div className="flex justify-between">
                  <span className="text-white font-medium">TBML Over-Invoicing Spread</span>
                  <span className="text-amber-400 font-bold">21.0%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-zinc-800 overflow-hidden">
                  <div style={{ width: '21%' }} className="h-full bg-amber-400 rounded" />
                </div>
                <p className="text-[10px] text-zinc-400 pt-0.5">
                  24.5% commodity invoice inflation versus Singapore customs index.
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A] space-y-1">
                <div className="flex justify-between">
                  <span className="text-white font-medium">Betweenness Centrality</span>
                  <span className="text-cyan-400 font-bold">12.0%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-zinc-800 overflow-hidden">
                  <div style={{ width: '12%' }} className="h-full bg-cyan-400 rounded" />
                </div>
                <p className="text-[10px] text-zinc-400 pt-0.5">
                  070_ACC_3301 serves as structural choke-point conduit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corridors Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wide">
            Correspondent Banking Corridors Under Active Surveillance
          </h2>
          <span className="text-xs text-[#71717A] font-mono">
            Updated in Real-Time via SWIFT Financial Messaging
          </span>
        </div>

        {routes.map((route) => (
          <div
            key={route.route_id}
            className="p-5 rounded-md bg-[#111114] border border-[#27272A] shadow-sm space-y-4 hover:border-white/[0.12] transition-colors"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#FAFAFA] bg-[#18181B] px-2 py-0.5 rounded border border-[#27272A]">
                  {route.route_id}
                </span>
                <span className="text-sm font-bold text-[#FAFAFA]">
                  {route.typology}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 px-2 py-0.5 rounded">
                  {route.risk_score.toFixed(1)}% Threat Score
                </span>
                <Link
                  href={`/investigations?entity=${encodeURIComponent(route.route_id)}`}
                  className="text-xs font-mono px-2 py-0.5 rounded bg-[#FAFAFA] text-[#09090B] font-bold hover:bg-zinc-200 transition-colors"
                >
                  Inspect Ring
                </Link>
              </div>
            </div>

            {/* 3-Hop Multi-Currency Visual Chain */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Origin */}
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                <p className="text-[10px] uppercase font-mono text-[#71717A]">Originating Node</p>
                <p className="text-xs font-bold text-[#FAFAFA] mt-0.5">{route.origin_city}, {route.origin_country}</p>
                <p className="text-[11px] text-[#71717A] font-mono">{route.origin_bank}</p>
                <p className="text-xs font-bold text-[#10B981] font-mono mt-2 tabular-nums">
                  {route.source_currency} {route.source_amount.toLocaleString()}
                </p>
              </div>

              {/* Intermediary Hop */}
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                <p className="text-[10px] uppercase font-mono text-[#F59E0B]">Intermediary Offshore Conduit</p>
                <p className="text-xs font-bold text-[#FAFAFA] mt-0.5">{route.intermediary_country}</p>
                <p className="text-[11px] text-[#71717A] font-mono">{route.intermediary_bank}</p>
                <p className="text-xs font-bold text-[#F59E0B] font-mono mt-2 tabular-nums">
                  {route.intermediary_currency} {route.intermediary_amount.toLocaleString()}
                </p>
              </div>

              {/* Destination */}
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                <p className="text-[10px] uppercase font-mono text-[#EF4444]">Destination Liquidation Sink</p>
                <p className="text-xs font-bold text-[#FAFAFA] mt-0.5">{route.destination_city}, {route.destination_country}</p>
                <p className="text-[11px] text-[#71717A] font-mono">{route.destination_bank}</p>
                <p className="text-xs font-bold text-[#FAFAFA] font-mono mt-2 tabular-nums">
                  {route.destination_currency} {route.destination_amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Compliance Telemetry Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs font-mono text-[#71717A]">
              <div className="flex items-center gap-2">
                <span className="text-[#EF4444] font-bold">FATF Assessment:</span>
                <span className="text-[#FAFAFA]">{route.fatf_jurisdiction_risk}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>FX Spread Discrepancy: <strong className="text-[#F59E0B]">{route.fx_spread_anomaly_pct}%</strong></span>
                <span>Transit Window: <strong className="text-[#FAFAFA]">{route.transit_duration_hours} hours</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FinCEN Form 111 / FIU-IND SAR Modal */}
      {isSarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-md bg-[#111114] border border-[#27272A] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#0C0C0E] border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  Official FinCEN Form 111 &amp; FIU-IND Statutory Filing Dossier
                </h3>
              </div>
              <button
                onClick={() => setIsSarModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-[#FAFAFA]">
              <div className="p-3 rounded bg-[#09090B] border border-[#27272A] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">SAR Document ID:</span>
                  <span className="text-white font-bold">SAR-2026-RING-FX-7740</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Statutory Regulation:</span>
                  <span className="text-emerald-400 font-semibold">31 CFR § 1020.320 &amp; FEMA § 4 (Cross-Border TBML)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Threat Rating:</span>
                  <span className="text-rose-400 font-bold">CRITICAL (96.8%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Total Corridor Capital:</span>
                  <span className="text-white font-bold">₹4.15 Cr INR → AED 1,820,000 → $495,200 USD</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Chronological Multi-Currency Hop Trail
                </h4>
                <div className="space-y-2">
                  {FX_RING_EDGES_RAW.map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 rounded bg-[#09090B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{e.id}</span>
                          <span className="text-white font-bold">{e.source} → {e.target}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            {e.currency}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {e.from_bank} → {e.to_bank} · {e.payment_format}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">{e.amount_formatted}</div>
                        <div className="text-[10px] text-amber-300 font-medium">⚠️ {e.flag}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Statutory Red Flag Indicators
                </h4>
                <ul className="space-y-1.5 text-[11px] text-zinc-300 list-disc list-inside bg-[#09090B] p-3 rounded border border-[#27272A]">
                  <li>Rapid multi-currency smurfing transit (INR → AED → USD) executed across 4 sovereign jurisdictions in under 102 minutes.</li>
                  <li>FATF grey-list corridor transit through UAE Free Zone shell entity into Delaware LLC without physical commercial presence.</li>
                  <li>24.5% trade-based over-invoicing spread discrepancy against Singapore customs indices.</li>
                  <li>High betweenness centrality observed at node 070_ACC_3301 acting as an unauthorized correspondent banking conduit.</li>
                </ul>
              </div>

              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                <strong>Recommended Enforcement Action:</strong> Immediate asset freeze under 31 CFR § 1020.320 and issuance of formal FATF Grey List Corrigendum to UAE Central Bank FIU.
              </div>
            </div>

            <div className="p-4 bg-[#0C0C0E] border-t border-[#27272A] flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono">
                Digitally Sealed by LaunderLens FIU Engine
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopySar}
                  className="px-3 py-1.5 rounded bg-[#18181B] hover:bg-[#27272A] text-xs font-mono font-bold text-white border border-white/10 transition-colors cursor-pointer"
                >
                  {copiedSar ? '✓ Copied SAR JSON' : 'Copy Filing JSON'}
                </button>
                <button
                  onClick={() => setIsSarModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
