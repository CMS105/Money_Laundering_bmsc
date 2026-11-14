# LaunderyLens
## HackMITTEN PS 2.1: Graph-Based Detection of Layered Money Laundering Networks
**Multi-Source AI-Powered Financial Crime Intelligence & Investigation Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-12.0-ff0072?style=flat)](https://reactflow.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![NetworkX](https://img.shields.io/badge/Graph-NetworkX-blue?style=flat)](https://networkx.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-orange?style=flat&logo=scikitlearn)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing_100%25-brightgreen?style=flat)](backend/tests/)

**Production Deployment**: [https://launderylens-mschirag105-5781.vercel.app](https://launderylens-mschirag105-5781.vercel.app)  
**Interactive Dashboard**: [https://launderylens-mschirag105-5781.vercel.app/dashboard](https://launderylens-mschirag105-5781.vercel.app/dashboard)

---

## 1. Official Problem Statement (PS 2.1)

> **Rule-based anti-money-laundering systems check transactions one at a time, so they miss laundering rings that only show up in the connections between accounts. Model transactions as a temporal, directed, weighted graph.**
>
> **Detect fan-in/fan-out dispersion, cyclic round-tripping and rapid pass-through (mule) chains. Rank suspicious clusters by risk, label each alert with the matching laundering typology, and generate a plain-language summary of the money trail.**
>
> **Report precision, recall and F1 against a threshold-based baseline on a labeled dataset.**

### Core Capabilities Satisfied:
1. **Temporal, Directed, Weighted Multi-Graph Modeling**: Preserves transaction-level timestamps, monetary amounts, and multiple edges between accounts.
2. **Fan-In / Fan-Out Dispersion & Structuring Detection**: Identifies structured disbursements and rapid consolidations.
3. **Directed Cyclic Round-Tripping Detection**: Detects closed topological loops returning capital to originators with chronological consistency.
4. **Rapid Pass-Through & Mule Chain Detection**: Detects layered serial conduits with tight dwell times and high balance retention.
5. **Suspicious Cluster Identification & Risk Ranking**: Transparent multi-criteria risk scoring prioritizing high-threat networks.
6. **Typology Classification**: Formal labeling for every alert (`FAN_OUT_IN`, `CYCLIC_ROUND_TRIPPING`, `MULE_CHAIN`).
7. **Evidence-Backed Plain-Language Summaries**: Chronological money-trail narratives derived from transaction timestamps and amounts.
8. **Threshold-Based Baseline**: Standard legacy rule checking transactions individually (e.g., CTR > $10,000 rule).
9. **Quantitative Labeled Evaluation**: Precision, Recall, and F1 evaluation against ground-truth labels on the IBM AML benchmark.
10. **Interactive Investigation Workbench**: 3-panel UI with interactive React Flow graph canvas, timeline scrubber, and dossier inspector.

---

## 2. Technical Architecture

```
                                 ┌────────────────────────────────────────────────────────┐
                                 │                DATA INGESTION & PROVENANCE             │
                                 │  IBM AML Benchmark (Kaggle) / Synthetic AML Generator   │
                                 └──────────────────────────┬─────────────────────────────┘
                                                            │
                                                            ▼
                                 ┌────────────────────────────────────────────────────────┐
                                 │               TEMPORAL DIRECTED MULTIGRAPH             │
                                 │       NetworkX MultiDiGraph + Polars Flow Metrics      │
                                 │    Nodes: Accounts (Volume, In/Out-Degree, Retention)  │
                                 │    Edges: Directed Transactions (Amt, Timestamp, Bank) │
                                 └─────────┬───────────────────────────────┬──────────────┘
                                           │                               │
                     ┌─────────────────────┴────────────┐                  │
                     ▼                                  ▼                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│             DETECTOR 1               │  │        DETECTOR 2        │  │        DETECTOR 3        │
│       Fan-Out / Fan-In Smurfing      │  │ Cyclic Round-Tripping    │  │ Rapid Pass-Through Mules │
│ • High Out/In-Degree Dispersion      │  │ • Directed simple cycles │  │ • Fast transit latency   │
│ • Structuring (CV < 0.35, near CTR)  │  │ • Monotonic timestamps   │  │ • High balance retention │
│ • Multi-branch aggregation           │  │ • Capital preservation   │  │ • Intermediary conduits  │
└──────────────────┬───────────────────┘  └─────────────┬────────────┘  └────────────┬─────────────┘
                   │                                    │                            │
                   └─────────────────────┬──────────────┴────────────────────────────┘
                                         ▼
                     ┌──────────────────────────────────────────────┐
                     │         COMPOSITE SCORER & AGGREGATOR        │
                     │  • Risk-rank suspicious clusters descending  │
                     │  • Plain-language money-trail generation     │
                     │  • XAI feature drivers & statutory red flags │
                     └───────────────────┬──────────────────────────┘
                                         │
                   ┌─────────────────────┴────────────────────────┐
                   ▼                                              ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────────────────┐
│     3-WAY BENCHMARK HARNESS          │  │         PERSISTENCE & API LAYER (FastAPI)     │
│ 1. Legacy Rule Baseline (> $10k)     │  │ • SQLite `aml_ledger.db` Ledger Storage       │
│ 2. Tabular-Only Machine Learning     │  │ • REST API Endpoints (`/api/v1/analysis`,     │
│ 3. LaunderyLens Hybrid Engine (GDS)  │  │   `/api/v1/benchmark`, `/api/sar/{id}`)       │
│ Precision, Recall, F1 & Confusion    │  └───────────────────────┬───────────────────────┘
└──────────────────────────────────────┘                          │
                                                                  ▼
                                          ┌───────────────────────────────────────────────┐
                                          │      NEXT.JS 16 FORENSIC INVESTIGATOR UI      │
                                          │ • 3-Panel Investigation Workbench             │
                                          │ • React Flow Hardware-Accelerated Graph       │
                                          │ • Plain-Language Forensic Dossier & SAR Export│
                                          │ • Dual-Currency Switcher ($ USD / ₹ INR)      │
                                          └───────────────────────────────────────────────┘
```

---

## 3. Real Labeled Dataset Integration

LaunderyLens integrates with the genuine **IBM Transactions for Anti-Money Laundering (AML)** dataset:
- **Dataset Source**: IBM Research AML Data / Kaggle (`ealtman2019/ibm-transactions-for-anti-money-laundering-aml`).
- **Raw File**: `HI-Large_Trans.csv` (17.0 GB) and cached dense forensic subgraph `data/ibm_subgraph_sample.parquet` (3,000 transactions).
- **Verified Dataset Ground Truth**:
  - Total Evaluated Transactions: `3,000`
  - Total Unique Accounts: `2,577`
  - Ground-Truth Laundering Transactions: `214` (7.13% illicit rate)
  - Ground-Truth Normal Transactions: `2,786`
- **Canonical Schema**:
  ```json
  {
    "transaction_id": "TX_IBM_1032749",
    "source_account": "070_100428858",
    "target_account": "0096670_82838D2B0",
    "amount": 106901.34,
    "timestamp": 1659292260,
    "from_bank": "070",
    "to_bank": "0096670",
    "payment_format": "Cheque",
    "currency": "USD",
    "is_laundering": true
  }
  ```

---

## 4. Detection Typology Algorithms

### Detector 1 — Fan-In & Fan-Out Dispersion (`backend/graph/detectors/smurfing.py`)
- **Fan-Out (Dispersion)**: Identifies accounts dispersing capital across $\ge 3$ distinct recipient accounts within a configurable window (e.g. 30 days). Detects structured transfers where coefficient of variation ($CV = \sigma / \mu < 0.35$) and amounts hover near statutory reporting thresholds ($10,000).
- **Fan-In (Aggregation)**: Identifies collection/consolidation accounts aggregating inflows from $\ge 3$ distinct originating accounts.

### Detector 2 — Cyclic Round-Tripping Loops (`backend/graph/detectors/cycles.py`)
- **Directed Loops**: Detects simple directed cycles of length 2 to 5 nodes ($A \to B \to \dots \to A$, including bilateral wash transfers $A \to B \to A$).
- **Rotational Chronological Consistency**: Validates all rotational permutations of the cyclic path to ensure transactions follow temporal order ($t_1 \le t_2 \le \dots \le t_k$).
- **Capital Preservation**: Requires at least 60% of original outflow to return to the originator.

### Detector 3 — Rapid Pass-Through Mule Chains (`backend/graph/detectors/mules.py`)
- **Relay Chains**: Identifies intermediate conduit accounts where $0 \le t_{out} - t_{in} \le \Delta t_{max}$ (transit latency $\le 14$ days or sub-1-hour rapid transit).
- **Pass-Through Ratio**: Enforces high balance forwarding: $|In - Out| / \max(In, Out) \le 0.30$ (retention ratio $\ge 70\%$).

---

## 5. Quantitative 3-Way Benchmark Results

Evaluated directly against ground-truth labels on the IBM AML dataset:

| Model Architecture | Precision | Recall | F1 Score | False Positive Rate (FPR) | True Positives | False Positives | False Negatives |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Legacy Rule Baseline (> $10k CTR)** | `10.5%` | `57.0%` | `0.177` | `37.3%` | 122 | 1,040 | 92 |
| **2. Tabular-Only Machine Learning (RF)** | `100.0%` | `76.6%` | `0.868` | `0.0%` | 164 | 0 | 50 |
| **3. LaunderyLens Hybrid Engine (GDS + ML)** | **`100.0%`** | **`78.5%`** | **`0.880`** | **`0.0%`** | **168** | **0** | **46** |

### Benchmark Lifts vs. Threshold Baseline:
- **Precision Lift**: **`+852.4%`** (10.5% $\to$ 100.0%)
- **Recall Lift**: **`+37.7%`** (57.0% $\to$ 78.5%)
- **F1 Score Lift**: **`+396.1%`** (0.177 $\to$ 0.880)
- **False Positive Reduction**: **`-100.0%`** (1,040 false alarms eliminated)

---

## 6. Plain-Language Money-Trail Explanations

LaunderyLens produces human-readable, evidence-backed summaries for every suspicious cluster:

- **Cyclic Round-Tripping (`CLU-002`)**:
  > *"Account 024583_8061C1E10 orchestrated a circular laundering loop of $439,085,517 across 5 accounts, recovering 100.0% back to 024583_8061C1E10 within 35,233.0 minutes."*
- **Fan-Out Dispersion (`CLU-001`)**:
  > *"Fan-out capital dispersion detected: Source 070_100428660 structured $735,718,608 into 182 recipient accounts."*
- **Rapid Pass-Through Mule (`CLU-003`)**:
  > *"Rapid pass-through relay detected: 00214_80034B3A0 forwarded $4,598 through mule account 00718_800473D80 to destination 00214_80049EC10 in 4.0 minutes."*

---

## 7. Interactive Investigation Workbench (`/investigations`)

- **Left Panel (Risk-Ranked Cluster Feed)**: Prioritized suspicious clusters with typology tags, dwell times, and volume metrics.
- **Center Panel (Interactive React Flow Canvas)**: Directed multi-graph visualization with custom nodes, animated particle edges, and temporal controls.
- **Right Panel (Forensic Dossier)**: XAI feature drivers (PageRank, Betweenness Centrality, Retention Velocity), statutory red flags, and 1-click FinCEN Form 111 SAR report generation.
- **Deep-Linking**: Direct links via `?typology=cycle`, `smurfing`, `mule` or `?entity=<account_id>`.
- **Live Attack Injection**: Inject simulated live rings during demonstrations with instant canvas highlights.

---

## 8. Installation & Local Execution

### Prerequisites
- Python 3.11+ / 3.12 / 3.13
- Node.js 18+ (Node.js 20+ recommended)
- npm or pnpm

### Quickstart (One-Click)
```bash
python run_system.py
```
This launches:
- **Frontend Workbench**: `http://localhost:3000`
- **FastAPI Engine**: `http://127.0.0.1:8000`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`

### Manual Execution

**Backend Engine:**
```bash
# Windows
.\.venv\Scripts\activate
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# macOS / Linux
source .venv/bin/activate
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

**Frontend Dashboard:**
```bash
cd frontend
npm install
npm run dev
```

---

## 9. Verification & Automated Test Suite

Run the comprehensive unit and integration test suite:

```bash
# Run detector unit tests, baseline evaluation, and API endpoint verification
python -m pytest backend/tests/test_detectors_and_benchmark.py -v

# Run end-to-end full system verification
python backend/tests/test_all_e2e.py

# Run frontend lint and production build
cd frontend
npm run lint
npm run build
```

**Test Coverage Results**:
- `test_temporal_graph_construction`: **PASSED**
- `test_fan_out_detector`: **PASSED**
- `test_cycle_detector`: **PASSED**
- `test_mule_chain_detector`: **PASSED**
- `test_composite_scorer_ranking`: **PASSED**
- `test_benchmark_evaluator_metrics`: **PASSED**
- `test_api_endpoints`: **PASSED**
- All 18 Next.js pages statically prerendered with 0 errors.

---

## 10. Default Evaluator Credentials

- **Email**: `analyst@launderylens.ai`
- **Passphrase**: `LaunderyLens@2026`
- **Role**: Lead AML Forensic Investigator (Level 4 Clearance)
*(Or click "One-Click Instant Lead Investigator Login" on `/login`).*

---

## 11. Known Limitations & Disclosure

1. **Synthetic Demonstration Injection**: While core analysis runs on genuine IBM AML benchmark data, live attack simulation features append deterministic synthetic patterns for demo interactivity.
2. **Graph Visualization Node Capping**: For clusters involving > 100 fan-out accounts, the React Flow canvas visualizes the top 12 highest-risk accounts and 16 representative edges to maintain 60 FPS rendering.
3. **Regulatory Scope**: Generated SAR reports and risk ratings provide actionable investigative intelligence leads pursuant to 31 U.S.C. § 5318(g) and the Prevention of Money Laundering Act (PMLA).
