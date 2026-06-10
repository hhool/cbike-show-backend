import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type Result = { statement: string; ok: boolean; error?: string };

const SQLS = [
  `ALTER TABLE "news_regions" ADD COLUMN IF NOT EXISTS "parent_id" integer`,
  `ALTER TABLE "news_regions" ADD COLUMN IF NOT EXISTS "order" integer`,
  `UPDATE "news_regions" SET "parent_id" = "_parent_id" WHERE "parent_id" IS NULL AND "_parent_id" IS NOT NULL`,
  `UPDATE "news_regions" SET "order" = "_order" WHERE "order" IS NULL AND "_order" IS NOT NULL`,
  `UPDATE "news_regions" SET "order" = 0 WHERE "order" IS NULL`,
  `CREATE INDEX IF NOT EXISTS "news_regions_parent_id_idx" ON "news_regions" ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "news_regions_order_idx" ON "news_regions" ("order")`
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.DIAG_TRIGGER_SECRET;
  const incoming = req.headers[HEADER];
  if (!secret) return res.status(503).json({ error: "DIAG_TRIGGER_SECRET is not configured" });
  if (incoming !== secret) return res.status(403).json({ error: "Forbidden" });

  const payload = await getPayload({ config });
  const drizzle = (payload as any)?.db?.drizzle;
  if (!drizzle) return res.status(503).json({ error: "No drizzle instance found on payload.db" });

  const results: Result[] = [];
  for (const statement of SQLS) {
    try {
      await drizzle.execute(statement);
      results.push({ statement, ok: true });
    } catch (error) {
      results.push({ statement, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return res.status(200).json({ ok: results.every((r) => r.ok), results });
}
