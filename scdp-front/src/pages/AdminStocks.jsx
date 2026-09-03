import React, { useState, useEffect } from "react";
import { stockApi, adminApi, exitsApi } from "../api/client";

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
  .bg-muted { background-color: var(--muted); }
  .text-primary { color: var(--primary-text); } .text-muted-foreground { color: var(--muted-foreground); }
  .border-border { border-color: var(--border); } .border-input { border-color: var(--input); }
  .rounded-2xl { border-radius: 1.25rem; } .rounded-xl { border-radius: var(--radius); }
  .shadow-soft { box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04); }
  .progress-track { background: linear-gradient(90deg, var(--secondary), #f0f7f0); }
  .progress-fill { background: linear-gradient(90deg, var(--primary), #4CAF50); }
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

export default function AdminStocks() {
  const periodOptions = generatePeriodOptions();
  const [loading, setLoading] = useState(true);
  const [depotStocks, setDepotStocks] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [cities, setCities] = useState([]);
  const [depots, setDepots] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  // Filter state
  const [selectedMarketer, setSelectedMarketer] = useState("Tous les marketers");
  const [selectedCity, setSelectedCity] = useState("Toutes les villes");
  const [selectedDepot, setSelectedDepot] = useState("Tous les dépôts");
  const [selectedProduct, setSelectedProduct] = useState("Tous les produits");
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0]);

  // Load metadata on mount only
  useEffect(() => {
    loadMetadata();
  }, []);

  // Reload stock data when filters change
  useEffect(() => {
    loadStockData();
  }, [selectedMarketer, selectedCity, selectedDepot, selectedProduct, selectedPeriod]);

  const loadMetadata = async () => {
    try {
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
      console.error("Failed to load metadata:", err);
    }
  };

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError("");

      // Build filter parameters
      const params = {};
      if (selectedMarketer !== "Tous les marketers") {
        const marketer = distributors.find(d => d.code === selectedMarketer || d.name === selectedMarketer);
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

      console.log('Loading stock data with params:', params);

      // Load stock data with filters
      const depotStockData = await adminApi.getDepotStockStatistics(params);

      console.log('Depot stock data received:', depotStockData);

      // Format depot stocks from real API data
      const formattedDepotStocks = depotStockData.map(ds => {
        const stock = ds.stock_volume || ds.total_stock || 0;

        return {
          depot: ds.depot_name || ds.depot_nom || ds.code_depot,
          ville: ds.city_name || ds.ville_nom || ds.code_ville,
          stock: `${Math.round(stock).toLocaleString('fr-FR')} L`,
          stockRaw: stock
        };
      });

      console.log('Formatted depot stocks:', formattedDepotStocks);

      setDepotStocks(formattedDepotStocks);
    } catch (err) {
      console.error("Failed to load stock data:", err);
      setError(err.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'marketer') setSelectedMarketer(value);
    if (filterType === 'city') setSelectedCity(value);
    if (filterType === 'depot') setSelectedDepot(value);
    if (filterType === 'product') setSelectedProduct(value);
    if (filterType === 'period') setSelectedPeriod(value);
  };

  // Generate filter options dynamically
  const FILTERS = [
    {
      label: "Tous les marketers",
      options: ["Tous les marketers", ...Array.from(new Set(distributors.map(d => d.code || d.name)))],
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
      options: ["Tous les dépôts", ...Array.from(new Set(depots.map(d => d.name || d.code)))],
      value: selectedDepot,
      onChange: (value) => handleFilterChange('depot', value),
    },
    {
      label: "Tous les produits",
      options: ["Tous les produits", ...Array.from(new Set(products.map(p => p.name || String(p.code))))],
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
        <header>
          <p className="text-sm font-medium text-primary tracking-wide">Administration</p>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">Stocks</h1>
          <p className="mt-2 text-sm text-muted-foreground">Niveaux de stock par dépôt et par ville.</p>
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
        </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft overflow-hidden">
          <h2 className="text-lg font-heading font-semibold">Stock par dépôt</h2>
          <p className="mt-1 text-sm text-muted-foreground">Volume de stock par dépôt</p>
          <div className="mt-8 space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {depotStocks.length > 0 ? depotStocks.map((d, index) => (
              <div key={`${d.depot}-${d.ville}-${index}`} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <span className="font-medium">{d.depot}</span>
                  <span className="ml-2 text-muted-foreground">· {d.ville}</span>
                </div>
                <span className="font-semibold text-primary">{d.stock}</span>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune donnée de stock disponible
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}