# System Requirements Specification: LaunderyLens
## PS 2.1 | Graph-Based Detection of Layered Money Laundering Networks

---

## 1. Functional Requirements

### 1.1 Data Ingestion & Graph Modeling (DATA)
- **DATA-01**: Ingest tabular transaction data (fields: `transaction_id`, `timestamp`, `source_account`, `target_account`, `amount`, `currency`, `optional label`).
- **DATA-02**: Support both ground-truth benchmark datasets (IBM AMLSim format / Elliptic) and an on-demand synthetic generator with controlled injection of laundering topologies.
- **DATA-03**: Model data as a temporal, directed, weighted multigraph $\mathcal{G} = (\mathcal{V}, \mathcal{E}, \mathcal{W}, \mathcal{T})$.

### 1.2 Topology & Typology Detection Engine (ENGINE)
- **ENGINE-01 [Fan-In / Fan-Out (Smurfing)]**:
  - Detect single-source to multi-target dispersion within time window $\Delta t_1$ where each amount $< \text{threshold}$.
  - Detect multi-source to single-target aggregation within time window $\Delta t_2$.
- **ENGINE-02 [Cyclic Round-Tripping (Washing Loops)]**:
  - Find directed cycles $v_1 \to v_2 \to \dots \to v_k \to v_1$ of length $3 \le k \le 6$.
  - Enforce temporal order $t(e_1) < t(e_2) < \dots < t(e_k)$ with total span $\le \Delta T_{\text{loop}}$.
  - Ensure volume preservation accounting for reasonable intermediary friction (retention ratio $\ge 90\%$).
- **ENGINE-03 [Rapid Pass-Through Mule Chains]**:
  - Identify intermediary nodes where $\Delta t_{\text{transit}} = t_{\text{out}} - t_{\text{in}} \le \tau_{\text{mule}}$ (e.g., $< 2$ hours).
  - Enforce flow balance: $|W_{\text{in}} - W_{\text{out}}| / W_{\text{in}} \le \epsilon$.
- **ENGINE-04 [Composite Risk Scoring]**:
  - Assign each cluster a normalized risk score $[0.0, 1.0]$ based on topology density, temporal velocity, transaction volume, and centrality metrics.
  - Rank all suspicious alerts by descending risk score.

### 1.3 Benchmark & Evaluation Harness (BENCHMARK)
- **BENCH-01 [Threshold Baseline Engine]**:
  - Implement standard legacy AML rules: Single transaction amount $> \$10,000$ (CTR), high transaction velocity within 24h, high aggregate volume.
- **BENCH-02 [Comparative Metrics Engine]**:
  - Automatically evaluate and report:
    - **Precision**: $\frac{\text{TP}}{\text{TP} + \text{FP}}$
    - **Recall**: $\frac{\text{TP}}{\text{TP} + \text{FN}}$
    - **F1-Score**: $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$
    - **False Positive Reduction Rate**: Percentage reduction in false alerts vs. baseline.
  - Output full confusion matrix data for display on the frontend.

### 1.4 Explainability & SAR Generation (EXPLAIN)
- **EXPLAIN-01**: Generate a human-readable, regulatory-grade narrative detailing the suspect money trail.
- **EXPLAIN-02**: Output structured metadata adhering to FinCEN Form 111 standards (Subject entities, transaction sequence, total volume, identified typology, recommended remediation).
- **EXPLAIN-03**: Guarantee deterministic fallback generation in the event of missing LLM API credentials.

### 1.5 Interactive Visualization & UX (FE)
- **FE-01**: Interactive node-link graph viewer (React Flow) rendering accounts as nodes and money flows as directed edges with edge thickness mapped to transaction amount.
- **FE-02**: Visual typology tagging (distinct color coding for Smurfing, Round-tripping, Mule accounts).
- **FE-03**: Interactive Temporal Scrubber to step through time increments and visualize money propagation.
- **FE-04**: Side-by-side metric comparison dashboard (Baseline vs. LaunderyLens).
- **FE-05**: 1-Click SAR viewer modal with copy/download capability.

---

## 2. Non-Functional Requirements
- **PERF-01**: Graph extraction and pattern detection over 50,000 edges must complete in $< 3$ seconds.
- **RELIABILITY-01**: All APIs must return validated Pydantic models; zero unhandled 500 errors.
- **TEST-01**: Unit test coverage on all three graph detection algorithms with synthetic fixture graphs.
