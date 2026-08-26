import React from "react";

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

const FILTERS = ["Tous les marketers", "Toutes les villes", "Tous les dépôts", "Août 2026"];

const DEPOT_STOCKS = [
  { depot: "Douala · Bonabéri", ville: "Douala", stock: "5 120 t", capacity: "7 000 t", width: "73%" },
  { depot: "Yaoundé · Nsam", ville: "Yaoundé", stock: "4 280 t", capacity: "6 000 t", width: "71%" },
  { depot: "Kribi · Port", ville: "Kribi", stock: "3 650 t", capacity: "5 500 t", width: "66%" },
  { depot: "Bafoussam · Marché A", ville: "Bafoussam", stock: "2 910 t", capacity: "4 000 t", width: "73%" },
  { depot: "Garoua · Nord", ville: "Garoua", stock: "2 460 t", capacity: "3 800 t", width: "65%" },
];

export default function AdminStocks() {
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
            {FILTERS.map((f) => (
              <button key={f} className="filter-btn flex min-h-11 items-center justify-between rounded-xl border border-input bg-background px-4 text-sm">
                <span className="truncate">{f}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-heading font-semibold">Stock par dépôt</h2>
          <p className="mt-1 text-sm text-muted-foreground">Occupation des cuves</p>
          <div className="mt-8 space-y-6">
            {DEPOT_STOCKS.map((d) => (
              <div key={d.depot}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-medium">{d.depot}</span>
                    <span className="ml-2 text-muted-foreground">· {d.ville}</span>
                  </div>
                  <span className="font-semibold text-primary">{d.stock} <span className="text-muted-foreground font-normal">/ {d.capacity}</span></span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full progress-track">
                  <div className="h-full rounded-full progress-fill" style={{ width: d.width }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}