-- ============================================================================
-- HERMES QUEST — Migration additive (à appliquer sur le projet Supabase)
-- Tables namespacées hermes_* pour coexister avec d'autres projets du compte.
-- Idempotente : safe de rejouer. Aucun DROP.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES — données publiques du joueur
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hermes_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT,
    avatar_url      TEXT,
    bio             TEXT,
    founded_member  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-création du profil à l'inscription
CREATE OR REPLACE FUNCTION public.hermes_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.hermes_profiles (id, display_name)
    VALUES (NEW.id, split_part(NEW.email, '@', 1))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS hermes_on_auth_user_created ON auth.users;
CREATE TRIGGER hermes_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.hermes_handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. SUBSCRIPTIONS — miroir de l'état Stripe (mis à jour par le webhook)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hermes_subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id      TEXT NOT NULL,
    stripe_subscription_id  TEXT UNIQUE,
    status                  TEXT NOT NULL CHECK (
        status IN ('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid')
    ),
    price_id                TEXT,
    current_period_end      TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hermes_subs_user_id ON public.hermes_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_hermes_subs_customer ON public.hermes_subscriptions(stripe_customer_id);

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY — chaque joueur ne voit QUE ses propres lignes
-- ----------------------------------------------------------------------------

-- PROFILES
ALTER TABLE public.hermes_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hermes_profiles_select_own" ON public.hermes_profiles;
CREATE POLICY "hermes_profiles_select_own" ON public.hermes_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "hermes_profiles_update_own" ON public.hermes_profiles;
CREATE POLICY "hermes_profiles_update_own" ON public.hermes_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "hermes_profiles_insert_own" ON public.hermes_profiles;
CREATE POLICY "hermes_profiles_insert_own" ON public.hermes_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- SUBSCRIPTIONS
ALTER TABLE public.hermes_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hermes_subs_select_own" ON public.hermes_subscriptions;
CREATE POLICY "hermes_subs_select_own" ON public.hermes_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Insert/update uniquement via service_role (webhook serveur) — pas depuis le client.
-- Le client ne peut que SELECT.

-- ----------------------------------------------------------------------------
-- 4. UPDATED_AT triggers
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.hermes_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hermes_profiles_updated_at ON public.hermes_profiles;
CREATE TRIGGER hermes_profiles_updated_at
    BEFORE UPDATE ON public.hermes_profiles
    FOR EACH ROW EXECUTE FUNCTION public.hermes_set_updated_at();

DROP TRIGGER IF EXISTS hermes_subs_updated_at ON public.hermes_subscriptions;
CREATE TRIGGER hermes_subs_updated_at
    BEFORE UPDATE ON public.hermes_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.hermes_set_updated_at();

-- ============================================================================
-- FIN — Migration hermes-quest v1
-- Pour annuler : DROP TABLE public.hermes_profiles, public.hermes_subscriptions;
-- ============================================================================
