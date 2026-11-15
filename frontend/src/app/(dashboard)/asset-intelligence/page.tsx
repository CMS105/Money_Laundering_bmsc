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
  Coins,
  Gem,
  ArrowRight,
  FileText,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Zap,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import AccountNode from '@/components/canvas/AccountNode';
import TransactionEdge from '@/components/canvas/TransactionEdge';

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
    title: '8.4 kg Minted Gold Cast Bars (999.9 Purity)',
    location: 'Zaveri Bazaar Refinery -> Aurum Vaults DMCC, Dubai',
    declared_value_usd: 520000.0,
    declared_value_inr: 43200000.0,
    market_appraisal_usd: 520000.0,
    cash_component_pct: 95.0,
    purchaser_entity: 'Vikas Silver & Gold Bullion Refinery',
    ubo_individual: 'Vikas R. Soni (Watchlist Target)',
    funding_bank_account: '010_ACC_5502 (HDFC Bank Mumbai)',
    counterparty_seller: 'Aurum Vaults DMCC, Almas Tower Dubai',
    risk_score: 98.7,
    red_flag: 'Cash deposit structured in ₹49,000 tranches below PAN limits, converted directly into 8.4 kg physical bullion bars.',
  },
  {
    asset_id: 'ASSET-PROP-02',
    category: 'High-Value Prime Real Estate Escrow',
    title: 'Penthouse Escrow Account Liquidation',
    location: 'Meridian Luxury Estates Escrow NY -> BNY Mellon',
    declared_value_usd: 518000.0,
    declared_value_inr: 43045800.0,
    market_appraisal_usd: 525000.0,
    cash_component_pct: 100.0,
    purchaser_entity: 'Meridian Luxury Estates Escrow LLC',
    ubo_individual: 'Concealed Delaware Shell LLC',
    funding_bank_account: '020_ACC_7731 (JPMorgan NY Escrow)',
    counterparty_seller: 'Apex Global Holdings Escrow',
    risk_score: 97.4,
    red_flag: 'Real estate purchase aborted within 48h; escrow deposit refunded as clean fiat wire into offshore corporate account.',
  },
  {
    asset_id: 'ASSET-YACHT-03',
    category: 'Maritime Luxury Vessels',
    title: 'Custom 48m Tri-Deck Superyacht',
    location: 'Port Rashid Marina, Dubai, UAE',
    declared_value_usd: 8400000.0,
    declared_value_inr: 705600000.0,
    market_appraisal_usd: 8900000.0,
    cash_component_pct: 35.0,
    purchaser_entity: 'Azure Wave Marine Holdings FZE',
    ubo_individual: 'Alexander V. Smirnov (Sanctioned PEP)',
    funding_bank_account: '070_ACC_9921 (Zenith Holdings SG)',
    counterparty_seller: 'Gulf Craft Shipyard UAE',
    risk_score: 96.1,
    red_flag: 'Offshore trust structure with nominee directorship in Marshall Islands hiding beneficial ownership.',
  },
];

const RING_AST_5502_NODES = [
  {
    id: '010_ACC_1022',
    name: 'Structured Cash Pool',
    role: 'CASH SOURCE',
    bank: 'HDFC0001022',
    jurisdiction: 'Mumbai, IN',
    currency: 'INR',
    balance: '₹4.32 Cr Cash',
    risk_score: 96.4,
    badge: 'PMLA Watchlist',
    x: 80,
    y: 190,
  },
  {
    id: '010_ACC_5502',
    name: 'Vikas Gold Bullion Refinery',
    role: 'BULLION REFINERY',
    bank: 'HDFC0005502',
    jurisdiction: 'Mumbai, IN',
    currency: '24K Gold',
    balance: '8.4 kg Au ($520K)',
    risk_score: 98.7,
    badge: 'Bullion Hub',
    x: 430,
    y: 190,
  },
  {
    id: '070_ACC_6190',
    name: 'Aurum Vaults DMCC',
    role: 'DMCC VAULT CONDUIT',
    bank: 'EBILAEADXXX',
    jurisdiction: 'Dubai, AE',
    currency: '24K Gold / USD',
    balance: '$520,000 Vaulted',
    risk_score: 97.9,
    badge: 'Offshore Vault',
    x: 780,
    y: 190,
  },
  {
    id: '020_ACC_7731',
    name: 'Meridian Luxury Estates Escrow',
    role: 'CLEAN FIAT EXIT',
    bank: 'CHASUS33XXX',
    jurisdiction: 'New York, US',
    currency: 'USD',
    balance: '$518,000 Clean',
    risk_score: 95.8,
    badge: 'Fiat Exit',
    x: 1130,
    y: 190,
  },
];

