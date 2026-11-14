"""Prepare the IBM HI-Large AML transactions for GraphSleuth-AML.

The raw Kaggle CSV is intentionally kept outside Git. This adapter writes a
normalized Parquet file that matches TemporalGraph's required schema.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import polars as pl

RAW_COLUMNS = [
    "Timestamp",
    "From Bank",
    "Account From",
    "To Bank",
    "Account To",
    "Amount Received",
    "Receiving Currency",
    "Amount Paid",
    "Payment Currency",
    "Payment Format",
    "Is Laundering",
]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Normalize IBM HI-Large AML CSV for GraphSleuth-AML.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/raw/HI-Large_Trans.csv"),
        help="Path to the Kaggle HI-Large transaction CSV.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/processed/ibm_hi_large_graph.parquet"),
        help="Output normalized Parquet path.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=100_000,
        help="Maximum rows to export (default: 100000). Use 0 for all matching rows.",
    )
    parser.add_argument(
        "--currency",
        default="US Dollar",
        help="Keep only transactions with this Payment Currency. Use ALL to retain all currencies.",
    )
    return parser


def normalize(input_path: Path, output_path: Path, limit: int, currency: str) -> pl.DataFrame:
    if not input_path.is_file():
        raise FileNotFoundError(
            f"Could not find {input_path}. Download HI-Large_Trans.csv first."
        )
    if limit < 0:
        raise ValueError("--limit must be zero (all rows) or a positive integer.")

    # new_columns gives the two identically named Account fields unambiguous names.
    lazy = pl.scan_csv(
        input_path,
        has_header=True,
        new_columns=RAW_COLUMNS,
        infer_schema_length=0,
        ignore_errors=False,
    ).with_row_index("row_index")

    timestamp = pl.col("Timestamp").str.to_datetime(strict=False).dt.epoch("s")
    amount = pl.col("Amount Paid").cast(pl.Float64, strict=False)
    laundering = (
        pl.col("Is Laundering")
        .cast(pl.Int8, strict=False)
        .fill_null(0)
        .cast(pl.Boolean)
    )

    normalized = lazy.with_columns(
        [
            timestamp.alias("timestamp"),
            amount.alias("amount"),
            laundering.alias("is_laundering"),
            pl.concat_str(
                [pl.col("From Bank"), pl.col("Account From")],
                separator=":",
                ignore_nulls=False,
            ).alias("source_account"),
            pl.concat_str(
                [pl.col("To Bank"), pl.col("Account To")],
                separator=":",
                ignore_nulls=False,
            ).alias("target_account"),
        ]
    ).filter(
        pl.col("timestamp").is_not_null()
        & pl.col("amount").is_not_null()
        & (pl.col("amount") > 0)
        & pl.col("source_account").is_not_null()
        & pl.col("target_account").is_not_null()
    )

    if currency.upper() != "ALL":
        normalized = normalized.filter(pl.col("Payment Currency") == currency)

    if limit:
        normalized = normalized.limit(limit)

    result = normalized.select(
        [
            pl.concat_str(
                [pl.lit("IBM-HIL-"), pl.col("row_index").cast(pl.String).str.zfill(12)]
            ).alias("transaction_id"),
            pl.col("timestamp").cast(pl.Int64),
            pl.col("source_account"),
            pl.col("target_account"),
            pl.col("amount"),
            pl.col("Payment Currency").alias("currency"),
            pl.col("is_laundering"),
            pl.lit("NORMAL").alias("typology"),
            pl.lit(None, dtype=pl.String).alias("pattern_id"),
        ]
    ).collect(streaming=True)

    if result.is_empty():
        raise ValueError(
            "No valid transactions were produced. Check the CSV headers and --currency value."
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.write_parquet(output_path, compression="zstd")

    positives = result.filter(pl.col("is_laundering")).height
    print(f"Saved: {output_path}")
    print(f"Transactions: {result.height:,}")
    print(f"Accounts: {len(set(result['source_account'].to_list()) | set(result['target_account'].to_list())):,}")
    print(f"Laundering-labelled transactions: {positives:,}")
    print(f"Laundering ratio: {positives / result.height:.4%}")
    print(f"Currency filter: {currency}")
    return result


def main() -> None:
    args = build_parser().parse_args()
    normalize(args.input, args.output, args.limit, args.currency)


if __name__ == "__main__":
    main()
