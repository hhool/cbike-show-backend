import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

type ReviewStatus = "draft" | "compliance" | "chief" | "published" | "archived";

type RequestBody = {
  id: number;
  locale?: "zh" | "en";
  status?: ReviewStatus;
  title?: string;
  summary?: string;
};

type ResponseBody = {
  ok: boolean;
  now: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  error?: string;
};

function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === "draft" || value === "compliance" || value === "chief" || value === "published" || value === "archived";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseBody | { error: string }>) {
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

  const body = (req.body ?? {}) as RequestBody;
  const id = Number(body.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const locale = body.locale === "en" ? "en" : "zh";
  const status = body.status;

  if (status !== undefined && !isReviewStatus(status)) {
    return res.status(400).json({ error: "status must be one of draft/compliance/chief/published/archived" });
  }

  const payload = await getPayload({ config });

  try {
    const before = await payload.findByID({
      collection: "reviews",
      id,
      locale,
      fallbackLocale: false,
      depth: 0,
    });

    const patch: Record<string, unknown> = {};
    if (status) patch.status = status;
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.summary === "string") patch.summary = body.summary;

    const after = await payload.update({
      collection: "reviews",
      id,
      locale,
      fallbackLocale: false,
      depth: 0,
      data: patch,
    });

    return res.status(200).json({
      ok: true,
      now: new Date().toISOString(),
      before: {
        id: before?.id,
        status: (before as any)?.status,
        title: (before as any)?.title,
        summary: (before as any)?.summary,
      },
      after: {
        id: after?.id,
        status: (after as any)?.status,
        title: (after as any)?.title,
        summary: (after as any)?.summary,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(200).json({
      ok: false,
      now: new Date().toISOString(),
      error: message,
    });
  }
}
