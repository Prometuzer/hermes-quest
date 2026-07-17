-- Hermes Quest — migration additive, idempotente et namespacée.

create table if not exists public.hermes_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 2 and 30),
  avatar_url text,
  bio text check (char_length(bio) <= 500),
  founded_member boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hermes_stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hermes_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null check (status in (
    'incomplete', 'incomplete_expired', 'trialing', 'active',
    'past_due', 'canceled', 'unpaid', 'paused'
  )),
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hermes_subscriptions add column if not exists current_period_start timestamptz;
alter table public.hermes_subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.hermes_subscriptions add column if not exists canceled_at timestamptz;

create index if not exists idx_hermes_subs_user_id on public.hermes_subscriptions(user_id);
create index if not exists idx_hermes_subs_customer on public.hermes_subscriptions(stripe_customer_id);
create index if not exists idx_hermes_subs_status on public.hermes_subscriptions(status);

alter table public.hermes_profiles enable row level security;
alter table public.hermes_stripe_customers enable row level security;
alter table public.hermes_subscriptions enable row level security;

do $$ begin
  create policy "hermes_profiles_select_own" on public.hermes_profiles
    for select to authenticated using ((select auth.uid()) = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "hermes_profiles_update_own" on public.hermes_profiles
    for update to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "hermes_subs_select_own" on public.hermes_subscriptions
    for select to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

-- Aucune policy sur hermes_stripe_customers : service-role uniquement.
-- Aucune écriture client sur les abonnements : webhook signé uniquement.
revoke all on table public.hermes_stripe_customers from anon, authenticated;
revoke insert, update, delete on table public.hermes_subscriptions from anon, authenticated;
revoke update on table public.hermes_profiles from authenticated;
grant select on table public.hermes_profiles, public.hermes_subscriptions to authenticated;
grant update (display_name, avatar_url, bio, updated_at) on table public.hermes_profiles to authenticated;

create or replace function public.hermes_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.hermes_profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.hermes_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'hermes_on_auth_user_created' and tgrelid = 'auth.users'::regclass
  ) then
    create trigger hermes_on_auth_user_created
      after insert on auth.users
      for each row execute function public.hermes_handle_new_user();
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'hermes_profiles_updated_at' and tgrelid = 'public.hermes_profiles'::regclass
  ) then
    create trigger hermes_profiles_updated_at
      before update on public.hermes_profiles
      for each row execute function public.hermes_set_updated_at();
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'hermes_subs_updated_at' and tgrelid = 'public.hermes_subscriptions'::regclass
  ) then
    create trigger hermes_subs_updated_at
      before update on public.hermes_subscriptions
      for each row execute function public.hermes_set_updated_at();
  end if;
end $$;
