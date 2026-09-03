import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/client";

/**
 * SCDP Track — Page 2 : Changer le mot de passe
 * Trois champs : ancien mot de passe, nouveau mot de passe, confirmation.
 * Destinée à remplacer un ancien mot de passe (ex: celui généré par le
 * backend à la création du compte) par un mot de passe personnel.
 */

const theme = `
  :root {
    --background: #FFFFFF;
    --foreground: #173225;
    --primary: #2F7D32;
    --primary-deep: #1F5F24;
    --primary-foreground: #FFFFFF;
    --secondary: #EAF4EA;
    --secondary-foreground: #173225;
    --tertiary: #6AA84F;
    --muted: #F5F8F5;
    --muted-foreground: #657467;
    --accent: #DDEFD9;
    --card: #FFFFFF;
    --card-foreground: #173225;
    --border: #DCE7DD;
    --input: #DCE7DD;
    --ring: #2F7D32;
    --radius-lg: 1.25rem;
    --radius-md: 0.9rem;
    --font-sans: Inter, sans-serif;
    --font-heading: "Plus Jakarta Sans", Inter, sans-serif;
    --shadow-color: rgba(23, 50, 37, 0.14);
    --primary-text: #256A28;
    --muted-text: #657467;
    --destructive-text: #C63D3D;
  }

  .gpl-login {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
  }

  .gpl-login h1,
  .gpl-login h2 {
    font-family: var(--font-heading);
  }

  .bg-card { background-color: var(--card); }
  .bg-secondary { background-color: var(--secondary); }
  .bg-muted { background-color: var(--muted); }
  .text-primary { color: var(--primary-text); }
  .text-muted-foreground { color: var(--muted-text); }
  .text-destructive { color: var(--destructive-text); }
  .border-border { border-color: var(--border); }
  .border-input { border-color: var(--input); }

  .leaf-panel {
    position: relative;
    overflow: hidden;
    background: radial-gradient(120% 140% at 15% 10%, #3E9142 0%, var(--primary) 45%, var(--primary-deep) 100%);
  }

  .leaf-veins {
    position: absolute;
    inset: 0;
    opacity: 0.16;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .field-input {
    width: 100%;
    background: var(--card);
    border: 1.5px solid var(--input);
    border-radius: var(--radius-md);
    padding: 0.85rem 1rem 0.85rem 2.85rem;
    font-size: 0.925rem;
    color: var(--foreground);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    outline: none;
  }

  .field-input::placeholder {
    color: #A6B3AB;
  }

  .field-input:focus {
    border-color: var(--ring);
    box-shadow: 0 0 0 4px rgba(47, 125, 50, 0.14);
  }

  .field-input.field-error {
    border-color: var(--destructive-text);
  }
  .field-input.field-error:focus {
    box-shadow: 0 0 0 4px rgba(198, 61, 61, 0.14);
  }

  .field-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #7C9182;
    pointer-events: none;
  }

  .submit-btn {
    background: var(--primary);
    color: var(--primary-foreground);
    transition: background-color 0.15s ease, transform 0.1s ease;
  }
  .submit-btn:hover { background-color: var(--primary-deep); }
  .submit-btn:active { transform: translateY(1px); }

  .shadow-card {
    box-shadow: 0 24px 60px -20px var(--shadow-color);
  }

  .strength-bar {
    height: 4px;
    border-radius: 9999px;
    background-color: var(--border);
    overflow: hidden;
  }
  .strength-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.2s ease, background-color 0.2s ease;
  }
`;

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function LockCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M9.5 15.5l1.6 1.6 3.4-3.4" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.2 0 10 7 10 7a17.3 17.3 0 0 1-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s3.8 7 10 7c1.4 0 2.6-.3 3.7-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
}

const STRENGTH_LABELS = ["Trop faible", "Faible", "Moyen", "Bon", "Excellent"];
const STRENGTH_COLORS = ["#DCE7DD", "#C63D3D", "#D9A441", "#6AA84F", "#2F7D32"];

export default function ChangerMotDePasse() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword) {
      setError("Veuillez saisir votre ancien mot de passe.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword === oldPassword) {
      setError("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      // Redirect to dashboard on success
      navigate('/tableau');
    } catch (err) {
      setError(err.message || "Échec du changement de mot de passe. Vérifiez votre ancien mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gpl-login min-h-screen w-full flex">
      <style>{theme}</style>

      {/* Left branding panel */}
      <div className="leaf-panel hidden md:flex md:w-1/2 flex-col justify-between p-12 text-white">
        <svg className="leaf-veins" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 780 C60 500 180 260 420 120" stroke="white" strokeWidth="2" />
          <path d="M100 700 C220 620 300 520 340 420" stroke="white" strokeWidth="1.2" />
          <path d="M120 600 C240 560 320 480 360 380" stroke="white" strokeWidth="1.2" />
          <path d="M150 500 C260 470 330 400 370 320" stroke="white" strokeWidth="1.2" />
          <path d="M180 400 C270 380 330 320 360 260" stroke="white" strokeWidth="1.2" />
          <circle cx="420" cy="120" r="4" fill="white" />
        </svg>

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c-4 3-7 7-7 11a7 7 0 0 0 14 0c0-4-3-8-7-11Z" />
              <path d="M12 21V10" />
            </svg>
          </div>
          <span className="font-heading text-lg font-bold">SCDP Track</span>
        </div>

        <div className="relative max-w-sm">
          <h1 className="font-heading text-3xl font-bold leading-tight text-balance">
            Sécurisez votre espace en une étape.
          </h1>
          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            Remplacez votre mot de passe actuel par un mot de passe
            personnel, connu de vous seul.
          </p>
        </div>

        <p className="relative text-xs text-white/60">
          © 2026 SCDP Track — Espace marketer
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand mark */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: "var(--primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-4 3-7 7-7 11a7 7 0 0 0 14 0c0-4-3-8-7-11Z" />
                <path d="M12 21V10" />
              </svg>
            </div>
            <span className="font-heading text-lg font-bold">SCDP Track</span>
          </div>

          <h2 className="text-2xl font-bold text-balance">Changer votre mot de passe</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Saisissez votre ancien mot de passe puis choisissez-en un nouveau.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="oldPassword" className="mb-1.5 block text-sm font-medium">
                Ancien mot de passe
              </label>
              <div className="relative">
                <span className="field-icon">
                  <LockIcon />
                </span>
                <input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Votre mot de passe actuel"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`field-input ${error ? "field-error" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showOldPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <EyeIcon visible={showOldPassword} />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Première connexion ? Utilisez le mot de passe reçu par email.
              </p>
            </div>

            <div className="border-t border-border pt-5">
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <span className="field-icon">
                  <LockIcon />
                </span>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="8 caractères minimum"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`field-input ${error ? "field-error" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <EyeIcon visible={showNewPassword} />
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(strength / 4) * 100}%`,
                        backgroundColor: STRENGTH_COLORS[strength],
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Solidité : <span className="font-medium">{STRENGTH_LABELS[strength]}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <span className="field-icon">
                  <LockCheckIcon />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Retapez le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`field-input ${error ? "field-error" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
            </div>

            <button type="submit" className="submit-btn w-full rounded-lg py-3 text-sm font-semibold" disabled={loading}>
              {loading ? "Traitement en cours..." : "Valider et continuer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}