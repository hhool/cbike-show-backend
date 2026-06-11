/**
 * seed-electric-products.ts
 *
 * Seeds an "电动车 / Electric Bike" category, a set of kids-electric-vehicle
 * brands, and a variety of children's electric vehicle products bound to the
 * `electric_bike` kind so the new front-end category filter has live data.
 *
 * Idempotent: categories / brands / products are upserted by slug.
 *
 * Usage:
 *   API_BASE=https://cbike-show-backend.vercel.app \
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... \
 *   npx tsx scripts/seed-electric-products.ts
 */

const API_BASE_CANDIDATES = process.env.API_BASE
  ? [process.env.API_BASE]
  : ["http://localhost:3000", "http://localhost:3001"];
let ACTIVE_API_BASE = API_BASE_CANDIDATES[0].replace(/\/$/, "");
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";

type CategorySeed = {
  slug: string;
  kind: string;
  nameZh: string;
  nameEn: string;
  ageRange: string;
};

type BrandSeed = {
  slug: string;
  name: string;
  region: string;
  country: string;
  marketFocus: string[];
  priorityScore: number;
  introZh: string;
  introEn: string;
};

type ProductSeed = {
  slug: string;
  modelName: string;
  brandSlug: string;
  categorySlug: string;
  msrpCNY: number;
  params: {
    weightKg?: number;
    loadKg?: number;
    foldedSize?: string;
    expandedSize?: string;
  };
  certifications: string[];
  summaryZh: string;
  summaryEn: string;
};

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    slug: "electric-bike",
    kind: "electric_bike",
    nameZh: "儿童电动车",
    nameEn: "Kids Electric Bike",
    ageRange: "3–8y",
  },
];

const BRAND_SEEDS: BrandSeed[] = [
  {
    slug: "razor-us",
    name: "Razor",
    region: "north_america",
    country: "US",
    marketFocus: ["electric_bike", "scooter"],
    priorityScore: 78,
    introZh: "美国电动滑板车与电动平衡车品牌，主打入门级儿童电动出行产品。",
    introEn: "US brand for electric scooters and balance vehicles, focused on entry-level kids electric mobility.",
  },
  {
    slug: "segway-ninebot-cn",
    name: "Segway-Ninebot",
    region: "apac",
    country: "CN",
    marketFocus: ["electric_bike", "balance_bike"],
    priorityScore: 82,
    introZh: "智能电动平衡与卡丁产品品牌,产品线覆盖儿童电动卡丁车与平衡车。",
    introEn: "Smart electric balance and go-kart brand, with a product line covering kids electric karts and balance vehicles.",
  },
  {
    slug: "rastar-cn",
    name: "Rastar",
    region: "apac",
    country: "CN",
    marketFocus: ["electric_bike", "electric_toy_car"],
    priorityScore: 70,
    introZh: "授权品牌儿童电动乘骑车制造商,产品包含电动摩托与电动乘骑跑车。",
    introEn: "Licensed kids ride-on manufacturer, with electric motorcycles and ride-on sports cars.",
  },
];

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    slug: "razor-e100-glow",
    modelName: "Razor E100 Glow",
    brandSlug: "razor-us",
    categorySlug: "electric-bike",
    msrpCNY: 1299,
    params: { weightKg: 13, loadKg: 54, expandedSize: "82×42×96 cm" },
    certifications: ["cpsc", "astm_f833"],
    summaryZh: "入门级儿童电动滑板车,最高时速约 16km/h,适合 8 岁以上初学者短途代步。",
    summaryEn: "Entry-level kids electric scooter with a top speed of about 16 km/h, suited to beginners aged 8+ for short rides.",
  },
  {
    slug: "razor-mx125-dirt",
    modelName: "Razor MX125 Dirt Rocket",
    brandSlug: "razor-us",
    categorySlug: "electric-bike",
    msrpCNY: 1899,
    params: { weightKg: 21, loadKg: 61, expandedSize: "111×51×69 cm" },
    certifications: ["cpsc"],
    summaryZh: "电动越野摩托入门款,低速扭矩平稳,适合 7 岁以上在硬质场地体验骑行乐趣。",
    summaryEn: "Entry electric dirt motorcycle with smooth low-speed torque, suited to kids aged 7+ on hard surfaces.",
  },
  {
    slug: "ninebot-gokart-kit-pro",
    modelName: "Segway Ninebot Gokart Kit Pro",
    brandSlug: "segway-ninebot-cn",
    categorySlug: "electric-bike",
    msrpCNY: 4699,
    params: { weightKg: 25, loadKg: 100, expandedSize: "127×72×46 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "可改装电动卡丁套件,搭配平衡车底盘使用,支持多档限速,适合家庭场地娱乐。",
    summaryEn: "Convertible electric go-kart kit paired with a self-balancing base, with multiple speed limits for family-yard fun.",
  },
  {
    slug: "ninebot-s-kids",
    modelName: "Segway Ninebot S Kids",
    brandSlug: "segway-ninebot-cn",
    categorySlug: "electric-bike",
    msrpCNY: 1999,
    params: { weightKg: 12, loadKg: 50, expandedSize: "47×56×55 cm" },
    certifications: ["ccc"],
    summaryZh: "儿童电动平衡车,内置体感转向与限速保护,App 可设置使用范围与速度。",
    summaryEn: "Kids self-balancing vehicle with body-steering and speed-limit protection; the app sets range and speed.",
  },
  {
    slug: "rastar-bmw-motor-12v",
    modelName: "Rastar BMW Motorbike 12V",
    brandSlug: "rastar-cn",
    categorySlug: "electric-bike",
    msrpCNY: 899,
    params: { weightKg: 9, loadKg: 30, expandedSize: "104×54×72 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "授权外观电动乘骑摩托,12V 电池带辅助轮,适合 3-6 岁低龄儿童入门骑乘。",
    summaryEn: "Licensed-design electric ride-on motorbike, 12V battery with training wheels, for ages 3-6.",
  },
  {
    slug: "rastar-sports-ride-on-12v",
    modelName: "Rastar Sports Ride-on 12V",
    brandSlug: "rastar-cn",
    categorySlug: "electric-bike",
    msrpCNY: 1599,
    params: { weightKg: 16, loadKg: 35, expandedSize: "118×70×54 cm" },
    certifications: ["ccc"],
    summaryZh: "双驱电动乘骑跑车,支持家长遥控与儿童自驾两种模式,带缓启动与软刹车。",
    summaryEn: "Dual-drive electric ride-on sports car with parent-remote and self-drive modes, soft start and braking.",
  },
];

type RequestOptions = { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: string };

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
    throw new Error(`[${response.status}] ${path} ${message}`);
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
  const login = await request("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!login?.token) throw new Error("Admin login failed: token missing.");
  return String(login.token);
}

function unwrapDoc(data: any): any {
  if (data?.doc) return data.doc;
  if (Array.isArray(data?.docs)) return data.docs[0] || null;
  return data;
}

async function findBySlug(collection: string, slug: string, token: string): Promise<any | null> {
  const payload = await request(
    `/api/${collection}?limit=1&depth=0&locale=zh&where[slug][equals]=${encodeURIComponent(slug)}`,
    {},
    token,
  );
  return unwrapDoc(payload);
}

async function upsertCategory(seed: CategorySeed, token: string): Promise<number> {
  const existing = await findBySlug("categories", seed.slug, token);
  const zhBody = { slug: seed.slug, kind: seed.kind, name: seed.nameZh, ageRange: seed.ageRange };
  let id: number;
  if (existing?.id) {
    await request(`/api/categories/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(zhBody) }, token);
    id = Number(existing.id);
  } else {
    const created = unwrapDoc(await request("/api/categories?locale=zh", { method: "POST", body: JSON.stringify(zhBody) }, token));
    id = Number(created?.id);
  }
  await request(`/api/categories/${id}?locale=en`, { method: "PATCH", body: JSON.stringify({ name: seed.nameEn }) }, token);
  return id;
}

async function upsertBrand(seed: BrandSeed, token: string): Promise<number> {
  const existing = await findBySlug("brands", seed.slug, token);
  const zhBody = {
    slug: seed.slug,
    name: seed.name,
    region: seed.region,
    country: seed.country,
    marketFocus: seed.marketFocus,
    priorityScore: seed.priorityScore,
    intro: seed.introZh,
  };
  let id: number;
  if (existing?.id) {
    await request(`/api/brands/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(zhBody) }, token);
    id = Number(existing.id);
  } else {
    const created = unwrapDoc(await request("/api/brands?locale=zh", { method: "POST", body: JSON.stringify(zhBody) }, token));
    id = Number(created?.id);
  }
  await request(`/api/brands/${id}?locale=en`, { method: "PATCH", body: JSON.stringify({ intro: seed.introEn }) }, token);
  return id;
}

