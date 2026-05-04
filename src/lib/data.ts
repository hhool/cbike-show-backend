import type { LocalizedString } from "@/lib/utils";

export interface Company {
  id: number;
  slug: string;
  name: LocalizedString;
  category: "brand" | "export" | "parts" | "general";
  region: string;
  scale: "small" | "medium" | "large";
  exportFlag: boolean;
  logo: string;
  gallery: string[];
  intro: LocalizedString;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  lat: number;
  lng: number;
  products: number[];
  founded: number;
}

export interface BuyLink {
  platform: "amazon" | "walmart" | "ebay" | "other";
  label: string;
  url: string;
  region?: string; // e.g. "US", "UK", "DE"
}

export interface Product {
  id: number;
  companyId: number;
  slug: string;
  name: LocalizedString;
  category: string;
  size: string;
  material: string;
  ageRange: LocalizedString;
  specs: Record<string, string>;
  retailPrice?: string;  // B2C retail price shown to consumers
  priceRange: string;    // B2B FOB reference (kept for supplier view)
  moq: number;
  leadTime: string;
  images: string[];
  intro: LocalizedString;
  isFeatured: boolean;
  certifications: string[];
  buyLinks?: BuyLink[];  // Links to Amazon / Walmart / etc.
}

export interface Article {
  id: number;
  slug: string;
  title: LocalizedString;
  category: "news" | "guide" | "interview";
  tags: LocalizedString[];
  content: string;
  featuredImg: string;
  author: string;
  publishDate: string;
  excerpt: LocalizedString;
}

export const companies: Company[] = [
  {
    id: 1,
    slug: "quzhou-star-bike",
    name: { zh: "曲周星辉童车有限公司", en: "Quzhou Xinghui Children Bicycle Co., Ltd." },
    category: "brand",
    region: "曲周镇",
    scale: "large",
    exportFlag: true,
    logo: "https://placehold.co/120x60/1e40af/ffffff?text=XH+Bike",
    gallery: [
      "https://placehold.co/800x500/e0e7ff/1e40af?text=Factory",
      "https://placehold.co/800x500/dbeafe/1d4ed8?text=Production",
      "https://placehold.co/800x500/bfdbfe/1e40af?text=Showroom",
    ],
    intro: { zh: "星辉童车成立于2002年，是曲周童车产业带的龙头企业之一，专注于儿童自行车、平衡车的研发与生产，产品远销欧美30余个国家和地区，年产值逾2亿元，拥有CE、3C等多项国际认证。", en: "Founded in 2002, Xinghui is a leading enterprise in the Quzhou children's bicycle industry belt. Focused on R&D and manufacturing of kids' bikes and balance bikes, it exports to 30+ countries across Europe and America, with annual revenue exceeding RMB 200 million and holds CE, 3C and other international certifications." },
    phone: "0310-5550001",
    email: "contact@xinghui-bike.com",
    whatsapp: "+8613800001001",
    website: "https://example.com",
    lat: 36.7731,
    lng: 114.9578,
    products: [1, 2, 3],
    founded: 2002,
  },
  {
    id: 2,
    slug: "quzhou-global-trade",
    name: { zh: "曲周环球童车贸易有限公司", en: "Quzhou Global Children Bike Trading Co., Ltd." },
    category: "export",
    region: "白寨镇",
    scale: "medium",
    exportFlag: true,
    logo: "https://placehold.co/120x60/065f46/ffffff?text=Global+Trade",
    gallery: [
      "https://placehold.co/800x500/d1fae5/065f46?text=Warehouse",
      "https://placehold.co/800x500/a7f3d0/047857?text=Export",
    ],
    intro: { zh: "环球童车贸易专注于童车出口业务，与全球50多个国家和地区的采购商建立长期合作关系，提供OEM/ODM一站式出口服务，年出口额超过5000万美元。", en: "Global Bike Trading specializes in children's bike exports, maintaining long-term partnerships with buyers in 50+ countries. It offers one-stop OEM/ODM export services with annual export revenue exceeding USD 50 million." },
    phone: "0310-5550002",
    email: "export@global-cbike.com",
    whatsapp: "+8613800001002",
    website: "https://example.com",
    lat: 36.7811,
    lng: 114.9688,
    products: [4, 5],
    founded: 2008,
  },
  {
    id: 3,
    slug: "quzhou-parts-factory",
    name: { zh: "曲周鑫达零配件厂", en: "Quzhou Xinda Parts Factory" },
    category: "parts",
    region: "安里乡",
    scale: "small",
    exportFlag: false,
    logo: "https://placehold.co/120x60/7c2d12/ffffff?text=XD+Parts",
    gallery: [
      "https://placehold.co/800x500/fef3c7/92400e?text=Workshop",
      "https://placehold.co/800x500/fde68a/b45309?text=Products",
    ],
    intro: { zh: "鑫达零配件厂专业生产儿童车架、轮毂、车把等核心零配件，为产业带内200余家整车厂提供配套服务，是曲周最大的零配件供应商之一。", en: "Xinda Parts Factory specializes in producing core bicycle components — frames, hubs, and handlebars — supplying over 200 assembly factories within the cluster. It is one of the largest parts suppliers in Quzhou." },
    phone: "0310-5550003",
    email: "parts@xinda-factory.com",
    whatsapp: "+8613800001003",
    website: "https://example.com",
    lat: 36.7621,
    lng: 114.9388,
    products: [],
    founded: 2010,
  },
  {
    id: 4,
    slug: "quzhou-dream-rider",
    name: { zh: "曲周梦骑士儿童用品有限公司", en: "Quzhou Dream Rider Children Products Co., Ltd." },
    category: "brand",
    region: "曲周镇",
    scale: "large",
    exportFlag: true,
    logo: "https://placehold.co/120x60/4c1d95/ffffff?text=DreamRider",
    gallery: [
      "https://placehold.co/800x500/ede9fe/4c1d95?text=R%26D+Center",
      "https://placehold.co/800x500/ddd6fe/5b21b6?text=Smart+Line",
    ],
    intro: { zh: "梦骑士专注于高端儿童电动车及智能平衡车研发，是河北省著名商标，产品覆盖国内外主要市场，荣获多项国家专利，在童车行业享有极高声誉。", en: "Dream Rider focuses on premium kids' electric vehicles and smart balance boards, recognized as a Hebei Province Famous Trademark. Products cover major domestic and overseas markets with numerous national patents and an outstanding industry reputation." },
    phone: "0310-5550004",
    email: "info@dreamrider.com",
    whatsapp: "+8613800001004",
    website: "https://example.com",
    lat: 36.7751,
    lng: 114.9528,
    products: [6, 7],
    founded: 2005,
  },
  {
    id: 5,
    slug: "quzhou-happy-wheel",
    name: { zh: "曲周快乐轮童车制造有限公司", en: "Quzhou Happy Wheel Bike Manufacturing Co., Ltd." },
    category: "general",
    region: "侯村乡",
    scale: "medium",
    exportFlag: true,
    logo: "https://placehold.co/120x60/be185d/ffffff?text=Happy+Wheel",
    gallery: [
      "https://placehold.co/800x500/fce7f3/be185d?text=Workshop",
    ],
    intro: { zh: "快乐轮童车制造是一家集设计、研发、生产为一体的综合型企业，主要生产儿童自行车、滑板车、扭扭车等多类产品，年产量200万辆。", en: "Happy Wheel is an integrated company covering design, R&D and manufacturing. Its main product lines include kids' bicycles, scooters, and swing cars, with an annual production capacity of 2 million units." },
    phone: "0310-5550005",
    email: "info@happywheel.com",
    whatsapp: "+8613800001005",
    website: "https://example.com",
    lat: 36.7681,
    lng: 114.9648,
    products: [8],
    founded: 2012,
  },
  {
    id: 6,
    slug: "quzhou-sunshine-baby",
    name: { zh: "曲周阳光婴童用品有限公司", en: "Quzhou Sunshine Baby Products Co., Ltd." },
    category: "export",
    region: "曲周镇",
    scale: "medium",
    exportFlag: true,
    logo: "https://placehold.co/120x60/d97706/ffffff?text=Sunshine+Baby",
    gallery: [
      "https://placehold.co/800x500/fef9c3/d97706?text=Stroller+Hall",
    ],
    intro: { zh: "阳光婴童专注于婴儿推车、儿童三轮车等母婴类产品的生产出口，产品符合欧盟EN标准，远销欧洲、中东、东南亚等地区。", en: "Sunshine Baby focuses on the production and export of strollers and kids' tricycles. All products comply with EU EN standards and are sold across Europe, the Middle East, and Southeast Asia." },
    phone: "0310-5550006",
    email: "info@sunshine-baby.com",
    whatsapp: "+8613800001006",
    website: "https://example.com",
    lat: 36.7701,
    lng: 114.9558,
    products: [9, 10],
    founded: 2015,
  },
];

