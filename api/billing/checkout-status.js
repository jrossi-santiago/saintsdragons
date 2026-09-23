/* GET /api/billing/checkout-status?session_id=cs_… — how did that go?
 *
 * Asked by the waiting screen on #checkout when Stripe sends a reader back
 * (the session id rides on return_url; see checkout.js). It only reports
 * what Stripe says about the session, so the page can tell "paid, the door
 * is opening" from "that did not finish". It grants nothing: the plan
 * changes when the webhook says so and not before, and the page goes on
 * asking /api/session for that.
 *
 * A reader can only ask about their own checkout. Anybody else's answers
 * the same as one that does not exist.
 */

const { currentUser } = require("../_lib/session");
const { stripe } = require("../_lib/stripe");
const { json, methodNotAllowed } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const user = await currentUser(req);
  if (!user) return json(res, 401, { error: "not_signed_in" });

  const id = new URL(req.url, "http://localhost").searchParams.get("session_id") || "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json(res, 404, { error: "no_such_checkout" });

  let s;
  try {
    s = await stripe().checkout.sessions.retrieve(id);
  } catch (e) {
    if (e.type !== "StripeInvalidRequestError") throw e;
    return json(res, 404, { error: "no_such_checkout" });
  }

  const mine = s.client_reference_id === user.id ||
    (!!s.customer && s.customer === user.stripeCustomerId);
  if (!mine) return json(res, 404, { error: "no_such_checkout" });

  return json(res, 200, {
    status: s.status,                                   /* open | complete | expired */
    paid: ["paid", "no_payment_required"].includes(s.payment_status),
    plan: user.plan
  });
};
