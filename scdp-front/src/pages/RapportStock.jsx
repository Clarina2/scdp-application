import React, { useState, useEffect, useCallback } from "react";
import { stockGestionnaireApi } from "../api/client";

const theme = `
  :root {
    --background: #F7FAF7;
    --foreground: #173225;
    --primary: #2F7D32;
    --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA;
    --secondary-foreground: #173225;
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
    --shadow-color: rgba(47, 125, 50, 0.08);
    --primary-text: #256A28;
    --secondary-text: #707971;
    --destructive-text: #C63D3D;
  }

  .gpl-dashboard {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
  }
  .gpl-dashboard h1, .gpl-dashboard h2, .gpl-dashboard h3 {
    font-family: var(--font-heading);
  }

  .bg-background { background-color: var(--background); }
  .bg-card       { background-color: var(--card); color: var(--card-foreground); }
  .bg-primary    { background-color: var(--primary); color: var(--primary-foreground); }
  .bg-secondary  { background-color: var(--secondary); color: var(--secondary-foreground); }
  .bg-muted      { background-color: var(--muted); }
  .bg-accent     { background-color: var(--accent); color: var(--accent-foreground); }
  .bg-destructive{ background-color: var(--destructive); color: var(--destructive-foreground); }

  .text-foreground        { color: var(--foreground); }
  .text-primary           { color: var(--primary-text); }
  .text-primary-foreground{ color: var(--primary-foreground); }
  .text-secondary         { color: var(--secondary-text); }
  .text-muted-foreground  { color: var(--muted-foreground); }
  .text-card-foreground   { color: var(--card-foreground); }
  .text-destructive       { color: var(--destructive-text); }

  .border-border { border-color: var(--border); }
  .border-input  { border-color: var(--input); }
  .rounded-xl    { border-radius: var(--radius-lg); }
  .rounded-lg    { border-radius: var(--radius-md); }
  .rounded-2xl   { border-radius: 1.25rem; }

  .shadow-soft {
    box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04);
  }

  .table-row { transition: background-color 0.15s ease; }
  .table-row:hover { background-color: var(--muted); }

  .form-input {
    width: 100%;
    min-height: 2.625rem;
    padding: 0 0.875rem;
    border: 1px solid var(--input);
    border-radius: var(--radius-md);
    background: var(--background);
    font-size: 0.875rem;
    color: var(--foreground);
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .form-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(47, 125, 50, 0.12);
  }

  .btn-action {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.15s ease;
  }
  .btn-action:hover {
    transform: translateY(-1px);
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(23, 50, 37, 0.45);
    backdrop-filter: blur(4px);
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .modal-content {
    background: var(--card);
    border-radius: 1.25rem;
    box-shadow: 0 24px 60px -12px rgba(23, 50, 37, 0.25);
    width: 100%;
    max-width: 960px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

function formatDisplayDate(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "—";
    const datePart = d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} ${timePart}`;
  } catch {
    return "—";
  }
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Ko";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}

