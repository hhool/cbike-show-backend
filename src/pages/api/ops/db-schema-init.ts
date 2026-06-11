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

  // Compatibility: some legacy tables store nested row id as _id (text-like) instead of id.
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name='site_pages_sections' AND column_name='_id'
     ) AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name='site_pages_sections' AND column_name='id'
     ) THEN
       ALTER TABLE "site_pages_sections" ADD COLUMN "id" text;
       UPDATE "site_pages_sections" SET "id" = "_id"::text WHERE "id" IS NULL;
     END IF;
   END
   $$`,

  // site_pages_sections_locales
  // Note: no FK on _parent_id to avoid PK column name mismatch with the pre-existing production table.
  `CREATE TABLE IF NOT EXISTS "site_pages_sections_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale"    varchar(10) NOT NULL,
    "heading"    text,
    "body"       text,
    CONSTRAINT "site_pages_sections_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "site_pages_sections_locales_parent_id_idx" ON "site_pages_sections_locales" ("_parent_id")`,

  // Legacy compatibility: production sections.id is varchar, align locales._parent_id to varchar explicitly.
  `ALTER TABLE "site_pages_sections_locales"
   ALTER COLUMN "_parent_id" TYPE varchar(255)
   USING "_parent_id"::varchar`,

  // Ensure parent id type matches sections.id type to avoid join operator/type errors.
  `DO $$
   DECLARE
     sections_id_type text;
     locales_parent_type text;
   BEGIN
     SELECT data_type INTO sections_id_type
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name='site_pages_sections' AND column_name='id'
     LIMIT 1;

     SELECT data_type INTO locales_parent_type
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name='site_pages_sections_locales' AND column_name='_parent_id'
     LIMIT 1;

     IF sections_id_type IS NOT NULL
       AND locales_parent_type IS NOT NULL
       AND sections_id_type <> locales_parent_type
     THEN
       IF sections_id_type = 'integer' THEN
         ALTER TABLE "site_pages_sections_locales"
         ALTER COLUMN "_parent_id" TYPE integer
         USING "_parent_id"::integer;
       ELSIF sections_id_type = 'bigint' THEN
         ALTER TABLE "site_pages_sections_locales"
         ALTER COLUMN "_parent_id" TYPE bigint
         USING "_parent_id"::bigint;
       ELSIF sections_id_type = 'uuid' THEN
         ALTER TABLE "site_pages_sections_locales"
         ALTER COLUMN "_parent_id" TYPE uuid
         USING "_parent_id"::uuid;
       ELSE
         ALTER TABLE "site_pages_sections_locales"
         ALTER COLUMN "_parent_id" TYPE text
         USING "_parent_id"::text;
       END IF;
     END IF;
   END
   $$`,

  // Compatibility: SitePages.sections.body is textarea (text). Align legacy jsonb columns.
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema='public'
         AND table_name='site_pages_sections_locales'
         AND column_name='body'
         AND data_type='jsonb'
     ) THEN
       ALTER TABLE "site_pages_sections_locales"
       ALTER COLUMN "body" TYPE text
       USING CASE
         WHEN "body" IS NULL THEN NULL
         WHEN jsonb_typeof("body") = 'string' THEN trim(both '"' from "body"::text)
         ELSE "body"::text
       END;
     END IF;
   END
   $$`,

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

  // Reviews workflow compatibility: normalize status columns to varchar and allowed values.
  // This fixes legacy enum/check drift that can cause "only draft can save" in admin.
  `ALTER TABLE "reviews"
   ALTER COLUMN "status" TYPE varchar(20)
   USING "status"::text`,
  `ALTER TABLE "reviews"
   ALTER COLUMN "_status" TYPE varchar(20)
   USING "_status"::text`,
  `ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'draft'`,
  `ALTER TABLE "reviews" ALTER COLUMN "_status" SET DEFAULT 'draft'`,
  `UPDATE "reviews"
   SET "status" = 'draft'
   WHERE "status" IS NULL
      OR "status" NOT IN ('draft', 'compliance', 'chief', 'published', 'archived')`,
  `UPDATE "reviews"
   SET "_status" = 'draft'
   WHERE "_status" IS NULL
      OR "_status" NOT IN ('draft', 'compliance', 'chief', 'published', 'archived')`,
  `DO $$
   DECLARE
     r record;
   BEGIN
     FOR r IN
       SELECT c.conname
       FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
       WHERE n.nspname = 'public'
         AND t.relname = 'reviews'
         AND c.contype = 'c'
         AND (
           pg_get_constraintdef(c.oid) ILIKE '%"status"%'
           OR pg_get_constraintdef(c.oid) ILIKE '%"_status"%'
         )
     LOOP
       EXECUTE format('ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS %I', r.conname);
     END LOOP;
   END
   $$`,
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1
       FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
       WHERE n.nspname = 'public'
         AND t.relname = 'reviews'
         AND c.conname = 'reviews_status_allowed_check'
     ) THEN
       ALTER TABLE "reviews"
         ADD CONSTRAINT "reviews_status_allowed_check"
         CHECK ("status" IN ('draft', 'compliance', 'chief', 'published', 'archived'));
     END IF;
   END
   $$`,
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1
       FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
       WHERE n.nspname = 'public'
         AND t.relname = 'reviews'
         AND c.conname = 'reviews__status_allowed_check'
     ) THEN
       ALTER TABLE "reviews"
         ADD CONSTRAINT "reviews__status_allowed_check"
         CHECK ("_status" IN ('draft', 'compliance', 'chief', 'published', 'archived'));
     END IF;
   END
   $$`,

  // Localized categories write path persists translated names in categories_locales.
  // Keep base-table categories.name nullable to avoid upsert failures during admin save.
  `ALTER TABLE "categories" ALTER COLUMN "name" DROP NOT NULL`,

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

  // Backfill zh localized category names from the legacy base column so admin lists stop showing empty names.
  `INSERT INTO "categories_locales" ("_parent_id", "_locale", "name")
   SELECT c."id", 'zh', c."name"
   FROM "categories" c
   WHERE c."name" IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM "categories_locales" cl
       WHERE cl."_parent_id" = c."id" AND cl."_locale" = 'zh'
     )`,

  // Re-sync categories_locales serial sequence so saving localized category names does not fail
  // with duplicate primary key errors after the backfill inserts.
  `DO $$
   DECLARE
     seq_name text;
     max_id integer;
   BEGIN
     SELECT pg_get_serial_sequence('public.categories_locales', 'id') INTO seq_name;
     IF seq_name IS NOT NULL THEN
       SELECT max(id)::integer INTO max_id FROM "categories_locales";
       IF max_id IS NULL THEN
         PERFORM setval(seq_name, 1, false);
       ELSE
         PERFORM setval(seq_name, max_id, true);
       END IF;
     END IF;
   END
   $$`,

  // ── news_categories ─────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "news_categories" (
    "id"                 serial PRIMARY KEY NOT NULL,
    "key"                varchar NOT NULL,
    "is_system"          boolean DEFAULT false,
    "is_visible_in_tabs" boolean DEFAULT true,
    "sort_order"         numeric DEFAULT 100,
    "style_variant"      varchar,
    "updated_at"         timestamp with time zone NOT NULL DEFAULT now(),
    "created_at"         timestamp with time zone NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "news_categories_key_idx" ON "news_categories" ("key")`,
  `CREATE INDEX IF NOT EXISTS "news_categories_created_at_idx" ON "news_categories" ("created_at")`,

  `CREATE TABLE IF NOT EXISTS "news_categories_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "news_categories"("id") ON DELETE CASCADE,
    "_locale"    varchar(10) NOT NULL,
    "name"       text,
    "description" text,
    CONSTRAINT "news_categories_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "news_categories_locales_parent_id_idx" ON "news_categories_locales" ("_parent_id")`,

  // ── news ────────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "news" (
    "id"               serial PRIMARY KEY NOT NULL,
    "slug"             varchar NOT NULL,
    "category_id"      integer REFERENCES "news_categories"("id"),
    "cover_id"         integer REFERENCES "media"("id"),
    "source_name"      varchar,
    "source_url"       varchar,
    "status"           varchar DEFAULT 'draft',
    "_status"          varchar DEFAULT 'draft',
    "transition_note"  text,
    "scheduled_at"     timestamp with time zone,
    "published_at"     timestamp with time zone,
    "expires_at"       timestamp with time zone,
    "is_pinned"        boolean DEFAULT false,
    "pin_weight"       numeric DEFAULT 0,
    "pin_expires_at"   timestamp with time zone,
    "is_alert"         boolean DEFAULT false,
    "alert_level"      varchar DEFAULT 'notice',
    "created_by_id"    integer REFERENCES "users"("id"),
    "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
    "created_at"       timestamp with time zone NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "news_slug_idx" ON "news" ("slug")`,
  `CREATE INDEX IF NOT EXISTS "news_created_at_idx" ON "news" ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "news_category_id_idx" ON "news" ("category_id")`,

  `CREATE TABLE IF NOT EXISTS "news_locales" (
    "id"                   serial PRIMARY KEY NOT NULL,
    "_parent_id"           integer NOT NULL REFERENCES "news"("id") ON DELETE CASCADE,
    "_locale"              varchar(10) NOT NULL,
    "title"                text,
    "summary"              text,
    "body"                 jsonb,
    "seo_meta_title"       text,
    "seo_meta_description" text,
    CONSTRAINT "news_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "news_locales_parent_id_idx" ON "news_locales" ("_parent_id")`,

  // news_tags (array field)
  `CREATE TABLE IF NOT EXISTS "news_tags" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_order"     integer NOT NULL DEFAULT 0,
    "_parent_id" integer NOT NULL REFERENCES "news"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "news_tags_order_idx" ON "news_tags" ("_order")`,
  `CREATE INDEX IF NOT EXISTS "news_tags_parent_id_idx" ON "news_tags" ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "news_tags_locales" (
    "id"         serial PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "news_tags"("id") ON DELETE CASCADE,
    "_locale"    varchar(10) NOT NULL,
    "name"       text,
    CONSTRAINT "news_tags_locales_parent_id_locale_unique" UNIQUE("_parent_id", "_locale")
  )`,
  `CREATE INDEX IF NOT EXISTS "news_tags_locales_parent_id_idx" ON "news_tags_locales" ("_parent_id")`,

  // news_regions (hasMany select)
  `CREATE TABLE IF NOT EXISTS "news_regions" (
    "id"         serial PRIMARY KEY NOT NULL,
    "order"      integer NOT NULL DEFAULT 0,
    "parent_id"  integer NOT NULL REFERENCES "news"("id") ON DELETE CASCADE,
    "value"      varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "news_regions_order_idx" ON "news_regions" ("order")`,
  `CREATE INDEX IF NOT EXISTS "news_regions_parent_id_idx" ON "news_regions" ("parent_id")`,

  // Compatibility for early schema where news_regions was created with _parent_id/_order
  `ALTER TABLE "news_regions" ADD COLUMN IF NOT EXISTS "parent_id" integer`,
  `ALTER TABLE "news_regions" ADD COLUMN IF NOT EXISTS "order" integer`,
  `UPDATE "news_regions" SET "parent_id" = "_parent_id" WHERE "parent_id" IS NULL AND "_parent_id" IS NOT NULL`,
  `UPDATE "news_regions" SET "order" = "_order" WHERE "order" IS NULL AND "_order" IS NOT NULL`,
  `UPDATE "news_regions" SET "order" = 0 WHERE "order" IS NULL`,
  `CREATE INDEX IF NOT EXISTS "news_regions_parent_id_idx" ON "news_regions" ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "news_regions_order_idx" ON "news_regions" ("order")`,

  // Register new collections in payload_locked_documents_rels
  `ALTER TABLE "payload_locked_documents_rels"
   ADD COLUMN IF NOT EXISTS "news_id" integer REFERENCES "news"("id") ON DELETE CASCADE`,
  `ALTER TABLE "payload_locked_documents_rels"
   ADD COLUMN IF NOT EXISTS "news_categories_id" integer REFERENCES "news_categories"("id") ON DELETE CASCADE`,

  // Reset stale admin list/filter preferences that can keep specific collection pages blank
  // even when collection APIs are healthy (safe to rerun in production).
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema='public' AND table_name='payload_preferences'
     ) THEN
       DELETE FROM "payload_preferences";
     END IF;
   END
   $$`,
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
