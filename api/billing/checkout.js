/* POST /api/billing/checkout — start the $6/month subscription.
 *
 * Stripe's hosted Checkout, so no card detail ever touches this site. The
 * reader comes back to /account#account either way; what they are actually
 * waiting for is the webhook, which is the only thing that grants access.
 */

const { sql } = require("../_lib/db");
const { currentUser } = require("../_lib/session");
const { stripe, priceId, customerFor } = require("../_lib/stripe");
const { SITE_URL, json, methodNotAllowed } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = await currentUser(req);
  if (!user) return json(res, 401, { error: "not_signed_in" });
  if (user.plan === "paid") {
    return json(res, 409, { error: "already_subscribed", message: "You are already on Every day." });
  }

  const customer = await customerFor(user, sql);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price: priceId(), quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    subscription_data: { metadata: { user_id: user.id } },
    success_url: `${SITE_URL}/account?checkout=done#account`,
    cancel_url: `${SITE_URL}/account?checkout=cancelled#account`
  });

  return json(res, 200, { url: session.url });
};
