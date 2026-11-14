# LaunderGraph AML
### Enterprise Graph Data Science, Temporal Analytics & Law Enforcement Intelligence Platform
**BUILD BEYOND '26 · Problem Statement 2.1 · BMSCE AIML Department**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-12.0-ff0072?style=flat)](https://reactflow.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![NetworkX](https://img.shields.io/badge/Graph-NetworkX-blue?style=flat)](https://networkx.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-orange?style=flat&logo=scikitlearn)](https://scikit-learn.org/)

**LaunderGraph AML** is an ultra-premium, enterprise-grade Anti-Money Laundering (AML) and Financial Crime Intelligence platform designed in the high-craft spatial aesthetic of **Palantir Gotham, Linear, and Chainalysis Reactor**. Instead of analyzing payments in isolation, it models banking transactions as a **temporal, directed, weighted multi-graph**, combining Graph Data Science (GDS), unsupervised anomaly detection, supervised machine learning, explainable AI (XAI), and real-time law enforcement watchlist tracking.

---

## 🌟 Key Capabilities & Architectural Highlights

### 1. 🌐 Temporal Graph Intelligence & Spatial Canvas
- **Account & Counterparty Graphs**: Models banking accounts as multi-layered 3D depth tokens and payments as directed, weighted edges with hop latencies, payment formats, and live particle animations.
- **Topological Layout Engine**: Generous auto-clearance layouts for complex laundering motifs:
  - **Structuring Fan-Out / Fan-In**: Parallel pass-through conduits branching from source and reconverging into a collection exit node.
  - **Cyclic Round-Tripping**: Closed directed loops recycling capital back to originator to obscure beneficial ownership.
  - **High-Velocity Mule Chains**: Serial multi-bank conduits with sub-15 minute transit latencies.
- **Interactive Temporal Scrubber Dock**: Glassmorphic floating playback dock enabling investigators to play, pause, and scrub step-by-step through transaction sequence ticks ($T_1 \dots T_N$).

### 2. 💱 Dual-Currency Engine (USD $ | INR ₹)
- **Interactive Currency Switcher**: One-click toggle in the top architectural command bar to switch between **USD ($)** and **INR (₹)**.
- **Full-System Synchronization**: Instantly formats all numbers across node cards, edge badges, cluster feeds, KPI scoreboard, dossier transaction trails, and suspect case files.

### 3. 👮 Police Suspects Watchlist & Malicious Scam Registry
- **Central Cyber Crime Watchlist**: Real-time law enforcement registry featuring active suspects investigated by **Delhi Police Cyber Cell, CBI, INTERPOL, and the Enforcement Directorate (ED)**.
- **Real-World Scam Typologies Grounded in Data**:
  - **Digital Arrest Extortion**: Forged Skype Supreme Court setups forcing senior citizens into rapid RTGS liquidations.
  - **Pig-Butchering Romance & Crypto Scam**: Social engineering lures funneling victims into rigged decentralized liquidity pools.
  - **Instant Loan App Blackmail**: Predatory micro-loan APK malware extracting contacts for VoIP extortion.
  - **Telegram Task Fraud**: 'Like and Earn' fake job schemes converting UPI inflows into P2P Tether (USDT).
- **Forensic Verification Logic**:
  - **Malicious Inflow Detected**: Displays active scam transactions, FIR case numbers, victim profiles, modus operandi evidence, and a **"Locate on Graph Canvas"** button to isolate the ring immediately.
  - **Clean / Under Inquiry**: Displays an official police clearance certificate when an individual has 0 fraudulent inflows in the active surveillance ledger.

### 4. 🧠 3-Way Quantitative Ablation Benchmark
Side-by-side performance comparison against industry baselines on the **IBM AML Benchmark**:
| Architecture | Precision | Recall | F1 Score | False Positive Rate (FPR) |
| :--- | :---: | :---: | :---: | :---: |
| **1. Legacy Rules Baseline (> $10k)** | `10.5%` | `57.0%` | `0.18` | `37.3%` (High Fatigue) |
| **2. Tabular-Only Machine Learning (RF)** | `100.0%` | `76.6%` | `0.87` | `0.0%` |
| **3. LaunderGraph Hybrid GDS Engine** | **`100.0%`** | **`79.0%`** | **`0.88`** | **`0.0%` (+398% Lift)** |

