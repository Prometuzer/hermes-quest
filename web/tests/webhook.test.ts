/**
 * Test du webhook Stripe : vérifie que le handler refuse les signatures invalides.
 */
import { describe, it, expect, vi } from "vitest";

// Mock process.env avant import
vi.stubEnv("STRIPE_TEST_SECRET_KEY", "sk_test_fake");
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fake");

describe("Stripe webhook handler", () => {
  it("refuse les requêtes sans signature", async () => {
    // Import dynamique car le handler lit process.env au runtime
    const { default: handler } = await import("../../api/webhook");

    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };

    await handler({ method: "POST", headers: {}, body: "{}" } as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("Signature webhook invalide") })
    );
  });

  it("retourne 405 pour les méthodes non POST", async () => {
    const { default: handler } = await import("../../api/webhook");
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    await handler({ method: "GET", headers: {} } as any, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});

describe("Checkout handler gate", () => {
  it("refuse le checkout sans clé TEST", async () => {
    vi.stubEnv("STRIPE_TEST_SECRET_KEY", "");
    vi.resetModules();
    const { default: handler } = await import("../../api/checkout");
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    await handler({
      method: "POST",
      headers: { authorization: "Bearer fake" },
      body: { priceId: "price_x" },
    } as any, res);
    expect(res.status).toHaveBeenCalledWith(503);
  });
});

describe("Sécurité de la plateforme", () => {
  it("n'utilise jamais une clé Stripe live comme repli", async () => {
    vi.stubEnv("STRIPE_TEST_SECRET_KEY", "sk_live_forbidden");
    vi.resetModules();
    const { stripeClient } = await import("../../api/_lib/server");
    expect(() => stripeClient()).toThrow(/test mode/i);
  });

  it("le portail client exige une session", async () => {
    vi.stubEnv("STRIPE_TEST_SECRET_KEY", "sk_test_fake");
    vi.resetModules();
    const { default: handler } = await import("../../api/portal");
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), setHeader: vi.fn() };
    await handler({ method: "POST", headers: {} } as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
