/**
 * seed-all-catalog-products.ts
 *
 * Comprehensive multi-category seeding script for children's vehicles:
 * - Stroller (30 products)
 * - Scooter (20 products)
 * - Bicycle (15 products)
 * - Electric Bike (23 products)
 * - Electric Car (20 products)
 *
 * Brands are assigned from the existing production brand pool by stable pseudo-random matching.
 * Idempotent: categories / products are upserted by slug.
 *
 * Usage:
 *   API_BASE=https://cbike-show-backend.vercel.app \
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... \
 *   npx tsx scripts/seed-all-catalog-products.ts
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

// Five major categories
const CATEGORY_SEEDS: CategorySeed[] = [
  {
    slug: "stroller",
    kind: "stroller",
    nameZh: "推车",
    nameEn: "Stroller",
    ageRange: "0–3y",
  },
  {
    slug: "scooter",
    kind: "scooter",
    nameZh: "滑板车",
    nameEn: "Scooter",
    ageRange: "3–8y",
  },
  {
    slug: "bicycle",
    kind: "bicycle",
    nameZh: "自行车",
    nameEn: "Bicycle",
    ageRange: "3–10y",
  },
  {
    slug: "electric-bike",
    kind: "electric_bike",
    nameZh: "儿童电动车",
    nameEn: "Kids Electric Car",
    ageRange: "3–8y",
  },
  {
    slug: "electric-car",
    kind: "electric_toy_car",
    nameZh: "电动小车",
    nameEn: "Electric Car",
    ageRange: "2–7y",
  },
];

const EXCLUDED_SAMPLE_BRAND_SLUGS = new Set(["razor-us", "segway-ninebot-cn", "rastar-cn"]);

// ============ STROLLER PRODUCTS (30) ============
const STROLLER_PRODUCTS: ProductSeed[] = [
  {
    slug: "stroller-full-size-classic",
    modelLine: "Full-Size Classic",
    categorySlug: "stroller",
    msrpCNY: 3999,
    params: { weightKg: 12.5, loadKg: 22.5, foldedSize: "60×56×32 cm", expandedSize: "75×56×102 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "双向推车,可平躺可坐卧,适合新生儿至 3 岁长期使用的全能型推车。",
    summaryEn: "Two-way stroller with recline and semi-upright modes, all-in-one for newborns to age 3.",
  },
  {
    slug: "stroller-travel-lightweight",
    modelLine: "Travel Lightweight",
    categorySlug: "stroller",
    msrpCNY: 1499,
    params: { weightKg: 5.8, loadKg: 20, foldedSize: "50×32×28 cm", expandedSize: "60×44×98 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "超轻便携推车,折叠紧凑,适合户外旅行和短途外出使用。",
    summaryEn: "Ultra-lightweight travel stroller, compact folding, ideal for travel and short outings.",
  },
  {
    slug: "stroller-double-twin",
    modelLine: "Double Twin",
    categorySlug: "stroller",
    msrpCNY: 4899,
    params: { weightKg: 18, loadKg: 40, foldedSize: "78×68×32 cm", expandedSize: "112×68×102 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "双胞胎双人推车,配置独立悬挂与避震系统,适合双胞胎或年龄接近的两个小孩。",
    summaryEn: "Twin double stroller with independent suspension for twins or closely-aged siblings.",
  },
  {
    slug: "stroller-jogger-all-terrain",
    modelLine: "Jogger All-Terrain",
    categorySlug: "stroller",
    msrpCNY: 2899,
    params: { weightKg: 11.2, loadKg: 25, expandedSize: "82×66×110 cm" },
    certifications: ["cpsc", "astm_f833"],
    summaryZh: "越野慢跑推车,三轮大轮设计,适合在公园与野外运动使用。",
    summaryEn: "All-terrain jogging stroller with three large wheels for parks and outdoor sports.",
  },
  {
    slug: "stroller-car-seat-frame",
    modelLine: "Car Seat Frame",
    categorySlug: "stroller",
    msrpCNY: 1199,
    params: { weightKg: 4.5, loadKg: 15, expandedSize: "62×52×75 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "婴儿车座架,兼容多数安全座椅,便于汽车安全座椅转接使用。",
    summaryEn: "Car seat frame compatible with most car seats for easy car-to-stroller transitions.",
  },
  {
    slug: "stroller-reversible-seat",
    modelLine: "Reversible Seat",
    categorySlug: "stroller",
    msrpCNY: 3299,
    params: { weightKg: 11, loadKg: 22, foldedSize: "62×56×34 cm", expandedSize: "72×56×105 cm" },
    certifications: ["ccc"],
    summaryZh: "正反向推车,宝宝可面向家长或朝向外界,支持一键切换方向。",
    summaryEn: "Reversible stroller allowing baby to face parent or the world with one-button direction switch.",
  },
  {
    slug: "stroller-pram-bassinet",
    modelLine: "Pram Bassinet",
    categorySlug: "stroller",
    msrpCNY: 4599,
    params: { weightKg: 14, loadKg: 20, foldedSize: "68×60×36 cm", expandedSize: "82×60×115 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "婴儿推车,篮形床体设计,适合新生儿平躺睡眠,可转换座位模式。",
    summaryEn: "Pram with basket-style bassinet for newborn flat sleeping, convertible to seating mode.",
  },
  {
    slug: "stroller-compact-fold",
    modelLine: "Compact Fold",
    categorySlug: "stroller",
    msrpCNY: 1899,
    params: { weightKg: 6.8, loadKg: 18, foldedSize: "48×42×30 cm", expandedSize: "65×50×100 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "超紧凑折叠推车,适合小型汽车和飞机旅行的快速收纳。",
    summaryEn: "Super-compact folding stroller perfect for small cars and airplane travel storage.",
  },
  {
    slug: "stroller-umbrella-simple",
    modelLine: "Umbrella Simple",
    categorySlug: "stroller",
    msrpCNY: 899,
    params: { weightKg: 4.2, loadKg: 15, foldedSize: "40×32×25 cm", expandedSize: "56×44×88 cm" },
    certifications: ["ccc"],
    summaryZh: "伞车型推车,收纳如伞柄,适合低龄宝宝的简易短途推车。",
    summaryEn: "Umbrella-type stroller that folds like an umbrella, simple for younger toddlers.",
  },
  {
    slug: "stroller-high-landscape",
    modelLine: "High Landscape",
    categorySlug: "stroller",
    msrpCNY: 3599,
    params: { weightKg: 13.5, loadKg: 22, foldedSize: "64×58×36 cm", expandedSize: "75×58×115 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "高视野推车,座位高度更高,让宝宝看得更远,配备大遮阳篷。",
    summaryEn: "High-view stroller with elevated seating so baby can see farther, with large canopy.",
  },
  {
    slug: "stroller-modular-system",
    modelLine: "Modular System",
    categorySlug: "stroller",
    msrpCNY: 5299,
    params: { weightKg: 16, loadKg: 25, foldedSize: "70×62×38 cm", expandedSize: "82×62×110 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "模块化推车系统,座位与睡篮可互换,支持从新生儿到 3 岁的不同阶段。",
    summaryEn: "Modular stroller system with interchangeable seat and bassinet, from newborn to age 3.",
  },
  {
    slug: "stroller-side-by-side-couple",
    modelLine: "Side-by-Side Couple",
    categorySlug: "stroller",
    msrpCNY: 5599,
    params: { weightKg: 17, loadKg: 40, foldedSize: "82×76×34 cm", expandedSize: "125×76×110 cm" },
    certifications: ["ccc"],
    summaryZh: "并排双座推车,两个孩子相邻而坐,互相陪伴,适合家庭出行。",
    summaryEn: "Side-by-side twin stroller so two kids sit together, ideal for family outings.",
  },
  {
    slug: "stroller-budget-entry",
    modelLine: "Budget Entry",
    categorySlug: "stroller",
    msrpCNY: 699,
    params: { weightKg: 5, loadKg: 15, expandedSize: "60×48×92 cm" },
    certifications: ["ccc"],
    summaryZh: "入门级推车,基础功能齐全,适合短期或偶尔使用的家庭。",
    summaryEn: "Entry-level stroller with basic features, ideal for occasional or short-term use.",
  },
  {
    slug: "stroller-premium-suspension",
    modelLine: "Premium Suspension",
    categorySlug: "stroller",
    msrpCNY: 4999,
    params: { weightKg: 14.5, loadKg: 23, foldedSize: "66×58×36 cm", expandedSize: "78×58×110 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "高级避震推车,多层悬挂系统,在不平路面也能给宝宝平稳的推行体验。",
    summaryEn: "Premium suspension stroller with multi-layer damping for smooth rides on rough terrain.",
  },
  {
    slug: "stroller-convertible-3in1",
    modelLine: "Convertible 3-in-1",
    categorySlug: "stroller",
    msrpCNY: 4299,
    params: { weightKg: 15, loadKg: 24, foldedSize: "68×60×34 cm", expandedSize: "80×60×108 cm" },
    certifications: ["ccc"],
    summaryZh: "三合一转换推车,睡篮+座位+车架,可随宝宝长大灵活转换。",
    summaryEn: "3-in-1 convertible stroller: bassinet, seat, and chassis adaptable as baby grows.",
  },
  {
    slug: "stroller-eco-sustainable",
    modelLine: "Eco Sustainable",
    categorySlug: "stroller",
    msrpCNY: 3899,
    params: { weightKg: 12, loadKg: 22, foldedSize: "62×54×33 cm", expandedSize: "72×54×105 cm" },
    certifications: ["ccc"],
    summaryZh: "生态环保推车,采用可回收材料和可持续设计,适合重视环保的家庭。",
    summaryEn: "Eco-friendly stroller made from recycled materials with sustainable design.",
  },
  {
    slug: "stroller-quick-fold-snap",
    modelLine: "Quick Fold Snap",
    categorySlug: "stroller",
    msrpCNY: 1699,
    params: { weightKg: 7.2, loadKg: 19, foldedSize: "54×48×32 cm", expandedSize: "68×52×102 cm" },
    certifications: ["ccc"],
    summaryZh: "速冻推车,一键快速折叠,适合上班族快速上班与接送。",
    summaryEn: "Quick-fold stroller with one-button collapse for busy parents on-the-go.",
  },
  {
    slug: "stroller-boutique-luxury",
    modelLine: "Boutique Luxury",
    categorySlug: "stroller",
    msrpCNY: 6999,
    params: { weightKg: 16, loadKg: 24, foldedSize: "70×62×38 cm", expandedSize: "85×62×115 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "奢侈品定制推车,欧洲设计与材料,支持个性化定制,产品质量顶级。",
    summaryEn: "Luxury boutique stroller with European design, customizable, top-tier quality.",
  },
  {
    slug: "stroller-lightweight-magnesium",
    modelLine: "Lightweight Magnesium",
    categorySlug: "stroller",
    msrpCNY: 2199,
    params: { weightKg: 5.5, loadKg: 17, foldedSize: "52×40×30 cm", expandedSize: "65×48×98 cm" },
    certifications: ["ccc"],
    summaryZh: "镁合金轻量推车,结构坚固却重量极轻,便于单手推行与折收。",
    summaryEn: "Magnesium alloy lightweight stroller, sturdy yet ultra-light for easy one-handed operation.",
  },
  {
    slug: "stroller-special-needs-adaptive",
    modelLine: "Special Needs Adaptive",
    categorySlug: "stroller",
    msrpCNY: 7899,
    params: { weightKg: 20, loadKg: 30, expandedSize: "92×72×120 cm" },
    certifications: ["ccc"],
    summaryZh: "特殊需求适配推车,可调座椅与头枕,设计考虑物理与发育需求。",
    summaryEn: "Special needs adaptive stroller with adjustable seating and headrest for developmental support.",
  },
  {
    slug: "stroller-rain-cover-bundle",
    modelLine: "Rain Cover Bundle",
    categorySlug: "stroller",
    msrpCNY: 1599,
    params: { weightKg: 5.8, loadKg: 16, foldedSize: "50×42×30 cm", expandedSize: "64×48×96 cm" },
    certifications: ["ccc"],
    summaryZh: "防雨推车套装,包含推车与防雨罩,适合多雨季节使用。",
    summaryEn: "Rain-cover bundle stroller package, perfect for rainy seasons.",
  },
  {
    slug: "stroller-ventilation-mesh",
    modelLine: "Ventilation Mesh",
    categorySlug: "stroller",
    msrpCNY: 2799,
    params: { weightKg: 10.5, loadKg: 20, foldedSize: "58×52×32 cm", expandedSize: "70×52×105 cm" },
    certifications: ["ccc"],
    summaryZh: "网眼通风推车,全面网眼座舱设计,炎热天气不闷热,透气性好。",
    summaryEn: "Ventilated mesh stroller with breathable seat, ideal for hot weather.",
  },
  {
    slug: "stroller-recline-multi-position",
    modelLine: "Recline Multi-Position",
    categorySlug: "stroller",
    msrpCNY: 3199,
    params: { weightKg: 11.8, loadKg: 21, foldedSize: "62×56×34 cm", expandedSize: "75×56×105 cm" },
    certifications: ["ccc"],
    summaryZh: "多档位推车,支持平躺、半躺、坐立多个角度,适应不同使用场景。",
    summaryEn: "Multi-position recline stroller with flat, semi-recline and upright positions.",
  },
  {
    slug: "stroller-newborn-ready",
    modelLine: "Newborn Ready",
    categorySlug: "stroller",
    msrpCNY: 2499,
    params: { weightKg: 10, loadKg: 20, foldedSize: "60×54×32 cm", expandedSize: "72×54×102 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "新生儿就绪推车,安全座舱与防护设计,从出生第一天起可用。",
    summaryEn: "Newborn-ready stroller with safety canopy, ready from day one.",
  },
  {
    slug: "stroller-urban-compact-sleek",
    modelLine: "Urban Compact Sleek",
    categorySlug: "stroller",
    msrpCNY: 2399,
    params: { weightKg: 8.5, loadKg: 18, foldedSize: "52×48×30 cm", expandedSize: "66×50×100 cm" },
    certifications: ["ccc"],
    summaryZh: "城市简约推车,设计简洁现代,适合城市年轻父母的美学需求。",
    summaryEn: "Urban sleek stroller with modern design, perfect for style-conscious city parents.",
  },
  {
    slug: "stroller-weekend-getaway",
    modelLine: "Weekend Getaway",
    categorySlug: "stroller",
    msrpCNY: 1799,
    params: { weightKg: 6.5, loadKg: 17, foldedSize: "50×45×28 cm", expandedSize: "64×50×98 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "周末出行推车,轻便易收纳,适合短途旅行与家庭周末活动。",
    summaryEn: "Weekend getaway stroller, lightweight and compact for short trips.",
  },
  {
    slug: "stroller-storage-cargo-max",
    modelLine: "Storage Cargo Max",
    categorySlug: "stroller",
    msrpCNY: 2899,
    params: { weightKg: 12, loadKg: 24, foldedSize: "64×56×34 cm", expandedSize: "75×56×108 cm" },
    certifications: ["ccc"],
    summaryZh: "大容量储物推车,底部与侧面储物篮设计,满足购物与长途出行需求。",
    summaryEn: "Max cargo stroller with generous undercarriage and side baskets for shopping and travel.",
  },
];

// ============ SCOOTER PRODUCTS (20) ============
const SCOOTER_PRODUCTS: ProductSeed[] = [
  {
    slug: "scooter-three-wheel-beginner",
    modelLine: "Three-Wheel Beginner",
    categorySlug: "scooter",
    msrpCNY: 299,
    params: { weightKg: 2.5, loadKg: 30, expandedSize: "65×30×72 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "三轮滑板车,稳定性强,适合 3-5 岁初学者平衡和滑行训练。",
    summaryEn: "Three-wheel scooter with high stability, ideal for balance training for ages 3-5.",
  },
  {
    slug: "scooter-adjustable-height",
    modelLine: "Adjustable Height",
    categorySlug: "scooter",
    msrpCNY: 449,
    params: { weightKg: 3.2, loadKg: 40, expandedSize: "62×32×62–82 cm" },
    certifications: ["ccc"],
    summaryZh: "可调节高度滑板车,支持儿童从 3 岁长期使用至 8 岁,随长随调。",
    summaryEn: "Height-adjustable scooter that grows with your child from age 3 to 8.",
  },
  {
    slug: "scooter-light-led-wheels",
    modelLine: "Light LED Wheels",
    categorySlug: "scooter",
    msrpCNY: 599,
    params: { weightKg: 3.8, loadKg: 50, expandedSize: "66×34×85 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "发光轮滑板车,轮子自发光,晚间骑行更安全,增加骑行趣味。",
    summaryEn: "LED-wheel scooter that glows while riding for nighttime visibility and fun.",
  },
  {
    slug: "scooter-kick-style-foldable",
    modelLine: "Kick Style Foldable",
    categorySlug: "scooter",
    msrpCNY: 399,
    params: { weightKg: 3, loadKg: 45, foldedSize: "62×20×20 cm", expandedSize: "62×30×85 cm" },
    certifications: ["ccc"],
    summaryZh: "轻便可折叠滑板车,可快速折叠收纳,适合携带和旅行使用。",
    summaryEn: "Lightweight foldable kick scooter, quick collapse for portability.",
  },
  {
    slug: "scooter-stunt-trick-advanced",
    modelLine: "Stunt Trick Advanced",
    categorySlug: "scooter",
    msrpCNY: 799,
    params: { weightKg: 4.5, loadKg: 60, expandedSize: "62×32×88 cm" },
    certifications: ["cpsc", "astm_f833"],
    summaryZh: "特技滑板车,加强车架与轮子,支持高难度动作与跳跃,适合 7 岁以上。",
    summaryEn: "Stunt scooter with reinforced frame for tricks and jumps, for ages 7+.",
  },
  {
    slug: "scooter-electric-beginner-kick",
    modelLine: "Electric Beginner Kick",
    categorySlug: "scooter",
    msrpCNY: 1299,
    params: { weightKg: 11, loadKg: 50, expandedSize: "82×42×95 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "电动辅助滑板车,内置电机与低速辅助,儿童可省力骑行,续航约 2 小时。",
    summaryEn: "Electric-assist scooter with motor and low-speed mode, extended range of ~2 hours.",
  },
  {
    slug: "scooter-double-deck-wide",
    modelLine: "Double Deck Wide",
    categorySlug: "scooter",
    msrpCNY: 649,
    params: { weightKg: 4, loadKg: 55, expandedSize: "72×36×86 cm" },
    certifications: ["ccc"],
    summaryZh: "宽踏板滑板车,双层防滑踏板,两脚都能踩稳,适合初学者。",
    summaryEn: "Wide double-deck scooter with non-slip surface for both feet, beginner-friendly.",
  },
  {
    slug: "scooter-hand-brake-safe",
    modelLine: "Hand Brake Safe",
    categorySlug: "scooter",
    msrpCNY: 699,
    params: { weightKg: 3.5, loadKg: 50, expandedSize: "68×33×87 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "手刹滑板车,配备安全手刹,快速停止,增加操控安全性。",
    summaryEn: "Hand-brake scooter with quick-stop safety brake for better control.",
  },
  {
    slug: "scooter-suspension-smooth-ride",
    modelLine: "Suspension Smooth Ride",
    categorySlug: "scooter",
    msrpCNY: 899,
    params: { weightKg: 4.2, loadKg: 55, expandedSize: "70×34×90 cm" },
    certifications: ["ccc"],
    summaryZh: "避震滑板车,前后避震系统,在不平路面骑行也平稳舒适。",
    summaryEn: "Suspension scooter with front and rear damping for smooth rides on rough surfaces.",
  },
  {
    slug: "scooter-compact-mini-travel",
    modelLine: "Compact Mini Travel",
    categorySlug: "scooter",
    msrpCNY: 349,
    params: { weightKg: 2, loadKg: 35, foldedSize: "58×16×18 cm", expandedSize: "58×28×72 cm" },
    certifications: ["ccc"],
    summaryZh: "迷你便携滑板车,轻盈小巧,适合短途外出和旅行携带。",
    summaryEn: "Compact mini scooter, ultra-light and portable for easy travel.",
  },
  {
    slug: "scooter-terrain-all-terrain-wheels",
    modelLine: "All-Terrain Wheels",
    categorySlug: "scooter",
    msrpCNY: 749,
    params: { weightKg: 4.8, loadKg: 60, expandedSize: "72×36×92 cm" },
    certifications: ["ccc"],
    summaryZh: "越野滑板车,大轮径与气胎设计,适合砂土、草地等复杂地形。",
    summaryEn: "All-terrain scooter with large pneumatic tires for sand, grass, and rough terrain.",
  },
  {
    slug: "scooter-ride-along-parent",
    modelLine: "Ride-Along Parent",
    categorySlug: "scooter",
    msrpCNY: 549,
    params: { weightKg: 3.8, loadKg: 70, expandedSize: "68×36×92 cm" },
    certifications: ["ccc"],
    summaryZh: "亲子滑板车,后部有家长站立平台,家长可陪同或助力。",
    summaryEn: "Parent ride-along scooter with standing platform for parent supervision or assist.",
  },
  {
    slug: "scooter-design-colorful-themed",
    modelLine: "Design Colorful Themed",
    categorySlug: "scooter",
    msrpCNY: 429,
    params: { weightKg: 3.2, loadKg: 42, expandedSize: "64×32×82 cm" },
    certifications: ["ccc"],
    summaryZh: "卡通主题滑板车,鲜艳配色与卡通设计,受小孩欢迎,多种主题可选。",
    summaryEn: "Colorful themed scooter with cartoon designs, available in multiple character themes.",
  },
  {
    slug: "scooter-maintenance-free-sealed",
    modelLine: "Maintenance Free Sealed",
    categorySlug: "scooter",
    msrpCNY: 649,
    params: { weightKg: 3.6, loadKg: 50, expandedSize: "66×33×86 cm" },
    certifications: ["ccc"],
    summaryZh: "免维护滑板车,轮子密封,不需要定期充气或维护,长期好用。",
    summaryEn: "Maintenance-free scooter with sealed wheels, no pumping needed.",
  },
  {
    slug: "scooter-racing-performance",
    modelLine: "Racing Performance",
    categorySlug: "scooter",
    msrpCNY: 1099,
    params: { weightKg: 5, loadKg: 65, expandedSize: "70×34×90 cm" },
    certifications: ["cpsc"],
    summaryZh: "竞赛级滑板车,轻量化高性能,适合滑板车竞技比赛与高速骑行。",
    summaryEn: "Racing-grade scooter with high performance, ideal for competitions.",
  },
  {
    slug: "scooter-beginner-stability-wheels",
    modelLine: "Beginner Stability Wheels",
    categorySlug: "scooter",
    msrpCNY: 379,
    params: { weightKg: 2.8, loadKg: 35, expandedSize: "64×32×76 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "初学稳定滑板车,四轮设计,两边后轮可拆卸,循序渐进学习。",
    summaryEn: "Beginner stability scooter with removable training wheels for gradual learning.",
  },
  {
    slug: "scooter-eco-recycled-material",
    modelLine: "Eco Recycled Material",
    categorySlug: "scooter",
    msrpCNY: 499,
    params: { weightKg: 3.3, loadKg: 45, expandedSize: "65×32×84 cm" },
    certifications: ["ccc"],
    summaryZh: "环保回收材料滑板车,采用可回收塑料和环保漆,适合环保家庭。",
    summaryEn: "Eco scooter made from recycled materials, perfect for environmentally conscious families.",
  },
  {
    slug: "scooter-premium-aluminum-frame",
    modelLine: "Premium Aluminum Frame",
    categorySlug: "scooter",
    msrpCNY: 899,
    params: { weightKg: 3.6, loadKg: 60, expandedSize: "68×33×88 cm" },
    certifications: ["ccc"],
    summaryZh: "铝合金滑板车,框架轻且耐久,品质稳定,适合长期使用。",
    summaryEn: "Premium aluminum frame scooter, lightweight yet durable for long-term use.",
  },
  {
    slug: "scooter-outdoor-adventure-rugged",
    modelLine: "Outdoor Adventure Rugged",
    categorySlug: "scooter",
    msrpCNY: 799,
    params: { weightKg: 4.6, loadKg: 58, expandedSize: "70×35×89 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "户外冒险滑板车,加强车架与防护,适合山地、公园等野外环境。",
    summaryEn: "Rugged outdoor adventure scooter with reinforced frame for trails and parks.",
  },
];

// ============ BICYCLE PRODUCTS (15) ============
const BICYCLE_PRODUCTS: ProductSeed[] = [
  {
    slug: "bicycle-balance-no-pedals",
    modelLine: "Balance No-Pedals",
    categorySlug: "bicycle",
    msrpCNY: 299,
    params: { weightKg: 3.5, loadKg: 25, expandedSize: "90×45×60 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "儿童平衡车,无踏板设计,两脚蹬地,帮助孩子学习平衡,过渡到自行车。",
    summaryEn: "Balance bike without pedals, helps children learn balance before regular cycling.",
  },
  {
    slug: "bicycle-trainer-wheel-pedal",
    modelLine: "Trainer Wheel Pedal",
    categorySlug: "bicycle",
    msrpCNY: 449,
    params: { weightKg: 7, loadKg: 30, expandedSize: "106×54×72 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "带辅助轮儿童自行车,16 寸车轮,可拆卸辅助轮,适合 4-6 岁儿童。",
    summaryEn: "16-inch kids bike with removable training wheels for ages 4-6.",
  },
  {
    slug: "bicycle-lightweight-aluminum",
    modelLine: "Lightweight Aluminum",
    categorySlug: "bicycle",
    msrpCNY: 699,
    params: { weightKg: 6, loadKg: 35, expandedSize: "108×56×74 cm" },
    certifications: ["ccc"],
    summaryZh: "轻量铝合金儿童车,18 寸或 20 寸可选,轻便易骑,适合 5-8 岁。",
    summaryEn: "Lightweight aluminum kids bike, 18–20 inch options, for ages 5-8.",
  },
  {
    slug: "bicycle-mountain-terrain",
    modelLine: "Mountain Terrain",
    categorySlug: "bicycle",
    msrpCNY: 899,
    params: { weightKg: 8.5, loadKg: 40, expandedSize: "116×60×78 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "儿童山地车,20 寸越野轮胎,多档变速,适合探索户外的孩子。",
    summaryEn: "Kids mountain bike with 20-inch terrain tires and multi-speed gears.",
  },
  {
    slug: "bicycle-road-speed",
    modelLine: "Road Speed",
    categorySlug: "bicycle",
    msrpCNY: 799,
    params: { weightKg: 7.5, loadKg: 35, expandedSize: "114×54×76 cm" },
    certifications: ["ccc"],
    summaryZh: "儿童公路自行车,20 寸细轮,轻盈快速,适合道路与公园骑行。",
    summaryEn: "Kids road bike with 20-inch slim tires, perfect for roads and park paths.",
  },
  {
    slug: "bicycle-bmx-freestyle",
    modelLine: "BMX Freestyle",
    categorySlug: "bicycle",
    msrpCNY: 649,
    params: { weightKg: 6.8, loadKg: 38, expandedSize: "104×52×72 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "儿童 BMX 小轮车,20 寸轮径,适合特技与自由骑行爱好者。",
    summaryEn: "Kids BMX bike with 20-inch wheels, perfect for tricks and freestyle riding.",
  },
  {
    slug: "bicycle-folding-compact",
    modelLine: "Folding Compact",
    categorySlug: "bicycle",
    msrpCNY: 549,
    params: { weightKg: 6.5, loadKg: 32, foldedSize: "80×60×40 cm", expandedSize: "110×54×76 cm" },
    certifications: ["ccc"],
    summaryZh: "折叠儿童自行车,便于收纳与携带,适合家庭旅行与外出。",
    summaryEn: "Folding kids bike for easy storage and portability during travel.",
  },
  {
    slug: "bicycle-suspension-comfort",
    modelLine: "Suspension Comfort",
    categorySlug: "bicycle",
    msrpCNY: 949,
    params: { weightKg: 8.8, loadKg: 42, expandedSize: "118×62×80 cm" },
    certifications: ["ccc"],
    summaryZh: "避震儿童自行车,前后避震系统,在不平路面骑行更舒适。",
    summaryEn: "Kids bike with front and rear suspension for smoother rides on uneven terrain.",
  },
  {
    slug: "bicycle-colorful-theme-princess",
    modelLine: "Colorful Theme Princess",
    categorySlug: "bicycle",
    msrpCNY: 449,
    params: { weightKg: 7, loadKg: 30, expandedSize: "106×54×72 cm" },
    certifications: ["ccc"],
    summaryZh: "卡通主题儿童车,公主或骑士主题设计,配备流苏与贴纸,女孩最爱。",
    summaryEn: "Themed kids bike with princess design, streamers, and decals.",
  },
  {
    slug: "bicycle-single-speed-simple",
    modelLine: "Single Speed Simple",
    categorySlug: "bicycle",
    msrpCNY: 349,
    params: { weightKg: 6.5, loadKg: 28, expandedSize: "104×52×70 cm" },
    certifications: ["ccc"],
    summaryZh: "单速儿童自行车,简单耐用,无变速,维护简单,适合初学者。",
    summaryEn: "Simple single-speed kids bike, easy to maintain, perfect for beginners.",
  },
  {
    slug: "bicycle-hybrid-versatile",
    modelLine: "Hybrid Versatile",
    categorySlug: "bicycle",
    msrpCNY: 749,
    params: { weightKg: 7.8, loadKg: 36, expandedSize: "112×56×76 cm" },
    certifications: ["ccc"],
    summaryZh: "混合型儿童车,结合公路与山地特点,适合多种路面与多用途骑行。",
    summaryEn: "Hybrid kids bike combining road and terrain features for versatile riding.",
  },
  {
    slug: "bicycle-electric-assist-pedal",
    modelLine: "Electric Assist Pedal",
    categorySlug: "bicycle",
    msrpCNY: 1499,
    params: { weightKg: 12, loadKg: 45, expandedSize: "120×58×82 cm" },
    certifications: ["ccc"],
    summaryZh: "儿童电助力自行车,内置电机与辅助踏板,省力骑行,续航 1-2 小时。",
    summaryEn: "Kids electric-assist bike with pedal motor for easy extended rides.",
  },
  {
    slug: "bicycle-cruiser-casual",
    modelLine: "Cruiser Casual",
    categorySlug: "bicycle",
    msrpCNY: 599,
    params: { weightKg: 8, loadKg: 35, expandedSize: "110×56×78 cm" },
    certifications: ["ccc"],
    summaryZh: "休闲巡航儿童车,舒适座位与宽把手,轻松悠闲的骑行风格。",
    summaryEn: "Casual cruiser kids bike with comfortable seat and wide handlebars.",
  },
  {
    slug: "bicycle-premium-race-track",
    modelLine: "Premium Race Track",
    categorySlug: "bicycle",
    msrpCNY: 1199,
    params: { weightKg: 7.2, loadKg: 40, expandedSize: "116×54×80 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "竞赛级儿童自行车,轻量化高性能,支持自行车竞速与公路赛。",
    summaryEn: "Premium race-grade kids bike for cycling competitions.",
  },
  {
    slug: "bicycle-eco-bamboo-frame",
    modelLine: "Eco Bamboo Frame",
    categorySlug: "bicycle",
    msrpCNY: 899,
    params: { weightKg: 7.5, loadKg: 33, expandedSize: "110×54×76 cm" },
    certifications: ["ccc"],
    summaryZh: "竹框架儿童车,环保竹材料,设计独特,适合重视生态的家庭。",
    summaryEn: "Eco-friendly bamboo frame kids bike for environmentally conscious families.",
  },
];

// ============ ELECTRIC BIKE PRODUCTS (23 - already seeded) ============
// These are the existing 23 products from the previous seeding phase

// ============ ELECTRIC CAR PRODUCTS (20) ============
const ELECTRIC_CAR_PRODUCTS: ProductSeed[] = [
  {
    slug: "electric-car-ride-on-12v",
    modelLine: "Ride-on 12V",
    categorySlug: "electric-car",
    msrpCNY: 1299,
    params: { weightKg: 18, loadKg: 35, expandedSize: "118×72×65 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "12V 儿童电动乘骑车,支持家长遥控与儿童自驾,缓启动与软刹车,适合 3-6 岁。",
    summaryEn: "12V kids electric ride-on with parent remote and kid self-drive modes for ages 3-6.",
  },
  {
    slug: "electric-car-jeep-SUV-style",
    modelLine: "Jeep SUV Style",
    categorySlug: "electric-car",
    msrpCNY: 1599,
    params: { weightKg: 20, loadKg: 40, expandedSize: "122×74×68 cm" },
    certifications: ["ccc"],
    summaryZh: "Jeep 风格儿童电动车,24V 电池,越野轮胎,支持双人乘坐,适合户外冒险。",
    summaryEn: "Jeep-style electric ride-on with 24V battery, off-road tires, seats two kids.",
  },
  {
    slug: "electric-car-sports-car-coupe",
    modelLine: "Sports Car Coupe",
    categorySlug: "electric-car",
    msrpCNY: 1899,
    params: { weightKg: 22, loadKg: 38, expandedSize: "128×68×55 cm" },
    certifications: ["ccc", "cpsc"],
    summaryZh: "跑车风格儿童电动车,低车身与流线型设计,24V 双电机,性能强劲。",
    summaryEn: "Sports car-style ride-on with sleek design and dual 24V motors.",
  },
  {
    slug: "electric-car-double-seater",
    modelLine: "Double Seater",
    categorySlug: "electric-car",
    msrpCNY: 2299,
    params: { weightKg: 28, loadKg: 60, expandedSize: "135×82×78 cm" },
    certifications: ["ccc"],
    summaryZh: "双座儿童电动车,前后两个独立座位,24V 配置,亲子或兄妹共乘乐趣。",
    summaryEn: "Two-seat electric ride-on with independent front and back seats, 24V system.",
  },
  {
    slug: "electric-car-tractor-farm-style",
    modelLine: "Tractor Farm Style",
    categorySlug: "electric-car",
    msrpCNY: 1199,
    params: { weightKg: 16, loadKg: 32, expandedSize: "110×66×62 cm" },
    certifications: ["ccc"],
    summaryZh: "农场拖拉机风格儿童电动车,12V 电池,宽轮胎,适合农庄或乡村场景。",
    summaryEn: "Tractor-style electric ride-on with 12V battery and wide tires for farm scenarios.",
  },
  {
    slug: "electric-car-racing-formula",
    modelLine: "Racing Formula",
    categorySlug: "electric-car",
    msrpCNY: 2499,
    params: { weightKg: 24, loadKg: 42, expandedSize: "130×70×58 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "方程式赛车风格,24V 双电机,高性能加速,适合追求速度感的孩子。",
    summaryEn: "Formula racing-style with dual 24V motors for high-performance acceleration.",
  },
  {
    slug: "electric-car-police-patrol",
    modelLine: "Police Patrol",
    categorySlug: "electric-car",
    msrpCNY: 1499,
    params: { weightKg: 20, loadKg: 36, expandedSize: "118×70×65 cm" },
    certifications: ["ccc"],
    summaryZh: "警车风格儿童电动车,配备警车喇叭音效与闪灯,12V 电池,角色扮演。",
    summaryEn: "Police car-style ride-on with siren sounds and lights, 12V battery, role-play fun.",
  },
  {
    slug: "electric-car-truck-pickup",
    modelLine: "Truck Pickup",
    categorySlug: "electric-car",
    msrpCNY: 1699,
    params: { weightKg: 21, loadKg: 38, expandedSize: "125×76×70 cm" },
    certifications: ["ccc"],
    summaryZh: "皮卡货车风格,24V 电池,后部有开放货厢,儿童可运输玩具或物品。",
    summaryEn: "Pickup truck-style with 24V battery and open cargo bed for play.",
  },
  {
    slug: "electric-car-construction-dump",
    modelLine: "Construction Dump",
    categorySlug: "electric-car",
    msrpCNY: 1899,
    params: { weightKg: 25, loadKg: 40, expandedSize: "128×78×72 cm" },
    certifications: ["ccc"],
    summaryZh: "工程车自卸车风格,可举升后厢,儿童可体验工程车操作乐趣。",
    summaryEn: "Dump truck-style with lifting cargo bed for construction play.",
  },
  {
    slug: "electric-car-quad-atv",
    modelLine: "Quad ATV",
    categorySlug: "electric-car",
    msrpCNY: 1099,
    params: { weightKg: 15, loadKg: 30, expandedSize: "96×62×64 cm" },
    certifications: ["ccc"],
    summaryZh: "四轮越野车风格,低速档位与宽轮胎,适合沙滩与草地。",
    summaryEn: "Quad ATV-style with low-speed mode and wide tires for sand and grass.",
  },
  {
    slug: "electric-car-vintage-classic",
    modelLine: "Vintage Classic",
    categorySlug: "electric-car",
    msrpCNY: 1699,
    params: { weightKg: 19, loadKg: 35, expandedSize: "116×68×62 cm" },
    certifications: ["ccc"],
    summaryZh: "复古经典风格,圆形车灯与古色车身设计,温馨复古感。",
    summaryEn: "Vintage classic-style with retro round lights and nostalgic design.",
  },
  {
    slug: "electric-car-convertible-roadster",
    modelLine: "Convertible Roadster",
    categorySlug: "electric-car",
    msrpCNY: 2099,
    params: { weightKg: 22, loadKg: 36, expandedSize: "124×72×60 cm" },
    certifications: ["ccc"],
    summaryZh: "敞篷跑车风格,可伸缩遮阳篷,24V 电池,开放式驾驶体验。",
    summaryEn: "Convertible roadster with retractable canopy and 24V power.",
  },
  {
    slug: "electric-car-monster-truck",
    modelLine: "Monster Truck",
    categorySlug: "electric-car",
    msrpCNY: 1799,
    params: { weightKg: 23, loadKg: 42, expandedSize: "130×76×85 cm" },
    certifications: ["ccc", "astm_f833"],
    summaryZh: "怪兽卡车风格,超大轮胎与高车身,越野性能强,适合冒险爱好者。",
    summaryEn: "Monster truck-style with oversized wheels and high ground clearance.",
  },
  {
    slug: "electric-car-luxury-limousine",
    modelLine: "Luxury Limousine",
    categorySlug: "electric-car",
    msrpCNY: 3299,
    params: { weightKg: 30, loadKg: 50, expandedSize: "150×78×70 cm" },
    certifications: ["ccc"],
    summaryZh: "豪华礼车风格,加长车身与双座配置,豪华内饰,仪式感十足。",
    summaryEn: "Luxury limousine-style with extended body and premium interior.",
  },
  {
    slug: "electric-car-taxi-yellow-cab",
    modelLine: "Taxi Yellow Cab",
    categorySlug: "electric-car",
    msrpCNY: 1399,
    params: { weightKg: 18, loadKg: 34, expandedSize: "112×68×64 cm" },
    certifications: ["ccc"],
    summaryZh: "出租车黄色风格,标志性黄色与车顶灯,角色扮演出租车司机。",
    summaryEn: "Taxi-style yellow cab with classic design and roof light.",
  },
  {
    slug: "electric-car-fire-truck",
    modelLine: "Fire Truck",
    categorySlug: "electric-car",
    msrpCNY: 1599,
    params: { weightKg: 21, loadKg: 38, expandedSize: "125×70×72 cm" },
    certifications: ["ccc"],
    summaryZh: "消防车风格,红色车身与闪灯,配备消防车音效,英雄角色扮演。",
    summaryEn: "Fire truck-style with red body, flashing lights and siren sounds.",
  },
  {
    slug: "electric-car-eco-green-energy",
    modelLine: "Eco Green Energy",
    categorySlug: "electric-car",
    msrpCNY: 1499,
    params: { weightKg: 17, loadKg: 32, expandedSize: "115×68×64 cm" },
    certifications: ["ccc"],
    summaryZh: "生态绿能风格,采用环保材料与可持续设计,绿色出行理念。",
    summaryEn: "Eco green-energy style with sustainable materials and eco-friendly design.",
  },
  {
    slug: "electric-car-space-rocket",
    modelLine: "Space Rocket",
    categorySlug: "electric-car",
    msrpCNY: 1999,
    params: { weightKg: 20, loadKg: 36, expandedSize: "116×68×75 cm" },
    certifications: ["ccc"],
    summaryZh: "太空火箭风格,未来科技感外观与 LED 光效,太空探险幻想。",
    summaryEn: "Space rocket-style with futuristic design and LED light effects.",
  },
  {
    slug: "electric-car-batmobile-hero",
    modelLine: "Batmobile Hero",
    categorySlug: "electric-car",
    msrpCNY: 1899,
    params: { weightKg: 22, loadKg: 40, expandedSize: "124×72×66 cm" },
    certifications: ["ccc"],
    summaryZh: "蝙蝠侠风格,黑色流线型与英雄感,24V 高性能,角色英雄梦。",
    summaryEn: "Batmobile hero-style with sleek black design and 24V performance.",
  },
  {
    slug: "electric-car-camping-rv",
    modelLine: "Camping RV",
    categorySlug: "electric-car",
    msrpCNY: 1499,
    params: { weightKg: 19, loadKg: 36, expandedSize: "120×72×72 cm" },
    certifications: ["ccc"],
    summaryZh: "露营房车风格,配备小车厢储物空间,家庭露营冒险。",
    summaryEn: "Camping RV-style with storage compartment for adventure play.",
  },
];

// ===================================================

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
  const pool = allBrands.filter((brand) => !EXCLUDED_SAMPLE_BRAND_SLUGS.has(String(brand.slug || "")));
  if (!pool.length) throw new Error("No existing production brands are available for assignment.");
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
  console.log(`Multi-catalog seed API base: ${ACTIVE_API_BASE}`);

  const token = await ensureAdminToken();

  // Combine all product seeds by category
  const allSeeds = [
    ...STROLLER_PRODUCTS,
    ...SCOOTER_PRODUCTS,
    ...BICYCLE_PRODUCTS,
    ...ELECTRIC_CAR_PRODUCTS,
  ];

  const categoryIdBySlug = new Map<string, number>();
  for (const seed of CATEGORY_SEEDS) {
    const id = await upsertCategory(seed, token);
    categoryIdBySlug.set(seed.slug, id);
    console.log(`Upserted category: ${seed.slug} (${seed.kind}) -> ${id}`);
  }

  const allBrands = await fetchAllBrands(token);
  const assignableBrands = buildAssignableBrands(allBrands);
  console.log(
    `Brand assignment pool: ${assignableBrands.length} brands (${assignableBrands
      .map((brand) => brand.name)
      .join(", ")})`,
  );

  let count = 0;
  for (const seed of allSeeds) {
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

  console.log(`Done. ${count} products across all 5 categories are ready.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
