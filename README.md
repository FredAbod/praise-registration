# Youth Retreat — Registration Site

Registration for **The Apostolic Church Nigeria — Igbein Area Youth (LAWMNA Territorial) Youth Retreat**.

- Theme: **Talent Alone Is Not Enough** (Proverbs 22:29)
- Dates: **Friday 2nd – Saturday 3rd October 2026**
- Venue: **23, Ita-Agemo, Igbein, Abeokuta, Ogun State**
- Fee: **₦500** via Opay transfer; guests upload a receipt; admin confirms payment
- Confirmed guests get a **QR ticket** for the door
- Registration is **open-ended** (no seat cap)

## Setup

### 1. Supabase

1. Create a project (or reuse an existing one).
2. Open **SQL Editor**, paste and run [`supabase.sql`](supabase.sql). This **renames** the old `registrations` table to `registrations_praise_unfiltered_2026` (archive) and creates a new `registrations` table for Youth Retreat. Nothing is deleted.
3. Copy **Project URL** and **service_role** key from **Project Settings → API**.

### 2. Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy **Cloud name**, **API Key**, and **API Secret**.

### 3. Env vars

Copy `.env.example` → `.env.local` (local) and add the same keys in Vercel:

| Name | Notes |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `ADMIN_PASSWORD` | `/admin` login |
| `SESSION_SECRET` | long random string |
| `NEXT_PUBLIC_SITE_URL` | live site URL |
| `PAYMENT_BANK` | `Opay` |
| `PAYMENT_ACCOUNT_NUMBER` | `7051865730` |
| `PAYMENT_ACCOUNT_NAME` | `Rachel Oluwabukola` |
| `PAYMENT_AMOUNT_NGN` | `500` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |

### 4. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Admin: `/admin`.

## Guest flow

1. Register with name, assembly, district (phone optional).
2. Ticket page shows Opay details (₦500).
3. Guest uploads payment screenshot (Cloudinary).
4. Status → **Awaiting review**.
5. Admin confirms → **Confirmed** + QR unlocks.

## Project structure

- `app/page.tsx` — landing + register
- `app/ticket/[id]` — payment details, receipt upload, QR when confirmed
- `app/admin` — review receipts, confirm/reject
- `app/api/ticket/[id]/receipt` — Cloudinary upload
- `lib/event.ts` — event + payment helpers
- `supabase.sql` — schema
