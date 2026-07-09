# Deployment Runbook — Rx Prescription App on Hostinger (Node.js + MySQL)

This guides a coworker through deploying the app to **Hostinger Business/Cloud**
(Node.js hosting) with a **MySQL** database.

**Safety:** This runs as a **separate Node.js web app**. It does **not** touch the
existing WordPress site, its files, or its database. Create a **new** MySQL
database — do not reuse the WordPress one. Nothing here is irreversible; the app
can be removed without affecting the website.

**Repo / branch:** `shadabhs/Claude` → branch
`claude/doctor-prescription-app-plan-of48ti`

---

## 0. Values to gather first

Fill these in before starting (keep them private — do not paste into any public place):

| Value | Where it comes from | Example |
| --- | --- | --- |
| `DB_HOST` | hPanel MySQL (Part 1) | `localhost` |
| `DB_NAME` | hPanel MySQL (full name, incl. prefix) | `u123456789_rx_app` |
| `DB_USER` | hPanel MySQL | `u123456789_rx` |
| `DB_PASS` | hPanel MySQL (you set it) | `a-strong-password` |
| `AUTH_SECRET` | generate — see below | 43-char random string |
| `SEED_DOCTOR_EMAIL` | you choose (Dr. Imran's login) | `imran@clinic.com` |
| `SEED_DOCTOR_PASSWORD` | you choose (strong) | `choose-a-strong-one` |

**Generate `AUTH_SECRET`** (run anywhere with Node, or in the SSH terminal from Part 4):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**Build the `DATABASE_URL`** from the DB values (URL-encode any special characters
in the password, e.g. `@`→`%40`, `#`→`%23`):

```
mysql://DB_USER:DB_PASS@DB_HOST:3306/DB_NAME
```

---

## Part 1 — Create the MySQL database (hPanel)

1. hPanel → **Databases → MySQL Databases**.
2. **Create a new database** (do NOT reuse WordPress):
   - Database name: `rx_app` (Hostinger prefixes it, e.g. `u123456789_rx_app`)
   - New username: e.g. `rx`
   - Set a strong password.
3. Note the final **database name**, **username**, **host**, and **password** into the table above.

---

## Part 2 — Point the app at MySQL (two small code edits)

The repo is set to PostgreSQL by default. Make these two edits on the branch, then push.

**Edit 1 — `prisma/schema.prisma`:** change the datasource provider.

```diff
 datasource db {
-  provider = "postgresql"
+  provider = "mysql"
   url      = env("DATABASE_URL")
 }
```

**Edit 2 — `src/repositories/patient.repo.ts`:** remove the Postgres-only
`mode: "insensitive"` (MySQL search is case-insensitive by default). Find:

```ts
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
```

and change the name line to:

```ts
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
      ];
```

Then commit and push:

```bash
git add prisma/schema.prisma src/repositories/patient.repo.ts
git commit -m "Configure MySQL for Hostinger deploy"
git push origin claude/doctor-prescription-app-plan-of48ti
```

> Prefer not to change code? You can instead keep PostgreSQL and use a free
> Supabase database (Part 2 becomes: set `DATABASE_URL` to the Supabase Postgres
> URL, skip both edits). The app is fully tested on PostgreSQL.

---

## Part 3 — Deploy the Node.js app (hPanel)

1. hPanel → **Websites → Add Website → Deploy Web App** (the Node.js option).
2. **Source:** connect the GitHub repo `shadabhs/Claude`, branch
   `claude/doctor-prescription-app-plan-of48ti`.
   (If GitHub isn't linked, connect it, or upload the repo files.)
3. **Node.js version:** choose **20** or newer.
4. **Build command:** `npm run build`
   **Start command:** `npm start`
   (`next start` listens on the `PORT` Hostinger provides automatically.)
5. **Environment variables** — add each of these:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the `mysql://…` string from Part 0 |
   | `AUTH_SECRET` | the generated secret |
   | `SEED_DOCTOR_EMAIL` | Dr. Imran's login email |
   | `SEED_DOCTOR_PASSWORD` | Dr. Imran's login password |
   | `NODE_ENV` | `production` |

6. Deploy. Wait for the build to finish (it runs `prisma generate` then `next build`).

---

## Part 4 — Initialize the database (one time)

The schema and the doctor account need to be created once. Use Hostinger's
**SSH access** (hPanel → Advanced → SSH Access) or the app's terminal.

SSH in, `cd` into the app directory (where `package.json` is), then run:

```bash
# create all tables from the schema
npm run db:push

# create Dr. Imran's account + blank clinic profile
npm run db:seed
```

Expected: `db:push` prints "in sync", and `db:seed` prints
`✔ Seeded doctor: <email>`.

> If SSH isn't available: enable hPanel → **Remote MySQL**, whitelist your own IP,
> set `DATABASE_URL` locally to the remote host, and run the two commands from your
> laptop. Or ask Hostinger support to enable Node app SSH for the plan.

---

## Part 5 — First login & clinic details

1. Open the app URL Hostinger assigned.
2. Log in with `SEED_DOCTOR_EMAIL` / `SEED_DOCTOR_PASSWORD`.
3. Go to **Settings** and fill in the clinic/doctor profile (name, qualifications,
   registration number, clinic name, address, phone, footer). These appear on the
   **PDF header** of every prescription.
4. Add a test patient → create a prescription → tap **Share prescription (PDF)** to
   confirm the PDF looks right and shares to WhatsApp.

---

## Part 6 — (Optional) Branded subdomain

To serve it at e.g. `rx.yourdomain.com`:

1. hPanel → **Domains → Subdomains** (or DNS): create `rx` and point it at the
   deployed app (Hostinger's Deploy Web App UI usually lets you attach a domain
   directly — prefer that).
2. Ensure HTTPS/SSL is enabled for the subdomain (Hostinger provides free SSL).

---

## Troubleshooting

- **Build fails on a type error about `mode`** → Edit 2 in Part 2 wasn't applied.
- **Login says "Incorrect email or password"** → `db:seed` didn't run, or
  `SEED_DOCTOR_*` env values differ from what you typed. Re-run `npm run db:seed`.
- **App loads but every page bounces to /login** → `AUTH_SECRET` is missing or
  differs between build and runtime. Set it as an env var and redeploy.
- **Cannot connect to database** → check `DATABASE_URL` (host, port 3306, URL-encoded
  password) and that the DB user has access to that database.
- **PDF button does nothing** → make sure you're on the deployed (production) URL,
  not a dev preview; the PDF generates in the browser.

## Rollback / safety

- To remove the app: delete the Node web app in hPanel and drop the `rx_app`
  database. The WordPress site is untouched throughout.
- No destructive commands are in this runbook; `db:push` only **adds** tables to the
  new empty `rx_app` database.
