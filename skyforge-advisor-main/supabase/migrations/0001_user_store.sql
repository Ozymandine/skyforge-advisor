-- supabase/migrations/0001_user_store.sql
-- Per-user store for alerts, webhooks, notifications. Run once in the
-- Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Phase 1.5 design (no login UI yet):
-- - owner_id = stable per-browser client id (sba.clientId, a UUID v4).
--   The browser sends it explicitly; server functions zod-validate it.
-- - RLS enabled with permissive anon policies scoped by owner_id in app code.
--   Once Supabase Auth UI lands, tighten to auth.uid() and drop these policies.
--
-- Tables are additive — the existing file/KV fallback keeps working when
-- Supabase env is unset.

create table if not exists public.user_alert_rules (
  owner_id text not null,
  rule_id text not null,
  item_id text not null,
  item_name text not null,
  direction text not null check (direction in ('below', 'above')),
  threshold double precision not null check (threshold > 0),
  updated_at timestamptz not null default now(),
  primary key (owner_id, rule_id)
);

create table if not exists public.user_webhooks (
  owner_id text primary key,
  url text not null,
  failures int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_notifications (
  owner_id text not null,
  notif_id text not null,
  title text not null,
  body text not null default '',
  kind text not null default 'market',
  time timestamptz not null default now(),
  unread boolean not null default true,
  primary key (owner_id, notif_id)
);
create index if not exists user_notifications_owner_time_idx
  on public.user_notifications (owner_id, time desc);

alter table public.user_alert_rules enable row level security;
alter table public.user_webhooks enable row level security;
alter table public.user_notifications enable row level security;

-- Permissive anon policies for the pre-auth phase. App code always filters by
-- owner_id (a random per-browser UUID). Replace with auth.uid() checks later.
drop policy if exists "anon_all_alert_rules" on public.user_alert_rules;
create policy "anon_all_alert_rules" on public.user_alert_rules
  for all to anon using (true) with check (true);

drop policy if exists "anon_all_webhooks" on public.user_webhooks;
create policy "anon_all_webhooks" on public.user_webhooks
  for all to anon using (true) with check (true);

drop policy if exists "anon_all_notifications" on public.user_notifications;
create policy "anon_all_notifications" on public.user_notifications
  for all to anon using (true) with check (true);
