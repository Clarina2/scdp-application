"""
Synchronization Engine CLI Runner
==================================
Primary command-line interface module to trigger full or incremental database synchronization.

Usage Examples:
    python -m app.synchronization.run --mode full
    python -m app.synchronization.run --mode incremental
    python -m app.synchronization.run --table TSTOCKPHYS
    python -m app.synchronization.run --tables TDEPOT TPRODUIT TREGUL
"""

import asyncio
import argparse
import logging
import sys

from app.database import AsyncSessionLocal, init_db, close_db
from app.synchronization.service import SynchronizationService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sync-runner")


async def run_cli(mode: str = "full", tables: list[str] = None):
    print("=" * 70)
    print(f" SCDP Database Synchronization Engine (CLI) - Mode: {mode.upper()}")
    print("=" * 70)
    print("Initializing database connections and target schemas...")
    await init_db()

    async with AsyncSessionLocal() as session:
        sync_service = SynchronizationService(session)
        print(f"Starting database synchronization run (Target Tables: {tables or 'ALL REGISTRY'})...\n")

        res = await sync_service.run_synchronization(selected_tables=tables, mode=mode)

        print("-" * 70)
        print(f" Run #{res['runId']} Status: {res['status']}")
        print("-" * 70)

        for tbl, stats in res["tables"].items():
            status_symbol = "[OK] SUCCESS" if stats["status"] == "SUCCESS" else "[!] " + stats["status"]
            dots = "." * max(1, 22 - len(tbl))
            print(
                f" {tbl}{dots} {status_symbol} "
                f"(Read: {stats['recordsRead']}, Inserted: {stats['recordsInserted']}, "
                f"Updated: {stats['recordsUpdated']}, Failed: {stats['recordsFailed']})"
            )

        print("-" * 70)
        overall = res["overallStats"]
        print(
            f" TOTAL SUMMARY - Read: {overall['records_read']} | "
            f"Inserted: {overall['records_inserted']} | "
            f"Updated: {overall['records_updated']} | "
            f"Failed: {overall['records_failed']}"
        )
        print("=" * 70)

    await close_db()


def main():
    parser = argparse.ArgumentParser(description="SCDP Database Synchronization Runner")
    parser.add_argument(
        "--mode",
        choices=["full", "incremental"],
        default="full",
        help="Synchronization mode: 'full' (initial batch load) or 'incremental' (normal operation)",
    )
    parser.add_argument(
        "--table",
        type=str,
        help="Single specific table to synchronize (e.g. TSTOCKPHYS)",
    )
    parser.add_argument(
        "--tables",
        nargs="+",
        help="List of specific tables to synchronize (e.g. TDEPOT TPRODUIT)",
    )
    args = parser.parse_args()

    selected_tables = None
    if args.table:
        selected_tables = [args.table]
    elif args.tables:
        selected_tables = args.tables

    asyncio.run(run_cli(mode=args.mode, tables=selected_tables))


if __name__ == "__main__":
    main()
