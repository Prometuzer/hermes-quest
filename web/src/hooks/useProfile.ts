import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Profile, SubscriptionStatus } from "@/types/database";
import { isPremium } from "@/types/database";

/**
 * Charge le profil + le statut d'abonnement de l'utilisateur courant.
 * Gère le mode mock quand Supabase n'est pas configuré.
 */
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setSubscriptionStatus(null);
      setLoading(false);
      return;
    }
    if (!supabase) {
      // Mock
      setProfile({
        id: user.id,
        display_name: user.email?.split("@")[0] ?? null,
        avatar_url: null,
        bio: null,
        founded_member: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setSubscriptionStatus(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: p }, { data: subs }] = await Promise.all([
        supabase.from("hermes_profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("hermes_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (cancelled) return;
      setProfile(p as Profile | null);
      setSubscriptionStatus((subs as any)?.status ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  return {
    profile,
    subscriptionStatus,
    isPremiumMember: isPremium(subscriptionStatus),
    loading,
    configured: isSupabaseConfigured,
  };
}
