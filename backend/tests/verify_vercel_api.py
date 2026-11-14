import sys
from pathlib import Path

# Add backend/api to sys.path
api_dir = Path(__file__).resolve().parent.parent / "api"
sys.path.insert(0, str(api_dir))

from index import app
from schemas import AnalysisResponse, ExplainResponse, InjectResponse, InjectRequest
from main import get_analysis, explain_cluster, inject_live_attack

def test_api():
    print("[1/4] Testing backend/api/index.py ASGI entrypoint...")
    assert app is not None, "App object is None"
    print(f"[+] App title: {app.title}")

    print("\n[2/4] Verifying registered routes...")
    routes = [r.path for r in app.routes]
    print(f"[+] Total routes registered: {len(routes)}")
    assert "/api/v1/analysis" in routes, "Missing /api/v1/analysis"
    assert "/v1/analysis" in routes, "Missing /v1/analysis"
    assert "/api/v1/inject" in routes, "Missing /api/v1/inject"
    assert "/v1/inject" in routes, "Missing /v1/inject"
    assert "/api/v1/explain/{cluster_id}" in routes, "Missing /api/v1/explain"
    assert "/health" in routes, "Missing /health"
    assert "/api/health" in routes, "Missing /api/health"
    print("[+] All required routes present (both /api/v1 and /v1 prefixes supported).")

    print("\n[3/4] Testing endpoint execution...")
    analysis = get_analysis()
    alerts = analysis["alerts"]
    print(f"[+] get_analysis() returned {len(alerts)} clusters.")
    print(f"[+] Baseline F1: {analysis['metrics']['baseline']['f1']} | Graph Engine F1: {analysis['metrics']['graph_engine']['f1']}")

    first_cluster = alerts[0]
    cluster_id = first_cluster["cluster_id"] if isinstance(first_cluster, dict) else first_cluster.cluster_id
    explanation = explain_cluster(cluster_id)
    print(f"[+] explain_cluster({cluster_id}) generated summary:\n    {explanation.ai_summary[:100]}...")
    assert len(explanation.ai_summary) > 20
    assert len(explanation.key_findings) > 0

    print("\n[4/4] Testing live attack injection...")
    inject_res = inject_live_attack(InjectRequest(typology="CYCLIC_ROUND_TRIPPING"))
    print(f"[+] inject_live_attack() returned: {inject_res.message}")
    assert inject_res.injected_cluster is not None

    print("\n[SUCCESS] Backend API verification passed 100%!")

if __name__ == "__main__":
    test_api()
