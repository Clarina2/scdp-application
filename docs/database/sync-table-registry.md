# SCDP Database Synchronization Table Registry

Definitive specification and catalog of all source objects in SQL Server BDGSM master database and their replication target definitions in PostgreSQL `scdp_db`.

---

## Group A — Core Operational & Reference Tables (Implemented)

| Source Table | Target Table | Purpose | Key Strategy | Sync Mode | Used by API? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TDEPOT` | `scdp.tdepot` | Storage Depots (Central, Bafoussam, Sud, GP, etc.) | `PRIMARY_KEY` (`CodeDepot`) | FULL + UPSERT | Yes (`/api/v1/stock`) | **ACTIVE** |
| `TPRODUIT` | `scdp.tproduit` | Petroleum Products (Super, Gazole, Pétrole, etc.) | `PRIMARY_KEY` (`CodeProd`) | FULL + UPSERT | Yes (`/api/v1/stock`) | **ACTIVE** |
| `TDISTRIBUTEUR` | `scdp.tdistributeur` | Marketer Distributors & Groups | `PRIMARY_KEY` (`CodeDis`) | FULL + UPSERT | Yes (`/api/v1/stock`) | **ACTIVE** |
| `TSTOCKPHYS` | `scdp.tstockphys` | Physical Daily Stock Inventory Measures | `PRIMARY_KEY` (`IDPCFPSTKPHYSJOUR`) | FULL + UPSERT | Yes (`/api/v1/stock`) | **ACTIVE** |

---

## Group B — Transactional & Movement Tables (Implemented)

| Source Table | Target Table | Purpose | Key Strategy | Sync Mode | Used by API? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TREGUL` | `scdp.tregul` | Stock Adjustment Definitions & Balances | `PRIMARY_KEY` (`CODEREGUL`) | FULL + UPSERT | Yes (`/api/v1/regulations`) | **ACTIVE** |
| `TREGULARISATION` | `scdp.tregularisation` | Stock Adjustment Movement History | `FINGERPRINT` | FULL + FINGERPRINT | Yes (`/api/v1/regulations`) | **ACTIVE** |
| `TPERTE` | `scdp.tperte` | Stock Loss & Evaporation Declarations | `FINGERPRINT` | FULL + FINGERPRINT | Yes (`/api/v1/stock`) | **ACTIVE** |
| `TRECEPTION` | `scdp.treception` | Petroleum Inbound Delivery Receptions | `FINGERPRINT` | FULL + FINGERPRINT | Yes (`/api/v1/receptions`) | **ACTIVE** |
| `TSORTIE` | `scdp.tsortie` | Petroleum Outbound Delivery Borderaux Exits | `FINGERPRINT` | FULL + FINGERPRINT | Yes (`/api/v1/exits`) | **ACTIVE** |
| `TSTSECURITE` | `scdp.tstsecurite` | Security Minimum Stock Thresholds | `FINGERPRINT` | FULL + FINGERPRINT | Yes (`/api/v1/stock`) | **ACTIVE** |
| `TSTKOUTIL` | `scdp.tstkoutil` | Operational Tool Stock Thresholds | `FINGERPRINT` | FULL + FINGERPRINT | Yes (`/api/v1/stock`) | **ACTIVE** |

---

## Group C — Support & Reference Tables (Implemented)

| Source Table | Target Table | Purpose | Key Strategy | Sync Mode | Used by API? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TDESTINATION` | `scdp.tdestination` | Product Delivery Destinations | `PRIMARY_KEY` (`CODEDEST`) | FULL + UPSERT | Yes (`/api/v1/exits`) | **ACTIVE** |
| `TORIGINE` | `scdp.torigine` | Delivery Origin Locations | `PRIMARY_KEY` (`CODEORIG`) | FULL + UPSERT | Yes (`/api/v1/receptions`) | **ACTIVE** |
| `TMODETRANS` | `scdp.tmodetrans` | Transport Modes (Camion, Wagon, Pipeline) | `PRIMARY_KEY` (`CODEMODE`) | FULL + UPSERT | Yes (`/api/v1/receptions`) | **ACTIVE** |
| `TTYPEBOR` | `scdp.ttypebor` | Exit Borderau Document Types | `PRIMARY_KEY` (`CODETYPEBOR`) | FULL + UPSERT | Yes (`/api/v1/exits`) | **ACTIVE** |
| `TTYPEREGUL` | `scdp.ttyperegul` | Regulation Types | `PRIMARY_KEY` (`CODETYPEREGUL`) | FULL + UPSERT | Yes (`/api/v1/regulations`) | **ACTIVE** |
| `TVILLE` | `scdp.tville` | Depot Geographical Cities | `PRIMARY_KEY` (`CODEVILLE`) | FULL + UPSERT | Yes (`/api/v1/stock`) | **ACTIVE** |
| `TWAGON` | `scdp.twagon` | Railway Tank Wagons Capacities | `PRIMARY_KEY` (`CODEWAGON`) | FULL + UPSERT | Yes (`/api/v1/receptions`) | **ACTIVE** |

---

## Group D — Separated / Unreplicated Technical Objects

| Source Table | Target Schema | Key Reason for Separation / Exclusion |
| :--- | :--- | :--- |
| `TUSER` | N/A | Excluded. Managed natively via application authentication `app.users`. |
| `TPROFIL` | N/A | Excluded. Managed natively via application RBAC `app.roles`. |
| `TPRIVILEGE` | N/A | Excluded. Managed natively via application security rules. |
| `TMENU` | N/A | Excluded. Legacy UI menu structure — not required by Python backend. |
| `TOBJECTIF` | N/A | Excluded. Legacy business target table — no active API demand. |
| `TJAUGEAGEJOUR` | N/A | Excluded. Aggregated dynamically from physical stock measures (`scdp.tstockphys`). |
| `TJAUGEAGEMOIS` | N/A | Excluded. Aggregated dynamically from physical stock measures (`scdp.tstockphys`). |
| `TQUEUE_SUIVI_15` | N/A | Excluded. Temporary SQL Server buffer table. |
| `sysdiagrams` | N/A | Excluded. Technical SQL Server diagram storage object. |

---

## Execution Order & Dependency Chain

```
Phase 1: Parent Reference Tables
TVILLE -> TDEPOT -> TPRODUIT -> TDISTRIBUTEUR -> TTYPEREGUL -> TDESTINATION -> TORIGINE -> TMODETRANS -> TTYPEBOR -> TWAGON

Phase 2: Operational & Transactional Tables
TSTOCKPHYS -> TREGUL -> TRECEPTION -> TSORTIE -> TPERTE -> TREGULARISATION -> TSTSECURITE -> TSTKOUTIL
```
