/**
 * Configuration Stripe côté client.
 * On n'importe la publishable key QUE pour rediriger vers Checkout/Portal.
 * Le secret (`sk_test_...`) reste serveur-only (API routes Vercel).
 */
import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

/**
 * Gate de sécurité : tant qu'on n'a PAS une clé TEST, le checkout est désactivé.
 * On refuse d'utiliser une clé LIVE pour éviter des paiements réels pendant le dev.
 */
export function isStripeTestMode(): boolean {
  if (!publishableKey) return false;
  return publishableKey.startsWith("pk_test_");
}

export const isStripeConfigured = Boolean(publishableKey);

let _stripe: Promise<Stripe | null> | null = null;
export function getStripe(): Promise<Stripe | null> {
  if (!_stripe) {
    _stripe = loadStripe(publishableKey || "");
  }
  return _stripe;
}

/** Appelle l'API route /api/checkout pour créer une session Checkout. */
export async function createCheckoutSession(priceId: string): Promise<{ url?: string; error?: string }> {
  if (!isStripeTestMode()) {
    return {
      error:
        "Le paiement est temporairement désactivé (mode test en cours de configuration). " +
        "Revenez bientôt — en attendant, la découverte et la démo restent gratuites.",
    };
  }
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Erreur lors de la création de la session." };
    return { url: data.url };
  } catch (e) {
    return { error: "Réseau injoignable. Réessaie dans un instant." };
  }
}

/** Appelle /api/portal pour ouvrir le Customer Portal. */
export async function openCustomerPortal(): Promise<{ url?: string; error?: string }> {
  if (!isStripeTestMode()) {
    return { error: "Portail client indisponible en mode démo." };
  }
  try {
    const res = await fetch("/api/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Erreur lors de l'ouverture du portail." };
    return { url: data.url };
  } catch (e) {
    return { error: "Réseau injoignable." };
  }
}