async function upsertProduct(seed: ProductSeed, brandId: number, categoryId: number, token: string): Promise<number> {
  const existing = await findBySlug("products", seed.slug, token);
  const zhBody = {
    slug: seed.slug,
    modelName: seed.modelName,
    brand: brandId,
    category: categoryId,
    msrpCNY: seed.msrpCNY,
    params: seed.params,
    certifications: seed.certifications,
    summary: seed.summaryZh,
  };
  let id: number;
  if (existing?.id) {
    await request(`/api/products/${existing.id}?locale=zh`, { method: "PATCH", body: JSON.stringify(zhBody) }, token);
    id = Number(existing.id);
  } else {
    const created = unwrapDoc(await request("/api/products?locale=zh", { method: "POST", body: JSON.stringify(zhBody) }, token));
    id = Number(created?.id);
  }
  await request(`/api/products/${id}?locale=en`, { method: "PATCH", body: JSON.stringify({ summary: seed.summaryEn }) }, token);
  return id;
}

async function main() {
  await ensureActiveApi();
  console.log(`Electric products seed API base: ${ACTIVE_API_BASE}`);

  const token = await ensureAdminToken();

  const categoryIdBySlug = new Map<string, number>();
  for (const seed of CATEGORY_SEEDS) {
    const id = await upsertCategory(seed, token);
    categoryIdBySlug.set(seed.slug, id);
    console.log(`Upserted category: ${seed.slug} (${seed.kind}) -> ${id}`);
  }

  const brandIdBySlug = new Map<string, number>();
  for (const seed of BRAND_SEEDS) {
    const id = await upsertBrand(seed, token);
    brandIdBySlug.set(seed.slug, id);
    console.log(`Upserted brand: ${seed.slug} -> ${id}`);
  }

  let count = 0;
  for (const seed of PRODUCT_SEEDS) {
    const brandId = brandIdBySlug.get(seed.brandSlug);
    const categoryId = categoryIdBySlug.get(seed.categorySlug);
    if (!brandId || !categoryId) {
      console.warn(`Skip product ${seed.slug}: missing brand/category mapping.`);
      continue;
    }
    const id = await upsertProduct(seed, brandId, categoryId, token);
    count += 1;
    console.log(`Upserted product: ${seed.slug} -> ${id}`);
  }

  console.log(`Done. ${count} electric-bike products are ready.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
