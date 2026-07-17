import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { createCheckoutSession, openCustomerPortal, isStripeTestMode } from "@/lib/stripe";

// Price ID du produit "Membre Fondateur" — NON SECRET (visible côté client Stripe Checkout)
// Sera créé via l'API Stripe et stocké dans Vercel.
export const FOUNDER_PRICE_ID = import.meta.env.VITE_STRIPE_FOUNDER_PRICE_ID || "price_pending_test_mode";

export function AccountPage() {
  const { user, signOut } = useAuth();
  const { profile, isPremiumMember, subscriptionStatus, loading, configured } = useProfile();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const testMode = isStripeTestMode();

  if (!user) return <Navigate to="/connexion" replace />;

  async function handleSubscribe() {
    setCheckoutError(null);
    setBusy(true);
    try {
      const { url, error } = await createCheckoutSession(FOUNDER_PRICE_ID);
      if (error) setCheckoutError(error);
      else if (url) window.location.href = url;
    } finally { setBusy(false); }
  }

  async function handlePortal() {
    setPortalError(null);
    setBusy(true);
    try {
      const { url, error } = await openCustomerPortal();
      if (error) setPortalError(error);
      else if (url) window.location.href = url;
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container-quest max-w-3xl py-12">
        <h1 className="font-display text-4xl font-bold">Mon compte</h1>
        <p className="mt-2 text-verdant-400">Connecté en tant que <strong className="text-verdant-100">{user.email}</strong></p>

        {/* Statut abonnement */}
        <div className="mt-8 card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-verdant-50">Statut Membre Fondateur</h2>
              {loading ? (
                <p className="mt-1 text-sm text-verdant-400">Chargement...</p>
              ) : isPremiumMember ? (
                <p className="mt-1 text-sm text-soul-lime">
                  ✓ Membre actif {subscriptionStatus === "trialing" && "(essai)"}
                </p>
              ) : (
                <p className="mt-1 text-sm text-verdant-400">
                  {subscriptionStatus === "canceled" ? "Abonnement annulé" : "Pas encore membre"}
                </p>
              )}
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              isPremiumMember ? "bg-soul-lime/20 text-soul-lime" : "bg-verdant-800 text-verdant-400"
            }`}>
              {isPremiumMember ? "Premium" : "Gratuit"}
            </div>
          </div>

          {!isPremiumMember && (
            <div className="mt-6 border-t border-verdant-800 pt-6">
              <h3 className="font-display text-lg text-soul-lime">Devenir Membre Fondateur</h3>
              <p className="mt-1 text-sm text-verdant-300">9,99 €/mois · Builds premium · Écho étendu · Journaux de dev · Cosmétiques exclusifs</p>
              <button onClick={handleSubscribe} disabled={busy} className="btn-magenta mt-4">
                {busy ? "Redirection..." : testMode ? "S'abonner (mode test)" : "Réserver ma place"}
              </button>
              {!testMode && (
                <p className="mt-2 text-xs text-verdant-500">
                  Le paiement est en cours de configuration. Aucune carte ne sera demandée pour l'instant.
                </p>
              )}
              {checkoutError && (
                <div role="alert" className="mt-3 rounded-lg border border-glitch-red/40 bg-glitch-red/10 px-3 py-2 text-sm text-glitch-red">
                  {checkoutError}
                </div>
              )}
            </div>
          )}

          {isPremiumMember && (
            <div className="mt-6 border-t border-verdant-800 pt-6">
              <h3 className="font-display text-lg text-verdant-50">Gérer mon abonnement</h3>
              <p className="mt-1 text-sm text-verdant-300">Modifier la carte, annuler, voir les factures — via le portail client Stripe.</p>
              <button onClick={handlePortal} disabled={busy} className="btn-ghost mt-4">
                {busy ? "Redirection..." : "Ouvrir le portail client"}
              </button>
              {portalError && (
                <div role="alert" className="mt-3 rounded-lg border border-glitch-red/40 bg-glitch-red/10 px-3 py-2 text-sm text-glitch-red">
                  {portalError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profil */}
        <div className="mt-6 card">
          <h2 className="font-display text-xl text-verdant-50">Profil</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-verdant-400">Email</dt><dd className="text-verdant-100">{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-verdant-400">ID</dt><dd className="font-rune text-xs text-verdant-300">{user.id}</dd></div>
            <div className="flex justify-between"><dt className="text-verdant-400">Inscrit le</dt><dd className="text-verdant-100">{new Date(user.created_at).toLocaleDateString("fr-FR")}</dd></div>
            {profile?.display_name && (
              <div className="flex justify-between"><dt className="text-verdant-400">Nom</dt><dd className="text-verdant-100">{profile.display_name}</dd></div>
            )}
          </dl>
          {!configured && (
            <p className="mt-4 rounded-lg border border-soul-gold/30 bg-soul-gold/10 px-3 py-2 text-xs text-soul-gold">
              Mode démo — les données de profil ne sont pas persistées.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Link to="/" className="text-sm text-verdant-400 hover:text-soul-lime">← Retour à l'accueil</Link>
          <button onClick={() => signOut()} className="btn-ghost">Déconnexion</button>
        </div>
      </div>
    </div>
  );
}
