import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type Row = Record<string, unknown>;

type InspectResponse = {
  ok: boolean;
  now: string;
  categoriesColumns: Row[];
  categoriesLocalesColumns: Row[];
  categoriesSample: Row[];
  categoriesLocalesSample: Row[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InspectResponse | { error: string }>
) {
  if (req.method !== "GET") {
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
  const drizzle = (payload as any)?.db?.drizzle;

  if (!drizzle) {
    return res.status(503).json({ error: "No drizzle instance found on payload.db" });
  }

  const query = async (sql: string): Promise<Row[]> => {
    const result = await drizzle.execute(sql);
    const rows = (result as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as Row[]) : [];
  };

  const categoriesColumns = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories'
    ORDER BY ordinal_position
  `);

  const categoriesLocalesColumns = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories_locales'
    ORDER BY ordinal_position
  `);

  const categoriesSample = await query(`
    SELECT * FROM categories ORDER BY 1 LIMIT 10
  `);

  const categoriesLocalesSample = await query(`
    SELECT * FROM categories_locales ORDER BY 1 LIMIT 20
  `);

  return res.status(200).json({
    ok: true,
    now: new Date().toISOString(),
    categoriesColumns,
    categoriesLocalesColumns,
    categoriesSample,
    categoriesLocalesSample,
  });
}