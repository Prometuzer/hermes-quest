import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Stripe from "stripe";
import { adminClient, noStore, publicError, stripeClient } from "./_lib/server.js";

export const config = { api: { bodyParser: false } };

async function rawBody(req: VercelRequest): Promise<string> {
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  if (typeof req.body === "string") return req.body;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks.map((chunk) => chunk.toString("utf8")).join("");
}

const toIso = (value?: number | null) => value ? new Date(value * 1000).toISOString() : null;

async function syncSubscription(stripe: Stripe, subscription: Stripe.Subscription) {
  const supabase = adminClient();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  let userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    const { data } = await supabase.from("hermes_stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = data?.user_id;
  }
  if (!userId) {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) userId = (customer as Stripe.Customer).metadata?.supabase_user_id;
  }
  if (!userId) throw new Error(`No Supabase mapping for Stripe subscription ${subscription.id}`);

  const item = subscription.items.data[0];
  const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start
    || (item as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
    || (item as unknown as { current_period_end?: number }).current_period_end;

  const { error: mappingError } = await supabase.from("hermes_stripe_customers").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
  }, { onConflict: "user_id" });
  if (mappingError) throw mappingError;

  const { error } = await supabase.from("hermes_subscriptions").upsert({
    stripe_subscription_id: subscription.id,
    user_id: userId,
    stripe_customer_id: customerId,
    status: subscription.status,
    price_id: item?.price?.id || null,
    current_period_start: toIso(periodStart),
    current_period_end: toIso(periodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: toIso(subscription.canceled_at),
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers["stripe-signature"];
    if (!secret || typeof signature !== "string") throw new Error("Missing Stripe webhook signature or secret");
    const stripe = stripeClient();
    const event = stripe.webhooks.constructEvent(await rawBody(req), signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (userId && customerId) {
        const { error } = await adminClient().from("hermes_stripe_customers").upsert({
          user_id: userId,
          stripe_customer_id: customerId,
        }, { onConflict: "user_id" });
        if (error) throw error;
      }
      if (session.subscription) {
        const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await syncSubscription(stripe, await stripe.subscriptions.retrieve(id));
      }
    } else if (event.type.startsWith("customer.subscription.")) {
      await syncSubscription(stripe, event.data.object as Stripe.Subscription);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).json({
      error: publicError(error, "Signature webhook invalide."),
    });
  }
}
