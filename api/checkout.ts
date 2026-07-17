import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient, appUrl, authenticatedUser, noStore, publicError, stripeClient } from "./_lib/server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });

  try {
    const user = await authenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Session invalide ou expirée." });
    const priceId = process.env.STRIPE_FOUNDER_PRICE_ID || "";
    if (!priceId.startsWith("price_")) throw new Error("Missing STRIPE_FOUNDER_PRICE_ID");

    const supabase = adminClient();
    const { data: active, error: subscriptionError } = await supabase
      .from("hermes_subscriptions")
      .select("stripe_subscription_id,status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"])
      .limit(1)
      .maybeSingle();
    if (subscriptionError) throw subscriptionError;
    if (active) return res.status(409).json({ error: "Un abonnement existe déjà. Ouvre le portail de facturation." });

    const stripe = stripeClient();
    const { data: mapping, error: mappingReadError } = await supabase
      .from("hermes_stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (mappingReadError) throw mappingReadError;

    let customerId = mapping?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id, source: "hermes-quest" },
      });
      customerId = customer.id;
      const { error } = await supabase.from("hermes_stripe_customers").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
      }, { onConflict: "user_id" });
      if (error) throw error;
    }

    const origin = appUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: user.id, source: "hermes-quest" },
      },
      metadata: { supabase_user_id: user.id, source: "hermes-quest" },
      allow_promotion_codes: true,
      success_url: `${origin}/compte?checkout=success`,
      cancel_url: `${origin}/compte?checkout=cancelled`,
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(503).json({
      error: publicError(error, "Le Checkout test n’est pas encore disponible sur cette preview."),
    });
  }
}
