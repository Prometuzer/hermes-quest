/**
 * /api/checkout — Crée une session Stripe Checkout (subscription).
 * Nécessite une clé TEST côté serveur (STRIPE_TEST_SECRET_KEY).
 * Si seule une clé LIVE est présente, on refuse pour éviter des paiements réels.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const TEST_KEY = process.env.STRIPE_TEST_SECRET_KEY;
const LIVE_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:5174";
const FOUNDER_PRICE_ID = process.env.STRIPE_FOUNDER_PRICE_ID;

function getClientIp(req: VercelRequest): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // GATE DE SÉCURITÉ : on n'utilise JAMAIS la clé LIVE pour le checkout dev.
  if (!TEST_KEY) {
    return res.status(503).json({
      error:
        "Le checkout est désactivé : seule une clé LIVE est configurée. " +
        "Ajoutez STRIPE_TEST_SECRET_KEY dans les variables d'environnement Vercel.",
    });
  }

  if (!FOUNDER_PRICE_ID) {
    return res.status(500).json({ error: "STRIPE_FOUNDER_PRICE_ID non configuré." });
  }

  // Auth : on attend un header Authorization Bearer <supabase_access_token>
  // (le client Supabase le fournit via user.session.access_token)
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié." });
  }

  const stripe = new Stripe(TEST_KEY);

  try {
    // TODO: vérifier le token Supabase et récupérer l'email + user_id.
    // Pour l'instant on crée une session guest — le webhook mettra à jour Supabase.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: FOUNDER_PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/compte?checkout=success`,
      cancel_url: `${APP_URL}/compte?checkout=cancelled`,
      subscription_data: {
        trial_period_days: 7,
        metadata: { source: "hermes-quest", ip: getClientIp(req) },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error("[checkout] Stripe error:", e.message);
    return res.status(502).json({ error: "Erreur Stripe lors de la création de la session." });
  }
}