export const products: Product[] = [
  {
    id: 1,
    companyId: 1,
    slug: "xinghui-14inch-aluminum-bike",
    name: { zh: "星辉 14寸铝合金儿童自行车", en: "Xinghui 14inch Aluminum Kids Bike" },
    category: "bike",
    size: "14寸",
    material: "铝合金",
    ageRange: { zh: "3-6岁", en: "Age 3–6" },
    specs: { 车架: "6061铝合金", 变速: "单速", 刹车: "V刹", 轮胎: "充气胎", 重量: "5.8kg" },
    priceRange: "$18-$25/pcs",
    moq: 200,
    leadTime: "30天",
    images: [
      "https://placehold.co/800x600/dbeafe/1e40af?text=14in+Alu+Bike",
      "https://placehold.co/800x600/bfdbfe/1d4ed8?text=Detail",
      "https://placehold.co/800x600/eff6ff/1e40af?text=Colors",
    ],
    intro: { zh: "采用航空级6061铝合金车架，轻量化设计，配备儿童专用V刹系统，安全可靠。通过CE、3C双认证，是亲子骑行的理想选择。", en: "Aerospace-grade 6061 aluminum frame, lightweight design, children-specific V-brake system. Dual CE & 3C certified — the ideal choice for parent-child riding." },
    isFeatured: true,
    certifications: ["CE", "3C"],
    retailPrice: "$89.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=kids+14+inch+aluminum+bike", region: "US" },
      { platform: "amazon", label: "Amazon UK", url: "https://www.amazon.co.uk/s?k=kids+14+inch+aluminium+bike", region: "UK" },
    ],
  },
  {
    id: 2,
    companyId: 1,
    slug: "xinghui-balance-bike-12",
    name: { zh: "星辉 12寸儿童平衡车", en: "Xinghui 12inch Balance Bike" },
    category: "balance",
    size: "12寸",
    material: "镁合金",
    ageRange: { zh: "2-5岁", en: "Age 2–5" },
    specs: { 车架: "镁合金一体成型", 车把: "可调高度", 座垫: "软质EVA", 重量: "3.2kg" },
    priceRange: "$22-$30/pcs",
    moq: 300,
    leadTime: "25天",
    images: [
      "https://placehold.co/800x600/e0e7ff/4338ca?text=Balance+Bike",
      "https://placehold.co/800x600/c7d2fe/4f46e5?text=Side+View",
    ],
    intro: { zh: "镁合金一体成型车架，重量仅3.2kg，全球最轻量儿童平衡车之一。人体工学设计，帮助宝宝快速掌握平衡感。", en: "One-piece magnesium alloy frame at only 3.2 kg — among the lightest kids' balance bikes globally. Ergonomic design helps toddlers master balance quickly." },
    isFeatured: true,
    certifications: ["CE", "EN71"],
    retailPrice: "$99.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=kids+12+inch+balance+bike+magnesium", region: "US" },
      { platform: "amazon", label: "Amazon DE", url: "https://www.amazon.de/s?k=laufrad+kinder+magnesium+12+zoll", region: "DE" },
    ],
  },
  {
    id: 3,
    companyId: 1,
    slug: "xinghui-20inch-steel-bike",
    name: { zh: "星辉 20寸高碳钢儿童自行车", en: "Xinghui 20inch Steel Kids Bike" },
    category: "bike",
    size: "20寸",
    material: "高碳钢",
    ageRange: { zh: "7-12岁", en: "Age 7–12" },
    specs: { 车架: "高碳钢", 变速: "7速Shimano", 刹车: "碟刹", 轮胎: "防滑宽胎", 重量: "9.5kg" },
    priceRange: "$35-$55/pcs",
    moq: 150,
    leadTime: "35天",
    images: ["https://placehold.co/800x600/dcfce7/166534?text=20in+Steel+Bike"],
    intro: { zh: "配备7速Shimano变速系统，前后碟刹，适合大龄儿童日常骑行与越野体验，耐用度高。", en: "7-speed Shimano drivetrain with front and rear disc brakes. Built for older children's daily rides and off-road adventures. Highly durable." },
    isFeatured: false,
    certifications: ["CE", "3C"],
  },
  {
    id: 4,
    companyId: 2,
    slug: "global-scooter-pro",
    name: { zh: "环球 儿童折叠滑板车", en: "Global Foldable Kids Scooter" },
    category: "scooter",
    size: "标准",
    material: "铝合金",
    ageRange: { zh: "5-12岁", en: "Age 5–12" },
    specs: { 折叠方式: "一键折叠", 轮子: "PU发光轮", 刹车: "脚踩刹车", 承重: "50kg", 重量: "2.8kg" },
    priceRange: "$12-$18/pcs",
    moq: 500,
    leadTime: "20天",
    images: ["https://placehold.co/800x600/fef9c3/a16207?text=Scooter"],
    intro: { zh: "一键折叠设计，便于携带出行。PU发光轮夜间炫酷，脚踩式后刹安全可靠，深受家长和孩子喜爱。", en: "One-click fold for easy portability. PU light-up wheels look great at night; rear foot brake provides reliable stopping. A bestseller loved by kids and parents." },
    isFeatured: true,
    certifications: ["CE"],
    retailPrice: "$49.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=kids+foldable+scooter+light+up+wheels", region: "US" },
      { platform: "amazon", label: "Amazon UK", url: "https://www.amazon.co.uk/s?k=kids+foldable+scooter+light+up", region: "UK" },
    ],
  },
  {
    id: 5,
    companyId: 2,
    slug: "global-swing-car",
    name: { zh: "环球 儿童扭扭车", en: "Global Kids Swing Car" },
    category: "ride-on",
    size: "标准",
    material: "加厚PP塑料",
    ageRange: { zh: "1-4岁", en: "Age 1–4" },
    specs: { 材质: "加厚环保PP", 轮子: "静音万向轮", 承重: "30kg", 颜色: "红/蓝/粉" },
    priceRange: "$8-$12/pcs",
    moq: 1000,
    leadTime: "15天",
    images: ["https://placehold.co/800x600/fce7f3/be185d?text=Swing+Car"],
    intro: { zh: "采用加厚环保PP材质，无需电池，靠腰部扭动前进，锻炼孩子协调能力与平衡感，是1-4岁宝宝的热门玩具。", en: "Reinforced eco-friendly PP, battery-free. Waist-twisting motion drives the car forward, training coordination and balance. A bestselling toy for ages 1–4." },
    isFeatured: true,
    certifications: ["3C", "EN71"],
    retailPrice: "$34.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=kids+wiggle+car+ride+on", region: "US" },
      { platform: "walmart", label: "Walmart", url: "https://www.walmart.com/search?q=kids+wiggle+car" },
    ],
  },
  {
    id: 6,
    companyId: 4,
    slug: "dreamrider-electric-4wheel",
    name: { zh: "梦骑士 儿童四轮电动汽车", en: "Dream Rider Kids Electric 4-Wheel Car" },
    category: "electric",
    size: "标准",
    material: "ABS工程塑料+钢架",
    ageRange: { zh: "2-6岁", en: "Age 2–6" },
    specs: { 电池: "12V7AH", 最高速: "5km/h", 遥控: "2.4G父母遥控", 座椅: "双人座", 充电时间: "8-10小时" },
    priceRange: "$45-$80/pcs",
    moq: 100,
    leadTime: "40天",
    images: [
      "https://placehold.co/800x600/ede9fe/5b21b6?text=Electric+Car",
      "https://placehold.co/800x600/ddd6fe/4c1d95?text=Interior",
    ],
    intro: { zh: "仿真豪华车型设计，2.4G父母遥控，安全限速5km/h，配备安全带、LED大灯、音乐播放等功能，孩子驾驶乐趣十足。", en: "Luxury car body design with 2.4G parental remote, 5 km/h speed limit, seat belt, LED headlights, and music playback for full driving fun." },
    isFeatured: true,
    certifications: ["3C", "CE"],
    retailPrice: "$199.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=kids+electric+ride+on+car+12v+remote+control", region: "US" },
      { platform: "amazon", label: "Amazon UK", url: "https://www.amazon.co.uk/s?k=kids+electric+ride+on+car+12v+remote", region: "UK" },
    ],
  },
  {
    id: 7,
    companyId: 4,
    slug: "dreamrider-smart-balance",
    name: { zh: "梦骑士 智能两轮电动平衡车", en: "Dream Rider Smart Electric Balance Board" },
    category: "electric",
    size: "标准",
    material: "铝合金+ABS",
    ageRange: { zh: "6-14岁", en: "Age 6–14" },
    specs: { 电池: "36V4.4AH锂电", 续航: "15-20km", 最高速: "12km/h", 防水: "IPX4", 重量: "9kg" },
    priceRange: "$80-$120/pcs",
    moq: 50,
    leadTime: "45天",
    images: ["https://placehold.co/800x600/fef3c7/d97706?text=Smart+Balance"],
    intro: { zh: "智能陀螺仪平衡系统，脚控前进转向，APP蓝牙连接，支持速度限制和骑行数据记录，是青少年出行的时尚选择。", en: "Smart gyroscope balancing, foot-controlled steering, Bluetooth app with speed limit and ride-data recording. A stylish ride for teens." },
    isFeatured: false,
    certifications: ["CE", "UL2272"],
  },
  {
    id: 8,
    companyId: 5,
    slug: "happywheel-16inch-bike",
    name: { zh: "快乐轮 16寸镁合金儿童自行车", en: "Happy Wheel 16inch Magnesium Kids Bike" },
    category: "bike",
    size: "16寸",
    material: "镁合金",
    ageRange: { zh: "4-8岁", en: "Age 4–8" },
    specs: { 车架: "镁合金一体成型", 变速: "单速", 刹车: "前V刹+后轮刹", 重量: "6.5kg" },
    priceRange: "$28-$40/pcs",
    moq: 200,
    leadTime: "30天",
    images: ["https://placehold.co/800x600/d1fae5/065f46?text=16in+Mg+Bike"],
    intro: { zh: "镁合金整体成型车架，无焊接点，强度高重量轻，是儿童自行车中的高端选择，适合4-8岁儿童日常使用。", en: "One-piece magnesium alloy frame with no weld points — high strength, low weight. A premium pick in the kids' bike category for ages 4–8." },
    isFeatured: true,
    certifications: ["CE", "3C"],
    retailPrice: "$129.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=kids+16+inch+magnesium+bike", region: "US" },
      { platform: "amazon", label: "Amazon CA", url: "https://www.amazon.ca/s?k=kids+16+inch+magnesium+bike", region: "CA" },
    ],
  },
  {
    id: 9,
    companyId: 6,
    slug: "sunshine-baby-stroller",
    name: { zh: "阳光婴童 轻便折叠婴儿推车", en: "Sunshine Baby Lightweight Folding Stroller" },
    category: "stroller",
    size: "标准",
    material: "铝合金车架+牛津布",
    ageRange: { zh: "0-3岁", en: "Age 0–3" },
    specs: { 折叠方式: "一键折叠", 车篷: "UPF50+遮阳", 承重: "25kg", 展开尺寸: "82×52×102cm", 折叠尺寸: "82×52×30cm" },
    priceRange: "$35-$60/pcs",
    moq: 200,
    leadTime: "35天",
    images: ["https://placehold.co/800x600/fef9c3/a16207?text=Stroller"],
    intro: { zh: "铝合金轻量化车架，重量仅5.5kg，一键折叠收合，可放入汽车后备厢。UPF50+遮阳篷，保护宝宝免受紫外线伤害。", en: "Lightweight aluminum frame at just 5.5 kg; one-click fold fits in a car trunk. UPF50+ canopy protects baby from UV rays." },
    isFeatured: false,
    certifications: ["CE", "EN1888"],
  },
  {
    id: 10,
    companyId: 6,
    slug: "sunshine-camping-stroller",
    name: { zh: "阳光婴童 户外露营折叠推车", en: "Sunshine Baby Outdoor Camping Folding Wagon" },
    category: "stroller",
    size: "大号",
    material: "牛津600D防水布+钢管",
    ageRange: { zh: "0-6岁", en: "Age 0–6" },
    specs: { 承重: "80kg", 容量: "120L", 折叠方式: "侧折", 轮子: "充气大轮", 附件: "遮阳篷+储物袋" },
    priceRange: "$55-$90/pcs",
    moq: 100,
    leadTime: "40天",
    images: ["https://placehold.co/800x600/dcfce7/166534?text=Wagon"],
    intro: { zh: "专为户外露营设计的多功能折叠推车，承重80kg，大容量储物空间，充气轮适合各种地形，是家庭户外出游的必备好物。", en: "Multi-function folding wagon for outdoor camping, 80 kg load capacity, large storage space, pneumatic wheels for all terrains. A must-have for family outings." },
    isFeatured: false,
    certifications: ["CE"],
  },
  // ── New products: id 11-18 ──────────────────────────────────────────────
  {
    id: 11,
    companyId: 6,
    slug: "sunshine-tricycle-3in1",
    name: { zh: "阳光婴童 三合一变形三轮车", en: "Sunshine Baby 3-in-1 Convertible Trike" },
    category: "tricycle",
    size: "标准",
    material: "加厚PP + 钢管推杆",
    ageRange: { zh: "1-5岁", en: "Age 1–5" },
    specs: { 推杆: "可拆卸父母推杆", 座椅: "带护栏安全座", 脚踏: "可拆卸踏板", 变形: "推车→三轮→滑行车", 承重: "25kg" },
    priceRange: "$28-$45/pcs",
    moq: 300,
    leadTime: "25天",
    images: [
      "https://images.unsplash.com/photo-1595052118104-78aa35ca4cb5?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "三合一变形设计，出生至5岁全阶段陪伴。初期父母推杆操控方向，宝宝长大后拆除推杆独立踩踏，最终变形为滑行车锻炼平衡感。符合EN71安全标准，无毒环保PP材质。", en: "3-in-1 convertible design that grows with your child from 1 to 5 years. Start with the parental push bar for steering control, remove it as your toddler develops, and finally convert to a glider for balance training. EN71 compliant, BPA-free PP material." },
    isFeatured: true,
    certifications: ["CE", "EN71", "3C"],
    retailPrice: "$109.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=3+in+1+toddler+trike+convertible", region: "US" },
      { platform: "amazon", label: "Amazon UK", url: "https://www.amazon.co.uk/s?k=3+in+1+toddler+trike", region: "UK" },
    ],
  },
  {
    id: 12,
    companyId: 5,
    slug: "happywheel-tricycle-pushbar",
    name: { zh: "快乐轮 宝宝推杆三轮车（经典款）", en: "Happy Wheel Classic Baby Trike with Push Bar" },
    category: "tricycle",
    size: "标准",
    material: "钢管车架 + PP塑料",
    ageRange: { zh: "1-4岁", en: "Age 1–4" },
    specs: { 推杆: "360°旋转推杆", 遮阳篷: "可折叠遮阳篷", 踏板: "防滑踏板", 车铃: "卡通车铃", 承重: "20kg" },
    priceRange: "$18-$30/pcs",
    moq: 500,
    leadTime: "20天",
    images: [
      "https://images.unsplash.com/photo-1566024349788-2a0b0d26e23a?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "经典推杆三轮车，360°旋转推杆让家长轻松操控行进方向。自带折叠遮阳篷，防晒防雨两用。防滑大踏板，宝宝踩踏更轻松。适合1-4岁宝宝户外出行。", en: "Classic push-bar trike with 360° rotating push handle for easy parental steering. Fold-down sun canopy for UV and light rain protection. Wide non-slip pedals for easy toddler pedaling. Perfect for outdoor trips with 1–4-year-olds." },
    isFeatured: true,
    certifications: ["CE", "3C"],
    retailPrice: "$79.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=baby+trike+push+bar+toddler", region: "US" },
      { platform: "walmart", label: "Walmart", url: "https://www.walmart.com/search?q=baby+trike+with+push+handle" },
    ],
  },
  {
    id: 13,
    companyId: 5,
    slug: "happywheel-rideon-music",
    name: { zh: "快乐轮 儿童扭扭溜溜车（音乐炫彩款）", en: "Happy Wheel Music Wiggle Ride-On Car" },
    category: "ride-on",
    size: "标准",
    material: "加厚环保PP",
    ageRange: { zh: "1-3岁", en: "Age 1–3" },
    specs: { 驱动: "腰部扭动无电池", 轮子: "静音PU万向轮", 音乐: "方向盘内置音效", 颜色: "红/蓝/粉/绿", 承重: "30kg", 重量: "2.5kg" },
    priceRange: "$12-$20/pcs",
    moq: 800,
    leadTime: "15天",
    images: [
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1561149877-84d268ba65b8?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "加厚环保PP材质，无需电池，靠腰部扭动前进。方向盘内置卡通音效，边玩边听音乐。静音万向轮室内室外均可使用，锻炼宝宝协调能力与核心肌群，是1-3岁幼儿的爆款玩具。", en: "Reinforced BPA-free PP body — no batteries needed. Waist-twisting motion drives the car forward while the steering wheel plays fun cartoon sounds. Silent PU caster wheels work on all surfaces. Builds coordination and core strength for toddlers aged 1–3." },
    isFeatured: true,
    certifications: ["CE", "EN71", "3C"],
    retailPrice: "$54.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=toddler+wiggle+car+music+ride+on", region: "US" },
      { platform: "amazon", label: "Amazon UK", url: "https://www.amazon.co.uk/s?k=toddler+wiggle+car+music", region: "UK" },
    ],
  },
  {
    id: 14,
    companyId: 5,
    slug: "happywheel-toddler-scooter",
    name: { zh: "快乐轮 幼儿三轮滑板车（T型把可调）", en: "Happy Wheel Toddler 3-Wheel Scooter (Adjustable T-Bar)" },
    category: "toddler-scooter",
    size: "标准",
    material: "铝合金 + PP",
    ageRange: { zh: "2-5岁", en: "Age 2–5" },
    specs: { 轮子: "3轮宽底防倒设计", 把手: "T型把三档可调高度", 刹车: "后轮脚踩刹车", 轮毂: "PU静音轮", 承重: "40kg", 重量: "2.2kg" },
    priceRange: "$14-$22/pcs",
    moq: 600,
    leadTime: "18天",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "专为2-5岁幼儿设计的三轮滑板车。宽底盘三轮结构防侧倒，T型把手三档可调高度随孩子成长。PU静音轮室内室外均适用，后轮脚踩刹车操作简单安全，是学龄前儿童的最佳入门滑板车。", en: "Engineered for toddlers aged 2–5. The wide-base tri-wheel layout prevents tipping while the 3-position adjustable T-bar grows with your child. Quiet PU wheels suit indoor and outdoor use; the rear foot brake is simple and safe for little hands. The perfect first scooter for preschoolers." },
    isFeatured: true,
    certifications: ["CE", "EN71"],
    retailPrice: "$59.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=toddler+3+wheel+scooter+adjustable", region: "US" },
      { platform: "amazon", label: "Amazon DE", url: "https://www.amazon.de/s?k=kleinkind+dreirad-roller+verstellbar", region: "DE" },
    ],
  },
  {
    id: 15,
    companyId: 2,
    slug: "global-toddler-scooter-lite",
    name: { zh: "环球 幼儿折叠滑板车（LED发光轮）", en: "Global Toddler Foldable Scooter with LED Wheels" },
    category: "toddler-scooter",
    size: "标准",
    material: "铝合金",
    ageRange: { zh: "2-4岁", en: "Age 2–4" },
    specs: { 折叠: "一键折叠收纳", 轮子: "LED发光PU轮", 把手: "T型把可调", 刹车: "后轮刹车", 承重: "35kg", 重量: "1.9kg" },
    priceRange: "$16-$26/pcs",
    moq: 500,
    leadTime: "20天",
    images: [
      "https://images.unsplash.com/photo-1576615278693-f8e095e60a26?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "超轻1.9kg铝合金车身，一键折叠方便携带出行。LED发光轮夜间出行更醒目安全，宝宝爱不释手。可调节T型把适配2-4岁幼儿身高，是爆款出口礼品单品。", en: "Ultra-light 1.9 kg aluminum body folds in one click for easy transport. LED light-up wheels add visibility and delight at night. Adjustable T-bar fits toddlers aged 2–4. A bestselling export gift item." },
    isFeatured: false,
    certifications: ["CE", "EN71"],
  },
  {
    id: 16,
    companyId: 6,
    slug: "sunshine-highchair-adjustable",
    name: { zh: "阳光婴童 多功能可调高脚餐椅", en: "Sunshine Baby Multi-Function Adjustable High Chair" },
    category: "highchair",
    size: "标准",
    material: "食品级PP + 钢管",
    ageRange: { zh: "6m-3岁", en: "6mo–3yr" },
    specs: { 高度: "5档座高调节", 靠背: "3档倾斜调节", 餐盘: "双层可拆洗餐盘", 安全带: "5点式安全带", 脚踏: "3档脚踏高度", 收纳: "可折叠收纳" },
    priceRange: "$38-$65/pcs",
    moq: 200,
    leadTime: "30天",
    images: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585854467604-cf2080ccbc72?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "5档座高 × 3档靠背角度全方位调节，从6个月坐立到3岁均适用。双层可拆洗餐盘方便清洁，5点式安全带确保宝宝安全。可折叠设计节省空间，符合EN14988欧盟餐椅标准。", en: "5-position seat height × 3-position recline angle — adapts from 6 months to 3 years. Dual-tray system pops off for easy washing; 5-point harness keeps baby secure. Foldable for compact storage. Compliant with EN14988 EU high chair standard." },
    isFeatured: true,
    certifications: ["CE", "EN14988", "3C"],
    retailPrice: "$159.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=baby+high+chair+adjustable+convertible", region: "US" },
      { platform: "amazon", label: "Amazon UK", url: "https://www.amazon.co.uk/s?k=baby+high+chair+adjustable", region: "UK" },
    ],
  },
  {
    id: 17,
    companyId: 2,
    slug: "global-highchair-foldable",
    name: { zh: "环球 便携折叠餐椅（旅行款）", en: "Global Portable Folding High Chair (Travel Edition)" },
    category: "highchair",
    size: "便携款",
    material: "铝合金 + 牛津布",
    ageRange: { zh: "6m-3岁", en: "6mo–3yr" },
    specs: { 重量: "4.2kg", 折叠尺寸: "55×40×10cm", 承重: "15kg", 安全带: "3点式安全带", 座垫: "可拆洗软座垫", 附件: "收纳袋" },
    priceRange: "$28-$48/pcs",
    moq: 300,
    leadTime: "22天",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "专为旅行和外出就餐设计，铝合金骨架仅重4.2kg，折叠后仅10cm厚轻松放入行李箱。附赠收纳袋，可拆洗软座垫，3点式安全带，餐厅酒店出行必备。", en: "Designed for travel and dining out — aluminum frame weighs only 4.2 kg and folds to 10 cm thin for easy packing. Includes a carry bag, washable padded seat, and 3-point harness. A must-have for restaurant and hotel visits." },
    isFeatured: false,
    certifications: ["CE", "EN14988"],
  },
  {
    id: 18,
    companyId: 1,
    slug: "xinghui-balance-10inch-toddler",
    name: { zh: "星辉 10寸幼儿平衡车（超轻镁合金）", en: "Xinghui 10inch Toddler Balance Bike (Ultra-Light Magnesium)" },
    category: "balance",
    size: "10寸",
    material: "镁合金一体成型",
    ageRange: { zh: "18m-3岁", en: "18mo–3yr" },
    specs: { 车架: "镁合金一体成型无焊接", 重量: "2.6kg", 座高: "28-35cm可调", 把手: "EVA软包防撞", 轮子: "充气橡胶轮", 颜色: "粉/蓝/绿/橙" },
    priceRange: "$28-$42/pcs",
    moq: 300,
    leadTime: "25天",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558618047-f4e60cba3f21?w=800&h=600&fit=crop&q=80",
    ],
    intro: { zh: "专为18个月-3岁幼儿设计，镁合金一体成型车架无焊接点，重量仅2.6kg，是全球最轻量幼儿平衡车之一。28-35cm无极可调座高，匹配幼儿快速成长的身高变化。EVA软包把手和座垫保护宝宝安全，培养平衡感为日后骑车打下基础。", en: "Designed for toddlers aged 18 months to 3 years. One-piece magnesium alloy frame with no weld points weighs only 2.6 kg — among the lightest toddler balance bikes worldwide. Infinite seat adjustment from 28–35 cm keeps pace with rapid growth. EVA-padded handlebar and saddle protect little ones while building the balance skills needed for pedal bikes." },
    isFeatured: true,
    certifications: ["CE", "EN71", "EN8098"],
    retailPrice: "$99.99",
    buyLinks: [
      { platform: "amazon", label: "Amazon US", url: "https://www.amazon.com/s?k=toddler+balance+bike+10+inch+magnesium", region: "US" },
      { platform: "amazon", label: "Amazon UK", url: "https://www.amazon.co.uk/s?k=toddler+balance+bike+magnesium", region: "UK" },
    ],
  },
];

