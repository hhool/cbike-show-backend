import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";
type Row = Record<string, unknown>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.DIAG_TRIGGER_SECRET;
  const incoming = req.headers[HEADER];
  if (!secret) return res.status(503).json({ error: "DIAG_TRIGGER_SECRET not configured" });
  if (incoming !== secret) return res.status(403).json({ error: "Forbidden" });

  const payload = await getPayload({ config });
  const drizzle = (payload as any)?.db?.drizzle;
  if (!drizzle) return res.status(503).json({ error: "No drizzle instance" });

  const q = async (sql: string): Promise<Row[]> => {
    const r = await drizzle.execute(sql);
    const rows = (r as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as Row[]) : [];
  };

  const tables = ["news", "news_locales", "news_categories", "news_tags", "news_regions"];
  const columns: Record<string, Row[]> = {};
  for (const t of tables) {
    columns[t] = await q(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema='public' AND table_name='${t}'
       ORDER BY ordinal_position`
    );
  }

  return res.status(200).json({ ok: true, now: new Date().toISOString(), columns });
}
