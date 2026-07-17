/**
 * Tests du hook useAuth en mode mock (sans Supabase configuré).
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAuth (mode mock)", () => {
  it("commence non authentifié", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Attend que loading = false
    await act(() => new Promise(r => setTimeout(r, 10)));
    expect(result.current.user).toBeNull();
    expect(result.current.configured).toBe(false);
  });

  it("inscrit un utilisateur en mode mock", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => new Promise(r => setTimeout(r, 10)));

    let error: string | null = "init";
    await act(async () => {
      const r = await result.current.signUp("test@example.com", "password123");
      error = r.error;
    });
    expect(error).toBeNull();
  });

  it("refuse un email déjà inscrit", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => new Promise(r => setTimeout(r, 10)));

    await act(async () => {
      await result.current.signUp("dup@example.com", "password123");
    });
    let error: string | null = null;
    await act(async () => {
      const r = await result.current.signUp("dup@example.com", "password123");
      error = r.error;
    });
    expect(error).toBeTruthy();
    expect(error).toContain("déjà");
  });

  it("connecte avec les bons identifiants", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => new Promise(r => setTimeout(r, 10)));

    await act(async () => {
      await result.current.signUp("login@example.com", "password123");
    });
    let error: string | null = "init";
    await act(async () => {
      const r = await result.current.signIn("login@example.com", "password123");
      error = r.error;
    });
    expect(error).toBeNull();
    expect(result.current.user?.email).toBe("login@example.com");
  });

  it("refuse un mauvais mot de passe", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => new Promise(r => setTimeout(r, 10)));

    await act(async () => {
      await result.current.signUp("wrongpass@example.com", "password123");
    });
    let error: string | null = null;
    await act(async () => {
      const r = await result.current.signIn("wrongpass@example.com", "wrongpassword");
      error = r.error;
    });
    expect(error).toBeTruthy();
  });

  it("déconnecte proprement", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => new Promise(r => setTimeout(r, 10)));

    await act(async () => {
      await result.current.signUp("logout@example.com", "password123");
      await result.current.signIn("logout@example.com", "password123");
    });
    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.user).toBeNull();
  });
});
