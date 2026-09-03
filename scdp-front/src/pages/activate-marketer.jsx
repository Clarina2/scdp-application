import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { otpApi } from "../api/client";

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
  .step-indicator {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  .step-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.2s ease;
  }
  .step-dot.active {
    background: var(--primary);
  }
  .step-dot.completed {
    background: var(--primary);
  }
`;

export default function ActivateMarketer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Request OTP for the email
      await otpApi.sendOtp(email, 'ACCOUNT_VERIFICATION');
      setStep(2);
    } catch (err) {
      setError(err.message || "Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verify OTP
      console.log("Verifying OTP:", { email, otp, type: 'ACCOUNT_VERIFICATION' });
      await otpApi.verifyOtp(email, otp, 'ACCOUNT_VERIFICATION');
      console.log("OTP verified successfully");
      setStep(3);
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(err.message || "Code de vérification incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);

    try {
      await otpApi.setInitialPassword(email, otp, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/connexion");
      }, 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de la création du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      await otpApi.sendOtp(email, 'ACCOUNT_VERIFICATION');
      setError("Un nouveau code a été envoyé.");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gpl-dashboard min-h-screen w-full flex items-center justify-center p-6">
      <style>{theme}</style>

      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-soft p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold tracking-tight text-primary">
              {success ? "Compte activé" : "Activer votre compte Marketer"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {success
                ? "Votre compte a été activé avec succès."
                : "Suivez les étapes pour activer votre compte."}
            </p>
          </div>

          {!success && (
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}></div>
              <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
            </div>
          )}

          {success ? (
            <div className="bg-secondary rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">✓</div>
              <p className="text-sm font-medium text-primary">
                Redirection vers la page de connexion...
              </p>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="form-label" htmlFor="email">
                  Adresse e-mail <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="operations@exemple.cm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Continuer"}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-sm text-primary">
                  Un code de vérification a été envoyé à <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="form-label" htmlFor="otp">
                  Code de vérification (OTP) <span className="text-destructive">*</span>
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  className="form-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Entrez le code à 6 chiffres envoyé à votre e-mail.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                Renvoyer le code
              </button>

              <button
                type="submit"
                className="w-full min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
                disabled={loading}
              >
                {loading ? "Vérification..." : "Vérifier le code"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-muted-foreground hover:text-primary transition"
                disabled={loading}
              >
                Retour
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="form-label" htmlFor="password">
                  Nouveau mot de passe <span className="text-destructive">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Minimum 8 caractères.
                </p>
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
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-105 transition"
                disabled={loading}
              >
                {loading ? "Activation..." : "Activer le compte"}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-sm text-muted-foreground hover:text-primary transition"
                disabled={loading}
              >
                Retour
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/connexion")}
              className="text-sm text-muted-foreground hover:text-primary transition"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
