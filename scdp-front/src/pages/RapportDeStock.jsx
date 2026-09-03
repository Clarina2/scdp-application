import React, { useState, useEffect, useCallback } from "react";
import { stockGestionnaireApi } from "../api/client";

const theme = `
  :root {
    --background: #F7FAF7; --foreground: #173225; --primary: #2F7D32; --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA; --muted: #F0F5F0; --muted-foreground: #657467; --card: #FFFFFF;
    --border: #E2EDE3; --input: #E2EDE3; --radius: 1rem; --destructive: #C63D3D;
    --font-sans: Inter, system-ui, sans-serif; --shadow-color: rgba(47,125,50,0.08); --primary-text: #256A28;
  }
  .gpl-dashboard { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
  .bg-card { background-color: var(--card); } .bg-secondary { background-color: var(--secondary); }
  .bg-muted { background-color: var(--muted); }
  .text-primary { color: var(--primary-text); } .text-muted-foreground { color: var(--muted-foreground); }
  .text-destructive { color: var(--destructive); }
  .border-border { border-color: var(--border); } .border-input { border-color: var(--input); }
  .rounded-2xl { border-radius: 1.25rem; } .rounded-xl { border-radius: var(--radius); }
  .shadow-soft { box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04); }
  .form-input {
    min-height: 2.5rem; padding: 0 0.75rem;
    border: 1px solid var(--input); border-radius: var(--radius);
    background: var(--background); font-size: 0.875rem; color: var(--foreground);
    outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(47,125,50,0.15); }
  .table-row { transition: background-color 0.15s ease; }
  .table-row:hover { background-color: var(--muted); }
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(23,50,37,0.45);
    backdrop-filter: blur(4px); z-index: 100;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal-content {
    background: var(--card); border-radius: 1.25rem;
    box-shadow: 0 20px 50px -12px rgba(47,125,50,0.2);
    width: 95vw; max-width: 900px; height: 85vh;
    display: flex; flex-direction: column; overflow: hidden;
  }
`;

