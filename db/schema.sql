-- Saints & Dragons — the whole database.
--
-- Run it against a fresh Supabase project, or against a local Postgres for
-- development:
--
--     psql "$DATABASE_URL" -f db/schema.sql
--
-- or paste the whole file into Supabase's SQL Editor and run it.
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

-- A new address is signed in on the spot, with no email round trip (see
-- api/auth/request-link.js), so an account can exist for an address nobody
-- has proved they own. This is when somebody first did, by clicking a link
-- sent to it. api/auth/verify.js signs out every other session at that
-- moment: whoever made the account before the owner turned up does not get
-- to stay in it.
alter table users add column if not exists email_verified_at timestamptz;

-- Everybody who has ever used a link has proved their address already.
update users u
   set email_verified_at = t.first_used
  from (select user_id, min(used_at) as first_used
          from login_tokens where used_at is not null group by user_id) t
 where t.user_id = u.id and u.email_verified_at is null;

-- Changing the address on an account (a typo made at signup, say) goes by
-- link, like everything else: the link goes to the new address, and the
-- account only moves to it when that link is opened (api/auth/verify.js).
-- Until then the pending address lives here, on the link, and nowhere else.
alter table login_tokens add column if not exists new_email text;

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

-- Paid access by hand, with no money involved: for testing the paid view, or
-- for giving a reader the site on the house. Flip it in Supabase's table
-- editor and reload. Nothing but a person writes it; Stripe never reads or
-- touches it, and it never takes access away from a reader who is paying.
-- false only means free for an account with no live subscription.
alter table users add column if not exists comp_access boolean not null default false;

-- The reader's open Checkout Session, so leaving #checkout halfway and coming
-- back picks up the same one (with any code already applied) instead of
-- starting another. Written by api/billing/checkout.js; Stripe's own record
-- is the truth about whether it is still open.
alter table users add column if not exists checkout_session_id text;

-- Stripe retries, and sends the same event more than once. An insert that
-- loses the race here is an event already handled.
create table if not exists stripe_events (
  id           text primary key,                     -- Stripe's evt_… id
  type         text not null,
  received_at  timestamptz not null default now()
);

-- ------------------------------------------------- keeping it off the web
--
-- Supabase publishes the `public` schema through its Data API, and grants
-- the `anon` and `authenticated` roles access to new tables in it. The
-- anon key is meant to ship in a browser, so left alone that would put
-- every row below one public key away: reader emails in `users`, and the
-- session and login-token hashes that are the nearest thing this system has
-- to passwords.
--
-- Nothing here uses the Data API. The site talks to Postgres directly, as
-- the `postgres` role, which holds BYPASSRLS — so enabling row-level
-- security with no policies at all costs our queries nothing and leaves
-- every other role with no way in. The revoke is the same argument made
-- twice, in case a future table is reached by a different role.
--
-- Do not add a policy to these tables to "make something work". If code
-- needs a row, it goes through api/_lib/db.js like everything else.

alter table users         enable row level security;
alter table login_tokens  enable row level security;
alter table sessions      enable row level security;
alter table subscriptions enable row level security;
alter table stripe_events enable row level security;

-- Guarded, because a plain local Postgres has no such roles and the bare
-- REVOKE would abort the script.
do $$
declare
  r text;
  t text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      foreach t in array array['users', 'login_tokens', 'sessions',
                               'subscriptions', 'stripe_events'] loop
        execute format('revoke all on table public.%I from %I', t, r);
      end loop;
    end if;
  end loop;
end
$$;
