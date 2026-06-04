/**
 * REST seed script: create baseline data and verify review weighted score logic.
 * Run:
 *   export PATH=/tmp/node-v22.18.0-darwin-x64/bin:$PATH
 *   API_BASE=http://localhost:3000 npx tsx scripts/seed.ts
 */

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";

type AnyObject = Record<string, any>;

type BrandSeed = {
  name: string;
  slug: string;
  region: "north_america" | "europe" | "middle_east" | "apac" | "latam";
  country: string;
  marketFocus: string[];
  priorityScore: number;
  introZh: string;
  introEn: string;
};

const TOP_BRANDS: BrandSeed[] = [
  { name: "UPPAbaby", slug: "uppababy-us", region: "north_america", country: "US", marketFocus: ["stroller"], priorityScore: 95, introZh: "美国高端婴儿推车品牌，代表型号 Vista 与 Cruz。", introEn: "US premium stroller brand best known for Vista and Cruz." },
  { name: "Mockingbird", slug: "mockingbird-us", region: "north_america", country: "US", marketFocus: ["stroller"], priorityScore: 88, introZh: "美国高性价比城市推车品牌，强调模块化扩展。", introEn: "US value-focused urban stroller brand with modular expansion." },
  { name: "Thule", slug: "thule-ca", region: "north_america", country: "CA", marketFocus: ["stroller", "bicycle"], priorityScore: 86, introZh: "加拿大市场认可度高，主打户外跑步与多地形推车。", introEn: "Strong in Canada with outdoor jogger and all-terrain strollers." },
  { name: "Maxi-Cosi", slug: "maxi-cosi-ca", region: "north_america", country: "CA", marketFocus: ["stroller"], priorityScore: 84, introZh: "加拿大主流母婴渠道常见品牌，强调旅行系统组合。", introEn: "Mainstream in Canadian retail, known for travel-system combinations." },
  { name: "Nuna", slug: "nuna-na", region: "north_america", country: "US", marketFocus: ["stroller"], priorityScore: 90, introZh: "在北美高端细分市场表现稳定，覆盖高景观与轻便线。", introEn: "Stable in North American premium segment across full-size and compact lines." },

  { name: "Cybex", slug: "cybex-de", region: "europe", country: "DE", marketFocus: ["stroller"], priorityScore: 94, introZh: "德国品牌，兼顾设计感与安全标准，欧洲覆盖广。", introEn: "German brand balancing design and safety with broad EU coverage." },
  { name: "Hartan", slug: "hartan-de", region: "europe", country: "DE", marketFocus: ["stroller"], priorityScore: 82, introZh: "德国本土传统品牌，重视做工与耐用性。", introEn: "Traditional German brand known for build quality and durability." },
  { name: "Bebe Confort", slug: "bebe-confort-fr", region: "europe", country: "FR", marketFocus: ["stroller"], priorityScore: 80, introZh: "法国家庭市场常见品牌，定位实用型出行方案。", introEn: "Common in French family segment with practical mobility positioning." },
  { name: "Stokke", slug: "stokke-fr", region: "europe", country: "FR", marketFocus: ["stroller"], priorityScore: 87, introZh: "北欧设计风格在法国高端用户中认可度较高。", introEn: "Nordic design style with strong adoption among premium French users." },
  { name: "Inglesina", slug: "inglesina-it", region: "europe", country: "IT", marketFocus: ["stroller"], priorityScore: 85, introZh: "意大利经典品牌，偏高端审美与日常通勤兼顾。", introEn: "Italian classic brand blending premium aesthetics and daily commute usability." },

  { name: "Bugaboo", slug: "bugaboo-ae", region: "middle_east", country: "AE", marketFocus: ["stroller"], priorityScore: 90, introZh: "在迪拜高端母婴门店覆盖度高，强调高温环境下的舒适性。", introEn: "Strong premium-store presence in Dubai with warm-climate comfort focus." },
  { name: "Silver Cross", slug: "silver-cross-ae", region: "middle_east", country: "AE", marketFocus: ["stroller"], priorityScore: 84, introZh: "英国高端品牌在中东礼赠与高端家庭场景表现稳定。", introEn: "UK premium brand with stable demand in gifting and high-end family scenarios." },
  { name: "Joie", slug: "joie-sa", region: "middle_east", country: "SA", marketFocus: ["stroller"], priorityScore: 83, introZh: "沙特中端市场渗透率高，渠道广、型号丰富。", introEn: "High penetration in Saudi mid-market with broad channel reach." },
  { name: "Chicco", slug: "chicco-sa", region: "middle_east", country: "SA", marketFocus: ["stroller"], priorityScore: 82, introZh: "意大利品牌在海湾市场有稳定零售基础。", introEn: "Italian brand with steady retail foundation across Gulf markets." },
  { name: "Peg Perego", slug: "peg-perego-qa", region: "middle_east", country: "QA", marketFocus: ["stroller"], priorityScore: 80, introZh: "卡塔尔高端母婴店可见度高，强调做工与舒适。", introEn: "Visible in Qatar premium stores with craftsmanship and comfort focus." },
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

function unwrapDoc<T extends AnyObject>(payload: T): AnyObject {
  if (payload && typeof payload === "object" && payload.doc && typeof payload.doc === "object") {
    return payload.doc as AnyObject;
  }
  return payload;
}

async function ensureAdminToken(): Promise<string> {
  try {
    const login = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    console.log("Using existing admin account login.");
    return login.token;
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
    console.log("Created first super admin account.");
    const login = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    return login.token;
  }
}

async function findBySlug(collection: string, slug: string, token: string): Promise<any | null> {
  const q = `/api/${collection}?limit=1&where[slug][equals]=${encodeURIComponent(slug)}`;
  const data = await request(q, undefined, token);
  return data?.docs?.[0] || null;
}

async function upsertBrand(seed: BrandSeed, token: string): Promise<any> {
  const existing = await findBySlug("brands", seed.slug, token);
  const body = {
    name: seed.name,
    slug: seed.slug,
    region: seed.region,
    country: seed.country,
    marketFocus: seed.marketFocus,
    priorityScore: seed.priorityScore,
    intro: seed.introZh,
  };

  let doc: AnyObject;
  if (existing) {
    doc = unwrapDoc(
      await request(`/api/brands/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(body) }, token),
    );
  } else {
    doc = unwrapDoc(await request("/api/brands?locale=zh", { method: "POST", body: JSON.stringify(body) }, token));
  }

  return doc;
}

async function upsertHomePage(token: string): Promise<void> {
  const existing = await findBySlug("site-pages", "home", token);
  const body = {
    slug: "home",
    title: "童车评测实验室",
    heroTitle: "全球童车品牌与评测数据库",
    heroSubtitle: "支持中英文内容管理，面向国家与区域做品牌对比与选购决策。",
    ctaLabel: "查看产品库",
    ctaHref: "/products",
    sections: [
      {
        heading: "内容编辑",
        body: "后台可维护首页、栏目文案与双语词条。",
      },
      {
        heading: "品牌拓展",
        body: "品牌库已扩展区域字段，可按国家/区域维护 Top5。",
      },
    ],
    _status: "published",
  };

  let pageId: string;
  if (existing) {
    await request(`/api/site-pages/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(body) }, token);
    pageId = String(existing.id);
  } else {
    const created = unwrapDoc(await request("/api/site-pages?locale=zh", { method: "POST", body: JSON.stringify(body) }, token));
    pageId = String(created.id);
  }

}

async function upsertListingPage(token: string, slug: "products" | "reviews" | "brands"): Promise<void> {
  const existing = await findBySlug("site-pages", slug, token);
  const zhTitle = slug === "products" ? "产品数据库" : slug === "reviews" ? "评测数据库" : "品牌 Top5 数据库";
  const zhSubtitle =
    slug === "products"
      ? "按品牌、国家与区域持续维护可发布产品条目。"
      : slug === "reviews"
        ? "聚合单品实测与横评内容，支持中英文发布。"
        : "按区域与国家分组输出海外品牌 Top5。";
  const enTitle = slug === "products" ? "Product Database" : slug === "reviews" ? "Review Database" : "Brand Top5 Database";
  const enSubtitle =
    slug === "products"
      ? "Maintain publishable product records by brand, country, and region."
      : slug === "reviews"
        ? "Aggregate single and comparison reviews with bilingual publishing."
        : "Show Top5 overseas brands grouped by region and country.";

  const body = {
    slug,
    title: zhTitle,
    heroTitle: zhTitle,
    heroSubtitle: zhSubtitle,
    ctaLabel: slug === "brands" ? "查看品牌页" : "返回首页",
    ctaHref: slug === "brands" ? "/brands" : "/",
    sections: [
      { heading: "内容来源", body: "页面列表直接读取已发布 CMS 数据。" },
      { heading: "编辑入口", body: "可在后台站点页面中维护页头文案。" },
    ],
    _status: "published",
  };

  let pageId: string;
  if (existing) {
    await request(`/api/site-pages/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(body) }, token);
    pageId = String(existing.id);
  } else {
    const created = unwrapDoc(await request("/api/site-pages?locale=zh", { method: "POST", body: JSON.stringify(body) }, token));
    pageId = String(created.id);
  }

}

type LocaleSeed = {
  namespace: "home" | "products" | "reviews" | "brands" | "common";
  key: string;
  valueZh: string;
  valueEn: string;
  description: string;
};

async function upsertLocaleEntry(token: string, entry: LocaleSeed): Promise<void> {
  const query = `/api/locale-entries?limit=1&where[key][equals]=${encodeURIComponent(entry.key)}`;
  const existing = await request(query, undefined, token);
  const doc = existing?.docs?.[0];
  const body = {
    namespace: entry.namespace,
    key: entry.key,
    value: entry.valueZh,
    description: entry.description,
  };

  let entryId: string;
  if (doc?.id) {
    await request(`/api/locale-entries/${doc.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(body) }, token);
    entryId = String(doc.id);
  } else {
    const created = unwrapDoc(await request("/api/locale-entries?locale=zh", { method: "POST", body: JSON.stringify(body) }, token));
    entryId = String(created.id);
  }

}

async function upsertLocaleEntries(token: string): Promise<void> {
  const entries: LocaleSeed[] = [
    {
      namespace: "home",
      key: "home.switchHint",
      valueZh: "切换语言:",
      valueEn: "Switch language:",
      description: "Homepage language switch helper text.",
    },
    {
      namespace: "products",
      key: "products.switchTo",
      valueZh: "切换到 English",
      valueEn: "Switch to 中文",
      description: "Products page language toggle label.",
    },
    {
      namespace: "products",
      key: "products.filter.reset",
      valueZh: "重置",
      valueEn: "Reset",
      description: "Products filter reset label.",
    },
    {
      namespace: "products",
      key: "products.filter.examples",
      valueZh: "示例:",
      valueEn: "Examples:",
      description: "Products filter examples label.",
    },
    {
      namespace: "products",
      key: "products.filter.regionNA",
      valueZh: "北美",
      valueEn: "North America",
      description: "Products region filter shortcut label.",
    },
    {
      namespace: "products",
      key: "products.filter.searchNuna",
      valueZh: "检索 Nuna",
      valueEn: "Search Nuna",
      description: "Products search shortcut label.",
    },
    {
      namespace: "products",
      key: "products.filter.brandLabel",
      valueZh: "品牌:",
      valueEn: "Brand:",
      description: "Products filter brand label.",
    },
    {
      namespace: "products",
      key: "products.viewDetail",
      valueZh: "查看详情",
      valueEn: "View details",
      description: "Products card detail link label.",
    },
    {
      namespace: "products",
      key: "products.empty",
      valueZh: "暂无已发布产品。可在后台 目录管理 > 产品 中新增并发布。",
      valueEn: "No published products yet. Add records in Admin > Catalog > Products.",
      description: "Products empty state message.",
    },
    {
      namespace: "reviews",
      key: "reviews.switchTo",
      valueZh: "切换到 English",
      valueEn: "Switch to 中文",
      description: "Reviews page language toggle label.",
    },
    {
      namespace: "reviews",
      key: "reviews.filter.reset",
      valueZh: "重置",
      valueEn: "Reset",
      description: "Reviews filter reset label.",
    },
    {
      namespace: "reviews",
      key: "reviews.filter.type",
      valueZh: "类型:",
      valueEn: "Type:",
      description: "Reviews filter type label.",
    },
    {
      namespace: "reviews",
      key: "reviews.filter.single",
      valueZh: "单品",
      valueEn: "Single",
      description: "Reviews filter single label.",
    },
    {
      namespace: "reviews",
      key: "reviews.filter.compare",
      valueZh: "横评",
      valueEn: "Compare",
      description: "Reviews filter compare label.",
    },
    {
      namespace: "reviews",
      key: "reviews.viewDetail",
      valueZh: "查看详情",
      valueEn: "View details",
      description: "Reviews card detail link label.",
    },
    {
      namespace: "reviews",
      key: "reviews.empty",
      valueZh: "暂无已发布评测。可在后台 内容编辑 > 评测 中新增并发布。",
      valueEn: "No published reviews yet. Add records in Admin > Editorial > Reviews.",
      description: "Reviews empty state message.",
    },
    {
      namespace: "reviews",
      key: "reviews.field.type",
      valueZh: "类型",
      valueEn: "Type",
      description: "Reviews card type field label.",
    },
    {
      namespace: "reviews",
      key: "reviews.field.overall",
      valueZh: "综合评分",
      valueEn: "Overall",
      description: "Reviews card overall score label.",
    },
    {
      namespace: "brands",
      key: "brands.switchTo",
      valueZh: "切换到 English",
      valueEn: "Switch to 中文",
      description: "Brands page language toggle label.",
    },
    {
      namespace: "brands",
      key: "brands.filter.reset",
      valueZh: "重置",
      valueEn: "Reset",
      description: "Brands filter reset label.",
    },
    {
      namespace: "brands",
      key: "brands.filter.regionNA",
      valueZh: "北美",
      valueEn: "North America",
      description: "Brands region filter North America label.",
    },
    {
      namespace: "brands",
      key: "brands.filter.regionEU",
      valueZh: "欧洲",
      valueEn: "Europe",
      description: "Brands region filter Europe label.",
    },
    {
      namespace: "brands",
      key: "brands.filter.regionME",
      valueZh: "中东",
      valueEn: "Middle East",
      description: "Brands region filter Middle East label.",
    },
    {
      namespace: "brands",
      key: "brands.filter.regionLabel",
      valueZh: "区域",
      valueEn: "Region",
      description: "Brands filter selected region label.",
    },
    {
      namespace: "brands",
      key: "brands.filter.countryLabel",
      valueZh: "国家",
      valueEn: "Country",
      description: "Brands filter selected country label.",
    },
    {
      namespace: "brands",
      key: "brands.group.top5",
      valueZh: "按优先级评分 Top5",
      valueEn: "Top 5 by priority score",
      description: "Brands group summary label.",
    },
    {
      namespace: "brands",
      key: "brands.empty",
      valueZh: "当前筛选下暂无品牌数据。",
      valueEn: "No brands found for current filters.",
      description: "Brands empty state message.",
    },
    {
      namespace: "brands",
      key: "brands.link.regionView",
      valueZh: "查看区域榜单",
      valueEn: "View region board",
      description: "Brands card region board link label.",
    },
    {
      namespace: "brands",
      key: "brands.link.detailView",
      valueZh: "查看品牌详情",
      valueEn: "View brand detail",
      description: "Brands card detail link label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.back",
      valueZh: "返回品牌列表",
      valueEn: "Back to brands",
      description: "Brand detail back link label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.field.regionCountry",
      valueZh: "区域/国家",
      valueEn: "Region/Country",
      description: "Brand detail region country field label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.field.priority",
      valueZh: "优先级评分",
      valueEn: "Priority Score",
      description: "Brand detail priority score field label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.field.marketFocus",
      valueZh: "市场聚焦",
      valueEn: "Market Focus",
      description: "Brand detail market focus field label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.section.relatedProducts",
      valueZh: "关联产品",
      valueEn: "Related Products",
      description: "Brand detail related products section title.",
    },
    {
      namespace: "brands",
      key: "brands.detail.section.famousProducts",
      valueZh: "知名产品",
      valueEn: "Famous Products",
      description: "Brand detail famous products section title.",
    },
    {
      namespace: "brands",
      key: "brands.detail.section.latest2026",
      valueZh: "2026 最新款产品",
      valueEn: "Latest 2026 Products",
      description: "Brand detail latest 2026 products section title.",
    },
    {
      namespace: "brands",
      key: "brands.detail.section.relatedReviews",
      valueZh: "关联评测",
      valueEn: "Related Reviews",
      description: "Brand detail related reviews section title.",
    },
    {
      namespace: "brands",
      key: "brands.detail.section.sameCountryTop5",
      valueZh: "同国家 Top5",
      valueEn: "Same-country Top5",
      description: "Brand detail same-country top5 section title.",
    },
    {
      namespace: "brands",
      key: "brands.detail.empty.products",
      valueZh: "暂无关联产品。",
      valueEn: "No related products yet.",
      description: "Brand detail empty products message.",
    },
    {
      namespace: "brands",
      key: "brands.detail.empty.famousProducts",
      valueZh: "暂无知名产品。",
      valueEn: "No famous products yet.",
      description: "Brand detail empty famous products message.",
    },
    {
      namespace: "brands",
      key: "brands.detail.empty.latest2026",
      valueZh: "暂无 2026 新款产品。",
      valueEn: "No 2026 products yet.",
      description: "Brand detail empty latest 2026 products message.",
    },
    {
      namespace: "brands",
      key: "brands.detail.empty.reviews",
      valueZh: "暂无关联评测。",
      valueEn: "No related reviews yet.",
      description: "Brand detail empty reviews message.",
    },
    {
      namespace: "brands",
      key: "brands.detail.empty.marketFocus",
      valueZh: "未配置",
      valueEn: "Not specified",
      description: "Brand detail empty market focus value.",
    },
    {
      namespace: "brands",
      key: "brands.detail.empty.sameCountry",
      valueZh: "同国家暂无其他品牌。",
      valueEn: "No same-country brands yet.",
      description: "Brand detail empty same-country list message.",
    },
    {
      namespace: "brands",
      key: "brands.detail.score.overall",
      valueZh: "综合",
      valueEn: "Overall",
      description: "Brand detail review score label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.marketFocus.stroller",
      valueZh: "婴儿推车",
      valueEn: "Stroller",
      description: "Brand detail market focus stroller label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.marketFocus.balance_bike",
      valueZh: "平衡车",
      valueEn: "Balance Bike",
      description: "Brand detail market focus balance bike label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.marketFocus.scooter",
      valueZh: "滑板车",
      valueEn: "Scooter",
      description: "Brand detail market focus scooter label.",
    },
    {
      namespace: "brands",
      key: "brands.detail.marketFocus.bicycle",
      valueZh: "自行车",
      valueEn: "Bicycle",
      description: "Brand detail market focus bicycle label.",
    },
    {
      namespace: "brands",
      key: "brands.region.back",
      valueZh: "返回品牌分组",
      valueEn: "Back to brand groups",
      description: "Brand region page back link label.",
    },
    {
      namespace: "brands",
      key: "brands.region.title",
      valueZh: "区域榜单",
      valueEn: "Region Board",
      description: "Brand region page title label.",
    },
    {
      namespace: "brands",
      key: "brands.region.subtitle",
      valueZh: "当前区域下按国家分组展示 Top5 品牌。",
      valueEn: "Country-grouped Top5 brands in the selected region.",
      description: "Brand region page subtitle label.",
    },
    {
      namespace: "brands",
      key: "brands.region.empty",
      valueZh: "当前区域筛选下暂无品牌。",
      valueEn: "No brands in this region filter.",
      description: "Brand region page empty state message.",
    },
    {
      namespace: "brands",
      key: "brands.region.top5Hint",
      valueZh: "按优先级评分 Top5",
      valueEn: "Top 5 by priority score",
      description: "Brand region page top5 hint label.",
    },
  ];

  for (const entry of entries) {
    await upsertLocaleEntry(token, entry);
  }
}

async function main() {
  const token = await ensureAdminToken();

  const topBrandMap = new Map<string, AnyObject>();
  for (const brand of TOP_BRANDS) {
    const saved = await upsertBrand(brand, token);
    topBrandMap.set(brand.slug, saved);
  }
  console.log(`Top brands upserted: ${TOP_BRANDS.length}`);

  const anchorBrand = topBrandMap.get("nuna-na") || topBrandMap.get("uppababy-us") || topBrandMap.values().next().value;
  if (!anchorBrand?.id) {
    throw new Error("No anchor brand available for product seed");
  }

  let category = await findBySlug("categories", "stroller-lightweight", token);
  if (!category) {
    category = unwrapDoc(
      await request(
        "/api/categories",
        {
          method: "POST",
          body: JSON.stringify({
            name: "轻便婴儿推车",
            slug: "stroller-lightweight",
            kind: "stroller",
            ageRange: "0-3y",
          }),
        },
        token,
      ),
    );
    console.log(`Category created id=${category.id}`);
  }

  let product = await findBySlug("products", "nuna-trvl-lx-2026", token);
  if (!product) {
    product = unwrapDoc(
      await request(
        "/api/products?locale=zh",
        {
          method: "POST",
          body: JSON.stringify({
            modelName: "Nuna TRVL LX 2026",
            slug: "nuna-trvl-lx-2026",
            brand: anchorBrand.id,
            category: category.id,
            msrpCNY: 3999,
            certifications: ["en1888", "astm_f833"],
            params: {
              weightKg: 7.2,
              loadKg: 22,
              foldedSize: "55x48x28cm",
              expandedSize: "87x52x103cm",
              reclineDeg: 170,
              bidirectional: false,
            },
            summary: "面向城市通勤与轻旅行的高端轻便推车样例。",
            _status: "published",
          }),
        },
        token,
      ),
    );
    console.log(`Product created id=${product.id}`);
  }

  if (product?.id) {
    await request(
      `/api/products/${product.id}?locale=zh`,
      {
        method: "PATCH",
        body: JSON.stringify({
          summary: "面向城市通勤与轻旅行的高端轻便推车样例。",
        }),
      },
      token,
    ).catch(() => null);

  }

  const scores = { safety: 9, comfort: 8, portability: 9, function: 8, value: 7 };
  const expected = Math.round((scores.safety * 0.3 + scores.comfort * 0.25 + scores.portability * 0.15 + scores.function * 0.2 + scores.value * 0.1) * 10) / 10;

  let review = await findBySlug("reviews", "nuna-trvl-lx-single-2026", token);
  if (!review) {
    review = unwrapDoc(
      await request(
        "/api/reviews?locale=zh",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Nuna TRVL LX 单品实测 2026",
            slug: "nuna-trvl-lx-single-2026",
            type: "single",
            status: "published",
            publishedAt: new Date().toISOString(),
            products: [product.id],
            scores,
            _status: "published",
          }),
        },
        token,
      ),
    );
    console.log(`Review created id=${review.id}`);
  }

  await upsertHomePage(token);
  await upsertListingPage(token, "products");
  await upsertListingPage(token, "reviews");
  await upsertListingPage(token, "brands");
  await upsertLocaleEntries(token);

  const check = await request(`/api/reviews/${review.id}`, undefined, token);
  const got = Number(check?.scoreOverall);
  const pass = got === expected;
  console.log(`Expected scoreOverall=${expected} Actual=${got} ${pass ? "OK" : "MISMATCH"}`);

  if (!pass) throw new Error("scoreOverall mismatch");
}

main()
  .then(() => {
    console.log("Seed completed.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
