import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type SchemaInitResponse = {
  ok: boolean;
  now: string;
  statements: string[];
  results: { statement: string; ok: boolean; error?: string }[];
};

// ── DDL statements to create every missing locale/status-related table ─────
// Derived directly from Payload collection definitions with localization=true.
// All tables use IF NOT EXISTS so re-running is safe.
const DDL_STATEMENTS = [
  // products_locales
  `CREATE TABLE IF NOT EXISTS "products_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "_locale"    varchar(10) NOT NULL,
    "summary"    text,
    CONSTRAINT "products_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "products_locales_parent_id_idx" ON "products_locales" ("_parent_id")`,

  // categories_locales
  `CREATE TABLE IF NOT EXISTS "categories_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    "_locale"    varchar(10) NOT NULL,
    "name"       text,
    CONSTRAINT "categories_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "categories_locales_parent_id_idx" ON "categories_locales" ("_parent_id")`,

  // reviews_locales
  `CREATE TABLE IF NOT EXISTS "reviews_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
    "_locale"    varchar(10) NOT NULL,
    "title"      text,
    "summary"    text,
    "body"       jsonb,
    CONSTRAINT "reviews_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "reviews_locales_parent_id_idx" ON "reviews_locales" ("_parent_id")`,

  // site_pages_locales
  `CREATE TABLE IF NOT EXISTS "site_pages_locales" (
    "id"              serial PRIMARY KEY NOT NULL,
    "_parent_id"      integer NOT NULL REFERENCES "site_pages"("id") ON DELETE CASCADE,
    "_locale"         varchar(10) NOT NULL,
    "title"           text,
    "hero_title"      text,
    "hero_subtitle"   text,
    "cta_label"       text,
    CONSTRAINT "site_pages_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "site_pages_locales_parent_id_idx" ON "site_pages_locales" ("_parent_id")`,

  // site_pages_sections (required parent before sections_locales)
  `CREATE TABLE IF NOT EXISTS "site_pages_sections" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "site_pages"("id") ON DELETE CASCADE,
    "_order"     integer NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS "site_pages_sections_parent_id_idx" ON "site_pages_sections" ("_parent_id")`,

  // site_pages_sections_locales
  // Note: no FK on _parent_id to avoid PK column name mismatch with the pre-existing production table.
  `CREATE TABLE IF NOT EXISTS "site_pages_sections_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale"    varchar(10) NOT NULL,
    "heading"    text,
    "body"       jsonb,
    CONSTRAINT "site_pages_sections_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "site_pages_sections_locales_parent_id_idx" ON "site_pages_sections_locales" ("_parent_id")`,

  // locale_entries_locales
  `CREATE TABLE IF NOT EXISTS "locale_entries_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "locale_entries"("id") ON DELETE CASCADE,
    "_locale"    varchar(10) NOT NULL,
    "value"      text,
    CONSTRAINT "locale_entries_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "locale_entries_locales_parent_id_idx" ON "locale_entries_locales" ("_parent_id")`,

  // brands_locales (not in diag errors, but brands also has localized fields in config)
  `CREATE TABLE IF NOT EXISTS "brands_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "brands"("id") ON DELETE CASCADE,
    "_locale"    varchar(10) NOT NULL,
    "name"       text,
    "intro"      text,
    CONSTRAINT "brands_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "brands_locales_parent_id_idx" ON "brands_locales" ("_parent_id")`,

  // _status columns – add if missing (ALTER TABLE ... ADD COLUMN IF NOT EXISTS)
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "_status" varchar(20) DEFAULT 'draft'`,
  `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "_status" varchar(20) DEFAULT 'draft'`,
  `ALTER TABLE "site_pages" ADD COLUMN IF NOT EXISTS "_status" varchar(20) DEFAULT 'draft'`,

  // Backfill _status for existing rows; DEFAULT only affects new rows.
  `UPDATE "products" SET "_status" = 'draft' WHERE "_status" IS NULL`,
  `UPDATE "reviews" SET "_status" = 'draft' WHERE "_status" IS NULL`,
  `UPDATE "site_pages" SET "_status" = 'draft' WHERE "_status" IS NULL`,

  // Ensure site_pages_sections has id column expected by Payload lateral joins.
  `ALTER TABLE "site_pages_sections" ADD COLUMN IF NOT EXISTS "id" serial`,

  // versions tables for collections that have drafts: true
  `CREATE TABLE IF NOT EXISTS "_products_v" (
    "id"           serial PRIMARY KEY NOT NULL,
    "parent_id"    integer REFERENCES "products"("id") ON DELETE SET NULL,
    "version_model_name" text,
    "version_slug" text,
    "version__status" varchar(20) DEFAULT 'draft',
    "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at"   timestamp with time zone NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS "_products_v_parent_id_idx" ON "_products_v" ("parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_reviews_v" (
    "id"              serial PRIMARY KEY NOT NULL,
    "parent_id"       integer REFERENCES "reviews"("id") ON DELETE SET NULL,
    "version_title"   text,
    "version_slug"    text,
    "version__status" varchar(20) DEFAULT 'draft',
    "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at"      timestamp with time zone NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS "_reviews_v_parent_id_idx" ON "_reviews_v" ("parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_site_pages_v" (
    "id"              serial PRIMARY KEY NOT NULL,
    "parent_id"       integer REFERENCES "site_pages"("id") ON DELETE SET NULL,
    "version_slug"    text,
    "version__status" varchar(20) DEFAULT 'draft',
    "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at"      timestamp with time zone NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS "_site_pages_v_parent_id_idx" ON "_site_pages_v" ("parent_id")`,
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SchemaInitResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.DIAG_TRIGGER_SECRET;
  const incoming = req.headers[HEADER];

  if (!secret) {
    return res.status(503).json({ error: "DIAG_TRIGGER_SECRET is not configured" });
  }

  if (incoming !== secret) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const payload = await getPayload({ config });
  const db = (payload as any)?.db;
  const drizzle = db?.drizzle;

  if (!drizzle) {
    return res.status(503).json({ error: "No drizzle instance found on payload.db" });
  }

  const results: SchemaInitResponse["results"] = [];

  for (const stmt of DDL_STATEMENTS) {
    try {
      await drizzle.execute(stmt);
      results.push({ statement: stmt.slice(0, 80).replace(/\n/g, " ") + "...", ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        statement: stmt.slice(0, 80).replace(/\n/g, " ") + "...",
        ok: false,
        error: msg,
      });
    }
  }

  const allOk = results.every((r) => r.ok);

  return res.status(200).json({
    ok: allOk,
    now: new Date().toISOString(),
    statements: DDL_STATEMENTS.map((s) => s.slice(0, 80).replace(/\n/g, " ") + "..."),
    results,
  });
}
