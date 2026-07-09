# Rx — Prescription App

A mobile-first web app for a doctor to manage patients and generate branded,
shareable PDF prescriptions. Each prescription is tied to a patient, date-stamped,
and kept in that patient's history.

Built for **Dr. Imran (MBBS, MD Medicine)**. Single doctor today, but the data
model and access layer are **multi-tenant ready** so supporting more doctors
later is additive, not a rewrite.

## Features

- 🔐 Simple email/password login (one doctor account, seeded)
- 👥 Patients: add, search, edit, view — with full prescription history
- 📝 Prescriptions: diagnosis, vitals (BP, pulse, SpO₂, weight, temp), a dynamic
  list of medicines (name / dose / frequency / duration / instructions), advice,
  follow-up date — auto date-stamped and tied to the patient
- 📄 Branded PDF: clinic letterhead + doctor details, generated on the phone and
  shared via the native share sheet (WhatsApp) or downloaded
- ⚙️ Settings: doctor/clinic profile that drives the PDF header
- 📲 Installable PWA ("Add to Home Screen"), mobile-optimised

## Tech stack

| Concern      | Choice                                             |
| ------------ | -------------------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19 + TypeScript    |
| Styling      | Tailwind CSS v4                                     |
| Database     | Prisma ORM — PostgreSQL (default) or MySQL          |
| Auth         | JWT session cookie (`jose`) + `bcryptjs` — no lock-in |
| PDF          | `@react-pdf/renderer` (client-side) + Web Share API |
| PWA          | Web manifest + service worker (`public/sw.js`)     |

## Architecture (multi-tenant ready)

Layered so business logic stays out of the UI and every query is tenant-scoped:

```
UI (app/, components/)
  → actions/       server actions: validate (zod) + resolve tenant + delegate
    → services/    domain logic, tenant-aware
      → repositories/  the ONLY place Prisma is used; every query filters by doctorId
        → Prisma → DB
```

- Every domain row carries a `doctorId` owner (see `prisma/schema.prisma`).
- `src/lib/tenant/context.ts` (`requireTenant`) is the single choke-point that
  derives the acting doctor from the session. Nothing is hardcoded to one doctor.
- Adding more doctors later = add a signup/admin path to create `Doctor` rows;
  no existing query changes.

## Local development

Requires Node 20+ and a PostgreSQL database.

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
#   - set DATABASE_URL to your Postgres connection string
#   - generate AUTH_SECRET:  node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
#   - set SEED_DOCTOR_EMAIL / SEED_DOCTOR_PASSWORD

# 3. Create the schema and seed the doctor account
npm run db:push
npm run db:seed

# 4. Run
npm run dev        # http://localhost:3000
```

Log in with the seeded email/password, then fill in Settings → profile so the PDF
header shows the clinic details.

> Note: client-side interactivity relies on Next's dev HMR websocket. In sandboxed
> environments that block websockets, use a production build (`npm run build && npm start`)
> to test interactive features. Normal local dev is unaffected.

## Deployment

The database engine is chosen at deploy time; the schema is portable.

The repo is configured for **MySQL** by default (Hostinger). See **DEPLOY.md** for
the full step-by-step Hostinger runbook.

### Option A — Hostinger (Business/Cloud, MySQL) — default

1. Create a MySQL database in hPanel; set `DATABASE_URL="mysql://user:pass@host:3306/dbname"`.
2. hPanel → **Deploy Web App**, connect this Git repo (Node.js 20+).
3. Env vars: `DATABASE_URL`, `AUTH_SECRET`, `SEED_DOCTOR_*`, `NODE_ENV=production`.
4. Build command `npm run deploy` (builds **and** creates tables + seeds the doctor),
   start command `npm start`.
5. (Optional) Point a subdomain (e.g. `rx.yourdomain.com`) at the app.

### Option B — Vercel + Supabase (PostgreSQL)

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Create a Supabase project; use its Postgres connection string as `DATABASE_URL`.
3. Import the repo into Vercel; set env vars `DATABASE_URL`, `AUTH_SECRET`, `SEED_DOCTOR_*`.
4. Deploy, then run `npm run db:setup` once (locally against the Supabase URL).

> This project uses `prisma db push` (dialect-agnostic) for schema sync rather than
> dialect-specific migrations. Commit to one production engine.

## Scripts

| Script              | Purpose                             |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server                          |
| `npm run build`     | Prisma generate + production build  |
| `npm start`         | Production server                   |
| `npm run db:push`   | Sync schema to the database         |
| `npm run db:seed`   | Create the doctor account + profile |
| `npm run db:studio` | Prisma Studio (browse data)         |
