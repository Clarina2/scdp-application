import React, { useState, useEffect } from "react";
import { receptionsApi, exitsApi, stockApi } from "../api/client";

const theme = `
  :root {
    --background: #F7FAF7; --foreground: #173225; --primary: #2F7D32; --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA; --muted: #F0F5F0; --muted-foreground: #657467; --card: #FFFFFF;
    --border: #E2EDE3; --input: #E2EDE3; --radius: 1rem;
    --font-sans: Inter, system-ui, sans-serif; --font-heading: Inter, system-ui, sans-serif;
    --shadow-color: rgba(47, 125, 50, 0.08); --primary-text: #256A28;
  }
  .gpl-dashboard { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
  .bg-card { background-color: var(--card); } .bg-secondary { background-color: var(--secondary); }
  .bg-muted { background-color: var(--muted); } .bg-accent { background-color: #DDEFD9; }
  .text-primary { color: var(--primary-text); } .text-muted-foreground { color: var(--muted-foreground); }
  .border-border { border-color: var(--border); } .border-input { border-color: var(--input); }
  .rounded-2xl { border-radius: 1.25rem; } .rounded-xl { border-radius: var(--radius); }
  .shadow-soft { box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04); }
  .table-row:hover { background-color: var(--muted); }
  .filter-btn:hover { border-color: var(--primary); background-color: var(--secondary); }
`;

