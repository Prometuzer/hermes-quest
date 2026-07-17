import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function adminClient() {
  return createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function stripeClient() {
  const key = required("STRIPE_TEST_SECRET_KEY");
  if (!key.startsWith("sk_test_")) throw new Error("Hermes Checkout is locked to Stripe test mode");
  return new Stripe(key);
}

export async function authenticatedUser(req: VercelRequest) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await adminClient().auth.getUser(token);
  return error ? null : data.user;
}

export function appUrl(req: VercelRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const host = req.headers.host || "127.0.0.1:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

export function noStore(res: VercelResponse) {
  res.setHeader?.("Cache-Control", "no-store");
}

export function publicError(error: unknown, message: string) {
  console.error(error instanceof Error ? error.message : error);
  return message;
}
