import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type Row = Record<string, unknown>;

type FixResponse = {
  ok: boolean;
  now: string;
  pageId: number;
  rows: {
    enSectionRows: number;
    zhSectionRows: number;
  };
  preview: {
    en: Row[];
    zh: Row[];
  };
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

    // Ensure page-level localized rows.
    await exec(`
      INSERT INTO "site_pages_locales" ("_parent_id", "_locale", "title", "cta_label")
      VALUES
        (${pageId}, 'en', 'Reviews', 'Read Reviews'),
        (${pageId}, 'zh', '评测中心', '查看评测')
      ON CONFLICT ("_parent_id", "_locale") DO UPDATE
      SET
        "title" = EXCLUDED."title",
        "cta_label" = EXCLUDED."cta_label"
    `);

    // Rebuild section locale rows by order for both locales.
    await exec(`
      INSERT INTO "site_pages_sections_locales" ("_parent_id", "_locale", "heading", "body")
      SELECT
        s."id"::text,
        'en',
        CASE WHEN s."_order" = 1 THEN 'Latest Reviews' ELSE 'How We Test' END,
        CASE
          WHEN s."_order" = 1 THEN 'Explore independent stroller reviews with clear scoring and practical recommendations.'
          ELSE 'Every product is scored across safety, comfort, portability, function, and value using transparent criteria.'
        END
      FROM "site_pages_sections" s
      WHERE s."_parent_id" = ${pageId}
      ON CONFLICT ("_parent_id", "_locale") DO UPDATE
      SET
        "heading" = EXCLUDED."heading",
        "body" = EXCLUDED."body"
    `);

    await exec(`
      INSERT INTO "site_pages_sections_locales" ("_parent_id", "_locale", "heading", "body")
      SELECT
        s."id"::text,
        'zh',
        CASE WHEN s."_order" = 1 THEN '最新评测' ELSE '我们的评测方法' END,
        CASE
          WHEN s."_order" = 1 THEN '查看独立童车评测结果，获得清晰评分与实用选购建议。'
          ELSE '每款产品都按安全、舒适、便携、功能和性价比五个维度进行透明评分。'
        END
      FROM "site_pages_sections" s
      WHERE s."_parent_id" = ${pageId}
      ON CONFLICT ("_parent_id", "_locale") DO UPDATE
      SET
        "heading" = EXCLUDED."heading",
        "body" = EXCLUDED."body"
    `);

    const enRows = await exec(`
      SELECT s."_order", l."_parent_id", l."_locale", l."heading", l."body"
      FROM "site_pages_sections" s
      JOIN "site_pages_sections_locales" l ON l."_parent_id" = s."id"::text
      WHERE s."_parent_id" = ${pageId} AND l."_locale" = 'en'
      ORDER BY s."_order" ASC
    `);

    const zhRows = await exec(`
      SELECT s."_order", l."_parent_id", l."_locale", l."heading", l."body"
      FROM "site_pages_sections" s
      JOIN "site_pages_sections_locales" l ON l."_parent_id" = s."id"::text
      WHERE s."_parent_id" = ${pageId} AND l."_locale" = 'zh'
      ORDER BY s."_order" ASC
    `);

    return res.status(200).json({
      ok: true,
      now: new Date().toISOString(),
      pageId,
      rows: {
        enSectionRows: enRows.length,
        zhSectionRows: zhRows.length,
      },
      preview: {
        en: enRows,
        zh: zhRows,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
}
