/**
 * Fill review categories with editable records per type.
 *
 * Usage:
 *   API_BASE=https://your-backend.example.com npx tsx scripts/seed-reviews-categories.ts
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=*** npx tsx scripts/seed-reviews-categories.ts
 */

type AnyObject = Record<string, any>;

type ReviewTypeSeed = {
  type: "ranking" | "newbie" | "single" | "compare" | "value" | "debunk" | "cross_border";
  zhLabel: string;
  enLabel: string;
  zhTopic: string;
  enTopic: string;
};

const API_BASE_CANDIDATES = process.env.API_BASE
  ? [process.env.API_BASE]
  : ["http://localhost:3000", "http://localhost:3001"];

let ACTIVE_API_BASE = API_BASE_CANDIDATES[0];
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";
const ITEMS_PER_TYPE = 9;

const REVIEW_TYPES: ReviewTypeSeed[] = [
  { type: "ranking", zhLabel: "年度榜单", enLabel: "Annual Rankings", zhTopic: "年度综合表现", enTopic: "annual performance benchmark" },
  { type: "newbie", zhLabel: "新品首发", enLabel: "New Arrival", zhTopic: "新品首发体验", enTopic: "new arrival first look" },
  { type: "single", zhLabel: "单品实测", enLabel: "Single Review", zhTopic: "单品实测验证", enTopic: "single-model hands-on test" },
  { type: "compare", zhLabel: "多品横评", enLabel: "Comparison", zhTopic: "多品横向对比", enTopic: "multi-model side-by-side comparison" },
  { type: "value", zhLabel: "性价比", enLabel: "Best Value", zhTopic: "预算与性能平衡", enTopic: "budget-versus-performance balance" },
  { type: "debunk", zhLabel: "实测甄别", enLabel: "Hands-on Verification", zhTopic: "参数与宣传甄别", enTopic: "spec-claim verification" },
  { type: "cross_border", zhLabel: "跨境转型", enLabel: "Cross-border Transformation", zhTopic: "跨境场景适配", enTopic: "cross-border scenario adaptation" },
];

async function request(path: string, init?: RequestInit, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `JWT ${token}`;

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(`${ACTIVE_API_BASE}${path}`, { ...init, headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.errors?.[0]?.message || json?.message || `HTTP ${res.status}`;
        if (res.status >= 500 && attempt < 4) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 600));
          continue;
        }
        throw new Error(`${path} -> ${msg}`);
      }
      return json;
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 600));
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Request failed: ${path}`);
}

function unwrapDoc<T extends AnyObject>(payload: T): AnyObject {
  if (payload && typeof payload === "object" && payload.doc && typeof payload.doc === "object") {
    return payload.doc as AnyObject;
  }
  return payload;
}

async function resolveApiBase(): Promise<void> {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "healthcheck@invalid.local", password: "invalid" }),
      });
      if (res.status !== 404 && res.status < 500) {
        ACTIVE_API_BASE = base;
        console.log(`Seed API base: ${ACTIVE_API_BASE}`);
        return;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(`No healthy API base found. Checked: ${API_BASE_CANDIDATES.join(", ")}`);
}

async function ensureAdminToken(): Promise<string> {
  const login = await request("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  return login.token;
}

async function findReviewBySlug(slug: string, token: string): Promise<AnyObject | null> {
  const q = `/api/reviews?limit=1&where[slug][equals]=${encodeURIComponent(slug)}`;
  const data = await request(q, undefined, token);
  return data?.docs?.[0] || null;
}

async function fetchProductIDs(token: string): Promise<string[]> {
  const publishedQueries = [
    "/api/products?limit=200&where[status][equals]=published",
    "/api/products?limit=200&where[_status][equals]=published",
  ];

  for (const query of publishedQueries) {
    try {
      const published = await request(query, undefined, token);
      const publishedIDs = (published?.docs || [])
        .map((doc: AnyObject) => String(doc?.id || "").trim())
        .filter(Boolean);
      if (publishedIDs.length > 0) return publishedIDs;
    } catch {
      // Try the next supported query style.
    }
  }

  const fallback = await request("/api/products?limit=50", undefined, token);
  const fallbackIDs = (fallback?.docs || [])
    .map((doc: AnyObject) => String(doc?.id || "").trim())
    .filter(Boolean);

  if (fallbackIDs.length === 0) {
    throw new Error("No products found. Please create at least one product before seeding reviews.");
  }

  return fallbackIDs;
}

function buildLexicalBody(paragraphs: string[]): AnyObject {
  return {
    root: {
      type: "root",
      direction: null,
      format: "",
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text,
            version: 1,
          },
        ],
      })),
    },
  };
}

function toRelationshipID(id: string): string | number {
  const raw = String(id || "").trim();
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw;
}

async function fetchReviewCategoryIdByType(token: string): Promise<Map<string, string | number>> {
  const map = new Map<string, string | number>();
  try {
    const payload = await request("/api/review-categories?limit=200&depth=0&locale=zh", undefined, token);
    const docs = Array.isArray(payload?.docs) ? payload.docs : [];
    docs.forEach((doc: AnyObject) => {
      const key = String(doc?.key || "").trim();
      const id = String(doc?.id || "").trim();
      if (key && id) map.set(key, toRelationshipID(id));
    });
  } catch {
    // Keep backward compatibility when review-categories is not enabled yet.
  }
  return map;
}

function zhPayload(seed: ReviewTypeSeed, index: number, productID: string, categoryId?: string | number): AnyObject {
  const title = `${seed.zhLabel} ${index}：童车评测建站填充样例`;
  const summary = `第 ${index} 条 ${seed.zhLabel} 内容，聚焦${seed.zhTopic}，用于前台展示与后台持续编辑。`;
  const body = buildLexicalBody([
    `这是 ${seed.zhLabel} 分类第 ${index} 条建站样例，围绕${seed.zhTopic}完成结构化实测记录。`,
    "内容已按照中文 locale 写入，可在后台 Reviews 集合中直接编辑标题、摘要、正文与评分。",
  ]);

  return {
    title,
    summary,
    body,
    type: seed.type,
    ...(categoryId ? { category: categoryId } : {}),
    products: [toRelationshipID(productID)],
    scores: {
      safety: 8.0 + (index % 3) * 0.3,
      comfort: 7.8 + (index % 4) * 0.2,
      portability: 7.6 + (index % 5) * 0.2,
      function: 7.9 + (index % 3) * 0.25,
      value: 8.1 + (index % 2) * 0.35,
    },
  };
}

function enPayload(seed: ReviewTypeSeed, index: number, productID: string, categoryId?: string | number): AnyObject {
  const title = `${seed.enLabel} ${index}: Site bootstrap review sample`;
  const summary = `Sample #${index} for ${seed.enLabel}, focused on ${seed.enTopic}, ready for frontend display and admin editing.`;
  const body = buildLexicalBody([
    `This is sample #${index} in the ${seed.enLabel} category, created for ${seed.enTopic} with structured hands-on content.`,
    "The entry is saved under the English locale and remains fully editable in the Reviews collection.",
  ]);

  return {
    title,
    summary,
    body,
    type: seed.type,
    ...(categoryId ? { category: categoryId } : {}),
    products: [toRelationshipID(productID)],
  };
}

