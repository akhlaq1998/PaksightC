# PakSight — Media Intelligence System

PakSight tracks how Pakistan is covered across international media. It provides dashboards (heatmap, trending, sentiment), search and article detail, Admin management, ingest APIs for n8n, recompute endpoints, and a premium Strategic Insights Chatbot with citations.

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind
- Prisma ORM
- Database: SQLite (dev fallback) or Postgres (e.g., Supabase)
- Optional: Supabase Auth (when env present), SMTP/Resend/SendGrid for email
- Charts: Recharts

## Features
- Invite-only auth (no public signup). Dev fallback auth with preset users
- Request Access flow (+ email/log)
- Admin bootstrap endpoint to create Admin/Member users
- Ingest APIs (article/batch/healthbeat) with X-INGEST-KEY
- Analytics endpoints + recompute (heatmap/trending)
- Dashboards: global heatmap, trending topics/entities, sentiment timeline
- Search, Article detail, Compare (skeleton)
- Admin: requests review, ingest keys (hash-only), healthbeats, docs (OpenAPI + cURLs)
- Strategic Insights Chatbot (premium-only) with citations and confidence
- Responsive UX with Viewer gating (non-interactive charts, upgrade modal)

## Quick Start (SQLite fallback)
1) Install deps
```bash
npm install
```

2) Create .env (a dev-friendly default is committed by the setup). Ensure DATABASE_URL points to SQLite:
```env
DATABASE_URL=file:./dev.db
APP_BASE_URL=http://localhost:3000
BOOTSTRAP_TOKEN=dev-bootstrap-token
DISABLE_BOOTSTRAP=false
```

3) Apply schema and seed data
```bash
npx prisma db push
npx tsx scripts/seed.ts
```

4) Run
```bash
npm run dev
```

Open http://localhost:3000

- Use demo Admin: admin@paksight.app / StrongPass!234
- Use demo Member: member@paksight.app / MemberPass!234

## Switching to Postgres (e.g., Supabase)
- Set DATABASE_URL to your Postgres connection string
- Run `npx prisma db push`
- Optional: set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY to enable Supabase auth flows (dev fallback remains available if not set)

## Environment Variables
- DATABASE_URL: SQLite file (file:./dev.db) or Postgres URL
- APP_BASE_URL: e.g., http://localhost:3000
- BOOTSTRAP_TOKEN / DISABLE_BOOTSTRAP: control the bootstrap endpoint
- INGEST_BOOT_KEY: optional single ingest boot key
- EMAIL_FROM and SMTP_*/RESEND_API_KEY/SENDGRID_API_KEY: email provider creds
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: optional Supabase auth

If email provider is not configured, messages are logged to Email Log (Admin → Docs).

## Admin Bootstrap (Preset Users)
POST /api/admin/bootstrap
Headers: `X-Bootstrap-Token: <BOOTSTRAP_TOKEN>`
Body:
```json
{
  "admin_email":"admin@paksight.app",
  "admin_password":"StrongPass!234",
  "admin_name":"PakSight Admin",
  "admin_org":"PakSight",
  "member_email":"member@paksight.app",
  "member_password":"MemberPass!234",
  "member_name":"Demo Member",
  "member_org":"Demo Org"
}
```
If DISABLE_BOOTSTRAP=true, the route returns 410.

## Ingest APIs (n8n)
Auth: header `X-INGEST-KEY`
- POST `/api/ingest/article` (upsert by external_id or hash)
- POST `/api/ingest/batch` (array of above)
- POST `/api/ingest/healthbeat` ({ service, status, note })

## Analytics
- GET `/api/analytics/heatmap?from=YYYY-MM-DD&to=YYYY-MM-DD&focus=PK|GLOBAL`
- GET `/api/analytics/trending?window=24h|7d|30d&country=GB|US|IN|AF|HU|GLOBAL`
- POST `/api/analytics/recompute/heatmap?days=30`
- POST `/api/analytics/recompute/trending?hours=72` (score decay implemented)

## Articles & Outlets
- GET `/api/articles/search?q=&country=&from=&to=&sentiment=&topic=&entity=&lang=&page=&size=`
- GET `/api/articles/:id`
- GET `/api/outlets?country=GB`

## Admin APIs
- POST `/api/admin/access-requests/:id/approve`
- POST `/api/admin/access-requests/:id/reject`
- GET/POST `/api/admin/ingest-keys` (create returns plaintext once; DB stores hash)
- GET `/api/admin/health` (recent healthbeats)
- GET `/api/admin/access-requests/list`
- POST `/api/admin/bootstrap`

## Auth & Roles
- /login, /forgot, /reset
- Viewer: heatmap and aggregate only; clicking shows upgrade modal
- Member/Admin: full features; chatbot is premium-only and server-guarded
- Middleware guards server-side; unauthorized routes redirect to /not-authorized

## Strategic Insights Chatbot
- Route: `/chatbot` (Viewer sees disabled input + modal)
- API: `POST /api/chat/ask` (403 for Viewer; strict scope to Pakistan; normalized time window/region; computes sentiment, volume Δ, themes, outlets; returns 3–6 citations; confidence label)

## Quick Test Commands
```bash
# 1) Bootstrap preset users
curl -X POST "$APP_BASE_URL/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Token: $BOOTSTRAP_TOKEN" \
  -d '{ "admin_email":"admin@paksight.app","admin_password":"StrongPass!234",
        "admin_name":"PakSight Admin","admin_org":"PakSight",
        "member_email":"member@paksight.app","member_password":"MemberPass!234",
        "member_name":"Demo Member","member_org":"Demo Org" }'

# 2) Ingest one demo article
curl -X POST "$APP_BASE_URL/api/ingest/article" \
  -H "Content-Type: application/json" -H "X-INGEST-KEY: REPLACE_ME" \
  -d '{ "external_id":"demo:1","url":"https://example.com","title":"Pakistan coverage",
        "published_at":"2025-08-31T12:00:00Z","outlet_name":"Reuters",
        "outlet_domain":"reuters.com","country_iso":"US","language":"en",
        "topics":["Politics"],"entities":["Pakistan"],"sentiment":{"label":"neutral","score":0.0} }'

# 3) Recompute analytics
curl -X POST "$APP_BASE_URL/api/analytics/recompute/heatmap?days=30"
curl -X POST "$APP_BASE_URL/api/analytics/recompute/trending?hours=72"
```

## Development Notes
- SQLite fallback ensures the app runs end-to-end without external services
- If SMTP/Resend/SendGrid envs are missing, emails are logged to Email Log
- If Supabase envs are set, you can extend/replace fallback auth with Supabase

## License
MIT
