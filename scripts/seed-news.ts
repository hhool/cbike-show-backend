/**
 * Seed script for sample news articles.
 *
 * Usage:
 *   API_BASE=http://localhost:3000 npm run seed:news-categories
 *   API_BASE=http://localhost:3000 npx tsx scripts/seed-news.ts
 */

const API_BASE = (process.env.API_BASE || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";

type NewsSeed = {
  slug: string;
  categoryKey: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  bodyZh: string[];
  bodyEn: string[];
  sourceName: string;
  sourceUrl: string;
  regions: string[];
  isPinned?: boolean;
  pinWeight?: number;
  isAlert?: boolean;
  alertLevel?: "notice" | "warning" | "critical";
  publishedAt: string;
};

const NEWS_SEEDS: NewsSeed[] = [
  {
    slug: "cpsc-scooter-steering-risk-2026-06",
    categoryKey: "warn",
    titleZh: "CPSC 通报儿童滑板车把立件脱落风险",
    titleEn: "CPSC Flags Steering-Column Detachment Risk in a Kids Scooter Line",
    summaryZh: "北美市场一条儿童滑板车产品线因把立件连接隐患进入风险通报，建议用户立即核查批次信息。",
    summaryEn: "A children’s scooter line in North America has entered a risk bulletin due to steering-column connection concerns, and users are advised to verify affected batches immediately.",
    bodyZh: [
      "美国消费品安全委员会近日发布风险通报，指出某儿童滑板车产品线存在把立连接部位松脱隐患。",
      "通报涉及 2024 至 2025 年间流通的多个销售批次，风险主要集中在高频折叠与路面冲击后的结构稳定性。",
      "建议跨境卖家与采购团队同步核查供应链批次、召回说明和售后指引，并在详情页显著提示用户停止使用风险批次产品。"
    ],
    bodyEn: [
      "The US Consumer Product Safety Commission has issued a risk bulletin for a kids scooter line over a potential steering-column connection failure.",
      "The bulletin covers multiple retail batches sold between 2024 and 2025, with the main concern focused on structural stability after frequent folding and repeated road impact.",
      "Cross-border sellers and sourcing teams should verify batch ranges, recall notices, and after-sales instructions, while highlighting stop-use guidance for affected units on product pages."
    ],
    sourceName: "CPSC",
    sourceUrl: "https://www.cpsc.gov/",
    regions: ["north_america"],
    isPinned: true,
    pinWeight: 90,
    isAlert: true,
    alertLevel: "critical",
    publishedAt: "2026-06-10T08:00:00.000Z"
  },
  {
    slug: "en1888-2026-draft-highlights",
    categoryKey: "compliance",
    titleZh: "EN1888-1:2026 修订草案要点速览",
    titleEn: "Key Highlights from the EN1888-1:2026 Draft Revision",
    summaryZh: "本轮草案重点调整车架疲劳测试、安全带固定点和警示标识要求，直接影响欧盟市场的送检与改型节奏。",
    summaryEn: "This draft revision focuses on frame fatigue testing, harness anchoring, and warning-label requirements, directly affecting EU compliance timelines and redesign work.",
    bodyZh: [
      "欧盟相关标准草案在本轮更新中，提高了车架疲劳测试循环数，并对关键连接部位提出更严格的验证要求。",
      "对于出口欧盟的推车与童车品牌，这意味着原有结构件和材料配置可能需要重新评估，并补充验证样机。",
      "建议品牌在 Q3 前完成技术评估与样机复测，避免影响旺季发货和认证计划。"
    ],
    bodyEn: [
      "The latest EU draft revision increases frame fatigue test cycles and introduces stricter validation requirements for key connection points.",
      "For stroller and juvenile-product brands exporting to the EU, this likely means re-evaluating existing structural parts and material choices while preparing new validation samples.",
      "Brands should complete technical review and prototype retesting before Q3 to avoid disrupting peak-season shipments and certification schedules."
    ],
    sourceName: "CEN Draft",
    sourceUrl: "https://www.cencenelec.eu/",
    regions: ["europe"],
    isPinned: true,
    pinWeight: 70,
    publishedAt: "2026-06-09T07:00:00.000Z"
  },
  {
    slug: "sea-export-growth-2026-q1",
    categoryKey: "industry",
    titleZh: "2026 Q1 全球童车出口：东南亚增速领跑",
    titleEn: "2026 Q1 Global Juvenile-Product Exports: Southeast Asia Leads Growth",
    summaryZh: "越南、印尼与泰国成为增长最快的婴童出行品类市场，跨境渠道对轻便与高性价比产品需求持续上升。",
    summaryEn: "Vietnam, Indonesia, and Thailand have become the fastest-growing markets for juvenile mobility products, with cross-border channels seeing stronger demand for lightweight, value-oriented models.",
    bodyZh: [
      "从出口结构看，轻便折叠推车和入门平衡车是本季度增速最明显的两类产品。",
      "中东与东南亚的线上渠道对产品图片、认证说明和物流时效的要求也在同步提高。",
      "对于中国供应链而言，更稳定的区域化产品配置将成为后续增长的关键。"
    ],
    bodyEn: [
      "From an export-structure perspective, compact folding strollers and entry-level balance bikes were the two fastest-growing product segments this quarter.",
      "Online channels in the Middle East and Southeast Asia are also demanding stronger image quality, clearer certification notes, and more reliable shipping timelines.",
      "For China-based supply chains, more stable region-specific product configuration will be a key driver of future growth."
    ],
    sourceName: "Internal Editorial Desk",
    sourceUrl: "https://example.com/editorial/sea-export-growth",
    regions: ["apac", "middle_east"],
    publishedAt: "2026-06-08T06:00:00.000Z"
  },
  {
    slug: "stroller-suspension-architectures-explained",
    categoryKey: "explain",
    titleZh: "推车减震系统的三种主流方案对比",
    titleEn: "Three Mainstream Stroller Suspension Architectures Compared",
    summaryZh: "弹簧、气压与橡胶缓冲方案在成本、舒适性与维护门槛上差异明显，适合不同出行场景。",
    summaryEn: "Spring, pneumatic, and elastomer damping systems differ significantly in cost, comfort, and maintenance needs, making each better suited to specific travel scenarios.",
    bodyZh: [
      "弹簧减震方案结构直观、维护简单，适合大多数城市通勤型产品。",
      "气压减震在高频颠簸路面下更有优势，但也带来更高的维护复杂度和成本。",
      "橡胶缓冲方案常用于轻便型产品，兼顾体积控制和基础减震表现。"
    ],
    bodyEn: [
      "Spring suspension is straightforward and easy to maintain, making it suitable for most urban commuting products.",
      "Pneumatic suspension performs better on repeated rough terrain, but it also adds more maintenance complexity and cost.",
      "Elastomer damping is commonly used in compact models, balancing packaging efficiency with basic shock absorption."
    ],
    sourceName: "Editorial Research",
    sourceUrl: "https://example.com/editorial/suspension-explainer",
    regions: ["global"],
    publishedAt: "2026-06-07T05:00:00.000Z"
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

function lexicalParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      version: 1,
      format: "",
      indent: 0,
      direction: null,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        version: 1,
        format: "",
        indent: 0,
        direction: null,
        textFormat: 0,
        textStyle: "",
        children: [
          {
            type: "text",
            version: 1,
            text,
            detail: 0,
            format: 0,
            mode: "normal",
            style: ""
          }
        ]
      }))
    }
  };
}

