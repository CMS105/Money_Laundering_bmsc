# LaunderGraph AML
### Graph-based Anti-Money Laundering Detection & Investigation Platform
**BUILD BEYOND '26 · Problem Statement 2.1 · BMSCE AIML Department**

LaunderGraph AML analyses financial transactions as a **temporal, directed, weighted graph** instead of looking at each payment in isolation. It combines graph analytics, rule-based typology detection and machine-learning models to surface suspicious transaction patterns, rank alerts and explain the money trail.

> **Important:** This is a hackathon/research prototype, not a production AML compliance system. Alerts are investigative leads and must be reviewed by qualified people. Benchmark metrics are computed by the current pipeline on the loaded dataset; they are not an independent, held-out evaluation of real-world performance.

---

## What it does
- **Transaction graph analysis** — models accounts as nodes and payments as directed, weighted, time-stamped edges.
- **Laundering typologies** — looks for fan-in/fan-out (smurfing-style dispersion), cyclic round-tripping and rapid pass-through/mule chains.
- **Hybrid ML pipeline** — Isolation Forest anomaly scoring followed by Random Forest classification, with a tabular Random Forest comparison.
- **Graph feature engineering** — uses PageRank, betweenness centrality, degree ratios, fund-retention ratios, transaction amounts, payment formats, time-of-day, cross-bank and currency indicators.
- **Risk-ranked alerts and explanations** — presents suspicious clusters, contributing signals and transaction paths for investigation.
- **Interactive investigation UI** — Next.js dashboard with an interactive React Flow graph, alert panels, cluster details and SAR narrative views.
- **SQLite persistence** — stores transaction, detected-cluster and SAR records in a local SQLite database.
- **Benchmarking** — compares the hybrid pipeline and tabular model with a simple amount-threshold baseline.

## Technology stack
| Area | Technology | How it is used |
|---|---|---|
| Backend | Python 3.12+, FastAPI, Uvicorn | API, ingestion, detection and server |
| Data processing | Polars, NumPy | CSV/Parquet loading and feature arrays |
| Graph analytics | NetworkX | Transaction graph, PageRank and betweenness centrality |
| Machine learning | scikit-learn | Isolation Forest, Random Forest and evaluation metrics |
| Database | SQLite, SQLAlchemy | Local persistence and ORM |
| Schemas | Pydantic | API request/response validation |
| Frontend | Next.js 16, React 19, TypeScript | Web app and typed UI |
| Graph visualization | React Flow (@xyflow/react) | Interactive account/transaction network |
| Styling and icons | Tailwind CSS 4, Lucide React | Dashboard design and icons |
| Hosting | Vercel | Frontend and FastAPI service deployment |

## Machine-learning approach
The implementation is in **backend/ml_pipeline.py** and has three model paths:
1. **Isolation Forest (unsupervised):** learns patterns in engineered transaction/graph features and produces an anomaly score.
2. **Random Forest (supervised):** uses graph-augmented features plus the anomaly score to estimate a laundering probability.
3. **Tabular Random Forest baseline:** trains on a smaller set of transaction-only features for comparison.

Feature engineering combines transaction values with network signals such as source/target PageRank, betweenness centrality, in/out degree ratio and volume-retention ratio. Cross-bank transfers, currency mismatch, payment format and hour of day are also represented.

**Evaluation caveat:** the current fit_and_evaluate() method fits and predicts on the same loaded rows. Displayed precision/recall/F1 values are therefore in-sample demonstration metrics, not held-out test results or proof of production accuracy. Add a train/test split or time-based validation before making performance claims.

**AI clarification:** this repository implements conventional machine learning and graph analytics. It does not currently require or demonstrate an LLM / generative-AI service.

