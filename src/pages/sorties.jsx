// import React from "react";

// /**
//  * GPL Track — Sorties de GPL
//  * Converted from static HTML to a single-file React component.
//  * Same token/utility-class approach as the dashboard conversion.
//  */

// const theme = `
//   :root {
//     --background: #FFFFFF;
//     --foreground: #173225;
//     --primary: #2F7D32;
//     --primary-foreground: #FFFFFF;
//     --secondary: #EAF4EA;
//     --secondary-foreground: #173225;
//     --tertiary: #6AA84F;
//     --tertiary-foreground: #323131;
//     --muted: #F5F8F5;
//     --muted-foreground: #657467;
//     --accent: #DDEFD9;
//     --accent-foreground: #173225;
//     --card: #FFFFFF;
//     --card-foreground: #173225;
//     --destructive: #C63D3D;
//     --destructive-foreground: #FFFFFF;
//     --border: #DCE7DD;
//     --input: #DCE7DD;
//     --ring: #2F7D32;
//     --radius: 0.75rem;
//     --radius-sm: calc(var(--radius) - 4px);
//     --radius-md: calc(var(--radius) - 2px);
//     --radius-lg: var(--radius);
//     --font-sans: Inter, sans-serif;
//     --font-heading: Inter, sans-serif;
//     --font-mono: "JetBrains Mono", monospace;
//     --shadow-color: rgba(15, 23, 42, 0.12);

//     --primary-text: #256A28;
//     --secondary-text: #707971;
//     --tertiary-text: #48852B;
//     --accent-text: #6B7B68;
//     --destructive-text: #C63D3D;
//   }

//   .gpl-dashboard {
//     background: var(--background);
//     color: var(--foreground);
//     font-family: var(--font-sans);
//   }

//   .gpl-dashboard h1,
//   .gpl-dashboard h2,
//   .gpl-dashboard h3 {
//     font-family: var(--font-heading);
//   }

//   /* Surfaces */
//   .bg-background { background-color: var(--background); }
//   .bg-card { background-color: var(--card); color: var(--card-foreground); }
//   .bg-primary { background-color: var(--primary); color: var(--primary-foreground); }
//   .bg-secondary { background-color: var(--secondary); color: var(--secondary-foreground); }
//   .bg-tertiary { background-color: var(--tertiary); color: var(--tertiary-foreground); }
//   .bg-accent { background-color: var(--accent); color: var(--accent-foreground); }
//   .bg-muted { background-color: var(--muted); }
//   .bg-destructive { background-color: var(--destructive); color: var(--destructive-foreground); }

//   /* Text (legibility-adjusted variants) */
//   .text-foreground { color: var(--foreground); }
//   .text-primary { color: var(--primary-text); }
//   .text-primary-foreground { color: var(--primary-foreground); }
//   .text-secondary { color: var(--secondary-text); }
//   .text-secondary-foreground { color: var(--secondary-foreground); }
//   .text-tertiary { color: var(--tertiary-text); }
//   .text-accent { color: var(--accent-text); }
//   .text-muted-foreground { color: var(--muted-foreground); }
//   .text-card-foreground { color: var(--card-foreground); }
//   .text-destructive { color: var(--destructive-text); }

//   /* Borders / inputs / radius */
//   .border-border { border-color: var(--border); }
//   .border-input { border-color: var(--input); }
//   .rounded-xl { border-radius: var(--radius-lg); }
//   .rounded-lg { border-radius: var(--radius-md); }

//   .shadow-theme {
//     box-shadow: 0 10px 30px -8px var(--shadow-color);
//   }

//   .brand-gradient {
//     background-image: linear-gradient(135deg, var(--primary), var(--accent));
//   }
// `;

// function IconPlaceholder({ className = "" }) {
//   return <span className={`inline-block ${className}`} aria-hidden="true" />;
// }

// const NAV_ITEMS = [
//   { label: "Tableau de bord", active: false },
//   { label: "Entrées", active: false },
//   { label: "Sorties", active: true },
//   { label: "Profil", active: false },
//   { label: "Paramètres", active: false },
// ];

