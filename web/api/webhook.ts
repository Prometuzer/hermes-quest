/**
 * /api/webhook — Reçoit les événements Stripe et met à jour Supabase.
 *
 * Signature vérifiée via STRIPE_WEBHOOK_SECRET.
 * Événements gérés :
 *   - checkout.session.completed → crée/maj hermes_subscriptions
 *   - customer.subscription.updated → maj status
 *   - customer.subscription.deleted → status = canceled
 *
 * Sécurité : la service_role key Supabase est utilisée serveur-only.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const TEST_KEY = process.env.STRIPE_TEST_SECRET_KEY;
const LIVE_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!WEBHOOK_SECRET || !(TEST_KEY || LIVE_KEY)) {
    return res.status(503).json({ error: "Webhook non configuré." });
  }

  const stripe = new Stripe(TEST_KEY || LIVE_KEY!);

  // Récupère le body brut + la signature
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  let rawBody: string | Buffer;

  try {
    rawBody = req.body || "";
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (e: any) {
    console.error("[webhook] Signature verification failed:", e.message);
    return res.status(400).json({ error: `Webhook Error: ${e.message}` });
  }

  // Initialisation Supabase admin
  const supabase = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = cs.subscription as string;
        const customerId = cs.customer as string;

        // Récupère les détails de la subscription pour le status
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = (sub as any).current_period_end as number;

        if (supabase) {
          // TODO: mapper customerId → user_id via metadata.
          // Pour la v1, on upsert par customer_id.
          await supabase.from("hermes_subscriptions").upsert({
            user_id: cs.metadata?.user_id || "pending",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: sub.status,
            price_id: sub.items.data[0]?.price?.id || null,
            current_period_end: new Date(periodEnd * 1000).toISOString(),
          }, { onConflict: "stripe_customer_id" });
        }
        console.log("[webhook] checkout.session.completed:", cs.id);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const periodEnd = (sub as any).current_period_end as number;
        if (supabase) {
          await supabase.from("hermes_subscriptions")
            .update({
              status: sub.status,
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", sub.id);
        }
        console.log("[webhook] subscription event:", event.type, sub.id);
        break;
      }
      default:
        console.log("[webhook] unhandled event:", event.type);
    }

    return res.status(200).json({ received: true });
  } catch (e: any) {
    console.error("[webhook] handler error:", e.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
