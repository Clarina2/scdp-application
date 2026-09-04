import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function StockGestionnaireProfil() {
  const { user, viewAsUser } = useAuth();
  const displayedUser = viewAsUser || user;

  return (
    <div className="gpl-dashboard min-h-screen w-full p-6 md:p-8 lg:p-10">
      <header>
        <p className="text-sm font-medium text-primary tracking-wide">Compte utilisateur</p>
        <h1 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Détails de votre compte Stock Gestionnaire SCDP Track.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft max-w-2xl">
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-bold">
            {displayedUser?.name ? displayedUser.name[0].toUpperCase() : "S"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{displayedUser?.name || "Stock Gestionnaire"}</h2>
            <p className="text-xs text-muted-foreground">{displayedUser?.email}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              Stock Gestionnaire
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div className="grid grid-cols-3 py-2 border-b border-border">
            <span className="font-semibold text-muted-foreground">Nom complet</span>
            <span className="col-span-2 text-foreground font-medium">{displayedUser?.name || "—"}</span>
          </div>
          <div className="grid grid-cols-3 py-2 border-b border-border">
            <span className="font-semibold text-muted-foreground">Adresse Email</span>
            <span className="col-span-2 text-foreground font-medium">{displayedUser?.email || "—"}</span>
          </div>
          <div className="grid grid-cols-3 py-2 border-b border-border">
            <span className="font-semibold text-muted-foreground">Rôle système</span>
            <span className="col-span-2 text-foreground font-medium">STOCK_GESTIONNAIRE</span>
          </div>
          <div className="grid grid-cols-3 py-2 border-b border-border">
            <span className="font-semibold text-muted-foreground">Statut du compte</span>
            <span className="col-span-2 text-primary font-semibold">Actif ✅</span>
          </div>
        </div>
      </section>
    </div>
  );
}
