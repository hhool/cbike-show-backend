/**
 * Seed script for sample buying guides.
 *
 * Usage:
 *   API_BASE=http://localhost:3000 npx tsx scripts/seed-guides.ts
 */

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const API_BASE_CANDIDATES = process.env.API_BASE
  ? [process.env.API_BASE]
  : ["http://localhost:3000", "http://localhost:3001"];
let ACTIVE_API_BASE = API_BASE_CANDIDATES[0].replace(/\/$/, "");
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";
const DEFAULT_GUIDE_COVER_FILENAME = (process.env.SEED_GUIDE_COVER_FILENAME || "").trim();
const BOOTSTRAP_MEDIA_ALT = "Guide seed fallback cover";
const LOCAL_MEDIA_CANDIDATES = [
  path.resolve(process.cwd(), "public/media/graco.logo.from-product.jpg"),
  path.resolve(process.cwd(), "public/media/1c481c21-5546-495f-bdf2-c6035b0b3243.jpeg.a.jpeg"),
];

let fallbackMediaIdCache: number | null | undefined;
let localMediaPoolCache: string[] | undefined;
const guideCoverMediaIdCache = new Map<string, number | null>();

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

type EnsureGuideDraftResult = {
  id: string;
  hasCover: boolean;
};

function toLexicalParagraph(text: string) {
  return {
    children: [
      {
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text,
        type: "text",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
    textFormat: 0,
    textStyle: "",
  };
}

function toGuideContent(seed: GuideSeed) {
  return {
    root: {
      children: [toLexicalParagraph(seed.contentZh), toLexicalParagraph(seed.contentEn)],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

const GUIDE_CATEGORY_BOOTSTRAP = [
  "beginner",
  "scenario",
  "budget",
  "risk",
  "crossborder",
  "category",
  "maintenance",
] as const;

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
  },
  {
    slug: "newborn-stroller-safety-checklist",
    category: "beginner",
    titleZh: "新生儿推车安全检查清单",
    titleEn: "Newborn stroller safety checklist",
    summaryZh: "上路前 10 项必查，避免新手误区",
    summaryEn: "Ten must-check items before first use to avoid common beginner mistakes.",
    contentZh: "本清单面向首次上路家庭，覆盖刹车、安全带、坐躺角度、遮阳与收车锁止等关键项目，帮助你在 5 分钟内完成安全确认...",
    contentEn: "This checklist targets first-time families and covers brakes, harness, recline angle, canopy, and fold-lock readiness so you can complete a safety check in minutes...",
    publishedAt: "2026-06-03T08:00:00.000Z"
  },
  {
    slug: "city-commute-stroller-setup",
    category: "scenario",
    titleZh: "城市通勤推车配置建议",
    titleEn: "City-commute stroller setup recommendations",
    summaryZh: "地铁、电梯、商场三场景实用配置",
    summaryEn: "Practical setup for metro, elevators, and shopping-mall routes.",
    contentZh: "针对高频城市通勤场景，本指南提供轮径、折叠体积、提拿手位与储物容量的配置建议，帮助家庭在日常出行中兼顾效率与舒适...",
    contentEn: "For high-frequency city commuting, this guide recommends wheel size, folded volume, carry points, and storage capacity to balance efficiency and comfort...",
    publishedAt: "2026-06-02T09:00:00.000Z"
  },
  {
    slug: "budget-stroller-cost-breakdown",
    category: "budget",
    titleZh: "预算型推车成本拆解模板",
    titleEn: "Budget stroller cost breakdown template",
    summaryZh: "三层预算法，快速识别必要配置",
    summaryEn: "A three-tier budgeting method to identify essential configurations quickly.",
    contentZh: "本模板将购车预算拆分为核心安全、舒适升级、可选配件三层，结合家庭使用周期与折旧预期，帮助你做出更稳妥的预算决策...",
    contentEn: "This template splits stroller spending into core safety, comfort upgrades, and optional accessories while considering usage horizon and depreciation...",
    publishedAt: "2026-06-01T10:00:00.000Z"
  },
  {
    slug: "second-hand-stroller-risk-audit",
    category: "risk",
    titleZh: "二手推车风险核查指南",
    titleEn: "Second-hand stroller risk audit guide",
    summaryZh: "二手交易前的结构与召回核验流程",
    summaryEn: "A structural and recall-verification flow before second-hand purchases.",
    contentZh: "面向二手交易场景，本指南提供车架裂纹、锁扣疲劳、召回批次与配件缺失的排查步骤，帮助你降低潜在安全风险...",
    contentEn: "For second-hand transactions, this guide covers frame cracks, lock fatigue, recall batches, and missing parts to reduce hidden safety risk...",
    publishedAt: "2026-05-31T11:00:00.000Z"
  },
  {
    slug: "crossborder-warranty-claim-guide",
    category: "crossborder",
    titleZh: "跨境售后与保修理赔指南",
    titleEn: "Cross-border after-sales and warranty claim guide",
    summaryZh: "发票、保修条款与物流理赔要点",
    summaryEn: "Key points for invoices, warranty terms, and logistics claims.",
    contentZh: "本指南梳理跨境平台常见售后路径，包含保修条款解读、理赔材料准备与争议处理顺序，帮助你提升跨境维权成功率...",
    contentEn: "This guide outlines common cross-border after-sales paths, including warranty terms, claim evidence preparation, and dispute handling sequence...",
    publishedAt: "2026-05-30T12:00:00.000Z"
  },
  {
    slug: "balance-bike-fit-by-height",
    category: "category",
    titleZh: "平衡车按身高选型指南",
    titleEn: "Balance bike fitting guide by height",
    summaryZh: "从跨高到把位的尺寸匹配规则",
    summaryEn: "Sizing rules from inseam clearance to handlebar position.",
    contentZh: "以儿童身高与跨高为主轴，本指南给出座高区间、把立调节和脚踏过渡建议，帮助家长选择更匹配的平衡车型号...",
    contentEn: "Using child height and inseam as primary inputs, this guide provides seat-height ranges, stem adjustment tips, and transition suggestions...",
    publishedAt: "2026-05-29T13:00:00.000Z"
  },
  {
    slug: "rainy-season-stroller-maintenance",
    category: "maintenance",
    titleZh: "雨季推车保养与防锈要点",
    titleEn: "Rainy-season stroller maintenance and anti-rust tips",
    summaryZh: "雨后清洁、轴承养护与存放规范",
    summaryEn: "Post-rain cleaning, bearing care, and storage best practices.",
    contentZh: "针对潮湿与多雨环境，本指南提供雨后快速清洁、关键金属件防锈和轮组养护步骤，帮助延长整车寿命并保持推行顺畅...",
    contentEn: "For humid and rainy environments, this guide covers post-rain cleaning, anti-rust handling for key metal parts, and wheelset care steps...",
    publishedAt: "2026-05-28T14:00:00.000Z"
  }
];

function assertGuideSeedCategoryCoverage(seeds: GuideSeed[]): void {
  const categoryCounter = new Map<string, number>();
  seeds
    .map((seed) => String(seed.category || "").trim())
    .filter(Boolean)
    .forEach((category) => {
      categoryCounter.set(category, (categoryCounter.get(category) || 0) + 1);
    });

  const missing = GUIDE_CATEGORY_BOOTSTRAP.filter((category) => !categoryCounter.has(category));
  if (missing.length > 0) {
    throw new Error(
      `[seed-guides] bootstrap categories missing sample content: ${missing.join(", ")}. ` +
        "Please add at least one GuideSeed item for each existing setup category."
    );
  }

  const insufficient = GUIDE_CATEGORY_BOOTSTRAP.filter((category) => Number(categoryCounter.get(category) || 0) < 2);
  if (insufficient.length > 0) {
    throw new Error(
      `[seed-guides] categories need at least 2 guides for related recommendations: ${insufficient.join(", ")}.`
    );
  }
}

async function request(
  url: string,
  options?: RequestInit,
  token?: string
): Promise<any> {
  const fullUrl = `${ACTIVE_API_BASE}${url}`;
  const isFormDataBody = options?.body instanceof FormData;
  const headers: HeadersInit = { ...options?.headers };
  if (!isFormDataBody && !("Content-Type" in headers) && !("content-type" in headers)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `JWT ${token}`;

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

async function resolveApiBase(): Promise<void> {
  for (const base of API_BASE_CANDIDATES) {
    const normalized = String(base || "").replace(/\/$/, "");
    try {
      const response = await fetch(`${normalized}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "healthcheck@invalid.local", password: "invalid" }),
      });

      if (response.status !== 404 && response.status < 500) {
        ACTIVE_API_BASE = normalized;
        console.log(`Guide seed API base: ${ACTIVE_API_BASE}`);
        return;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(`No healthy API base found. Checked: ${API_BASE_CANDIDATES.join(", ")}`);
}

async function ensureAdminToken(): Promise<string> {
  try {
    const login = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (!login?.token) throw new Error("Admin login failed: token missing.");
    return String(login.token);
  } catch {
    await request("/api/users/first-register", {
      method: "POST",
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: "Super Admin",
        role: "super_admin",
      }),
    });

    const login = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (!login?.token) throw new Error("Admin login failed after first-register.");
    return String(login.token);
  }
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toMediaMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function toSlugSafeName(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "") || "guide";
}

function stableHash(value: string): number {
  let hash = 0;
  for (const ch of value) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return hash;
}

async function listImageFilesRecursive(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  const walk = async (dir: string): Promise<void> => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        results.push(fullPath);
      }
    }
  };

  await walk(rootDir);
  return results;
}

async function getLocalMediaPool(): Promise<string[]> {
  if (localMediaPoolCache) return localMediaPoolCache;

  const mediaRoot = path.resolve(process.cwd(), "public/media");
  let discovered: string[] = [];

  if (await fileExists(mediaRoot)) {
    try {
      discovered = await listImageFilesRecursive(mediaRoot);
    } catch {
      discovered = [];
    }
  }

  if (discovered.length === 0) {
    for (const candidate of LOCAL_MEDIA_CANDIDATES) {
      if (await fileExists(candidate)) discovered.push(candidate);
    }
  }

  localMediaPoolCache = Array.from(new Set(discovered));
  return localMediaPoolCache;
}

async function ensureBootstrapMedia(token: string): Promise<number | null> {
  const filename = DEFAULT_GUIDE_COVER_FILENAME || "graco.logo.from-product.jpg";
  const existing = await findMediaIdByFilename(filename, token);
  if (existing) {
    fallbackMediaIdCache = existing;
    return existing;
  }

  const localFilePath = await (async () => {
    for (const candidate of LOCAL_MEDIA_CANDIDATES) {
      if (await fileExists(candidate)) return candidate;
    }
    return null;
  })();

  if (!localFilePath) {
    console.warn("[seed-guides] no local media candidate found in public/media for bootstrap upload.");
    fallbackMediaIdCache = null;
    return null;
  }

  const buffer = await readFile(localFilePath);
  const uploadFilename = path.basename(localFilePath);
  const form = new FormData();
  form.set(
    "_payload",
    JSON.stringify({
      alt: BOOTSTRAP_MEDIA_ALT,
      credit: "Local bootstrap asset",
      entityType: "common",
      entityId: "guide-seed",
    })
  );
  form.set("file", new Blob([buffer], { type: "image/jpeg" }), uploadFilename);

  const created = unwrapDoc(
    await request(
      "/api/media",
      {
        method: "POST",
        body: form,
      },
      token
    )
  );

  const createdId = Number(created?.id);
  if (!Number.isFinite(createdId)) {
    console.warn(`[seed-guides] bootstrap media upload succeeded but returned no numeric id: ${uploadFilename}`);
    fallbackMediaIdCache = null;
    return null;
  }

  console.log(`[seed-guides] uploaded bootstrap cover media: ${uploadFilename} -> id=${createdId}`);
  fallbackMediaIdCache = createdId;
  return createdId;
}

async function ensureGuideCoverMedia(seed: GuideSeed, token: string): Promise<number | null> {
  const slug = toSlugSafeName(seed.slug);
  if (guideCoverMediaIdCache.has(slug)) return guideCoverMediaIdCache.get(slug) ?? null;

  const explicitFilename = String(seed.coverFilename || "").trim();
  if (explicitFilename) {
    const explicitId = await findMediaIdByFilename(explicitFilename, token);
    if (explicitId) {
      guideCoverMediaIdCache.set(slug, explicitId);
      return explicitId;
    }
  }

  const localPool = await getLocalMediaPool();
  if (localPool.length === 0) {
    const fallbackId = await findLatestMediaId(token);
    guideCoverMediaIdCache.set(slug, fallbackId);
    return fallbackId;
  }

  const sourceFile = localPool[stableHash(slug) % localPool.length];
  const sourceExt = path.extname(sourceFile).toLowerCase() || ".jpg";
  const targetFilename = `guide-cover-${slug}${sourceExt}`;

  const existing = await findMediaIdByFilename(targetFilename, token);
  if (existing) {
    guideCoverMediaIdCache.set(slug, existing);
    return existing;
  }

  const buffer = await readFile(sourceFile);
  const form = new FormData();
  form.set(
    "_payload",
    JSON.stringify({
      alt: `Guide cover for ${slug}`,
      credit: "Local bootstrap asset",
      entityType: "common",
      entityId: slug,
    })
  );
  form.set("file", new Blob([buffer], { type: toMediaMimeType(sourceFile) }), targetFilename);

  let created: any = null;
  try {
    created = unwrapDoc(
      await request(
        "/api/media",
        {
          method: "POST",
          body: form,
        },
        token
      )
    );
  } catch {
    // Media upload failed (e.g. Vercel R2 issue); fall back to existing media.
    const fallbackId = await findLatestMediaId(token);
    guideCoverMediaIdCache.set(slug, fallbackId);
    return fallbackId;
  }

  const createdId = Number(created?.id);
  if (!Number.isFinite(createdId)) {
    const fallbackId = await findLatestMediaId(token);
    guideCoverMediaIdCache.set(slug, fallbackId);
    return fallbackId;
  }

  console.log(`[seed-guides] uploaded guide cover media: ${targetFilename} -> id=${createdId}`);
  guideCoverMediaIdCache.set(slug, createdId);
  return createdId;
}

async function findLatestMediaId(token: string): Promise<number | null> {
  if (fallbackMediaIdCache !== undefined) return fallbackMediaIdCache;

  const data = await request(`/api/media?limit=1&sort=-createdAt`, undefined, token);
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  const id = Number(doc?.id);
  if (Number.isFinite(id)) {
    fallbackMediaIdCache = id;
    return fallbackMediaIdCache;
  }

  fallbackMediaIdCache = await ensureBootstrapMedia(token);
  return fallbackMediaIdCache;
}

async function ensureGuideDraft(seed: GuideSeed, token: string): Promise<EnsureGuideDraftResult> {
  const existing = await findBySlug(seed.slug, token);
  const coverId = await ensureGuideCoverMedia(seed, token);
  const hasCover = Boolean(coverId);
  if (!hasCover) {
    console.warn(
      `[seed-guides] no media available for cover: slug=${seed.slug}. Guide will remain in draft for local preview until a cover is uploaded.`
    );
  }

  const baseBody = {
    slug: seed.slug,
    category: seed.category,
    titleZh: seed.titleZh,
    titleEn: seed.titleEn,
    summaryZh: seed.summaryZh,
    summaryEn: seed.summaryEn,
    content: toGuideContent(seed),
    publishedAt: seed.publishedAt,
  };

  if (coverId) {
    Object.assign(baseBody, { cover: coverId });
  }

  if (existing?.id) {
    await request(`/api/guides/${existing.id}`, { method: "PATCH", body: JSON.stringify(baseBody) }, token);
    return { id: String(existing.id), hasCover };
  }

  const created = unwrapDoc(await request("/api/guides", { method: "POST", body: JSON.stringify(baseBody) }, token));
  const id = String(created.id || "");
  if (!id) throw new Error(`Failed to create guide draft: ${seed.slug}`);
  return { id, hasCover };
}

async function patchEnglishLocale(id: string, seed: GuideSeed, token: string): Promise<void> {
  await request(`/api/guides/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      titleEn: seed.titleEn,
      summaryEn: seed.summaryEn,
      content: toGuideContent(seed),
    }),
  }, token);
}

async function readCurrentGuideStatus(id: string, token: string): Promise<string> {
  const doc = unwrapDoc(await request(`/api/guides/${id}`, undefined, token));
  return String(doc?.status || "draft").trim() || "draft";
}

async function patchGuideStatus(id: string, body: Record<string, unknown>, token: string): Promise<void> {
  await request(
    `/api/guides/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    token
  );
}

async function transitionGuideToPublished(id: string, publishedAt: string, token: string): Promise<void> {
  const initialStatus = await readCurrentGuideStatus(id, token);

  if (initialStatus === "published") {
    await request(
      `/api/guides/${id}`,
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

  if (initialStatus === "archived") {
    await patchGuideStatus(
      id,
      {
        status: "draft",
        transitionNote: "Seed reset from archived to draft for local guide initialization.",
      },
      token
    );
  }

  let status = await readCurrentGuideStatus(id, token);

  if (status === "draft") {
    await patchGuideStatus(id, { status: "compliance" }, token);
    status = await readCurrentGuideStatus(id, token);
  }

  if (status === "compliance") {
    await patchGuideStatus(id, { status: "chief" }, token);
    status = await readCurrentGuideStatus(id, token);
  }

  if (status === "chief") {
    await patchGuideStatus(
      id,
      {
        status: "published",
        publishedAt,
      },
      token
    );
  }
}

async function upsertGuide(seed: GuideSeed, token: string): Promise<void> {
  const { id, hasCover } = await ensureGuideDraft(seed, token);
  await patchEnglishLocale(id, seed, token);

  if (!hasCover) {
    console.log(`Upserted guide as draft for local preview (missing cover): ${seed.slug}`);
    return;
  }

  await transitionGuideToPublished(id, seed.publishedAt, token);
}

async function main() {
  assertGuideSeedCategoryCoverage(GUIDE_SEEDS);
  await resolveApiBase();
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
