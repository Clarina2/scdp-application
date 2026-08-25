import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/connexion";
import SortiesGPL from "./pages/sorties";
import EntreesGPL from "./pages/entrées";
import GPLDashboard from "./pages/tableaubord";
import Parametres from "./pages/paramètre";
import Profil from "./pages/profil";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Page de connexion (sans sidebar) */}
        <Route path="/" element={<LoginPage />} />

        {/* Toutes les pages authentifiées passent par le Layout (avec sidebar) */}
        <Route element={<AppLayout />}>
          <Route path="/tableau" element={<GPLDashboard />} />
          <Route path="/entre" element={<EntreesGPL />} />
          <Route path="/sortie" element={<SortiesGPL />} />
          <Route path="/profi" element={<Profil />} />
          <Route path="/para" element={<Parametres />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;