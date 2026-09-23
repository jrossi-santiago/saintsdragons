/* stripe.js — one configured client, and the two ids every billing path needs. */

let client = null;

function stripe() {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set — see .env.example");
  const Stripe = require("stripe");
  client = new Stripe(key, { apiVersion: "2025-08-27.basil" });
  return client;
}

function priceId() {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error("STRIPE_PRICE_ID is not set — see .env.example");
  return id;
}

/* A Stripe customer is created once per reader and then reused, so a second
   subscription never lands on a second customer record. */
async function customerFor(user, sql) {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe().customers.create({
    email: user.email,
    name: user.firstName || undefined,
    metadata: { user_id: user.id }
  });
  await sql`update users set stripe_customer_id = ${customer.id} where id = ${user.id}`;
  return customer.id;
}

module.exports = { stripe, priceId, customerFor };