### 5. 📑 Explainable AI (XAI) & FinCEN Form 111 (SAR) Dossier
- **3D-Elevated Feature Drivers**: Displays quantitative contributions from **PageRank Loop Topology**, **Betweenness Centrality**, **Transit Dwell Velocity**, and **Structuring Symmetry**.
- **Regulatory FinCEN SAR Export**: Generates compliant Suspicious Activity Reports (31 CFR § 1020.320 / FinCEN Form 111) in structured JSON format with chronological transaction trails and recommended investigative actions.

---

## 🛠️ Technology Stack

| Domain | Technology | Implementation Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | TypeScript, React 19, Server & Client Components |
| **Graph Visualization** | **React Flow (`@xyflow/react`)** | Custom Hardware-Accelerated 3D Perspective Nodes & Animated Edges |
| **Styling & Aesthetics** | **Tailwind CSS 4 + Custom PostCSS** | Void palette (`#08090D`), 24px dot matrix, glassmorphic panels, tabular figures |
| **Backend & REST API** | **FastAPI + Uvicorn** | High-performance Python asynchronous server with Pydantic v2 contracts |
| **Graph Analytics (GDS)** | **NetworkX** | Temporal multi-graph, PageRank, Betweenness Centrality, Cycle Detectors |
| **Machine Learning** | **Scikit-Learn** | Isolation Forest (Unsupervised Anomaly) + Random Forest (Supervised Risk) |
| **Persistence Layer** | **SQLite + SQLAlchemy ORM** | `aml_ledger.db` storing raw transactions, detected clusters, and SAR reports |
| **Dataset Processing** | **Polars + NumPy** | High-throughput Kaggle IBM AML transaction CSV ingestion and smart subgraph sampling |

---

## 🚀 One-Click Quickstart (Recommended)

Start both the **FastAPI Graph Engine** and the **Next.js Frontend** simultaneously using the root launcher:

```powershell
python run_system.py
```

