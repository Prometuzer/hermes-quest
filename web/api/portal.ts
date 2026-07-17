/**
 * /api/portal — Ouvre le Stripe Customer Portal pour gérer l'abonnement.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const TEST_KEY = process.env.STRIPE_TEST_SECRET_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:5174";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!TEST_KEY) {
    return res.status(503).json({
      error: "Le portail client est désactivé (mode test non configuré).",
    });
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié." });
  }

  // TODO: extraire le stripe_customer_id depuis Supabase via le user_id du token.
  // Pour l'instant on retourne une erreur claire.
  return res.status(400).json({
    error: "Customer ID non résolu. La liaison Supabase → Stripe est en cours d'implémentation.",
  });
}
