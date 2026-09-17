/**
 * One-shot: email every accepted registrant with venue + RSVP details + QR.
 *
 * Usage:
 *   npx tsx scripts/send-confirmation-emails.ts          # dry-run (list only)
 *   npx tsx scripts/send-confirmation-emails.ts --send    # actually send
 *
 * Already-sent addresses are tracked in scripts/.email-sent-log.json and skipped.
 */
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const VENUE = "Ibara Housing Estate, adjacent OK Center";
const RSVP = "08072684446 / 07067653289";
const EVENT_NAME = "Praise Unfiltered 1.0";
const EVENT_DATE = "Saturday, 6th September 2026";
const EVENT_TIME = "3:00 PM";
const SUBJECT = process.env.SMTP_SUBJECT || "Praise Unfiltered";
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://praise-registration.vercel.app"
).replace(/\/$/, "");
const SENT_LOG = path.join(__dirname, ".email-sent-log.json");

const doSend = process.argv.includes("--send");

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local`);
  return v;
}

function loadSent(): Set<string> {
  try {
    const raw = JSON.parse(fs.readFileSync(SENT_LOG, "utf8")) as string[];
    return new Set(raw.map((e) => e.toLowerCase()));
  } catch {
    return new Set();
  }
}

function saveSent(sent: Set<string>) {
  fs.writeFileSync(SENT_LOG, JSON.stringify([...sent].sort(), null, 2) + "\n");
}

function ticketUrl(id: string) {
  return `${SITE_URL}/ticket/${id}`;
}

async function qrPng(id: string): Promise<Buffer> {
  return QRCode.toBuffer(ticketUrl(id), {
    type: "png",
    margin: 1,
    width: 480,
    color: { dark: "#0d2f2c", light: "#faf3e6" },
  });
}

function buildHtml(name: string, id: string) {
  const first = name.trim().split(/\s+/)[0] || "friend";
  const link = ticketUrl(id);
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#1a1210;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1210;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#2a1c18;border-radius:16px;overflow:hidden;border:1px solid #c9a22744;">
          <tr>
            <td style="padding:36px 32px 24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#c9a227;">You're confirmed</p>
              <h1 style="margin:0;font-size:28px;line-height:1.15;color:#faf6f0;">${EVENT_NAME}</h1>
              <p style="margin:10px 0 0;font-size:15px;font-style:italic;color:#e8d5c4;">The Praise Gathering</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;color:#e8d5c4;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 16px;">Hi ${first},</p>
              <p style="margin:0 0 16px;">
                Your seat is confirmed. We can't wait to worship with you.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1210;border-radius:12px;margin:20px 0;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a227;">Event details</p>
                    <p style="margin:0 0 8px;color:#faf6f0;"><strong>Date:</strong> ${EVENT_DATE}</p>
                    <p style="margin:0 0 8px;color:#faf6f0;"><strong>Time:</strong> ${EVENT_TIME}</p>
                    <p style="margin:0;color:#faf6f0;"><strong>Venue:</strong> ${VENUE}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;text-align:center;">
                <strong style="color:#faf6f0;">Your ticket QR code</strong>
              </p>
              <p style="margin:0 0 8px;font-size:14px;text-align:center;color:#e8d5c4;">
                A PNG of your QR is attached to this email — download it and show it at the door.
              </p>
              <p style="margin:0 0 16px;font-size:13px;text-align:center;">
                Or
                <a href="${link}" style="color:#c9a227;">open your ticket online</a>.
              </p>
              <p style="margin:0 0 8px;">
                <strong style="color:#faf6f0;">RSVP / enquiries:</strong><br/>
                <a href="tel:+2348072684446" style="color:#c9a227;text-decoration:none;">08072684446</a>
                &nbsp;/&nbsp;
                <a href="tel:+2347067653289" style="color:#c9a227;text-decoration:none;">07067653289</a>
              </p>
              <p style="margin:20px 0 0;font-size:14px;color:#e8d5c4aa;">
                Please arrive a little early. See you there!
              </p>
              <p style="margin:24px 0 0;color:#faf6f0;">— Gbolahan Sings</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(name: string, id: string) {
  const first = name.trim().split(/\s+/)[0] || "friend";
  return `Hi ${first},

Your seat is confirmed for ${EVENT_NAME} — The Praise Gathering.

