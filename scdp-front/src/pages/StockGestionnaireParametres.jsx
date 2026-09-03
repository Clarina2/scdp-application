import React, { useState } from "react";
import { userSettingsApi } from "../api/client";

export default function StockGestionnaireParametres() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      await userSettingsApi.changePassword(oldPassword, newPassword);
      setMessage("Mot de passe modifié avec succès.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gpl-dashboard min-h-screen w-full p-6 md:p-8 lg:p-10">
      <header>
        <p className="text-sm font-medium text-primary tracking-wide">Sécurité & Préférences</p>
        <h1 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight">Paramètres du compte</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gérez votre mot de passe et les paramètres de sécurité.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft max-w-xl">
        <h2 className="text-lg font-semibold text-foreground">Changer mon mot de passe</h2>

        {message && (
          <div className="mt-4 rounded-xl bg-accent p-3 text-xs font-semibold text-primary border border-border">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Mot de passe actuel</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="min-h-11 px-6 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-105 disabled:opacity-50"
            >
              {loading ? "Modification..." : "Enregistrer le nouveau mot de passe"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
