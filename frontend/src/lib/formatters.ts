export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
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
    default:
      return {
        label: typology,
        color: 'slate',
        bgBadge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
        description: 'Anomalous multi-account transaction cluster',
      };
  }
}
