# Cbike Review Lab (site_cbike_show)

This project is a unified Next.js + Payload CMS application for a bilingual (zh/en) child mobility review site.

It includes:
- Public pages: brands, products, reviews
- Admin CMS: content, brand/product/review management
- API routes from Payload
- Operations page for locale entries (`/i18n/brands`)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Payload CMS 3
- Database adapters: SQLite (default local), Postgres (recommended for production)
- TypeScript

## Requirements

- Node.js >= 20.18
- npm

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.local.example .env.local
```

3. Start development server:

```bash
npm run dev
```

4. Open the app:

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Build and Run (Production Mode)

```bash
npm run build
npm run start
```

Important runtime note:

- Do not run `npm run build` while `npm run dev` is running in the same workspace. `build` clears `.next`, which can break the active dev server and cause temporary 500 errors.
- If this happens, stop dev, run `rm -rf .next`, then start dev again.

## Seed Data

The seed script populates baseline brands, products, reviews, pages, and locale entries.

```bash
npx tsx scripts/seed.ts
```

`scripts/seed.ts` auto-detects a healthy local API base in this order:

- `API_BASE` (if explicitly provided)
- `http://localhost:3000`
- `http://localhost:3001`

If your dev server is running on a non-default port, set `API_BASE` explicitly.

Optional admin credentials for seed login:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

If not provided, defaults from `scripts/seed.ts` are used.

## Environment Variables

See `.env.local.example` for the baseline template.
See `.env.production.example` for the production/Render template.

Key variables:

- `PAYLOAD_SECRET`
- `DATABASE_URL`
- `RENDER=true` on Render
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `PROTOTYPE_SITE_URL` for the static Vercel frontend origin
- `CORS_ORIGINS` for any additional allowed frontend origins (comma-separated)
- SMTP variables (optional)

Production database notes:

- Neon URLs may use either `postgres://` or `postgresql://`
- Production deployment should not fall back to local SQLite
- Current live deployment uses Render + Neon unified topology

## Key Routes

- `/` Home
- `/brands` Brand listing
- `/brands/[slug]` Brand detail (includes famous products and latest 2026 products sections)
- `/products` Product listing (supports `q`, `region`, `brand`, `category` filters)
- `/products/[slug]` Product detail
- `/reviews` Review listing
- `/reviews/[slug]` Review detail
- `/i18n/brands` Locale operations page
- `/admin` Payload CMS admin

## Notes on Language/Data Behavior

- The project currently runs in a stable no-migration mode for content localization.
- Language alignment is handled through controlled seed writes and frontend locale mapping.
- For true database-level per-locale storage, plan a dedicated localization table migration before production rollout.

## Deployment (Recommended)

Use unified deployment (frontend + admin + API in one service) first, then split later if needed.

Suggested setup:
- App hosting: Render or Railway
- Database: Neon Postgres
- File storage: S3/R2

Free-tier delivery artifacts in this repo:
- `render.yaml`
- `.env.production.example`
- `scripts/smoke-deploy.sh`
- `scripts/render-init.sh`
- `scripts/neon-init-local.sh`

Useful recovery/init commands:

```bash
# Run inside Render Shell
npm run render:init

# Run from local terminal against Neon after exporting DATABASE_URL
npm run neon:init-local

# Seed through a running app instance
API_BASE=http://localhost:3000 npx tsx scripts/seed.ts
```

Deployment checklists are available in:
- `../env/process/DeploymentChecklist_V1_zh.md`
- `../env/process/DeploymentChecklist_V1_en.md`

Manual acceptance checklist:
- `../env/process/ProductionAcceptanceChecklist_V1_zh.md`
- `../env/process/ProductionAcceptanceChecklist_V1_en.md`

