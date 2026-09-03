

import React, { useState, useEffect, useCallback } from "react";
import { receptionsApi } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import ExportPreviewModal from "../components/ExportPreviewModal";

/**
 * ENTRÉES — Marketer Dashboard
 * Displays real reception records from scdp.treception filtered by:
 *   - Authenticated marketer scope (enforced by backend via distributor_code)
 *   - Depot (optional)
 *   - Product (optional)
 *   - Period: month + year (converted to start_date / end_date)
 *
 * NO mock data. All rows come exclusively from the PostgreSQL scdp_db via FastAPI.
 */

const theme = `
  :root {
    --background: #F7FAF7;
    --foreground: #173225;
    --primary: #2F7D32;
    --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA;
    --secondary-foreground: #173225;
    --tertiary: #6AA84F;
    --tertiary-foreground: #323131;
    --muted: #F0F5F0;
    --muted-foreground: #657467;
    --accent: #DDEFD9;
    --accent-foreground: #173225;
    --card: #FFFFFF;
    --card-foreground: #173225;
    --destructive: #C63D3D;
    --destructive-foreground: #FFFFFF;
    --border: #E2EDE3;
    --input: #E2EDE3;
    --ring: #2F7D32;
    --radius: 1rem;
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --font-sans: Inter, system-ui, sans-serif;
    --font-heading: Inter, system-ui, sans-serif;
    --font-mono: "JetBrains Mono", monospace;
    --shadow-color: rgba(47, 125, 50, 0.08);

    --primary-text: #256A28;
    --secondary-text: #707971;
    --tertiary-text: #48852B;
    --accent-text: #6B7B68;
    --destructive-text: #C63D3D;
  }

  .gpl-dashboard {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
  }

  .gpl-dashboard h1,
  .gpl-dashboard h2,
  .gpl-dashboard h3 {
    font-family: var(--font-heading);
  }

  .bg-background { background-color: var(--background); }
  .bg-card { background-color: var(--card); color: var(--card-foreground); }
  .bg-primary { background-color: var(--primary); color: var(--primary-foreground); }
  .bg-secondary { background-color: var(--secondary); color: var(--secondary-foreground); }
  .bg-muted { background-color: var(--muted); }
  .bg-destructive { background-color: var(--destructive); color: var(--destructive-foreground); }

  .text-foreground { color: var(--foreground); }
  .text-primary { color: var(--primary-text); }
  .text-primary-foreground { color: var(--primary-foreground); }
  .text-secondary { color: var(--secondary-text); }
  .text-muted-foreground { color: var(--muted-foreground); }
  .text-destructive { color: var(--destructive-text); }

  .border-border { border-color: var(--border); }
  .border-input { border-color: var(--input); }
  .rounded-xl { border-radius: var(--radius-lg); }
  .rounded-lg { border-radius: var(--radius-md); }
  .rounded-2xl { border-radius: 1.25rem; }

  .shadow-soft {
    box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04);
  }

  .shadow-soft-hover {
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .shadow-soft-hover:hover {
    box-shadow: 0 8px 28px -6px var(--shadow-color), 0 4px 12px -2px rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }

  .brand-gradient {
    background-image: linear-gradient(135deg, var(--primary), #4CAF50);
  }

  .table-row {
    transition: background-color 0.15s ease;
  }
  .table-row:hover {
    background-color: var(--muted);
  }

  .filter-select {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .filter-select:hover {
    border-color: var(--primary);
    background-color: var(--secondary);
  }
  .filter-select:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(47, 125, 50, 0.25);
  }

  .export-btn {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .export-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 6px 16px -4px rgba(47, 125, 50, 0.35);
  }

  .reset-btn {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .reset-btn:hover {
    background-color: var(--secondary);
    border-color: var(--primary);
    color: var(--primary-text);
  }

  .retry-btn {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .retry-btn:hover {
    background-color: var(--secondary);
  }

  .pagination-btn {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .pagination-btn:hover:not(:disabled) {
    background-color: var(--secondary);
    border-color: var(--primary);
  }
  .pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  { value: "", label: "Tous les mois" },
  { value: 1,  label: "Janvier" },
  { value: 2,  label: "Février" },
  { value: 3,  label: "Mars" },
  { value: 4,  label: "Avril" },
  { value: 5,  label: "Mai" },
  { value: 6,  label: "Juin" },
  { value: 7,  label: "Juillet" },
  { value: 8,  label: "Août" },
  { value: 9,  label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

/** Returns the year options: current year ± 5 */
function getYearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current - 5; y <= current + 1; y++) years.push(y);
  return years;
}

/** Given month (1-12) and year, return ISO start/end date strings. */
function getMonthDateRange(month, year) {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0); // last day of month
  return {
    start: start.toISOString().split("T")[0],
    end:   end.toISOString().split("T")[0],
  };
}

/** Format ISO date string as DD/MM/YYYY. Returns "—" if null/invalid. */
function formatDate(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", {
      day:   "2-digit",
      month: "2-digit",
      year:  "numeric",
    });
  } catch {
    return "—";
  }
}

/** Format ISO datetime string as HH:mm. Returns "—" if null. */
function formatTime(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

/** Format a numeric quantity with fr-FR locale. Returns "—" if null/undefined. */
function formatQty(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("fr-FR");
}

/** Display a string value or "—" if null/empty. */
function display(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EntreesGPL() {
  const { user } = useAuth();

  // ── Filter state ────────────────────────────────────────────────────────────
  const now = new Date();
  const [selectedDepotCode, setSelectedDepotCode] = useState("");      // "" = all
  const [selectedProductCode, setSelectedProductCode] = useState("");  // "" = all
  const [selectedMonth, setSelectedMonth] = useState(""); // "" = Tous les mois
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd,   setCustomEnd]   = useState("");

  // ── Metadata (depots + products from DB) ────────────────────────────────────
  const [depots,   setDepots]   = useState([]);
  const [products, setProducts] = useState([]);
  const [metaError, setMetaError] = useState(null);

  // ── Receptions data ─────────────────────────────────────────────────────────
  const [receptions, setReceptions] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const LIMIT = 10;

  // ── UI states ───────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // ── Export ──────────────────────────────────────────────────────────────────
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData,      setPreviewData]      = useState(null);
  const [previewLoading,   setPreviewLoading]   = useState(false);

  // ── Load metadata once on mount ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      try {
        const [depotsData, productsData] = await Promise.all([
          receptionsApi.getDepots(),
          receptionsApi.getProducts(),
        ]);
        if (!cancelled) {
          setDepots(depotsData   || []);
          setProducts(productsData || []);
        }
      } catch (err) {
        if (!cancelled) setMetaError("Impossible de charger les filtres.");
      }
    }
    loadMeta();
    return () => { cancelled = true; };
  }, []);

  // ── Build date range from current period selection ───────────────────────────
  const getEffectiveDateRange = useCallback(() => {
    if (useCustomRange) {
      if (customStart && customEnd) return { start: customStart, end: customEnd };
      return null;
    }
    if (!selectedMonth) return null;
    return getMonthDateRange(Number(selectedMonth), selectedYear);
  }, [useCustomRange, customStart, customEnd, selectedMonth, selectedYear]);

  // ── Build filter params for the API ─────────────────────────────────────────
  const buildParams = useCallback((pageNum = 1) => {
    const params = { page: pageNum, limit: LIMIT };
    if (selectedDepotCode)   params.depot_code   = selectedDepotCode;
    if (selectedProductCode) params.product_code = selectedProductCode;
    const range = getEffectiveDateRange();
    if (range) {
      params.start_date = range.start;
      params.end_date   = range.end;
    }
    return params;
  }, [selectedDepotCode, selectedProductCode, getEffectiveDateRange]);

  // ── Load receptions ──────────────────────────────────────────────────────────
  const loadReceptions = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams(pageNum);
      const data = await receptionsApi.getReceptions(params);
      setReceptions(data.items || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError("Impossible de charger les entrées.");
      setReceptions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Re-load whenever any filter changes (reset to page 1)
  useEffect(() => {
    setPage(1);
    loadReceptions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepotCode, selectedProductCode, selectedMonth, selectedYear, useCustomRange, customStart, customEnd]);

  // Re-load when page changes (not caused by filter change)
  useEffect(() => {
    loadReceptions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Reset filters ────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedDepotCode("");
    setSelectedProductCode("");
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
    setUseCustomRange(false);
    setCustomStart("");
    setCustomEnd("");
    setPage(1);
  };

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      const params = {};
      if (selectedDepotCode)   params.depot_code   = selectedDepotCode;
      if (selectedProductCode) params.product_code = selectedProductCode;
      const range = getEffectiveDateRange();
      if (range) {
        params.start_date = range.start;
        params.end_date   = range.end;
      }
      const data = await receptionsApi.previewExport(params);
      setPreviewData(data);
    } catch {
      alert("Erreur lors de la préparation de l'aperçu");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmExport = async () => {
    try {
      const params = {};
      if (selectedDepotCode)   params.depot_code   = selectedDepotCode;
      if (selectedProductCode) params.product_code = selectedProductCode;
      const range = getEffectiveDateRange();
      if (range) {
        params.start_date = range.start;
        params.end_date   = range.end;
      }
      await receptionsApi.exportCsv(params);
      setShowPreviewModal(false);
    } catch {
      alert("Erreur lors de l'export");
    }
  };

  // ── Derived UI values ─────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(total / LIMIT));
  const selectedDepotName   = depots.find(d => d.code === selectedDepotCode)?.name   || "Tous les dépôts";
  const selectedProductName = products.find(p => p.code === selectedProductCode)?.name || "Tous les produits";
  const periodLabel = useCustomRange
    ? (customStart && customEnd ? `${customStart} → ${customEnd}` : "Plage personnalisée")
    : `${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;

  const yearOptions = getYearOptions();

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
      <style>{theme}</style>

      <div className="flex flex-1">
        <main className="flex-1 p-6 md:p-8 lg:p-10">

          {/* ── Header ── */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary tracking-wide">
                Mouvements entrants
              </p>
              <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">
                Entrées
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
                Réceptions enregistrées dans la base PostgreSQL scdp_db pour votre compte marketer.
              </p>
            </div>

            <button
              className="export-btn flex min-h-11 items-center gap-2.5 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft"
              onClick={handleExport}
            >
              ↓ Exporter
            </button>
          </header>

          {/* ── Filter Panel ── */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-foreground">Filtres</h2>
              <button
                className="reset-btn text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-background text-muted-foreground"
                onClick={handleReset}
              >
                ↺ Réinitialiser les filtres
              </button>
            </div>

            {/* Filter row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {/* Depot */}
              <div className="relative flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Dépôt</label>
                <select
                  className="filter-select min-h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-8 text-sm text-foreground"
                  value={selectedDepotCode}
                  onChange={e => { setSelectedDepotCode(e.target.value); setPage(1); }}
                >
                  <option value="">Tous les dépôts</option>
                  {depots.map(d => (
                    <option key={d.code} value={d.code}>{d.name || d.code}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 bottom-2.5 text-muted-foreground text-xs">▾</span>
              </div>

              {/* Product */}
              <div className="relative flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Produit</label>
                <select
                  className="filter-select min-h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-8 text-sm text-foreground"
                  value={selectedProductCode}
                  onChange={e => { setSelectedProductCode(e.target.value); setPage(1); }}
                >
                  <option value="">Tous les produits</option>
                  {products.map(p => (
                    <option key={p.code} value={p.code}>{p.name || p.code}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 bottom-2.5 text-muted-foreground text-xs">▾</span>
              </div>

              {/* Month */}
              <div className="relative flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Mois</label>
                <select
                  className="filter-select min-h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-8 text-sm text-foreground"
                  value={useCustomRange ? "" : selectedMonth}
                  onChange={e => {
                    setUseCustomRange(false);
                    setSelectedMonth(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                  <option value="" disabled={!useCustomRange}>Plage personnalisée</option>
                </select>
                <span className="pointer-events-none absolute right-3 bottom-2.5 text-muted-foreground text-xs">▾</span>
              </div>

              {/* Year */}
              <div className="relative flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Année</label>
                <select
                  className="filter-select min-h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-8 text-sm text-foreground"
                  value={selectedYear}
                  onChange={e => {
                    setUseCustomRange(false);
                    setSelectedYear(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 bottom-2.5 text-muted-foreground text-xs">▾</span>
              </div>
            </div>

            {/* Custom range toggle */}
            <div className="mt-3 flex items-center gap-2">
              <button
                className="text-xs text-primary underline"
                onClick={() => { setUseCustomRange(v => !v); setPage(1); }}
              >
                {useCustomRange ? "← Revenir à mois/année" : "Utiliser une plage de dates personnalisée"}
              </button>
            </div>

            {/* Custom date inputs */}
            {useCustomRange && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Date de début</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={e => { setCustomStart(e.target.value); setPage(1); }}
                    className="min-h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Date de fin</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={e => { setCustomEnd(e.target.value); setPage(1); }}
                    className="min-h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Active filter summary */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                📅 {periodLabel}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                🏭 {selectedDepotName}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                ⛽ {selectedProductName}
              </span>
              {total > 0 && !loading && (
                <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-foreground">
                  {total} résultat{total > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Metadata error */}
            {metaError && (
              <p className="mt-3 text-xs text-destructive">{metaError}</p>
            )}
          </section>

          {/* ── ENTRÉES Table ── */}
          <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="p-6 pb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-heading font-semibold tracking-tight">
                  Historique des entrées
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Réceptions validées — {periodLabel} — {selectedDepotName} — {selectedProductName}
                </p>
              </div>
              {!loading && total > 0 && (
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} / {total}
                </p>
              )}
            </div>

            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm" style={{ minWidth: "1200px" }}>
                <thead className="bg-muted/70 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-4 py-3">N° Bordereau</th>
                    <th className="px-4 py-3">Dépôt</th>
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3">Mode transfert</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Qté TA</th>
                    <th className="px-4 py-3 text-right">Qté 15</th>
                    <th className="px-4 py-3">N° Matricule</th>
                  </tr>
                </thead>
                <tbody>

                  {/* Loading state */}
                  {loading && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl animate-pulse">⏳</span>
                          <span className="text-sm">Chargement des entrées…</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Error state */}
                  {!loading && error && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-2xl">⚠️</span>
                          <p className="text-sm text-destructive font-medium">{error}</p>
                          <button
                            className="retry-btn text-sm px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                            onClick={() => loadReceptions(page)}
                          >
                            Réessayer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Empty state — no data */}
                  {!loading && !error && receptions.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">📭</span>
                          <p className="text-sm text-muted-foreground font-medium">
                            Aucune donnée disponible pour les critères sélectionnés.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Essayez de modifier la période, le dépôt ou le produit.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Data rows */}
                  {!loading && !error && receptions.map((r, idx) => (
                    <tr
                      key={r.id ?? `row-${idx}`}
                      className="table-row border-t border-border"
                    >
                      {/* 1. Numéro de bordereau */}
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {display(r.numBor)}
                      </td>

                      {/* 2. Dépôt — full name from DB join */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium">{display(r.depotName)}</span>
                          {r.depotCode && r.depotName !== r.depotCode && (
                            <span className="text-xs text-muted-foreground">{r.depotCode}</span>
                          )}
                        </div>
                      </td>

                      {/* 3. Produit — full name from DB join */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium">{display(r.productName)}</span>
                          {r.productCode && r.productName !== r.productCode && (
                            <span className="text-xs text-muted-foreground">{r.productCode}</span>
                          )}
                        </div>
                      </td>

                      {/* 4. Mode de transfert */}
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">
                        {display(r.modeTransfert)}
                      </td>

                      {/* 5. Date (date_rec — ENTRÉE/reception date) */}
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {formatDate(r.date)}
                      </td>

                      {/* 6. Quantité TA (qte_rec — received quantity) */}
                      <td className="px-4 py-3.5 text-right font-semibold text-primary">
                        {formatQty(r.qteTA)}
                      </td>

                      {/* 7. Quantité 15 */}
                      <td className="px-4 py-3.5 text-right text-muted-foreground text-xs">
                        {display(r.qte15)}
                      </td>

                      {/* 8. Numéro de matricule */}
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">
                        {display(r.numMatricule)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && !error && total > LIMIT && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Page {page} sur {totalPages} · {total} entrée{total > 1 ? "s" : ""} au total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="pagination-btn text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    ← Précédent
                  </button>
                  <button
                    className="pagination-btn text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>

      <ExportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handleConfirmExport}
        previewData={previewData}
        loading={previewLoading}
        documentType="Bordereau de Réception de Stock"
      />
    </div>
  );
}