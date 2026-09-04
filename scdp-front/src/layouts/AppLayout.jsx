import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar"; // Sidebar Admin
import StockGestionnaireSidebar from "../components/StockGestionnaireSidebar"; // Sidebar Stock Gestionnaire
import ViewAsBanner from "../components/ViewAsBanner";
import { useAuth } from "../contexts/AuthContext";

// Theme

const theme = `
  :root {
    --background: #FFFFFF;
    --foreground: #173225;
    --primary: #2F7D32;
    --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA;
    --secondary-foreground: #173225;
    --tertiary: #6AA84F;
    --tertiary-foreground: #323131;
    --muted: #F5F8F5;
    --muted-foreground: #657467;
    --accent: #DDEFD9;
    --accent-foreground: #173225;
    --card: #FFFFFF;
    --card-foreground: #173225;
    --destructive: #C63D3D;
    --destructive-foreground: #FFFFFF;
    --border: #DCE7DD;
    --input: #DCE7DD;
    --ring: #2F7D32;
    --radius: 0.75rem;
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --font-sans: Inter, sans-serif;
    --font-heading: Inter, sans-serif;
    --font-mono: "JetBrains Mono", monospace;
    --shadow-color: rgba(15, 23, 42, 0.12);
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

  .shadow-theme {
    box-shadow: 0 10px 30px -8px var(--shadow-color);
  }

  .scdp-content {
    transition: margin 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: margin;
  }
`;

// export default function AppLayout() {
//   return (
//     <div className="gpl-dashboard min-h-screen w-full flex">
//       <style>{theme}</style>
//       <Sidebar />
//       <div className="flex-1 overflow-auto">
//         <Outlet />
//       </div>
//     </div>
//   );
// }  

 export default function AppLayout({ role = "marketer" }) {
  const { viewAsUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarActivity, setSidebarActivity] = useState(0);

  useEffect(() => {
    if (mobileOpen) {
      return undefined;
    }

    const collapseTimer = window.setTimeout(() => {
      setCollapsed(true);
    }, 5000);

    return () => window.clearTimeout(collapseTimer);
  }, [collapsed, mobileOpen, sidebarActivity]);

  const handleSidebarInteraction = () => {
    setCollapsed(false);
    setSidebarActivity((value) => value + 1);
  };
  
  // Determine the effective role for sidebar display
  // If admin is viewing as another user, show that user's sidebar
  const effectiveRole = viewAsUser ? viewAsUser.role : role;

  return (
    <div className="gpl-dashboard min-h-screen w-full flex">
      <style>{theme}</style>

      {/* View-As Banner - shown when admin is viewing as another user */}
      <ViewAsBanner />

      {/* Sidebar selon le rôle effectif */}
      {effectiveRole === "ADMIN" ? (
        <AdminSidebar collapsed={collapsed} onInteraction={handleSidebarInteraction} mobileOpen={mobileOpen} />
      ) : effectiveRole === "STOCK_GESTIONNAIRE" ? (
        <StockGestionnaireSidebar collapsed={collapsed} onInteraction={handleSidebarInteraction} mobileOpen={mobileOpen} />
      ) : (
        <Sidebar collapsed={collapsed} onInteraction={handleSidebarInteraction} mobileOpen={mobileOpen} />
      )}

      {/* Contenu de la page - add top padding when banner is visible */}
      <button
        type="button"
        onClick={() => { setMobileOpen((value) => !value); setCollapsed(false); handleSidebarInteraction(); }}
        className="fixed left-4 top-4 z-40 flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-md md:hidden"
        aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        title={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span className="text-xl" aria-hidden="true">☰</span>
      </button>
      <div className={`scdp-content ml-0 flex-1 overflow-auto ${collapsed ? 'md:ml-20' : 'md:ml-72'} md:block`} style={{ paddingTop: viewAsUser ? '4.5rem' : '0' }}>
        <Outlet />
      </div>
    </div>
  );
}


// import React from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";           // Sidebar Marketer
// import AdminSidebar from "../components/AdminSidebar"; // Sidebar Admin

// // Thème soft blanc / vert (cohérent avec toutes les pages)
// const theme = `
//   :root {
//     --background: #F7FAF7;
//     --foreground: #173225;
//     --primary: #2F7D32;
//     --primary-foreground: #FFFFFF;
//     --secondary: #EAF4EA;
//     --secondary-foreground: #173225;
//     --tertiary: #6AA84F;
//     --tertiary-foreground: #323131;
//     --muted: #F0F5F0;
//     --muted-foreground: #657467;
//     --accent: #DDEFD9;
//     --accent-foreground: #173225;
//     --card: #FFFFFF;
//     --card-foreground: #173225;
//     --destructive: #C63D3D;
//     --destructive-foreground: #FFFFFF;
//     --border: #E2EDE3;
//     --input: #E2EDE3;
//     --ring: #2F7D32;
//     --radius: 1rem;
//     --radius-sm: calc(var(--radius) - 4px);
//     --radius-md: calc(var(--radius) - 2px);
//     --radius-lg: var(--radius);
//     --font-sans: Inter, system-ui, sans-serif;
//     --font-heading: Inter, system-ui, sans-serif;
//     --font-mono: "JetBrains Mono", monospace;
//     --shadow-color: rgba(47, 125, 50, 0.08);

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

//   /* Text */
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

//   /* Borders / radius */
//   .border-border { border-color: var(--border); }
//   .border-input { border-color: var(--input); }
//   .rounded-xl { border-radius: var(--radius-lg); }
//   .rounded-lg { border-radius: var(--radius-md); }
//   .rounded-2xl { border-radius: 1.25rem; }

//   .shadow-soft {
//     box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04);
//   }
//   .shadow-soft-hover {
//     transition: box-shadow 0.25s ease, transform 0.25s ease;
//   }
//   .shadow-soft-hover:hover {
//     box-shadow: 0 8px 28px -6px var(--shadow-color), 0 4px 12px -2px rgba(0,0,0,0.06);
//     transform: translateY(-1px);
//   }

//   .shadow-theme {
//     box-shadow: 0 10px 30px -8px var(--shadow-color);
//   }

//   .progress-track {
//     background: linear-gradient(90deg, var(--secondary), #f0f7f0);
//   }
//   .progress-fill {
//     background: linear-gradient(90deg, var(--primary), #4CAF50);
//     transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
//   }

//   .table-row { transition: background-color 0.15s ease; }
//   .table-row:hover { background-color: var(--muted); }

//   .filter-btn { transition: all 0.2s ease; }
//   .filter-btn:hover {
//     border-color: var(--primary);
//     background-color: var(--secondary);
//   }

//   .export-btn { transition: all 0.2s ease; }
//   .export-btn:hover {
//     filter: brightness(1.08);
//     box-shadow: 0 6px 16px -4px rgba(47, 125, 50, 0.35);
//   }
// `;

// export default function AppLayout({ role = "marketer" }) {
//   return (
//     <div className="gpl-dashboard min-h-screen w-full flex">
//       <style>{theme}</style>

//       {/* Sidebar selon le rôle */}
//       {role === "admin" ? <AdminSidebar /> : <Sidebar />}

//       {/* Contenu de la page */}
//       <div className="flex-1 overflow-auto">
//         <Outlet />
//       </div>
//     </div>
//   );
// }