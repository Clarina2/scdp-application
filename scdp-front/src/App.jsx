import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/connexion";
import SortiesGPL from "./pages/sorties";
import EntreesGPL from "./pages/entrées";
import GPLDashboard from "./pages/tableaubord";
import Parametres from "./pages/paramètre";
import Profil from "./pages/profil";
import RapportStock from "./pages/RapportStock";
import AppLayout from "./layouts/AppLayout";
import ChangerMotDePasse from "./pages/nouvelleconnexion";
import ActivateMarketer from "./pages/activate-marketer";
import ActivateStockGestionnaire from "./pages/activate-stock-gestionnaire";
import ActivateAdmin from "./pages/activate-admin";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminStocks from "./pages/AdminStocks";
import AdminMouvements from "./pages/AdminMouvements";
import AdminStatistiques from "./pages/AdminStatistiques";
import AdminComptes from "./pages/AdminComptes";
import AdminParametres from "./pages/AdminParametres";

// Pages Stock Gestionnaire
import StockGestionnaireExporter from "./pages/StockGestionnaireExporter";
import StockGestionnaireProfil from "./pages/StockGestionnaireProfil";
import StockGestionnaireParametres from "./pages/StockGestionnaireParametres";
import { Navigate } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Page de connexion (sans sidebar) */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/nouveaupassword" element={<ChangerMotDePasse />} />
          <Route path="/activate-marketer" element={<ActivateMarketer />} />
          <Route path="/activate-stock-gestionnaire" element={<ActivateStockGestionnaire />} />
          <Route path="/activate-admin" element={<ActivateAdmin />} />

          {/* Toutes les pages authentifiées passent par le Layout (avec sidebar) */}
          <Route element={<ProtectedRoute role="MARKETER"><AppLayout role="MARKETER" /></ProtectedRoute>}>
            <Route path="/tableau" element={<GPLDashboard />} />
            <Route path="/entre" element={<EntreesGPL />} />
            <Route path="/sortie" element={<SortiesGPL />} />
            <Route path="/rapport-stock" element={<RapportStock />} />
            <Route path="/profi" element={<Profil />} />
            <Route path="/para" element={<Parametres />} />
          </Route>

          {/* ========== Espace Admin ========== */}
          <Route element={<ProtectedRoute role="ADMIN"><AppLayout role="ADMIN" /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/stocks" element={<AdminStocks />} />
            <Route path="/admin/mouvements" element={<AdminMouvements />} />
            <Route path="/admin/statistiques" element={<AdminStatistiques />} />
            <Route path="/admin/comptes" element={<AdminComptes />} />
            <Route path="/admin/parametres" element={<AdminParametres />} />
          </Route>

          {/* ========== Espace Stock Gestionnaire ========== */}
          <Route element={<ProtectedRoute role="STOCK_GESTIONNAIRE"><AppLayout role="STOCK_GESTIONNAIRE" /></ProtectedRoute>}>
            <Route path="/stock-gestionnaire" element={<Navigate to="/stock-gestionnaire/export" replace />} />
            <Route path="/stock-gestionnaire/dashboard" element={<Navigate to="/stock-gestionnaire/export" replace />} />
            <Route path="/stock-gestionnaire/export" element={<StockGestionnaireExporter />} />
            <Route path="/stock-gestionnaire/profil" element={<StockGestionnaireProfil />} />
            <Route path="/stock-gestionnaire/parametres" element={<StockGestionnaireParametres />} />
          </Route>
            
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;  

// import React from "react";
// import { Routes, Route } from "react-router-dom";

// // Auth
// import LoginPage from "./pages/connexion";
// import ChangerMotDePasse from "./pages/nouvelleconnexion";

// // Layout
// import AppLayout from "./layouts/AppLayout";

// // Pages Marketer
// import GPLDashboard from "./pages/tableaubord";
// import EntreesGPL from "./pages/entrées";
// import SortiesGPL from "./pages/sorties";
// import Profil from "./pages/profil";
// import Parametres from "./pages/paramètre";

// // Pages Admin
// import AdminDashboard from "./pages/AdminDashboard";
// import AdminMarketers from "./pages/AdminMarketers";
// import AdminStocks from "./pages/AdminStocks";
// import AdminMouvements from "./pages/AdminMouvements";
// import AdminStatistiques from "./pages/AdminStatistiques";
// import AdminComptes from "./pages/AdminComptes";
// import AdminParametres from "./pages/AdminParametres";

// function App() {
//   return (
//     <div className="App">
//       <Routes>
//         {/* ========== Pages publiques (sans sidebar) ========== */}
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/nouveaupassword" element={<ChangerMotDePasse />} />

//         {/* ========== Espace Marketer ========== */}
//         <Route element={<AppLayout role="marketer" />}>
//           <Route path="/tableau" element={<GPLDashboard />} />
//           <Route path="/entre" element={<EntreesGPL />} />
//           <Route path="/sortie" element={<SortiesGPL />} />
//           <Route path="/profi" element={<Profil />} />
//           <Route path="/para" element={<Parametres />} />
//         </Route>

//         {/* ========== Espace Admin ========== */}
//         <Route element={<AppLayout role="admin" />}>
//           <Route path="/admin" element={<AdminDashboard />} />
//           <Route path="/admin/marketers" element={<AdminMarketers />} />
//           <Route path="/admin/stocks" element={<AdminStocks />} />
//           <Route path="/admin/mouvements" element={<AdminMouvements />} />
//           <Route path="/admin/statistiques" element={<AdminStatistiques />} />
//           <Route path="/admin/comptes" element={<AdminComptes />} />
//           <Route path="/admin/parametres" element={<AdminParametres />} />
//         </Route>
//       </Routes>
//     </div>
//   );
// }

// export default App;