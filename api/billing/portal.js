/* POST /api/billing/portal — Stripe's own billing portal.
 *
 * Cancelling, restarting, changing a card and finding an invoice all happen
 * there rather than being rebuilt here. "Cancel any time" on the landing
 * page is a promise this keeps in two clicks.
 */

const { sql } = require("../_lib/db");
const { currentUser } = require("../_lib/session");
const { stripe, customerFor } = require("../_lib/stripe");
const { SITE_URL, json, methodNotAllowed } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = await currentUser(req);
  if (!user) return json(res, 401, { error: "not_signed_in" });

  const customer = await customerFor(user, sql);
  const session = await stripe().billingPortal.sessions.create({
    customer,
    return_url: `${SITE_URL}/account#account`
  });

  return json(res, 200, { url: session.url });
};
