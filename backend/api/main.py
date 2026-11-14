from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from .schemas import (
    AnalysisResponse,
    InjectRequest,
    InjectResponse,
    ExplainRequest,
    ExplainResponse,
    AlertCluster,
)
from .mock_data import repo
from .explainer import generate_llm_explanation

app = FastAPI(
    title="Build Beyond '26 — PS 2.1 Graph Laundering Detection API",
    description="Backend API for Temporal Graph Engine AML Detection & Explainable AI Narrative Generation",
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


@app.get("/")
def root():
    return {
        "project": "BUILD BEYOND'26 — PS 2.1: Graph-Based Detection of Layered Money Laundering Networks",
        "service": "AML Graph Engine & Explainable AI API",
        "status": "healthy",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "alerts_count": len(repo.alerts)}


@app.get("/api/v1/analysis", response_model=AnalysisResponse)
def get_analysis():
    """Returns comparative baseline vs. temporal graph engine metrics and risk-ranked suspicious clusters."""
    return repo.get_analysis()


@app.post("/api/v1/explain/{cluster_id}", response_model=ExplainResponse)
def explain_cluster(cluster_id: str, request_data: Optional[ExplainRequest] = None):
    """Takes a cluster's nodes/edges JSON or finds cluster by ID, and calls Gemini/LLM to generate a plain-language explanation."""
    # First check if cluster exists in repository
    existing = repo.get_cluster(cluster_id)

    if existing:
        target_cluster = existing
    elif request_data and request_data.nodes and request_data.edges:
        # Construct AlertCluster from request payload
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
        )
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Cluster with ID '{cluster_id}' not found in active repository and no node/edge payload provided.",
        )

    explanation = generate_llm_explanation(target_cluster)
    return explanation


@app.post("/api/v1/inject", response_model=InjectResponse)
def inject_live_attack(payload: InjectRequest):
    """Accepts { "typology": "CYCLIC_ROUND_TRIPPING" | "FAN_OUT_IN" | "MULE_CHAIN" } to inject a live laundering ring during demo."""
    injected = repo.inject_attack(payload.typology)
    return InjectResponse(
        message=f"Live {payload.typology} laundering ring successfully injected into graph.",
        injected_cluster=injected,
        total_alerts=len(repo.alerts),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