// const FILTERS = ["Toutes les villes", "Tous les dépôts", "Août 2026", "Super & Gasoil"];

// const KPI_CARDS = [
//   {
//     label: "Volume expédié",
//     value: "1 285 t",
//     note: "+5% sur juillet",
//     noteClass: "text-primary",
//   },
//   {
//     label: "Expéditions",
//     value: "38",
//     note: "Vers 4 villes",
//     noteClass: "text-muted-foreground",
//   },
//   {
//     label: "Dépôt le plus actif",
//     value: "Bonabéri",
//     note: "410 t sorties",
//     noteClass: "text-muted-foreground",
//   },
// ];

// const DEPOT_OUTPUTS = [
//   { depot: "Douala · Bonabéri", qty: "410 t", width: "83%" },
//   { depot: "Yaoundé · Nsam", qty: "335 t", width: "67%" },
//   { depot: "Kribi · Port", qty: "290 t", width: "60%" },
//   { depot: "Bafoussam · Marché A", qty: "250 t", width: "50%" },
// ];

// const PRODUCT_SPLIT = [
//   { label: "Super", value: "745 t", note: "58% des sorties", surface: "bg-secondary", labelClass: "text-secondary-foreground", noteClass: "text-primary" },
//   { label: "Gasoil", value: "540 t", note: "42% des sorties", surface: "bg-muted", labelClass: "text-muted-foreground", noteClass: "text-muted-foreground" },
// ];

// const SHIPMENTS = [
//   { date: "28/08/2026", ref: "SOR-0828-038", city: "Douala", depot: "Bonabéri", product: "Super", qty: "125 t", status: "Expédiée" },
//   { date: "27/08/2026", ref: "SOR-0827-037", city: "Yaoundé", depot: "Nsam", product: "Gasoil", qty: "95 t", status: "Expédiée" },
//   { date: "25/08/2026", ref: "SOR-0825-036", city: "Kribi", depot: "Port", product: "Super", qty: "110 t", status: "Expédiée" },
// ];

// export default function SortiesGPL() {
//   return (
//     <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
//       <style>{theme}</style>

//       <div className="flex flex-1">
//         {/* Sidebar */}

//         {/* Main */}
//         <main className="flex-1 p-8">
//           <header className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-primary">Mouvements sortants</p>
//               <h1 className="mt-1 text-2xl font-heading font-bold text-balance">Sorties de GPL</h1>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Analysez les expéditions par ville, dépôt, mois et produit.
//               </p>
//             </div>
//             <button className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold">
//               <IconPlaceholder />
//               Exporter
//             </button>
//           </header>

//           {/* Filters */}
//           <section className="mt-7 rounded-xl border border-border bg-card p-5">
//             <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
//               {FILTERS.map((filter) => (
//                 <button
//                   key={filter}
//                   className="flex min-h-11 items-center justify-between rounded-lg border border-input px-3 text-sm"
//                 >
//                   <span>{filter}</span>
//                   <IconPlaceholder />
//                 </button>
//               ))}
//             </div>
//           </section>

//           {/* KPI cards */}
//           <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
//             {KPI_CARDS.map((card) => (
//               <div key={card.label} className="rounded-xl border border-border bg-card p-5">
//                 <p className="text-sm text-muted-foreground">{card.label}</p>
//                 <p className="mt-2 text-2xl font-heading font-bold">{card.value}</p>
//                 <p className={`mt-1 text-xs ${card.noteClass}`}>{card.note}</p>
//               </div>
//             ))}
//           </section>

