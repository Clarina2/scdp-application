// import React, { useState } from "react";

// /**
//  * GPL Track — Paramètres
//  * Converted from static HTML to a single-file React component.
//  * Toggle switches are wired to real React state so they're actually
//  * interactive, unlike the static markup they came from.
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

//   .toggle-track {
//     display: flex;
//     align-items: center;
//     height: 1.75rem;
//     width: 3rem;
//     border-radius: 9999px;
//     padding: 0.25rem;
//     transition: background-color 0.15s ease;
//     cursor: pointer;
//     border: none;
//   }
//   .toggle-thumb {
//     height: 1.25rem;
//     width: 1.25rem;
//     border-radius: 9999px;
//     background-color: var(--card);
//     transition: transform 0.15s ease;
//     box-shadow: 0 1px 2px rgba(15, 23, 42, 0.15);
//   }
// `;

// function IconPlaceholder({ className = "" }) {
//   return <span className={`inline-block ${className}`} aria-hidden="true" />;
// }

// function Toggle({ checked, onChange, label }) {
//   return (
//     <button
//       type="button"
//       role="switch"
//       aria-checked={checked}
//       aria-label={label}
//       onClick={onChange}
//       className="toggle-track"
//       style={{
//         backgroundColor: checked ? "var(--primary)" : "var(--secondary)",
//         justifyContent: checked ? "flex-end" : "flex-start",
//       }}
//     >
//       <span className="toggle-thumb" />
//     </button>
//   );
// }

// const NAV_ITEMS = [
//   { label: "Tableau de bord", active: false },
//   { label: "Entrées", active: false },
//   { label: "Sorties", active: false },
//   { label: "Profil", active: false },
//   { label: "Paramètres", active: true },
// ];

// export default function Parametres() {
//   const [alerts, setAlerts] = useState({
//     lowStock: true,
//     receptionValidated: true,
//     monthlyReport: false,
//   });

//   const [defaultPeriod] = useState("Mois en cours");
//   const [unit] = useState("Tonnes (t)");

//   const toggleAlert = (key) =>
//     setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));

//   return (
//     <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
//       <style>{theme}</style>

//       <div className="flex flex-1">
//         {/* Sidebar */}
      
//         {/* Main */}
//         <main className="flex-1 p-8">
//           <header>
//             <p className="text-sm font-medium text-primary">Personnalisation</p>
//             <h1 className="mt-1 text-2xl font-heading font-bold">Paramètres</h1>
//             <p className="mt-2 text-sm text-muted-foreground">
//               Configurez vos alertes et préférences de suivi GPL.
//             </p>
//           </header>

//           {/* Alerts + notification channel */}
//           <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-3">
//             <div className="rounded-xl border border-border bg-card p-6 xl:col-span-2">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-lg font-heading font-semibold">Alertes de stock</h2>
//                   <p className="mt-1 text-sm text-muted-foreground">
//                     Recevez les signaux utiles pour anticiper les ruptures.
//                   </p>
//                 </div>
//                 <IconPlaceholder className="text-2xl text-primary" />
//               </div>

