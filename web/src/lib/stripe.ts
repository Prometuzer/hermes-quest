/** Configuration Stripe côté client. Le secret reste serveur-only. */
import { supabase } from "@/lib/supabase";

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
    if (!supabase) return { error: "Le compte Supabase n’est pas configuré sur cette preview." };
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;
    if (!token) return { error: "Connecte-toi avant de commencer l’essai." };
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    if (!supabase) return { error: "Le compte Supabase n’est pas configuré sur cette preview." };
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;
    if (!token) return { error: "Connecte-toi pour ouvrir le portail." };
    const res = await fetch("/api/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Erreur lors de l'ouverture du portail." };
    return { url: data.url };
  } catch (e) {
    return { error: "Réseau injoignable." };
  }
}
