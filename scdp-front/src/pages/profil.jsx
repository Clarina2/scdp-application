 

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { stockApi } from "../api/client";

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

export default function Profil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [depots, setDepots] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [depotsData, regionsData] = await Promise.all([
        stockApi.getDepots(),
        stockApi.getRegions(),
      ]);
      setDepots(depotsData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.name || localStorage.getItem('userName') || 'Marketer';
  const userEmail = user?.email || localStorage.getItem('userEmail') || '';

  // Generate initials from user name
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
                {initials}
              </div>
              <h2 className="mt-5 text-lg font-heading font-semibold tracking-tight">
                {userName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Compte marketer actif</p>

              <div className="mt-6 space-y-4 border-t border-border pt-5 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                    <IconPlaceholder className="text-primary" />
                  </div>
                  <span className="text-foreground">{userEmail}</span>
                </div>
              </div>
            </div>

            {/* Org info */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft xl:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-heading font-semibold tracking-tight">
                    Informations du compte
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Données de votre compte marketer
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nom
                  </p>
                  <p className="mt-2.5 text-sm font-semibold text-foreground">
                    {userName}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-2.5 text-sm font-semibold text-foreground">
                    {userEmail}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Rôle
                  </p>
                  <p className="mt-2.5">
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                      {user?.role === 'ADMIN' ? 'Administrateur' : 'Marketeur'}
                    </span>
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Statut
                  </p>
                  <p className="mt-2.5">
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                      Actif
                    </span>
                  </p>
                </div>
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

            <div className="mt-6 max-h-96 overflow-y-auto grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Chargement des dépôts...
                </div>
              ) : depots.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Aucun dépôt rattaché
                </div>
              ) : (
                depots.map((depot) => (
                  <div
                    key={depot.code}
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
                    <p className="mt-4 font-semibold text-foreground">{depot.name || depot.code}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{depot.city || 'Dépôt'}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}