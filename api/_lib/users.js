/* users.js — the one way an email becomes an account.
 *
 * Two doors lead here: the signup/login box (request-link) and a checkout
 * paid for by somebody who was not signed in (the Stripe webhook). Both mean
 * "this address is a reader", so both go through the same statement and a
 * paid checkout can never make a second account for an address we know.
 */

const { sql } = require("./db");

/* One statement so a double submit cannot make two accounts. A name or an
   age range already on file is never overwritten by a blank one. */
async function userForEmail(email, { firstName = null, childAges = [], source = null } = {}) {
  return sql.one`
    insert into users (email, first_name, child_ages, source)
    values (${email}, ${firstName}, ${childAges}, ${source})
    on conflict (email) do update
      set first_name = coalesce(users.first_name, excluded.first_name),
          child_ages = case when cardinality(users.child_ages) = 0
                            then excluded.child_ages else users.child_ages end
    returning id, first_name, (xmax = 0) as is_new`;
}

module.exports = { userForEmail };
