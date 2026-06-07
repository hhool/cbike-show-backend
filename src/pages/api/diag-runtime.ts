import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

type ProbeResult = {
  ok: boolean;
  collection: string;
  totalDocs?: number;
  error?: {
    name: string;
    message: string;
    code?: string;
  };
};

type DiagResponse = {
  ok: boolean;
  now: string;
  checks: {
    env: {
      hasDatabaseUrl: boolean;
      hasPayloadSecret: boolean;
      hasR2Config: boolean;
    };
    payloadInit: {
      ok: boolean;
      error?: {
        name: string;
        message: string;
        code?: string;
      };
    };
    probes: ProbeResult[];
  };
};

const HEADER = "x-diag-secret";

const toSafeError = (error: unknown): { name: string; message: string; code?: string } => {
  if (error instanceof Error) {
    const candidate = error as Error & { code?: string };
    return {
      name: candidate.name,
      message: candidate.message,
      code: typeof candidate.code === "string" ? candidate.code : undefined,
    };
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as Record<string, unknown>;
    return {
      name: typeof candidate.name === "string" ? candidate.name : "Error",
      message: typeof candidate.message === "string" ? candidate.message : "Unknown error",
      code: typeof candidate.code === "string" ? candidate.code : undefined,
    };
  }

  return {
    name: "Error",
    message: typeof error === "string" ? error : "Unknown error",
  };
};

const runProbe = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: "media" | "products"
): Promise<ProbeResult> => {
  try {
    const result = await payload.find({
      collection,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    return {
      ok: true,
      collection,
      totalDocs: result.totalDocs,
    };
  } catch (error) {
    return {
      ok: false,
      collection,
      error: toSafeError(error),
    };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<DiagResponse | { error: string }>) {
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

  const env = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasPayloadSecret: Boolean(process.env.PAYLOAD_SECRET),
    hasR2Config: Boolean(
      process.env.R2_BUCKET_NAME &&
        process.env.R2_ENDPOINT &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY
    ),
  };

  try {
    const payload = await getPayload({ config });
    const mediaProbe = await runProbe(payload, "media");
    const productProbe = await runProbe(payload, "products");

    return res.status(200).json({
      ok: mediaProbe.ok && productProbe.ok,
      now: new Date().toISOString(),
      checks: {
        env,
        payloadInit: { ok: true },
        probes: [mediaProbe, productProbe],
      },
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      now: new Date().toISOString(),
      checks: {
        env,
        payloadInit: {
          ok: false,
          error: toSafeError(error),
        },
        probes: [],
      },
    });
  }
}