//           {/* Depot breakdown + product split */}
//           <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
//             <div className="rounded-xl border border-border bg-card p-6 xl:col-span-2">
//               <h2 className="text-lg font-heading font-semibold">Sorties par dépôt</h2>
//               <p className="mt-1 text-sm text-muted-foreground">Volumes expédiés durant le mois</p>
//               <div className="mt-7 space-y-5">
//                 {DEPOT_OUTPUTS.map((d) => (
//                   <div key={d.depot}>
//                     <div className="flex justify-between text-sm">
//                       <span>{d.depot}</span>
//                       <span className="font-semibold">{d.qty}</span>
//                     </div>
//                     <div className="mt-2 h-4 rounded-full bg-secondary">
//                       <div
//                         className="h-4 rounded-full bg-primary"
//                         style={{ width: d.width }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="rounded-xl border border-border bg-card p-6">
//               <h2 className="text-lg font-heading font-semibold">Sorties par produit</h2>
//               <div className="mt-7 space-y-6">
//                 {PRODUCT_SPLIT.map((p) => (
//                   <div key={p.label} className={`rounded-lg ${p.surface} p-4`}>
//                     <p className={`text-sm ${p.labelClass}`}>{p.label}</p>
//                     <p className="mt-1 text-2xl font-heading font-bold">{p.value}</p>
//                     <p className={`mt-1 text-xs ${p.noteClass}`}>{p.note}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           {/* History table */}
//           <section className="mt-6 rounded-xl border border-border bg-card">
//             <div className="p-6">
//               <h2 className="text-lg font-heading font-semibold">Historique des expéditions</h2>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Sorties enregistrées depuis les dépôts du marketer
//               </p>
//             </div>
//             <div className="overflow-x-auto border-t border-border">
//               <table className="w-full text-sm">
//                 <thead className="bg-muted text-left text-xs text-muted-foreground">
//                   <tr>
//                     <th className="px-6 py-3">Date</th>
//                     <th className="px-6 py-3">Référence</th>
//                     <th className="px-6 py-3">Ville</th>
//                     <th className="px-6 py-3">Dépôt</th>
//                     <th className="px-6 py-3">Produit</th>
//                     <th className="px-6 py-3 text-right">Quantité</th>
//                     <th className="px-6 py-3">Statut</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {SHIPMENTS.map((s) => (
//                     <tr key={s.ref} className="border-t border-border">
//                       <td className="px-6 py-4">{s.date}</td>
//                       <td className="px-6 py-4 font-medium">{s.ref}</td>
//                       <td className="px-6 py-4">{s.city}</td>
//                       <td className="px-6 py-4">{s.depot}</td>
//                       <td className="px-6 py-4">{s.product}</td>
//                       <td className="px-6 py-4 text-right font-semibold">{s.qty}</td>
//                       <td className="px-6 py-4">
//                         <span className="rounded-full bg-accent px-2 py-1 text-xs font-semibold text-foreground">
//                           {s.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }   

import React from "react";

