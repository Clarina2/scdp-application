import React, { useState, useEffect } from "react";
import { adminApi, exitsApi, receptionsApi } from "../api/client";

const theme = `
  :root {
    --background: #F7FAF7; --foreground: #173225; --primary: #2F7D32; --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA; --tertiary: #6AA84F; --muted: #F0F5F0; --muted-foreground: #657467;
    --card: #FFFFFF; --border: #E2EDE3; --input: #E2EDE3; --radius: 1rem;
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

const getPeriodDateRange = (period) => {
  if (!period) return null;
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

export default function AdminStatistiques() {
  const periodOptions = generatePeriodOptions();
  const [loading, setLoading] = useState(true);
  const [byCity, setByCity] = useState([]);
  const [byMarketer, setByMarketer] = useState([]);
  const [error, setError] = useState("");

  // Filter state
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0]);

  useEffect(() => {
    loadStatisticsData();
  }, [selectedPeriod]);

  const loadStatisticsData = async () => {
    try {
      setLoading(true);
      setError("");

      // Build filter parameters based on period
      const params = {};
      const dates = getPeriodDateRange(selectedPeriod);
      if (dates) {
        params.start_date = dates.start;
        params.end_date = dates.end;
      }

      // Get city and marketer statistics from real API
      const [cityStatsData, marketerStatsData] = await Promise.all([
        adminApi.getCityStatistics(params),
        adminApi.getMarketerStatistics(params),
      ]);

      // Process city statistics from real API data
      const cityStats = (cityStatsData || []).map((c) => ({
        city: c.city || c.code,
        qty: formatVolume(c.volume),
        width: `${c.percentage}%`
      }));

      // Process marketer statistics from real API data
      const marketerStats = (marketerStatsData || []).map((m) => ({
        name: m.name || m.code,
        qty: formatVolume(m.volume),
        width: `${m.percentage}%`
      }));

      setByCity(cityStats);
      setByMarketer(marketerStats);
    } catch (err) {
      console.error("Failed to load statistics data:", err);
      setError(err.message || "Failed to load statistics data");
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (num) => {
    if (num === null || num === undefined) return "0 L";
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(num))} L`;
  };

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
            <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">Statistiques</h1>
            <p className="mt-2 text-sm text-muted-foreground">Analyse comparative des consommations et stocks.</p>
          </div>
          <select
            className="filter-btn flex min-h-11 items-center justify-between rounded-xl border border-input bg-background px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {periodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Consommation par ville</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selectedPeriod}</p>
            <div className="mt-8 space-y-5">
              {byCity.length > 0 ? byCity.map((c) => (
                <div key={c.city}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{c.city}</span>
                    <span className="font-semibold text-primary">{c.qty}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill" style={{ width: c.width }} />
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-muted-foreground">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Consommation par marketer</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selectedPeriod}</p>
            <div className="mt-8 space-y-5 max-h-96 overflow-y-auto pr-2">
              {byMarketer.length > 0 ? byMarketer.map((m) => (
                <div key={m.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{m.name}</span>
                    <span className="font-semibold text-primary">{m.qty}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill" style={{ width: m.width }} />
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-muted-foreground">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}