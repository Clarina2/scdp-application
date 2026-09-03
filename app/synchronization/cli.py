"""
Synchronization CLI Runner
==========================
Command-line interface to execute database synchronization manually.

Usage:
    python -m app.synchronization.cli
    python -m app.synchronization.cli --tables TDEPOT TPRODUIT
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
logger = logging.getLogger("sync-cli")


async def run_cli(tables: list[str] = None):
    print("=" * 60)
    print(" SCDP Database Synchronization Engine (CLI)")
    print("=" * 60)
    print("Initializing database connection and schemas...")
    await init_db()

    async with AsyncSessionLocal() as session:
        sync_service = SynchronizationService(session)
        print("Starting synchronization execution...\n")

        res = await sync_service.run_synchronization(selected_tables=tables)

        print("-" * 60)
        print(f" Run #{res['runId']} Status: {res['status']}")
        print("-" * 60)

        for tbl, stats in res["tables"].items():
            status_symbol = "[OK] SUCCESS" if stats["status"] == "SUCCESS" else "[!] " + stats["status"]
            dots = "." * max(1, 25 - len(tbl))
            print(
                f" {tbl}{dots} {status_symbol} "
                f"(Read: {stats['recordsRead']}, Inserted: {stats['recordsInserted']}, "
                f"Updated: {stats['recordsUpdated']}, Failed: {stats['recordsFailed']})"
            )

        print("-" * 60)
        overall = res["overallStats"]
        print(
            f" Total - Read: {overall['records_read']} | "
            f"Inserted: {overall['records_inserted']} | "
            f"Updated: {overall['records_updated']} | "
            f"Failed: {overall['records_failed']}"
        )
        print("=" * 60)

    await close_db()


def main():
    parser = argparse.ArgumentParser(description="SCDP Database Synchronization Engine CLI")
    parser.add_argument("--tables", nargs="+", help="Specific tables to synchronize (e.g. TDEPOT TPRODUIT)")
    args = parser.parse_args()

    asyncio.run(run_cli(args.tables))


if __name__ == "__main__":
    main()
