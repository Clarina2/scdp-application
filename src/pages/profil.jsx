// import React from "react";

// /**
//  * GPL Track — Profil
//  * Converted from static HTML to a single-file React component.
//  * Same token/utility-class approach as the other GPL Track pages.
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
//   { label: "Sorties", active: false },
//   { label: "Profil", active: true },
//   { label: "Paramètres", active: false },
// ];

// const CONTACT_INFO = [
//   { icon: "mail", label: "operations@totalenergies.cm" },
//   { icon: "phone", label: "+237 233 42 18 00" },
//   { icon: "map-pin", label: "Douala, Cameroun" },
// ];

// const ORG_INFO = [
//   { label: "Raison sociale", value: "TotalEnergies Cameroun SA" },
//   { label: "Code marketer", value: "MKT-CM-0048" },
//   { label: "Responsable opérations", value: "Estelle Ndzié" },
//   { label: "Statut", value: "Actif", badge: true },
// ];

// const DEPOTS = [
//   { name: "Bonabéri", location: "Douala · Super & Gasoil" },
//   { name: "Nsam", location: "Yaoundé · Super & Gasoil" },
//   { name: "Port de Kribi", location: "Kribi · Super & Gasoil" },
// ];

// export default function Profil() {
//   return (
//     <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
//       <style>{theme}</style>

//       <div className="flex flex-1">
//         {/* Sidebar */}
      

//         {/* Main */}
//         <main className="flex-1 p-8">
//           <header>
//             <p className="text-sm font-medium text-primary">Compte marketer</p>
//             <h1 className="mt-1 text-2xl font-heading font-bold">Profil</h1>
//             <p className="mt-2 text-sm text-muted-foreground">
//               Gérez les informations et le périmètre opérationnel de votre compte.
//             </p>
//           </header>

//           {/* Identity + org info */}
//           <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-3">
//             <div className="rounded-xl border border-border bg-card p-6 xl:col-span-1">
//               <div className="flex size-20 items-center justify-center rounded-full bg-secondary text-2xl font-heading font-bold text-primary">
//                 TE
//               </div>
//               <h2 className="mt-5 text-lg font-heading font-semibold">TotalEnergies Cameroun</h2>
//               <p className="mt-1 text-sm text-muted-foreground">Compte marketer actif</p>
//               <div className="mt-6 space-y-4 border-t border-border pt-5 text-sm">
//                 {CONTACT_INFO.map((c) => (
//                   <div key={c.label} className="flex items-center gap-3">
//                     <IconPlaceholder className="text-primary" />
//                     <span>{c.label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="rounded-xl border border-border bg-card p-6 xl:col-span-2">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-lg font-heading font-semibold">
//                     Informations de l’organisation
//                   </h2>
//                   <p className="mt-1 text-sm text-muted-foreground">
//                     Données de référence du marketer
//                   </p>
//                 </div>
//                 <button className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-primary">
//                   Modifier
//                 </button>
//               </div>
//               <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
//                 {ORG_INFO.map((info) => (
//                   <div key={info.label}>
//                     <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
//                       {info.label}
//                     </p>
//                     {info.badge ? (
//                       <p className="mt-2">
//                         <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-primary">
//                           {info.value}
//                         </span>
//                       </p>
//                     ) : (
//                       <p className="mt-2 text-sm font-medium">{info.value}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           {/* Depots */}
//           <section className="mt-6 rounded-xl border border-border bg-card p-6">
//             <div>
//               <h2 className="text-lg font-heading font-semibold">Dépôts rattachés</h2>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Dépôts autorisés pour le suivi des entrées et sorties.
//               </p>
//             </div>
//             <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//               {DEPOTS.map((depot) => (
//                 <div key={depot.name} className="rounded-lg border border-border p-4">
//                   <div className="flex items-start justify-between">
//                     <IconPlaceholder className="text-xl text-primary" />
//                     <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-primary">
//                       Actif
//                     </span>
//                   </div>
//                   <p className="mt-4 font-semibold">{depot.name}</p>
//                   <p className="mt-1 text-sm text-muted-foreground">{depot.location}</p>
//                 </div>
//               ))}
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }  

import React from "react";

/**
 * GPL Track — Profil
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

  .filter-btn { transition: all 0.2s ease; }
  .filter-btn:hover {
    border-color: var(--primary);
    background-color: var(--secondary);
  }
`;

function IconPlaceholder({ className = "" }) {
  return <span className={`inline-block ${className}`} aria-hidden="true" />;
}

const CONTACT_INFO = [
  { icon: "mail", label: "operations@totalenergies.cm" },
  { icon: "phone", label: "+237 233 42 18 00" },
  { icon: "map-pin", label: "Douala, Cameroun" },
];

const ORG_INFO = [
  { label: "Raison sociale", value: "TotalEnergies Cameroun SA" },
  { label: "Code marketer", value: "MKT-CM-0048" },
  { label: "Responsable opérations", value: "Estelle Ndzié" },
  { label: "Statut", value: "Actif", badge: true },
];

const DEPOTS = [
  { name: "Bonabéri", location: "Douala · Super & Gasoil" },
  { name: "Nsam", location: "Yaoundé · Super & Gasoil" },
  { name: "Port de Kribi", location: "Kribi · Super & Gasoil" },
];

export default function Profil() {
  return (
    <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
      <style>{theme}</style>

      <div className="flex flex-1">
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {/* Header */}
          <header>
            <p className="text-sm font-medium text-primary tracking-wide">
              Compte marketer
            </p>
            <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">
              Profil
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
              Gérez les informations et le périmètre opérationnel de votre compte.
            </p>
          </header>

          {/* Identity + org info */}
          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Identity card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft xl:col-span-1">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-secondary text-2xl font-heading font-bold text-primary shadow-soft">
                TE
              </div>
              <h2 className="mt-5 text-lg font-heading font-semibold tracking-tight">
                TotalEnergies Cameroun
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Compte marketer actif</p>

              <div className="mt-6 space-y-4 border-t border-border pt-5 text-sm">
                {CONTACT_INFO.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                      <IconPlaceholder className="text-primary" />
                    </div>
                    <span className="text-foreground">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Org info */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft xl:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-heading font-semibold tracking-tight">
                    Informations de l’organisation
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Données de référence du marketer
                  </p>
                </div>
                <button className="filter-btn min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-primary">
                  Modifier
                </button>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
                {ORG_INFO.map((info) => (
                  <div key={info.label} className="rounded-xl bg-muted/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {info.label}
                    </p>
                    {info.badge ? (
                      <p className="mt-2.5">
                        <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                          {info.value}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-2.5 text-sm font-semibold text-foreground">
                        {info.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Depots */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div>
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Dépôts rattachés
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dépôts autorisés pour le suivi des entrées et sorties.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {DEPOTS.map((depot) => (
                <div
                  key={depot.name}
                  className="shadow-soft-hover rounded-xl border border-border bg-background p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                      <IconPlaceholder className="text-xl text-primary" />
                    </div>
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                      Actif
                    </span>
                  </div>
                  <p className="mt-4 font-semibold text-foreground">{depot.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{depot.location}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}