//               <div className="mt-6 divide-y divide-border">
//                 <div className="flex items-center justify-between gap-5 py-4">
//                   <div>
//                     <p className="text-sm font-semibold">Seuil de stock bas</p>
//                     <p className="mt-1 text-sm text-muted-foreground">
//                       Notifier quand un dépôt passe sous son seuil défini.
//                     </p>
//                   </div>
//                   <Toggle
//                     checked={alerts.lowStock}
//                     onChange={() => toggleAlert("lowStock")}
//                     label="Seuil de stock bas"
//                   />
//                 </div>
//                 <div className="flex items-center justify-between gap-5 py-4">
//                   <div>
//                     <p className="text-sm font-semibold">Réception validée</p>
//                     <p className="mt-1 text-sm text-muted-foreground">
//                       Recevoir un récapitulatif à chaque entrée confirmée.
//                     </p>
//                   </div>
//                   <Toggle
//                     checked={alerts.receptionValidated}
//                     onChange={() => toggleAlert("receptionValidated")}
//                     label="Réception validée"
//                   />
//                 </div>
//                 <div className="flex items-center justify-between gap-5 py-4">
//                   <div>
//                     <p className="text-sm font-semibold">Rapport mensuel</p>
//                     <p className="mt-1 text-sm text-muted-foreground">
//                       Envoyer la synthèse entrées et sorties à la fin du mois.
//                     </p>
//                   </div>
//                   <Toggle
//                     checked={alerts.monthlyReport}
//                     onChange={() => toggleAlert("monthlyReport")}
//                     label="Rapport mensuel"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-xl border border-border bg-card p-6">
//               <h2 className="text-lg font-heading font-semibold">Canal d’alerte</h2>
//               <p className="mt-1 text-sm text-muted-foreground">Destinataire principal</p>
//               <div className="mt-6 rounded-lg bg-secondary p-4">
//                 <div className="flex items-center gap-3">
//                   <IconPlaceholder className="text-xl text-primary" />
//                   <div>
//                     <p className="text-sm font-semibold">E-mail opérationnel</p>
//                     <p className="mt-1 text-xs text-secondary-foreground">
//                       operations@totalenergies.cm
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <button className="mt-4 min-h-11 w-full rounded-lg border border-border text-sm font-semibold text-primary">
//                 Modifier le canal
//               </button>
//             </div>
//           </section>

//           {/* Display prefs + security */}
//           <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
//             <div className="rounded-xl border border-border bg-card p-6">
//               <h2 className="text-lg font-heading font-semibold">Préférences d’affichage</h2>
//               <div className="mt-6 space-y-5">
//                 <div>
//                   <label className="text-sm font-semibold">Période par défaut</label>
//                   <button className="mt-2 flex min-h-11 w-full items-center justify-between rounded-lg border border-input px-3 text-sm">
//                     <span>{defaultPeriod}</span>
//                     <IconPlaceholder />
//                   </button>
//                 </div>
//                 <div>
//                   <label className="text-sm font-semibold">Unité de mesure</label>
//                   <button className="mt-2 flex min-h-11 w-full items-center justify-between rounded-lg border border-input px-3 text-sm">
//                     <span>{unit}</span>
//                     <IconPlaceholder />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-xl border border-border bg-card p-6">
//               <h2 className="text-lg font-heading font-semibold">Sécurité du compte</h2>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Protégez l’accès à votre espace marketer.
//               </p>
//               <div className="mt-6 flex items-center justify-between rounded-lg border border-border p-4">
//                 <div className="flex items-center gap-3">
//                   <IconPlaceholder className="text-xl text-primary" />
//                   <div>
//                     <p className="text-sm font-semibold">Mot de passe</p>
//                     <p className="text-xs text-muted-foreground">
//                       Dernière modification il y a 3 mois
//                     </p>
//                   </div>
//                 </div>
//                 <button className="text-sm font-semibold text-primary">Modifier</button>
//               </div>
//               <button className="mt-5 min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold">
//                 Enregistrer les préférences
//               </button>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }  

import React, { useState } from "react";

/**
 * GPL Track — Paramètres
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

  .filter-btn {
    transition: all 0.2s ease;
  }
  .filter-btn:hover {
    border-color: var(--primary);
    background-color: var(--secondary);
  }

  .export-btn {
    transition: all 0.2s ease;
  }
  .export-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 6px 16px -4px rgba(47, 125, 50, 0.35);
  }

  /* Toggle switches */
  .toggle-track {
    display: flex;
    align-items: center;
    height: 1.75rem;
    width: 3.25rem;
    border-radius: 9999px;
    padding: 0.2rem;
    transition: background-color 0.2s ease;
    cursor: pointer;
    border: none;
    flex-shrink: 0;
  }
  .toggle-thumb {
    height: 1.35rem;
    width: 1.35rem;
    border-radius: 9999px;
    background-color: var(--card);
    transition: transform 0.2s ease;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
  }
