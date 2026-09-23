/* email.js — the only thing on this site that sends mail.
 *
 * One provider (Resend) behind one function, so swapping it later is a
 * change to this file and nothing else. With no RESEND_API_KEY set the link
 * is printed to the log instead of sent, which is how `npm run dev` works
 * without an account — it is never silently swallowed.
 */

const { SITE_URL } = require("./http");

/* Quotes around the whole value are dropped: .env.example shows them (a
   dotenv file needs them for the space and the &), and pasted as-is into
   Vercel, which keeps them, they make a from line Resend rejects. */
function unquote(value) {
  return String(value || "").trim().replace(/^(["'])(.*)\1$/, "$2").trim();
}

const FROM = unquote(process.env.EMAIL_FROM) || "Saints & Dragons <hello@send.saintsdragons.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || null;

function esc(s) {
  return String(s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

async function send({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[email] no RESEND_API_KEY — not sent.\n  to: ${to}\n  subject: ${subject}\n${text}\n`);
    return { delivered: false, reason: "no_api_key" };
  }
  const { Resend } = require("resend");
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: FROM, to, subject, html, text,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {})
  });
  if (error) throw new Error(`resend: ${error.message || JSON.stringify(error)}`);
  return { delivered: true };
}

/* The voice here is the site's: plain words, no exclamation marks, and it
   says what it is for. "Handed down rather than explained" applies to email
   too — this is a door being held open, not a welcome sequence. */
function loginEmail({ url, firstName, minutes, isNew, paid = false }) {
  const hello = firstName ? `${firstName},` : "Hello,";
  /* paid: sent by the webhook after a checkout made while signed out, so it
     is the receipt's companion as much as a login link. */
  const line = paid
    ? "Thank you. You are on Every day now, and this link signs you in to it. After this, the box on the site sends a new one whenever you need it — no password to keep."
    : isNew
      ? "Here is the way in. It is the same link every time — no password to keep."
      : "Here is your way back in.";
  const aside = paid
    ? "If you did not pay for this, reply and tell us."
    : "If you did not ask for it, nothing has happened to your account and you can ignore this.";

  const text =
`${hello}

${line}

${url}

The link works once and lasts ${minutes} minutes. ${aside}

Saints & Dragons
History for dads. Tales for bedtime.`;

  const html =
`<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#221c15;max-width:480px">
  <p>${esc(hello)}</p>
  <p>${esc(line)}</p>
  <p style="margin:28px 0">
    <a href="${esc(url)}" style="display:inline-block;background:#e5825a;color:#1a1208;font-weight:700;text-decoration:none;padding:13px 24px;border-radius:999px">Open Saints &amp; Dragons</a>
  </p>
  <p style="font-size:14px;color:#6b6257">The link works once and lasts ${minutes} minutes. ${esc(aside)}</p>
  <p style="font-size:14px;color:#6b6257">Or paste this in: <br><span style="word-break:break-all">${esc(url)}</span></p>
  <hr style="border:none;border-top:1px solid #e3ddcf;margin:24px 0">
  <p style="font-size:13px;color:#6b6257">Saints &amp; Dragons — history for dads, tales for bedtime.<br>${esc(SITE_URL)}</p>
</div>`;

  const subject = paid ? "You are on Every day — your way in"
    : isNew ? "Your way in to Saints & Dragons" : "Your Saints & Dragons link";
  return { subject, html, text };
}

async function sendLoginLink({ to, url, firstName, minutes, isNew, paid = false }) {
  return send({ to, ...loginEmail({ url, firstName, minutes, isNew, paid }) });
}

/* Sent to the address a reader wants to move to, never to the old one: the
   point is to prove the new address works and is theirs. Nothing changes
   until it is opened. */
function changeEmail({ url, firstName, minutes }) {
  const hello = firstName ? `${firstName},` : "Hello,";
  const line = "Open this link to make this the address on your Saints & Dragons account. Receipts and sign-in links come here after that.";
  const aside = "If you did not ask for this, ignore it and nothing changes.";

  const text =
`${hello}

${line}

${url}

The link works once and lasts ${minutes} minutes. ${aside}

Saints & Dragons
History for dads. Tales for bedtime.`;

  const html =
`<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#221c15;max-width:480px">
  <p>${esc(hello)}</p>
  <p>${esc(line)}</p>
  <p style="margin:28px 0">
    <a href="${esc(url)}" style="display:inline-block;background:#e5825a;color:#1a1208;font-weight:700;text-decoration:none;padding:13px 24px;border-radius:999px">Use this address</a>
  </p>
  <p style="font-size:14px;color:#6b6257">The link works once and lasts ${minutes} minutes. ${esc(aside)}</p>
  <p style="font-size:14px;color:#6b6257">Or paste this in: <br><span style="word-break:break-all">${esc(url)}</span></p>
  <hr style="border:none;border-top:1px solid #e3ddcf;margin:24px 0">
  <p style="font-size:13px;color:#6b6257">Saints &amp; Dragons — history for dads, tales for bedtime.<br>${esc(SITE_URL)}</p>
</div>`;

  return { subject: "Confirm your new address for Saints & Dragons", html, text };
}

async function sendChangeEmailLink({ to, url, firstName, minutes }) {
  return send({ to, ...changeEmail({ url, firstName, minutes }) });
}

/* For /api/health: can Resend send from FROM at all? Reads the account's
   domains, which sends nothing and spends no quota. A key made with
   "sending access" only is not allowed to list them, and says so. */
async function checkSending() {
  const key = process.env.RESEND_API_KEY;
  const address = (/<([^>]+)>/.exec(FROM) || [null, FROM])[1].trim();
  const domain = address.includes("@") ? address.split("@").pop().toLowerCase() : null;
  const report = { from: FROM, domain };

  if (!key) return { ...report, ok: false, hint: "RESEND_API_KEY is not set — links go to the log, not to readers" };
  if (!domain || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(address)) {
    return { ...report, ok: false, hint: 'EMAIL_FROM is not a usable from line — it should look like Saints & Dragons <hello@send.saintsdragons.com>' };
  }
  if (domain === "resend.dev") {
    return { ...report, ok: false, hint: "resend.dev only delivers to the Resend account's own address — verify your domain and send from it" };
  }

  const { Resend } = require("resend");
  const { data, error } = await new Resend(key).domains.list();
  if (error) {
    const said = `${error.name} ${error.message}`;
    if (/restricted|only send/i.test(said)) {
      return { ...report, ok: null, hint: `this key can only send, so the domain cannot be checked from here — look at resend.com/domains: ${domain} must say Verified` };
    }
    return { ...report, ok: false, error: error.name,
      hint: /api.?key/i.test(said) ? "RESEND_API_KEY is not a valid key — make a new one at resend.com/api-keys" : error.message };
  }

  const list = data?.data || [];
  const match = list.find(d => d.name.toLowerCase() === domain);
  if (!match) {
    return { ...report, ok: false, domains: list.map(d => d.name),
      hint: `${domain} is not added in this Resend account — add it at resend.com/domains and put the DNS records it gives you on the domain` };
  }
  return { ...report, ok: match.status === "verified", status: match.status,
    ...(match.status === "verified" ? {} : {
      hint: `${match.name} is "${match.status}" in Resend — add the DNS records shown at resend.com/domains, then press Verify; it can take a while to go through`
    }) };
}

module.exports = { send, sendLoginLink, loginEmail, sendChangeEmailLink, checkSending };
