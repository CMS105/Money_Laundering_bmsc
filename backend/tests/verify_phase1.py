import sys
from pathlib import Path

# Add workspace to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.data.generator import SyntheticAMLGenerator
from backend.graph.temporal_graph import TemporalGraph

def test_phase1():
    print(">>> [Phase 1 Verification] Generating Synthetic Benchmark Dataset...")
    generator = SyntheticAMLGenerator(seed=123)
    df = generator.generate_dataset(
        num_normal_tx=1500,
        num_smurfing_rings=10,
        num_cycle_rings=10,
        num_mule_chains=10,
    )
    summary = generator.get_summary()
    print(f"[+] Total transactions: {summary.total_transactions}")
    print(f"[+] Total accounts: {summary.total_accounts}")
    print(f"[+] Laundering transactions: {summary.laundering_transactions} ({summary.laundering_ratio * 100:.2f}%)")
    print(f"[+] Rings: Smurfing={summary.smurfing_rings}, Cycles={summary.cycle_rings}, Mules={summary.mule_chains}")

    assert summary.total_transactions > 1500, "Dataset too small"
    assert summary.laundering_transactions > 0, "No laundering transactions injected"
    assert summary.smurfing_rings == 10, "Smurfing count mismatch"
    assert summary.cycle_rings == 10, "Cycle count mismatch"
    assert summary.mule_chains == 10, "Mule chain count mismatch"

    print("\n>>> [Phase 1 Verification] Ingesting into TemporalGraph...")
    graph = TemporalGraph(df)
    assert graph.graph.number_of_nodes() == summary.total_accounts, "Node count mismatch in graph"
    assert graph.graph.number_of_edges() == summary.total_transactions, "Edge count mismatch in graph"

    # Test React Flow Export
    rf = graph.to_react_flow_json(max_edges=50)
    print(f"[+] React Flow export generated: {len(rf['nodes'])} nodes, {len(rf['edges'])} edges")
    assert len(rf["nodes"]) > 0
    assert len(rf["edges"]) > 0

    print("\n[SUCCESS] Phase 1: Synthetic Generator & TemporalGraph verified 100% operational!")

if __name__ == "__main__":
    test_phase1()

