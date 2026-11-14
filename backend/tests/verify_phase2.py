import sys
from pathlib import Path

# Add workspace to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.data.generator import SyntheticAMLGenerator
from backend.graph.temporal_graph import TemporalGraph
from backend.graph.detectors.composite_scorer import CompositeScorer
from backend.benchmark.evaluator import BenchmarkEvaluator


def test_phase2():
    print(">>> [Phase 2 Verification] Generating Benchmark Dataset...")
    generator = SyntheticAMLGenerator(seed=42)
    df = generator.generate_dataset(
        num_normal_tx=2000,
        num_smurfing_rings=12,
        num_cycle_rings=12,
        num_mule_chains=12,
    )
    tg = TemporalGraph(df)
    print(f"[+] Loaded {tg.graph.number_of_nodes()} accounts and {tg.graph.number_of_edges()} transactions.")

    print("\n>>> [Phase 2 Verification] Running Graph Typology Detectors...")
    scorer = CompositeScorer()
    results = scorer.analyze(tg)
    print(f"[+] Total Detected Alerts: {results.total_alerts}")
    print(f"[+] Alerts by Typology: {results.alerts_by_typology}")
    print(f"[+] High-risk accounts tagged: {len(results.high_risk_accounts)}")

    assert results.total_alerts > 0, "No alerts detected by graph engine!"
    assert "SMURFING" in results.alerts_by_typology, "No smurfing detected"
    assert "ROUNDTRIP_CYCLE" in results.alerts_by_typology, "No cycles detected"
    assert "MULE_CHAIN" in results.alerts_by_typology, "No mule chains detected"

    print("\n>>> [Phase 2 Verification] Running Comparative Benchmark Harness...")
    evaluator = BenchmarkEvaluator(composite_scorer=scorer)
    benchmark = evaluator.run_benchmark(tg)

    print("\n=================================================================")
    print(" BENCHMARK REPORT: BASELINE vs. GRAPHSLEUTH")
    print("=================================================================")
    bm = benchmark.baseline_metrics
    gm = benchmark.graph_metrics
    print(f"Total Transactions: {benchmark.total_transactions} | Actual Laundering: {benchmark.actual_laundering_transactions}")
    print(f"--- [Baseline Rules]   Precision: {bm.precision:.4f} | Recall: {bm.recall:.4f} | F1: {bm.f1_score:.4f} | FP: {bm.false_positives}")
    print(f"--- [GraphSleuth-AML]  Precision: {gm.precision:.4f} | Recall: {gm.recall:.4f} | F1: {gm.f1_score:.4f} | FP: {gm.false_positives}")
    print("-----------------------------------------------------------------")
    print(f"[+] Precision Lift: +{benchmark.precision_lift_percent:.1f}%")
    print(f"[+] F1 Lift: +{benchmark.f1_lift_percent:.1f}%")
    print(f"[+] False Positive Reduction: -{benchmark.false_positive_reduction_percent:.1f}%")
    print("=================================================================")

    assert gm.precision > bm.precision, "Graph precision should exceed baseline"
    assert gm.f1_score > bm.f1_score, "Graph F1 should exceed baseline"
    assert benchmark.false_positive_reduction_percent > 50.0, "FP reduction should be substantial"

    print("\n[SUCCESS] Phase 2: Topology detectors & Benchmark Evaluator verified 100% operational!")


if __name__ == "__main__":
    test_phase2()

