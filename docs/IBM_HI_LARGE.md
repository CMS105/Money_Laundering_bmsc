# IBM HI-Large dataset integration

GraphSleuth-AML can use the IBM Transactions for Anti-Money Laundering (AML)
HI-Large split as an independent labeled benchmark. The IBM data is synthetic
(virtual-world generated), not real customer banking data. The dataset files
are distributed under the CDLA-Sharing-1.0 license; review the license before
redistributing the data.

## 1. Download with Kaggle CLI (Windows PowerShell)

From the repository root:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade kaggle polars pyarrow
```

Create a Kaggle API token at https://www.kaggle.com/settings/api. Put the
downloaded `kaggle.json` at:

```text
%USERPROFILE%\.kaggle\kaggle.json
```

Then download the large transaction file:

```powershell
New-Item -ItemType Directory -Force data\raw | Out-Null
kaggle datasets files ealtman2019/ibm-transactions-for-anti-money-laundering-aml
kaggle datasets download -d ealtman2019/ibm-transactions-for-anti-money-laundering-aml -f HI-Large_Trans.csv -p data\raw --unzip
```

The dataset's HI-Large companion pattern file can also be downloaded for later
typology-level analysis:

```powershell
kaggle datasets download -d ealtman2019/ibm-transactions-for-anti-money-laundering-aml -f HI-Large_Patterns.txt -p data\raw --unzip
```

Do not put `kaggle.json`, the raw CSV, or downloaded dataset archives in Git.

## 2. Normalize the CSV

The raw IBM file contains two columns named `Account` (sender and receiver).
The importer renames these by position, combines each account with its bank ID
to avoid collisions, parses timestamps to Unix seconds, maps the laundering
label, and emits the schema required by `TemporalGraph`.

For a safe first run on a laptop, export at most 100,000 transactions and keep
one payment currency so the current graph engine does not add unlike currency
amounts together:

```powershell
.\.venv\Scripts\python -m backend.data.import_ibm_aml --limit 100000 --currency "US Dollar"
```

The normalized output is written to
`data/processed/ibm_hi_large_graph.parquet`. The original dataset is not
modified. Use `--limit 0` to export all matching rows only if you have enough
disk space and memory. Use `--currency ALL` only for data preparation; the
current graph metrics sum numeric amounts without foreign-exchange conversion,
so cross-currency totals are not financially comparable.

## 3. Run the current GraphSleuth benchmark

```powershell
.\.venv\Scripts\python -m backend.data.run_ibm_benchmark
```

This invokes the existing threshold baseline, smurfing detector, cycle
detector, and mule-chain detector through the existing benchmark evaluator.
It reports precision, recall, F1, and false-positive rate against the IBM
transaction labels.

## Important evaluation notes

- The importer sets `typology=NORMAL` and `pattern_id=null` because the
  transaction CSV's binary `Is Laundering` label does not by itself provide a
  per-transaction typology mapping. The companion `HI-Large_Patterns.txt`
  must be parsed separately before making typology-specific ground-truth claims.
- This benchmark evaluates the selected rows in the Parquet file. Do not
  describe a 100,000-row run as a full-dataset result.
- The existing NetworkX graph is in-memory. Start with the default 100,000-row
  limit; do not load all HI-Large transactions into the API process on a
  normal laptop.
- Existing detector thresholds were originally tuned against GraphSleuth's
  own synthetic generator. Treat the IBM results as an external validation
  experiment, not a guarantee of real-world banking performance.
