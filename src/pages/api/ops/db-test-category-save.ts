import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type SaveResponse =
  | {
      ok: true;
      now: string;
      result: {
        id: number | string;
        name?: string;
        slug?: string;
        kind?: string;
        ageRange?: string;
      };
    }
  | {
      ok: false;
      now: string;
      error: string;
      details?: unknown;
    }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SaveResponse>) {
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

  const id = String(req.body?.id ?? "").trim();
  const locale = String(req.body?.locale ?? "zh").trim() || "zh";
  const name = String(req.body?.name ?? "").trim();

  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  if (!name) {
    return res.status(400).json({ error: "Missing name" });
  }

  try {
    const payload = await getPayload({ config });
    const updated = await payload.update({
      collection: "categories",
      id,
      locale,
      fallbackLocale: false,
      overrideAccess: true,
      data: {
        name,
      },
    });

    return res.status(200).json({
      ok: true,
      now: new Date().toISOString(),
      result: {
        id: updated.id,
        name: (updated as any).name,
        slug: (updated as any).slug,
        kind: (updated as any).kind,
        ageRange: (updated as any).ageRange,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const details = (error as any)?.data ?? (error as any)?.errors ?? null;

    return res.status(500).json({
      ok: false,
      now: new Date().toISOString(),
      error: message,
      details,
    });
  }
}
