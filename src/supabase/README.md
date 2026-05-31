# EcomSathi — Supabase Setup Guide

This directory contains all Supabase-related configuration: database migrations, edge functions, and local dev config.

---

## Directory Structure

```
src/supabase/
├── config.toml                          # Supabase CLI local dev config
├── client.ts                            # Supabase JS client (browser)
├── storage.ts                           # Storage helper utilities
├── migrations/
│   ├── 001_initial_schema.sql           # Core tables (users, orgs, products …)
│   ├── 002_rls_policies.sql             # Row-level security policies
│   ├── 003_functions_triggers.sql       # DB functions & triggers
│   ├── 004_seed_data.sql                # Reference / seed data
│   └── 005_storage_buckets.sql         # Storage buckets & object policies
└── functions/
    ├── cleanup-files/index.ts           # Cron: delete expired uploads
    └── send-low-stock-alert/index.ts    # Cron/webhook: email low-stock alert
```

---

## 1. Running Migrations

Migrations **must be applied in order** (001 → 005). Each file is idempotent where possible.

### Supabase Cloud (production / staging)

```bash
# Install the CLI once
npm install -g supabase

# Link to your cloud project
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push
```

To apply a single file manually via the SQL editor or psql:

```bash
psql "$DATABASE_URL" -f src/supabase/migrations/005_storage_buckets.sql
```

### Local (Supabase CLI)

```bash
# Start the local stack (uses config.toml)
supabase start

# Migrations run automatically on start.
# To reset and re-run all migrations:
supabase db reset
```

---

## 2. Storage Buckets

Buckets are created and configured by **migration 005** (`005_storage_buckets.sql`).  
You can also create/verify them through the Supabase dashboard under **Storage**.

| Bucket    | Max size | Allowed MIME types                               | Notes                      |
|-----------|----------|--------------------------------------------------|----------------------------|
| `uploads` | 50 MiB   | PDF, JPEG, PNG, WEBP, GIF                        | Anon + auth uploads        |
| `pdf`     | 50 MiB   | PDF only                                         | Invoices, reports          |
| `images`  | 20 MiB   | JPEG, PNG, WEBP, GIF, BMP                        | Product images             |
| `videos`  | 500 MiB  | MP4, MOV, AVI, WEBM, MKV                        | Product demo videos        |
| `labels`  | 50 MiB   | PDF, JPEG, PNG                                   | Shipping / barcode labels  |
| `exports` | 50 MiB   | Any (CSV, XLSX, ZIP …)                           | Generated export files     |

**Folder convention:** all files must be stored as `<bucket>/<user_uuid>/filename`.  
The RLS policies enforce this: authenticated users can only read/write/delete paths that begin with their own `auth.uid()`.

---

## 3. Deploying Edge Functions

```bash
# Deploy a single function
supabase functions deploy cleanup-files
supabase functions deploy send-low-stock-alert

# Deploy all functions at once
supabase functions deploy

# Set required secrets (run once per environment)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
```

### Required environment variables

| Variable                   | Used by                  | Description                        |
|----------------------------|--------------------------|------------------------------------|
| `SUPABASE_URL`             | both functions           | Injected automatically by runtime  |
| `SUPABASE_SERVICE_ROLE_KEY`| both functions           | Injected automatically by runtime  |
| `RESEND_API_KEY`           | send-low-stock-alert     | Resend transactional email API key |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically when running on Supabase's edge runtime — you do **not** need to set them manually.

### Scheduling cleanup-files

Call the function from a pg_cron job or an external cron service:

```sql
-- Run at 03:00 UTC every day
SELECT cron.schedule(
  'cleanup-expired-files',
  '0 3 * * *',
  $$
    SELECT net.http_post(
      url    := current_setting('app.supabase_url') || '/functions/v1/cleanup-files',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type',  'application/json'
      ),
      body   := '{}'::jsonb
    );
  $$
);
```

---

## 4. Auth Email Templates

Custom email templates live in the Supabase dashboard under **Authentication → Email Templates**.

| Template               | Trigger                                   |
|------------------------|-------------------------------------------|
| Confirm signup         | User registers with email/password        |
| Magic link             | Passwordless sign-in                      |
| Change email address   | User updates their email                  |
| Reset password         | "Forgot password" flow                    |

For local development, all outbound emails are captured by **Inbucket** at [http://localhost:54324](http://localhost:54324) — no real emails are sent.

**Recommended template variables:**

```
{{ .ConfirmationURL }}   — verification / magic-link URL
{{ .Email }}             — recipient's email address
{{ .SiteURL }}           — configured site_url from config.toml
```

---

## 5. Local Development with the Supabase CLI

```bash
# 1. Install the CLI
npm install -g supabase

# 2. Start the full local stack (Postgres, Studio, Auth, Storage, Inbucket)
supabase start

# 3. Access local services
#    Studio (dashboard)  → http://localhost:54323
#    REST API            → http://localhost:54321
#    Inbucket (email)    → http://localhost:54324

# 4. Develop edge functions locally (hot-reload)
supabase functions serve cleanup-files --env-file .env.local
supabase functions serve send-low-stock-alert --env-file .env.local

# 5. Stop the local stack
supabase stop

# 6. Reset (wipe data + re-run all migrations + seed)
supabase db reset
```

### .env.local (local dev only — never commit)

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon key printed by `supabase start`>
RESEND_API_KEY=re_test_xxxxxxxxxxxx
```

---

## 6. Generating TypeScript Types

After modifying the schema, regenerate types so the app stays in sync:

```bash
# Against the local stack
supabase gen types typescript --local > src/types/supabase.ts

# Against the cloud project
supabase gen types typescript --project-id <your-project-ref> > src/types/supabase.ts
```
