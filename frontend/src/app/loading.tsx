import LatticeLoader from '@/components/react-bits/LatticeLoader';

export default function Loading() {
  return (
    <LatticeLoader
      fullscreen={true}
      label="Preparing your intelligence workspace"
      sublabel="Synchronizing graph topology, ML ablations, and regulatory ledgers"
    />
  );
}

