"""Run GraphSleuth's existing detectors and benchmark on normalized IBM AML data."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import polars as pl

from backend.benchmark.evaluator import BenchmarkEvaluator
from backend.graph.temporal_graph import TemporalGraph


def main() -> None:
    parser = argparse.ArgumentParser(description="Benchmark GraphSleuth on normalized IBM HI-Large data.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/processed/ibm_hi_large_graph.parquet"),
        help="Normalized Parquet produced by import_ibm_aml.py.",
    )
    args = parser.parse_args()

    if not args.input.is_file():
        raise FileNotFoundError(
            f"{args.input} not found. Run backend.data.import_ibm_aml first."
        )

    df = pl.read_parquet(args.input)
    if df.is_empty():
        raise ValueError("The normalized Parquet file contains no transactions.")

    print(f"Building transaction graph from {df.height:,} transactions...")
    graph = TemporalGraph()
    graph.load_dataframe(df)

    print("Running the existing threshold baseline and graph detectors...")
    result = BenchmarkEvaluator().run_benchmark(graph)
    print(json.dumps(result.model_dump(), indent=2))


if __name__ == "__main__":
    main()
