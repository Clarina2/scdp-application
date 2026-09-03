import React, { useState, useEffect } from "react";
import { adminApi, stockApi } from "../api/client";

const theme = `
  :root {
    --background: #F7FAF7;
    --foreground: #173225;
    --primary: #2F7D32;
    --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA;
    --secondary-foreground: #173225;
    --tertiary: #6AA84F;
    --muted: #F0F5F0;
    --muted-foreground: #657467;
    --accent: #DDEFD9;
    --card: #FFFFFF;
    --border: #E2EDE3;
    --input: #E2EDE3;
    --radius: 1rem;
    --font-sans: Inter, system-ui, sans-serif;
    --font-heading: Inter, system-ui, sans-serif;
    --shadow-color: rgba(47, 125, 50, 0.08);
    --primary-text: #256A28;
  }
  .gpl-dashboard { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
  .bg-card { background-color: var(--card); }
  .bg-primary { background-color: var(--primary); color: var(--primary-foreground); }
  .bg-secondary { background-color: var(--secondary); }
  .bg-muted { background-color: var(--muted); }
  .bg-tertiary { background-color: var(--tertiary); }
  .text-primary { color: var(--primary-text); }
  .text-muted-foreground { color: var(--muted-foreground); }
  .border-border { border-color: var(--border); }
  .border-input { border-color: var(--input); }
  .rounded-2xl { border-radius: 1.25rem; }
  .rounded-xl { border-radius: var(--radius); }
  .shadow-soft { box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04); }
  .shadow-soft-hover { transition: box-shadow 0.25s ease, transform 0.25s ease; }
  .shadow-soft-hover:hover { box-shadow: 0 8px 28px -6px var(--shadow-color); transform: translateY(-1px); }
  .progress-track { background: linear-gradient(90deg, var(--secondary), #f0f7f0); }
  .progress-fill { background: linear-gradient(90deg, var(--primary), #4CAF50); }
  .table-row { transition: background-color 0.15s ease; }
  .table-row:hover { background-color: var(--muted); }
  .filter-btn { transition: all 0.2s ease; }
  .filter-btn:hover { border-color: var(--primary); background-color: var(--secondary); }
  .bar-in { background: linear-gradient(180deg, #4CAF50, var(--primary)); border-radius: 6px 6px 0 0; }
  .bar-out { background: linear-gradient(180deg, #81C784, var(--tertiary)); border-radius: 6px 6px 0 0; }
`;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [cities, setCities] = useState([]);
  const [depots, setDepots] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Filter state
  const [selectedMarketer, setSelectedMarketer] = useState("Tous les marketers");
  const [selectedCity, setSelectedCity] = useState("Toutes les villes");
  const [selectedDepot, setSelectedDepot] = useState("Tous les dépôts");
  const [selectedProduct, setSelectedProduct] = useState("Tous les produits");
  const [selectedPeriod, setSelectedPeriod] = useState("Période");

  useEffect(() => {
    loadDashboardData();
  }, [selectedMarketer, selectedCity, selectedDepot, selectedProduct, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Build filter parameters
      const params = {};
      if (selectedMarketer !== "Tous les marketers") {
        const marketer = distributors.find(d => `${d.code} - ${d.name}` === selectedMarketer || d.code === selectedMarketer);
        if (marketer) params.marketer_id = marketer.code;
      }
      if (selectedCity !== "Toutes les villes") {
        const city = cities.find(c => c.name === selectedCity || String(c.code) === selectedCity);
        if (city) params.city_id = city.code;
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
        // Convert period to date range
        const dates = getPeriodDateRange(selectedPeriod);
        if (dates) {
          params.start_date = dates.start;
          params.end_date = dates.end;
        }
      }

      console.log('Admin Dashboard - Loading with params:', params);

      // Load dashboard summary with filters
      const summaryData = await adminApi.getDashboardSummary(params);
      console.log('Admin Dashboard - Summary data:', summaryData);
      setSummary(summaryData);

      // Load filter options
      const [distributorsData, citiesData, depotsData, productsData] = await Promise.all([
        adminApi.getDistributors(),
        stockApi.getCities(),
        stockApi.getDepots(),
        stockApi.getProducts(),
      ]);

      setDistributors(distributorsData || []);
      setCities(citiesData || []);
      setDepots(depotsData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDateRange = (period) => {
    const now = new Date();

    if (period === "Aujourd'hui") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      return { start: startStr, end: startStr };
    }
    if (period === "Cette semaine") {
      const dayOfWeek = now.getDay();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek));
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      return { start: startStr, end: endStr };
    }
    if (period === "Ce mois") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      return { start: startStr, end: endStr };
    }
    return null;
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'marketer') setSelectedMarketer(value);
    if (filterType === 'city') setSelectedCity(value);
    if (filterType === 'depot') setSelectedDepot(value);
    if (filterType === 'product') setSelectedProduct(value);
    if (filterType === 'period') setSelectedPeriod(value);
    loadDashboardData();
  };

  const handleResetFilters = () => {
    setSelectedMarketer("Tous les marketers");
    setSelectedCity("Toutes les villes");
    setSelectedDepot("Tous les dépôts");
    setSelectedProduct("Tous les produits");
    setSelectedPeriod("Période");
    loadDashboardData();
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await adminApi.triggerSync();
      // Reload dashboard data after sync
      await loadDashboardData();
    } catch (err) {
      console.error("Failed to trigger sync:", err);
      setError(err.message || "Failed to trigger synchronization");
    } finally {
      setSyncing(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
  };

  const formatVolume = (num) => {
    if (num === null || num === undefined) return "0 L";
    return `${formatNumber(num)} L`;
  };

  // Generate filter options dynamically
  const FILTERS = [
    {
      label: "Tous les marketers",
      options: ["Tous les marketers", ...Array.from(new Set(distributors.map(d => `${d.code} - ${d.name}`)))],
      value: selectedMarketer,
      onChange: (value) => handleFilterChange('marketer', value),
    },
    {
      label: "Toutes les villes",
      options: ["Toutes les villes", ...Array.from(new Set(cities.map(c => c.name || String(c.code))))],
      value: selectedCity,
      onChange: (value) => handleFilterChange('city', value),
    },
    {
      label: "Tous les dépôts",
      options: ["Tous les dépôts", ...Array.from(new Set(depots.map(d => d.name || d.code_depot)))],
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
      options: ["Période", "Aujourd'hui", "Cette semaine", "Ce mois", "Personnalisée"],
      value: selectedPeriod,
      onChange: (value) => handleFilterChange('period', value),
    },
  ];

  // Generate KPI cards from real data
  const KPI_CARDS = summary ? [
    {
      label: "Marketers actifs",
      value: summary.activeMarketers?.toString() || "0",
      note: `Total: ${summary.totalMarketers || 0}`,
      noteClass: "text-primary"
    },
    {
      label: "Stock total",
      value: formatVolume(summary.totalStockVolume),
      note: `${summary.totalStockRecords || 0} enregistrements`,
      noteClass: "text-muted-foreground"
    },
    {
      label: "Sorties du mois",
      value: formatVolume(summary.monthlyExits),
      note: `${summary.totalDepots || 0} dépôts`,
      noteClass: "text-muted-foreground"
    },
    {
      label: "Consommation",
      value: formatVolume(summary.monthlyConsumption),
      note: "Ce mois",
      noteClass: "text-muted-foreground"
    },
  ] : [];

  // Generate top marketers from real data
  const TOP_MARKETERS = summary?.topMarketers?.map((m, index) => {
    const totalStock = summary.topMarketers.reduce((sum, item) => sum + (item.stock || 0), 0);
    const share = totalStock > 0 ? ((m.stock || 0) / totalStock * 100).toFixed(0) : "0";
    return {
      name: m.code || "N/A",
      stock: formatVolume(m.stock),
      conso: formatVolume(m.stock * 0.3), // Estimate consumption as 30% of stock
      share: `${share}%`
    };
  }) || [];

  // Generate recent movements from real data
  const RECENT = summary?.recentMovements || [];

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
            <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">
              Tableau de bord global
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Vue d’ensemble des stocks, sorties et consommations de tous les marketers.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-xl border-2 border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary shadow-soft hover:border-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? "Synchronisation en cours..." : "Synchroniser les données"}
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 overflow-x-auto pb-2">
          {KPI_CARDS.map((c) => (
            <div key={c.label} className="shadow-soft shadow-soft-hover rounded-2xl border border-border bg-card p-6 min-w-[280px]">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <p className="mt-2.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">{c.value}</p>
              <p className={`mt-1.5 text-xs font-medium ${c.noteClass}`}>{c.note}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft xl:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-heading font-semibold">Statistiques de synchronisation</h2>
                <p className="mt-1 text-sm text-muted-foreground">État de la réplication des données</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {summary?.lastSync ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Dernière synchronisation</p>
                    <p className="mt-1 text-sm font-semibold">
                      {summary.lastSync.startedAt ? new Date(summary.lastSync.startedAt).toLocaleString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {summary.lastSync.status || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Enregistrements lus</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatNumber(summary.lastSync.recordsRead || 0)}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Enregistrements insérés</p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {formatNumber(summary.lastSync.recordsInserted || 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">Aucune synchronisation récente</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Top marketers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Par volume de stock</p>
            <div className="mt-6 space-y-5">
              {TOP_MARKETERS.length > 0 ? TOP_MARKETERS.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{m.name}</span>
                    <span className="font-semibold text-primary">{m.conso}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill" style={{ width: m.share }} />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="p-6 pb-5">
            <h2 className="text-lg font-heading font-semibold">Derniers mouvements</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tous marketers confondus</p>
          </div>
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Marketer</th>
                  <th className="px-6 py-3.5">Dépôt</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((r, i) => (
                  <tr key={i} className="table-row border-t border-border">
                    <td className="px-6 py-4 text-muted-foreground">{r.date}</td>
                    <td className="px-6 py-4 font-medium">{r.marketer}</td>
                    <td className="px-6 py-4">{r.depot}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-primary">{r.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}