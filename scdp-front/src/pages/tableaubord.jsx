 import React, { useState, useEffect } from "react";
import { stockApi, receptionsApi, exitsApi } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

// Generate dynamic period options based on current date
const generatePeriodOptions = () => {
  const periods = [];
  const now = new Date();
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${months[date.getMonth()]} ${date.getFullYear()}`);
  }
  
  periods.push('Personnalisée');
  return periods;
};

const getPeriodDateRange = (period, customStart, customEnd) => {
  if (period === 'Personnalisée' && customStart && customEnd) {
    return {
      start: customStart,
      end: customEnd
    };
  }

  const now = new Date();
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = `${months[d.getMonth()]} ${d.getFullYear()}`;
    if (period === monthName) {
      const startDate = new Date(d.getFullYear(), d.getMonth(), 1);
      const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;
      const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      return { start: startStr, end: endStr };
    }
  }

  // Default to current month range
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;
  const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
  return { start: startStr, end: endStr };
};

/**
 * GPL Track — Tableau de bord
 * Version soft & ergonomique
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
  .bg-tertiary { background-color: var(--tertiary); color: var(--tertiary-foreground); }
  .bg-accent { background-color: var(--accent); color: var(--accent-foreground); }
  .bg-muted { background-color: var(--muted); }
  .bg-destructive { background-color: var(--destructive); color: var(--destructive-foreground); }

  .text-foreground { color: var(--foreground); }
  .text-primary { color: var(--primary-text); }
  .text-primary-foreground { color: var(--primary-foreground); }
  .text-secondary { color: var(--secondary-text); }
  .text-secondary-foreground { color: var(--secondary-foreground); }
  .text-tertiary { color: var(--tertiary-text); }
  .text-accent { color: var(--accent-text); }
  .text-muted-foreground { color: var(--muted-foreground); }
  .text-card-foreground { color: var(--card-foreground); }
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

  .progress-track {
    background: linear-gradient(90deg, var(--secondary), #f0f7f0);
  }
  .progress-fill {
    background: linear-gradient(90deg, var(--primary), #4CAF50);
    transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .progress-fill-tertiary {
    background: linear-gradient(90deg, var(--tertiary), #81C784);
  }

  .table-row { transition: background-color 0.15s ease; }
  .table-row:hover { background-color: var(--muted); }

  .filter-btn { transition: all 0.2s ease; }
  .filter-btn:hover {
    border-color: var(--primary);
    background-color: var(--secondary);
  }

  .bar-in {
    background: linear-gradient(180deg, #4CAF50, var(--primary));
    border-radius: 6px 6px 0 0;
  }
  .bar-out {
    background: linear-gradient(180deg, #81C784, var(--tertiary));
    border-radius: 6px 6px 0 0;
  }
`;

// Calculate monthly chart data from filtered receptions and exits
const calculateMonthlyBars = (receptions, exits, selectedPeriod) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentYear = new Date().getFullYear();
  
  // Initialize bars for last 6 months
  const bars = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    
    bars.push({
      in: 0,
      out: 0,
      label: months[monthIndex],
      monthIndex,
      year
    });
  }
  
  // Aggregate receptions by month
  receptions.forEach(r => {
    const date = new Date(r.receptionDate);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    
    const bar = bars.find(b => b.monthIndex === monthIndex && b.year === year);
    if (bar) {
      bar.in += r.quantity || 0;
    }
  });
  
  // Aggregate exits by month
  exits.forEach(e => {
    const date = new Date(e.exitDate);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    
    const bar = bars.find(b => b.monthIndex === monthIndex && b.year === year);
    if (bar) {
      bar.out += e.quantity || 0;
    }
  });
  
  // Normalize heights (max height = 200px)
  const maxValue = Math.max(...bars.map(b => Math.max(b.in, b.out)), 1);
  return bars.map(b => ({
    ...b,
    in: Math.round((b.in / maxValue) * 200),
    out: Math.round((b.out / maxValue) * 200)
  }));
};

