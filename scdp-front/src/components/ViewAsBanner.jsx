import React from "react";
import { useAuth } from "../contexts/AuthContext";

const bannerStyles = `
  .view-as-banner {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .view-as-banner-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .view-as-banner-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .view-as-banner-icon {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .view-as-banner-text {
    flex: 1;
  }

  .view-as-banner-title {
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .view-as-banner-subtitle {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .view-as-banner-exit {
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .view-as-banner-exit:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .view-as-banner-exit:active {
    transform: translateY(1px);
  }
`;

export default function ViewAsBanner() {
  const { viewAsUser, exitViewAs } = useAuth();

  if (!viewAsUser) {
    return null;
  }

  const handleExit = async () => {
    try {
      await exitViewAs();
      window.location.href = '/admin';
    } catch (error) {
      console.error('Failed to exit view-as mode:', error);
      alert('Erreur lors de la sortie du mode consultation');
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'MARKETER') return 'Marketer';
    if (role === 'STOCK_GESTIONNAIRE') return 'Gestionnaire de stock';
    return role;
  };

  return (
    <div className="view-as-banner">
      <style>{bannerStyles}</style>
      <div className="view-as-banner-content">
        <div className="view-as-banner-info">
          <div className="view-as-banner-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="view-as-banner-text">
            <div className="view-as-banner-title">
              Mode administrateur - Consultation
            </div>
            <div className="view-as-banner-subtitle">
              Vous consultez l'espace de : <strong>{viewAsUser.name}</strong> — {getRoleLabel(viewAsUser.role)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="view-as-banner-exit"
        >
          Retour à mon espace Admin
        </button>
      </div>
    </div>
  );
}