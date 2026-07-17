import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const source = (relative: string) => readFile(new URL(relative, import.meta.url), "utf8");

describe("Contrats de sécurité plateforme", () => {
  it("la migration est additive et protège les tables sensibles", async () => {
    const sql = await source("../supabase/migrations/0001_init_hermes_quest.sql");
    expect(sql).not.toMatch(/\bdrop\b/i);
    expect(sql).toMatch(/hermes_stripe_customers enable row level security/i);
    expect(sql).toMatch(/revoke all on table public\.hermes_stripe_customers/i);
    expect(sql).toMatch(/hermes_subs_select_own/i);
  });

  it("Checkout vérifie le JWT Supabase et impose le prix serveur", async () => {
    const checkout = await source("../../api/checkout.ts");
    expect(checkout).toMatch(/authenticatedUser\(req\)/);
    expect(checkout).toMatch(/process\.env\.STRIPE_FOUNDER_PRICE_ID/);
    expect(checkout).not.toMatch(/req\.body.*priceId/);
    expect(checkout).toMatch(/mode: "subscription"/);
    expect(checkout).toMatch(/trial_period_days: 7/);
  });

  it("le webhook exige une signature et ne tombe jamais sur une clé live", async () => {
    const webhook = await source("../../api/webhook.ts");
    const server = await source("../../api/_lib/server.ts");
    expect(webhook).toMatch(/constructEvent/);
    expect(server).toMatch(/startsWith\("sk_test_"\)/);
    expect(server).not.toMatch(/STRIPE_SECRET_KEY/);
  });

  it("le navigateur ne contient aucun secret serveur", async () => {
    const client = `${await source("../src/lib/stripe.ts")}\n${await source("../src/lib/supabase.ts")}`;
    expect(client).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(client).not.toMatch(/STRIPE_TEST_SECRET_KEY/);
    expect(client).not.toMatch(/sk_(?:test|live)_/);
  });
});