Date: ${EVENT_DATE}
Time: ${EVENT_TIME}
Venue: ${VENUE}

Your ticket QR is attached to this email (PNG). You can also open it here:
${ticketUrl(id)}

RSVP / enquiries: ${RSVP}

Please arrive a little early and show your QR at the door. See you there!

— Gbolahan Sings`;
}

async function main() {
  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const { data: rows, error } = await supabase
    .from("registrations")
    .select("id, name, email, status")
    .eq("status", "accepted")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!rows?.length) {
    console.log("No confirmed (accepted) registrations found.");
    return;
  }

  const alreadySent = loadSent();
  const pending = rows.filter((r) => !alreadySent.has(r.email.toLowerCase()));
  const skipped = rows.length - pending.length;

  console.log(`Ticket base URL: ${SITE_URL}`);
  console.log(
    `Found ${rows.length} confirmed guest(s) — ${skipped} already emailed, ${pending.length} remaining:\n`
  );
  for (const r of pending) {
    console.log(`  - ${r.name} <${r.email}>`);
  }

  if (!pending.length) {
    console.log("\nEveryone already got the email. Nothing to do.");
    return;
  }

  if (!doSend) {
    console.log(
      "\nDry run only. Re-run with --send to deliver emails:\n  npx tsx scripts/send-confirmation-emails.ts --send\n"
    );
    return;
  }

  const fromEmail =
    process.env.SMTP_FROM_EMAIL || "gbolahansingspr@gmail.com";
  const fromName = process.env.SMTP_FROM_NAME || "Gbolahan Sings";
  const brevoKey = process.env.BREVO_API_KEY?.trim();

  // Prefer Brevo HTTPS API — many networks block outbound SMTP (587/465).
  type Sender = (r: {
    id: string;
    name: string;
    email: string;
  }) => Promise<string>;

  let sendOne: Sender;

  if (brevoKey) {
    console.log(`\nBrevo API OK — from ${fromEmail} — sending with QR…\n`);
    sendOne = async (r) => {
      const png = await qrPng(r.id);
      const fileName = `praise-unfiltered-ticket-${r.id}.png`;
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": brevoKey,
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: r.email, name: r.name }],
          subject: SUBJECT,
          textContent: buildText(r.name, r.id),
          // Inline cid works with Brevo when contentId matches img src
          htmlContent: buildHtml(r.name, r.id),
          attachment: [
            {
              name: fileName,
              content: png.toString("base64"),
            },
          ],
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof body === "object" && body && "message" in body
            ? String((body as { message: string }).message)
            : `Brevo HTTP ${res.status}`
        );
      }
      return String((body as { messageId?: string }).messageId || res.status);
    };
  } else {
    const user = requireEnv("SMTP_USER");
    const pass = requireEnv("SMTP_PASS");
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.verify();
    console.log(`\nSMTP OK (${host}) — from ${fromEmail} — sending with QR…\n`);

    sendOne = async (r) => {
      const png = await qrPng(r.id);
      const fileName = `praise-unfiltered-ticket-${r.id}.png`;
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: r.email,
        subject: SUBJECT,
        text: buildText(r.name, r.id),
        html: buildHtml(r.name, r.id),
        attachments: [
          {
            filename: fileName,
            content: png,
            contentType: "image/png",
            cid: "ticket-qr",
          },
        ],
      });
      return String(info.messageId);
    };
  }

  let ok = 0;
  let fail = 0;

  for (const r of pending) {
    try {
      const messageId = await sendOne(r);
      ok++;
      alreadySent.add(r.email.toLowerCase());
      saveSent(alreadySent);
      console.log(`✓ ${r.email} (${messageId})`);
      await new Promise((res) => setTimeout(res, 300));
    } catch (err) {
      fail++;
      console.error(`✗ ${r.email}`, err instanceof Error ? err.message : err);
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("Daily user sending limit exceeded") ||
        msg.includes("sender is not valid") ||
        msg.includes("not allowed to send") ||
        msg.includes("unrecognised IP address")
      ) {
        console.error("\nSender/limit error — stopping.");
        break;
      }
    }
  }

  console.log(
    `\nDone. Sent this run: ${ok}, failed this run: ${fail}. Still pending: ${pending.length - ok}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
