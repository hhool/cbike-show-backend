/**
 * Seed script for system news categories.
 *
 * Usage:
 *   API_BASE=http://localhost:3000 npx tsx scripts/seed-news-categories.ts
 */

const API_BASE = (process.env.API_BASE || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";

type CategorySeed = {
  key: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  sortOrder: number;
  styleVariant: "normal" | "warn";
};

const SYSTEM_CATEGORIES: CategorySeed[] = [
  {
    key: "industry",
    nameZh: "行业动态",
    nameEn: "Industry Update",
    descriptionZh: "全球童车市场动态与行业数据。",
    descriptionEn: "Global stroller market updates and industry signals.",
    sortOrder: 10,
    styleVariant: "normal"
  },
  {
    key: "new",
    nameZh: "新品发布",
    nameEn: "New Product",
    descriptionZh: "新品发布、上市节奏与首发观察。",
    descriptionEn: "New launches, release timelines, and first-look notes.",
    sortOrder: 20,
    styleVariant: "normal"
  },
  {
    key: "compliance",
    nameZh: "合规政策",
    nameEn: "Compliance Policy",
    descriptionZh: "法规更新、认证标准与送检要求。",
    descriptionEn: "Regulation updates, certification standards, and test requirements.",
    sortOrder: 30,
    styleVariant: "normal"
  },
  {
    key: "warn",
    nameZh: "安全预警",
    nameEn: "Safety Alert",
    descriptionZh: "召回信息与风险预警。",
    descriptionEn: "Recall notices and risk alerts.",
    sortOrder: 40,
    styleVariant: "warn"
  },
  {
    key: "brand",
    nameZh: "品牌动态",
    nameEn: "Brand Update",
    descriptionZh: "品牌战略、供应链与可持续动态。",
    descriptionEn: "Brand strategy, supply-chain, and sustainability updates.",
    sortOrder: 50,
    styleVariant: "normal"
  },
  {
    key: "explain",
    nameZh: "科普干货",
    nameEn: "Expert Explainer",
    descriptionZh: "标准解读、选购方法与技术科普。",
    descriptionEn: "Standards explainers, buying methods, and technical insights.",
    sortOrder: 60,
    styleVariant: "normal"
  }
];

async function request(path: string, init?: RequestInit, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `JWT ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || json?.message || `HTTP ${res.status}`;
    throw new Error(`${path} -> ${msg}`);
  }
  return json;
}

function unwrapDoc<T extends Record<string, unknown>>(payload: T): Record<string, unknown> {
  if (payload && typeof payload === "object" && payload.doc && typeof payload.doc === "object") {
    return payload.doc as Record<string, unknown>;
  }
  return payload;
}

async function ensureAdminToken(): Promise<string> {
  const login = await request("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!login?.token) {
    throw new Error("Admin login failed: token missing.");
  }
  return String(login.token);
}

async function findCategoryByKey(key: string, token: string): Promise<any | null> {
  const query = `/api/news-categories?limit=1&where[key][equals]=${encodeURIComponent(key)}`;
  const data = await request(query, undefined, token);
  return Array.isArray(data?.docs) ? data.docs[0] || null : null;
}

async function upsertCategory(seed: CategorySeed, token: string): Promise<void> {
  const existing = await findCategoryByKey(seed.key, token);
  const body = {
    key: seed.key,
    name: seed.nameZh,
    description: seed.descriptionZh,
    isSystem: true,
    isVisibleInTabs: true,
    sortOrder: seed.sortOrder,
    styleVariant: seed.styleVariant,
  };

  const id = existing?.id;
  if (id) {
    await request(`/api/news-categories/${id}?locale=zh`, { method: "PATCH", body: JSON.stringify(body) }, token);
    await request(
      `/api/news-categories/${id}?locale=en`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name: seed.nameEn,
          description: seed.descriptionEn,
          isVisibleInTabs: true,
          sortOrder: seed.sortOrder,
          styleVariant: seed.styleVariant,
        }),
      },
      token
    );
    return;
  }

  const created = unwrapDoc(await request("/api/news-categories?locale=zh", { method: "POST", body: JSON.stringify(body) }, token));
  const createdId = String(created.id || "");
  if (!createdId) throw new Error(`Failed to create category: ${seed.key}`);

  await request(
    `/api/news-categories/${createdId}?locale=en`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: seed.nameEn,
        description: seed.descriptionEn,
        isVisibleInTabs: true,
        sortOrder: seed.sortOrder,
        styleVariant: seed.styleVariant,
      }),
    },
    token
  );
}

async function main() {
  const token = await ensureAdminToken();

  for (const seed of SYSTEM_CATEGORIES) {
    await upsertCategory(seed, token);
    console.log(`Upserted news category: ${seed.key}`);
  }

  console.log("System news categories are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
