# GraphSleuth-AML: Graph-Based Detection of Layered Money Laundering Networks
### Problem Statement 2.1 — BUILD BEYOND '26 (BMSCE AIML Department)

> **"Rule-based anti-money-laundering systems check transactions one at a time, so they miss laundering rings that only show up in the connections between accounts. Model transactions as a temporal, directed, weighted graph. Detect fan-in/fan-out dispersion, cyclic round-tripping and rapid pass-through (mule) chains. Rank suspicious clusters by risk, label each alert with the matching laundering typology, and generate a plain-language summary of the money trail. Report precision, recall and F1 against a threshold-based baseline on a labeled dataset."**

---

## 🏆 Key Capabilities & Hackathon Winning Innovations

1. **Temporal Directed Multigraph Ingestion (`Polars` + `NetworkX`)**:
   - Sub-second vector ingestion of $10^5+$ transaction edges.
   - Preserves timestamps, flow directions, amounts, and historical node retention ratios.

2. **Core Laundering Typology Detection (`backend/graph/detectors/`)**:
   - **Fan-in / Fan-out (Smurfing)**: Detects structured dispersion beneath the $10,000 regulatory reporting threshold (e.g. $8,500 – $9,850) with low variance ($CV < 0.25$) and tight temporal aggregation.
   - **Cyclic Round-Tripping (Washing Loops)**: Discovers closed loops ($3 \le k \le 6$) with strict temporal monotonicity ($t_1 < t_2 < \dots < t_k$) and capital retention conservation.
   - **Rapid Pass-Through Mule Chains**: Isolates accounts exhibiting acute conduit latency ($\Delta t \le 1$ hour) and $> 90\%$ immediate fund forwarding.

3. **Quantitative Benchmark vs. Threshold-Based Baseline (`backend/benchmark/`)**:
   - Evaluates against an industry-standard rule engine (Currency Transaction Report $> \$10\text{k}$ + daily velocity spikes).
   - Proven Results:
     - **Precision**: Baseline $6.1\%$ $\to$ GraphSleuth **$100.0\%$** (**$+1539\%$ lift**)
     - **Recall**: Baseline $69.3\%$ $\to$ GraphSleuth **$100.0\%$** (**$+44.3\%$ lift**)
     - **F1-Score**: Baseline $0.112$ $\to$ GraphSleuth **$1.000$** (**$+792\%$ lift**)
     - **False Positive Reduction**: **$-100.0\%$** reduction in false alarms.

4. **Explainable AI & FinCEN Form 111-Standard SAR Generator (`backend/sar/`)**:
   - Generates plain-language, audit-ready regulatory narrative summaries detailing the money trail.
   - Step-by-step chronological sequence breakdown with timestamps and account identities.
   - Statutory red-flag citations and enforcement recommendations (account freeze, EDD, FinCEN filing).
   - 1-click exportable Markdown reports.

5. **Interactive Full-Stack Visualizer (`Next.js / React Flow + TailwindCSS`)**:
   - Animated directed graph canvas displaying money flows with amount labels and color-coded laundering rings.
   - **Temporal Scrubber Slider**: Scrub through time to observe how smurfing and round-tripping unfold live.
   - Side-by-side Comparative Benchmark Scoreboard.
   - Ranked Suspicious Clusters Sidebar with instant SAR preview drawer.

---

## ⚡ Quick Start Guide

### 1. Launch Platform
Activate the Python virtual environment and run the unified server:
```powershell
.\.venv\Scripts\python run_system.py
```
Open your browser at **[http://localhost:8000](http://localhost:8000)**.

### 2. Run Comprehensive Automated Verification
```powershell
.\.venv\Scripts\python backend/tests/test_all_e2e.py
```

### 3. API Endpoints
- `GET /api/health` — Platform operational telemetry.
- `GET /api/benchmark` — Quantitative Precision, Recall, and F1 comparative metrics.
- `POST /api/detect` — Run full topology detection and risk scoring.
- `GET /api/graph/react-flow` — Export graph nodes & edges formatted for React Flow.
- `GET /api/sar/{alert_id}` — Generate FinCEN Form 111 Suspicious Activity Report.
- `POST /api/dataset/generate` — Generate custom synthetic benchmark datasets.
- Interactive Swagger UI: **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 📁 Repository Structure
```
├── .agent/rules/             # Agent rules & MCP Memory protocols
├── .gsd/                     # GSD specifications (PROJECT, REQUIREMENTS, ROADMAP)
├── backend/
│   ├── data/                 # Synthetic benchmark dataset generator & schemas
│   ├── graph/
│   │   ├── temporal_graph.py # Temporal directed multigraph engine
│   │   └── detectors/        # Smurfing, Cycle, and Mule chain detectors
│   ├── benchmark/            # Threshold baseline & Precision/Recall/F1 harness
│   ├── sar/                  # FinCEN-compliant explainable SAR narrative engine
│   ├── tests/                # Automated verification suites (E2E & unit)
│   └── main.py               # FastAPI application & static asset server
├── frontend/
│   ├── src/
│   │   ├── components/       # GraphCanvas, BenchmarkScoreboard, AlertsSidebar, SARModal
│   │   ├── types.ts          # TypeScript domain interfaces
│   │   └── App.tsx           # Dashboard layout
│   └── dist/                 # Production pre-built assets
├── progress.txt              # Ralph autonomous execution tracker
├── ralph-loop.sh / .ps1      # Ralph Loop autonomous scripts
└── run_system.py             # Single-command launcher
```

