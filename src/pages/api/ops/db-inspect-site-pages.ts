import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type Row = Record<string, unknown>;

type InspectResponse = {
  ok: boolean;
  now: string;
  sectionsColumns: Row[];
  sectionsLocalesColumns: Row[];
  sectionsSample: Row[];
  sectionsLocalesSample: Row[];
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

  const sectionsColumns = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_pages_sections'
    ORDER BY ordinal_position
  `);

  const sectionsLocalesColumns = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_pages_sections_locales'
    ORDER BY ordinal_position
  `);

  const sectionsSample = await query(`
    SELECT * FROM site_pages_sections ORDER BY 1 LIMIT 5
  `);

  const sectionsLocalesSample = await query(`
    SELECT * FROM site_pages_sections_locales ORDER BY 1 LIMIT 5
  `);

  return res.status(200).json({
    ok: true,
    now: new Date().toISOString(),
    sectionsColumns,
    sectionsLocalesColumns,
    sectionsSample,
    sectionsLocalesSample,
  });
}
