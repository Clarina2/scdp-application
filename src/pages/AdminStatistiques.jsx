import React from "react";

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

const BY_CITY = [
  { city: "Douala", qty: "2 450 t", width: "85%" },
  { city: "Yaoundé", qty: "1 820 t", width: "63%" },
  { city: "Kribi", qty: "1 210 t", width: "42%" },
  { city: "Bafoussam", qty: "980 t", width: "34%" },
  { city: "Garoua", qty: "750 t", width: "26%" },
];

const BY_MARKETER = [
  { name: "TotalEnergies", qty: "1 640 t", width: "28%" },
  { name: "Trafigura", qty: "1 120 t", width: "19%" },
  { name: "Vitol", qty: "980 t", width: "17%" },
  { name: "Ola Energy", qty: "870 t", width: "15%" },
  { name: "Autres", qty: "1 240 t", width: "21%" },
];

export default function AdminStatistiques() {
  return (
    <div className="gpl-dashboard min-h-screen w-full">
      <style>{theme}</style>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <header>
          <p className="text-sm font-medium text-primary tracking-wide">Administration</p>
          <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">Statistiques</h1>
          <p className="mt-2 text-sm text-muted-foreground">Analyse comparative des consommations et stocks.</p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Consommation par ville</h2>
            <p className="mt-1 text-sm text-muted-foreground">Août 2026</p>
            <div className="mt-8 space-y-5">
              {BY_CITY.map((c) => (
                <div key={c.city}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{c.city}</span>
                    <span className="font-semibold text-primary">{c.qty}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill" style={{ width: c.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-heading font-semibold">Consommation par marketer</h2>
            <p className="mt-1 text-sm text-muted-foreground">Août 2026</p>
            <div className="mt-8 space-y-5">
              {BY_MARKETER.map((m) => (
                <div key={m.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{m.name}</span>
                    <span className="font-semibold text-primary">{m.qty}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full progress-track">
                    <div className="h-full rounded-full progress-fill" style={{ width: m.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}