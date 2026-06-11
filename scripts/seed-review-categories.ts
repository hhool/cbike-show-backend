/**
 * Seed script for review categories and review-category binding.
 *
 * Usage:
 *   API_BASE=http://localhost:3000 npx tsx scripts/seed-review-categories.ts
 */

type CategorySeed = {
  key: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  sortOrder: number;
  isSystem: boolean;
  isVisibleInTabs: boolean;
};

const API_BASE_CANDIDATES = process.env.API_BASE
  ? [process.env.API_BASE]
  : ["http://localhost:3000", "http://localhost:3001"];
let ACTIVE_API_BASE = API_BASE_CANDIDATES[0].replace(/\/$/, "");
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    key: "single",
    nameZh: "单品实测",
    nameEn: "Single Review",
    descriptionZh: "针对单一产品的深度实测。",
    descriptionEn: "In-depth test for a single product.",
    sortOrder: 10,
    isSystem: true,
    isVisibleInTabs: true,
  },
  {
    key: "compare",
    nameZh: "多品横评",
    nameEn: "Comparison",
    descriptionZh: "同价位或同场景多产品对比评测。",
    descriptionEn: "Comparison across multiple products in same budget or scenario.",
    sortOrder: 20,
    isSystem: true,
    isVisibleInTabs: true,
  },
  {
    key: "newbie",
    nameZh: "新品首发",
    nameEn: "New Arrival",
    descriptionZh: "新品上手与首发评测。",
    descriptionEn: "First-look and launch review for new arrivals.",
    sortOrder: 30,
    isSystem: true,
    isVisibleInTabs: true,
  },
  {
    key: "cross_border",
    nameZh: "跨境专项",
    nameEn: "Cross Border",
    descriptionZh: "面向跨境市场的合规与使用评测。",
    descriptionEn: "Compliance and usage reviews for cross-border markets.",
    sortOrder: 40,
    isSystem: true,
    isVisibleInTabs: true,
  },
  {
    key: "value",
    nameZh: "性价比",
    nameEn: "Best Value",
    descriptionZh: "聚焦预算效率与综合表现。",
    descriptionEn: "Focused on budget efficiency and overall value.",
    sortOrder: 50,
    isSystem: true,
    isVisibleInTabs: true,
  },
  {
    key: "debunk",
    nameZh: "实测甄别",
    nameEn: "Hands-on Verification",
    descriptionZh: "对热门卖点进行实测验证。",
    descriptionEn: "Hands-on verification for popular product claims.",
    sortOrder: 60,
    isSystem: true,
    isVisibleInTabs: true,
  },
  {
    key: "ranking",
    nameZh: "年度榜单",
    nameEn: "Annual Rankings",
    descriptionZh: "基于阶段性数据的榜单评测。",
    descriptionEn: "Ranking-style reviews based on periodical data.",
    sortOrder: 70,
    isSystem: true,
    isVisibleInTabs: true,
  },
];

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: string;
};

function normalizeBase(value: string): string {
  return value.replace(/\/$/, "");
}

async function request(path: string, options: RequestOptions = {}, token?: string): Promise<any> {
  const url = `${ACTIVE_API_BASE}${path}`;
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: options.body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.errors?.[0]?.message || data?.message || `${response.status} ${response.statusText}`;
    throw new Error(`[${response.status}] ${message}`);
  }

  return data;
}

async function ensureActiveApi(): Promise<void> {
  for (const candidate of API_BASE_CANDIDATES.map(normalizeBase)) {
    try {
      const probe = await fetch(`${candidate}/api/health`);
      if (probe.ok) {
        ACTIVE_API_BASE = candidate;
        return;
      }
    } catch {
      // try next candidate
    }
  }
  ACTIVE_API_BASE = normalizeBase(API_BASE_CANDIDATES[0]);
}

async function ensureAdminToken(): Promise<string> {
  try {
    const login = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (!login?.token) throw new Error("token missing");
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

function unwrapDoc(data: any): any {
  if (data?.doc) return data.doc;
  if (Array.isArray(data?.docs)) return data.docs[0] || null;
  return data;
}

async function findCategoryByKey(key: string, token: string): Promise<any | null> {
  const payload = await request(`/api/review-categories?limit=1&where[key][equals]=${encodeURIComponent(key)}&locale=zh`, {}, token);
  return unwrapDoc(payload);
}

async function upsertCategory(seed: CategorySeed, token: string): Promise<number> {
  const existing = await findCategoryByKey(seed.key, token);
  const body = {
    key: seed.key,
    name: seed.nameZh,
    description: seed.descriptionZh,
    sortOrder: seed.sortOrder,
    isSystem: seed.isSystem,
    isVisibleInTabs: seed.isVisibleInTabs,
  };

  let id: number;
  if (existing?.id) {
    await request(`/api/review-categories/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(body) }, token);
    id = Number(existing.id);
  } else {
    const created = unwrapDoc(
      await request("/api/review-categories?locale=zh", { method: "POST", body: JSON.stringify(body) }, token)
    );
    id = Number(created?.id);
  }

  await request(`/api/review-categories/${id}?locale=en`, {
    method: "PATCH",
    body: JSON.stringify({
      name: seed.nameEn,
      description: seed.descriptionEn,
      sortOrder: seed.sortOrder,
      isVisibleInTabs: seed.isVisibleInTabs,
    }),
  }, token);

  return id;
}

async function fetchAllReviews(token: string): Promise<any[]> {
  const docs: any[] = [];
  let page = 1;

  while (true) {
    const payload = await request(`/api/reviews?locale=zh&limit=100&page=${page}&depth=0`, {}, token);
    const list = Array.isArray(payload?.docs) ? payload.docs : [];
    docs.push(...list);
    if (!payload?.hasNextPage) break;
    page += 1;
  }

  return docs;
}

function hasCategory(value: any): boolean {
  if (!value) return false;
  if (typeof value === "number") return true;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") return Boolean((value as any).id);
  return false;
}

async function bindReviewsByType(token: string, categoryIdByKey: Map<string, number>): Promise<number> {
  const reviews = await fetchAllReviews(token);
  let patched = 0;

  for (const review of reviews) {
    if (hasCategory(review?.category)) continue;
    const key = String(review?.type || "").trim();
    const categoryId = categoryIdByKey.get(key);
    if (!categoryId || !review?.id) continue;

    await request(`/api/reviews/${review.id}?locale=zh`, {
      method: "PATCH",
      body: JSON.stringify({ category: categoryId }),
    }, token);
    patched += 1;
  }

  return patched;
}

async function main() {
  await ensureActiveApi();
  console.log(`Review category seed API base: ${ACTIVE_API_BASE}`);

  const token = await ensureAdminToken();
  const categoryIdByKey = new Map<string, number>();

  for (const seed of CATEGORY_SEEDS) {
    const id = await upsertCategory(seed, token);
    categoryIdByKey.set(seed.key, id);
    console.log(`Upserted review category: ${seed.key} -> ${id}`);
  }

  const patched = await bindReviewsByType(token, categoryIdByKey);
  console.log(`Patched review-category relation for ${patched} review docs.`);
  console.log("Review categories are ready.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