const generatePeriodOptions = () => {
  const options = [];
  const now = new Date();
  const FRENCH_MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push(`${FRENCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }
  return options;
};

const getPeriodDateRange = (period) => {
  if (!period || period === "Période") return null;
  const FRENCH_MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const now = new Date();
  for (let mIndex = 0; mIndex < 12; mIndex++) {
    const mName = FRENCH_MONTHS[mIndex];
    if (period.startsWith(mName)) {
      const parts = period.split(' ');
      const year = parts[1] ? parseInt(parts[1], 10) : now.getFullYear();
      const start = new Date(year, mIndex, 1);
      const end = new Date(year, mIndex + 1, 0);
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      return { start: startStr, end: endStr };
    }
  }
  return null;
};

export default function AdminMouvements() {
  const periodOptions = ["Période", ...generatePeriodOptions()];
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [depots, setDepots] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  // Filter state
  const [selectedMarketer, setSelectedMarketer] = useState("Tous les marketers");
  const [selectedDepot, setSelectedDepot] = useState("Tous les dépôts");
  const [selectedProduct, setSelectedProduct] = useState("Tous les produits");
  const [selectedPeriod, setSelectedPeriod] = useState("Période");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMovementsData();
  }, [page, selectedMarketer, selectedDepot, selectedProduct, selectedPeriod]);

  const loadMovementsData = async () => {
    try {
      setLoading(true);
      setError("");

      // Build filter parameters
      const params = { page, limit: 10 };
      if (selectedMarketer !== "Tous les marketers") {
        const marketer = distributors.find(d => d.name === selectedMarketer || d.code === selectedMarketer);
        if (marketer) params.distributor_code = marketer.code;
      }
      if (selectedDepot !== "Tous les dépôts") {
        const depot = depots.find(d => d.name === selectedDepot || d.code === selectedDepot);
        if (depot) params.depot_code = depot.code;
      }
      if (selectedProduct !== "Tous les produits") {
        const product = products.find(p => p.name === selectedProduct || p.code === selectedProduct);
        if (product) params.product_code = product.code;
      }
      if (selectedPeriod !== "Période") {
        const dates = getPeriodDateRange(selectedPeriod);
        if (dates) {
          params.start_date = dates.start;
          params.end_date = dates.end;
        }
      }

      // Load both receptions and exits
      const [receptionsData, exitsData] = await Promise.all([
        receptionsApi.getReceptions(params),
        exitsApi.getExits(params),
      ]);

      // Combine and format movements
      const combinedMovements = [
        ...(receptionsData.items || []).map(r => ({
          date: r.receptionDate ? new Date(r.receptionDate).toLocaleDateString('fr-FR') : 'N/A',
          ref: r.receptionNumber || `REC-${r.id}`,
          marketer: r.distributorName || r.distributorCode || 'N/A',
          depot: r.depotName || r.depotCode || 'N/A',
          type: "Réception",
          qty: `${r.quantity || 0} L`,
          status: "Validée"
        })),
        ...(exitsData.items || []).map(e => ({
          date: e.exitDate ? new Date(e.exitDate).toLocaleDateString('fr-FR') : 'N/A',
          ref: e.borderauNumber || `EXIT-${e.id}`,
          marketer: e.distributorName || e.distributorCode || 'N/A',
          depot: e.depotName || e.depotCode || 'N/A',
          type: "Sortie",
          qty: `${e.quantity || 0} L`,
          status: "Validée"
        }))
      ].sort((a, b) => {
        // Sort by date (most recent first)
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateB - dateA;
      });

      setMovements(combinedMovements);
      setTotal((receptionsData.meta?.total || 0) + (exitsData.meta?.total || 0));

      // Load filter options
      const [distributorsData, depotsData, productsData] = await Promise.all([
        receptionsApi.getDistributors(),
        exitsApi.getDepots(),
        exitsApi.getProducts(),
      ]);

      setDistributors(distributorsData || []);
      setDepots(depotsData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error("Failed to load movements data:", err);
      setError(err.message || "Failed to load movements data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'marketer') setSelectedMarketer(value);
    if (filterType === 'depot') setSelectedDepot(value);
    if (filterType === 'product') setSelectedProduct(value);
    if (filterType === 'period') setSelectedPeriod(value);
    setPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setSelectedMarketer("Tous les marketers");
    setSelectedDepot("Tous les dépôts");
    setSelectedProduct("Tous les produits");
    setSelectedPeriod("Période");
    setPage(1);
  };

  const handleExport = async () => {
    try {
      // Build filter parameters for export
      const params = {};
      if (selectedMarketer !== "Tous les marketers") {
        const marketer = distributors.find(d => d.name === selectedMarketer || d.code === selectedMarketer);
        if (marketer) params.distributor_code = marketer.code;
      }
      if (selectedDepot !== "Tous les dépôts") {
        const depot = depots.find(d => d.name === selectedDepot || d.code === selectedDepot);
        if (depot) params.depot_code = depot.code;
      }
      if (selectedProduct !== "Tous les produits") {
        const product = products.find(p => p.name === selectedProduct || p.code === selectedProduct);
        if (product) params.product_code = product.code;
      }

      // Export both receptions and exits
      await Promise.all([
        receptionsApi.exportCsv(params),
        exitsApi.exportCsv(params),
      ]);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const FILTERS = [
    {
      label: "Tous les marketers",
      options: ["Tous les marketers", ...Array.from(new Set(distributors.map(d => d.name || d.code)))],
      value: selectedMarketer,
      onChange: (value) => handleFilterChange('marketer', value),
    },
    {
      label: "Tous les dépôts",
      options: ["Tous les dépôts", ...Array.from(new Set(depots.map(d => d.name || d.code)))],
      value: selectedDepot,
      onChange: (value) => handleFilterChange('depot', value),
    },
    {
      label: "Tous les produits",
      options: ["Tous les produits", ...Array.from(new Set(products.map(p => p.name || p.code)))],
      value: selectedProduct,
      onChange: (value) => handleFilterChange('product', value),
    },
    {
      label: "Période",
      options: periodOptions,
      value: selectedPeriod,
      onChange: (value) => handleFilterChange('period', value),
    },
  ];

  if (loading) {
    return (
      <div className="gpl-dashboard min-h-screen w-full flex items-center justify-center">
        <style>{theme}</style>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gpl-dashboard min-h-screen w-full flex items-center justify-center">
        <style>{theme}</style>
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="gpl-dashboard min-h-screen w-full">
      <style>{theme}</style>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary tracking-wide">Administration</p>
            <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">Mouvements</h1>
            <p className="mt-2 text-sm text-muted-foreground">Historique complet des sorties et consommations.</p>
          </div>
          <button className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft" onClick={handleExport}>
            Exporter
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {FILTERS.map((filter) => (
                <div key={filter.label} className="relative">
                    <select
                    className="filter-btn flex min-h-11 w-full appearance-none items-center justify-between rounded-xl border border-input bg-background px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    >
                    {filter.options.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
                    </select>

                    {/* Icône flèche (ajoute-la si tu en as une) */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    {/* <IconPlaceholder /> */}
                    </div>
                </div>
                ))}
                <button
                    onClick={handleResetFilters}
                    className="filter-btn flex min-h-11 w-full items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium text-primary hover:border-primary hover:bg-secondary transition-all"
                >
                    Réinitialiser
                </button>
            </div>
            </section>

        <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Référence</th>
                  <th className="px-6 py-3.5">Marketer</th>
                  <th className="px-6 py-3.5">Dépôt</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Quantité</th>
                  <th className="px-6 py-3.5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {movements.length > 0 ? movements.map((m) => (
                  <tr key={m.ref} className="table-row border-t border-border">
                    <td className="px-6 py-4 text-muted-foreground">{m.date}</td>
                    <td className="px-6 py-4 font-medium">{m.ref}</td>
                    <td className="px-6 py-4">{m.marketer}</td>
                    <td className="px-6 py-4">{m.depot}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        m.type === "Sortie" ? "bg-secondary text-primary" : "bg-accent text-foreground"
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-primary">{m.qty}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                      Aucune donnée disponible pour les filtres sélectionnés
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}