const RING_AST_5502_EDGES = [
  {
    id: 'e-ast-1',
    source: '010_ACC_1022',
    target: '010_ACC_5502',
    label: '₹4.32 Cr Cash Deposit',
    currency: 'INR',
    amount_formatted: '₹4.32 Cr',
    delay: '18m',
    flag: '⚠️ Structured Cash Deposit',
    step: 1,
  },
  {
    id: 'e-ast-2',
    source: '010_ACC_5502',
    target: '070_ACC_6190',
    label: '8.4 kg Au Bullion Purchase ($520K)',
    currency: '24K Gold',
    amount_formatted: '$520,000 USD (8.4 kg)',
    delay: '35m',
    flag: '⚠️ Physical Vault Custody Transfer',
    step: 2,
  },
  {
    id: 'e-ast-3',
    source: '070_ACC_6190',
    target: '020_ACC_7731',
    label: 'Escrow Liquidation Wire ($518K)',
    currency: 'USD',
    amount_formatted: '$518,000 USD',
    delay: '22m',
    flag: '⚠️ 94.8% Value Retention Loop',
    step: 3,
  },
];

export default function AssetIntelligencePage() {
  const [assets] = useState<AssetInvestigation[]>(FALLBACK_ASSETS);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('010_ACC_5502');
  const [activeStep, setActiveStep] = useState<number>(3); // 1, 2, 3
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sarModalOpen, setSarModalOpen] = useState<boolean>(false);
  const [copiedSar, setCopiedSar] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
      }, 1600);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Construct React Flow elements based on active step
  const flowNodes: Node[] = React.useMemo(() => {
    return RING_AST_5502_NODES.map((n) => {
      const isSelected = n.id === selectedNodeId;
      return {
        id: n.id,
        type: 'account',
        position: { x: n.x, y: n.y },
        data: {
          id: n.id,
          label: n.name,
          role: n.role,
          bank: n.bank,
          jurisdiction: n.jurisdiction,
          currency: n.currency,
          balance: n.balance,
          riskScore: n.risk_score,
          badge: n.badge,
          isSelected,
        },
      };
    });
  }, [selectedNodeId]);

  const flowEdges: Edge[] = React.useMemo(() => {
    return RING_AST_5502_EDGES.filter((e) => e.step <= activeStep).map((e) => {
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'transaction',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#F59E0B',
          width: 14,
          height: 14,
        },
        data: {
          amount: e.label,
          currency: e.currency,
          amount_formatted: e.amount_formatted,
          delay: e.delay,
          flag: e.flag,
        },
      };
    });
  }, [activeStep]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const selectedNode = RING_AST_5502_NODES.find((n) => n.id === selectedNodeId) || RING_AST_5502_NODES[1];

  const nodeTypes = React.useMemo(() => ({ account: AccountNode }), []);
  const edgeTypes = React.useMemo(() => ({ transaction: TransactionEdge }), []);

  const handleCopySar = () => {
    navigator.clipboard.writeText(JSON.stringify(sarPayload, null, 2));
    setCopiedSar(true);
    setTimeout(() => setCopiedSar(false), 2000);
  };

  const sarPayload = {
    filing_type: 'FinCEN Form 111 & FIU-IND High-Value Bullion / Real Estate Notification',
    suspicious_cluster_id: 'RING-AST-5502',
    regulatory_framework: 'FATF R.22/R.23 (DNFBPs), PMLA 2002 Section 12, USA PATRIOT Act § 352',
    subject_entity: {
      entity_name: 'Vikas Silver & Gold Bullion Refinery / Vikas R. Soni',
      account_id: '010_ACC_5502',
      primary_bank: 'HDFC Bank, Fort Branch, Mumbai (HDFC0005502)',
      jurisdiction: 'India (Domestic Cash Pool -> Offshore Bullion Vault)',
    },
    typology_classification: 'TRADE_BASED_ASSET_CONVERSION_AND_ESCROW_REFUND',
    total_laundered_capital: '$520,000.00 USD (₹4.32 Cr INR Equivalent)',
    conversion_mechanisms: [
      {
        stage: 'Placement',
        mechanism: 'Structured Cash Pool in 88 sub-PAN deposits (₹49,000 each) into HDFC Mumbai Account 010_ACC_1022',
        volume: '₹43,200,000 INR ($520,000 USD eq)',
      },
      {
        stage: 'Layering',
        mechanism: 'Over-the-counter procurement of 8.4 kg physical 24K gold bullion cast bars (999.9 purity) without VAT reporting',
        vault_facility: 'Aurum Vaults DMCC, Almas Tower, JLT Dubai (Account 070_ACC_6190)',
      },
      {
        stage: 'Integration',
        mechanism: 'Real estate purchase escrow funding with aborted purchase and clean fiat escrow liquidation wire into BNY Mellon NY',
        clean_fiat_exit: 'Meridian Luxury Estates Escrow NY (020_ACC_7731)',
        retention_rate: '94.8% ($518,000 recovered in clean USD)',
      },
    ],
    xai_risk_drivers: [
      { driver: 'Asset-to-Fiat Loop Ratio', score: 0.948, weight: 0.38 },
      { driver: 'Physical Bullion Custody Transfer Anomaly', score: 0.962, weight: 0.28 },
      { driver: 'Cash Structuring below PAN Thresholds', score: 0.945, weight: 0.22 },
      { driver: 'Escrow Liquidation Hop Velocity', score: 0.910, weight: 0.12 },
    ],
    filing_action: 'PRIORITY_FIU_TRANSMISSION_AND_FREEZE_DIRECTIVE',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-[#FAFAFA] tracking-wide uppercase">
              Gold Bullion &amp; Real Estate Asset Laundering Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              RING-AST-5502
            </span>
          </div>
          <p className="text-xs text-[#71717A] font-mono mt-1">
            Forensic analysis of physical 24K gold bullion layering, DMCC vault custody transfers, and clean real estate escrow liquidations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/investigations?typology=asset"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18181B] border border-white/10 hover:border-white/20 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Open in Full Workbench</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </Link>
          <button
            onClick={() => setSarModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-black text-xs font-mono font-bold transition-colors shadow-lg shadow-amber-600/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Asset SAR</span>
          </button>
        </div>
      </div>

      {/* Interactive Network Graph Canvas */}
      <div className="rounded-md border border-[#27272A] bg-[#111114] overflow-hidden flex flex-col shadow-2xl">
        {/* Canvas Toolbar & Scrubber Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0D0D10] border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
              <Zap className="w-3.5 h-3.5" />
              Temporal Flow Visualizer
            </span>
            <span className="text-[11px] font-mono text-[#71717A]">
              Step {activeStep} of 3 · Dwell Hop Transit
            </span>
          </div>

          {/* Temporal Scrubber Buttons */}
          <div className="flex items-center gap-1.5 bg-[#18181B] p-1 rounded border border-white/[0.08]">
            <button
              onClick={() => setActiveStep(1)}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep <= 1}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Previous Hop"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-black text-xs font-mono font-bold hover:bg-amber-400 transition-colors"
              title={isPlaying ? 'Pause' : 'Play Flow'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-black" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
              disabled={activeStep >= 3}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Next Hop"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-all ${
                    activeStep >= step
                      ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/50'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Graph + Node Inspector Split View */}
        <div className="flex flex-col lg:flex-row h-[420px]">
          {/* React Flow Canvas */}
          <div className="flex-1 h-full relative bg-[#09090B]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              minZoom={0.5}
              maxZoom={1.5}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#27272A" />
              <Controls className="bg-[#111114] border-white/10 fill-white text-white" />
              <MiniMap
                nodeStrokeColor="#27272A"
                nodeColor="#18181B"
                maskColor="rgba(9, 9, 11, 0.85)"
                className="bg-[#111114] border border-[#27272A] rounded"
              />
            </ReactFlow>

            {/* Quick Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-[#111114]/90 backdrop-blur-md border border-white/10 p-2 rounded text-[10px] font-mono space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Placement (Structured Cash)</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Layering (8.4 kg Au Bullion Vaulting)</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Integration (Clean Real Estate Escrow)</span>
              </div>
            </div>
          </div>

          {/* Node Inspector Dossier Panel */}
          <div className="w-full lg:w-80 h-full border-t lg:border-t-0 lg:border-l border-[#27272A] bg-[#0E0E11] p-4 flex flex-col justify-between overflow-y-auto text-xs font-mono">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">
                  Entity Dossier
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {selectedNode.role}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white">{selectedNode.name}</div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Building className="w-3 h-3 text-zinc-500" />
                  <span>{selectedNode.bank}</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Location: <strong className="text-zinc-200">{selectedNode.jurisdiction}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#27272A]">
                <div className="bg-[#18181B] p-2 rounded border border-white/5">
                  <div className="text-[10px] text-zinc-500">Asset / Currency</div>
                  <div className="text-xs font-bold text-amber-400">{selectedNode.currency}</div>
                </div>
                <div className="bg-[#18181B] p-2 rounded border border-white/5">
                  <div className="text-[10px] text-zinc-500">Node Balance</div>
                  <div className="text-xs font-bold text-emerald-400">{selectedNode.balance}</div>
                </div>
              </div>

              {/* XAI Drivers for Selected Node */}
              <div className="space-y-1.5 pt-2 border-t border-[#27272A]">
                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Forensic Red Flags
                </div>
                <div className="text-[11px] text-zinc-300 bg-amber-500/10 p-2 rounded border border-amber-500/20 leading-relaxed">
                  {selectedNode.id === '010_ACC_1022' &&
                    '88 structured cash deposits below PAN threshold aggregating to ₹4.32 Cr in under 72h.'}
                  {selectedNode.id === '010_ACC_5502' &&
                    'Instant conversion of structured cash into 8.4 kg physical 24K gold bullion cast bars.'}
                  {selectedNode.id === '070_ACC_6190' &&
                    'Physical bullion custody transferred offshore to DMCC vault; zero domestic industrial utility.'}
                  {selectedNode.id === '020_ACC_7731' &&
                    'Aborted real estate purchase escrow refund; capital recovered into clean US banking system (94.8% retention).'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27272A]">
              <Link
                href={`/investigations?entity=${selectedNode.id}`}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
              >
                <span>Audit Node in Graph Canvas</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SAR Generation Modal */}
      {sarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111114] border border-[#27272A] rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[#27272A] bg-[#18181B]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  FinCEN Form 111 &amp; FIU-IND Asset Laundering SAR
                </h3>
              </div>
              <button
                onClick={() => setSarModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-zinc-300">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-300 leading-relaxed">
                <strong>STATUTORY COMPLIANCE FILING:</strong> This SAR fulfills mandatory reporting under FATF R.22/R.23 (DNFBPs), PMLA 2002 Section 12, and the Bank Secrecy Act regarding physical bullion layering and escrow liquidation.
              </div>

              <div className="bg-[#09090B] p-3 rounded border border-white/10 space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-zinc-500">Filing Jurisdiction:</span>
                  <span className="text-zinc-200">FIU-IND (India) &amp; FinCEN (United States)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-zinc-500">Primary Target:</span>
                  <span className="text-amber-400 font-bold">Vikas Silver &amp; Gold Bullion Refinery (010_ACC_5502)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-zinc-500">Asset Volume:</span>
                  <span className="text-emerald-400 font-bold">8.4 kg Gold Bullion ($520,000 USD / ₹4.32 Cr)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Value Retention Loop:</span>
                  <span className="text-cyan-400 font-bold">94.8% Clean Fiat Recovery ($518,000 USD)</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-zinc-400 mb-1">Raw Regulatory Filing JSON:</div>
                <pre className="bg-[#09090B] p-3 rounded border border-white/10 text-[10px] text-zinc-300 overflow-x-auto max-h-48">
                  {JSON.stringify(sarPayload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border-t border-[#27272A] bg-[#18181B]">
              <span className="text-[10px] text-zinc-500">PMLA § 12 / BSA Form 111 Ready</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                >
                  {copiedSar ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
                  <span>{copiedSar ? 'Copied Filing JSON!' : 'Copy Filing JSON'}</span>
                </button>
                <button
                  onClick={() => setSarModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold transition-colors"
                >
                  Acknowledge &amp; Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Catalog Table */}
      <div className="rounded-md border border-[#27272A] bg-[#111114] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              High-Value Physical Asset Surveillance Ledger
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {assets.length} High-Risk Asset Conversions Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A] text-[10px] uppercase">
                <th className="pb-2">Asset ID</th>
                <th className="pb-2">Category &amp; Title</th>
                <th className="pb-2">Declared Value (USD / INR)</th>
                <th className="pb-2">Cash Component</th>
                <th className="pb-2">Beneficial Owner (UBO)</th>
                <th className="pb-2">Risk Score</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/50 text-zinc-300">
              {assets.map((ast) => (
                <tr key={ast.asset_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 font-bold text-amber-400">{ast.asset_id}</td>
                  <td className="py-2.5">
                    <div className="font-semibold text-white">{ast.title}</div>
                    <div className="text-[10px] text-zinc-500">{ast.location}</div>
                  </td>
                  <td className="py-2.5">
                    <div className="text-emerald-400 font-bold">
                      ${ast.declared_value_usd.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      ₹{(ast.declared_value_inr / 10000000).toFixed(2)} Cr
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                      {ast.cash_component_pct}% Cash
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="text-zinc-200">{ast.ubo_individual}</div>
                    <div className="text-[10px] text-zinc-500">{ast.purchaser_entity}</div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                      {ast.risk_score}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      href={`/investigations?typology=asset`}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold transition-colors inline-block"
                    >
                      Audit
                    </Link>
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