function formatDateTime(isoStr) {
  if (!isoStr) return "\u2014";
  try {
    const d = new Date(isoStr);
    const date = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  } catch { return "\u2014"; }
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export default function RapportDeStock() {
  const [reports, setReports] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, has_next_page: false, has_previous_page: false });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [depotCode, setDepotCode] = useState("");

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [downloadingId, setDownloadingId] = useState("");

  const loadReports = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: p, limit: 10 };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (depotCode) params.depot_code = depotCode;
      const res = await stockGestionnaireApi.getDocuments(params);
      setReports(res.items || []);
      setMeta(res.meta || { total: 0, total_pages: 1 });
      setPage(p);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des rapports.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, depotCode]);

  const loadDepots = useCallback(async () => {
    try {
      const res = await stockGestionnaireApi.getDocuments({ page: 1, limit: 100 });
      const seen = {};
      (res.items || []).forEach(r => {
        if (r.depotCode && !seen[r.depotCode]) seen[r.depotCode] = r.depotName || r.depotCode;
      });
      setDepots(Object.entries(seen).map(([code, name]) => ({ code, name })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadDepots();
    loadReports(1);
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadReports(1);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setDepotCode("");
    setTimeout(() => loadReports(1), 0);
  };

  const handlePreview = async (doc) => {
    setPreviewDoc(doc);
    setPreviewBlobUrl("");
    setPreviewError("");
    setPreviewLoading(true);
    try {
      const blob = await stockGestionnaireApi.getDocumentBlob(doc.id);
      setPreviewBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      setPreviewError(err.message || "Impossible de charger le document.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewDoc(null);
    setPreviewBlobUrl("");
    setPreviewError("");
  };

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      await stockGestionnaireApi.downloadDocument(doc.id, doc.fileName);
    } catch (err) {
      alert(err.message || "Erreur lors du t\u00e9l\u00e9chargement.");
    } finally {
      setDownloadingId("");
    }
  };

  const hasFilters = startDate || endDate || depotCode;

  return (
    <div className="gpl-dashboard min-h-screen w-full">
      <style>{theme}</style>
      <main className="flex-1 p-6 md:p-8 lg:p-10">

        {/* Header */}
        <header className="mb-8">
          <p className="text-sm font-medium text-primary tracking-wide">Marketer</p>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight">Rapport de stock</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Consultez les rapports de stock transmis par le gestionnaire de stock.
          </p>
        </header>

        {/* Filters */}
        <form onSubmit={handleApplyFilters} className="mb-6 bg-card border border-border rounded-2xl shadow-soft p-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date d\u00e9but</label>
              <input type="date" className="form-input" value={startDate}
                onChange={e => setStartDate(e.target.value)} max={endDate || undefined} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date fin</label>
              <input type="date" className="form-input" value={endDate}
                onChange={e => setEndDate(e.target.value)} min={startDate || undefined} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">D\u00e9p\u00f4t</label>
              <select className="form-input" value={depotCode} onChange={e => setDepotCode(e.target.value)}
                style={{ minWidth: "180px" }}>
                <option value="">Tous les d\u00e9p\u00f4ts</option>
                {depots.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <button type="submit"
                className="min-h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft hover:brightness-105 transition"
                disabled={loading}>
                {loading ? "Chargement..." : "Appliquer"}
              </button>
              {hasFilters && (
                <button type="button" onClick={handleReset}
                  className="min-h-10 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-muted transition">
                  R\u00e9initialiser
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Table */}
        <section className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="px-6 py-3.5 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {meta.total} rapport{meta.total !== 1 ? "s" : ""}
            </span>
            {meta.total_pages > 1 && (
              <span className="text-xs text-muted-foreground">Page {page} / {meta.total_pages}</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">D\u00e9p\u00f4t concern\u00e9</th>
                  <th className="px-5 py-3.5">Fichier PDF</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="px-5 py-10 text-center text-muted-foreground">
                    Chargement des rapports de stock...
                  </td></tr>
                ) : error ? (
                  <tr><td colSpan="4" className="px-5 py-10 text-center text-destructive">{error}</td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan="4" className="px-5 py-12 text-center text-muted-foreground">
                    {hasFilters
                      ? "Aucun rapport ne correspond aux filtres s\u00e9lectionn\u00e9s."
                      : "Aucun rapport de stock disponible."}
                  </td></tr>
                ) : reports.map(doc => (
                  <tr key={doc.id} className="table-row border-t border-border">
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDateTime(doc.uploadedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{doc.depotName || doc.depotCode}</div>
                      <div className="text-xs text-muted-foreground">{doc.depotCode}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C63D3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="font-medium text-xs break-all max-w-xs">{doc.fileName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 pl-5">{formatFileSize(doc.fileSize)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handlePreview(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-primary hover:bg-primary hover:text-white transition">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                          Aper\u00e7u
                        </button>
                        <button onClick={() => handleDownload(doc)} disabled={downloadingId === doc.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-primary hover:text-white transition disabled:opacity-50">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {downloadingId === doc.id ? "T\u00e9l\u00e9charg..." : "T\u00e9l\u00e9charger"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button onClick={() => loadReports(page - 1)} disabled={!meta.has_previous_page || loading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                Pr\u00e9c\u00e9dent
              </button>
              <span className="text-xs text-muted-foreground">Page {page} sur {meta.total_pages}</span>
              <button onClick={() => loadReports(page + 1)} disabled={!meta.has_next_page || loading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                Suivant
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
              <div className="min-w-0 flex-1 mr-4">
                <h2 className="text-sm font-semibold truncate">{previewDoc.fileName}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {previewDoc.depotName || previewDoc.depotCode} \u2014 {formatDateTime(previewDoc.uploadedAt)}
                </p>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                <button onClick={() => handleDownload(previewDoc)} disabled={downloadingId === previewDoc.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-primary hover:bg-primary hover:text-white transition disabled:opacity-50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  T\u00e9l\u00e9charger
                </button>
                <button onClick={handleClosePreview}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted text-base">
                  \u00d7
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-muted">
              {previewLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Chargement du document...
                </div>
              ) : previewError ? (
                <div className="h-full flex items-center justify-center text-destructive text-sm px-4 text-center">
                  {previewError}
                </div>
              ) : previewBlobUrl ? (
                <iframe src={previewBlobUrl} className="w-full h-full border-0" title={previewDoc.fileName} />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
