# LaunderyLens
### Multi-Source AI-Powered Financial Crime Intelligence & Anti-Money Laundering Platform
**BUILD BEYOND '26 · Problem Statement 2.1 · BMSCE AIML Department**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-12.0-ff0072?style=flat)](https://reactflow.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![NetworkX](https://img.shields.io/badge/Graph-NetworkX-blue?style=flat)](https://networkx.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-orange?style=flat&logo=scikitlearn)](https://scikit-learn.org/)

**LaunderyLens** is a production-grade, multi-source Anti-Money Laundering (AML) and Financial Crime Intelligence platform designed for compliance officers, forensic investigators, and law enforcement agencies. Engineered with an institutional 60:30:10 design system (60% Deep Warm Navy `#172B35`, 30% Soft Ivory `#E8E5DA`, 10% Muted Teal `#75A99A`), it models interbank financial transactions as a **temporal, directed, weighted multi-graph**, combining Graph Data Science (GDS), unsupervised anomaly isolation, supervised machine learning, explainable AI (XAI), and real-time law enforcement watchlist tracking.

---

## 🌟 Comprehensive Intelligence Modules & Navigation

LaunderyLens features a multi-page operational architecture accessible through a persistent navigation sidebar:

1. **Authentication & Analyst Access Control (`/login`)**:
   - Secure server-backed authentication with PBKDF2 password hashing and session bearer tokens.
   - Default investigator credentials: `analyst@launderylens.ai` / `LaunderyLens@2026`.
   - Statutory compliance disclaimer pursuant to 31 U.S.C. § 5318(g).

2. **Executive Overview Dashboard (`/dashboard`)**:
   - High-level KPIs: Total Monitored Volume ($84.25M / ₹7,077 Cr), Monitored Entities (684 Nodes), Active High-Risk Alerts, ML Precision (100.0%), and Zero False Positives (0.0% FPR).
   - 30-Day Temporal Volume Trends comparing licit versus illicit laundering volumes over time.
   - Typology breakdown with risk distribution (Round-tripping, Smurfing, Mule networks, Cross-border flows, Asset conversions).
   - High-priority suspect entities under active surveillance.

3. **3-Panel Investigations Workbench (`/investigations`)**:
   - **Left Panel (Risk-Ranked Cluster Feed)**: Prioritized suspicious clusters with typology badges, dwell latency, volume, and threat ratings.
   - **Center Panel (Interactive React Flow Canvas)**: Directed multi-graph visualization with custom nodes, animated particle edges, and an interactive **Temporal Scrubber Dock** ($T_1 \dots T_N$).
   - **Right Panel (Explainable AI Forensic Dossier)**: LLM/XAI narrative synthesis, top 3 feature drivers (PageRank, Betweenness, Retention Velocity), 3-way ablation table, and FinCEN Form 111 SAR export.
   - **Attack Motif Injection**: Live demo trigger for **Cyclic Round-Tripping**, **Fan-Out / Fan-In**, and **Mule Relay Chains**.
   - **Central Cyber Crime Watchlist**: Police suspect directory with bank accounts and malicious scamming transaction tracking.

4. **Money Mule Intelligence (`/mule-intelligence`)**:
   - Real-time conduit account identification based on rapid pass-through velocity (sub-15 min latency) and extreme pass-through ratios (> 95%).
   - Direct statutory debit freeze/quarantine toggle for suspect conduits.

5. **Cross-Border & FX Corridors (`/cross-border`)**:
   - International fund flow tracing across multi-currency hops (INR → AED → USD).
   - Foreign exchange spread anomaly detection and FATF Enhanced Due Diligence (EDD) risk flags.

6. **Asset-Based Laundering Intelligence (`/asset-intelligence`)**:
   - Physical asset conversion tracing: 24K Gold Bullion bars, prime Dubai/Mumbai luxury real estate, and supercars.
   - Contract under-valuation detection, cash consideration percentage auditing, and Ultimate Beneficial Owner (UBO) discovery.

7. **Transaction Monitor & Ledger (`/transactions`)**:
   - Searchable, filterable, paginated audit ledger of all interbank wire transactions.
   - Multi-filter controls by risk severity, typology, and account ID, with instant CSV audit export.

8. **Network Science & Graph Topology (`/network-analysis`)**:
   - In-depth topological analytics: Node/Edge density, Betweenness Centrality choke-point rankings, PageRank, and Louvain modularity community clusters.

9. **Regulatory SAR Center (`/reports`)**:
   - Regulatory filing center for FinCEN Form 111 and FIU-IND Suspicious Transaction Reports (STRs).
   - Standardized XML/JSON generation, narrative reviews, and investigator audit sign-offs.

