/* POST /api/profile — the two onboarding questions, and any later edit.
 *
 * Name and the children's age ranges. Nothing else is asked for: the age
 * ranges do real work (they pick the reader's starting filter on the bedtime
 * shelf), and the name is used to say hello. A field that is not sent is
 * left alone, so this is also the endpoint the account page saves through.
 */

const { sql } = require("./_lib/db");
const { currentUser } = require("./_lib/session");
const { json, methodNotAllowed, readBody } = require("./_lib/http");

const BANDS = ["0-2", "3-5", "6-9", "10+"];

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const user = await currentUser(req);
  if (!user) return json(res, 401, { error: "not_signed_in" });

  const body = await readBody(req);
  const firstName = body.firstName === undefined
    ? undefined
    : String(body.firstName).trim().slice(0, 80) || null;

  let childAges;
  if (body.childAges !== undefined) {
    childAges = [].concat(body.childAges || [])
      .map(v => String(v).trim())
      .filter(v => BANDS.includes(v));
  }

  const updated = await sql.one`
    update users
       set first_name  = coalesce(${firstName === undefined ? null : firstName}, first_name),
           child_ages  = coalesce(${childAges === undefined ? null : childAges}::text[], child_ages),
           onboarded_at = coalesce(onboarded_at, now())
     where id = ${user.id}
    returning first_name, child_ages, onboarded_at`;

  return json(res, 200, {
    ok: true,
    firstName: updated.first_name,
    childAges: updated.child_ages,
    onboarded: !!updated.onboarded_at
  });
};
