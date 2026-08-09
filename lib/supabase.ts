import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key so it can read/write the
// registrations table directly from our own API routes. This key must
// NEVER be exposed to the browser — only used inside app/api/* route handlers.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const EVENT_CAPACITY = Number(process.env.EVENT_CAPACITY || 50);
