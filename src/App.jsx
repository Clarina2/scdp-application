import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/connexion";
import SortiesGPL from "./pages/sorties";
import EntreesGPL from "./pages/entrées";
import GPLDashboard from "./pages/tableaubord";
import Parametres from "./pages/paramètre";
import Profil from "./pages/profil";
import AppLayout from "./layouts/AppLayout";
import ChangerMotDePasse from "./pages/nouvelleconnexion";

// Pages Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminMarketers from "./pages/AdminMarketers";
import AdminStocks from "./pages/AdminStocks";
import AdminMouvements from "./pages/AdminMouvements";
import AdminStatistiques from "./pages/AdminStatistiques";
import AdminComptes from "./pages/AdminComptes";
import AdminParametres from "./pages/AdminParametres";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Page de connexion (sans sidebar) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/nouveaupassword" element={<ChangerMotDePasse />} />

        {/* Toutes les pages authentifiées passent par le Layout (avec sidebar) */}
        <Route element={<AppLayout />}>
          <Route path="/tableau" element={<GPLDashboard />} />
          <Route path="/entre" element={<EntreesGPL />} />
          <Route path="/sortie" element={<SortiesGPL />} />
          <Route path="/profi" element={<Profil />} />
          <Route path="/para" element={<Parametres />} />

        </Route>

        {/* ========== Espace Admin ========== */}
//         <Route element={<AppLayout role="admin" />}>
//           <Route path="/admin" element={<AdminDashboard />} />
//           <Route path="/admin/marketers" element={<AdminMarketers />} />
//           <Route path="/admin/stocks" element={<AdminStocks />} />
//           <Route path="/admin/mouvements" element={<AdminMouvements />} />
//           <Route path="/admin/statistiques" element={<AdminStatistiques />} />
//           <Route path="/admin/comptes" element={<AdminComptes />} />
//           <Route path="/admin/parametres" element={<AdminParametres />} />
//         </Route>
            
      </Routes>
    </div>
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