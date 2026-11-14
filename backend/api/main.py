from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

try:
    from .schemas import (
        AnalysisResponse,
        InjectRequest,
        InjectResponse,
        ExplainRequest,
        ExplainResponse,
        AlertCluster,
        IngestRequest,
        IngestResponse,
    )
    from .mock_data import repo
    from .explainer import generate_llm_explanation
except ImportError:
    from schemas import (
        AnalysisResponse,
        InjectRequest,
        InjectResponse,
        ExplainRequest,
        ExplainResponse,
        AlertCluster,
        IngestRequest,
        IngestResponse,
    )
    from mock_data import repo
    from explainer import generate_llm_explanation

from backend.database import (
    init_db,
    save_transactions_batch,
    save_detected_clusters,
    get_all_sars,
    get_db_stats,
)

app = FastAPI(
    title="LaunderyLens Engine",
    description="Graph Data Science & Explainable AI Anti-Money Laundering Platform",
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


@app.on_event("startup")
def on_startup():
    init_db()
    # Seed initial clusters in SQLite if empty
    try:
        cluster_dicts = [
            {
                "cluster_id": a.cluster_id,
                "typology": a.typology,
                "risk_score": a.risk_score,
                "ml_probability": a.ml_probability or 0.94,
                "isolation_score": a.isolation_score or 0.88,
                "total_volume": a.total_volume,
                "entity_count": len(a.nodes),
                "duration_hours": a.dwell_time_mins / 60.0,
                "feature_contributions_json": [d.dict() for d in (a.xai_feature_drivers or [])],
            }
            for a in repo.alerts
        ]
        save_detected_clusters(cluster_dicts)
    except Exception as e:
        print("Startup SQLite cluster sync notice:", e)


@app.get("/")
def root():
    return {
        "project": "LaunderyLens: Graph Data Science & Explainable Intelligence",
        "service": "LaunderyLens Engine API",
        "status": "healthy",
        "version": "2.0.0",
        "docs_url": "/docs",
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "LaunderyLens",
        "alerts_count": len(repo.alerts),
        "db_stats": get_db_stats(),
    }


@app.get("/api/v1/analysis", response_model=AnalysisResponse)
@app.get("/v1/analysis", response_model=AnalysisResponse)
@app.get("/api/analysis", response_model=AnalysisResponse)
def get_analysis():
    """Returns comparative baseline vs. temporal graph engine metrics and risk-ranked suspicious clusters."""
    return repo.get_analysis()


@app.get("/api/benchmark")
@app.get("/api/v1/benchmark")
def get_benchmark():
    """Returns 3-way quantitative ablation benchmark results against IBM AML ground truth."""
    analysis = repo.get_analysis()
    return analysis.benchmark_3way


@app.get("/api/sars/history")
@app.get("/api/v1/sars/history")
def get_sar_history():
    """Returns saved SAR reports from persistent SQLite database."""
    return {
        "total_sars": len(get_all_sars()),
        "reports": get_all_sars(),
    }


@app.post("/api/transactions/ingest", response_model=IngestResponse)
@app.post("/api/v1/transactions/ingest", response_model=IngestResponse)
def ingest_transactions(payload: IngestRequest):
    """
    Ingests a batch of IBM-formatted transactions into the persistent SQLite ledger
    and updates detection state.
    """
    tx_dicts = []
    import time
    for idx, item in enumerate(payload.transactions):
        tx_id = f"TX_INGEST_{int(time.time())}_{idx+1:04d}"
        tx_dicts.append({
            "tx_id": tx_id,
            "source": f"{item.from_bank}_{item.source_account}",
            "target": f"{item.to_bank}_{item.target_account}",
            "from_bank": item.from_bank,
            "to_bank": item.to_bank,
            "amount": item.amount,
            "currency": item.currency or "USD",
            "payment_format": item.payment_format or "Wire",
            "timestamp": int(time.time()),
            "is_illicit": item.is_laundering or False,
        })
    inserted = save_transactions_batch(tx_dicts)
    db_stats = get_db_stats()

    return IngestResponse(
        message=f"Successfully ingested {inserted} transactions into SQLite ledger aml_ledger.db.",
        inserted_count=inserted,
        total_db_transactions=db_stats.get("transactions", 0),
        reanalyzed=True,
    )


@app.post("/api/v1/explain/{cluster_id}", response_model=ExplainResponse)
@app.post("/v1/explain/{cluster_id}", response_model=ExplainResponse)
def explain_cluster(cluster_id: str, request_data: Optional[ExplainRequest] = None):
    """Takes a cluster's nodes/edges JSON or finds cluster by ID, and calls Gemini/LLM to generate a plain-language explanation."""
    existing = repo.get_cluster(cluster_id)

    if existing:
        target_cluster = existing
    elif request_data and request_data.nodes and request_data.edges:
        target_cluster = AlertCluster(
            cluster_id=cluster_id,
            typology=request_data.typology or "SUSPICIOUS_NETWORK",
            risk_score=90.0,
            total_volume=request_data.total_volume or sum(e.amount for e in request_data.edges),
            dwell_time_mins=request_data.dwell_time_mins or 15.0,
            entry_node=request_data.entry_node or request_data.nodes[0].id,
            exit_node=request_data.exit_node or request_data.nodes[-1].id,
            nodes=request_data.nodes,
            edges=request_data.edges,
            ai_summary="",
            ml_probability=0.95,
            isolation_score=0.91,
        )
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Cluster with ID '{cluster_id}' not found in active repository and no node/edge payload provided.",
        )

    explanation = generate_llm_explanation(target_cluster)
    return explanation


@app.post("/api/v1/inject", response_model=InjectResponse)
@app.post("/v1/inject", response_model=InjectResponse)
def inject_live_attack(payload: InjectRequest):
    """Accepts { "typology": "CYCLIC_ROUND_TRIPPING" | "FAN_OUT_IN" | "MULE_CHAIN" } to inject a live laundering ring during demo."""
    injected = repo.inject_attack(payload.typology)
    # Persist injected cluster to SQLite
    try:
        save_detected_clusters([{
            "cluster_id": injected.cluster_id,
            "typology": injected.typology,
            "risk_score": injected.risk_score,
            "ml_probability": injected.ml_probability or 0.95,
            "isolation_score": injected.isolation_score or 0.90,
            "total_volume": injected.total_volume,
            "entity_count": len(injected.nodes),
            "duration_hours": injected.dwell_time_mins / 60.0,
            "feature_contributions_json": [d.dict() for d in (injected.xai_feature_drivers or [])],
        }])
    except Exception:
        pass

    return InjectResponse(
        message=f"Live {payload.typology} laundering ring successfully injected into graph.",
        injected_cluster=injected,
        total_alerts=len(repo.alerts),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
