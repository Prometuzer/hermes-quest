import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient, appUrl, authenticatedUser, noStore, publicError, stripeClient } from "./_lib/server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  try {
    const user = await authenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Session invalide ou expirée." });
    const { data: mapping, error } = await adminClient()
      .from("hermes_stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!mapping) return res.status(404).json({ error: "Aucun compte Stripe n’est lié à ce profil." });

    const session = await stripeClient().billingPortal.sessions.create({
      customer: mapping.stripe_customer_id,
      return_url: `${appUrl(req)}/compte`,
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(503).json({
      error: publicError(error, "Le portail de facturation n’est pas encore disponible."),
    });
  }
}
