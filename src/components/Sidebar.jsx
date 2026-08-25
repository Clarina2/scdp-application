// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";

// function IconPlaceholder({ className = "" }) {
//   return <span className={`inline-block ${className}`} aria-hidden="true" />;
// }

// const NAV_ITEMS = [
//   { path: "/tableau", label: "Tableau de bord" },
//   { path: "/entre", label: "Entrées" },
//   { path: "/sortie", label: "Sorties" },
//   { path: "/profi", label: "Profil" },
//   { path: "/para", label: "Paramètres" },
// ];

// export default function Sidebar() {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // Ici tu peux aussi vider le token / localStorage si tu en as
//     navigate("/");
//   };

//   return (
//     <aside className="w-72 shrink-0 border-r border-border bg-card p-5 flex flex-col min-h-screen">
//       {/* Logo */}
//       <div className="flex items-center gap-3 border-b border-border pb-6">
//         <div className="flex size-11 items-center justify-center rounded-xl bg-primary">
//           <IconPlaceholder className="text-xl" />
//         </div>
//         <div>
//           <p className="font-heading text-lg font-bold">SCDP Track</p>
//           {/* <p className="text-xs text-muted-foreground">Espace marketer</p> */}
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="mt-6 space-y-2 flex-1">
//         {NAV_ITEMS.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             className={({ isActive }) =>
//               isActive
//                 ? "flex min-h-11 items-center gap-3 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
//                 : "flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
//             }
//           >
//             <IconPlaceholder className="text-lg" />
//             {item.label}
//           </NavLink>
//         ))}
//       </nav>

//       {/* Bouton Déconnexion */}
//       <div className="mt-6 pt-4 border-t border-border">
//         <button
//           type="button"
//           onClick={handleLogout}
//           className="flex w-full min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold text-destructive hover:bg-secondary"
//         >
//           <IconPlaceholder className="text-lg" />
//           Déconnexion
//         </button>
//       </div>
//     </aside>
//   );
// }

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    path: "/tableau",
    label: "Tableau de bord",
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
    path: "/entre",
    label: "Entrées",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v13" />
        <path d="M6 11l6 6 6-6" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
  {
    path: "/sortie",
    label: "Sorties",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V7" />
        <path d="M6 13l6-6 6 6" />
        <path d="M5 3h14" />
      </svg>
    ),
  },
  {
    path: "/profi",
    label: "Profil",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
  {
    path: "/para",
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

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Ici tu peux aussi vider le token / localStorage si tu en as
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
          <p className="text-xs text-muted-foreground">Espace marketer</p>
        </div>
      </div>

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