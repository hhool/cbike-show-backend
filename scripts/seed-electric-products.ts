/**
 * seed-electric-products.ts
 *
 * Seeds an "电动车 / Electric Bike" category, a small set of fallback
 * kids-electric-vehicle brands, and a variety of children's electric vehicle
 * products bound to the `electric_bike` kind so the front-end category filter
 * has live data.
 *
 * Product brands are assigned from the existing production brand pool by stable
 * pseudo-random matching. Newly seeded fallback brands are only used if the
 * existing pool is too small.
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
  modelLine: string;
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
    modelLine: "Classic Glow Scooter",
    categorySlug: "electric-bike",
    msrpCNY: 1299,
    params: { weightKg: 13, loadKg: 54, expandedSize: "82×42×96 cm" },
    certifications: ["cpsc", "astm_f833"],
    summaryZh: "入门级儿童电动滑板车,最高时速约 16km/h,适合 8 岁以上初学者短途代步。",
    summaryEn: "Entry-level kids electric scooter with a top speed of about 16 km/h, suited to beginners aged 8+ for short rides.",
  },
  {
    slug: "razor-mx125-dirt",
    modelLine: "Classic Dirt Moto 125",
    categorySlug: "electric-bike",
    msrpCNY: 1899,
    params: { weightKg: 21, loadKg: 61, expandedSize: "111×51×69 cm" },
    certifications: ["cpsc"],
    summaryZh: "电动越野摩托入门款,低速扭矩平稳,适合 7 岁以上在硬质场地体验骑行乐趣。",
    summaryEn: "Entry electric dirt motorcycle with smooth low-speed torque, suited to kids aged 7+ on hard surfaces.",
  },
  {
    slug: "ninebot-gokart-kit-pro",
    modelLine: "Classic Gokart Kit Pro",
    categorySlug: "electric-bike",
    msrpCNY: 4699,
    params: { weightKg: 25, loadKg: 100, expandedSize: "127×72×46 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "可改装电动卡丁套件,搭配平衡车底盘使用,支持多档限速,适合家庭场地娱乐。",
    summaryEn: "Convertible electric go-kart kit paired with a self-balancing base, with multiple speed limits for family-yard fun.",
  },
  {
    slug: "ninebot-s-kids",
    modelLine: "Classic Balance S Kids",
    categorySlug: "electric-bike",
    msrpCNY: 1999,
    params: { weightKg: 12, loadKg: 50, expandedSize: "47×56×55 cm" },
    certifications: ["ccc"],
    summaryZh: "儿童电动平衡车,内置体感转向与限速保护,App 可设置使用范围与速度。",
    summaryEn: "Kids self-balancing vehicle with body-steering and speed-limit protection; the app sets range and speed.",
  },
  {
    slug: "rastar-bmw-motor-12v",
    modelLine: "Classic Mini Motorbike 12V",
    categorySlug: "electric-bike",
    msrpCNY: 899,
    params: { weightKg: 9, loadKg: 30, expandedSize: "104×54×72 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "授权外观电动乘骑摩托,12V 电池带辅助轮,适合 3-6 岁低龄儿童入门骑乘。",
    summaryEn: "Licensed-design electric ride-on motorbike, 12V battery with training wheels, for ages 3-6.",
  },
  {
    slug: "rastar-sports-ride-on-12v",
    modelLine: "Classic Sports Ride-on 12V",
    categorySlug: "electric-bike",
    msrpCNY: 1599,
    params: { weightKg: 16, loadKg: 35, expandedSize: "118×70×54 cm" },
    certifications: ["ccc"],
    summaryZh: "双驱电动乘骑跑车,支持家长遥控与儿童自驾两种模式,带缓启动与软刹车。",
    summaryEn: "Dual-drive electric ride-on sports car with parent-remote and self-drive modes, soft start and braking.",
  },
  {
    slug: "kids-ev-glow-scooter-entry",
    modelLine: "Glow Scooter Entry",
    categorySlug: "electric-bike",
    msrpCNY: 1299,
    params: { weightKg: 13, loadKg: 54, expandedSize: "82×42×96 cm" },
    certifications: ["cpsc", "astm_f833"],
    summaryZh: "入门级儿童电动滑板车,最高时速约 16km/h,适合 8 岁以上初学者短途代步。",
    summaryEn: "Entry-level kids electric scooter with a top speed of about 16 km/h, suited to beginners aged 8+ for short rides.",
  },
  {
    slug: "kids-ev-dirt-moto-125",
    modelLine: "Dirt Moto 125",
    categorySlug: "electric-bike",
    msrpCNY: 1899,
    params: { weightKg: 21, loadKg: 61, expandedSize: "111×51×69 cm" },
    certifications: ["cpsc"],
    summaryZh: "电动越野摩托入门款,低速扭矩平稳,适合 7 岁以上在硬质场地体验骑行乐趣。",
    summaryEn: "Entry electric dirt motorcycle with smooth low-speed torque, suited to kids aged 7+ on hard surfaces.",
  },
  {
    slug: "kids-ev-gokart-kit-pro",
    modelLine: "Gokart Kit Pro",
    categorySlug: "electric-bike",
    msrpCNY: 4699,
    params: { weightKg: 25, loadKg: 100, expandedSize: "127×72×46 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "可改装电动卡丁套件,搭配平衡车底盘使用,支持多档限速,适合家庭场地娱乐。",
    summaryEn: "Convertible electric go-kart kit paired with a self-balancing base, with multiple speed limits for family-yard fun.",
  },
  {
    slug: "kids-ev-balance-s",
    modelLine: "Balance S Kids",
    categorySlug: "electric-bike",
    msrpCNY: 1999,
    params: { weightKg: 12, loadKg: 50, expandedSize: "47×56×55 cm" },
    certifications: ["ccc"],
    summaryZh: "儿童电动平衡车,内置体感转向与限速保护,App 可设置使用范围与速度。",
    summaryEn: "Kids self-balancing vehicle with body-steering and speed-limit protection; the app sets range and speed.",
  },
  {
    slug: "kids-ev-mini-motorbike-12v",
    modelLine: "Mini Motorbike 12V",
    categorySlug: "electric-bike",
    msrpCNY: 899,
    params: { weightKg: 9, loadKg: 30, expandedSize: "104×54×72 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "授权外观电动乘骑摩托,12V 电池带辅助轮,适合 3-6 岁低龄儿童入门骑乘。",
    summaryEn: "Licensed-design electric ride-on motorbike, 12V battery with training wheels, for ages 3-6.",
  },
  {
    slug: "kids-ev-sports-ride-on-12v",
    modelLine: "Sports Ride-on 12V",
    categorySlug: "electric-bike",
    msrpCNY: 1599,
    params: { weightKg: 16, loadKg: 35, expandedSize: "118×70×54 cm" },
    certifications: ["ccc"],
    summaryZh: "双驱电动乘骑跑车,支持家长遥控与儿童自驾两种模式,带缓启动与软刹车。",
    summaryEn: "Dual-drive electric ride-on sports car with parent-remote and self-drive modes, soft start and braking.",
  },
  {
    slug: "kids-ev-folding-scooter-6plus",
    modelLine: "Folding Scooter 6+",
    categorySlug: "electric-bike",
    msrpCNY: 1099,
    params: { weightKg: 10.5, loadKg: 50, foldedSize: "79×34×32 cm", expandedSize: "79×34×89 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "轻量折叠电动滑板车,适合 6 岁以上儿童在社区道路和封闭场地短途骑行。",
    summaryEn: "Light folding electric scooter for kids aged 6+, suited to short rides on community paths and closed spaces.",
  },
  {
    slug: "kids-ev-trail-bike-16",
    modelLine: "Trail Bike 16",
    categorySlug: "electric-bike",
    msrpCNY: 2699,
    params: { weightKg: 18.5, loadKg: 60, expandedSize: "124×55×76 cm" },
    certifications: ["ccc"],
    summaryZh: "16 寸儿童电助力骑行车,低速辅助输出,适合有平衡车或自行车基础的孩子。",
    summaryEn: "16-inch kids electric-assist bike with low-speed support, for children already comfortable with balance bikes or bicycles.",
  },
  {
    slug: "kids-ev-smart-balance-mini",
    modelLine: "Smart Balance Mini",
    categorySlug: "electric-bike",
    msrpCNY: 1499,
    params: { weightKg: 8.8, loadKg: 45, expandedSize: "58×19×18 cm" },
    certifications: ["ccc"],
    summaryZh: "低龄儿童电动平衡车,机身小巧,主打限速、低重心和室外平整路面使用。",
    summaryEn: "Compact kids electric balance vehicle for younger riders, focused on speed limits, low center of gravity and flat outdoor surfaces.",
  },
  {
    slug: "kids-ev-double-seat-car-24v",
    modelLine: "Double-seat Car 24V",
    categorySlug: "electric-bike",
    msrpCNY: 2399,
    params: { weightKg: 28, loadKg: 60, expandedSize: "135×82×78 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "双座儿童电动乘骑车,24V 电池和双电机配置,适合家庭庭院和亲子娱乐。",
    summaryEn: "Two-seat kids electric ride-on car with 24V battery and dual motors, for family yards and parent-child play.",
  },
  {
    slug: "kids-ev-atv-quad-12v",
    modelLine: "ATV Quad 12V",
    categorySlug: "electric-bike",
    msrpCNY: 1299,
    params: { weightKg: 15, loadKg: 35, expandedSize: "96×62×64 cm" },
    certifications: ["ccc"],
    summaryZh: "儿童电动四轮沙滩车造型,低速挡位和宽轮胎设计,适合 3-6 岁娱乐体验。",
    summaryEn: "Kids electric ATV-style quad with low-speed mode and wide tires, intended for ages 3-6 recreational riding.",
  },
  {
    slug: "kids-ev-moto-trainer-6v",
    modelLine: "Moto Trainer 6V",
    categorySlug: "electric-bike",
    msrpCNY: 699,
    params: { weightKg: 7, loadKg: 25, expandedSize: "78×36×52 cm" },
    certifications: ["ccc"],
    summaryZh: "6V 入门电动摩托训练车,带辅助轮和一键启动,适合低龄儿童初次接触电动乘骑。",
    summaryEn: "6V starter electric motorbike trainer with training wheels and one-button start for first ride-on experience.",
  },
  {
    slug: "kids-ev-scooter-pro-8plus",
    modelLine: "Scooter Pro 8+",
    categorySlug: "electric-bike",
    msrpCNY: 1799,
    params: { weightKg: 12.6, loadKg: 60, foldedSize: "86×42×35 cm", expandedSize: "86×42×98 cm" },
    certifications: ["cpsc"],
    summaryZh: "8 岁以上儿童电动滑板车,续航更长并配备手刹,适合有骑行经验的孩子。",
    summaryEn: "Electric scooter for kids aged 8+, with longer range and hand brake for more experienced riders.",
  },
  {
    slug: "kids-ev-go-kart-light",
    modelLine: "Go Kart Light",
    categorySlug: "electric-bike",
    msrpCNY: 3299,
    params: { weightKg: 22, loadKg: 75, expandedSize: "115×68×45 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "轻量儿童电动卡丁车,带速度限制和防撞包围,适合封闭场地娱乐驾驶。",
    summaryEn: "Light kids electric go-kart with speed limits and protective bumper for closed-space recreational driving.",
  },
  {
    slug: "kids-ev-ride-on-suv-12v",
    modelLine: "Ride-on SUV 12V",
    categorySlug: "electric-bike",
    msrpCNY: 1899,
    params: { weightKg: 20, loadKg: 40, expandedSize: "122×74×68 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "儿童电动 SUV 乘骑车,支持遥控、安全带和缓启动,适合室外平整场地。",
    summaryEn: "Kids electric SUV ride-on with remote control, safety belt and soft start for flat outdoor spaces.",
  },
  {
    slug: "kids-ev-mini-cruiser-bike",
    modelLine: "Mini Cruiser Bike",
    categorySlug: "electric-bike",
    msrpCNY: 2199,
    params: { weightKg: 16, loadKg: 55, expandedSize: "118×52×73 cm" },
    certifications: ["ccc"],
    summaryZh: "儿童迷你巡航电动车,骑姿接近自行车,适合从平衡车过渡到轻量电助力车型。",
    summaryEn: "Mini cruiser-style kids electric bike with a bicycle-like riding position for transition from balance bikes.",
  },
  {
    slug: "kids-ev-balance-board-kids",
    modelLine: "Balance Board Kids",
    categorySlug: "electric-bike",
    msrpCNY: 999,
    params: { weightKg: 7.5, loadKg: 45, expandedSize: "60×19×18 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "儿童双轮体感平衡车,带低速教学模式和彩色灯效,适合平整地面娱乐使用。",
    summaryEn: "Kids two-wheel self-balancing board with low-speed training mode and light effects for flat-ground play.",
  },
];

type RequestOptions = { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: string };

type BrandDoc = {
  id: number;
  slug?: string;
  name?: string;
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

async function fetchAllBrands(token: string): Promise<BrandDoc[]> {
  const docs: BrandDoc[] = [];
  let page = 1;

  while (true) {
    const payload = await request(`/api/brands?locale=zh&limit=100&page=${page}&depth=0`, {}, token);
    const list = Array.isArray(payload?.docs) ? payload.docs : [];
    docs.push(...list.map((doc: any) => ({ id: Number(doc.id), slug: doc.slug, name: doc.name })));
    if (!payload?.hasNextPage) break;
    page += 1;
  }

  return docs.filter((brand) => Number.isFinite(brand.id) && brand.name);
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildAssignableBrands(allBrands: BrandDoc[]): BrandDoc[] {
  const fallbackSeedSlugs = new Set(BRAND_SEEDS.map((seed) => seed.slug));
  const existingBrands = allBrands.filter((brand) => !fallbackSeedSlugs.has(String(brand.slug || "")));
  const pool = existingBrands.length >= 6 ? existingBrands : allBrands;
  return [...pool].sort((a, b) => String(a.slug || a.name).localeCompare(String(b.slug || b.name)));
}

function pickBrand(seed: ProductSeed, assignableBrands: BrandDoc[]): BrandDoc {
  if (!assignableBrands.length) throw new Error("No assignable brands found.");
  const index = stableHash(seed.slug) % assignableBrands.length;
  return assignableBrands[index];
}

async function upsertProduct(seed: ProductSeed, brand: BrandDoc, categoryId: number, token: string): Promise<number> {
  const existing = await findBySlug("products", seed.slug, token);
  const modelName = `${brand.name} ${seed.modelLine}`;
  const zhBody = {
    slug: seed.slug,
    modelName,
    brand: brand.id,
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

  const allBrands = await fetchAllBrands(token);
  const assignableBrands = buildAssignableBrands(allBrands);
  console.log(
    `Brand assignment pool: ${assignableBrands.length} brands (${assignableBrands
      .map((brand) => brand.name)
      .join(", ")})`,
  );

  let count = 0;
  for (const seed of PRODUCT_SEEDS) {
    const categoryId = categoryIdBySlug.get(seed.categorySlug);
    if (!categoryId) {
      console.warn(`Skip product ${seed.slug}: missing category mapping.`);
      continue;
    }
    const brand = pickBrand(seed, assignableBrands);
    const id = await upsertProduct(seed, brand, categoryId, token);
    count += 1;
    console.log(`Upserted product: ${seed.slug} -> ${id} (${brand.name})`);
  }

  console.log(`Done. ${count} electric-bike products are ready.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
