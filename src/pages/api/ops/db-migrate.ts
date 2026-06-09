import type { NextApiRequest, NextApiResponse } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

type SafeError = {
  name: string;
  message: string;
  code?: string;
};

type MigrateResponse = {
  ok: boolean;
  action: "status" | "migrate";
  now: string;
  adapterSupportsMigrate: boolean;
  error?: SafeError;
};

const HEADER = "x-diag-secret";

const toSafeError = (error: unknown): SafeError => {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MigrateResponse | { error: string }>
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

  const rawAction = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  const action: "status" | "migrate" = rawAction === "status" ? "status" : "migrate";

  try {
    const payload = await getPayload({ config });
    const adapter = (payload as any)?.db as {
      migrate?: () => Promise<void>;
      migrateStatus?: () => Promise<void>;
    };

    if (!adapter?.migrate) {
      return res.status(200).json({
        ok: false,
        action,
        now: new Date().toISOString(),
        adapterSupportsMigrate: false,
        error: {
          name: "UnsupportedAdapter",
          message: "Current database adapter does not expose migrate().",
        },
      });
    }

    if (action === "status" && adapter.migrateStatus) {
      await adapter.migrateStatus();
    } else {
      await adapter.migrate();
    }

    return res.status(200).json({
      ok: true,
      action,
      now: new Date().toISOString(),
      adapterSupportsMigrate: true,
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      action,
      now: new Date().toISOString(),
      adapterSupportsMigrate: true,
      error: toSafeError(error),
    });
  }
}
