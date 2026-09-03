
import React, { useState, useEffect } from "react";
import { adminApi } from "../api/client";

const theme = `
  :root {
    --background: #F7FAF7; --foreground: #173225; --primary: #2F7D32; --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA; --muted: #F0F5F0; --muted-foreground: #657467; --card: #FFFFFF;
    --border: #E2EDE3; --input: #E2EDE3; --radius: 1rem; --destructive: #C63D3D;
    --font-sans: Inter, system-ui, sans-serif; --font-heading: Inter, system-ui, sans-serif;
    --shadow-color: rgba(47, 125, 50, 0.08); --primary-text: #256A28;
  }
  .gpl-dashboard { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
  .bg-card { background-color: var(--card); } .bg-secondary { background-color: var(--secondary); }
  .bg-muted { background-color: var(--muted); } .bg-primary { background-color: var(--primary); color: var(--primary-foreground); }
  .text-primary { color: var(--primary-text); } .text-muted-foreground { color: var(--muted-foreground); }
  .text-destructive { color: var(--destructive); }
  .border-border { border-color: var(--border); } .border-input { border-color: var(--input); }
  .rounded-2xl { border-radius: 1.25rem; } .rounded-xl { border-radius: var(--radius); }
  .shadow-soft { box-shadow: 0 4px 20px -4px var(--shadow-color), 0 2px 8px -2px rgba(0,0,0,0.04); }
  .shadow-soft-hover { transition: all 0.25s ease; }
  .shadow-soft-hover:hover { box-shadow: 0 8px 28px -6px var(--shadow-color); transform: translateY(-1px); }
  .table-row:hover { background-color: var(--muted); }
  .filter-btn:hover { border-color: var(--primary); background-color: var(--secondary); }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(23, 50, 37, 0.35);
    backdrop-filter: blur(4px); z-index: 50;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal-content {
    background: var(--card); border-radius: 1.25rem;
    box-shadow: 0 20px 50px -12px rgba(47, 125, 50, 0.2);
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
  }
  .form-input {
    width: 100%; min-height: 2.75rem; padding: 0 1rem;
    border: 1px solid var(--input); border-radius: var(--radius);
    background: var(--background); font-size: 0.875rem; color: var(--foreground);
    outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .form-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(47, 125, 50, 0.15);
  }
  .form-label {
    display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.4rem;
  }
`;

const INITIAL_FORM = {
  distributor_code: "",
  email: "",
  phone: "",
};

export default function AdminMarketers() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [marketers, setMarketers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDistributors();
    loadMarketers();
  }, []);

  const loadDistributors = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDistributors();
      setDistributors(data || []);
    } catch (err) {
      console.error("Failed to load distributors:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMarketers = async () => {
    try {
      const data = await adminApi.getMarketers();
      setMarketers(data.items || []);
    } catch (err) {
      console.error("Failed to load marketers:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = async (marketerId, currentStatus) => {
    try {
      await adminApi.updateMarketerStatus(marketerId, !currentStatus);
      await loadMarketers();
    } catch (err) {
      console.error("Failed to update marketer status:", err);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDelete = async (marketerId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce marketer ? Cette action est irréversible.")) {
      return;
    }
    try {
      await adminApi.deleteMarketer(marketerId);
      await loadMarketers();
    } catch (err) {
      console.error("Failed to delete marketer:", err);
      alert("Erreur lors de la suppression du marketer");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Validation
      if (!form.distributor_code.trim() || !form.email.trim()) {
        setError("Veuillez remplir le distributeur et l'e-mail.");
        setSubmitting(false);
        return;
      }

      await adminApi.createMarketer(form);
      await loadMarketers();
      setForm(INITIAL_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la création du marketer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setShowForm(false);
  };

  return (
    <div className="gpl-dashboard min-h-screen w-full">
      <style>{theme}</style>

      <main className="flex-1 p-6 md:p-8 lg:p-10">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary tracking-wide">Administration</p>
            <h1 className="mt-1.5 text-2xl md:text-3xl font-heading font-bold tracking-tight">
              Marketers
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Liste et comparaison des sociétés clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
          >
            + Ajouter un marketer
          </button>
        </header>

        {/* Tableau */}
        <section className="mt-8 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Nom</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Téléphone</th>
                  <th className="px-6 py-3.5">Rôle</th>
                  <th className="px-6 py-3.5">Code distributeur</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5">Dernière connexion</th>
                  <th className="px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketers.length > 0 ? marketers.map((m) => (
                  <tr key={m.id} className="table-row border-t border-border">
                    <td className="px-6 py-4 font-medium">{m.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{m.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{m.phone || "N/A"}</td>
                    <td className="px-6 py-4">{m.role === 'ADMIN' ? 'Administrateur' : 'Marketeur'}</td>
                    <td className="px-6 py-4">{m.distributor_code || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          m.is_active
                            ? "bg-secondary text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {m.last_login_at ? new Date(m.last_login_at).toLocaleDateString('fr-FR') : "Jamais"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(m.id, m.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            m.is_active
                              ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                              : "bg-secondary text-primary hover:bg-primary hover:text-primary-foreground"
                          }`}
                          title={m.is_active ? "Désactiver" : "Activer"}
                        >
                          {m.is_active ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition"
                          title="Supprimer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                      Aucun marketer trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========== MODAL FORMULAIRE ========== */}
      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modal */}
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <h2 className="text-lg font-heading font-semibold tracking-tight">
                  Nouveau marketer
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Renseignez les informations de la société cliente.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Distributeur */}
              <div>
                <label className="form-label" htmlFor="distributor_code">
                  Distributeur <span className="text-destructive">*</span>
                </label>
                <select
                  id="distributor_code"
                  name="distributor_code"
                  className="form-input"
                  value={form.distributor_code}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Sélectionner un distributeur</option>
                  {distributors.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* E-mail */}
              <div>
                <label className="form-label" htmlFor="email">
                  E-mail opérationnel <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="operations@exemple.cm"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="form-label" htmlFor="phone">
                  Téléphone (optionnel)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+237 6XX XXX XXX"
                  value={form.phone}
                  onChange={handleChange}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Utilisé pour la réception des codes OTP par SMS (optionnel).
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Un code d'activation (OTP) sera envoyé à l'e-mail fourni.
              </p>

              {/* Boutons */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted transition"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
                  disabled={submitting}
                >
                  {submitting ? "Création en cours..." : "Créer le compte marketer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}