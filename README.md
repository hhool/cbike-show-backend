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

## Seed Data

The seed script populates baseline brands, products, reviews, pages, and locale entries.

```bash
API_BASE=http://localhost:3000 npx tsx scripts/seed.ts
```

Optional admin credentials for seed login:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

If not provided, defaults from `scripts/seed.ts` are used.

## Environment Variables

See `.env.local.example` for the baseline template.

Key variables:

- `PAYLOAD_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- SMTP variables (optional)

## Key Routes

- `/` Home
- `/brands` Brand listing
- `/brands/[slug]` Brand detail (includes famous products and latest 2026 products sections)
- `/products` Product listing (supports `q`, `region`, `brand` filters)
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

Deployment checklists are available in:
- `../env/process/DeploymentChecklist_V1_zh.md`
- `../env/process/DeploymentChecklist_V1_en.md`