/**
 * GPL Track — Sorties de GPL
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

  .table-row { transition: background-color 0.15s ease; }
  .table-row:hover { background-color: var(--muted); }

  .filter-btn { transition: all 0.2s ease; }
  .filter-btn:hover {
    border-color: var(--primary);
    background-color: var(--secondary);
  }

  .export-btn { transition: all 0.2s ease; }
  .export-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 6px 16px -4px rgba(47, 125, 50, 0.35);
  }
`;

function IconPlaceholder({ className = "" }) {
  return <span className={`inline-block ${className}`} aria-hidden="true" />;
}

const FILTERS = ["Toutes les villes", "Tous les dépôts", "Août 2026", "Super & Gasoil"];

const KPI_CARDS = [
  { label: "Volume expédié", value: "1 285 t", note: "+5% sur juillet", noteClass: "text-primary" },
  { label: "Expéditions", value: "38", note: "Vers 4 villes", noteClass: "text-muted-foreground" },
  { label: "Dépôt le plus actif", value: "Bonabéri", note: "410 t sorties", noteClass: "text-muted-foreground" },
];

const DEPOT_OUTPUTS = [
  { depot: "Douala · Bonabéri", qty: "410 t", width: "83%" },
  { depot: "Yaoundé · Nsam", qty: "335 t", width: "67%" },
  { depot: "Kribi · Port", qty: "290 t", width: "60%" },
  { depot: "Bafoussam · Marché A", qty: "250 t", width: "50%" },
];

const PRODUCT_SPLIT = [
  { label: "Super", value: "745 t", note: "58% des sorties", surface: "bg-secondary", labelClass: "text-secondary-foreground", noteClass: "text-primary" },
  { label: "Gasoil", value: "540 t", note: "42% des sorties", surface: "bg-muted", labelClass: "text-muted-foreground", noteClass: "text-muted-foreground" },
];

const SHIPMENTS = [
  { date: "28/08/2026", ref: "SOR-0828-038", city: "Douala", depot: "Bonabéri", product: "Super", qty: "125 t", status: "Expédiée" },
  { date: "27/08/2026", ref: "SOR-0827-037", city: "Yaoundé", depot: "Nsam", product: "Gasoil", qty: "95 t", status: "Expédiée" },
  { date: "25/08/2026", ref: "SOR-0825-036", city: "Kribi", depot: "Port", product: "Super", qty: "110 t", status: "Expédiée" },
];

export default function SortiesGPL() {
  return (
    <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
      <style>{theme}</style>

      <div className="flex flex-1">
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {/* Header */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary tracking-wide">
                Mouvements sortants
              </p>
              <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight text-balance">
                Sorties de GPL
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
                Analysez les expéditions par ville, dépôt, mois et produit.
              </p>
            </div>
            <button className="export-btn flex min-h-11 items-center gap-2.5 rounded-xl bg-primary px-5 text-sm font-semibold shadow-soft">
              <IconPlaceholder />
              Exporter
            </button>
          </header>

          {/* Filters */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  className="filter-btn flex min-h-11 items-center justify-between rounded-xl border border-input bg-background px-4 text-sm"
                >
                  <span className="truncate">{filter}</span>
                  <IconPlaceholder />
                </button>
              ))}
            </div>
          </section>

          {/* KPI cards */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KPI_CARDS.map((card) => (
              <div
                key={card.label}
                className="shadow-soft shadow-soft-hover rounded-2xl border border-border bg-card p-6"
              >
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">
                  {card.value}
                </p>
                <p className={`mt-1.5 text-xs font-medium ${card.noteClass}`}>{card.note}</p>
              </div>
            ))}
          </section>

          {/* Depot breakdown + product split */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft xl:col-span-2">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Sorties par dépôt
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Volumes expédiés durant le mois
              </p>
              <div className="mt-8 space-y-6">
                {DEPOT_OUTPUTS.map((d) => (
                  <div key={d.depot}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium">{d.depot}</span>
                      <span className="font-semibold text-primary">{d.qty}</span>
                    </div>
                    <div className="h-3.5 overflow-hidden rounded-full progress-track">
                      <div className="h-full rounded-full progress-fill" style={{ width: d.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Sorties par produit
              </h2>
              <div className="mt-7 space-y-4">
                {PRODUCT_SPLIT.map((p) => (
                  <div
                    key={p.label}
                    className={`rounded-xl ${p.surface} p-5 transition-transform duration-200 hover:scale-[1.02]`}
                  >
                    <p className={`text-sm font-medium ${p.labelClass}`}>{p.label}</p>
                    <p className="mt-1.5 text-2xl font-heading font-bold tracking-tight">
                      {p.value}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${p.noteClass}`}>{p.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* History table */}
          <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="p-6 pb-5">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Historique des expéditions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sorties enregistrées depuis les dépôts du marketer
              </p>
            </div>
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Référence</th>
                    <th className="px-6 py-3.5">Ville</th>
                    <th className="px-6 py-3.5">Dépôt</th>
                    <th className="px-6 py-3.5">Produit</th>
                    <th className="px-6 py-3.5 text-right">Quantité</th>
                    <th className="px-6 py-3.5">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {SHIPMENTS.map((s) => (
                    <tr key={s.ref} className="table-row border-t border-border">
                      <td className="px-6 py-4 text-muted-foreground">{s.date}</td>
                      <td className="px-6 py-4 font-medium">{s.ref}</td>
                      <td className="px-6 py-4">{s.city}</td>
                      <td className="px-6 py-4">{s.depot}</td>
                      <td className="px-6 py-4">{s.product}</td>
                      <td className="px-6 py-4 text-right font-semibold text-primary">{s.qty}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-foreground">
                          {s.status}
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
    </div>
  );
}