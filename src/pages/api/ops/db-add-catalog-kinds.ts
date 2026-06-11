import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type Row = Record<string, unknown>;

type Response = {
  ok: boolean;
  now: string;
  targets: { table: string; column: string; enumType: string | null }[];
  added: { enumType: string; value: string; ok: boolean; error?: string }[];
  enumValuesAfter: Record<string, string[]>;
};

// Canonical catalog kind / market-focus values defined in the Payload collections.
const CANONICAL_VALUES = [
  "stroller",
  "balance_bike",
  "scooter",
  "bicycle",
  "tricycle",
  "electric_bike",
  "ride_on_toy",
  "electric_toy_car",
  "walker",
  "multi_functional_bike",
];

// Columns whose Postgres enum type must carry every canonical value.
const TARGET_COLUMNS = [
  { table: "categories", column: "kind" },
  { table: "brands_market_focus", column: "value" },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response | { error: string }>
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
  const drizzle = (payload as any)?.db?.drizzle;
  if (!drizzle) {
    return res.status(503).json({ error: "No drizzle instance found on payload.db" });
  }

  const query = async (sql: string): Promise<Row[]> => {
    const result = await drizzle.execute(sql);
    const rows = (result as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as Row[]) : [];
  };

  // 1) Resolve the enum type backing each target column (udt_name when data_type = USER-DEFINED).
  const targets: Response["targets"] = [];
  for (const t of TARGET_COLUMNS) {
    const rows = await query(`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${t.table}' AND column_name = '${t.column}'
      LIMIT 1
    `);
    const row = rows[0];
    const isEnum = row && String(row.data_type) === "USER-DEFINED";
    targets.push({ table: t.table, column: t.column, enumType: isEnum ? String(row.udt_name) : null });
  }

  // 2) Add any missing canonical value to each resolved enum type.
  const added: Response["added"] = [];
  const enumTypes = Array.from(new Set(targets.map((t) => t.enumType).filter(Boolean) as string[]));
  for (const enumType of enumTypes) {
    for (const value of CANONICAL_VALUES) {
      const stmt = `ALTER TYPE "${enumType}" ADD VALUE IF NOT EXISTS '${value}'`;
      try {
        await drizzle.execute(stmt);
        added.push({ enumType, value, ok: true });
      } catch (err) {
        added.push({ enumType, value, ok: false, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  // 3) Report the resulting values per enum type for verification.
  const enumValuesAfter: Record<string, string[]> = {};
  for (const enumType of enumTypes) {
    const rows = await query(`
      SELECT e.enumlabel AS value
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = '${enumType}'
      ORDER BY e.enumsortorder
    `);
    enumValuesAfter[enumType] = rows.map((r) => String(r.value));
  }

  const allOk = added.every((a) => a.ok);
  return res.status(200).json({
    ok: allOk,
    now: new Date().toISOString(),
    targets,
    added,
    enumValuesAfter,
  });
}
