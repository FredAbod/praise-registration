// Uses the Web Crypto API (globalThis.crypto.subtle) instead of Node's
// `crypto` module so this works in both the Node.js runtime and the Edge
// runtime that Next.js middleware runs on by default.

const COOKIE_NAME = "pg_admin_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "fallback-secret";
}

async function getKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string) {
  const key = await getKey();
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return toHex(signature);
}

export async function createSessionToken() {
  const payload = `admin.${Date.now() + MAX_AGE_MS}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expiry, signature] = parts;
  const payload = `${role}.${expiry}`;
  const expected = await sign(payload);

  if (signature.length !== expected.length) return false;
  // constant-time-ish comparison
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return false;

  if (role !== "admin") return false;
  if (Date.now() > Number(expiry)) return false;
  return true;
}

export { COOKIE_NAME };
