import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type Row = Record<string, unknown>;

type FixResponse = {
  ok: boolean;
  now: string;
  pageId: number;
  locale: string;
  rows: {
    sectionsLocaleCount: number;
    pageLocaleCount: number;
  };
  sectionsPreview: Row[];
};

const asPositiveInt = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FixResponse | { error: string }>
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

  const pageId = asPositiveInt(req.body?.pageId, 3);
  const locale = String(req.body?.locale ?? "zh").trim() || "zh";

  try {
    const payload = await getPayload({ config });
    const drizzle = (payload as any)?.db?.drizzle;

    if (!drizzle) {
      return res.status(503).json({ error: "No drizzle instance found on payload.db" });
    }

    const exec = async (sql: string): Promise<Row[]> => {
      const result = await drizzle.execute(sql);
      const rows = (result as { rows?: unknown }).rows;
      return Array.isArray(rows) ? (rows as Row[]) : [];
    };

    // Ensure page-level localized title exists for zh so admin has valid required title field.
    await exec(`
      INSERT INTO "site_pages_locales" ("_parent_id", "_locale", "title")
      SELECT ${pageId}, '${locale}', '评测中心'
      WHERE NOT EXISTS (
        SELECT 1 FROM "site_pages_locales" p
        WHERE p."_parent_id" = ${pageId} AND p."_locale" = '${locale}'
      )
    `);

    // Seed/repair section-level localized rows for the target page and locale.
    // Pull defaults from existing en rows, then map to zh copy by order for page 3.
    await exec(`
      INSERT INTO "site_pages_sections_locales" ("_parent_id", "_locale", "heading", "body")
      SELECT
        s."id"::text,
        '${locale}',
        CASE
          WHEN s."_parent_id" = 3 AND s."_order" = 1 THEN '最新评测'
          WHEN s."_parent_id" = 3 AND s."_order" = 2 THEN '我们的评测方法'
          ELSE COALESCE(NULLIF(en."heading", ''), '区块')
        END,
        CASE
          WHEN s."_parent_id" = 3 AND s."_order" = 1 THEN '查看独立童车评测结果，获得清晰评分与实用选购建议。'
          WHEN s."_parent_id" = 3 AND s."_order" = 2 THEN '每款产品都按安全、舒适、便携、功能和性价比五个维度进行透明评分。'
          ELSE COALESCE(en."body", '')
        END
      FROM "site_pages_sections" s
      LEFT JOIN "site_pages_sections_locales" en
        ON en."_parent_id" = s."id"::text
       AND en."_locale" = 'en'
      WHERE s."_parent_id" = ${pageId}
      ON CONFLICT ("_parent_id", "_locale") DO UPDATE
      SET
        "heading" = EXCLUDED."heading",
        "body" = EXCLUDED."body"
    `);

    const sectionsPreview = await exec(`
      SELECT s."_order", l."_parent_id", l."_locale", l."heading", l."body"
      FROM "site_pages_sections" s
      JOIN "site_pages_sections_locales" l ON l."_parent_id" = s."id"::text
      WHERE s."_parent_id" = ${pageId} AND l."_locale" = '${locale}'
      ORDER BY s."_order" ASC
    `);

    const sectionsLocaleCountRows = await exec(`
      SELECT COUNT(*)::int AS count
      FROM "site_pages_sections_locales" l
      JOIN "site_pages_sections" s ON s."id"::text = l."_parent_id"
      WHERE s."_parent_id" = ${pageId} AND l."_locale" = '${locale}'
    `);

    const pageLocaleCountRows = await exec(`
      SELECT COUNT(*)::int AS count
      FROM "site_pages_locales"
      WHERE "_parent_id" = ${pageId} AND "_locale" = '${locale}'
    `);

    const sectionsLocaleCount = Number((sectionsLocaleCountRows[0]?.count as number | undefined) ?? 0);
    const pageLocaleCount = Number((pageLocaleCountRows[0]?.count as number | undefined) ?? 0);

    return res.status(200).json({
      ok: true,
      now: new Date().toISOString(),
      pageId,
      locale,
      rows: {
        sectionsLocaleCount,
        pageLocaleCount,
      },
      sectionsPreview,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
}
