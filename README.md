# Praise Unfiltered 1.0 — Registration Site

A registration website for **The Praise Gathering: Praise Unfiltered 1.0** (Gbolahan Sings, 6th Sept 2026).

- Guests register with name, email, phone.
- They instantly get a personal ticket page with a **QR code** — the QR always shows their live status (Pending / Confirmed / Not Approved).
- You review everyone at `/admin` and **Accept** or **Reject** them.
- Registration automatically closes once **50 guests** are confirmed.

No coding required to deploy — just two free accounts and about 10 minutes. Follow the steps below in order.

## 1. Create a free Supabase project (the database)

1. Go to **supabase.com** and sign up (free).
2. Click **New project**. Give it any name, set a database password (save it somewhere), pick a region close to you, click **Create**.
3. Once it's ready, open **SQL Editor** in the left sidebar → **New query**.
4. Open the `supabase.sql` file included in this folder, copy all of it, paste into the SQL editor, and click **Run**. This creates the `registrations` table.
5. Go to **Project Settings → API**. You'll need two values in the next step:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **service_role key** (under "Project API keys" — click reveal). Keep this secret, never share it publicly.

## 2. Deploy the site to Vercel (free hosting)

1. Go to **vercel.com** and sign up (free) — signing up with GitHub is easiest.
2. If you don't already have this project in a GitHub repo: create a new repo on GitHub and upload everything in this folder to it (GitHub's "Add file → Upload files" works fine, drag the whole folder in).
3. In Vercel, click **Add New → Project**, choose the GitHub repo you just created, click **Import**.
4. Before deploying, open **Environment Variables** and add these (values from Supabase in step 1, plus your own choices):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | your Supabase Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |
   | `ADMIN_PASSWORD` | a password you choose, to log into `/admin` |
   | `SESSION_SECRET` | any long random string (e.g. mash your keyboard for 30 characters) |
   | `EVENT_CAPACITY` | `50` |

5. Click **Deploy**. In about a minute you'll get a live link like `https://praise-unfiltered.vercel.app`.

That's it — your registration site is live.

## 3. Using it

- Share the main link (e.g. `https://praise-unfiltered.vercel.app`) anywhere — flyer, Instagram bio, WhatsApp status.
- Guests fill the form and land on a ticket page with their QR code. That page updates live, so once you accept/reject them, their ticket updates automatically.
- You go to `yourdomain.com/admin`, sign in with the `ADMIN_PASSWORD` you set, and see every registrant with **Accept** / **Reject** buttons and a live count out of 50.
- Once 50 guests are accepted, the registration form automatically closes itself and shows "We're fully booked."

## Running it on your own computer (optional, for testing)

If you want to preview changes before deploying:

```bash
npm install
cp .env.example .env.local   # then fill in the same values as above
npm run dev
```

Open `http://localhost:3000`.

## Project structure

- `app/page.tsx` — public registration landing page
- `app/ticket/[id]/page.tsx` — guest's ticket page with QR code and live status
- `app/admin` — password-protected admin login + dashboard
- `app/api` — registration, admin login, and accept/reject logic
- `supabase.sql` — database schema to run once in Supabase

## Changing the look or details

Event details (date, time, artist, sponsorship numbers) live near the top of `app/page.tsx` — edit the text directly and redeploy (Vercel redeploys automatically on every GitHub push). Colors are defined in `tailwind.config.js` under `teal`, `rust`, `cream`, and `gold`.
