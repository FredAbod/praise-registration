/**
 * Schedule a reminder email to every accepted registrant via Brevo.
 *
 * Default send time: tomorrow 1:00 PM Africa/Lagos (WAT, UTC+1)
 * Override with: REMINDER_AT=2026-09-06T13:00:00+01:00
 *
 * Usage:
 *   npx tsx scripts/send-reminder-emails.ts             # dry-run
 *   npx tsx scripts/send-reminder-emails.ts --schedule  # queue in Brevo
 */
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const VENUE = "Ibara Housing Estate, adjacent OK Center";
const RSVP = "08072684446 / 07067653289";
const EVENT_NAME = "Praise Unfiltered 1.0";
const EVENT_DATE = "Sunday, 6th September 2026";
const EVENT_TIME = "3:00 PM";
const SUBJECT = "Reminder: Praise Unfiltered today at 3PM";
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://praise-registration.vercel.app"
).replace(/\/$/, "");
const SCHEDULED_LOG = path.join(__dirname, ".email-reminder-log.json");

const doSchedule = process.argv.includes("--schedule");

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local`);
  return v;
}

/** Default: next calendar day at 13:00 Africa/Lagos, or REMINDER_AT override. */
function reminderAtIso(): string {
  if (process.env.REMINDER_AT?.trim()) {
    const d = new Date(process.env.REMINDER_AT);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`Invalid REMINDER_AT: ${process.env.REMINDER_AT}`);
    }
    return d.toISOString();
  }
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const [y, m, d] = [
    Number(parts.year),
    Number(parts.month),
    Number(parts.day),
  ];
  // Tomorrow 13:00 WAT = 12:00 UTC
  return new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0)).toISOString();
}

function loadLog(): Set<string> {
  try {
    const raw = JSON.parse(fs.readFileSync(SCHEDULED_LOG, "utf8")) as string[];
    return new Set(raw.map((e) => e.toLowerCase()));
  } catch {
    return new Set();
  }
}

function saveLog(sent: Set<string>) {
  fs.writeFileSync(
    SCHEDULED_LOG,
    JSON.stringify([...sent].sort(), null, 2) + "\n"
  );
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
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#c9a227;">Reminder</p>
              <h1 style="margin:0;font-size:28px;line-height:1.15;color:#faf6f0;">See you today</h1>
              <p style="margin:10px 0 0;font-size:15px;font-style:italic;color:#e8d5c4;">${EVENT_NAME} · ${EVENT_TIME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;color:#e8d5c4;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 16px;">Hi ${first},</p>
              <p style="margin:0 0 16px;">
                Just a quick reminder — <strong style="color:#faf6f0;">Praise Unfiltered</strong> is today at <strong style="color:#faf6f0;">3:00 PM</strong>. We can't wait to worship with you.
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
                Your QR is attached — download it and show it at the door.
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
                Please aim to arrive a little early. See you soon!
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

Reminder: ${EVENT_NAME} is today at ${EVENT_TIME}.

Date: ${EVENT_DATE}
Time: ${EVENT_TIME}
Venue: ${VENUE}

Your ticket QR is attached. Or open it here:
${ticketUrl(id)}

RSVP / enquiries: ${RSVP}

Please arrive a little early. See you soon!

— Gbolahan Sings`;
}

async function main() {
  const scheduledAt = reminderAtIso();
  const whenLocal = new Date(scheduledAt).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    dateStyle: "full",
    timeStyle: "short",
  });

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
    console.log("No confirmed guests found.");
    return;
  }

  const already = loadLog();
  const pending = rows.filter((r) => !already.has(r.email.toLowerCase()));

  console.log(`Reminder scheduled for: ${whenLocal} (Africa/Lagos)`);
  console.log(`UTC instant: ${scheduledAt}`);
  console.log(
    `Guests: ${rows.length} confirmed — ${already.size} already queued, ${pending.length} to schedule:\n`
  );
  for (const r of pending) {
    console.log(`  - ${r.name} <${r.email}>`);
  }

  if (!pending.length) {
    console.log("\nAll reminders already queued.");
    return;
  }

  if (!doSchedule) {
    console.log(
      "\nDry run only. Queue with:\n  npx tsx scripts/send-reminder-emails.ts --schedule\n"
    );
    return;
  }

  if (new Date(scheduledAt).getTime() <= Date.now() + 60_000) {
    throw new Error(
      `scheduledAt must be in the future (got ${scheduledAt}). Set REMINDER_AT.`
    );
  }

  const brevoKey = requireEnv("BREVO_API_KEY");
  const fromEmail =
    process.env.SMTP_FROM_EMAIL || "gbolahansingspr@gmail.com";
  const fromName = process.env.SMTP_FROM_NAME || "Gbolahan Sings";

  console.log(`\nQueuing ${pending.length} reminders via Brevo…\n`);

  let ok = 0;
  let fail = 0;

  for (const r of pending) {
    try {
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
          htmlContent: buildHtml(r.name, r.id),
          attachment: [
            {
              name: fileName,
              content: png.toString("base64"),
            },
          ],
          scheduledAt,
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
      ok++;
      already.add(r.email.toLowerCase());
      saveLog(already);
      console.log(
        `✓ queued ${r.email} (${(body as { messageId?: string }).messageId || "ok"})`
      );
      await new Promise((res) => setTimeout(res, 250));
    } catch (err) {
      fail++;
      console.error(`✗ ${r.email}`, err instanceof Error ? err.message : err);
    }
  }

  console.log(
    `\nDone. Queued: ${ok}, failed: ${fail}. Still pending: ${pending.length - ok}.`
  );
  console.log(`They will send at ${whenLocal}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
