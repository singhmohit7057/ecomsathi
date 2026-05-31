# EcomSathi Deployment Guide

## Architecture

| Layer | Platform | Role |
|---|---|---|
| Frontend (React SPA) | Vercel | Static hosting + CDN |
| Processing Backend | Railway | Node.js / FFmpeg / Sharp / Tesseract |
| Database / Auth / Storage | Supabase | PostgreSQL + GoTrue + S3-compatible storage |

---

## Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon key** from Project Settings > API
3. Run migrations in order (SQL Editor):
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_rls_policies.sql
   supabase/migrations/003_functions.sql
   supabase/migrations/004_seed.sql
   ```
4. Create storage buckets (Storage > New Bucket):
   | Bucket | Max File Size | Public |
   |---|---|---|
   | uploads | 500MB | No |
   | pdf | 50MB | No |
   | images | 20MB | No |
   | videos | 500MB | No |
   | labels | 20MB | No |
   | exports | 100MB | No |

   All buckets should use **signed URLs** — set Public access to OFF.

5. Enable Email auth:
   - Auth > Providers > Email — enable
   - Disable "Confirm email" for development; enable in production
   - Set Site URL to your Vercel URL (Auth > URL Configuration)

---

## Step 2: Railway Deployment (Processing Backend)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Build the backend
cd backend-processing
npm install
npm run build

# Login and initialise
railway login
railway init        # creates a new project
railway up          # deploys from the current directory
```

Set these environment variables in the Railway dashboard (Settings > Variables):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `SUPABASE_URL` | From Supabase Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Project Settings > API (service role — never expose to frontend) |
| `CASHFREE_GST_API_KEY` | Optional — for GSTIN verification |
| `MAX_UPLOAD_SIZE_MB` | `500` |

After deployment, note your Railway app URL:
```
https://your-app.up.railway.app
```

Verify the backend is running:
```bash
curl https://your-app.up.railway.app/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

## Step 3: Vercel Deployment (Frontend)

1. Push the project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite — confirm framework is **Vite**
5. Set environment variables (Project > Settings > Environment Variables):

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_PROCESSING_API_URL` | Your Railway URL (e.g. `https://your-app.up.railway.app`) |
| `VITE_APP_URL` | Your Vercel URL (e.g. `https://ecomsathi.vercel.app`) |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (G-XXXXXXX) |
| `VITE_CLARITY_ID` | Microsoft Clarity project ID |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (for CAPTCHA on auth) |

6. Click **Deploy**

The `vercel.json` in the project root handles:
- SPA rewrites (all routes → `/index.html`)
- Security headers
- Long-term caching for hashed assets
- COOP/COEP headers only on PDF tool routes (required for pdf.js WASM)

---

## Step 4: Post-Deployment Checklist

### Smoke Tests
- [ ] `GET /health` returns 200 on Railway URL
- [ ] Home page loads at Vercel URL
- [ ] Supabase auth: sign up with a test email
- [ ] Supabase auth: log in, verify session token stored
- [ ] Free tool: `/tools/gst-calculator` — calculates correctly
- [ ] Free tool: `/tools/pdf-merge` — merge 2 small PDFs
- [ ] Label crop: `/label-crop` — upload an Amazon label PDF
- [ ] File upload: `/tools/image-compress` — upload a JPG, get compressed output
- [ ] Check browser console for errors

### Supabase Auth URL Configuration
Go to Supabase > Auth > URL Configuration and set:
- **Site URL**: `https://your-vercel-url.vercel.app`
- **Redirect URLs**: `https://your-vercel-url.vercel.app/**`

---

## Security Checklist

- [ ] `ALLOWED_ORIGINS` on Railway set to exact Vercel URL — no wildcard in production
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **only** in Railway env vars — never in frontend
- [ ] RLS policies enabled on all Supabase tables (migration `002_rls_policies.sql`)
- [ ] File size limits configured in backend `multer` middleware
- [ ] Rate limiting active on Railway backend routes (express-rate-limit)
- [ ] HTTPS enforced — automatic on Vercel and Railway
- [ ] Storage bucket policies: users can only access their own files
- [ ] No sensitive keys in `.env` files committed to git
- [ ] `.env.local` and `.env.production` listed in `.gitignore`

---

## File Size Limits

| File Type | Max Size |
|---|---|
| PDF | 50 MB |
| Images | 20 MB |
| Videos | 500 MB |
| Exports (ZIP/PDF) | 100 MB |

Supabase Storage bucket limits should be set to at least **500 MB per file** to handle video uploads.

Multer middleware on Railway enforces these limits server-side.
Frontend `FileUploader` component enforces limits client-side to give immediate feedback.

---

## Large File Processing Flow

To keep Railway memory usage low, large files follow this flow:

```
1. Browser → uploads file directly to Supabase Storage
             (no Railway involved — uses Supabase signed upload URL)

2. Frontend → sends storage path (not the file) to Railway API
             POST /process/image { storagePath: "uploads/user123/image.jpg", operation: "compress" }

3. Railway  → downloads file from Supabase Storage using service role key
           → processes with FFmpeg / Sharp / Tesseract

4. Railway  → uploads result to Supabase Storage
             (e.g. "exports/user123/image-compressed.jpg")

5. Railway  → returns the storage path in response

6. Frontend → calls Supabase to get a signed download URL
           → user downloads the processed file

7. Cleanup  → Railway deletes temp files immediately
           → Supabase Storage auto-deletes files after 1 hour (cron job)
```

This approach:
- Keeps Railway memory under control (no in-memory large file buffering)
- Uses Supabase CDN for file delivery
- Allows Railway to scale horizontally without shared file state

---

## Environment Files Reference

```bash
# .env.local (development — never commit)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PROCESSING_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
VITE_GA_MEASUREMENT_ID=
VITE_CLARITY_ID=
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA   # Turnstile test key for dev
```

```bash
# backend-processing/.env (development — never commit)
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Custom Domain Setup (Optional)

1. In Vercel > Project > Settings > Domains, add your domain
2. Add the CNAME or A record at your DNS provider as shown
3. Vercel auto-provisions an SSL certificate
4. Update `VITE_APP_URL` env var to the custom domain
5. Update Supabase Auth > URL Configuration > Site URL to the custom domain
6. Update `ALLOWED_ORIGINS` on Railway to the custom domain

---

## Monitoring

| What | Where |
|---|---|
| Frontend errors | Vercel deployment logs; optionally Sentry (`VITE_SENTRY_DSN`) |
| Backend errors | Railway deployment logs (real-time) |
| User behaviour | Google Analytics 4 (`VITE_GA_MEASUREMENT_ID`) |
| Session recordings | Microsoft Clarity (`VITE_CLARITY_ID`) |
| Uptime | Railway Health Check URL pointing to `/health` |
| Database | Supabase Dashboard > Database > Logs |
