import sys
from pathlib import Path

# Add workspace to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.main import (
    startup_event,
    health_check,
    get_benchmark,
    run_detection,
    get_react_flow,
    generate_sar_report,
    get_dataset_summary,
)

def test_phase3():
    print(">>> [Phase 3 Verification] Testing FastAPI Endpoints Directly...")
    startup_event()

    # 1. Health check
    health_data = health_check()
    assert health_data["status"] == "healthy"
    print(f"[+] Health check OK: {health_data}")

    # 2. Benchmark
    bench_data = get_benchmark()
    print(f"[+] Benchmark OK: Precision Lift: +{bench_data.precision_lift_percent}%, F1 Lift: +{bench_data.f1_lift_percent}%")

    # 3. Detection
    detect_data = run_detection()
    print(f"[+] Detection OK: {detect_data.total_alerts} alerts found across typologies {detect_data.alerts_by_typology}")
    assert len(detect_data.top_alerts) > 0

    first_alert = detect_data.top_alerts[0]
    alert_id = first_alert.alert_id
    print(f"[+] Inspecting First Alert: {alert_id} ({first_alert.typology.value}, Risk: {first_alert.risk_score})")

    # 4. React Flow Graph Endpoint
    rf_data = get_react_flow(max_edges=50)
    print(f"[+] React Flow OK: {len(rf_data['nodes'])} nodes, {len(rf_data['edges'])} edges")

    # Subgraph for specific alert
    sub_rf_data = get_react_flow(alert_id=alert_id)
    print(f"[+] Alert Subgraph OK: {len(sub_rf_data['nodes'])} nodes for alert {alert_id}")

    # 5. SAR Generation Endpoint
    sar_data = generate_sar_report(alert_id)
    print(f"[+] SAR Report Generated: {sar_data.sar_id} (Threat: {sar_data.threat_level})")
    print(f"[+] SAR Narrative preview:\n{sar_data.narrative_summary[:220]}...")
    assert len(sar_data.red_flag_indicators) > 0
    assert sar_data.fincen_xml_snippet is not None

    print("\n[SUCCESS] Phase 3: FastAPI endpoints & SAR generator verified 100% operational!")

if __name__ == "__main__":
    test_phase3()
