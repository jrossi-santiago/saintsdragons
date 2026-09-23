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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = await currentUser(req);
  if (!user) {
    return json(res, 401, { error: "not_signed_in", message: "Sign in or start free first, then choose Every day." });
  }
  if (user.plan === "paid") {
    return json(res, 409, { error: "already_subscribed", message: "You are already on Every day." });
  }

  const common = {
    mode: "subscription",
    line_items: [{ price: priceId(), quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    customer: await customerFor(user, sql),
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } }
  };
  /* Stripe fills in the session id. The page uses it to ask how the
     payment went while it waits for the webhook. */
  const back = `${SITE_URL}/account?checkout=done&session_id={CHECKOUT_SESSION_ID}#checkout`;

  /* Stripe's own hosted page, as before the on-site checkout existed. The
     fallback whenever ours cannot run, so paying is never more broken than
     it used to be: no publishable key on this deployment, the page asking
     for it because Stripe.js failed to start, or Stripe refusing the custom
     session below. Cancelling goes to the account, not back to #checkout,
     which would only try the same thing again. */
  const hosted = async () => {
    const session = await stripe().checkout.sessions.create({
      ...common,
      success_url: back,
      cancel_url: `${SITE_URL}/account#account`
    });
    return json(res, 200, { url: session.url });
  };

  const body = await readBody(req).catch(() => ({}));
  if (!process.env.STRIPE_PUBLISHABLE_KEY || (body && body.hosted)) return hosted();

  let session;
  try {
    session = await stripe().checkout.sessions.create({ ...common, ui_mode: "custom", return_url: back });
  } catch (e) {
    if (e.type !== "StripeInvalidRequestError") throw e;
    console.error("checkout: Stripe refused the custom session, sending to the hosted page:", e.message);
    return hosted();
  }

  return json(res, 200, { clientSecret: session.client_secret });
};
