/**
 * Types générérés à la main (à régénérer via `supabase gen types` quand le projet sera branché).
 * Tables namespacées hermes_* pour coexister avec d'autres projets sur le même Supabase.
 */
export interface Database {
  public: {
    Tables: {
      hermes_profiles: {
        Row: {
          id: string;            // = auth.uid()
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          founded_member: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          founded_member?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hermes_profiles"]["Insert"]>;
      };
      hermes_subscriptions: {
        Row: {
          id: string;
          user_id: string;       // = auth.uid()
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          status: "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid";
          price_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id?: string | null;
          status: Database["public"]["Tables"]["hermes_subscriptions"]["Row"]["status"];
          price_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hermes_subscriptions"]["Insert"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["hermes_profiles"]["Row"];
export type Subscription = Database["public"]["Tables"]["hermes_subscriptions"]["Row"];
export type SubscriptionStatus = Subscription["status"];

/** États où le membre a accès aux avantages premium. */
export const ACTIVE_STATUSES: SubscriptionStatus[] = ["trialing", "active"];

export function isPremium(status: SubscriptionStatus | null | undefined): boolean {
  return Boolean(status && ACTIVE_STATUSES.includes(status));
}
