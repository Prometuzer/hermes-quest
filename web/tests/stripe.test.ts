/**
 * Tests du client Stripe — vérifie la gate de sécurité TEST vs LIVE.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Stripe client gate", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("désactive le checkout quand pas de clé publishable", async () => {
    vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "");
    const { isStripeTestMode } = await import("@/lib/stripe");
    expect(isStripeTestMode()).toBe(false);
  });

  it("désactive le checkout quand clé LIVE est présente", async () => {
    vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "pk_live_xxx");
    const { isStripeTestMode } = await import("@/lib/stripe");
    expect(isStripeTestMode()).toBe(false);
  });

  it("active le checkout quand clé TEST est présente", async () => {
    vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "pk_test_xxx");
    const { isStripeTestMode } = await import("@/lib/stripe");
    expect(isStripeTestMode()).toBe(true);
  });

  it("retourne une erreur claire quand checkout désactivé", async () => {
    vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "pk_live_xxx");
    const { createCheckoutSession } = await import("@/lib/stripe");
    const { error } = await createCheckoutSession("price_xxx");
    expect(error).toBeTruthy();
    expect(error).toContain("mode test");
  });
});
