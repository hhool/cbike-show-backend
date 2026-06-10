import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

const toSafeError = (error: unknown) => {
  if (error instanceof Error) {
    const candidate = error as Error & { code?: string; detail?: string; hint?: string };
    return {
      name: candidate.name,
      message: candidate.message,
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      detail: typeof candidate.detail === "string" ? candidate.detail : undefined,
      hint: typeof candidate.hint === "string" ? candidate.hint : undefined,
      stack: (candidate.stack || "").split("\n").slice(0, 8),
    };
  }

  return { name: "Error", message: String(error) };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.DIAG_TRIGGER_SECRET;
  const incoming = req.headers[HEADER];
  if (!secret) return res.status(503).json({ error: "DIAG_TRIGGER_SECRET not configured" });
  if (incoming !== secret) return res.status(403).json({ error: "Forbidden" });

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "news",
      limit: 3,
      depth: 1,
      where: {
        status: { equals: "published" },
      },
      locale: "en",
      fallbackLocale: false,
    });

    return res.status(200).json({ ok: true, totalDocs: result.totalDocs, docs: result.docs });
  } catch (error) {
    return res.status(500).json({ ok: false, error: toSafeError(error) });
  }
}
