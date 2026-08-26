import React from "react";

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

const FILTERS = ["Tous les marketers", "Toutes les villes", "Tous les dépôts", "Août 2026"];

const KPI_CARDS = [
  { label: "Marketers actifs", value: "12", note: "+2 ce mois", noteClass: "text-primary" },
  { label: "Stock total GPL", value: "18 420 t", note: "Tous dépôts confondus", noteClass: "text-muted-foreground" },
  { label: "Sorties du mois", value: "6 850 t", note: "124 mouvements", noteClass: "text-muted-foreground" },
  { label: "Consommation", value: "6 210 t", note: "Stock restant 12 210 t", noteClass: "text-muted-foreground" },
];

const monthlyBars = [
  { in: 110, out: 78, label: "Mar" },
  { in: 140, out: 95, label: "Avr" },
  { in: 125, out: 105, label: "Mai" },
  { in: 165, out: 120, label: "Juin" },
  { in: 150, out: 110, label: "Juil" },
  { in: 180, out: 135, label: "Août" },
];

const TOP_MARKETERS = [
  { name: "TotalEnergies", stock: "4 820 t", conso: "1 640 t", share: "28%" },
  { name: "Trafigura", stock: "3 150 t", conso: "1 120 t", share: "18%" },
  { name: "Vitol", stock: "2 890 t", conso: "980 t", share: "16%" },
  { name: "Ola Energy", stock: "2 410 t", conso: "870 t", share: "14%" },
];

const RECENT = [
  { date: "28/08/2026", marketer: "TotalEnergies", depot: "Douala · Bonabéri", type: "Sortie", qty: "240 t" },
  { date: "27/08/2026", marketer: "Trafigura", depot: "Yaoundé · Nsam", type: "Consommation", qty: "95 t" },
  { date: "26/08/2026", marketer: "Vitol", depot: "Kribi · Port", type: "Sortie", qty: "180 t" },
];

export default function AdminDashboard() {
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
          <button className="filter-btn flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium shadow-soft">
            Août 2026
          </button>
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

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_CARDS.map((c) => (
            <div key={c.label} className="shadow-soft shadow-soft-hover rounded-2xl border border-border bg-card p-6">
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
                <h2 className="text-lg font-heading font-semibold">Évolution mensuelle</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sorties et consommations (tonnes)</p>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-primary inline-block" /> Sorties</span>
                <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-tertiary inline-block" /> Consommation</span>
              </div>
            </div>
            <div className="mt-8 grid h-56 grid-cols-6 items-end gap-3 border-b border-border px-2">
              {monthlyBars.map((b) => (
                <div key={b.label} className="flex h-full flex-col justify-end gap-1">
                  <div className="bar-in" style={{ height: `${b.in}px` }} />
                  <div className="bar-out" style={{ height: `${b.out}px` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-6 text-center text-xs text-muted-foreground font-medium">
              {monthlyBars.map((b) => <span key={b.label}>{b.label}</span>)}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Top marketers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Par consommation (août)</p>
            <div className="mt-6 space-y-5">
              {TOP_MARKETERS.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{m.name}</span>
                    <span className="font-semibold text-primary">{m.conso}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill" style={{ width: m.share }} />
                  </div>
                </div>
              ))}
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