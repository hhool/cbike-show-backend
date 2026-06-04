import config from "@payload-config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import LocaleOpsEditor from "./LocaleOpsEditor";

type PageProps = {
  searchParams?: Promise<{ q?: string; updated?: string; ns?: string; recent?: string }>;
};

type LocaleEntryDoc = {
  id: number;
  key?: string;
  value?: string;
  description?: string;
  updatedAt?: string;
};

const NAMESPACE_OPTIONS = ["common", "home", "products", "reviews", "brands"] as const;
const RECENT_OPTIONS = ["all", "24h", "7d"] as const;

function normalizeNamespace(value?: string): (typeof NAMESPACE_OPTIONS)[number] {
  if (!value) return "brands";
  return NAMESPACE_OPTIONS.includes(value as (typeof NAMESPACE_OPTIONS)[number])
    ? (value as (typeof NAMESPACE_OPTIONS)[number])
    : "brands";
}

function normalizeRecent(value?: string): (typeof RECENT_OPTIONS)[number] {
  if (!value) return "all";
  return RECENT_OPTIONS.includes(value as (typeof RECENT_OPTIONS)[number])
    ? (value as (typeof RECENT_OPTIONS)[number])
    : "all";
}

async function updateBrandsEntries(formData: FormData) {
  "use server";

  const payload = await getPayload({ config });
  const namespace = normalizeNamespace(String(formData.get("ns") || "brands"));
  const recent = normalizeRecent(String(formData.get("recent") || "all"));
  const ids = formData
    .getAll("entryId")
    .map((item) => Number(item))
    .filter((id) => Number.isFinite(id));

  let updated = 0;

  for (const id of ids) {
    const zhValue = String(formData.get(`zh:${id}`) ?? "").trim();
    const enValue = String(formData.get(`en:${id}`) ?? "").trim();
    const zhOriginal = String(formData.get(`zh0:${id}`) ?? "").trim();
    const enOriginal = String(formData.get(`en0:${id}`) ?? "").trim();

    if (zhValue === zhOriginal && enValue === enOriginal) {
      continue;
    }

    updated += 1;

    if (zhValue !== zhOriginal) {
      await payload.update({
        collection: "locale-entries",
        id,
        data: {
          value: zhValue,
        },
      });
    }

    if (enValue !== enOriginal) {
      await payload.update({
        collection: "locale-entries",
        id,
        locale: "en",
        data: {
          value: enValue,
        },
      });
    }
  }

  const q = String(formData.get("q") ?? "").trim();
  const query = new URLSearchParams();
  query.set("updated", String(updated));
  query.set("ns", namespace);
  query.set("recent", recent);
  if (q) query.set("q", q);
  redirect(`/i18n/brands?${query.toString()}`);
}

export default async function BrandsI18nOpsPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const q = (params.q || "").trim();
  const namespace = normalizeNamespace(params.ns);
  const recent = normalizeRecent(params.recent);
  const payload = await getPayload({ config });

  const whereClause: Record<string, unknown> = {
    namespace: {
      equals: namespace,
    },
  };

  if (q) {
    whereClause.key = {
      like: q,
    };
  }

  const zhResult = await payload.find({
    collection: "locale-entries",
    limit: 300,
    pagination: false,
    where: whereClause,
    locale: "zh",
    fallbackLocale: "en",
    sort: "key",
    depth: 0,
  });

  const enResult = await payload.find({
    collection: "locale-entries",
    limit: 300,
    pagination: false,
    where: whereClause,
    locale: "en",
    fallbackLocale: "zh",
    sort: "key",
    depth: 0,
  });

  const enMap = new Map<number, string>();
  for (const entry of enResult.docs as LocaleEntryDoc[]) {
    enMap.set(entry.id, entry.value || "");
  }

  const docs = zhResult.docs as LocaleEntryDoc[];
  const updatedCount = Number(params.updated || 0);
  const nowMs = Date.now();
  const recentThresholdMs = recent === "24h" ? 24 * 60 * 60 * 1000 : recent === "7d" ? 7 * 24 * 60 * 60 * 1000 : 0;

  const entries = docs
    .map((entry) => ({
    id: entry.id,
    key: entry.key || "",
    description: entry.description || "",
    zhOriginal: entry.value || "",
    enOriginal: enMap.get(entry.id) || "",
      updatedAt: entry.updatedAt || "",
    }))
    .filter((entry) => {
      if (recentThresholdMs === 0) return true;
      if (!entry.updatedAt) return false;
      const updatedMs = new Date(entry.updatedAt).getTime();
      if (!Number.isFinite(updatedMs)) return false;
      return nowMs - updatedMs <= recentThresholdMs;
    });

  return (
    <main style={{ maxWidth: 1180, margin: "36px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>Locale Operations</h1>
        <p style={{ marginTop: 10, color: "#55646d" }}>
          Centralized editor for <strong>{namespace}.*</strong> locale keys with zh/en bulk update.
        </p>
        <p style={{ margin: "8px 0 0" }}>
          <Link href="/admin" style={{ color: "#1c5b88", textDecoration: "none" }}>
            Back to Admin
          </Link>
          <span style={{ margin: "0 8px", color: "#8ba0ad" }}>|</span>
          <Link href="/brands?lang=en" style={{ color: "#1c5b88", textDecoration: "none" }}>
            Preview Brands Page
          </Link>
        </p>
      </header>

      <section style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 14, background: "#fff", marginBottom: 14 }}>
        <form method="get" action="/i18n/brands" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            name="ns"
            defaultValue={namespace}
            style={{ minWidth: 170, padding: "8px 10px", border: "1px solid #d5e0e8", borderRadius: 8 }}
          >
            {NAMESPACE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="recent"
            defaultValue={recent}
            style={{ minWidth: 150, padding: "8px 10px", border: "1px solid #d5e0e8", borderRadius: 8 }}
          >
            <option value="all">All updates</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={`Search by key, e.g. ${namespace}.detail`}
            style={{ minWidth: 320, padding: "8px 10px", border: "1px solid #d5e0e8", borderRadius: 8 }}
          />
          <button type="submit" style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #1c5b88", background: "#1c5b88", color: "#fff", cursor: "pointer" }}>
            Search
          </button>
          <Link href="/i18n/brands" style={{ alignSelf: "center", color: "#1c5b88", textDecoration: "none" }}>
            Reset
          </Link>
        </form>
      </section>

      {updatedCount > 0 && (
        <p style={{ margin: "0 0 12px", color: "#2d7a46", fontWeight: 600 }}>
          Updated {updatedCount} entries successfully.
        </p>
      )}

      <LocaleOpsEditor entries={entries} namespace={namespace} q={q} recent={recent} action={updateBrandsEntries} />
    </main>
  );
}
