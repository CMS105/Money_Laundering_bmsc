export function formatCurrency(
  amountUSD: number,
  currency: 'USD' | 'INR' = 'USD',
  compact: boolean = false
): string {
  if (isNaN(amountUSD) || amountUSD == null) return currency === 'USD' ? '$0' : '₹0';

  if (currency === 'USD') {
    if (compact) {
      if (amountUSD >= 1000000) {
        return `$${(amountUSD / 1000000).toFixed(2)}M`;
      }
      if (amountUSD >= 1000) {
        return `$${(amountUSD / 1000).toFixed(1)}K`;
      }
      return `$${Math.round(amountUSD).toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amountUSD);
  }

  // INR conversion (1 USD = 83.5 INR)
  const inrVal = amountUSD * 83.5;
  if (compact) {
    if (inrVal >= 10000000) {
      return `₹${(inrVal / 10000000).toFixed(2)} Cr`;
    }
    if (inrVal >= 100000) {
      return `₹${(inrVal / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(inrVal).toLocaleString('en-IN')}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(inrVal));
}

export function formatINR(amount: number): string {
  return formatCurrency(amount, 'INR', true);
}

export function formatINRFull(amount: number): string {
  return formatCurrency(amount, 'INR', false);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getTypologyMeta(typology: string) {
  switch (typology) {
    case 'CYCLIC_ROUND_TRIPPING':
      return {
        label: 'Cyclic Round-Trip',
        color: 'cyan',
        bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        description: 'Circular funds loop returning to originator to obscure beneficial ownership',
      };
    case 'FAN_OUT_IN':
      return {
        label: 'Fan-Out / Fan-In',
        color: 'purple',
        bgBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        description: 'Smurfing split into sub-threshold tranches re-aggregating to single sink',
      };
    case 'MULE_CHAIN':
      return {
        label: 'Mule Relay Chain',
        color: 'amber',
        bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        description: 'High-velocity serial hops through transient accounts with ultra-low dwell time',
      };
    case 'CROSS_BORDER_FX':
    case 'CROSS_BORDER':
      return {
        label: 'Cross-Border FX Corridor',
        color: 'emerald',
        bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        description: 'Multi-currency smurfing (INR → AED → USD) with TBML over-invoicing spread',
      };
    case 'ASSET_LAUNDERING':
    case 'ASSET':
      return {
        label: 'Gold & Asset Laundering',
        color: 'yellow',
        bgBadge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
        description: 'Fiat to 24K gold bullion conversion & luxury escrow real estate liquidation loop',
      };
    default:
      return {
        label: typology,
        color: 'slate',
        bgBadge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
        description: 'Anomalous multi-account transaction cluster',
      };
  }
}
