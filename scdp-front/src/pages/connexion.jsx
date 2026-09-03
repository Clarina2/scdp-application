import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * GPL Track — Connexion
 * Split-screen login page: a leaf-branded green panel on one side,
 * a clean white form (email + mot de passe only) on the other.
 * Same token approach as the rest of the GPL Track suite, since this
 * environment doesn't run a Tailwind JIT compiler.
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
`;

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3 6.5l9 6.5 9-6.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      // Redirect based on user role
      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (response.user.role === 'STOCK_GESTIONNAIRE') {
        navigate('/stock-gestionnaire/export');
      } else {
        navigate('/tableau');
      }
    } catch (err) {
      setError(err.message || "Échec de la connexion. Vérifiez vos identifiants.");
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
            Le suivi de vos stocks GPL, à la racine.
          </h1>
          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            une vue claire sur toute
            votre chaîne, ville par ville.
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

          <h2 className="text-2xl font-bold text-balance">Content de vous revoir</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour accéder à votre espace marketer.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Adresse email
              </label>
              <div className="relative">
                <span className="field-icon">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="vous@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Mot de passe
                </label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <span className="field-icon">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="size-4 rounded border-input accent-[var(--primary)]" />
              Se souvenir de moi
            </label>

            <button 
              type="submit" 
              className="submit-btn w-full rounded-lg py-3 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <a href="#" className="font-semibold text-primary hover:underline">
              Contactez votre administrateur
            </a>
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Marketer ?{" "}
            <a href="/activate-marketer" className="font-semibold text-primary hover:underline">
              Activer votre compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}