export default function RapportStock() {
  const [reports, setReports] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepot, setSelectedDepot] = useState("");

  // Preview modal state
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const LIMIT = 10;

  // ── Load Available Depots ──────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    async function fetchDepots() {
      try {
        const data = await stockGestionnaireApi.getDepots();
        if (active) {
          setDepots(data || []);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des dépôts:", err);
      }
    }
    fetchDepots();
    return () => {
      active = false;
    };
  }, []);

  // ── Load Stock Reports ──────────────────────────────────────────────────────
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = { page, limit: LIMIT };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedDepot) params.depot_code = selectedDepot;

      const response = await stockGestionnaireApi.getDocuments(params);
      const items = response.items || [];
      const totalCount = response.total !== undefined ? response.total : (response.meta?.total || 0);
      const totalP = response.totalPages !== undefined ? response.totalPages : (response.meta?.total_pages || Math.ceil(totalCount / LIMIT) || 1);

      setReports(items);
      setTotal(totalCount);
      setTotalPages(totalP);
    } catch (err) {
      console.error("Erreur lors du chargement des rapports:", err);
      setError(err.message || "Impossible de charger les rapports de stock. Veuillez réessayer.");
      setReports([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, selectedDepot]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ── Reset Filters ───────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedDepot("");
    setPage(1);
  };

  // ── Preview PDF ─────────────────────────────────────────────────────────────
  const handleOpenPreview = async (report) => {
    try {
      setPreviewLoading(true);
      setPreviewDocument(report);
      setError("");

      // Revoke previous blob if any
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }

      const blobUrl = await stockGestionnaireApi.fetchDocumentBlobUrl(report.id);
      setPreviewBlobUrl(blobUrl);
    } catch (err) {
      console.error("Erreur de prévisualisation:", err);
      setError(err.message || "Impossible de prévisualiser le document PDF.");
      setPreviewDocument(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewDocument(null);
  };

  // ── Download PDF ────────────────────────────────────────────────────────────
  const handleDownload = async (report) => {
    try {
      setDownloadingId(report.id);
      setError("");
      await stockGestionnaireApi.downloadDocument(report.id, report.fileName || "rapport_stock.pdf");
    } catch (err) {
      console.error("Erreur de téléchargement:", err);
      setError(err.message || "Impossible de télécharger le document PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const hasActiveFilters = Boolean(startDate || endDate || selectedDepot);

  return (
    <div className="gpl-dashboard min-h-screen w-full">
      <style>{theme}</style>

      <main className="p-6 md:p-8 lg:p-10 space-y-6 max-w-[1600px] mx-auto">
        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <span>Espace Marketer</span>
              <span>/</span>
              <span>Rapports de stock</span>
            </div>
            <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
              Rapports de stock
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultez, prévisualisez et téléchargez les rapports de stock PDF transmis par les gestionnaires de stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 border border-border">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span className="text-sm font-semibold text-primary">
                {total} rapport{total > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        {/* ── Error Banner ───────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center justify-between rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadReports}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── Filters Section ─────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              {/* Date début */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Date début
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Date fin */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Date fin
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Dépôt concerné */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Dépôt concerné
                </label>
                <select
                  className="form-input"
                  value={selectedDepot}
                  onChange={(e) => {
                    setSelectedDepot(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tous les dépôts</option>
                  {depots.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="btn-action bg-muted text-muted-foreground hover:bg-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed border border-border"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Réinitialiser
              </button>
            </div>
          </div>
        </section>

        {/* ── Table Section ──────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Dépôt concerné</th>
                  <th className="px-6 py-4">PDF</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <p className="font-medium">Chargement des rapports de stock...</p>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                          </svg>
                        </div>
                        <p className="font-medium text-foreground text-base">
                          {hasActiveFilters
                            ? "Aucun rapport ne correspond aux filtres sélectionnés."
                            : "Aucun rapport de stock disponible."}
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Effacer les filtres
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="table-row">
                      {/* Date */}
                      <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{formatDisplayDate(report.uploadedAt)}</span>
                        </div>
                      </td>

                      {/* Dépôt concerné */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                            {report.depotCode}
                          </span>
                          <span className="font-medium text-foreground">
                            {report.depotName || report.depotCode}
                          </span>
                        </div>
                      </td>

                      {/* PDF */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate max-w-md" title={report.fileName}>
                              {report.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(report.fileSize)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Aperçu (Preview) */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(report)}
                            className="btn-action bg-secondary text-primary hover:bg-primary hover:text-primary-foreground border border-border"
                            title="Aperçu du rapport"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Aperçu
                          </button>

                          {/* Télécharger (Download) */}
                          <button
                            type="button"
                            onClick={() => handleDownload(report)}
                            disabled={downloadingId === report.id}
                            className="btn-action bg-muted text-foreground hover:bg-secondary hover:text-primary disabled:opacity-50 border border-border"
                            title="Télécharger le fichier PDF"
                          >
                            {downloadingId === report.id ? (
                              <>
                                <span className="size-3 animate-spin rounded-full border border-primary border-t-transparent"></span>
                                Téléchargement...
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Télécharger
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ───────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Affichage de la page <span className="font-semibold text-foreground">{page}</span> sur{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> ({total} rapport{total > 1 ? "s" : ""} au total)
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="btn-action bg-card text-foreground hover:bg-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed border border-border"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="btn-action bg-card text-foreground hover:bg-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed border border-border"
                >
                  Suivant
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── Preview Modal ────────────────────────────────────────────────────── */}
      {(previewDocument || previewLoading) && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-5 bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading font-bold text-base text-foreground truncate max-w-xl">
                    {previewDocument?.fileName || "Aperçu du document PDF"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Dépôt: {previewDocument?.depotName || previewDocument?.depotCode} • Transmis le {formatDisplayDate(previewDocument?.uploadedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewDocument && (
                  <button
                    type="button"
                    onClick={() => handleDownload(previewDocument)}
                    className="btn-action bg-secondary text-primary hover:bg-primary hover:text-primary-foreground border border-border"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Télécharger
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-muted/30 p-4 overflow-hidden min-h-[60vh] max-h-[75vh]">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-muted-foreground">
                  <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="text-sm font-medium">Chargement sécurisé du PDF...</p>
                </div>
              ) : previewBlobUrl ? (
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-full rounded-xl border border-border bg-white shadow-inner min-h-[60vh]"
                  title="Aperçu du document PDF"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-20 text-muted-foreground">
                  <p className="text-sm">Impossible de charger l'aperçu du document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
