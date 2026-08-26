


import React, { useState } from "react";

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
  .table-row:hover { background-color: var(--muted); }

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
  organisation: "",
  email: "",
  code: "",
  password: "",
  confirmPassword: "",
  statut: "Actif",
};

const ACCOUNTS = [
  { org: "TotalEnergies Cameroun", email: "operations@totalenergies.cm", code: "MKT-CM-0048", created: "12/01/2025", status: "Actif" },
  { org: "Trafigura", email: "ops@trafigura.cm", code: "MKT-CM-0031", created: "03/03/2025", status: "Actif" },
  { org: "Vitol", email: "contact@vitol.cm", code: "MKT-CM-0027", created: "18/05/2025", status: "Actif" },
  { org: "Ola Energy", email: "admin@olaenergy.cm", code: "MKT-CM-0019", created: "22/07/2025", status: "Actif" },
  { org: "Addax", email: "info@addax.cm", code: "MKT-CM-0012", created: "09/11/2024", status: "Inactif" },
];

export default function AdminComptes() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [accounts, setAccounts] = useState(ACCOUNTS);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.organisation.trim() || !form.email.trim() || !form.code.trim() || !form.password) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    if (form.password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    const today = new Date();
    const created = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    const newAccount = {
      org: form.organisation.trim(),
      email: form.email.trim().toLowerCase(),
      code: form.code.trim().toUpperCase(),
      created,
      status: form.statut,
    };

    setAccounts((prev) => [newAccount, ...prev]);
    setForm(INITIAL_FORM);
    setShowForm(false);
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setShowForm(false);
  };

  const toggleStatus = (code) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.code === code
          ? { ...a, status: a.status === "Actif" ? "Inactif" : "Actif" }
          : a
      )
    );
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
              Comptes marketers
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Création, activation et gestion des accès.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
          >
            + Nouveau compte
          </button>
        </header>

        {/* Tableau */}
        <section className="mt-8 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Organisation</th>
                  <th className="px-6 py-3.5">E-mail</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Créé le</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.code} className="table-row border-t border-border">
                    <td className="px-6 py-4 font-medium">{a.org}</td>
                    <td className="px-6 py-4 text-muted-foreground">{a.email}</td>
                    <td className="px-6 py-4">{a.code}</td>
                    <td className="px-6 py-4 text-muted-foreground">{a.created}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          a.status === "Actif"
                            ? "bg-secondary text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-sm font-semibold text-primary hover:underline mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(a.code)}
                        className="text-sm font-semibold text-destructive hover:underline"
                      >
                        {a.status === "Actif" ? "Désactiver" : "Activer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========== MODAL NOUVEAU COMPTE ========== */}
      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* En-tête */}
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <h2 className="text-lg font-heading font-semibold tracking-tight">
                  Nouveau compte marketer
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Créez un accès pour une société cliente.
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
              {/* Organisation */}
              <div>
                <label className="form-label" htmlFor="organisation">
                  Organisation <span className="text-destructive">*</span>
                </label>
                <input
                  id="organisation"
                  name="organisation"
                  type="text"
                  className="form-input"
                  placeholder="Ex. TotalEnergies Cameroun SA"
                  value={form.organisation}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Code + Statut */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="code">
                    Code marketer <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    className="form-input"
                    placeholder="Ex. MKT-CM-0050"
                    value={form.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="statut">
                    Statut
                  </label>
                  <select
                    id="statut"
                    name="statut"
                    className="form-input"
                    value={form.statut}
                    onChange={handleChange}
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="form-label" htmlFor="email">
                  E-mail de connexion <span className="text-destructive">*</span>
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

              {/* Mot de passe + Confirmation */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="password">
                    Mot de passe <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input"
                    placeholder="Minimum 6 caractères"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirmer le mot de passe <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    placeholder="Retapez le mot de passe"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}