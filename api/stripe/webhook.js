/* POST /api/stripe/webhook — the only writer of the subscriptions table.
 *
 * Nothing else grants access. Checkout's success page is just a page: the
 * reader can close it, refresh it, or never see it, and a card can fail a
 * month later with nobody on the site at all. So entitlement is whatever
 * Stripe last told us here, and /api/session reads it back.
 *
 * Three things this has to get right:
 *
 *   1. Signature check on the raw bytes. bodyParser is off below for that
 *      reason — a parsed and re-serialised body does not verify.
 *   2. Replay safety. Stripe retries, and will happily send the same event
 *      twice; stripe_events is an insert that either wins or tells us we
 *      have seen this one already.
 *   3. Order safety. Events arrive out of order often enough to matter, so
 *      every write is an upsert of the subscription's current state rather
 *      than a step in a sequence.
 */

const { sql } = require("../_lib/db");
const { stripe } = require("../_lib/stripe");
const { userForEmail } = require("../_lib/users");
const { issueLoginToken, LINK_MINUTES } = require("../_lib/session");
const { sendLoginLink } = require("../_lib/email");
const { SITE_URL, rawBody, json, methodNotAllowed, normaliseEmail } = require("../_lib/http");

function seconds(value) {
  return value ? new Date(value * 1000).toISOString() : null;
}

/* Stripe's subscription object is the whole truth about one subscription,
   so every relevant event ends here with a fresh copy of it. */
async function saveSubscription(sub, fallbackUserId) {
  const userId = sub.metadata?.user_id
    || fallbackUserId
    || (await sql.one`select id from users where stripe_customer_id = ${sub.customer}`)?.id;

  if (!userId) {
    console.error(`stripe: subscription ${sub.id} has no user to attach to`);
    return;
  }

  const item = sub.items?.data?.[0];
  /* Billing period moved onto the item in Stripe's 2025 API; the
     subscription-level field is kept for older payloads on replay. */
  const periodEnd = seconds(item?.current_period_end ?? sub.current_period_end);

  await sql`
    insert into subscriptions
      (id, user_id, status, price_id, current_period_end, cancel_at_period_end, updated_at)
    values (${sub.id}, ${userId}, ${sub.status}, ${item?.price?.id || null},
            ${periodEnd}, ${!!sub.cancel_at_period_end}, now())
    on conflict (id) do update
      set status               = excluded.status,
          price_id             = excluded.price_id,
          current_period_end   = excluded.current_period_end,
          cancel_at_period_end = excluded.cancel_at_period_end,
          updated_at           = now()`;

  await sql`
    update users set stripe_customer_id = ${sub.customer}
     where id = ${userId} and stripe_customer_id is null`;
}

/* A checkout paid for by somebody who was not signed in (see
   api/billing/checkout.js). The email they gave Stripe is the account: an
   address we know gets its subscription, a new one gets made. The user id
   goes onto the subscription's metadata so every later event about it finds
   the reader without guessing, and the Stripe customer goes onto the user so
   the billing portal opens on the one that is paying.

   Then the way in goes to that address. It is the only way in: the payer is
   never signed in by coming back from Stripe, because Stripe does not prove
   an address belongs to whoever typed it. A failed send does not fail the
   event — the subscription is what matters here, and the same address on
   /login gets another link. */
async function claimCheckout(s, sub) {
  const email = normaliseEmail(s.customer_details?.email);
  if (!email) {
    console.error(`stripe: checkout ${s.id} has no usable email to make an account from`);
    return null;
  }
  const firstName = String(s.customer_details?.name || "").trim().split(/\s+/)[0].slice(0, 80) || null;
  const user = await userForEmail(email, { firstName, source: "/checkout" });

  await sql`update users set stripe_customer_id = ${s.customer} where id = ${user.id}`;
  await stripe().subscriptions.update(sub.id, { metadata: { ...sub.metadata, user_id: user.id } });

  try {
    const token = await issueLoginToken(user.id);
    if (token) {
      await sendLoginLink({
        to: email,
        url: `${SITE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`,
        firstName: user.first_name,
        minutes: LINK_MINUTES,
        isNew: user.is_new,
        paid: true
      });
    }
  } catch (e) {
    console.error(`stripe: login link after checkout ${s.id} did not send:`, e.message);
  }

  return user.id;
}

/* Vercel would otherwise parse the body and throw the bytes away; this turns
   that off. Belt and braces below in case a runtime ignores it: a Buffer or a
   string on req.body is still the original bytes and is used as-is. An
   already-parsed object is not recoverable, and the signature check then
   fails loudly with a 400 rather than quietly trusting the payload. */
async function bytes(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  return rawBody(req);
}

async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set — refusing to trust this payload");
    return json(res, 500, { error: "not_configured" });
  }

  let event;
  try {
    const body = await bytes(req);
    event = stripe().webhooks.constructEvent(body, req.headers["stripe-signature"], secret);
  } catch (e) {
    return json(res, 400, { error: "bad_signature", message: e.message });
  }

  const [seen] = await sql`
    insert into stripe_events (id, type) values (${event.id}, ${event.type})
    on conflict (id) do nothing
    returning id`;
  if (!seen) return json(res, 200, { ok: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        if (s.mode === "subscription" && s.subscription) {
          const sub = await stripe().subscriptions.retrieve(s.subscription);
          const userId = s.client_reference_id || (await claimCheckout(s, sub));
          await saveSubscription(sub, userId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
      case "customer.subscription.deleted":
        await saveSubscription(event.data.object, null);
        break;
      default:
        /* Everything else is Stripe telling us about its own bookkeeping. */
        break;
    }
  } catch (e) {
    /* Leave the event for Stripe to retry, and let the row go with it so the
       retry is not mistaken for a duplicate. */
    await sql`delete from stripe_events where id = ${event.id}`.catch(() => {});
    console.error(`stripe: ${event.type} failed:`, e.message);
    return json(res, 500, { error: "handler_failed" });
  }

  return json(res, 200, { ok: true });
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
