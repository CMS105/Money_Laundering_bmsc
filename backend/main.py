import os
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.data.generator import SyntheticAMLGenerator
from backend.data.models import DatasetSummary
from backend.graph.temporal_graph import TemporalGraph
from backend.graph.detectors.composite_scorer import CompositeScorer
from backend.graph.detectors.models import ClusterAnalysisResult, DetectedAlert
from backend.benchmark.evaluator import BenchmarkEvaluator, ComparativeBenchmarkResult
from backend.sar.generator import SARGenerator
from backend.sar.models import SARReport

app = FastAPI(
    title="GraphSleuth-AML Engine",
    description="PS 2.1 Graph-Based Detection of Layered Money Laundering Networks",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory State for Instant Hackathon Performance
class AppState:
    generator: SyntheticAMLGenerator = SyntheticAMLGenerator(seed=42)
    temporal_graph: TemporalGraph = TemporalGraph()
    scorer: CompositeScorer = CompositeScorer()
    evaluator: BenchmarkEvaluator = BenchmarkEvaluator()
    sar_generator: SARGenerator = SARGenerator()
    latest_analysis: Optional[ClusterAnalysisResult] = None
    latest_benchmark: Optional[ComparativeBenchmarkResult] = None

state = AppState()

# Initialize with pre-seeded benchmark dataset on startup
@app.on_event("startup")
def startup_event():
    df = state.generator.generate_dataset(
        num_normal_tx=2000,
        num_smurfing_rings=10,
        num_cycle_rings=10,
        num_mule_chains=10,
    )
    state.temporal_graph.load_dataframe(df)
    state.latest_analysis = state.scorer.analyze(state.temporal_graph)
    state.latest_benchmark = state.evaluator.run_benchmark(state.temporal_graph)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GraphSleuth-AML",
        "version": "1.0.0",
        "total_nodes": state.temporal_graph.graph.number_of_nodes(),
        "total_edges": state.temporal_graph.graph.number_of_edges(),
    }


class GenerateDatasetRequest(BaseModel):
    num_normal_tx: int = 2000
    num_smurfing_rings: int = 10
    num_cycle_rings: int = 10
    num_mule_chains: int = 10
    seed: int = 42


@app.post("/api/dataset/generate", response_model=DatasetSummary)
def generate_dataset(req: GenerateDatasetRequest):
    state.generator = SyntheticAMLGenerator(seed=req.seed)
    df = state.generator.generate_dataset(
        num_normal_tx=req.num_normal_tx,
        num_smurfing_rings=req.num_smurfing_rings,
        num_cycle_rings=req.num_cycle_rings,
        num_mule_chains=req.num_mule_chains,
    )
    state.temporal_graph.load_dataframe(df)
    state.latest_analysis = state.scorer.analyze(state.temporal_graph)
    state.latest_benchmark = state.evaluator.run_benchmark(state.temporal_graph)
    return state.generator.get_summary()


@app.get("/api/dataset/summary", response_model=DatasetSummary)
def get_dataset_summary():
    return state.generator.get_summary()


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


@app.get("/api/benchmark", response_model=ComparativeBenchmarkResult)
def get_benchmark():
    if state.latest_benchmark is None:
        state.latest_benchmark = state.evaluator.run_benchmark(state.temporal_graph)
    return state.latest_benchmark


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

    return state.sar_generator.generate_sar(target_alert, tg=state.temporal_graph)


# =====================================================================
# Next.js Workbench v1 API Routes (Integrated from backend/api/main.py)
# =====================================================================
from backend.api.main import (
    get_analysis as get_v1_analysis,
    explain_cluster as explain_v1_cluster,
    inject_live_attack as inject_v1_attack,
)
from backend.api.schemas import AnalysisResponse, ExplainResponse, InjectResponse

app.add_api_route("/api/v1/analysis", get_v1_analysis, methods=["GET"], response_model=AnalysisResponse)
app.add_api_route("/api/v1/explain/{cluster_id}", explain_v1_cluster, methods=["POST"], response_model=ExplainResponse)
app.add_api_route("/api/v1/inject", inject_v1_attack, methods=["POST"], response_model=InjectResponse)



# Mount built frontend dist for unified production deployment
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

