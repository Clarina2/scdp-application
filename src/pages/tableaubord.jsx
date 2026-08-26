 

import React from "react";

/**
 * GPL Track — Tableau de bord marketer
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

const monthlyBars = [
  { in: 96, out: 64, label: "Mar" },
  { in: 128, out: 80, label: "Avr" },
  { in: 112, out: 96, label: "Mai" },
  { in: 160, out: 112, label: "Juin" },
  { in: 144, out: 96, label: "Juil" },
  { in: 176, out: 128, label: "Août" },
];

const movements = [
  { date: "28 août 2026", location: "Douala · Bonabéri", product: "Super", type: "Entrée", qty: "+240 t" },
  { date: "27 août 2026", location: "Yaoundé · Nsam", product: "Gasoil", type: "Sortie", qty: "−95 t" },
  { date: "26 août 2026", location: "Kribi · Port", product: "Super", type: "Entrée", qty: "+180 t" },
];

function IconPlaceholder({ className = "" }) {
  return <span className={`inline-block ${className}`} aria-hidden="true" />;
}

const FILTERS = ["Toutes les villes", "Tous les dépôts", "Août 2026", "Super & Gasoil"];

const KPI_CARDS = [
  { label: "Stock disponible", value: "4 820 t", note: "+8,4% depuis juillet", noteClass: "text-primary" },
  { label: "Entrées du mois", value: "1 640 t", note: "24 réceptions validées", noteClass: "text-muted-foreground" },
  { label: "Sorties du mois", value: "1 285 t", note: "38 expéditions enregistrées", noteClass: "text-muted-foreground" },
  { label: "Dépôts surveillés", value: "6", note: "Dans 4 villes", noteClass: "text-muted-foreground" },
];

export default function GPLDashboard() {
  return (
    <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
      <style>{theme}</style>

      <div className="flex flex-1">
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {/* Header */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary tracking-wide">
                Bonjour, Espace marketer
              </p>
              <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight text-balance">
                Suivi opérationnel des stocks GPL
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
                Visualisez vos niveaux de stock et les mouvements de vos dépôts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="filter-btn flex min-h-11 items-center gap-2.5 rounded-xl border border-border bg-card px-4 text-sm font-medium shadow-soft">
                <IconPlaceholder className="text-primary" />
                Août 2026
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
                <button
                  key={filter}
                  className="filter-btn flex min-h-11 items-center justify-between rounded-xl border border-input bg-background px-4 text-left text-sm"
                >
                  <span className="truncate">{filter}</span>
                  <IconPlaceholder />
                </button>
              ))}
            </div>
          </section>

          {/* KPI cards */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPI_CARDS.map((card) => (
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
            ))}
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
                    Entrées et sorties de GPL en tonnes
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
                {monthlyBars.map((bar) => (
                  <div key={bar.label} className="flex h-full flex-col justify-end gap-1">
                    <div className="bar-in" style={{ height: `${bar.in}px` }} />
                    <div className="bar-out" style={{ height: `${bar.out}px` }} />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-6 text-center text-xs text-muted-foreground font-medium">
                {monthlyBars.map((bar) => (
                  <span key={bar.label}>{bar.label}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Stock par produit
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Répartition actuelle</p>
              <div className="mt-8 space-y-7">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Super</span>
                    <span className="font-semibold text-primary">2 940 t</span>
                  </div>
                  <div className="h-3.5 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill" style={{ width: "75%" }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">61% du stock total</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Gasoil</span>
                    <span className="font-semibold text-tertiary">1 880 t</span>
                  </div>
                  <div className="h-3.5 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill-tertiary" style={{ width: "50%" }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">39% du stock total</p>
                </div>
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
                  {movements.map((m, i) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}