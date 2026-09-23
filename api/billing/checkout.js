/* POST /api/billing/checkout — start the $6/month subscription.
 *
 * Stripe's hosted Checkout, so no card detail ever touches this site. The
 * webhook is the only thing that grants access; the return URLs are just
 * pages.
 *
 * Two shapes. A signed-in reader pays on their own Stripe customer and comes
 * back to /account. Anybody else goes to Stripe with no account at all:
 * Stripe asks for the email, and the webhook makes that address the account
 * (or finds it, if we already know it) and emails the way in. They come back
 * to /login, told to look for that email. Nobody is signed in by the return
 * trip itself — Stripe does not check that an address belongs to whoever
 * typed it, and a session handed out on that would be an account takeover.
 */

const { sql } = require("../_lib/db");
const { currentUser } = require("../_lib/session");
const { stripe, priceId, customerFor } = require("../_lib/stripe");
const { SITE_URL, json, methodNotAllowed } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = await currentUser(req);
  if (user && user.plan === "paid") {
    return json(res, 409, { error: "already_subscribed", message: "You are already on Every day." });
  }

  const common = {
    mode: "subscription",
    line_items: [{ price: priceId(), quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto"
  };

  const session = user
    ? await stripe().checkout.sessions.create({
        ...common,
        customer: await customerFor(user, sql),
        client_reference_id: user.id,
        subscription_data: { metadata: { user_id: user.id } },
        success_url: `${SITE_URL}/account?checkout=done#account`,
        cancel_url: `${SITE_URL}/account?checkout=cancelled#account`
      })
    : await stripe().checkout.sessions.create({
        ...common,
        success_url: `${SITE_URL}/login?paid=1`,
        cancel_url: `${SITE_URL}/#pricing`
      });

  return json(res, 200, { url: session.url });
};
