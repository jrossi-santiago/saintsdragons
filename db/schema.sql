-- Saints & Dragons — the whole database.
--
-- Run it against a fresh Neon branch, or against a local Postgres for
-- development:
--
--     psql "$DATABASE_URL" -f db/schema.sql
--
-- It is written to be re-runnable: every statement is `if not exists`, so
-- applying it to a database that already has some of this is safe. When a
-- column needs to change, add an `alter table ... if not exists` here rather
-- than editing a `create table` that has already shipped — this file is the
-- schema and its history at once, which is enough at this size.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------- people

create table if not exists users (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,          -- always lowercased
  first_name          text,
  child_ages          text[] not null default '{}',  -- '0-2' | '3-5' | '6-9' | '10+'
  source              text,                          -- where they signed up
  onboarded_at        timestamptz,
  stripe_customer_id  text unique,
  created_at          timestamptz not null default now(),
  last_seen_at        timestamptz
);

-- ------------------------------------------------------ logging in, no password
--
-- Both tables hold the SHA-256 of a secret, never the secret. Whoever reads
-- this database cannot log in as anybody with what they find in it.

create table if not exists login_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  token_hash    text not null unique,
  redirect_to   text,                                -- a path on this site only
  expires_at    timestamptz not null,
  used_at       timestamptz,                         -- set once, by the click
  requested_ip  text,
  created_at    timestamptz not null default now()
);

-- The rate limit counts a user's links in the last hour, so it reads this.
create index if not exists login_tokens_user_recent
  on login_tokens (user_id, created_at desc);

create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  user_agent    text,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz not null default now()
);

create index if not exists sessions_user on sessions (user_id);

-- -------------------------------------------------------------------- money
--
-- Written only by api/stripe/webhook.js. One row per Stripe subscription;
-- a reader is on the paid plan when they have one whose status is active,
-- trialing or past_due.

create table if not exists subscriptions (
  id                    text primary key,            -- Stripe's sub_… id
  user_id               uuid not null references users(id) on delete cascade,
  status                text not null,
  price_id              text,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists subscriptions_user on subscriptions (user_id);

-- Stripe retries, and sends the same event more than once. An insert that
-- loses the race here is an event already handled.
create table if not exists stripe_events (
  id           text primary key,                     -- Stripe's evt_… id
  type         text not null,
  received_at  timestamptz not null default now()
);
