# BMSC Hackathon (BUILD BEYOND'26) - Project Specification
## PS 2.1 | Graph-Based Detection of Layered Money Laundering Networks

---

## 1. Vision & Executive Summary
Traditional rule-based Anti-Money Laundering (AML) systems evaluate transactions in isolation against static threshold rules (e.g., Currency Transaction Reports for sums > $10,000), leaving financial institutions blind to sophisticated layered laundering syndicates that operate across distributed temporal networks.

This project delivers **GraphSleuth-AML**: an ultra-fast, temporal-directed-weighted graph analytics and explainable intelligence platform. It mines transaction networks for structural laundering motifs—including **Fan-in/Fan-out dispersion (smurfing)**, **Cyclic round-tripping (washing loops)**, and **Rapid pass-through (mule account chains)**—ranks suspicious rings by composite risk, labels typologies, and generates regulatory-grade, audit-ready Suspicious Activity Reports (SAR) using structured LLM reasoning.

A built-in quantitative benchmarking engine proves clear statistical superiority (Precision, Recall, and F1-score) over conventional threshold-based baselines on a labeled ground-truth dataset.

---

## 2. Core Architecture & Component Diagram

```
[ Transaction Stream / Dataset ]
               │
               ▼
   [ Polars / DuckDB Loader ] (High-throughput temporal normalization & edge indexing)
               │
         ┌─────┴────────────────────────────────┐
         ▼                                      ▼
[ Baseline Engine (Rules) ]         [ Temporal Graph Topology Engine ]
 - Static Threshold (> $10k)          - Fan-in / Fan-out Motif Miner
 - Velocity Spike Rules               - Directed Temporal Cycle Finder (Monotonic t)
                                      - Rapid Pass-Through Mule Chain Tracer
         │                                      │
         └──────────────┬───────────────────────┘
                        ▼
       [ Composite Risk Scoring & Typology Labeler ]
        (Topological centrality, balance deltas, flow velocity)
                        │
                        ▼
       [ Explainable AI & SAR Engine (Instructor) ]
        (FinCEN Form 111-compliant narrative & money trail breakdown)
                        │
                        ▼
       [ Full-Stack UI (Next.js 15 + React Flow) ]
        (Interactive graph visualizer, time scrubber, baseline metric scoreboard)
```

---

## 3. Technology Stack & 24-Hour Implementation Choices
- **Data Engineering**: `Polars` & `DuckDB` — vector-accelerated parquet/CSV ingestion, zero-copy graph extraction.
- **Graph Topology & Analytics**: `Rustworkx` / `NetworkX` + custom vectorized temporal lookahead routines for $\mathcal{O}(V + E)$ cycle and dispersion detection.
- **Backend API**: `FastAPI` (Python 3.11+) with asynchronous routing and strict Pydantic v2 data models.
- **Explainability & LLM**: Pydantic `Instructor` with fallback to local rule-based deterministic narrative templates (ensuring 100% demo uptime even without external API keys).
- **Frontend & Visualization**: `Next.js 15`, `React Flow (@xyflow/react)`, `Tailwind CSS`, and `Lucide React` for animated temporal money flows and interactive cluster inspection.

---

## 4. Key Performance Indicators & Benchmark Targets
- **Precision**: $> 90\%$ on detected laundering rings (significantly suppressing false positives vs. $> 80\%$ false positive rate of baseline rules).
- **Recall**: $> 85\%$ on ground-truth layered patterns (detecting structured amounts under $\$10\text{k}$).
- **F1 Score**: $> 0.88$ (demonstrating massive quantitative lift over baseline threshold $F_1 \approx 0.35$).
- **Inference Latency**: Sub-second topology graph mining over $10^4+$ edges.
- **Regulatory Output**: 1-click exportable FinCEN-compliant Suspicious Activity Report (Markdown / PDF).