## Dataset: where the data comes from
### IBM AML transaction dataset
The loader is designed for a Kaggle-distributed **IBM Anti-Money Laundering (AML) transaction CSV**. Find a suitable dataset by searching [IBM AML dataset on Kaggle](https://www.kaggle.com/datasets?search=IBM%20AML). The raw dataset is **not included** in this repository; download a version you are permitted to use and place its CSV file in either **data/** or **data/raw/**.

The loader searches for a CSV containing the headers **From Bank**, **To Bank** and **Is Laundering**. The current parser expects the IBM-style fields in this positional order:
| Position | Field |
|---:|---|
| 1 | Timestamp |
| 2 | From Bank |
| 3 | Account (source) |
| 4 | To Bank |
| 5 | Account (target) |
| 6 | Amount Received |
| 7 | Receiving Currency |
| 8 | Amount Paid |
| 9 | Payment Currency |
| 10 | Payment Format |
| 11 | Is Laundering |

The loader prefixes account identifiers with bank codes, samples laundering transactions and nearby connected/background transactions, and can cache the selected sample as **data/ibm_subgraph_sample.parquet**.

### Synthetic fallback
If no matching IBM CSV or usable Parquet cache is found, backend/ibm_loader.py generates a reproducible synthetic dataset using SyntheticAMLGenerator. The active source is returned by **GET /api/health** in the dataset_source field. **Do not describe synthetic fallback records as real IBM/Kaggle records.** Check the health endpoint before a demo and confirm that it reports IBM AML Benchmark.

---

## Run locally (Windows PowerShell)
Use **two separate PowerShell terminals**. Run backend commands from the repository root (the folder containing backend/). Python 3.12+ and Node.js/npm are recommended.

### 1. Clone the repository
```powershell
git clone https://github.com/CMS105/Money_Laundering_bmsc.git
cd Money_Laundering_bmsc
```

### 2. Create and activate a Python virtual environment
```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

If PowerShell blocks activation in the current terminal:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 3. Install backend dependencies
The backend/api/requirements.txt lists API dependencies. The graph/ML engine also needs Polars, NumPy, NetworkX and scikit-learn. Install the complete set:
```powershell
python -m pip install "fastapi>=0.115.0" "uvicorn[standard]>=0.30.0" "pydantic>=2.8.0" "python-dotenv>=1.0.0" "requests>=2.31.0" "sqlalchemy>=2.0.0" polars numpy networkx scikit-learn
```

### 4. Add the dataset (optional)
Copy your downloaded IBM AML CSV into data/ or data/raw/. Create the folder if needed:
```powershell
New-Item -ItemType Directory -Force data
```

If you skip this step, the backend uses the synthetic fallback dataset.

### 5. Start the FastAPI backend
**Important:** start from the repository root, not from inside backend/. The imports use the backend.* package path.
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend URLs:
- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- Health and dataset source: http://127.0.0.1:8000/api/health

Leave this terminal running.

### 6. Start the Next.js frontend
In the **second PowerShell terminal**, from the repository root:
```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

The frontend API client uses same-origin requests by default. If your local setup does not proxy /api requests to FastAPI, configure a Next.js rewrite or set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 in frontend/.env.local, then restart the frontend dev server.

### 7. Stop servers / troubleshoot ports
Press Ctrl+C in each terminal. If port 8000 is already in use on Windows:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID_SHOWN_BY_NETSTAT> /F
```

Replace the placeholder with the actual PID shown by netstat. Do not type the placeholder literally. If port 3000 is occupied, stop the existing Next.js dev server or use another port.

---

## Main API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/health | Service status, dataset source, graph counts and database counts |
| GET | /api/benchmark | Model/baseline comparison metrics |
| POST | /api/detect | Run graph typology detection and risk scoring |
| GET | /api/graph/react-flow | Graph nodes and edges for React Flow |
| GET | /api/sar/{alert_id} | Generate a SAR narrative for a detected alert |
| GET | /api/sars/history | Previously saved SAR reports |
| GET | /api/v1/analysis | Dashboard analysis payload |
| POST | /api/v1/explain/{cluster_id} | Explain a cluster |
| POST | /api/v1/inject | Inject a simulated typology scenario |
| POST | /api/transactions/ingest | Ingest transaction records |

Interactive API documentation: **http://127.0.0.1:8000/docs**.

## Repository structure
```text
Money_Laundering_bmsc/
├── backend/
│   ├── api/                  # FastAPI workbench routes and schemas
│   ├── benchmark/            # Baseline and evaluation helpers
│   ├── data/                 # Synthetic data generator and models
│   ├── graph/
│   │   ├── temporal_graph.py # Temporal transaction graph
│   │   └── detectors/        # Cycle, smurfing, mule and composite scoring
│   ├── sar/                  # SAR narrative generator and models
│   ├── database.py           # SQLAlchemy + SQLite persistence
│   ├── ibm_loader.py         # IBM AML CSV loader and sampler
│   ├── ml_pipeline.py        # Feature engineering and ML models
│   └── main.py               # FastAPI application entry point
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app routes
│   │   ├── components/       # Dashboard, panels and graph UI
│   │   ├── services/         # Frontend API client
│   │   └── types.ts          # TypeScript data contracts
│   └── package.json
├── data/                     # Optional local IBM CSV / Parquet cache
└── vercel.json               # Vercel frontend/API service routing
```

## Deployment
The repository includes a Vercel multi-service configuration:
- **frontend** service runs the Next.js application.
- **api** service runs FastAPI using the backend.main:app entry point.
- Requests under **/api/** are routed to the API service; other paths go to the frontend.

Production URL: https://graphsleuth-aml.vercel.app

### Deployment and data limitations
- The raw Kaggle dataset is not bundled with the repository or automatically copied to Vercel. If it is absent from the deployed runtime, the loader falls back to synthetic data.
- The current SQLite configuration uses temporary /tmp storage on Vercel. Treat it as ephemeral demo storage; use a managed persistent database for durable records.
- Large datasets and long-running model initialization may exceed serverless runtime limits. For production, host the Python API and persistent data store on infrastructure designed for long-running workloads; the frontend can remain on Vercel.

## Responsible use
- A high risk score is a signal for review, not proof of criminal activity.
- Do not use demo/synthetic data as evidence about real people or accounts.
- Confirm dataset provenance, licensing and permitted use before redistribution.
- Validate models with held-out and time-based test data, monitor false positives/negatives, and obtain domain/compliance review before operational use.
- SAR text generated by this prototype is a draft for human review, not a legal filing or regulatory determination.

## License
Add the license and dataset attribution required by the project maintainers and source dataset before redistribution.