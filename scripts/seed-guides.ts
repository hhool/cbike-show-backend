/**
 * Seed script for sample buying guides.
 *
 * Usage:
 *   API_BASE=http://localhost:3000 npx tsx scripts/seed-guides.ts
 */

const API_BASE = (process.env.API_BASE || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";
const DEFAULT_GUIDE_COVER_FILENAME = (process.env.SEED_GUIDE_COVER_FILENAME || "").trim();

let fallbackMediaIdCache: number | null | undefined;

type GuideSeed = {
  slug: string;
  category: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  contentZh: string;
  contentEn: string;
  coverFilename?: string;
  publishedAt: string;
};

const GUIDE_SEEDS: GuideSeed[] = [
  {
    slug: "newborn-first-stroller-6-steps",
    category: "beginner",
    titleZh: "人生第一台推车怎么选？6 步上手",
    titleEn: "How to choose your first stroller: a 6-step checklist",
    summaryZh: "适合 0–6 月新生儿家庭",
    summaryEn: "Designed for families with newborns aged 0-6 months.",
    contentZh: "本指南详细讲解新生儿推车选购的6个关键步骤，帮助新手家长快速理解产品选择的核心逻辑...",
    contentEn: "This guide walks you through 6 key steps for choosing a newborn stroller, helping first-time parents quickly understand the core logic behind product selection...",
    publishedAt: "2026-06-10T08:00:00.000Z"
  },
  {
    slug: "outdoor-travel-stroller-guide",
    category: "scenario",
    titleZh: "户外出行推车选购全攻略",
    titleEn: "Outdoor-travel stroller buying framework",
    summaryZh: "重点关注减震 / 越野轮 / 防晒",
    summaryEn: "Prioritize suspension, all-terrain wheels, and sun protection.",
    contentZh: "针对户外出行场景，本指南重点讲解如何评估推车的减震性能、轮胎通过性和防晒能力...",
    contentEn: "For outdoor travel scenarios, this guide emphasizes how to assess stroller suspension, tire terrain-handling, and sun protection capabilities...",
    publishedAt: "2026-06-09T09:00:00.000Z"
  },
  {
    slug: "mid-range-stroller-1000-3000",
    category: "budget",
    titleZh: "¥1000–3000 中端推车选购方案",
    titleEn: "Mid-range stroller plan for the ¥1000-3000 budget",
    summaryZh: "拆解溢价构成,识别智商税",
    summaryEn: "Break down premium pricing and avoid low-value markups.",
    contentZh: "在 1000-3000 元预算内，什么配置是必须的，什么是溢价？本指南帮你识别价格构成...",
    contentEn: "Within a ¥1000-3000 budget, what specs are essential and what adds unnecessary cost? This guide helps you understand the price composition...",
    publishedAt: "2026-06-08T10:00:00.000Z"
  },
  {
    slug: "identify-false-specs",
    category: "risk",
    titleZh: "参数虚标的 7 种常见套路",
    titleEn: "Seven common patterns of misleading specifications",
    summaryZh: "重量、载重、轮胎类型如何识别",
    summaryEn: "How to verify claimed weight, load limits, and tire type.",
    contentZh: "产品参数虚标是消费者投诉最多的问题。本指南总结了 7 种常见套路及识别方法...",
    contentEn: "False specification claims are among the most common consumer complaints. This guide summarizes 7 common patterns and how to identify them...",
    publishedAt: "2026-06-07T11:00:00.000Z"
  },
  {
    slug: "verify-overseas-certification",
    category: "crossborder",
    titleZh: "海外认证如何分辨真伪",
    titleEn: "How to validate overseas certification authenticity",
    summaryZh: "EN1888 / ASTM 证书查询通道",
    summaryEn: "Use EN1888 and ASTM certificate lookup channels.",
    contentZh: "跨境购物时，如何验证进口推车的认证信息？本指南提供各主要认证体系的查询方式...",
    contentEn: "When shopping cross-border, how do you verify imported stroller certifications? This guide provides lookup methods for major certification systems...",
    publishedAt: "2026-06-06T12:00:00.000Z"
  },
  {
    slug: "balance-bike-vs-tricycle",
    category: "category",
    titleZh: "平衡车 vs 三轮车，2 岁宝宝怎么选",
    titleEn: "Balance bike vs tricycle: best fit for a 2-year-old",
    summaryZh: "发育阶段对应车型对照",
    summaryEn: "Model selection mapped to development stages.",
    contentZh: "2 岁宝宝应该选择平衡车还是三轮车？本指南根据发育阶段为你分析各车型的优缺点...",
    contentEn: "Should a 2-year-old get a balance bike or tricycle? This guide analyzes each model's pros and cons based on development stages...",
    publishedAt: "2026-06-05T13:00:00.000Z"
  },
  {
    slug: "stroller-care-maintenance",
    category: "maintenance",
    titleZh: "推车清洁与保养标准流程",
    titleEn: "Standard workflow for stroller cleaning and maintenance",
    summaryZh: "延长使用年限的 5 个习惯",
    summaryEn: "Five habits that extend product lifespan.",
    contentZh: "正确的清洁和保养方法可以大大延长推车的使用寿命。本指南为你提供标准的维护流程...",
    contentEn: "Proper cleaning and maintenance can significantly extend stroller lifespan. This guide provides a standard maintenance workflow...",
    publishedAt: "2026-06-04T14:00:00.000Z"
  }
];

async function request(
  url: string,
  options?: RequestInit,
  token?: string
): Promise<any> {
  const fullUrl = `${API_BASE}${url}`;
  const headers: HeadersInit = { "Content-Type": "application/json", ...options?.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(fullUrl, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `HTTP ${response.status} ${response.statusText}: ${url}\nResponse: ${text}`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

function unwrapDoc(data: any): any {
  return data?.doc || data;
}

async function ensureAdminToken(): Promise<string> {
  const login = await request("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!login?.token) throw new Error("Admin login failed: token missing.");
  return String(login.token);
}

async function findBySlug(slug: string, token: string): Promise<any | null> {
  const query = `/api/guides?limit=1&where[slug][equals]=${encodeURIComponent(slug)}`;
  const data = await request(query, undefined, token);
  return Array.isArray(data?.docs) ? data.docs[0] || null : null;
}

async function findMediaIdByFilename(filename: string, token: string): Promise<number | null> {
  const name = String(filename || "").trim();
  if (!name) return null;

  const query = `/api/media?limit=1&where[filename][equals]=${encodeURIComponent(name)}`;
  const data = await request(query, undefined, token);
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  const id = Number(doc?.id);
  return Number.isFinite(id) ? id : null;
}

async function findLatestMediaId(token: string): Promise<number | null> {
  if (fallbackMediaIdCache !== undefined) return fallbackMediaIdCache;

  const data = await request(`/api/media?limit=1&sort=-createdAt`, undefined, token);
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  const id = Number(doc?.id);
  fallbackMediaIdCache = Number.isFinite(id) ? id : null;
  return fallbackMediaIdCache;
}

async function ensureGuideDraft(seed: GuideSeed, token: string): Promise<string> {
  const existing = await findBySlug(seed.slug, token);
  const requestedCoverFilename = (seed.coverFilename || DEFAULT_GUIDE_COVER_FILENAME || "").trim();
  const explicitCoverId = requestedCoverFilename ? await findMediaIdByFilename(requestedCoverFilename, token) : null;
  if (requestedCoverFilename && !explicitCoverId) {
    console.warn(`[seed-guides] cover media not found: slug=${seed.slug}, filename=${requestedCoverFilename}`);
  }
  const coverId = explicitCoverId || (await findLatestMediaId(token));
  if (!coverId) {
    throw new Error(
      `No media available for guide cover (slug=${seed.slug}). Upload at least one media item first or set SEED_GUIDE_COVER_FILENAME/coverFilename.`
    );
  }

  const baseBody = {
    slug: seed.slug,
    category: seed.category,
    cover: coverId,
    titleZh: seed.titleZh,
    titleEn: seed.titleEn,
    summaryZh: seed.summaryZh,
    summaryEn: seed.summaryEn,
    content: seed.contentZh,
    publishedAt: seed.publishedAt,
  };

  if (existing?.id) {
    await request(`/api/guides/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(baseBody) }, token);
    return String(existing.id);
  }

  const created = unwrapDoc(await request("/api/guides?locale=zh", { method: "POST", body: JSON.stringify(baseBody) }, token));
  const id = String(created.id || "");
  if (!id) throw new Error(`Failed to create guide draft: ${seed.slug}`);
  return id;
}

async function patchEnglishLocale(id: string, seed: GuideSeed, token: string): Promise<void> {
  await request(
    `/api/guides/${id}?locale=en`,
    {
      method: "PATCH",
      body: JSON.stringify({
        titleEn: seed.titleEn,
        summaryEn: seed.summaryEn,
        content: seed.contentEn,
      }),
    },
    token
  );
}

async function readCurrentGuideStatus(id: string, token: string): Promise<string> {
  const doc = unwrapDoc(await request(`/api/guides/${id}?locale=zh`, undefined, token));
  return String(doc?.status || "draft").trim() || "draft";
}

async function transitionGuideToPublished(id: string, publishedAt: string, token: string): Promise<void> {
  const status = await readCurrentGuideStatus(id, token);

  if (status === "published") {
    await request(
      `/api/guides/${id}?locale=zh`,
      {
        method: "PATCH",
        body: JSON.stringify({
          publishedAt,
        }),
      },
      token
    );
    return;
  }

  if (status === "archived") {
    await request(
      `/api/guides/${id}?locale=zh`,
      { method: "PATCH", body: JSON.stringify({ status: "draft" }) },
      token
    );
  }

  const latest = await readCurrentGuideStatus(id, token);

  if (latest === "draft") {
    await request(
      `/api/guides/${id}?locale=zh`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "published",
          publishedAt,
        }),
      },
      token
    );
  }
}

async function upsertGuide(seed: GuideSeed, token: string): Promise<void> {
  const id = await ensureGuideDraft(seed, token);
  await patchEnglishLocale(id, seed, token);
  await transitionGuideToPublished(id, seed.publishedAt, token);
}

async function main() {
  const token = await ensureAdminToken();

  for (const seed of GUIDE_SEEDS) {
    await upsertGuide(seed, token);
    console.log(`Upserted guide: ${seed.slug}`);
  }

  console.log("Sample guides are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
