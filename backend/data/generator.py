import random
import uuid
import polars as pl
from typing import List, Tuple, Dict, Any
from .models import Transaction, TypologyType, DatasetSummary


class SyntheticAMLGenerator:
    """
    Generates realistic banking transactions with mathematically injected,
    ground-truth labeled money laundering topologies:
    - Smurfing (Fan-in / Fan-out dispersion and aggregation)
    - Temporal Cycles (Directed loops with monotonic timestamps)
    - Rapid Pass-Through Mule Chains (Fast transit and tight balance ratios)
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        random.seed(seed)
        self.transactions: List[Transaction] = []
        self.accounts: set = set()
        self.stats = {
            "smurfing_rings": 0,
            "cycle_rings": 0,
            "mule_chains": 0,
        }

    def generate_dataset(
        self,
        num_normal_tx: int = 3000,
        num_smurfing_rings: int = 15,
        num_cycle_rings: int = 15,
        num_mule_chains: int = 15,
        base_timestamp: int = 1700000000,
        duration_days: int = 7,
    ) -> pl.DataFrame:
        """
        Generate complete mixed dataset with normal noise and injected rings.
        """
        self.transactions.clear()
        self.accounts.clear()
        self.stats = {
            "smurfing_rings": 0,
            "cycle_rings": 0,
            "mule_chains": 0,
        }

        # 1. Generate Normal Background Noise
        self._generate_normal_traffic(
            num_tx=num_normal_tx,
            base_timestamp=base_timestamp,
            duration_seconds=duration_days * 86400,
        )

        # Distribute illicit rings across the entire duration (leaving 4h buffer for ring completion)
        max_offset = max(0, duration_days * 86400 - 14400)

        # 2. Inject Smurfing Rings (Fan-out -> Fan-in)
        for i in range(num_smurfing_rings):
            self._inject_smurfing_ring(
                ring_idx=i + 1,
                base_time=base_timestamp + random.randint(0, max_offset),
            )

        # 3. Inject Temporal Round-Tripping Cycles
        for i in range(num_cycle_rings):
            self._inject_cycle_ring(
                ring_idx=i + 1,
                base_time=base_timestamp + random.randint(0, max_offset),
            )

        # 4. Inject Rapid Pass-Through Mule Chains
        for i in range(num_mule_chains):
            self._inject_mule_chain(
                chain_idx=i + 1,
                base_time=base_timestamp + random.randint(0, max_offset),
            )

        # Sort transactions chronologically
        self.transactions.sort(key=lambda tx: tx.timestamp)

        # Convert to Polars DataFrame
        records = [tx.model_dump() for tx in self.transactions]
        df = pl.DataFrame(records)
        return df

    def _generate_normal_traffic(self, num_tx: int, base_timestamp: int, duration_seconds: int):
        num_normal_accounts = max(100, num_tx // 8)
        normal_pool = [f"ACC_NORM_{i:04d}" for i in range(num_normal_accounts)]
        self.accounts.update(normal_pool)

        for _ in range(num_tx):
            src, dst = random.sample(normal_pool, 2)
            ts = base_timestamp + random.randint(0, duration_seconds)
            
            # Log-normal distribution for typical retail & small business payments
            # Median ~ $150, rare spikes up to $8,000 (below $10k threshold)
            amount = round(float(random.lognormvariate(5.0, 1.2)), 2)
            if amount < 5.0:
                amount = 5.0
            if amount > 15000.0:  # Occasional rare high-value legitimate purchase
                amount = round(amount % 12000.0 + 1000.0, 2)

            tx = Transaction(
                transaction_id=f"TX_{uuid.uuid4().hex[:10].upper()}",
                timestamp=ts,
                source_account=src,
                target_account=dst,
                amount=amount,
                currency="USD",
                is_laundering=False,
                typology=TypologyType.NORMAL,
                pattern_id=None,
            )
            self.transactions.append(tx)

    def _inject_smurfing_ring(self, ring_idx: int, base_time: int):
        """
        Smurfing: Master Sender -> Multiple Smurfs (Fan-Out) -> Master Receiver (Fan-In).
        Amounts kept strictly below CTR threshold ($8,500 - $9,900).
        """
        pattern_id = f"SMURF_RING_{ring_idx:03d}"
        master_sender = f"ACC_SMURF_SRC_{ring_idx:03d}"
        master_receiver = f"ACC_SMURF_DST_{ring_idx:03d}"
        num_smurfs = random.randint(4, 7)
        smurf_accounts = [f"ACC_SMURF_MULE_{ring_idx:03d}_{s:02d}" for s in range(num_smurfs)]

        self.accounts.update([master_sender, master_receiver] + smurf_accounts)
        self.stats["smurfing_rings"] += 1

        # Phase A: Fan-Out (Dispersion)
        current_time = base_time
        smurf_amounts = []
        for smurf in smurf_accounts:
            # Structuring: amounts intentionally just below $10,000 threshold
            amount = round(random.uniform(8500.0, 9850.0), 2)
            smurf_amounts.append(amount)
            current_time += random.randint(120, 600)  # staggered by 2-10 mins

            self.transactions.append(
                Transaction(
                    transaction_id=f"TX_{uuid.uuid4().hex[:10].upper()}",
                    timestamp=current_time,
                    source_account=master_sender,
                    target_account=smurf,
                    amount=amount,
                    is_laundering=True,
                    typology=TypologyType.SMURFING,
                    pattern_id=pattern_id,
                )
            )

        # Phase B: Fan-In (Aggregation to destination)
        current_time += random.randint(1800, 3600)  # Wait 30-60 mins
        for smurf, orig_amount in zip(smurf_accounts, smurf_amounts):
            # Intermediary smurf fee cut (0.5% - 1.5%)
            forward_amount = round(orig_amount * random.uniform(0.985, 0.995), 2)
            current_time += random.randint(120, 600)

            self.transactions.append(
                Transaction(
                    transaction_id=f"TX_{uuid.uuid4().hex[:10].upper()}",
                    timestamp=current_time,
                    source_account=smurf,
                    target_account=master_receiver,
                    amount=forward_amount,
                    is_laundering=True,
                    typology=TypologyType.SMURFING,
                    pattern_id=pattern_id,
                )
            )

    def _inject_cycle_ring(self, ring_idx: int, base_time: int):
        """
        Cyclic Round-Tripping: A -> B -> C -> ... -> A with strictly monotonic timestamps.
        Demonstrates layered money laundering loops.
        """
        pattern_id = f"CYCLE_RING_{ring_idx:03d}"
        cycle_len = random.randint(3, 5)
        cycle_nodes = [f"ACC_CYCLE_{ring_idx:03d}_{i:02d}" for i in range(cycle_len)]
        self.accounts.update(cycle_nodes)
        self.stats["cycle_rings"] += 1

        current_time = base_time
        current_amount = round(random.uniform(25000.0, 75000.0), 2)

        for i in range(cycle_len):
            src = cycle_nodes[i]
            dst = cycle_nodes[(i + 1) % cycle_len]
            # Transit cut per hop
            current_amount = round(current_amount * random.uniform(0.98, 0.995), 2)
            current_time += random.randint(300, 1800)  # Monotonic time progression

            self.transactions.append(
                Transaction(
                    transaction_id=f"TX_{uuid.uuid4().hex[:10].upper()}",
                    timestamp=current_time,
                    source_account=src,
                    target_account=dst,
                    amount=current_amount,
                    is_laundering=True,
                    typology=TypologyType.ROUNDTRIP_CYCLE,
                    pattern_id=pattern_id,
                )
            )

    def _inject_mule_chain(self, chain_idx: int, base_time: int):
        """
        Rapid Pass-Through Mule Chain:
        Source -> Mule_1 -> Mule_2 -> Mule_3 -> Destination
        Characterized by low transit latency (under 30 mins per hop) and near 100% pass-through.
        """
        pattern_id = f"MULE_CHAIN_{chain_idx:03d}"
        chain_len = random.randint(3, 5)
        chain_nodes = [f"ACC_MULE_{chain_idx:03d}_{i:02d}" for i in range(chain_len)]
        self.accounts.update(chain_nodes)
        self.stats["mule_chains"] += 1

        current_time = base_time
        # Initial large sum
        current_amount = round(random.uniform(18000.0, 45000.0), 2)

        for i in range(chain_len - 1):
            src = chain_nodes[i]
            dst = chain_nodes[i + 1]
            current_time += random.randint(60, 600)  # Rapid: 1 to 10 minutes transit
            # High retention pass-through (minimal fee cut)
            current_amount = round(current_amount * random.uniform(0.985, 0.998), 2)

            self.transactions.append(
                Transaction(
                    transaction_id=f"TX_{uuid.uuid4().hex[:10].upper()}",
                    timestamp=current_time,
                    source_account=src,
                    target_account=dst,
                    amount=current_amount,
                    is_laundering=True,
                    typology=TypologyType.MULE_CHAIN,
                    pattern_id=pattern_id,
                )
            )

    def get_summary(self) -> DatasetSummary:
        total_tx = len(self.transactions)
        laundering_tx = sum(1 for tx in self.transactions if tx.is_laundering)
        total_vol = sum(tx.amount for tx in self.transactions)
        ratio = laundering_tx / total_tx if total_tx > 0 else 0.0

        return DatasetSummary(
            total_transactions=total_tx,
            total_accounts=len(self.accounts),
            total_volume=round(total_vol, 2),
            laundering_transactions=laundering_tx,
            laundering_ratio=round(ratio, 4),
            smurfing_rings=self.stats["smurfing_rings"],
            cycle_rings=self.stats["cycle_rings"],
            mule_chains=self.stats["mule_chains"],
        )

