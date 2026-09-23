/* POST /api/auth/logout — drops this session's row and its cookie.
 *
 * POST only: a GET would let any image tag on any page log a reader out. */

const { endSession } = require("../_lib/session");
const { json, methodNotAllowed, wantsHTML, redirect } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  await endSession(req, res);
  if (wantsHTML(req)) return redirect(res, "/");
  return json(res, 200, { ok: true });
};