async function upsertReview(
  seed: ReviewTypeSeed,
  index: number,
  productID: string,
  token: string,
  categoryIdByType: Map<string, string | number>
): Promise<string> {
  const slug = `review-${seed.type}-site-fill-${index}`;
  const existing = await findReviewBySlug(slug, token);
  const categoryId = categoryIdByType.get(seed.type);

  if (!existing) {
    const created = unwrapDoc(
      await request(
        "/api/reviews?locale=zh",
        {
          method: "POST",
          body: JSON.stringify({
            slug,
            status: "draft",
            _status: "draft",
            publishedAt: new Date().toISOString(),
            ...zhPayload(seed, index, productID, categoryId),
          }),
        },
        token,
      ),
    );

    await request(
      `/api/reviews/${created.id}?locale=en`,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...enPayload(seed, index, productID, categoryId),
        }),
      },
      token,
    );

    await request(
      `/api/reviews/${created.id}?locale=zh`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "published",
          _status: "published",
          publishedAt: new Date().toISOString(),
        }),
      },
      token,
    );

    return String(created.id);
  }

  await request(
    `/api/reviews/${existing.id}?locale=zh`,
    {
      method: "PATCH",
      body: JSON.stringify({
        slug,
        ...zhPayload(seed, index, productID, categoryId),
      }),
    },
    token,
  );

  await request(
    `/api/reviews/${existing.id}?locale=en`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...enPayload(seed, index, productID, categoryId),
      }),
    },
    token,
  );

  await request(
    `/api/reviews/${existing.id}?locale=zh`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "published",
        _status: "published",
        publishedAt: existing.publishedAt || new Date().toISOString(),
      }),
    },
    token,
  );

  return String(existing.id);
}

async function main(): Promise<void> {
  await resolveApiBase();
  const token = await ensureAdminToken();
  const productIDs = await fetchProductIDs(token);
  const categoryIdByType = await fetchReviewCategoryIdByType(token);

  let createdOrUpdated = 0;
  for (let t = 0; t < REVIEW_TYPES.length; t += 1) {
    const seed = REVIEW_TYPES[t];
    for (let i = 1; i <= ITEMS_PER_TYPE; i += 1) {
      const productID = productIDs[(t * ITEMS_PER_TYPE + (i - 1)) % productIDs.length];
      const id = await upsertReview(seed, i, productID, token, categoryIdByType);
      createdOrUpdated += 1;
      console.log(`[seed-reviews-categories] upserted: type=${seed.type} index=${i} id=${id}`);
    }
  }

  console.log(`[seed-reviews-categories] done, total upserted=${createdOrUpdated}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