`;

function IconPlaceholder({ className = "" }) {
  return <span className={`inline-block ${className}`} aria-hidden="true" />;
}

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

export default function Parametres() {
  const [alerts, setAlerts] = useState({
    lowStock: true,
    receptionValidated: true,
    monthlyReport: false,
  });

  const [defaultPeriod] = useState("Mois en cours");
  const [unit] = useState("Tonnes (t)");

  const toggleAlert = (key) =>
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="gpl-dashboard min-h-screen w-full flex flex-col relative">
      <style>{theme}</style>

      <div className="flex flex-1">
        {/* Sidebar */}

        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {/* Header */}
          <header>
            <p className="text-sm font-medium text-primary tracking-wide">
              Personnalisation
            </p>
            <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">
              Paramètres
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
              Configurez vos alertes et préférences de suivi GPL.
            </p>
          </header>

          {/* Alerts + notification channel */}
          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Alertes */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft xl:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-heading font-semibold tracking-tight">
                    Alertes de stock
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recevez les signaux utiles pour anticiper les ruptures.
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                  <IconPlaceholder className="text-xl text-primary" />
                </div>
              </div>

              <div className="mt-6 divide-y divide-border">
                <div className="flex items-center justify-between gap-5 py-5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Seuil de stock bas</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Notifier quand un dépôt passe sous son seuil défini.
                    </p>
                  </div>
                  <Toggle
                    checked={alerts.lowStock}
                    onChange={() => toggleAlert("lowStock")}
                    label="Seuil de stock bas"
                  />
                </div>

                <div className="flex items-center justify-between gap-5 py-5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Réception validée</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Recevoir un récapitulatif à chaque entrée confirmée.
                    </p>
                  </div>
                  <Toggle
                    checked={alerts.receptionValidated}
                    onChange={() => toggleAlert("receptionValidated")}
                    label="Réception validée"
                  />
                </div>

                <div className="flex items-center justify-between gap-5 py-5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Rapport mensuel</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Envoyer la synthèse entrées et sorties à la fin du mois.
                    </p>
                  </div>
                  <Toggle
                    checked={alerts.monthlyReport}
                    onChange={() => toggleAlert("monthlyReport")}
                    label="Rapport mensuel"
                  />
                </div>
              </div>
            </div>

            {/* Canal d'alerte */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Canal d’alerte
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Destinataire principal
              </p>

              <div className="mt-6 rounded-xl bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-card shadow-soft">
                    <IconPlaceholder className="text-lg text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">E-mail opérationnel</p>
                    <p className="mt-0.5 text-xs text-secondary-foreground truncate">
                      operations@totalenergies.cm
                    </p>
                  </div>
                </div>
              </div>

              <button className="filter-btn mt-4 min-h-11 w-full rounded-xl border border-border text-sm font-semibold text-primary">
                Modifier le canal
              </button>
            </div>
          </section>

          {/* Display prefs + security */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Préférences d'affichage */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Préférences d’affichage
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-semibold">Période par défaut</label>
                  <button className="filter-btn mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-4 text-sm">
                    <span>{defaultPeriod}</span>
                    <IconPlaceholder />
                  </button>
                </div>
                <div>
                  <label className="text-sm font-semibold">Unité de mesure</label>
                  <button className="filter-btn mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-4 text-sm">
                    <span>{unit}</span>
                    <IconPlaceholder />
                  </button>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-heading font-semibold tracking-tight">
                Sécurité du compte
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Protégez l’accès à votre espace marketer.
              </p>

              <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                    <IconPlaceholder className="text-lg text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Mot de passe</p>
                    <p className="text-xs text-muted-foreground">
                      Dernière modification il y a 3 mois
                    </p>
                  </div>
                </div>
                <button className="text-sm font-semibold text-primary shrink-0 hover:underline">
                  Modifier
                </button>
              </div>

              <button className="export-btn mt-5 min-h-11 w-full sm:w-auto rounded-xl bg-primary px-6 text-sm font-semibold shadow-soft">
                Enregistrer les préférences
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}