// Calculate monthly evaluation data (performance metrics)
const calculateEvaluationData = (receptions, exits) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const now = new Date();
  
  const evaluation = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    
    // Calculate totals for this month
    const monthReceptions = receptions.filter(r => {
      const rDate = new Date(r.receptionDate);
      return rDate.getMonth() === monthIndex && rDate.getFullYear() === year;
    });
    
    const monthExits = exits.filter(e => {
      const eDate = new Date(e.exitDate);
      return eDate.getMonth() === monthIndex && eDate.getFullYear() === year;
    });
    
    const totalIn = monthReceptions.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const totalOut = monthExits.reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    // Calculate performance score (0-100)
    const performance = totalIn > 0 ? Math.min(100, Math.round((totalOut / totalIn) * 100)) : 0;
    
    evaluation.push({
      month: months[monthIndex],
      year,
      totalIn,
      totalOut,
      performance,
      trend: totalOut >= totalIn ? 'up' : 'down'
    });
  }
  
  return evaluation;
};

function IconPlaceholder({ className = "" }) {
  return <span className={`inline-block ${className}`} aria-hidden="true" />;
}

export default function GPLDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [regions, setRegions] = useState([]);
  const [depots, setDepots] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentReceptions, setRecentReceptions] = useState([]);
  const [recentExits, setRecentExits] = useState([]);
  const [allReceptions, setAllReceptions] = useState([]);
  const [allExits, setAllExits] = useState([]);
  const [monthlyBars, setMonthlyBars] = useState([]);
  const [evaluationData, setEvaluationData] = useState([]);
  const [stockByProduct, setStockByProduct] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("Toutes les villes");
  const [selectedDepot, setSelectedDepot] = useState("Tous les dépôts");
  const [selectedProduct, setSelectedProduct] = useState("Tous les produits");
  const [selectedPeriod, setSelectedPeriod] = useState(generatePeriodOptions()[0]);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDates, setShowCustomDates] = useState(false);

  const userName = localStorage.getItem('userName') || 'Marketer';

  useEffect(() => {
    loadDashboardData();
  }, [selectedRegion, selectedDepot, selectedProduct, selectedPeriod, customStartDate, customEndDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load filter metadata first
      const [regionsData, depotsData, productsData] = await Promise.all([
        stockApi.getRegions(),
        stockApi.getDepots(),
        stockApi.getProducts(),
      ]);
      setRegions(regionsData);
      setDepots(depotsData);
      setProducts(productsData);

      // Build filter parameters
      const params = {};
      if (selectedRegion !== "Toutes les villes") {
        const region = regionsData.find(r => r.name === selectedRegion || String(r.code) === selectedRegion);
        if (region) params.city_id = region.code;
      }
      if (selectedDepot !== "Tous les dépôts") {
        const depot = depotsData.find(d => d.name === selectedDepot || d.code === selectedDepot);
        if (depot) params.depot_code = depot.code;
      }
      if (selectedProduct !== "Tous les produits") {
        const product = productsData.find(p => p.name === selectedProduct || p.code === selectedProduct);
        if (product) params.product_code = product.code;
      }
      if (selectedPeriod !== "Personnalisée") {
        const dates = getPeriodDateRange(selectedPeriod);
        if (dates) {
          params.start_date = dates.start;
          params.end_date = dates.end;
        }
      }

      // Load summary with filters
      const summaryData = await stockApi.getSummary(params);
      setSummary(summaryData);

      // Load stock by product data
      const stockByProductParams = {};
      if (selectedDepot !== "Tous les dépôts") {
        const depot = depotsData.find(d => d.name === selectedDepot || d.code === selectedDepot);
        if (depot) stockByProductParams.depot_code = depot.code;
      }
      const stockByProductData = await stockApi.getStockByProduct(stockByProductParams);
      setStockByProduct(stockByProductData);

      // Load recent movements (unrestricted by period date range so user always sees latest movements)
      const movementParams = { page: 1, limit: 5 };
      if (selectedRegion !== "Toutes les villes") {
        const region = regionsData.find(r => r.name === selectedRegion || String(r.code) === selectedRegion);
        if (region) movementParams.city_id = region.code;
      }
      if (selectedDepot !== "Tous les dépôts") {
        const depot = depotsData.find(d => d.name === selectedDepot || d.code === selectedDepot);
        if (depot) movementParams.depot_code = depot.code;
      }
      if (selectedProduct !== "Tous les produits") {
        const product = productsData.find(p => p.name === selectedProduct || p.code === selectedProduct);
        if (product) movementParams.product_code = product.code;
      }

      const [receptionsData, exitsData] = await Promise.all([
        receptionsApi.getReceptions(movementParams),
        exitsApi.getExits(movementParams),
      ]);
      setRecentReceptions(receptionsData.items || []);
      setRecentExits(exitsData.items || []);

      // Load full dataset for chart (without date filtering since backend doesn't support it)
      const chartParams = {
        page: 1,
        limit: 10000,
      };
      
      // Apply region/depot/product filters to chart data as well
      if (selectedRegion !== "Toutes les villes") {
        const region = regionsData.find(r => r.name === selectedRegion || String(r.code) === selectedRegion);
        if (region) chartParams.city_id = region.code;
      }
      if (selectedDepot !== "Tous les dépôts") {
        const depot = depotsData.find(d => d.name === selectedDepot || d.code === selectedDepot);
        if (depot) chartParams.depot_code = depot.code;
      }
      if (selectedProduct !== "Tous les produits") {
        const product = productsData.find(p => p.name === selectedProduct || p.code === selectedProduct);
        if (product) chartParams.product_code = product.code;
      }

      const [allReceptionsData, allExitsData] = await Promise.all([
        receptionsApi.getReceptions(chartParams),
        exitsApi.getExits(chartParams),
      ]);
      
      // Filter data on frontend based on selected period
      const dates = getPeriodDateRange(selectedPeriod, customStartDate, customEndDate);
      const startDate = dates ? new Date(dates.start) : new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
      const endDate = dates ? new Date(dates.end) : new Date();
      
      const filteredReceptions = (allReceptionsData.items || []).filter(r => {
        const dateStr = r.receptionDate || r.dateRec || r.date;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date >= startDate && date <= endDate;
      });
      
      const filteredExits = (allExitsData.items || []).filter(e => {
        const dateStr = e.exitDate || e.dateSortie || e.date;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date >= startDate && date <= endDate;
      });
      
      setAllReceptions(filteredReceptions);
      setAllExits(filteredExits);

      // Calculate chart bars from filtered data
      const calculatedBars = calculateMonthlyBars(
        filteredReceptions,
        filteredExits,
        selectedPeriod
      );
      setMonthlyBars(calculatedBars);

      // Calculate evaluation data
      const calculatedEvaluation = calculateEvaluationData(
        filteredReceptions,
        filteredExits
      );
      setEvaluationData(calculatedEvaluation);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'region') setSelectedRegion(value);
    if (filterType === 'depot') setSelectedDepot(value);
    if (filterType === 'product') setSelectedProduct(value);
    if (filterType === 'period') {
      setSelectedPeriod(value);
      setShowCustomDates(value === 'Personnalisée');
    }
    loadDashboardData();
  };

  const KPI_CARDS = summary ? [
    { label: "Stock disponible", value: summary.totalItems?.toLocaleString() || "0", note: "Total items", noteClass: "text-primary" },
    { label: "Entrées du mois", value: recentReceptions.length?.toLocaleString() || "0", note: "Réceptions récentes", noteClass: "text-muted-foreground" },
    { label: "Sorties du mois", value: recentExits.length?.toLocaleString() || "0", note: "Expéditions récentes", noteClass: "text-muted-foreground" },
    { label: "Dépôts surveillés", value: summary.totalDepots?.toLocaleString() || "0", note: `${summary.totalRegions || 0} villes`, noteClass: "text-muted-foreground" },
  ] : [];

  const regionOptions = ["Toutes les villes", ...regions.map(r => r.name || r.code)];
  const depotOptions = ["Tous les dépôts", ...depots.map(d => d.name || d.code)];
  const productOptions = ["Tous les produits", ...products.map(p => p.name || p.code)];
  const periodOptions = generatePeriodOptions();

  const FILTERS = [
    {
      label: "Toutes les villes",
      options: regionOptions,
      value: selectedRegion,
      onChange: (value) => handleFilterChange('region', value),
    },
    {
      label: "Tous les dépôts",
      options: depotOptions,
      value: selectedDepot,
      onChange: (value) => handleFilterChange('depot', value),
    },
    {
      label: periodOptions[0],
      options: periodOptions,
      value: selectedPeriod,
      onChange: (value) => handleFilterChange('period', value),
    },
    {
      label: "Tous les produits",
      options: productOptions,
      value: selectedProduct,
      onChange: (value) => handleFilterChange('product', value),
    },
  ];

  const movements = [
    ...recentReceptions.map(r => {
      const dStr = r.receptionDate || r.dateRec || r.date;
      const parsedDate = dStr ? new Date(dStr) : null;
      const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
      const qtyVal = r.quantity || r.qteTA || 0;
      return {
        date: isValidDate ? parsedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
        location: `${r.depotName || r.depotCode || 'Dépôt S.C.D.P.'}`,
        product: r.productName || r.productCode || 'GPL',
        type: "Entrée",
        qty: `+${Number(qtyVal).toLocaleString('fr-FR')} L`,
        timestamp: isValidDate ? parsedDate.getTime() : 0
      };
    }),
    ...recentExits.map(e => {
      const dStr = e.exitDate || e.dateSortie || e.date;
      const parsedDate = dStr ? new Date(dStr) : null;
      const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
      const qtyVal = e.quantity || e.qteSortie || 0;
      return {
        date: isValidDate ? parsedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
        location: `${e.depotName || e.depotCode || 'Dépôt S.C.D.P.'}`,
        product: e.productName || e.productCode || 'GPL',
        type: "Sortie",
        qty: `-${Number(qtyVal).toLocaleString('fr-FR')} L`,
        timestamp: isValidDate ? parsedDate.getTime() : 0
      };
    })
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  return (
    <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
      <style>{theme}</style>

      <div className="flex flex-1">
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {/* Header */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary tracking-wide">
                Bonjour, {userName}
              </p>
              <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight text-balance">
                Suivi opérationnel des stocks 
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
                Visualisez vos niveaux de stock et les mouvements de vos dépôts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="filter-btn flex min-h-11 items-center gap-2.5 rounded-xl border border-border bg-card px-4 text-sm font-medium shadow-soft">
                <IconPlaceholder className="text-primary" />
                {selectedPeriod}
              </button>
              <button className="filter-btn flex size-11 items-center justify-center rounded-xl border border-border bg-card shadow-soft">
                <IconPlaceholder className="text-lg" />
              </button>
            </div>
          </header>

          {/* Filters */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2.5 mb-4">
            <IconPlaceholder className="text-primary" />
            <h2 className="text-lg font-heading font-semibold tracking-tight">
              Filtres de consultation
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FILTERS.map((filter) => (
              <div key={filter.label} className="relative">
                <select
                  className="filter-btn flex min-h-11 w-full appearance-none items-center justify-between rounded-xl border border-input bg-background px-4 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {/* Icône flèche */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <IconPlaceholder />
                </div>
              </div>
            ))}
          </div>

          {/* Custom date pickers for Personnalisée */}
          {showCustomDates && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold block mb-2">Date de début</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full min-h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Date de fin</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full min-h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
        </section>

          {/* KPI cards */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Chargement des données...
              </div>
            ) : (
              KPI_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="shadow-soft shadow-soft-hover rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <IconPlaceholder className="text-xl text-primary" />
                  </div>
                  <p className="mt-3 text-2xl md:text-3xl font-heading font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className={`mt-1.5 text-xs font-medium ${card.noteClass}`}>{card.note}</p>
                </div>
              ))
            )}
          </section>

          {/* Chart + product breakdown */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft xl:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-heading font-semibold tracking-tight">
                    Évolution mensuelle
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entrées et sorties de GPL en litres
                  </p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <i className="size-2.5 rounded-full bg-primary inline-block" />
                    Entrées
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-2.5 rounded-full bg-tertiary inline-block" />
                    Sorties
                  </span>
                </div>
              </div>

              <div className="mt-8 grid h-56 grid-cols-6 items-end gap-3 sm:gap-4 border-b border-border px-1 sm:px-3">
                {monthlyBars.length > 0 ? monthlyBars.map((bar) => (
                  <div key={bar.label} className="flex h-full flex-col justify-end gap-1">
                    <div className="bar-in" style={{ height: `${bar.in}px` }} />
                    <div className="bar-out" style={{ height: `${bar.out}px` }} />
                  </div>
                )) : (
                  <div className="col-span-6 flex items-center justify-center text-muted-foreground text-sm">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-6 text-center text-xs text-muted-foreground font-medium">
                {monthlyBars.length > 0 ? monthlyBars.map((bar) => (
                  <span key={bar.label}>{bar.label}</span>
                )) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Stock par produit
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Répartition actuelle</p>
              <div className="mt-8 space-y-7">
                {stockByProduct.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Aucune donnée de stock disponible
                  </div>
                ) : (
                  stockByProduct.map((product, index) => (
                    <div key={product.code}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{product.name}</span>
                        <span className={`font-semibold ${index === 0 ? 'text-primary' : 'text-tertiary'}`}>
                          {product.quantity.toLocaleString('fr-FR')} {product.unitOfMeasure || 'L'}
                        </span>
                      </div>
                      <div className="h-3.5 overflow-hidden rounded-full progress-track">
                        <div 
                          className={`h-full rounded-full ${index === 0 ? 'progress-fill' : 'progress-fill-tertiary'}`} 
                          style={{ width: `${Math.min(product.percentage, 100)}%` }} 
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{product.percentage}% du stock total</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Évaluation mensuelle */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-semibold tracking-tight">
                    Évaluation mensuelle
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Performance des entrées et sorties
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                  <IconPlaceholder className="text-xl text-primary" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {evaluationData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Aucune donnée d'évaluation disponible
                  </div>
                ) : (
                  evaluationData.map((evaluation, index) => (
                    <div key={`${evaluation.month}-${evaluation.year}`} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium text-muted-foreground">
                        {evaluation.month}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Entrées: {evaluation.totalIn.toLocaleString()} L
                          </span>
                          <span className="text-muted-foreground">
                            Sorties: {evaluation.totalOut.toLocaleString()} L
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${evaluation.performance}%`,
                              backgroundColor: evaluation.trend === 'up' ? 'var(--primary)' : 'var(--tertiary)'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            Performance: {evaluation.performance}%
                          </span>
                          <span className={`text-xs font-medium ${evaluation.trend === 'up' ? 'text-primary' : 'text-tertiary'}`}>
                            {evaluation.trend === 'up' ? '↑ Positif' : '↓ Négatif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Recent movements */}
          <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 pb-5">
              <div>
                <h2 className="text-lg font-heading font-semibold tracking-tight">
                  Mouvements récents
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dernières opérations sur vos dépôts
                </p>
              </div>
              <button className="min-h-11 rounded-xl px-4 text-sm font-semibold text-primary hover:bg-secondary transition-colors">
                Voir les entrées
              </button>
            </div>
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Ville / dépôt</th>
                    <th className="px-6 py-3.5">Produit</th>
                    <th className="px-6 py-3.5">Mouvement</th>
                    <th className="px-6 py-3.5 text-right">Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                        Chargement des mouvements...
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                        Aucun mouvement récent
                      </td>
                    </tr>
                  ) : (
                    movements.map((m, i) => (
                      <tr key={i} className="table-row border-t border-border">
                        <td className="px-6 py-4 text-muted-foreground">{m.date}</td>
                        <td className="px-6 py-4">{m.location}</td>
                        <td className="px-6 py-4">{m.product}</td>
                        <td className="px-6 py-4">
                          <span
                            className={
                              m.type === "Entrée"
                                ? "inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary"
                                : "inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-foreground"
                            }
                          >
                            {m.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">{m.qty}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}