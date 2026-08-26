
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
  raisonSociale: "",
  code: "",
  email: "",
  telephone: "",
  responsable: "",
  ville: "",
  statut: "Actif",
};

const MARKETERS = [
  { name: "TotalEnergies Cameroun", code: "MKT-CM-0048", stock: "4 820 t", sorties: "1 640 t", conso: "1 520 t", restant: "3 300 t", status: "Actif" },
  { name: "Trafigura", code: "MKT-CM-0031", stock: "3 150 t", sorties: "1 120 t", conso: "1 050 t", restant: "2 100 t", status: "Actif" },
  { name: "Vitol", code: "MKT-CM-0027", stock: "2 890 t", sorties: "980 t", conso: "910 t", restant: "1 980 t", status: "Actif" },
  { name: "Ola Energy", code: "MKT-CM-0019", stock: "2 410 t", sorties: "870 t", conso: "820 t", restant: "1 590 t", status: "Actif" },
  { name: "Addax", code: "MKT-CM-0012", stock: "1 680 t", sorties: "520 t", conso: "490 t", restant: "1 190 t", status: "Inactif" },
];

export default function AdminMarketers() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [marketers, setMarketers] = useState(MARKETERS);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation simple
    if (!form.raisonSociale.trim() || !form.code.trim() || !form.email.trim()) {
      alert("Veuillez remplir au minimum : Raison sociale, Code et E-mail.");
      return;
    }

    // Ajout dans la liste (côté front pour l’instant)
    const newMarketer = {
      name: form.raisonSociale.trim(),
      code: form.code.trim().toUpperCase(),
      stock: "0 t",
      sorties: "0 t",
      conso: "0 t",
      restant: "0 t",
      status: form.statut,
    };

    setMarketers((prev) => [newMarketer, ...prev]);
    setForm(INITIAL_FORM);
    setShowForm(false);
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
                  <th className="px-6 py-3.5">Marketer</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5 text-right">Stock</th>
                  <th className="px-6 py-3.5 text-right">Sorties</th>
                  <th className="px-6 py-3.5 text-right">Consommation</th>
                  <th className="px-6 py-3.5 text-right">Restant</th>
                  <th className="px-6 py-3.5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {marketers.map((m) => (
                  <tr key={m.code} className="table-row border-t border-border">
                    <td className="px-6 py-4 font-medium">{m.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{m.code}</td>
                    <td className="px-6 py-4 text-right font-semibold">{m.stock}</td>
                    <td className="px-6 py-4 text-right">{m.sorties}</td>
                    <td className="px-6 py-4 text-right">{m.conso}</td>
                    <td className="px-6 py-4 text-right font-semibold text-primary">{m.restant}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          m.status === "Actif"
                            ? "bg-secondary text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
              {/* Raison sociale */}
              <div>
                <label className="form-label" htmlFor="raisonSociale">
                  Raison sociale <span className="text-destructive">*</span>
                </label>
                <input
                  id="raisonSociale"
                  name="raisonSociale"
                  type="text"
                  className="form-input"
                  placeholder="Ex. TotalEnergies Cameroun SA"
                  value={form.raisonSociale}
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

              {/* E-mail + Téléphone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="form-label" htmlFor="telephone">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    className="form-input"
                    placeholder="+237 6XX XX XX XX"
                    value={form.telephone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Responsable + Ville */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="responsable">
                    Responsable opérations
                  </label>
                  <input
                    id="responsable"
                    name="responsable"
                    type="text"
                    className="form-input"
                    placeholder="Nom du responsable"
                    value={form.responsable}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="ville">
                    Ville principale
                  </label>
                  <input
                    id="ville"
                    name="ville"
                    type="text"
                    className="form-input"
                    placeholder="Ex. Douala"
                    value={form.ville}
                    onChange={handleChange}
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
                  Enregistrer le marketer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}