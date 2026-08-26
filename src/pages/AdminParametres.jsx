import React, { useState } from "react";

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
  .bg-muted { background-color: var(--muted); } .bg-primary { background-color: var(--primary); color: var(--primary-foreground); }
  .text-primary { color: var(--primary-text); } .text-muted-foreground { color: var(--muted-foreground); }
  .border-border { border-color: var(--border); } .border-input { border-color: var(--input); }
  .rounded-2xl { border-radius: 1.25rem; } .rounded-xl { border-radius: var(--radius); }
  .shadow-soft { box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04); }
  .filter-btn:hover { border-color: var(--primary); background-color: var(--secondary); }
  .toggle-track {
    display: flex; align-items: center; height: 1.75rem; width: 3.25rem;
    border-radius: 9999px; padding: 0.2rem; transition: background-color 0.2s ease;
    cursor: pointer; border: none; flex-shrink: 0;
  }
  .toggle-thumb {
    height: 1.35rem; width: 1.35rem; border-radius: 9999px; background-color: var(--card);
    transition: transform 0.2s ease; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
  }
`;

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="toggle-track"
      style={{
        backgroundColor: checked ? "var(--primary)" : "var(--secondary)",
        justifyContent: checked ? "flex-end" : "flex-start",
      }}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

export default function AdminParametres() {
  const [alerts, setAlerts] = useState({
    globalLowStock: true,
    dailySummary: true,
    weeklyReport: false,
  });

  const toggle = (key) => setAlerts((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="gpl-dashboard min-h-screen w-full">
      <style>{theme}</style>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <header>
          <p className="text-sm font-medium text-primary tracking-wide">Administration</p>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">Paramètres</h1>
          <p className="mt-2 text-sm text-muted-foreground">Configuration globale et seuils d’alerte.</p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Alertes globales</h2>
            <p className="mt-1 text-sm text-muted-foreground">Notifications pour l’équipe d’exploitation</p>
            <div className="mt-6 divide-y divide-border">
              <div className="flex items-center justify-between gap-5 py-5">
                <div>
                  <p className="text-sm font-semibold">Stock bas global</p>
                  <p className="mt-1 text-sm text-muted-foreground">Alerte si un dépôt passe sous le seuil critique</p>
                </div>
                <Toggle checked={alerts.globalLowStock} onChange={() => toggle("globalLowStock")} label="Stock bas" />
              </div>
              <div className="flex items-center justify-between gap-5 py-5">
                <div>
                  <p className="text-sm font-semibold">Synthèse quotidienne</p>
                  <p className="mt-1 text-sm text-muted-foreground">Résumé des mouvements de la veille</p>
                </div>
                <Toggle checked={alerts.dailySummary} onChange={() => toggle("dailySummary")} label="Synthèse" />
              </div>
              <div className="flex items-center justify-between gap-5 py-5">
                <div>
                  <p className="text-sm font-semibold">Rapport hebdomadaire</p>
                  <p className="mt-1 text-sm text-muted-foreground">Envoi automatique chaque lundi</p>
                </div>
                <Toggle checked={alerts.weeklyReport} onChange={() => toggle("weeklyReport")} label="Rapport" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Seuils & unités</h2>
            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold">Seuil stock bas (tonnes)</label>
                <input
                  type="number"
                  defaultValue={500}
                  className="mt-2 flex min-h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Unité d’affichage</label>
                <button className="filter-btn mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-4 text-sm">
                  <span>Tonnes (t)</span>
                </button>
              </div>
              <button className="mt-2 min-h-11 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft">
                Enregistrer
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}