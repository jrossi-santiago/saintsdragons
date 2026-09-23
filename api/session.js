/* GET /api/session — everything /account needs to draw itself.
 *
 * One request, not three: the reader, their plan, and the content they are
 * entitled to. app.js cannot render a frame without all of it, so splitting
 * it up would only buy a slower first paint.
 *
 * 401 means "not logged in", and app.js sends them to /login. It is not an
 * error worth logging.
 */

const { currentUser } = require("./_lib/session");
const { payloadFor } = require("./_lib/content");
const { json, methodNotAllowed } = require("./_lib/http");
const { sql } = require("./_lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const user = await currentUser(req);
  if (!user) return json(res, 401, { error: "not_signed_in" });

  /* Cheap and useful: tells us who is actually reading, without a tracker. */
  sql`update users set last_seen_at = now() where id = ${user.id}`.catch(() => {});

  const paid = user.plan === "paid";
  return json(res, 200, {
    user: {
      email: user.email,
      firstName: user.firstName,
      childAges: user.childAges,
      onboarded: user.onboarded,
      memberSince: user.createdAt,
      plan: user.plan,
      subscription: user.subscription
    },
    content: payloadFor({ paid }),
    /* The publishable key is meant to be public — it can only start things
       Stripe then checks against the secret key on our side. Sent from here
       so there is one place per environment to set it (test on Preview, live
       on Production), rather than a key baked into app.js. Null means it is
       not set, and the checkout page says so instead of breaking. */
    stripe: { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null }
  });
};
