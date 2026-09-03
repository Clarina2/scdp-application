import React from 'react';

const theme = `
  .export-preview-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .export-preview-content {
    background: #FFFFFF;
    border-radius: 1rem;
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .export-preview-header {
    padding: 1.5rem;
    border-bottom: 1px solid #E2EDE3;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .export-preview-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .export-preview-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #E2EDE3;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .document-header {
    background: linear-gradient(135deg, #2F7D32, #4CAF50);
    color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .filter-summary {
    background: #F0F5F0;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .preview-table th {
    background: #EAF4EA;
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #2F7D32;
  }

  .preview-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #E2EDE3;
  }

  .preview-table tr:hover {
    background: #F7FAF7;
  }

  .totals-section {
    background: #EAF4EA;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-top: 1.5rem;
  }

  .btn-secondary {
    background: #E2EDE3;
    color: #173225;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #D0DDD0;
  }

  .btn-primary {
    background: #2F7D32;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background: #256A28;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function ExportPreviewModal({ isOpen, onClose, onConfirm, previewData, loading, documentType }) {
  if (!isOpen) return null;

  const { document, filters, rows, totals } = previewData || {};

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRowColumns = () => {
    if (!rows || rows.length === 0) return [];
    return Object.keys(rows[0]).filter(key => 
      key !== 'id' && 
      !key.toLowerCase().includes('fingerprint') &&
      !key.toLowerCase().includes('created_at')
    );
  };

  const getDisplayValue = (key, value) => {
    if (value === null || value === undefined) return '-';
    if (key.toLowerCase().includes('date')) {
      return formatDate(value);
    }
    if (typeof value === 'number') {
      return value.toLocaleString('fr-FR');
    }
    return String(value);
  };

  const getColumnLabel = (key) => {
    const labels = {
      exitDate: 'Date',
      receptionDate: 'Date',
      borderauNumber: 'Référence',
      receptionNumber: 'Référence',
      depotName: 'Dépôt',
      depotCode: 'Dépôt',
      productName: 'Produit',
      productCode: 'Produit',
      distributorName: 'Distributeur',
      distributorCode: 'Distributeur',
      destinationName: 'Destination',
      quantity: 'Quantité (L)',
    };
    return labels[key] || key;
  };

  return (
    <>
      <style>{theme}</style>
      <div className="export-preview-modal">
        <div className="export-preview-content">
          <div className="export-preview-header">
            <h2 className="text-xl font-semibold text-foreground">Aperçu de l'export</h2>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="export-preview-body">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Chargement de l'aperçu...</div>
              </div>
            ) : !previewData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Aucune donnée disponible</div>
              </div>
            ) : (
              <>
                {/* Document Header */}
                <div className="document-header">
                  <h1 className="text-2xl font-bold mb-2">{document?.title || 'Document'}</h1>
                  <div className="text-sm opacity-90">
                    <div><strong>Marketer:</strong> {document?.marketer}</div>
                    <div><strong>Généré le:</strong> {formatDate(document?.generated_at)}</div>
                    <div><strong>Référence:</strong> {document?.reference}</div>
                  </div>
                </div>

                {/* Filter Summary */}
                <div className="filter-summary">
                  <h3 className="font-semibold mb-2 text-foreground">Critères de consultation</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Marketer:</span> {filters?.marketer}</div>
                    <div><span className="text-muted-foreground">Dépôt:</span> {filters?.depot}</div>
                    <div><span className="text-muted-foreground">Produit:</span> {filters?.product}</div>
                    <div><span className="text-muted-foreground">Distributeur:</span> {filters?.distributor}</div>
                  </div>
                </div>

                {/* Data Table */}
                {rows && rows.length > 0 ? (
                  <>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto border border-border rounded-lg">
                      <table className="preview-table">
                        <thead>
                          <tr>
                            {getRowColumns().map((col) => (
                              <th key={col}>{getColumnLabel(col)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.slice(0, 50).map((row, idx) => (
                            <tr key={idx}>
                              {getRowColumns().map((col) => (
                                <td key={col}>{getDisplayValue(col, row[col])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {rows.length > 50 && (
                      <div className="text-sm text-muted-foreground mt-2 text-center">
                        Affichage des 50 premiers enregistrements sur {rows.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
                    Aucune donnée disponible pour les critères sélectionnés
                  </div>
                )}

                {/* Totals */}
                {totals && (
                  <div className="totals-section">
                    <h3 className="font-semibold mb-2">Totaux</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Opérations:</span> {totals?.total_operations?.toLocaleString()}</div>
                      <div><span className="text-muted-foreground">Quantité totale:</span> {totals?.total_quantity?.toLocaleString()} L</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="export-preview-footer">
            <button 
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Fermer
            </button>
            <button 
              onClick={onConfirm}
              className="btn-primary"
              disabled={loading || !previewData || !rows || rows.length === 0}
            >
              Confirmer l'export
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExportPreviewModal;
