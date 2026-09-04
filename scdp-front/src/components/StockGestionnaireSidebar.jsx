import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  {
    path: "/stock-gestionnaire/export",
    label: "Exporter",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    path: "/stock-gestionnaire/profil",
    label: "Profile",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    path: "/stock-gestionnaire/parametres",
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

export default function StockGestionnaireSidebar() {
  const navigate = useNavigate();
  const { logout, user, viewAsUser } = useAuth();
  const displayedUser = viewAsUser || user;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate("/");
  };

  return (
    <aside className="scdp-sidebar w-72 shrink-0 border-r border-border bg-card p-5 flex flex-col min-h-screen">
      <style>{sidebarStyles}</style>

      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="brand-icon flex size-11 items-center justify-center rounded-xl text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <p className="font-heading text-lg font-bold tracking-tight">SCDP Track</p>
          <p className="text-xs text-muted-foreground font-medium">Stock Gestionnaire</p>
        </div>
      </div>

      {/* User Info Badge */}
      {displayedUser && (
        <div className="mt-4 p-3 rounded-xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-foreground truncate">{displayedUser.name || displayedUser.email}</p>
          <p className="text-[11px] text-muted-foreground truncate">{displayedUser.email}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-6 space-y-1.5 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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

      {/* Logout */}
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
