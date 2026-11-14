import sys
from pathlib import Path

# Add workspace to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.data.generator import SyntheticAMLGenerator
from backend.graph.temporal_graph import TemporalGraph
from backend.graph.detectors.composite_scorer import CompositeScorer
from backend.benchmark.evaluator import BenchmarkEvaluator
from backend.sar.generator import SARGenerator
from backend.main import app

def run_e2e_verification():
    print("=================================================================")
    print(" GRAPHSLEUTH-AML: END-TO-END SYSTEM VERIFICATION")
    print(" PS 2.1 | Layered Money Laundering Network Detection")
    print("=================================================================")

    # 1. Dataset Generation
    gen = SyntheticAMLGenerator(seed=777)
    df = gen.generate_dataset(num_normal_tx=2000, num_smurfing_rings=10, num_cycle_rings=10, num_mule_chains=10)
    summary = gen.get_summary()
    print(f"[1/5] Dataset Generated: {summary.total_transactions} txs across {summary.total_accounts} accounts.")
    assert summary.laundering_transactions > 0

    # 2. Temporal Graph Modeling
    tg = TemporalGraph(df)
    print(f"[2/5] Temporal Graph Constructed: {tg.graph.number_of_nodes()} nodes, {tg.graph.number_of_edges()} edges.")
    assert tg.graph.number_of_nodes() == summary.total_accounts

    # 3. Typology Detection
    scorer = CompositeScorer()
    analysis = scorer.analyze(tg)
    print(f"[3/5] Topology Detection Executed: {analysis.total_alerts} alerts detected.")
    print(f"      - Smurfing Rings: {analysis.alerts_by_typology.get('SMURFING', 0)}")
    print(f"      - Cycle Loops:    {analysis.alerts_by_typology.get('ROUNDTRIP_CYCLE', 0)}")
    print(f"      - Mule Conduits:  {analysis.alerts_by_typology.get('MULE_CHAIN', 0)}")
    assert analysis.total_alerts > 0

    # 4. Baseline vs. GraphSleuth Benchmark
    evaluator = BenchmarkEvaluator(composite_scorer=scorer)
    bm_res = evaluator.run_benchmark(tg)
    print(f"[4/5] Benchmark Harness Evaluated:")
    print(f"      - Baseline Rules Precision: {bm_res.baseline_metrics.precision * 100:.1f}% | Recall: {bm_res.baseline_metrics.recall * 100:.1f}% | F1: {bm_res.baseline_metrics.f1_score:.3f}")
    print(f"      - GraphSleuth Precision:    {bm_res.graph_metrics.precision * 100:.1f}% | Recall: {bm_res.graph_metrics.recall * 100:.1f}% | F1: {bm_res.graph_metrics.f1_score:.3f}")
    print(f"      - Precision Lift:           +{bm_res.precision_lift_percent:.1f}%")
    print(f"      - F1 Lift:                  +{bm_res.f1_lift_percent:.1f}%")
    print(f"      - False Positive Reduction: -{bm_res.false_positive_reduction_percent:.1f}%")
    assert bm_res.graph_metrics.f1_score > bm_res.baseline_metrics.f1_score

    # 5. Explainable SAR Generation
    sar_gen = SARGenerator()
    first_alert = analysis.top_alerts[0]
    sar = sar_gen.generate_sar(first_alert, tg=tg)
    print(f"[5/5] Explainable SAR Generated: {sar.sar_id} | Threat Rating: {sar.threat_level}")
    print(f"      - Chronological Trail Steps: {len(sar.chronological_trail)}")
    print(f"      - Statutory Red Flags:       {len(sar.red_flag_indicators)}")
    assert len(sar.narrative_summary) > 200

    print("=================================================================")
    print(" ALL 5 CORE MODULES PASSED COMPREHENSIVE E2E VERIFICATION (100%)")
    print("=================================================================")

if __name__ == "__main__":
    run_e2e_verification()

