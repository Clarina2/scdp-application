# SCDP Application Audit Report

## Backend Endpoints Audit

### Existing Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/auth/login` | POST | User authentication | ✅ Complete |
| `/auth/me` | GET | Current user profile | ✅ Complete |
| `/auth/password/change` | POST | Change password (requires old) | ✅ Complete |
| `/auth/password/set-initial` | POST | Set initial password via OTP | ✅ Complete |
| `/auth/password/forgot` | POST | Request password reset OTP | ✅ Complete |
| `/auth/password/reset` | POST | Reset password using OTP | ✅ Complete |
| `/auth/otp/send` | POST | Send OTP code | ✅ Complete |
| `/auth/otp/verify` | POST | Verify OTP code | ✅ Complete |
| `/auth/refresh` | POST | Refresh JWT token | ✅ Complete |
| `/auth/logout` | POST | Logout | ✅ Complete |
| `/stock/` | GET | Get stock items with filters | ✅ Complete (has marketer scope) |
| `/stock/metadata/regions` | GET | Get regions | ✅ Complete |
| `/stock/metadata/depots` | GET | Get depots | ✅ Complete |
| `/stock/metadata/products` | GET | Get products | ✅ Complete |
| `/stock/summary` | GET | Get stock summary | ✅ Complete |
| `/receptions/` | GET | Get receptions with filters | ✅ Complete (has marketer scope) |
| `/exits/` | GET | Get exits with filters | ✅ Complete (has marketer scope) |
| `/admin/distributors` | GET | Get distributors list | ⚠️ Has hardcoded fallback |
| `/admin/marketers` | POST | Create marketer | ✅ Complete |
| `/admin/marketers` | GET | List marketers | ✅ Complete |
| `/admin/marketers/{id}/status` | PATCH | Update marketer status | ✅ Complete |
| `/admin/marketers/{id}` | DELETE | Delete marketer | ✅ Complete |
| `/admin/dashboard/summary` | GET | Admin dashboard summary | ✅ Complete |
| `/admin/synchronization/run` | POST | Trigger sync | ✅ Complete |
| `/admin/synchronization/runs` | GET | List sync runs | ✅ Complete |

