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
 */

const { sql } = require("../_lib/db");
const { currentUser } = require("../_lib/session");
const { stripe, priceId, customerFor } = require("../_lib/stripe");
const { SITE_URL, json, methodNotAllowed } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = await currentUser(req);
  if (!user) {
    return json(res, 401, { error: "not_signed_in", message: "Sign in or start free first, then choose Every day." });
  }
  if (user.plan === "paid") {
    return json(res, 409, { error: "already_subscribed", message: "You are already on Every day." });
  }

  const session = await stripe().checkout.sessions.create({
    ui_mode: "custom",
    mode: "subscription",
    line_items: [{ price: priceId(), quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    customer: await customerFor(user, sql),
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } },
    /* Stripe fills in the session id. The page uses it to ask how the
       payment went while it waits for the webhook. */
    return_url: `${SITE_URL}/account?checkout=done&session_id={CHECKOUT_SESSION_ID}#checkout`
  });

  return json(res, 200, { clientSecret: session.client_secret });
};
