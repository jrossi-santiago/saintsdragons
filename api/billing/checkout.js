/* POST /api/billing/checkout — start the $6/month subscription.
 *
 * The checkout is on our own page (#checkout in /account), built from
 * Stripe's Checkout Sessions API in its custom UI mode: this makes the
 * session and hands back its client_secret, and the page mounts Stripe's
 * Payment Element with it. The card is typed into Stripe's iframe and goes
 * straight to Stripe, so no card detail ever touches this site.
 *
 * `ui_mode: 'custom'` is the name on the API version pinned in
 * _lib/stripe.js (2025-08-27.basil). Stripe renamed it 'elements' in
 * 2026-03-25.dahlia, and the page's Stripe.js is pinned to basil to match —
 * move both together or not at all.
 *
 * Signed in only. Signing up is one step and signs a new reader straight in
 * (see api/auth/request-link.js), so every checkout already has an account
 * to belong to and nobody has to be matched up by email afterwards. The
 * webhook is still the only thing that grants the plan; return_url is just
 * a page.
 *
 * One open session per reader. Leaving the page halfway and coming back
 * (or a second tab) picks up the session already open, with any code still
 * on it, rather than starting another each time: see resume() below.
 *
 * Stripe's hosted Checkout is kept as the fallback, answered as { url }
 * instead of { clientSecret }: when this deployment has no publishable key,
 * when the page asks for it ({ hosted: true }) because Stripe.js could not
 * start, or when Stripe refuses the custom session. Paying is never more
 * broken than it was before the on-site checkout existed.
 */

const { sql } = require("../_lib/db");
const { currentUser } = require("../_lib/session");
const { stripe, priceId, customerFor } = require("../_lib/stripe");
const { SITE_URL, json, methodNotAllowed, readBody } = require("../_lib/http");

/* A session this close to Stripe's own 24-hour limit is let go and a new one
   made, rather than handed to somebody who may take a while over the form. */
const FRESH_FOR_MS = 30 * 60 * 1000;

/* users.checkout_session_id, or undefined when that column is not there yet
   (schema.sql not re-run: see LESSONS-LEARNED.md, rule 14). Without it every
   visit makes a new session, which is how this worked before. */
async function remembered(userId) {
  try {
    const row = await sql.one`select checkout_session_id from users where id = ${userId}`;
    return row ? row.checkout_session_id : null;
  } catch (e) {
    if (e.code !== "42703") throw e;
    console.error("checkout: users.checkout_session_id is missing — re-run db/schema.sql");
    return undefined;
  }
}

/* Only replaces the id this request read, so two tabs starting at once
   cannot both think theirs is the one. False when the other got there first. */
async function remember(userId, was, id) {
  const row = await sql.one`
    update users set checkout_session_id = ${id}
     where id = ${userId} and checkout_session_id is not distinct from ${was}
    returning id`;
  return !!row;
}

async function retrieve(id) {
  try {
    return await stripe().checkout.sessions.retrieve(id);
  } catch (e) {
    if (e.type !== "StripeInvalidRequestError") throw e;
    return null;   /* gone, or made with other keys: as good as never */
  }
}

async function expire(id) {
  try {
    await stripe().checkout.sessions.expire(id);
  } catch (e) {
    /* Already complete or expired: nothing left that could take money. */
    if (e.type !== "StripeInvalidRequestError") throw e;
  }
}

/* Can this open session be handed out again for what is being asked now? */
function reusable(s, hosted, customer) {
  if (!s || s.status !== "open" || s.customer !== customer) return false;
  if (s.expires_at * 1000 - Date.now() < FRESH_FOR_MS) return false;
  return hosted ? s.ui_mode === "hosted" && !!s.url
                : s.ui_mode === "custom" && !!s.client_secret;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = await currentUser(req);
  if (!user) {
    return json(res, 401, { error: "not_signed_in", message: "Sign in or start free first, then choose Every day." });
  }
  if (user.plan === "paid") {
    return json(res, 409, { error: "already_subscribed", message: "You are already on Every day." });
  }

  const customer = await customerFor(user, sql);
  const common = {
    mode: "subscription",
    line_items: [{ price: priceId(), quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    customer,
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } }
  };
  /* Stripe fills in the session id. The page uses it to ask how the
     payment went while it waits for the webhook. */
  const back = `${SITE_URL}/account?checkout=done&session_id={CHECKOUT_SESSION_ID}#checkout`;

  const answer = s => json(res, 200, s.ui_mode === "custom" ? { clientSecret: s.client_secret } : { url: s.url });

  const body = await readBody(req).catch(() => ({}));
  let hosted = !process.env.STRIPE_PUBLISHABLE_KEY || !!(body && body.hosted);

  /* ------------------------------------------------ resume what is open */
  const was = await remembered(user.id);
  if (was) {
    const old = await retrieve(was);
    if (old && old.status === "complete") {
      /* Paid, and the webhook has not said so yet: that is what the plan
         check above cannot see. Making another session here is how a
         reader pays twice. Once the webhook has written the subscription
         and the plan is still free, it has since ended, and paying again
         is a new start. */
      const seen = old.subscription &&
        await sql.one`select 1 as yes from subscriptions where id = ${old.subscription}`;
      if (!seen) {
        return json(res, 409, { error: "payment_processing", sessionId: old.id,
          message: "Stripe has your payment and is telling us now." });
      }
    }
    if (reusable(old, hosted, customer)) return answer(old);
    if (old && old.status === "open") await expire(old.id);
  }

  /* ------------------------------------------------------ or start one */

  /* Stripe's own hosted page, as before the on-site checkout existed. The
     fallback whenever ours cannot run, so paying is never more broken than
     it used to be: no publishable key on this deployment, the page asking
     for it because Stripe.js failed to start, or Stripe refusing the custom
     session below. Cancelling goes to the account, not back to #checkout,
     which would only try the same thing again. */
  let session;
  if (!hosted) {
    try {
      session = await stripe().checkout.sessions.create({ ...common, ui_mode: "custom", return_url: back });
    } catch (e) {
      if (e.type !== "StripeInvalidRequestError") throw e;
      console.error("checkout: Stripe refused the custom session, sending to the hosted page:", e.message);
      hosted = true;
    }
  }
  if (hosted) {
    session = await stripe().checkout.sessions.create({
      ...common,
      success_url: back,
      cancel_url: `${SITE_URL}/account#account`
    });
  }

  /* Another tab got its session remembered first: use that one and let
     this one go, so there is only ever one open to pay into. */
  if (was !== undefined && !(await remember(user.id, was, session.id))) {
    const now = await remembered(user.id);
    const theirs = now && await retrieve(now);
    if (reusable(theirs, hosted, customer)) {
      await expire(session.id);
      return answer(theirs);
    }
  }

  return answer(session);
};