### Missing Endpoints

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/stock/metadata/cities` | GET | Get cities from TVille | HIGH |
| `/receptions/metadata/origins` | GET | Get origins from TOrigine | HIGH |
| `/exits/metadata/destinations` | GET | Get destinations from TDestination | HIGH |
| `/admin/admins` | POST | Create admin | HIGH |
| `/admin/admins` | GET | List admins | HIGH |
| `/admin/admins/{id}` | PATCH | Update admin | MEDIUM |
| `/admin/admins/{id}` | DELETE | Delete admin | MEDIUM |
| `/user/settings` | GET | Get user settings (threshold) | HIGH |
| `/user/settings` | PUT | Update user settings (threshold) | HIGH |
| `/user/organization` | GET | Get organization info | HIGH |

## Database Tables Audit

### SCDP Tables (Synchronized from BDGSM)

| Table | Purpose | Key Fields | Status |
|-------|---------|-----------|--------|
| TVille | Cities | code_ville, ville_nom | ✅ Exists |
| TDepot | Depots | code_depot, depot_nom, code_ville | ✅ Exists |
| TProduit | Products | code_prod, prod_nom | ✅ Exists |
| TDistributeur | Distributors/Marketers | code_dis, dis_nom | ✅ Exists |
| TStockPhys | Physical stock | code_depot, code_dis, code_prod, stock_ta, stock_15 | ✅ Exists |
| TReception | Receptions/Entries | num_rec, code_depot, code_dis, code_prod, date_rec, qte_rec | ✅ Exists |
| TSortie | Exits | num_bor, code_depot, code_dis, code_prod, date_sortie, qte_sortie | ✅ Exists |
| TPerte | Losses | code_depot, code_prod, date_perte, qte_perte | ✅ Exists |
| TRegularisation | Adjustments | code_regul, code_depot, code_prod, date_regul, qte_regul | ✅ Exists |
| TRegul | Regulation types | code_regul, regul_nom | ✅ Exists |
| TDestination | Destinations | code_dest, dest_nom | ✅ Exists |
| TOrigine | Origins | code_orig, orig_nom | ✅ Exists |
| TModeTrans | Transport modes | code_mode, mode_nom | ✅ Exists |
| TTypeBor | Border types | code_type_bor, type_bor_nom | ✅ Exists |
| TTypeRegul | Regulation types | code_type_regul, type_regul_nom | ✅ Exists |
| TWagon | Wagons | code_wagon, wagon_nom, capa_wagon | ✅ Exists |
| TStSecurite | Security stock | code_depot, code_prod, qte_securite | ✅ Exists |
| TStkOutil | Tool stock | code_depot, code_prod, qte_outil | ✅ Exists |

### Application Tables

| Table | Purpose | Key Fields | Status |
|-------|---------|-----------|--------|
| users | User accounts | id, email, password_hash, role, distributor_code | ✅ Exists |
| distributor_emails | Email to distributor mapping | distributor_code, email | ✅ Exists |
| stock_items | Stock items (app layer) | id, scdp_id, product_code, depot_code, distributor_code | ✅ Exists |
| synchronization_runs | Sync run tracking | id, started_at, completed_at, status | ✅ Exists |
| synchronization_tables | Sync table tracking | id, run_id, table_name, status | ✅ Exists |

### Missing Tables

| Table | Purpose | Priority |
|-------|---------|----------|
| user_settings | User preferences (low-stock threshold) | HIGH |
| user_notifications | User notifications | MEDIUM |

## Frontend Audit

### Static/Mock Data Found

| File | Issue | Location | Impact |
|------|-------|----------|--------|
| tableaubord.jsx | Hardcoded filter options | FILTERS array (lines 148-163) | Cities, depots, products, period not dynamic |
| tableaubord.jsx | Hardcoded "Août 2026" | Filter label (line 156) | Period not dynamic |
| tableaubord.jsx | Hardcoded "Super & Gasoil" | Filter label (line 160) | Product not dynamic |
| tableaubord.jsx | Static KPI cards | KPI_CARDS array (lines 237-242) | Uses real data but could be more dynamic |
| entrées.jsx | Hardcoded filter options | FILTERS array (needs verification) | Depots, origins not dynamic |
| sorties.jsx | Hardcoded filter options | FILTERS array (needs verification) | Depots, destinations not dynamic |
| admin.py | Hardcoded distributor list | DEFAULT_DISTRIBUTORS (lines 53-185) | Fallback but should query DB |

### Frontend Using Real Data

| Component | Data Source | Status |
|-----------|-------------|--------|
| Dashboard regions | stockApi.getRegions() | ✅ Real data |
| Dashboard depots | stockApi.getDepots() | ✅ Real data |
| Dashboard products | stockApi.getProducts() | ✅ Real data |
| Dashboard summary | stockApi.getSummary() | ✅ Real data |
| Dashboard receptions | receptionsApi.getReceptions() | ✅ Real data |
| Dashboard exits | exitsApi.getExits() | ✅ Real data |
| Entrées depots | receptionsApi.getDepots() | ✅ Real data |
| Entrées products | receptionsApi.getProducts() | ✅ Real data |
| Entrées distributors | receptionsApi.getDistributors() | ⚠️ Endpoint missing |
| Sorties depots | exitsApi.getDepots() | ✅ Real data |
| Sorties products | exitsApi.getProducts() | ✅ Real data |
| Sorties distributors | exitsApi.getDistributors() | ⚠️ Endpoint missing |

## Field/API/Database Mapping

### Cities (Villes)

| Frontend Field | Backend Endpoint | Database Table | Database Fields |
|----------------|-----------------|----------------|----------------|
| City name | `/stock/metadata/cities` (missing) | scdp.tville | code_ville, ville_nom |
| City code | `/stock/metadata/cities` (missing) | scdp.tville | code_ville |

### Depots

| Frontend Field | Backend Endpoint | Database Table | Database Fields |
|----------------|-----------------|----------------|----------------|
| Depot name | `/stock/metadata/depots` | app.stock_items (via TDepot) | depot_name |
| Depot code | `/stock/metadata/depots` | app.stock_items (via TDepot) | depot_code |
| Region code | `/stock/metadata/depots` | app.stock_items (via TDepot) | region_code |

### Products

| Frontend Field | Backend Endpoint | Database Table | Database Fields |
|----------------|-----------------|----------------|----------------|
| Product name | `/stock/metadata/products` | app.stock_items (via TProduit) | product_name |
| Product code | `/stock/metadata/products` | app.stock_items (via TProduit) | product_code |
| Unit of measure | `/stock/metadata/products` | app.stock_items (via TProduit) | unit_of_measure |

### Origins (Origines)

| Frontend Field | Backend Endpoint | Database Table | Database Fields |
|----------------|-----------------|----------------|----------------|
| Origin name | `/receptions/metadata/origins` (missing) | scdp.torigine | orig_nom |
| Origin code | `/receptions/metadata/origins` (missing) | scdp.torigine | code_orig |

### Destinations

| Frontend Field | Backend Endpoint | Database Table | Database Fields |
|----------------|-----------------|----------------|----------------|
| Destination name | `/exits/metadata/destinations` (missing) | scdp.tdestination | dest_nom |
| Destination code | `/exits/metadata/destinations` (missing) | scdp.tdestination | code_dest |

### Distributors (Marketers)

| Frontend Field | Backend Endpoint | Database Table | Database Fields |
|----------------|-----------------|----------------|----------------|
| Distributor name | `/admin/distributors` | scdp.tdistributeur | dis_nom |
| Distributor code | `/admin/distributors` | scdp.tdistributeur | code_dis |

### Period

| Frontend Field | Backend Endpoint | Database Table | Database Fields |
|----------------|-----------------|----------------|----------------|
| Current period | N/A (client-side) | N/A | N/A |
| Selected period | Query params | scdp.treception.date_rec, scdp.tsortie.date_sortie | date_rec, date_sortie |

## Issues Identified

### Critical Issues

1. **Frontend has hardcoded filter options** - Cities, depots, products, period are static in FILTERS arrays
2. **Missing cities endpoint** - No endpoint to fetch cities from TVille
3. **Missing origins endpoint** - No endpoint to fetch origins from TOrigine
4. **Missing destinations endpoint** - No endpoint to fetch destinations from TDestination
5. **Missing admin creation endpoint** - Cannot create additional admins
6. **Missing user settings endpoint** - Cannot persist low-stock threshold
7. **Missing user_settings table** - No table to store user preferences
8. **Hardcoded period** - "Août 2026" is static, not dynamic
9. **Admin router has hardcoded distributor list** - Falls back to static list if DB query fails

### Medium Issues

1. **StockService queries StockItem instead of SCDP tables** - May not have all data if sync hasn't run
2. **No organization info endpoint** - Cannot display marketer organization details
3. **No low-stock notification logic** - Threshold exists but no notification system
4. **Frontend filter options not fully dynamic** - Some use real data but filter labels are static

### Low Issues

1. **Period selection UI** - Needs to be implemented (currently static dropdown)
2. **Organization information not read-only** - Needs frontend enforcement
3. **No filter reset functionality** - Needs to be implemented

## Recommendations

### Immediate Actions

1. Create `/stock/metadata/cities` endpoint to query TVille
2. Create `/receptions/metadata/origins` endpoint to query TOrigine  
3. Create `/exits/metadata/destinations` endpoint to query TDestination
4. Create user_settings table for low-stock threshold
5. Create `/user/settings` GET/PUT endpoints
6. Create `/admin/admins` POST endpoint for admin creation
7. Replace hardcoded FILTERS arrays with dynamic data loading
8. Implement dynamic period selection
9. Remove hardcoded distributor list from admin router

### Secondary Actions

1. Implement organization info endpoint
2. Implement low-stock notification logic
3. Add filter reset functionality
4. Make organization fields read-only in frontend
5. Add proper period filtering to backend queries
6. Implement cascading depot-origin filters

### Long-term Actions

1. Consider querying SCDP tables directly instead of StockItem for metadata
2. Add comprehensive error handling for empty results
3. Implement proper date range filtering
4. Add database indexes for performance
5. Implement notification system
