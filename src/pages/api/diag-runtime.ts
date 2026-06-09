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
    dbMigration: {
      adapterSupportsMigrate: boolean;
      hasSchemaDrift: boolean;
      driftSignals: string[];
      recommendedActions: string[];
    };
    probes: ProbeResult[];
  };
};

const HEADER = "x-diag-secret";

const PROBE_COLLECTIONS = ["media", "products", "categories", "reviews", "site-pages", "locale-entries"] as const;

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
  collection: (typeof PROBE_COLLECTIONS)[number]
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

function detectSchemaDriftSignals(probes: ProbeResult[]): string[] {
  const signals = new Set<string>();

  for (const probe of probes) {
    if (probe.ok || !probe.error?.message) continue;
    const message = probe.error.message.toLowerCase();

    if (message.includes("does not exist") || message.includes("undefined column") || message.includes("no such column")) {
      signals.add(`missing table/column in collection '${probe.collection}'`);
    }
    if (message.includes("_reviews_v") || message.includes("version_slug")) {
      signals.add("reviews version table mismatch (_reviews_v / version_slug)");
    }
    if (message.includes("_status")) {
      signals.add("draft status column mismatch (_status)");
    }
  }

  return Array.from(signals);
}

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
    const probes = await Promise.all(PROBE_COLLECTIONS.map((collection) => runProbe(payload, collection)));
    const driftSignals = detectSchemaDriftSignals(probes);
    const dbAdapter = (payload as any)?.db as
      | { migrate?: () => Promise<void>; migrateStatus?: () => Promise<void> }
      | undefined;
    const adapterSupportsMigrate = Boolean(dbAdapter?.migrate);

    if (driftSignals.length > 0) {
      console.error("[diag-runtime][schema-drift]", {
        driftSignals,
        failedCollections: probes.filter((probe) => !probe.ok).map((probe) => probe.collection),
      });
    }

    return res.status(200).json({
      ok: probes.every((probe) => probe.ok),
      now: new Date().toISOString(),
      checks: {
        env,
        payloadInit: { ok: true },
        dbMigration: {
          adapterSupportsMigrate,
          hasSchemaDrift: driftSignals.length > 0,
          driftSignals,
          recommendedActions: [
            "Run migrations: npm run db:migrate",
            "Check migration status: npm run db:migrate:status",
            "On deployed environments, call POST /api/ops/db-migrate with x-diag-secret header",
          ],
        },
        probes,
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
        dbMigration: {
          adapterSupportsMigrate: false,
          hasSchemaDrift: false,
          driftSignals: [],
          recommendedActions: ["Ensure Payload boot succeeds before running migration diagnostics."],
        },
        probes: [],
      },
    });
  }
}
