// -*- coding: utf-8 -*-
import React, { useState, useEffect, useCallback } from "react";
import { stockGestionnaireApi, receptionsApi } from "../api/client";

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
    --card: #FFFFFF;
    --card-foreground: #173225;
    --destructive: #C63D3D;
    --destructive-foreground: #FFFFFF;
    --border: #E2EDE3;
    --input: #E2EDE3;
    --radius: 1rem;
    --shadow-color: rgba(47, 125, 50, 0.08);
  }

  .gpl-dashboard {
    background: var(--background);
    color: var(--foreground);
    font-family: Inter, system-ui, sans-serif;
  }

  .bg-card { background-color: var(--card); }
  .bg-secondary { background-color: var(--secondary); }
  .bg-muted { background-color: var(--muted); }
  .text-primary { color: #256A28; }
  .text-muted-foreground { color: var(--muted-foreground); }
  .text-destructive { color: var(--destructive); }
  .border-border { border-color: var(--border); }
  .border-input { border-color: var(--input); }

  .shadow-soft {
    box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04);
  }

  .submit-btn {
    transition: all 0.2s ease;
  }
  .submit-btn:hover:not(:disabled) {
    filter: brightness(1.08);
    box-shadow: 0 6px 16px -4px rgba(47, 125, 50, 0.35);
  }
  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .table-row { transition: background-color 0.15s ease; }
  .table-row:hover { background-color: var(--muted); }

  .form-input {
    width: 100%;
    min-height: 2.625rem;
    padding: 0 0.875rem;
    border: 1px solid var(--input);
    border-radius: 0.5rem;
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

function formatDisplayDateTime(d = new Date()) {
  const dateStr = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} ${timeStr}`;
}

function formatDateOnly(isoStr) {
  if (!isoStr) return "-";
  try {
    const [year, month, day] = String(isoStr).split("T")[0].split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "-"; }
}

function formatStatementType(type) {
  if (type === "JOURNALIER") return "État journalier";
  if (type === "MENSUEL") return "État mensuel";
  return "Non renseigné";
}

function formatStatementPeriod(start, end) {
  if (!start || !end) return "Non renseignée";
  return `${formatDateOnly(start)} → ${formatDateOnly(end)}`;
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function StockGestionnaireExporter() {
  // â”€â”€ Form State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [selectedDepotCode, setSelectedDepotCode] = useState("");
  const [selectedDistributorCode, setSelectedDistributorCode] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(formatDisplayDateTime());
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [statementType, setStatementType] = useState("");
  const [statementStartDate, setStatementStartDate] = useState("");
  const [statementEndDate, setStatementEndDate] = useState("");

  // â”€â”€ Metadata Options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [depots, setDepots] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);

  // â”€â”€ Submit / UI State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  // â”€â”€ Document History & Filter State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState(null);
  const LIMIT = 10;

  // Filters for Documents enregistres
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterDistributorCode, setFilterDistributorCode] = useState("");
  const [filterDepotCode, setFilterDepotCode] = useState("");
  const [filterStatementType, setFilterStatementType] = useState("");
  const [filterStatementStartDate, setFilterStatementStartDate] = useState("");
  const [filterStatementEndDate, setFilterStatementEndDate] = useState("");

  // Preview & Download state
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Update live date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatDisplayDateTime());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // â”€â”€ Load Metadata (Depots + Marketers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancelled = false;
    async function loadMetadata() {
      try {
        setMetaLoading(true);
        const [depotsData, distributorsData] = await Promise.all([
          receptionsApi.getDepots(),
          receptionsApi.getDistributors(),
        ]);
        if (!cancelled) {
          setDepots(depotsData || []);
          setDistributors(distributorsData || []);
        }
      } catch {
        if (!cancelled) setFormError("Impossible de charger la liste des dépôts et marketers.");
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    }
    loadMetadata();
    return () => { cancelled = true; };
  }, []);

  // â”€â”€ Load Documents List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadDocuments = useCallback(async (pageNum = 1) => {
    setDocsLoading(true);
    setDocsError(null);
    try {
      if (filterStartDate && filterEndDate && filterStartDate > filterEndDate) {
        setDocsError("Date d'upload début ne peut pas être après Date d'upload fin.");
        setDocuments([]);
        setTotal(0);
        return;
      }
      if (filterStatementStartDate && filterStatementEndDate && filterStatementStartDate > filterStatementEndDate) {
        setDocsError("Date début de l'état ne peut pas être après Date fin de l'état.");
        setDocuments([]);
        setTotal(0);
        return;
      }

      const params = { page: pageNum, limit: LIMIT };
      if (filterStartDate) params.start_date = filterStartDate;
      if (filterEndDate) params.end_date = filterEndDate;
      if (filterDistributorCode) params.distributor_code = filterDistributorCode;
      if (filterDepotCode) params.depot_code = filterDepotCode;
      if (filterStatementType) params.statement_type = filterStatementType;
      if (filterStatementStartDate) params.statement_start_date = filterStatementStartDate;
      if (filterStatementEndDate) params.statement_end_date = filterStatementEndDate;

      const data = await stockGestionnaireApi.getDocuments(params);
      setDocuments(data.items || []);
      setTotal(data.total !== undefined ? data.total : (data.meta?.total || 0));
    } catch {
      setDocsError("Impossible de charger l'historique des documents.");
      setDocuments([]);
      setTotal(0);
    } finally {
      setDocsLoading(false);
    }
  }, [filterStartDate, filterEndDate, filterDistributorCode, filterDepotCode, filterStatementType, filterStatementStartDate, filterStatementEndDate]);

  useEffect(() => {
    loadDocuments(page);
  }, [page, loadDocuments]);

  const handleResetFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterDistributorCode("");
    setFilterDepotCode("");
    setFilterStatementType("");
    setFilterStatementStartDate("");
    setFilterStatementEndDate("");
    setPage(1);
  };

  const handleOpenPreview = async (doc) => {
    try {
      setPreviewLoading(true);
      setPreviewDoc(doc);
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
      const blobUrl = await stockGestionnaireApi.fetchDocumentBlobUrl(doc.id);
      setPreviewBlobUrl(blobUrl);
    } catch (err) {
      alert(err.message || "Erreur lors de la prévisualisation du document.");
      setPreviewDoc(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewDoc(null);
  };

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      await stockGestionnaireApi.downloadDocument(doc.id, doc.fileName || "document_stock.pdf");
    } catch (err) {
      alert(err.message || "Erreur lors du téléchargement.");
    } finally {
      setDownloadingId(null);
    }
  };

  // â”€â”€ File Picker Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");
    setSuccessMessage("");
    setFormError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 1. Check extension & mime
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && file.type !== "application/pdf") {
      setFileError("Seuls les fichiers PDF sont acceptes (.pdf).");
      setSelectedFile(null);
      return;
    }

    // 2. Check size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Le fichier depasse la taille maximale autorisee (10 MB).");
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setFileError("Le fichier selectionne est vide.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
  };

  // Form Validation
  const statementDateError =
    statementStartDate && statementEndDate && statementStartDate > statementEndDate
      ? "Date début ne peut pas être après Date fin."
      : "";

  const isFormValid =
    Boolean(selectedDepotCode) &&
    Boolean(selectedDistributorCode) &&
    Boolean(selectedFile) &&
    Boolean(statementType) &&
    Boolean(statementStartDate) &&
    Boolean(statementEndDate) &&
    !statementDateError &&
    !fileError &&
    !uploading;

  // â”€â”€ Submit Document Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setUploading(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("depot_code", selectedDepotCode);
      formData.append("distributor_code", selectedDistributorCode);
      formData.append("file", selectedFile);
      formData.append("statement_type", statementType);
      formData.append("statement_start_date", statementStartDate);
      formData.append("statement_end_date", statementEndDate);

      await stockGestionnaireApi.uploadDocument(formData);

      // Success
      setSuccessMessage("Fichier ajouté avec succès.");
      setSelectedFile(null);
      setSelectedDepotCode("");
      setSelectedDistributorCode("");
      setStatementType("");
      setStatementStartDate("");
      setStatementEndDate("");
      
      // Refresh documents list immediately
      setPage(1);
      loadDocuments(1);
    } catch (err) {
      setFormError(err.message || "Erreur lors de l'envoi du document PDF.");
    } finally {
      setUploading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="gpl-dashboard min-h-screen w-full p-6 md:p-8 lg:p-10">
      <style>{theme}</style>

      {/* Header */}
      <header>
        <p className="text-sm font-medium text-primary tracking-wide">Gestion documentaire</p>
        <h1 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight">
          Exporter - Ajouter un état
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
          Associez et déposez des relevés de stock PDF par dépôt et marketer.
        </p>
      </header>

      {/* â”€â”€ Form Section â”€â”€ */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft">
        <h2 className="text-lg font-semibold tracking-tight">États de stock</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sélectionnez le dépôt, le marketer et joignez votre fichier au format PDF.
        </p>

        {/* Global form success/error alerts */}
        {successMessage && (
          <div className="mt-4 rounded-xl bg-accent p-4 text-sm font-semibold text-primary flex items-center gap-2 border border-border">
            <span>âœ…</span>
            <span>{successMessage}</span>
          </div>
        )}
        {formError && (
          <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive border border-destructive/20 flex items-center gap-2">
            <span>âš ï¸</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            {/* 1. Depot Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Dépôt <span className="text-destructive">*</span>
              </label>
              <select
                className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                value={selectedDepotCode}
                onChange={(e) => setSelectedDepotCode(e.target.value)}
                disabled={metaLoading || uploading}
              >
                <option value="">-- Sélectionner un dépôt --</option>
                {depots.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name || d.code} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Marketer Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Marketer <span className="text-destructive">*</span>
              </label>
              <select
                className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                value={selectedDistributorCode}
                onChange={(e) => setSelectedDistributorCode(e.target.value)}
                disabled={metaLoading || uploading}
              >
                <option value="">-- Sélectionner un marketer --</option>
                {distributors.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name || m.code} ({m.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Date field (dynamic auto-display) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Date d'upload</label>
              <input
                type="text"
                readOnly
                value={currentDateTime}
                className="min-h-11 w-full rounded-xl border border-input bg-muted px-3 text-sm font-mono text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* 4. PDF File Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">
              Fichier PDF <span className="text-destructive">*</span>
            </label>

            {!selectedFile ? (
              <label className="flex min-h-24 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-input bg-background p-4 text-center transition hover:border-[var(--primary)] hover:bg-secondary/40">
                <span className="text-2xl mb-1">ðŸ“„</span>
                <span className="text-xs font-semibold text-primary">Sélectionner un fichier PDF</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  Format PDF uniquement (application/pdf) · Max 10 MB
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">ðŸ“„</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)} · Document PDF</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  className="px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-background rounded-lg border border-border transition"
                  title="Supprimer le fichier selectionne"
                >
                  X Supprimer
                </button>
              </div>
            )}

            {fileError && <p className="text-xs text-destructive font-medium mt-1">{fileError}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Informations de l'état</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                La période correspond aux dates couvertes par l'état PDF.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Type d'état <span className="text-destructive">*</span>
                </label>
                <select
                  className="form-input"
                  value={statementType}
                  onChange={(e) => setStatementType(e.target.value)}
                  disabled={uploading}
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="JOURNALIER">État journalier</option>
                  <option value="MENSUEL">État mensuel</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Date début <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={statementStartDate}
                  onChange={(e) => setStatementStartDate(e.target.value)}
                  max={statementEndDate || undefined}
                  disabled={uploading}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Date fin <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={statementEndDate}
                  onChange={(e) => setStatementEndDate(e.target.value)}
                  min={statementStartDate || undefined}
                  disabled={uploading}
                  required
                />
              </div>
            </div>
            {statementDateError && (
              <p className="mt-3 text-xs font-semibold text-destructive">{statementDateError}</p>
            )}
          </div>

          {/* 5. Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="submit"
              disabled={!isFormValid}
              className="submit-btn flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-soft"
            >
              {uploading ? (
                <>
                  <span className="animate-spin text-base">â³</span>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span>Confirmer & Enregistrer</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* â”€â”€ Document List Table Section â”€â”€ */}
      <section className="mt-8 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Documents enregistrés</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Historique des états
            </p>
          </div>
          {!docsLoading && total > 0 && (
            <span className="inline-flex items-center rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-primary border border-border">
              {total} document{total > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* â”€â”€ Filter Controls for Documents â”€â”€ */}
        <div className="p-5 bg-muted/40 border-b border-border">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5 flex-1">
              {/* Date debut */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Date d'upload début
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={filterStartDate}
                  onChange={(e) => {
                    setFilterStartDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Date fin */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Date d'upload fin
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={filterEndDate}
                  onChange={(e) => {
                    setFilterEndDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Marketer */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Marketer
                </label>
                <select
                  className="form-input"
                  value={filterDistributorCode}
                  onChange={(e) => {
                    setFilterDistributorCode(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tous les marketers</option>
                  {distributors.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Depot */}

              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">

                  Dépôt

                </label>

                <select

                  className="form-input"

                  value={filterDepotCode}

                  onChange={(e) => {

                    setFilterDepotCode(e.target.value);

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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Type d'état
                </label>
                <select
                  className="form-input"
                  value={filterStatementType}
                  onChange={(e) => {
                    setFilterStatementType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tous les types</option>
                  <option value="JOURNALIER">État journalier</option>
                  <option value="MENSUEL">État mensuel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Début période
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={filterStatementStartDate}
                  onChange={(e) => {
                    setFilterStatementStartDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Fin période
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={filterStatementEndDate}
                  onChange={(e) => {
                    setFilterStatementEndDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!filterStartDate && !filterEndDate && !filterDistributorCode && !filterDepotCode && !filterStatementType && !filterStatementStartDate && !filterStatementEndDate}
                className="btn-action bg-card text-muted-foreground hover:bg-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed border border-border"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Date d'upload</th>
                <th className="px-6 py-3.5">Dépôt</th>
                <th className="px-6 py-3.5">Marketer</th>
                <th className="px-6 py-3.5">Type d'état</th>
                <th className="px-6 py-3.5">Période</th>
                <th className="px-6 py-3.5">Fichier PDF</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Loading State */}
              {docsLoading && (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="text-xs font-medium">Chargement des documents...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Error State */}
              {!docsLoading && docsError && (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center">
                    <p className="text-xs text-destructive font-medium">{docsError}</p>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!docsLoading && !docsError && documents.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">ðŸ“­</span>
                      <p className="text-xs font-medium">
                        {filterStartDate || filterEndDate || filterDistributorCode || filterDepotCode
                          ? "Aucun document ne correspond aux filtres sélectionnés."
                          : "Aucun document enregistré."}
                      </p>
                      {(filterStartDate || filterEndDate || filterDistributorCode || filterDepotCode || filterStatementType || filterStatementStartDate || filterStatementEndDate) && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-xs font-semibold text-primary hover:underline mt-1"
                        >
                          Effacer les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!docsLoading &&
                !docsError &&
                documents.map((doc) => (
                  <tr key={doc.id} className="table-row border-t border-border">
                    {/* Date */}
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {doc.uploadedAt ? formatDisplayDateTime(new Date(doc.uploadedAt)) : "Non disponible"}
                    </td>

                    {/* Depot */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
                          {doc.depotCode}
                        </span>
                        <span className="font-semibold text-foreground">
                          {doc.depotName || doc.depotCode}
                        </span>
                      </div>
                    </td>

                    {/* Marketer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
                          {doc.distributorCode}
                        </span>
                        <span className="font-semibold text-foreground">
                          {doc.distributorName || doc.distributorCode}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                      {formatStatementType(doc.statementType)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-muted-foreground">
                      {formatStatementPeriod(doc.statementStartDate, doc.statementEndDate)}
                    </td>

                    {/* Fichier PDF */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">ðŸ“„</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate max-w-xs" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                        Enregistré
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Aperçu */}
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(doc)}
                          className="btn-action bg-secondary text-primary hover:bg-primary hover:text-primary-foreground border border-border"
                          title="Aperçu du document PDF"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Aperçu
                        </button>

                        {/* Télécharger */}
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id}
                          className="btn-action bg-muted text-foreground hover:bg-secondary hover:text-primary disabled:opacity-50 border border-border"
                          title="Télécharger le fichier PDF"
                        >
                          {downloadingId === doc.id ? (
                            <span className="size-3 animate-spin rounded-full border border-primary border-t-transparent"></span>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          )}
                          Télécharger
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!docsLoading && !docsError && total > LIMIT && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
            <p className="text-xs text-muted-foreground">
              Affichage de la page <span className="font-semibold text-foreground">{page}</span> sur{" "}
              <span className="font-semibold text-foreground">{totalPages}</span> ({total} document{total > 1 ? "s" : ""})
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                &lt;- Precedent
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* â”€â”€ Preview Modal â”€â”€ */}
      {(previewDoc || previewLoading) && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-5 bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">ðŸ“„</span>
                <div className="min-w-0">
                  <h2 className="font-semibold text-base text-foreground truncate max-w-xl">
                    {previewDoc?.fileName || "Aperçu du document"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Marketer: {previewDoc?.distributorName || previewDoc?.distributorCode} · Dépôt: {previewDoc?.depotName || previewDoc?.depotCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewDoc && (
                  <button
                    type="button"
                    onClick={() => handleDownload(previewDoc)}
                    className="btn-action bg-secondary text-primary hover:bg-primary hover:text-primary-foreground border border-border"
                  >
                    Télécharger
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  title="Fermer"
                >
                  âœ•
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-muted/30 p-4 overflow-hidden min-h-[60vh] max-h-[75vh]">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-muted-foreground">
                  <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="text-sm font-medium">Chargement du PDF...</p>
                </div>
              ) : previewBlobUrl ? (
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-full rounded-xl border border-border bg-white shadow-inner min-h-[60vh]"
                  title="AperÃ§u du document PDF"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-20 text-muted-foreground">
                  <p className="text-sm">Impossible d'afficher l'aperçu du document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