export const articles: Article[] = [
  {
    id: 1,
    slug: "quzhou-cbike-expo-2026",
    title: { zh: "2026曲周童车产业博览会圆满落幕，订单突破10亿", en: "2026 Quzhou Kids Bike Expo Concludes Successfully — Orders Surpass RMB 1 Billion" },
    category: "news",
    tags: [{ zh: "展会", en: "Trade Show" }, { zh: "曲周", en: "Quzhou" }, { zh: "童车", en: "Kids Bikes" }],
    featuredImg: "https://placehold.co/800x450/dbeafe/1e40af?text=Expo+2026",
    author: "产业带编辑部",
    publishDate: "2026-04-15",
    excerpt: { zh: "为期三天的2026曲周童车产业博览会于4月15日圆满落幕，吸引来自全球38个国家和地区的采购商参会，现场签约订单金额突砄10亿元人民币，创历史新高。", en: "The three-day 2026 Quzhou Kids Bike Expo concluded on April 15, attracting buyers from 38 countries. On-site signed orders surpassed RMB 1 billion, setting a new record." },
    content: `## 2026曲周童车产业博览会圆满落幕

为期三天的2026曲周童车产业博览会于4月15日圆满落幕，吸引来自全球38个国家和地区的采购商参会，现场签约订单金额突破10亿元人民币，创历史新高。

### 盛况空前

本届博览会共吸引展商320家，参观采购商达1.2万人次。展会上，各大企业纷纷展出最新研发的高端产品，其中智能电动童车和轻量化平衡车备受瞩目。

### 政策支持

曲周县政府宣布将投入5亿元扶持基金，重点支持产业带企业技术升级和品牌建设，推动曲周童车产业向高端化、智能化方向发展。

### 下届预告

下届博览会定于2027年4月举办，欢迎全球采购商提前报名参展。`,
  },
  {
    id: 2,
    slug: "kids-bike-buying-guide-2026",
    title: { zh: "2026儿童自行车选购完全指南：尺寸、材质、安全一次看懂", en: "2026 Complete Kids Bike Buying Guide: Size, Material & Safety Explained" },
    category: "guide",
    tags: [{ zh: "选购", en: "Buying Tips" }, { zh: "安全", en: "Safety" }, { zh: "自行车", en: "Bicycle" }],
    featuredImg: "https://placehold.co/800x450/d1fae5/065f46?text=Buy+Guide",
    author: "张晓明",
    publishDate: "2026-03-20",
    excerpt: { zh: "选购儿童自行车是很多家长的困惑，本文从尺寸选择、车架材质、安全认证三大维度，帮你一次看懂如何为孩子挑选最合适的童车。", en: "Confused about choosing a kids' bike? This guide covers size selection, frame materials, and safety certifications to help you pick the perfect ride for your child." },
    content: `## 儿童自行车选购指南

选购儿童自行车是很多家长的困惑。本文从三大维度帮你一次看懂。

### 一、尺寸选择

儿童自行车尺寸以车轮直径（英寸）衡量，选择时应参考孩子的身高：

| 车轮尺寸 | 适合身高 | 适合年龄 |
|---------|---------|---------|
| 12寸 | 85-100cm | 2-4岁 |
| 14寸 | 95-110cm | 3-6岁 |
| 16寸 | 105-120cm | 4-8岁 |
| 20寸 | 115-135cm | 6-10岁 |
| 24寸 | 125-150cm | 8-13岁 |

### 二、车架材质

- **铝合金**：轻量化首选，重量比钢轻30%，防锈，适合大多数家庭。
- **镁合金**：最轻（比铝轻30%），一体成型无焊缝，价格较高，适合追求品质的家庭。
- **高碳钢**：耐用结实，价格实惠，适合对重量要求不高的家庭。

### 三、安全认证

选购时务必检查安全认证：
- **3C认证**：中国强制认证，国内销售必备
- **CE认证**：欧盟安全标准，出口欧洲必备
- **EN71**：欧盟玩具安全标准

选择曲周产业带的品牌，均通过上述认证，放心之选。`,
  },
  {
    id: 3,
    slug: "xinghui-factory-interview",
    title: { zh: "探厂实录：走进星辉童车，揭秘年产百万辆的童车工厂", en: "Factory Tour: Inside Xinghui Bike — Secrets of a 1-Million-Unit Annual Producer" },
    category: "interview",
    tags: [{ zh: "探厂", en: "Factory Tour" }, { zh: "星辉", en: "Xinghui" }, { zh: "生产工艺", en: "Manufacturing" }],
    featuredImg: "https://placehold.co/800x450/ede9fe/5b21b6?text=Factory+Visit",
    author: "产业带媒体团",
    publishDate: "2026-02-28",
    excerpt: { zh: "近日，产业带媒体团走进曲周龙头企业星辉童车，实地探访其现代化生产线，揭秘年产百万辆童车背后的品质密码与创新故事。", en: "Our media team visited Xinghui Bike, Quzhou's leading manufacturer, for an in-depth factory tour — uncovering the quality secrets and innovation behind 1 million bikes a year." },
    content: `## 走进星辉童车

近日，产业带媒体团走进曲周龙头企业星辉童车，进行深度探厂采访。

### 现代化生产基地

星辉童车位于曲周工业园区，占地8万平方米，拥有5条全自动化生产线，年产能可达150万辆。

### 严格质控

工厂设有独立的质检中心，每批次产品均需经过200道工序检测，包括整车抗压测试、刹车系统检测、骑行稳定性测试等。

### 创始人专访

创始人李建国介绍："我们坚持'质量第一'的原则，宁可放慢速度，也要保证每一辆出厂的童车都是精品。"

"未来，我们将持续加大研发投入，打造更多具有国际竞争力的高端童车品牌。"`,
  },
  {
    id: 4,
    slug: "balance-bike-benefits",
    title: { zh: "平衡车真的有用吗？儿科医生揭秘平衡车对孩子发育的好处", en: "Are Balance Bikes Really Useful? A Pediatrician Explains the Developmental Benefits" },
    category: "guide",
    tags: [{ zh: "平衡车", en: "Balance Bike" }, { zh: "育儿", en: "Parenting" }, { zh: "发育", en: "Development" }],
    featuredImg: "https://placehold.co/800x450/fef3c7/d97706?text=Balance+Benefits",
    author: "李医生·児科科普",
    publishDate: "2026-01-15",
    excerpt: { zh: "越来越多的家长为孩子选择平衡车，但它究竞有什么好处？本文邀请児科医生从科学角度解析平衡车对儿童身体与大脑发育的积极影响。", en: "More parents are choosing balance bikes, but what's the real benefit? A pediatrician breaks down the positive effects on children's physical and brain development." },
    content: `## 平衡车的益处

越来越多的家长为孩子选择平衡车，本文从科学角度分析其益处。

### 促进平衡感发展

平衡车要求孩子用双脚蹬地，身体重心不断调整，能有效训练前庭觉和本体觉，提升平衡协调能力。

### 锻炼腿部力量

经常使用平衡车可强化孩子腿部肌肉群，为日后学习自行车打下良好基础。

### 建立空间感知

骑行过程中的速度感和方向控制，有助于儿童建立空间感知能力和手眼协调能力。

### 何时开始？

大多数孩子在18个月至2岁时就可以开始尝试平衡车，3-5岁是最佳练习黄金期。`,
  },
  {
    id: 5,
    slug: "cbike-industry-2025-report",
    title: { zh: "2025曲周童车产业年度报告：出口额增长35%，智能化成最大亮点", en: "2025 Quzhou Kids Bike Industry Annual Report: Exports Up 35%, Smart Products Lead Growth" },
    category: "news",
    tags: [{ zh: "年报", en: "Annual Report" }, { zh: "出口", en: "Export" }, { zh: "产业数据", en: "Industry Data" }],
    featuredImg: "https://placehold.co/800x450/dcfce7/166534?text=Annual+Report",
    author: "曲周童车协会",
    publishDate: "2026-01-05",
    excerpt: { zh: "曲周童车产业协会发布2025年度报告显示，产业带全年实现产値120亿元，同比增长18%；出口额达28亿美元，同比增长35%，智能电动童车成为增长最快的品类。", en: "The Quzhou Kids Bike Industry Association's 2025 Annual Report shows cluster output of RMB 12 billion (+18%) and exports of USD 2.8 billion (+35%), with smart electric bikes as the fastest-growing category." },
    content: `## 2025年度产业报告摘要

曲周童车产业协会发布2025年度报告，多项数据亮眼。

### 核心数据

- 产业带总产值：**120亿元**（同比+18%）
- 出口额：**28亿美元**（同比+35%）
- 企业总数：**1,680家**
- 从业人员：**8.6万人**
- 出口国家：**63个**

### 品类增长亮点

智能电动童车品类增长最为突出，同比增长76%，成为产业带最大增量来源。平衡车品类持续高增，同比增长42%。

### 展望2026

协会预计2026年产业带总产值将突破150亿元，出口额有望突破35亿美元。`,
  },
  {
    id: 6,
    slug: "oem-odm-guide-for-importers",
    title: { zh: "海外采购商必读：如何与曲周工厂谈OEM/ODM？完整流程解析", en: "Importer's Guide: How to Negotiate OEM/ODM with Quzhou Factories — Full Process Breakdown" },
    category: "guide",
    tags: [{ zh: "OEM", en: "OEM" }, { zh: "ODM", en: "ODM" }, { zh: "采购", en: "Sourcing" }],
    featuredImg: "https://placehold.co/800x450/fce7f3/be185d?text=OEM+Guide",
    author: "外贸顾问团队",
    publishDate: "2025-12-10",
    excerpt: { zh: "很多海外采购商对如何与中国童车工厂开展OEM/ODM合作感到困惑。本文为你梳理从初次接触到最终交货的完整合作流程，帮助你规避风险，高效落单。", en: "Many overseas importers are unsure how to start OEM/ODM cooperation with Chinese bike factories. This guide walks you through the full process from first contact to final delivery." },
    content: `## OEM/ODM合作完整流程

本文为海外采购商梳理与曲周工厂合作的完整流程。

### 第一步：明确需求

在联系工厂前，需要准备好以下材料：产品尺寸图纸或样品、目标市场（决定适用认证标准）、预计年采购量、交货时间要求。

### 第二步：对比报价

建议同时联系3-5家工厂获取报价，关注报价时要注意：EXW/FOB价格区别、样品费用与打样周期、批量生产价格梯度。

### 第三步：打样确认

样品阶段是最关键的环节，建议：索要实物样品（而非仅凭图片）、在本国实验室进行安全测试、书面确认所有规格与颜色。

### 第四步：签订合同

合同应明确：产品规格、价格与数量、生产周期与交货日期、质量标准与验收条款、违约责任与争议解决方式。`,
  },
];

export const categoryLabels: Record<string, string> = {
  brand: "龙头企业",
  export: "出口贸易型",
  parts: "零配件配套厂",
  general: "综合型",
};

export const categoryLabelsEn: Record<string, string> = {
  brand: "Leading Brand",
  export: "Export Trader",
  parts: "Parts Supplier",
  general: "General Manufacturer",
};

export const stats = [
  { label: "产业带企业数", labelEn: "Enterprises", value: "1,680+", unit: "家", unitEn: "" },
  { label: "年产值", labelEn: "Annual Output", value: "120", unit: "亿元", unitEn: "B RMB" },
  { label: "出口国家", labelEn: "Export Countries", value: "63", unit: "个", unitEn: "" },
  { label: "从业人员", labelEn: "Employees", value: "86,000+", unit: "万人", unitEn: "" },
];
