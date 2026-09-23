/* email.js — the only thing on this site that sends mail.
 *
 * One provider (Resend) behind one function, so swapping it later is a
 * change to this file and nothing else. With no RESEND_API_KEY set the link
 * is printed to the log instead of sent, which is how `npm run dev` works
 * without an account — it is never silently swallowed.
 */

const { SITE_URL } = require("./http");

const FROM = process.env.EMAIL_FROM || "Saints & Dragons <hello@saintsanddragons.com>";
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

module.exports = { send, sendLoginLink, loginEmail };
