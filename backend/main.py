import os
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.ibm_loader import IBMAMLDataLoader
from backend.data.generator import SyntheticAMLGenerator
from backend.data.models import DatasetSummary
from backend.graph.temporal_graph import TemporalGraph
from backend.graph.detectors.composite_scorer import CompositeScorer
from backend.graph.detectors.models import ClusterAnalysisResult, DetectedAlert
from backend.benchmark.evaluator import BenchmarkEvaluator, ComparativeBenchmarkResult
from backend.ml_pipeline import LaunderyLensHybridEngine
from backend.sar.generator import SARGenerator
from backend.sar.models import SARReport
from backend.database import init_db, save_transactions_batch, get_all_sars, get_db_stats

app = FastAPI(
    title="LaunderyLens Engine",
    description="Graph Data Science, Temporal Analytics & Explainable AI Anti-Money Laundering Platform",
    version="2.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AppState:
    ibm_loader: IBMAMLDataLoader = IBMAMLDataLoader()
    temporal_graph: TemporalGraph = TemporalGraph()
    scorer: CompositeScorer = CompositeScorer()
    evaluator: BenchmarkEvaluator = BenchmarkEvaluator()
    ml_engine: LaunderyLensHybridEngine = LaunderyLensHybridEngine()
    sar_generator: SARGenerator = SARGenerator()
    dataset_source: str = "Dataset: IBM AML Benchmark"
    latest_analysis: Optional[ClusterAnalysisResult] = None
    latest_benchmark: Optional[Dict[str, Any]] = None


state = AppState()


@app.on_event("startup")
def startup_event():
    init_db()
    # 1. Ingest IBM AML Dataset (or fallback to synthetic)
    df, badge, meta = state.ibm_loader.load_dataset()
    state.dataset_source = f"Dataset: {badge}"
    state.temporal_graph.load_dataframe(df)

    # 2. Run graph detection and hybrid ML benchmark
    state.latest_analysis = state.scorer.analyze(state.temporal_graph)
    state.latest_benchmark = state.ml_engine.fit_and_evaluate(df)

    # 3. Persist transactions to SQLite aml_ledger.db
    try:
        tx_rows = df.to_dicts()
        save_transactions_batch(tx_rows)
    except Exception as e:
        print("SQLite transaction seeding note:", e)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LaunderyLens",
        "version": "2.0.0",
        "dataset_source": state.dataset_source,
        "total_nodes": state.temporal_graph.graph.number_of_nodes(),
        "total_edges": state.temporal_graph.graph.number_of_edges(),
        "db_stats": get_db_stats(),
    }


@app.get("/api/benchmark")
def get_benchmark():
    if state.latest_benchmark is None:
        state.latest_benchmark = state.ml_engine.fit_and_evaluate(state.temporal_graph.df)
    return state.latest_benchmark


@app.get("/api/sars/history")
def get_sar_history():
    return {
        "total_sars": len(get_all_sars()),
        "reports": get_all_sars(),
    }


@app.get("/api/graph/react-flow")
def get_react_flow(
    max_edges: int = 250,
    alert_id: Optional[str] = None,
):
    actual_max = max_edges if isinstance(max_edges, int) else 250
    subgraph_nodes = None
    if alert_id and state.latest_analysis:
        for alert in state.latest_analysis.top_alerts:
            if alert.alert_id == alert_id:
                subgraph_nodes = set(alert.involved_accounts)
                break
    return state.temporal_graph.to_react_flow_json(subgraph_nodes=subgraph_nodes, max_edges=actual_max)


@app.post("/api/detect", response_model=ClusterAnalysisResult)
def run_detection():
    state.latest_analysis = state.scorer.analyze(state.temporal_graph)
    return state.latest_analysis


@app.get("/api/sar/{alert_id}", response_model=SARReport)
def generate_sar_report(alert_id: str):
    if state.latest_analysis is None:
        state.latest_analysis = state.scorer.analyze(state.temporal_graph)

    target_alert: Optional[DetectedAlert] = None
    for alert in state.latest_analysis.top_alerts:
        if alert.alert_id == alert_id:
            target_alert = alert
            break

    if target_alert is None:
        raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found")

    xai_drivers = state.ml_engine.get_cluster_xai_drivers(
        typology=target_alert.typology.value,
        risk_score=target_alert.risk_score,
        dwell_mins=target_alert.time_span_seconds / 60.0,
        volume=target_alert.total_volume,
    )

    return state.sar_generator.generate_sar(
        target_alert,
        tg=state.temporal_graph,
        xai_drivers=xai_drivers,
    )


# =====================================================================
# Next.js Workbench API Routes (Integrated from backend/api/main.py)
# =====================================================================
from backend.api.main import (
    get_analysis as get_v1_analysis,
    explain_cluster as explain_v1_cluster,
    inject_live_attack as inject_v1_attack,
    ingest_transactions as ingest_v1_transactions,
    get_police_suspects as get_v1_police_suspects,
    get_suspect_transactions as get_v1_suspect_transactions,
)
from backend.api.schemas import (
    AnalysisResponse,
    ExplainResponse,
    InjectResponse,
    IngestRequest,
    IngestResponse,
    SuspectsResponse,
)

app.add_api_route("/api/v1/analysis", get_v1_analysis, methods=["GET"], response_model=AnalysisResponse)
app.add_api_route("/api/v1/explain/{cluster_id}", explain_v1_cluster, methods=["POST"], response_model=ExplainResponse)
app.add_api_route("/api/v1/inject", inject_v1_attack, methods=["POST"], response_model=InjectResponse)
app.add_api_route("/api/transactions/ingest", ingest_v1_transactions, methods=["POST"], response_model=IngestResponse)
app.add_api_route("/api/v1/transactions/ingest", ingest_v1_transactions, methods=["POST"], response_model=IngestResponse)
app.add_api_route("/api/v1/suspects", get_v1_police_suspects, methods=["GET"], response_model=SuspectsResponse)
app.add_api_route("/api/v1/suspects/{suspect_id}/transactions", get_v1_suspect_transactions, methods=["GET"])


# Mount built frontend dist if present
dist_path = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if dist_path.exists():
    assets_dir = dist_path / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target_file = dist_path / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(dist_path / "index.html"))