This single command starts:
1. **Interactive AML UI (Frontend)**: [http://localhost:3000](http://localhost:3000)
2. **FastAPI Engine & Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

> **Note for Windows Users:** Always open `http://localhost:3000` or `http://127.0.0.1:8000`. Do **NOT** open `http://0.0.0.0:8000` in Windows web browsers, as Windows rejects `0.0.0.0` with `ERR_ADDRESS_INVALID`.

---

## 💻 Manual Setup & Local Development

### 1. Clone the Repository
```powershell
git clone https://github.com/CMS105/Money_Laundering_bmsc.git
cd Money_Laundering_bmsc
```

### 2. Configure Python Virtual Environment
```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/api/requirements.txt
```

### 3. Start Backend Engine
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Start Next.js Frontend
In a second terminal:
```powershell
cd frontend
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📊 Dataset Ingestion & Benchmarking

### Kaggle IBM AML Benchmark CSV
LaunderGraph AML includes an automated ingestion engine for the Kaggle IBM AML dataset with schema:
```text
Timestamp, From Bank, Account, To Bank, Account, Amount Received, Receiving Currency, Amount Paid, Payment Currency, Payment Format, Is Laundering
```
- **Duplicate Account Resolution**: Safely disambiguates duplicate `Account` column headers and namespaces them with bank codes (`{From Bank}_{source_account}` and `{To Bank}_{target_account}`).
- **Smart Subgraph Sampler**: Automatically extracts dense forensic subgraphs containing all positive laundering cases ($Is\ Laundering = 1$), 1-to-2 hop connected accounts, and stratified background volume (~3,000 transactions) for instant rendering.
- **Synthetic Fallback**: If no CSV is present in `data/*.csv`, the system automatically activates a synthetic benchmark generator, labeled transparently in the top header.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analysis` | Retrieves risk-ranked laundering clusters, benchmark metrics, and SQLite stats |
| `POST` | `/api/v1/inject` | Injects live simulated laundering motifs (`CYCLIC_ROUND_TRIPPING`, `FAN_OUT_IN`, `MULE_CHAIN`) |
| `POST` | `/api/v1/explain/{cluster_id}` | Calls Explainable AI engine for plain-language investigative money trail breakdown |
| `GET` | `/api/v1/suspects` | Retrieves police suspects watchlist directory with active threat classifications |
| `GET` | `/api/v1/suspects/{id}/transactions` | Returns recent malicious scamming transactions or verified clearance certificate |
| `POST` | `/api/v1/transactions/ingest` | Batch in daylight transaction data into persistent SQLite ledger |
| `GET` | `/api/health` | System health check, active dataset source indicator, and ledger counts |

Interactive Swagger documentation available at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

---

## 🏛️ Project Structure

```text
Money_Laundering_bmsc/
├── backend/
│   ├── api/
│   │   ├── main.py              # Workbench API routes (Analysis, Inject, Suspects, Explain)
│   │   ├── schemas.py           # Pydantic v2 request/response data contracts
│   │   ├── mock_data.py         # Forensic cluster repository & attack generators
│   │   └── requirements.txt     # Python backend dependencies
│   ├── data/
│   │   ├── police_suspects.json # Law enforcement suspects & scam transactions dataset
│   │   ├── generator.py         # Synthetic AML topology generator
│   │   └── models.py            # Dataset schemas
│   ├── graph/
│   │   ├── temporal_graph.py    # Temporal multi-graph structure (NetworkX)
│   │   └── detectors/           # Composite scoring, Cycle, Smurfing, Mule detectors
│   ├── database.py              # SQLite persistence & SQLAlchemy ORM
│   ├── ibm_loader.py            # IBM AML CSV loader & smart subgraph sampler
│   ├── ml_pipeline.py           # Isolation Forest + Random Forest hybrid pipeline
│   └── main.py                  # Primary FastAPI entrypoint
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css      # Palantir dark theme, 3D spatial card styles, dot matrix
│   │   │   ├── layout.tsx       # Root layout wrapped with CurrencyProvider
│   │   │   └── page.tsx         # Main 3-panel workbench page
│   │   ├── components/
│   │   │   ├── TopKpiBar.tsx    # Command bar, 3-way ablation benchmark, currency switch
│   │   │   ├── CanvasPanel.tsx  # Interactive React Flow graph & Temporal Scrubber dock
│   │   │   ├── ClusterListPanel.tsx # Spatial card cluster feed with risk indicators
│   │   │   ├── DossierPanel.tsx # Forensic intelligence sheet & FinCEN Form 111 export
│   │   │   ├── PoliceSuspectsModal.tsx # Law enforcement suspects & scam transactions modal
│   │   │   ├── SpatialCard.tsx  # Reusable 3D perspective tilt card component
│   │   │   └── canvas/          # AccountNode (3D depth tokens) & TransactionEdge
│   │   ├── context/
│   │   │   └── CurrencyContext.tsx # Global USD ($) and INR (₹) formatting and state
│   │   ├── data/
│   │   │   └── police_suspects.json # Offline fallback law enforcement dataset
│   │   ├── services/api.ts      # REST API client with offline resilience
│   │   └── types/index.ts       # TypeScript interface definitions
│   └── package.json
├── run_system.py                # One-click launcher for frontend + backend
└── vercel.json                  # Multi-service deployment configuration
```

---

## 🔒 Responsible Use & Disclaimer
- **Investigative Support**: LaunderGraph AML is an investigative and research platform. Calculated risk scores and alerts serve as actionable intelligence leads for compliance teams and law enforcement, not automatic proof of criminality.
- **Privacy & Safety**: All names, case IDs, and scenarios in the demonstration suspects database are simulated for forensic research and hackathon evaluation.
- **Regulatory Standards**: SAR reports generated conform to FinCEN Form 111 and 31 CFR § 1020.320 guidelines for preliminary analyst drafting.

---

## 📜 License
Developed for **BUILD BEYOND '26 · Problem Statement 2.1 · BMSCE AIML Department**.
Distributed under the MIT License.
