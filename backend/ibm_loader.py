"""
LaunderGraph AML - Kaggle IBM AML Dataset Loader & Smart Subgraph Sampler
Handles duplicate 'Account' columns safely, prefixes accounts with bank codes,
and extracts dense forensic subgraphs for responsive visualization and ML.
"""
import os
import glob
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional, Set
import polars as pl

from backend.data.generator import SyntheticAMLGenerator


class IBMAMLDataLoader:
    """
    Ingests Kaggle IBM AML CSV datasets, handling schema normalization,
    duplicate account column indices, and dense 1-to-2 hop forensic windowing.
    """

    def __init__(self, data_dirs: Optional[List[str]] = None):
        self.data_dirs = data_dirs or ["data", "data/raw"]

    def find_ibm_csv(self) -> Optional[str]:
        """Scans candidate directories for an IBM AML CSV."""
        for d in self.data_dirs:
            pattern = os.path.join(d, "*.csv")
            matches = glob.glob(pattern)
            for path in matches:
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        header = f.readline().strip().split(",")
                        # Check required keywords
                        if "From Bank" in header and "To Bank" in header and "Is Laundering" in header:
                            return path
                except Exception:
                    continue
        return None

    def load_dataset(
        self,
        max_subgraph_rows: int = 3000,
        scan_limit: int = 1500000,
        use_cache: bool = True,
    ) -> Tuple[pl.DataFrame, str, Dict[str, Any]]:
        """
        Loads the IBM dataset if present with smart subgraph windowing;
        uses cached sample parquet if available for sub-second startup;
        falls back to SyntheticAMLGenerator if no CSV exists.
        
        Returns:
            (pl.DataFrame, source_badge, metadata)
        """
        cache_path = os.path.join("data", "ibm_subgraph_sample.parquet")
        if use_cache and os.path.exists(cache_path):
            try:
                df = pl.read_parquet(cache_path)
                illicit_count = int(df.filter(pl.col("is_laundering") == True).shape[0])
                meta = {
                    "source": "IBM AML Benchmark",
                    "file_path": cache_path,
                    "total_rows": len(df),
                    "illicit_rows": illicit_count,
                    "total_accounts": len(set(df["source_account"].to_list() + df["target_account"].to_list())),
                    "scanned_raw_rows": "cached",
                }
                return df, "IBM AML Benchmark", meta
            except Exception:
                pass

        csv_path = self.find_ibm_csv()
        if not csv_path:
            return self._fallback_synthetic()

        df, badge, meta = self._load_and_sample_ibm(csv_path, max_subgraph_rows, scan_limit)
        try:
            os.makedirs("data", exist_ok=True)
            df.write_parquet(cache_path)
        except Exception:
            pass
        return df, badge, meta

    def _fallback_synthetic(self) -> Tuple[pl.DataFrame, str, Dict[str, Any]]:
        """Generates synthetic benchmark dataset when no IBM CSV is present."""
        gen = SyntheticAMLGenerator(seed=42)
        df = gen.generate_dataset(
            num_normal_tx=2000,
            num_smurfing_rings=10,
            num_cycle_rings=10,
            num_mule_chains=10,
        )
        # Add bank metadata to synthetic df if missing
        if "from_bank" not in df.columns:
            df = df.with_columns([
                pl.lit("020").alias("from_bank"),
                pl.lit("070").alias("to_bank"),
                pl.lit("Wire").alias("payment_format"),
                pl.lit("USD").alias("currency"),
            ])
        meta = {
            "source": "Synthetic",
            "total_rows": len(df),
            "illicit_rows": int(df.filter(pl.col("is_laundering") == True).shape[0]),
            "file_path": None,
        }
        return df, "Synthetic", meta

    def _load_and_sample_ibm(
        self,
        csv_path: str,
        max_subgraph_rows: int = 3000,
        scan_limit: int = 1500000,
    ) -> Tuple[pl.DataFrame, str, Dict[str, Any]]:
        """
        Extracts all laundering rows from the scan window, their 1-to-2 hop
        connected accounts, and background normal transactions.
        """
        laundering_rows: List[Dict[str, Any]] = []
        normal_candidate_rows: List[Dict[str, Any]] = []
        illicit_accounts: Set[str] = set()

        total_scanned = 0

        with open(csv_path, "r", encoding="utf-8", errors="ignore") as f:
            header_line = f.readline().strip().split(",")
            # Positional column mapping:
            # 0: Timestamp
            # 1: From Bank
            # 2: Account (source)
            # 3: To Bank
            # 4: Account (target)
            # 5: Amount Received
            # 6: Receiving Currency
            # 7: Amount Paid
            # 8: Payment Currency
            # 9: Payment Format
            # 10: Is Laundering

            for line_idx, line in enumerate(f):
                total_scanned += 1
                parts = line.strip().split(",")
                if len(parts) < 11:
                    continue

                is_laundering_flag = parts[10].strip()
                is_illicit = is_laundering_flag in ("1", "True", "true")

                from_bank = parts[1].strip()
                src_raw = parts[2].strip()
                to_bank = parts[3].strip()
                tgt_raw = parts[4].strip()

                # Safe prefixing to prevent cross-bank ID collisions
                source_acc = f"{from_bank}_{src_raw}"
                target_acc = f"{to_bank}_{tgt_raw}"

                # Parse timestamp
                ts_str = parts[0].strip()
                try:
                    dt = datetime.strptime(ts_str, "%Y/%m/%d %H:%M")
                    unix_ts = int(dt.timestamp())
                except Exception:
                    unix_ts = 1659293000 + (line_idx * 60)

                try:
                    amount_paid = float(parts[7].strip())
                except ValueError:
                    amount_paid = 1000.0

                try:
                    amount_received = float(parts[5].strip())
                except ValueError:
                    amount_received = amount_paid

                rec = {
                    "transaction_id": f"TX_IBM_{line_idx + 1:07d}",
                    "timestamp": unix_ts,
                    "source_account": source_acc,
                    "target_account": target_acc,
                    "amount": amount_paid,
                    "amount_received": amount_received,
                    "currency": parts[8].strip() or "USD",
                    "receiving_currency": parts[6].strip() or "USD",
                    "payment_format": parts[9].strip() or "Wire",
                    "from_bank": from_bank,
                    "to_bank": to_bank,
                    "is_laundering": is_illicit,
                    "is_illicit": is_illicit,
                }

                if is_illicit:
                    laundering_rows.append(rec)
                    illicit_accounts.add(source_acc)
                    illicit_accounts.add(target_acc)
                else:
                    # Keep a bounded sample of normal candidates
                    if len(normal_candidate_rows) < 15000:
                        normal_candidate_rows.append(rec)

                if total_scanned >= scan_limit and len(laundering_rows) >= 50:
                    break

        # 1-to-2 Hop Neighborhood Expansion
        # Collect background rows that touch any illicit account
        hop1_accounts = set(illicit_accounts)
        hop_connected_rows: List[Dict[str, Any]] = []
        unrelated_normal_rows: List[Dict[str, Any]] = []

        for row in normal_candidate_rows:
            s_acc = row["source_account"]
            t_acc = row["target_account"]
            if s_acc in hop1_accounts or t_acc in hop1_accounts:
                hop_connected_rows.append(row)
                hop1_accounts.add(s_acc)
                hop1_accounts.add(t_acc)
            else:
                unrelated_normal_rows.append(row)

        # Assemble final balanced demo window (~2,500 - 3,500 total rows)
        final_rows = list(laundering_rows)
        final_rows.extend(hop_connected_rows[:1200])

        needed_background = max_subgraph_rows - len(final_rows)
        if needed_background > 0:
            final_rows.extend(unrelated_normal_rows[:needed_background])

        # Sort chronologically by timestamp
        final_rows.sort(key=lambda x: x["timestamp"])

        df = pl.DataFrame(final_rows)
        illicit_count = int(df.filter(pl.col("is_laundering") == True).shape[0])

        metadata = {
            "source": "IBM AML Benchmark",
            "file_path": csv_path,
            "total_rows": len(df),
            "illicit_rows": illicit_count,
            "total_accounts": len(set(df["source_account"].to_list() + df["target_account"].to_list())),
            "scanned_raw_rows": total_scanned,
        }

        return df, "IBM AML Benchmark", metadata
