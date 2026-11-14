import sys
from pathlib import Path

# Add project root and backend/api to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))
api_dir = root_dir / "backend" / "api"
sys.path.insert(0, str(api_dir))

from backend.api.index import app
from backend.api.schemas import (
    AnalysisResponse,
    ExplainResponse,
    InjectResponse,
    InjectRequest,
    IngestRequest,
    IngestTransactionItem,
)
from backend.api.main import (
    get_analysis,
    explain_cluster,
    inject_live_attack,
    get_benchmark,
    get_sar_history,
    ingest_transactions,
)

def test_api():
    print("[1/5] Testing backend/api/index.py ASGI entrypoint...")
    assert app is not None, "App object is None"
    print(f"[+] App title: {app.title}")

    print("\n[2/5] Verifying registered routes...")
    routes = [r.path for r in app.routes]
    print(f"[+] Total routes registered: {len(routes)}")
    assert "/api/v1/analysis" in routes, "Missing /api/v1/analysis"
    assert "/api/benchmark" in routes, "Missing /api/benchmark"
    assert "/api/sars/history" in routes, "Missing /api/sars/history"
    assert "/api/transactions/ingest" in routes, "Missing /api/transactions/ingest"
    assert "/api/v1/inject" in routes, "Missing /api/v1/inject"
    print("[+] All LaunderGraph API routes present.")

    print("\n[3/5] Testing 3-Way Benchmark & Analysis...")
    analysis = get_analysis()
    alerts = analysis.alerts
    print(f"[+] Dataset Source: {analysis.dataset_source}")
    print(f"[+] SQLite Stats: {analysis.sqlite_stats}")
    print(f"[+] 3-Way Benchmark Lifts: {analysis.benchmark_3way.get('lifts')}")
    print(f"[+] get_analysis() returned {len(alerts)} clusters.")

    first_cluster = alerts[0]
    print(f"[+] Top XAI Drivers for {first_cluster.cluster_id}:")
    for d in (first_cluster.xai_feature_drivers or []):
        print(f"    - {d.feature}: {d.weight*100:.0f}% ({d.description})")

    explanation = explain_cluster(first_cluster.cluster_id)
    print(f"[+] explain_cluster({first_cluster.cluster_id}) generated summary:\n    {explanation.ai_summary[:100]}...")

    print("\n[4/5] Testing SQLite Transaction Ingestion & SAR History...")
    ingest_res = ingest_transactions(
        IngestRequest(transactions=[
            IngestTransactionItem(
                from_bank="020",
                source_account="ACC_TEST_SRC",
                to_bank="070",
                target_account="ACC_TEST_TGT",
                amount=15000.0,
                payment_format="Wire",
                is_laundering=True,
            )
        ])
    )
    print(f"[+] Ingestion result: {ingest_res.message}")
    assert ingest_res.inserted_count >= 1

    sar_hist = get_sar_history()
    print(f"[+] SAR Reports in SQLite: {sar_hist['total_sars']}")

    print("\n[5/5] Testing live attack injection...")
    inject_res = inject_live_attack(InjectRequest(typology="CYCLIC_ROUND_TRIPPING"))
    print(f"[+] inject_live_attack() returned: {inject_res.message}")
    assert inject_res.injected_cluster is not None

    print("\n[SUCCESS] LaunderGraph AML API verification passed 100%!")

if __name__ == "__main__":
    test_api()
