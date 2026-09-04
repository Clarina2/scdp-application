import React, { useState, useEffect } from "react";
import { adminApi } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

export default function AdminComptes() {
  const { viewAs } = useAuth();
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState("ALL"); // "ALL", "MARKETERS", "STOCK_GESTIONNAIRES", "ADMINS"
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormType, setCreateFormType] = useState("STOCK_GESTIONNAIRE"); // "MARKETER", "STOCK_GESTIONNAIRE", or "ADMIN"
  const [connectingUserId, setConnectingUserId] = useState(null);
  
  // Marketer form state
  const [marketerForm, setMarketerForm] = useState({ distributor_code: "", email: "", phone: "" });
  const [marketerSubmitting, setMarketerSubmitting] = useState(false);
  const [marketerError, setMarketerError] = useState("");
  
  // Stock gestionnaire form state
  const [stockForm, setStockForm] = useState({ name: "", email: "" });
  const [stockSubmitting, setStockSubmitting] = useState(false);
  const [stockError, setStockError] = useState("");
  const [stockMessage, setStockMessage] = useState("");
  
  // Admin form state
  const [adminForm, setAdminForm] = useState({ name: "", email: "" });
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [roleFilter, searchQuery, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;

      if (roleFilter === "ALL") {
        const [marketersRes, sgRes, adminsRes] = await Promise.all([
          adminApi.getMarketers(params).catch(() => ({ items: [], total: 0 })),
          adminApi.getStockGestionnaires(params).catch(() => ({ items: [], total: 0 })),
          adminApi.getAdmins(params).catch(() => ({ items: [], total: 0 })),
        ]);
        const combined = [
          ...(marketersRes.items || []).map(m => ({ ...m, accountType: 'MARKETER' })),
          ...(sgRes.items || []).map(sg => ({ ...sg, accountType: 'STOCK_GESTIONNAIRE' })),
          ...(adminsRes.items || []).map(a => ({ ...a, accountType: 'ADMIN' }))
        ];
        setAccounts(combined);
        setTotal((marketersRes.total || 0) + (sgRes.total || 0) + (adminsRes.total || 0));
      } else if (roleFilter === "MARKETERS") {
        const res = await adminApi.getMarketers(params);
        setAccounts((res.items || []).map(m => ({ ...m, accountType: 'MARKETER' })));
        setTotal(res.total || 0);
      } else if (roleFilter === "STOCK_GESTIONNAIRES") {
        const res = await adminApi.getStockGestionnaires(params);
        setAccounts((res.items || []).map(sg => ({ ...sg, accountType: 'STOCK_GESTIONNAIRE' })));
        setTotal(res.total || 0);
      } else if (roleFilter === "ADMINS") {
        const res = await adminApi.getAdmins(params);
        setAccounts((res.items || []).map(a => ({ ...a, accountType: 'ADMIN' })));
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error("Failed to load accounts data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDistributors = async () => {
    try {
      const data = await adminApi.getDistributors();
      setDistributors(data || []);
    } catch (err) {
      console.error("Failed to load distributors:", err);
    }
  };

  const handleCreateMarketer = async (e) => {
    e.preventDefault();
    setMarketerError("");
    setMarketerSubmitting(true);

    try {
      if (!marketerForm.distributor_code.trim() || !marketerForm.email.trim()) {
        setMarketerError("Veuillez remplir le distributeur et l'e-mail.");
        setMarketerSubmitting(false);
        return;
      }

      await adminApi.createMarketer(marketerForm);
      setMarketerForm({ distributor_code: "", email: "", phone: "" });
      setShowCreateForm(false);
      loadData();
    } catch (err) {
      setMarketerError(err.message || "Erreur lors de la création du marketer.");
    } finally {
      setMarketerSubmitting(false);
    }
  };

  const handleCreateStockGestionnaire = async (e) => {
    e.preventDefault();
    setStockError("");
    setStockMessage("");

    if (!stockForm.name.trim() || !stockForm.email.trim()) {
      setStockError("Veuillez remplir le nom et l'email.");
      return;
    }

    setStockSubmitting(true);
    try {
      const res = await adminApi.createStockGestionnaire({
        name: stockForm.name.trim(),
        email: stockForm.email.trim().toLowerCase(),
      });
      setStockMessage(res.message || "Compte créé avec succès. Un code OTP a été envoyé.");
      setStockForm({ name: "", email: "" });
      loadData();
    } catch (err) {
      setStockError(err.message || "Échec de la création du compte Stock Gestionnaire.");
    } finally {
      setStockSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminMessage("");

    if (!adminForm.name.trim() || !adminForm.email.trim()) {
      setAdminError("Veuillez remplir le nom et l'email.");
      return;
    }

    setAdminSubmitting(true);
    try {
      const res = await adminApi.createAdminWithOtp({
        name: adminForm.name.trim(),
        email: adminForm.email.trim().toLowerCase(),
      });
      setAdminMessage(res.message || "Compte créé avec succès. Un code OTP a été envoyé. L'administrateur doit se rendre sur /activate-admin pour activer son compte.");
      setAdminForm({ name: "", email: "" });
      loadData();
    } catch (err) {
      setAdminError(err.message || "Échec de la création du compte Admin.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleToggleStatus = async (accountId, currentStatus, accountType) => {
    try {
      if (accountType === 'MARKETER') {
        await adminApi.updateMarketerStatus(accountId, !currentStatus);
      } else if (accountType === 'STOCK_GESTIONNAIRE') {
        await adminApi.updateStockGestionnaireStatus(accountId, !currentStatus);
      } else if (accountType === 'ADMIN') {
        await adminApi.updateAdminStatus(accountId, !currentStatus);
      }
      loadData();
    } catch (err) {
      console.error("Failed to update account status:", err);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDelete = async (accountId, accountType) => {
    const confirmMsg = accountType === 'MARKETER' 
      ? "Êtes-vous sûr de vouloir supprimer ce marketer ? Cette action est irréversible."
      : accountType === 'STOCK_GESTIONNAIRE'
      ? "Êtes-vous sûr de vouloir supprimer ce gestionnaire de stock ? Cette action est irréversible."
      : "Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.";
    
    if (!confirm(confirmMsg)) {
      return;
    }
    try {
      if (accountType === 'MARKETER') {
        await adminApi.deleteMarketer(accountId);
      } else if (accountType === 'STOCK_GESTIONNAIRE') {
        await adminApi.deleteStockGestionnaire(accountId);
      } else if (accountType === 'ADMIN') {
        await adminApi.deleteAdmin(accountId);
      }
      loadData();
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const handleConnectAs = async (accountId, accountType) => {
    if (accountType !== 'MARKETER' && accountType !== 'STOCK_GESTIONNAIRE') {
      alert("Vous ne pouvez vous connecter qu'en tant que Marketer ou Gestionnaire de stock");
      return;
    }

    if (!confirm(`Voulez-vous vraiment vous connecter à l'espace de cet utilisateur ?`)) {
      return;
    }

    try {
      setConnectingUserId(accountId);
      await viewAs(accountId);
      
      // Navigate to the appropriate dashboard based on account type
      if (accountType === 'MARKETER') {
        navigate('/tableau');
      } else if (accountType === 'STOCK_GESTIONNAIRE') {
        navigate('/stock-gestionnaire/export');
      }
    } catch (err) {
      console.error("Failed to connect as user:", err);
      alert("Erreur lors de la connexion à l'espace utilisateur");
    } finally {
      setConnectingUserId(null);
    }
  };

  const handleOpenCreateForm = (type) => {
    setCreateFormType(type);
    setMarketerError("");
    setStockError("");
    setStockMessage("");
    setAdminError("");
    setAdminMessage("");
    setMarketerForm({ distributor_code: "", email: "", phone: "" });
    setStockForm({ name: "", email: "" });
    setAdminForm({ name: "", email: "" });
    if (type === 'MARKETER') {
      loadDistributors();
    }
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setMarketerForm({ distributor_code: "", email: "", phone: "" });
    setStockForm({ name: "", email: "" });
    setAdminForm({ name: "", email: "" });
    setMarketerError("");
    setStockError("");
    setStockMessage("");
    setAdminError("");
    setAdminMessage("");
  };

  const getRoleLabel = (accountType) => {
    if (accountType === 'MARKETER') return 'Marketer';
    if (accountType === 'STOCK_GESTIONNAIRE') return 'Gestionnaire de stock';
    if (accountType === 'ADMIN') return 'Admin';
    return accountType;
  };

  const getEmptyMessage = () => {
    if (roleFilter === "ALL") return "Aucun compte trouvé.";
    if (roleFilter === "MARKETERS") return "Aucun compte marketer trouvé.";
    if (roleFilter === "STOCK_GESTIONNAIRES") return "Aucun compte gestionnaire de stock trouvé.";
    if (roleFilter === "ADMINS") return "Aucun compte administrateur trouvé.";
    return "Aucun compte trouvé.";
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
              Gestion des Comptes
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Administration des marketers et gestionnaires de stock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateForm('STOCK_GESTIONNAIRE')}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
          >
            + Créer un compte
          </button>
        </header>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center gap-4">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Type de compte:</label>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="form-input min-h-9 w-48"
              >
                <option value="ALL">Tous les comptes</option>
                <option value="MARKETERS">Marketers</option>
                <option value="STOCK_GESTIONNAIRES">Gestionnaires de stock</option>
                <option value="ADMINS">Admins</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="form-input min-h-9 w-64"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {total} compte{total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table Section */}
        <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/70 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Nom complet</th>
                  <th className="px-6 py-3.5">E-mail</th>
                  <th className="px-6 py-3.5">Rôle</th>
                  <th className="px-6 py-3.5">Organisation</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5">Créé le</th>
                  <th className="px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                      Chargement des comptes...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                      {getEmptyMessage()}
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) => (
                    <tr key={account.id} className="table-row border-t border-border">
                      <td className="px-6 py-4 font-semibold text-foreground">{account.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{account.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          account.accountType === 'MARKETER' ? 'bg-accent text-primary' : 
                          account.accountType === 'STOCK_GESTIONNAIRE' ? 'bg-secondary text-primary' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {getRoleLabel(account.accountType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {account.accountType === 'MARKETER' ? (account.distributor_code || "—") : 
                         account.accountType === 'ADMIN' ? "—" : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          account.is_active ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {account.is_active ? "Actif" : "En attente d'activation (OTP)"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {account.created_at ? new Date(account.created_at).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(account.accountType === 'MARKETER' || account.accountType === 'STOCK_GESTIONNAIRE') && account.is_active && (
                            <button
                              onClick={() => handleConnectAs(account.id, account.accountType)}
                              disabled={connectingUserId === account.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                              title="Se connecter en tant que cet utilisateur"
                            >
                              {connectingUserId === account.id ? "Connexion..." : "Connecter"}
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(account.id, account.is_active, account.accountType)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              account.is_active
                                ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                                : "bg-secondary text-primary hover:bg-primary hover:text-primary-foreground"
                            }`}
                            title={account.is_active ? "Désactiver" : "Activer"}
                          >
                            {account.is_active ? "Désactiver" : "Activer"}
                          </button>
                          <button
                            onClick={() => handleDelete(account.id, account.accountType)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition"
                            title="Supprimer"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {page} sur {Math.ceil(total / 10)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ========== MODAL CREER UN COMPTE ========== */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <h2 className="text-lg font-heading font-semibold tracking-tight">
                  Créer un compte
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  L'utilisateur recevra un code OTP d'activation par e-mail pour configurer son mot de passe.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Account Type Selection */}
              <div>
                <label className="form-label">Type de compte <span className="text-destructive">*</span></label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateFormType('STOCK_GESTIONNAIRE')}
                    className={`flex-1 min-h-11 rounded-xl px-4 text-sm font-semibold transition ${
                      createFormType === 'STOCK_GESTIONNAIRE'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Gestionnaire de stock
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreateFormType('MARKETER'); loadDistributors(); }}
                    className={`flex-1 min-h-11 rounded-xl px-4 text-sm font-semibold transition ${
                      createFormType === 'MARKETER'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Marketer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateFormType('ADMIN')}
                    className={`flex-1 min-h-11 rounded-xl px-4 text-sm font-semibold transition ${
                      createFormType === 'ADMIN'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {createFormType === 'MARKETER' ? (
                <form onSubmit={handleCreateMarketer} className="space-y-5">
                  {marketerError && (
                    <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20">
                      ⚠️ {marketerError}
                    </div>
                  )}

                  <div>
                    <label className="form-label" htmlFor="distributor_code">
                      Distributeur <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="distributor_code"
                      name="distributor_code"
                      className="form-input"
                      value={marketerForm.distributor_code}
                      onChange={(e) => setMarketerForm(prev => ({ ...prev, distributor_code: e.target.value }))}
                      required
                    >
                      <option value="">Sélectionner un distributeur</option>
                      {distributors.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="marketerEmail">
                      E-mail opérationnel <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="marketerEmail"
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="operations@exemple.cm"
                      value={marketerForm.email}
                      onChange={(e) => setMarketerForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="marketerPhone">
                      Téléphone (optionnel)
                    </label>
                    <input
                      id="marketerPhone"
                      name="phone"
                      type="tel"
                      className="form-input"
                      placeholder="+237 6XX XXX XXX"
                      value={marketerForm.phone}
                      onChange={(e) => setMarketerForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted"
                      disabled={marketerSubmitting}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 disabled:opacity-50"
                      disabled={marketerSubmitting}
                    >
                      {marketerSubmitting ? "Création en cours..." : "Créer le compte marketer"}
                    </button>
                  </div>
                </form>
              ) : createFormType === 'STOCK_GESTIONNAIRE' ? (
                <form onSubmit={handleCreateStockGestionnaire} className="space-y-5">
                  {stockMessage && (
                    <div className="rounded-xl bg-accent p-3 text-xs font-semibold text-primary border border-border">
                      ✅ {stockMessage}
                    </div>
                  )}
                  {stockError && (
                    <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20">
                      ⚠️ {stockError}
                    </div>
                  )}

                  <div>
                    <label className="form-label" htmlFor="stockName">
                      Nom complet <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="stockName"
                      type="text"
                      className="form-input"
                      placeholder="Ex. Paul Biya"
                      value={stockForm.name}
                      onChange={(e) => setStockForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="stockEmail">
                      Adresse e-mail <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="stockEmail"
                      type="email"
                      className="form-input"
                      placeholder="gestionnaire@scdp.cm"
                      value={stockForm.email}
                      onChange={(e) => setStockForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted"
                      disabled={stockSubmitting}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={stockSubmitting}
                      className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 disabled:opacity-50"
                    >
                      {stockSubmitting ? "Création..." : "Créer le compte"}
                    </button>
                  </div>
                </form>
              ) : createFormType === 'ADMIN' ? (
                <form onSubmit={handleCreateAdmin} className="space-y-5">
                  {adminMessage && (
                    <div className="rounded-xl bg-accent p-3 text-xs font-semibold text-primary border border-border">
                      ✅ {adminMessage}
                    </div>
                  )}
                  {adminError && (
                    <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20">
                      ⚠️ {adminError}
                    </div>
                  )}

                  <div>
                    <label className="form-label" htmlFor="adminName">
                      Nom complet <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="adminName"
                      type="text"
                      className="form-input"
                      placeholder="Ex. Jean Dupont"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="adminEmail">
                      Adresse e-mail <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="adminEmail"
                      type="email"
                      className="form-input"
                      placeholder="admin@scdp.cm"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted"
                      disabled={adminSubmitting}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={adminSubmitting}
                      className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 disabled:opacity-50"
                    >
                      {adminSubmitting ? "Création..." : "Créer le compte"}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}