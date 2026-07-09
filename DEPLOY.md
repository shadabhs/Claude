# Deployment Runbook — Rx Prescription App on Hostinger (Node.js + MySQL)

Deploys the app to **Hostinger Business/Cloud** (Node.js hosting) with a **MySQL**
database. The repo is already configured for MySQL — **no code changes needed**.

**Safety:** This runs as a **separate Node.js web app**. It does **not** touch the
existing WordPress site, its files, or its database. Create a **new** MySQL
database — do not reuse the WordPress one. Nothing here is irreversible; the app
can be removed later without affecting the website.

**Repo / branch:** `shadabhs/Claude` → branch
`claude/doctor-prescription-app-plan-of48ti`

---

## 0. Values to have ready (keep private)

| Value | Source | Example |
| --- | --- | --- |
| `DB_HOST` | hPanel MySQL (Part 1) | `localhost` |
| `DB_NAME` | hPanel MySQL (full name w/ prefix) | `u123456789_rx_app` |
| `DB_USER` | hPanel MySQL | `u123456789_rx` |
| `DB_PASS` | hPanel MySQL (you set it) | a strong password |
| `AUTH_SECRET` | generate (below) | 43-char random string |
| `SEED_DOCTOR_EMAIL` | you choose (Dr. Imran's login) | `imran@clinic.com` |
| `SEED_DOCTOR_PASSWORD` | you choose (strong) | a strong password |

**Generate `AUTH_SECRET`** (any machine with Node, or an online "random 32-byte
base64url" — or reuse the one Claude provided in chat):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**`DATABASE_URL`** (URL-encode special chars in the password — `@`→`%40`, `#`→`%23`):

```
mysql://DB_USER:DB_PASS@DB_HOST:3306/DB_NAME
```

---

## Part 1 — Create the MySQL database (hPanel)

1. hPanel → **Databases → MySQL Databases**.
2. **Create a new database** (do NOT reuse WordPress):
   - Database name: `rx_app` (Hostinger prefixes it → `u123456789_rx_app`)
   - New username + a strong password.
3. Record the final **database name**, **username**, **host**, **password**.

---

## Part 2 — Deploy the Node.js app (hPanel)

1. hPanel → **Websites → Add Website → Deploy Web App** (the Node.js option).
2. **Source:** connect GitHub repo `shadabhs/Claude`, branch
   `claude/doctor-prescription-app-plan-of48ti`.
3. **Node.js version:** **20** or newer.
4. **Build command:** `npm run deploy`
   **Start command:** `npm start`

   > `npm run deploy` = `prisma generate` → `next build` → create tables
   > (`prisma db push`) → seed the doctor account. This initializes the database
   > during deploy, so **no terminal/SSH is required**. It is safe to re-run.

5. **Environment variables** — add all of these before the first build:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the `mysql://…` string from Part 0 |
   | `AUTH_SECRET` | the generated secret |
   | `SEED_DOCTOR_EMAIL` | Dr. Imran's login email |
   | `SEED_DOCTOR_PASSWORD` | Dr. Imran's login password |
   | `NODE_ENV` | `production` |

6. Start the deploy. Wait for the build to complete (it also creates the tables and
   the doctor account).

> **Fallback if the build step can't reach MySQL:** set the build command to just
> `npm run build`, deploy, then run `npm run db:setup` once via hPanel → Advanced →
> **SSH Access** in the app directory.

---

## Part 3 — First login & clinic details

1. Open the app URL Hostinger assigned.
2. Log in with `SEED_DOCTOR_EMAIL` / `SEED_DOCTOR_PASSWORD`.
3. Go to **Settings** → fill in the clinic/doctor profile (name, qualifications,
   registration number, clinic name, address, phone, footer). These appear on the
   **PDF header** of every prescription.
4. Add a test patient → create a prescription → tap **Share prescription (PDF)** to
   confirm the PDF renders and shares to WhatsApp.

---

## Part 4 — (Optional) Branded subdomain

Serve it at e.g. `rx.yourdomain.com`:

1. In the Deploy Web App settings, attach a domain/subdomain if offered; otherwise
   hPanel → **Domains → Subdomains**, create `rx`, and point it at the app.
2. Ensure free SSL/HTTPS is enabled for the subdomain.

---

## Troubleshooting

- **Login says "Incorrect email or password"** → the seed step didn't run, or the
  `SEED_DOCTOR_*` env values differ from what was typed. Re-run `npm run db:setup`
  (SSH) or redeploy after fixing the env vars.
- **Every page bounces to `/login`** → `AUTH_SECRET` is missing or differs between
  build and runtime. Set it as an env var and redeploy.
- **Cannot connect to database** → check `DATABASE_URL` (host, port 3306,
  URL-encoded password) and that the DB user has access to that database.
- **Build fails at the `db push` step** → MySQL wasn't reachable during build; use
  the SSH fallback in Part 2.
- **PDF button does nothing** → use the deployed (production) URL, not a preview; the
  PDF generates in the browser.

## Rollback / safety

- To remove: delete the Node web app in hPanel and drop the `rx_app` database. The
  WordPress site is untouched throughout.
- No destructive commands: `db push` only **adds** tables to the new empty `rx_app`
  database; the seed step **upserts** a single doctor row.
