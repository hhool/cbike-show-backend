import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const HEADER = "x-diag-secret";

const toSafe = (error: unknown) => {
  if (error instanceof Error) {
    const e = error as Error & { code?: string; detail?: string; hint?: string; cause?: any };
    return {
      name: e.name,
      message: e.message,
      code: e.code,
      detail: e.detail,
      hint: e.hint,
      cause: e.cause
        ? {
            name: e.cause.name,
            message: e.cause.message,
            code: e.cause.code,
            detail: e.cause.detail,
            hint: e.cause.hint,
            routine: e.cause.routine,
            position: e.cause.position,
          }
        : undefined,
      stack: (e.stack || "").split("\n").slice(0, 10),
    };
  }
  return { message: String(error) };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.DIAG_TRIGGER_SECRET;
  const incoming = req.headers[HEADER];
  if (!secret) return res.status(503).json({ error: "DIAG_TRIGGER_SECRET is not configured" });
  if (incoming !== secret) return res.status(403).json({ error: "Forbidden" });

  try {
    const payload = await getPayload({ config });
    const doc = await payload.create({
      collection: "news",
      locale: "zh",
      data: {
        slug: `probe-news-create-${Date.now()}`,
        category: 1,
        title: "探针标题",
        summary: "探针摘要",
        body: {
          root: {
            type: "root",
            version: 1,
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [{ type: "text", version: 1, text: "探针正文" }],
              },
            ],
          },
        },
      },
    });

    return res.status(200).json({ ok: true, id: doc.id, slug: doc.slug, status: doc.status });
  } catch (error) {
    return res.status(500).json({ ok: false, error: toSafe(error) });
  }
}