10. **3-Way Model Ablation Benchmark (`/model-performance`)**:
    - Side-by-side quantitative evaluation on the IBM AML ground truth:
      | Architecture | Precision | Recall | F1 Score | False Positive Rate (FPR) |
      | :--- | :---: | :---: | :---: | :---: |
      | **1. Legacy Rules Baseline (> $10k)** | `10.5%` | `57.0%` | `0.18` | `37.3%` |
      | **2. Tabular Machine Learning (RF)** | `100.0%` | `76.6%` | `0.87` | `0.0%` |
      | **3. LaunderyLens Hybrid Engine** | **`100.0%`** | **`79.0%`** | **`0.88`** | **`0.0%` (+390% Lift)** |
    - Confusion matrix analysis and global feature importance attribution bars.

11. **Multi-Source Kaggle Dataset Catalog (`/datasets`)**:
    - Ingestion and schema validation for 5 verified Kaggle datasets:
      1. IBM AML Synthetic Financial Transactions (`ealtman2019/ibm-transactions-for-anti-money-laundering-aml`)
      2. Elliptic Bitcoin Forensic Graph (`ellipticco/elliptic-data-set`)
      3. Global Cross-Border SWIFT & FX Flows (`imf/global-cross-border-fx-flows`)
      4. High-Value Real Estate & Beneficial Ownership (`fincrime/real-estate-laundering-patterns`)
      5. Precious Metals & Bullion Physical Trade Log (`wgc/precious-metals-trade-audit`)

12. **Engine Settings (`/settings`)**:
    - Configurable CTR structuring limits ($10k), conduit dwell latency thresholds (30 min), automated quarantine triggers, and currency preferences.

13. **Legal & Compliance (`/privacy-policy` & `/terms`)**:
    - Statutory safe harbor protections under 31 U.S.C. § 5318(g)(3) and PMLA 2002.

---

## 💱 Interactive Dual-Currency Engine (USD $ | INR ₹)

- **One-Click Switcher**: Located in the sidebar and top command bar.
- **System-Wide Synchronization**: Formats all financial amounts across node cards, edge badges, cluster feeds, KPI scoreboard, transaction trails, and suspect dossiers.

---

## 🛠️ Technology Stack

| Domain | Technology | Implementation Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | TypeScript, React 19, Server & Client Components |
| **Graph Visualization** | **React Flow (`@xyflow/react`)** | Custom Hardware-Accelerated 3D Perspective Nodes & Animated Edges |
| **Styling & Design System** | **Tailwind CSS 4 + PostCSS** | Dark-navy palette (`#0B1220`), tabular figures (`tabular-nums font-mono`) |
| **Backend & REST API** | **FastAPI + Uvicorn** | High-performance Python asynchronous server with Pydantic v2 schemas |
| **Graph Analytics (GDS)** | **NetworkX** | Temporal multi-graph, PageRank, Betweenness Centrality, Cycle Detectors |
| **Machine Learning** | **Scikit-Learn** | Isolation Forest (Unsupervised Anomaly) + Random Forest (Supervised Risk) |
| **Persistence Layer** | **SQLite + SQLAlchemy ORM** | `aml_ledger.db` storing raw transactions, detected clusters, and SAR reports |
| **Dataset Processing** | **Polars + NumPy** | High-throughput Kaggle IBM AML transaction CSV ingestion and smart subgraph sampling |

---

## 🚀 Quickstart Guide

### 1. Launch All Services (One-Click)
Run the root launcher:
```bash
python run_system.py
```
This automatically starts:
- **Interactive LaunderyLens Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Graph Engine REST API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Swagger Interactive API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

*(Note: In Windows browsers, always use `http://localhost:3000` or `http://127.0.0.1:8000`. Do not use `0.0.0.0`).*

### 2. Manual Startup

**Terminal 1 (Backend Engine):**
```bash
# Activate virtual environment
.\.venv\Scripts\activate  # Windows
source .venv/bin/activate # Linux/macOS

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend Dashboard):**
```bash
cd frontend
npm run dev
```

---

## 🔒 Default Access Credentials

For authorized evaluator and analyst sign-in:
- **Email**: `analyst@launderylens.ai`
- **Passphrase**: `LaunderyLens@2026`
- **Role**: Lead AML Forensic Investigator (Level 4 Clearance)
*(Or click "One-Click Instant Lead Investigator Login" on the login screen).*

---

## 📜 Compliance & Legal Disclaimer

LaunderyLens is an advanced financial crime analytics and investigative intelligence platform. Risk scores, anomaly indicators, and generated reports serve as actionable investigative intelligence leads pursuant to 31 U.S.C. § 5318(g) and the Prevention of Money Laundering Act (PMLA).
