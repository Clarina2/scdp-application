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
  .bg-muted { background-color: var(--muted); } .bg-accent { background-color: #DDEFD9; }
  .text-primary { color: var(--primary-text); } .text-muted-foreground { color: var(--muted-foreground); }
  .border-border { border-color: var(--border); } .border-input { border-color: var(--input); }
  .rounded-2xl { border-radius: 1.25rem; } .rounded-xl { border-radius: var(--radius); }
  .shadow-soft { box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04); }
  .table-row:hover { background-color: var(--muted); }
  .filter-btn:hover { border-color: var(--primary); background-color: var(--secondary); }
`;

const FILTERS = ["Tous les marketers", "Toutes les villes", "Tous les dépôts", "Août 2026"];

const MOVEMENTS = [
  { date: "28/08/2026", ref: "MOV-0828-124", marketer: "TotalEnergies", depot: "Douala · Bonabéri", type: "Sortie", qty: "240 t", status: "Validée" },
  { date: "27/08/2026", ref: "MOV-0827-123", marketer: "Trafigura", depot: "Yaoundé · Nsam", type: "Consommation", qty: "95 t", status: "Validée" },
  { date: "26/08/2026", ref: "MOV-0826-122", marketer: "Vitol", depot: "Kribi · Port", type: "Sortie", qty: "180 t", status: "Validée" },
  { date: "25/08/2026", ref: "MOV-0825-121", marketer: "Ola Energy", depot: "Bafoussam", type: "Consommation", qty: "110 t", status: "Validée" },
  { date: "24/08/2026", ref: "MOV-0824-120", marketer: "TotalEnergies", depot: "Garoua · Nord", type: "Sortie", qty: "155 t", status: "Validée" },
];

export default function AdminMouvements() {
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
          <button className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft">
            Exporter
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
                {MOVEMENTS.map((m) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}