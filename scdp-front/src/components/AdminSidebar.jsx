
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    path: "/admin",
    label: "Tableau de bord",
    end: true,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    path: "/admin/stocks",
    label: "Stocks",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    ),
  },
  {
    path: "/admin/mouvements",
    label: "Mouvements",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h12" />
        <path d="M16 3l4 4-4 4" />
        <path d="M16 17H4" />
        <path d="M8 21l-4-4 4-4" />
      </svg>
    ),
  },
  {
    path: "/admin/statistiques",
    label: "Statistiques",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    path: "/admin/comptes",
    label: "Comptes",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    path: "/admin/parametres",
    label: "Paramètres",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
];

const sidebarStyles = `
  .scdp-sidebar {
    --sb-primary: var(--primary, #2F7D32);
    --sb-primary-foreground: var(--primary-foreground, #FFFFFF);
    --sb-secondary: var(--secondary, #EAF4EA);
    --sb-border: var(--border, #DCE7DD);
    --sb-muted-foreground: var(--muted-foreground, #657467);
    --sb-foreground: var(--foreground, #173225);
    --sb-destructive: var(--destructive, #C63D3D);
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    z-index: 50;
  }

  .scdp-sidebar .nav-link {
    position: relative;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
  }
  .scdp-sidebar .nav-link:hover {
    transform: translateX(2px);
  }
  .scdp-sidebar .nav-link.is-active::before {
    content: "";
    position: absolute;
    left: -0.55rem;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60%;
    border-radius: 9999px;
    background-color: var(--sb-primary);
  }
  .scdp-sidebar .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .scdp-sidebar .logout-btn {
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
  }
  .scdp-sidebar .logout-btn:hover {
    transform: translateX(2px);
  }
  .scdp-sidebar .brand-icon {
    background-image: linear-gradient(135deg, var(--sb-primary), #6AA84F);
    box-shadow: 0 8px 20px -8px rgba(47, 125, 50, 0.55);
  }
`;

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="scdp-sidebar w-72 shrink-0 border-r border-border bg-card p-5 flex flex-col min-h-screen">
      <style>{sidebarStyles}</style>

      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="brand-icon flex size-11 items-center justify-center rounded-xl text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c-4 3-7 7-7 11a7 7 0 0 0 14 0c0-4-3-8-7-11Z" />
            <path d="M12 21V10" />
          </svg>
        </div>
        <div>
          <p className="font-heading text-lg font-bold tracking-tight">SCDP Track</p>
          <p className="text-xs text-muted-foreground">Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-1.5 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end === true}
            className={({ isActive }) =>
              `nav-link flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm ${
                isActive
                  ? "is-active bg-primary font-semibold text-primary-foreground"
                  : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bouton Déconnexion */}
      <div className="mt-6 pt-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="logout-btn flex w-full min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold text-destructive hover:bg-secondary"
        >
          <span className="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}