async function ensureAdminToken(): Promise<string> {
  const login = await request("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!login?.token) throw new Error("Admin login failed: token missing.");
  return String(login.token);
}

async function findBySlug(collection: string, slug: string, token: string): Promise<any | null> {
  const query = `/api/${collection}?limit=1&where[slug][equals]=${encodeURIComponent(slug)}`;
  const data = await request(query, undefined, token);
  return Array.isArray(data?.docs) ? data.docs[0] || null : null;
}

async function findCategoryIdByKey(key: string, token: string): Promise<number> {
  const query = `/api/news-categories?limit=1&where[key][equals]=${encodeURIComponent(key)}`;
  const data = await request(query, undefined, token);
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  const id = Number(doc?.id);
  if (!Number.isFinite(id)) throw new Error(`News category not found: ${key}. Run seed:news-categories first.`);
  return id;
}

async function ensureNewsDraft(seed: NewsSeed, categoryId: number, token: string): Promise<string> {
  const existing = await findBySlug("news", seed.slug, token);
  const baseBody = {
    slug: seed.slug,
    category: categoryId,
    title: seed.titleZh,
    summary: seed.summaryZh,
    body: lexicalParagraphs(seed.bodyZh),
    sourceName: seed.sourceName,
    sourceUrl: seed.sourceUrl,
    regions: seed.regions,
    isPinned: Boolean(seed.isPinned),
    pinWeight: Number(seed.pinWeight || 0),
    isAlert: Boolean(seed.isAlert),
    alertLevel: seed.alertLevel || "notice",
    publishedAt: seed.publishedAt,
  };

  if (existing?.id) {
    await request(`/api/news/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(baseBody) }, token);
    return String(existing.id);
  }

  const created = unwrapDoc(await request("/api/news?locale=zh", { method: "POST", body: JSON.stringify(baseBody) }, token));
  const id = String(created.id || "");
  if (!id) throw new Error(`Failed to create news draft: ${seed.slug}`);
  return id;
}

async function patchEnglishLocale(id: string, seed: NewsSeed, token: string): Promise<void> {
  await request(
    `/api/news/${id}?locale=en`,
    {
      method: "PATCH",
      body: JSON.stringify({
        title: seed.titleEn,
        summary: seed.summaryEn,
        body: lexicalParagraphs(seed.bodyEn),
      }),
    },
    token
  );
}

async function transitionNewsToPublished(id: string, publishedAt: string, token: string): Promise<void> {
  await request(`/api/news/${id}?locale=zh`, { method: "PATCH", body: JSON.stringify({ status: "compliance", transitionNote: "Seed transition to compliance" }) }, token);
  await request(`/api/news/${id}?locale=zh`, { method: "PATCH", body: JSON.stringify({ status: "chief", transitionNote: "Seed transition to chief" }) }, token);
  await request(
    `/api/news/${id}?locale=zh`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "published",
        transitionNote: "Seed publish transition",
        publishedAt,
      }),
    },
    token
  );
}

async function upsertNews(seed: NewsSeed, token: string): Promise<void> {
  const categoryId = await findCategoryIdByKey(seed.categoryKey, token);
  const id = await ensureNewsDraft(seed, categoryId, token);
  await patchEnglishLocale(id, seed, token);
  await transitionNewsToPublished(id, seed.publishedAt, token);
}

async function main() {
  const token = await ensureAdminToken();

  for (const seed of NEWS_SEEDS) {
    await upsertNews(seed, token);
    console.log(`Upserted news article: ${seed.slug}`);
  }

  console.log("Sample news articles are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
