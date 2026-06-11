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

function toLexicalText(text: string, format = 0) {
  return {
    detail: 0,
    format,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function toLexicalParagraph(text: string) {
  return {
    children: [toLexicalText(text)],
    direction: null,
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
    textFormat: 0,
    textStyle: "",
  };
}

function toLexicalHeading(text: string, tag = "h2") {
  return {
    children: [toLexicalText(text)],
    direction: null,
    format: "",
    indent: 0,
    tag,
    type: "heading",
    version: 1,
  };
}

function toLexicalLink(label: string, url: string) {
  return {
    children: [toLexicalText(label, 1)],
    direction: null,
    fields: {
      linkType: "custom",
      newTab: false,
      url,
    },
    format: "",
    indent: 0,
    type: "link",
    version: 3,
  };
}

function toLexicalParagraphWithLink(prefix: string, label: string, url: string, suffix: string) {
  return {
    children: [toLexicalText(prefix), toLexicalLink(label, url), toLexicalText(suffix)],
    direction: null,
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
    textFormat: 0,
    textStyle: "",
  };
}

function toLexicalQuote(text: string) {
  return {
    children: [toLexicalParagraph(text)],
    direction: null,
    format: "",
    indent: 0,
    type: "quote",
    version: 1,
  };
}

function toLexicalList(items: string[], listType = "bullet") {
  return {
    children: items.map((item, index) => ({
      checked: undefined,
      children: [toLexicalText(item)],
      direction: null,
      format: "",
      indent: 0,
      type: "listitem",
      value: index + 1,
      version: 1,
    })),
    direction: null,
    format: "",
    indent: 0,
    listType,
    start: 1,
    tag: listType === "number" ? "ol" : "ul",
    type: "list",
    version: 1,
  };
}

function toLexicalUpload(mediaId: number | null, seed: GuideSeed) {
  if (!mediaId) return null;
  return {
    fields: {
      caption: `${seed.titleZh} / ${seed.titleEn}`,
    },
    format: "",
    relationTo: "media",
    type: "upload",
    value: mediaId,
    version: 3,
  };
}

function splitGuideText(text: string): [string, string] {
  const sentences = String(text || "")
    .split(/(?<=[。！？.!?])\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (sentences.length < 2) return [text, ""];
  const pivot = Math.max(1, Math.ceil(sentences.length / 2));
  return [sentences.slice(0, pivot).join(""), sentences.slice(pivot).join("")];
}

function toGuideContent(seed: GuideSeed, mediaId: number | null = null) {
  const [introZh, actionZh] = splitGuideText(seed.contentZh);
  const [introEn, actionEn] = splitGuideText(seed.contentEn);
  const mediaNode = toLexicalUpload(mediaId, seed);
  const children = [
    toLexicalHeading("中文要点", "h2"),
    toLexicalParagraph(introZh),
    toLexicalParagraph(actionZh || seed.summaryZh),
    toLexicalParagraphWithLink("延伸阅读：可返回 ", "选购指南列表", "guide.html", " 对照同分类文章与推荐产品。"),
    toLexicalList(["先确认真实使用场景", "再核对安全与售后", "最后用参数和预算表做复核"]),
    toLexicalQuote("编辑提示：正文内容可在后台 Lexical 编辑器继续插入图片、链接和补充段落。"),
    mediaNode,
    toLexicalHeading("English Notes", "h2"),
    toLexicalParagraph(introEn),
    toLexicalParagraph(actionEn || seed.summaryEn),
    toLexicalParagraphWithLink("Related reading: return to the ", "Buying Guide list", "guide.html?lang=en", " to compare articles in the same category."),
  ].filter(Boolean);

  return {
    root: {
      children,
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
    contentZh: "第一次购买新生儿推车时，建议先把宝宝月龄、主要出行场景、居住楼层和车辆后备箱尺寸写下来，再去比较品牌。0-6 月宝宝需要稳定平躺、可靠刹车和完整遮阳，座舱支撑比花哨功能更重要。试车时重点看单手折叠是否顺畅、车架晃动是否明显、安全带是否贴合、轮组过门槛是否费力。最后把预算拆成安全刚需、舒适升级和可选配件三类，就能避免被营销词带偏。下单前再确认保修网点、配件价格和退换货周期，给后续使用留出余量，避免返工。",
    contentEn: "When buying a newborn stroller for the first time, start by writing down the baby age, daily routes, home access, and car trunk size before comparing brands. For 0-6 months, flat recline, stable braking, supportive seating, and reliable canopy coverage matter more than decorative features. During a test push, check one-hand folding, frame wobble, harness fit, and how the wheels handle thresholds. Split the budget into safety essentials, comfort upgrades, and optional accessories so marketing claims do not drive the decision.",
    publishedAt: "2026-06-10T08:00:00.000Z"
  },
  {
    slug: "outdoor-travel-stroller-guide",
    category: "scenario",
    titleZh: "户外出行推车选购全攻略",
    titleEn: "Outdoor-travel stroller buying framework",
    summaryZh: "重点关注减震 / 越野轮 / 防晒",
    summaryEn: "Prioritize suspension, all-terrain wheels, and sun protection.",
    contentZh: "户外出行推车不能只看轮子大不大，而要结合路面类型判断整车通过性。公园石板路、露营草地和乡村碎石路对悬挂、轮胎材质、座舱稳定性要求完全不同。选购时建议观察前轮是否容易卡顿、后轮是否有足够抓地力、车把高度是否适合长时间推行，遮阳篷是否能覆盖低角度阳光。还要确认收车后是否能放进车尾箱，雨罩、蚊帐和杯架等配件是否容易购买，避免户外场景真正使用时才发现短板。若经常长途自驾，还应关注轮组快拆、清洁难度和后备箱装载顺序。",
    contentEn: "For outdoor travel, do not judge only by wheel size; match the stroller to the surfaces you actually use. Park tiles, campsite grass, and gravel paths demand different suspension, tire material, and cabin stability. When evaluating a model, watch whether the front wheels catch, whether the rear wheels keep traction, whether the handlebar suits long pushes, and whether the canopy blocks low-angle sun. Also confirm folded trunk fit and accessory availability such as rain covers, mosquito nets, and cup holders before relying on the stroller for trips.",
    publishedAt: "2026-06-09T09:00:00.000Z"
  },
  {
    slug: "mid-range-stroller-1000-3000",
    category: "budget",
    titleZh: "¥1000–3000 中端推车选购方案",
    titleEn: "Mid-range stroller plan for the ¥1000-3000 budget",
    summaryZh: "拆解溢价构成,识别智商税",
    summaryEn: "Break down premium pricing and avoid low-value markups.",
    contentZh: "1000-3000 元价位最容易出现配置堆叠和真实体验不匹配的问题。建议先锁定刹车结构、安全带、座舱支撑、轮组耐用度这些基础项，再看避震、面料、收车方式和配件完整度。不要被单一卖点决定购买，例如只强调超轻却牺牲稳定性，或只强调高景观却忽略搬运重量。对比时把 3-5 款候选车型放在同一张表里，记录重量、折叠尺寸、保修、可替换配件和真实用户反馈，预算会更容易落在合理区间。促销期也要看清赠品是否刚需，避免因为短期优惠买到不适合日常路线的车型。",
    contentEn: "The ¥1000-3000 range often mixes useful upgrades with features that do not improve daily use. Start with braking, harness quality, seat support, and wheel durability, then compare suspension, fabric, folding design, and included accessories. Avoid letting one headline claim decide the purchase, such as ultralight weight that reduces stability or high-view seating that makes lifting difficult. Put three to five candidate models into one table with weight, folded size, warranty, replaceable parts, and real user feedback so the budget lands in a practical range.",
    publishedAt: "2026-06-08T10:00:00.000Z"
  },
  {
    slug: "identify-false-specs",
    category: "risk",
    titleZh: "参数虚标的 7 种常见套路",
    titleEn: "Seven common patterns of misleading specifications",
    summaryZh: "重量、载重、轮胎类型如何识别",
    summaryEn: "How to verify claimed weight, load limits, and tire type.",
    contentZh: "参数虚标通常出现在重量、承重、轮胎材质、平躺角度和避震描述上。看到超轻、超大承重、越野级减震这类词时，要继续追问测试条件、是否含座垫和配件、承重是静态还是动态，以及角度是否有实测照片。线上详情页最好保存截图，与客服确认书面口径；线下试车则要观察车架受力后是否异响、折叠锁是否松动、刹车是否左右同步。把营销话术拆成可验证指标，才能降低踩坑概率。若同一型号在多个渠道参数不同，应优先参考说明书、检测报告和品牌官网。",
    contentEn: "Misleading specs commonly appear in weight, load rating, tire material, recline angle, and suspension claims. When you see phrases like ultralight, extra-high capacity, or all-terrain suspension, ask about test conditions, whether cushions and accessories are included, whether load is static or dynamic, and whether recline angles have measurement photos. Save screenshots of online claims and confirm details with customer service in writing. In store, check frame noise under load, fold-lock looseness, and left-right brake synchronization. Turning marketing copy into verifiable indicators reduces purchase risk.",
    publishedAt: "2026-06-07T11:00:00.000Z"
  },
  {
    slug: "verify-overseas-certification",
    category: "crossborder",
    titleZh: "海外认证如何分辨真伪",
    titleEn: "How to validate overseas certification authenticity",
    summaryZh: "EN1888 / ASTM 证书查询通道",
    summaryEn: "Use EN1888 and ASTM certificate lookup channels.",
    contentZh: "跨境购买推车时，认证信息不能只看商品页贴图。建议先确认销售地区对应的标准，例如欧盟 EN1888、美国 ASTM F833 与 CPSC 要求，再核对证书编号、测试机构、型号名称和生产批次是否一致。遇到只展示品牌大证书、不展示具体型号报告的页面，要向商家索要完整文件和售后条款。还需要提前确认国内维修渠道、配件购买方式、物流破损理赔和退换货成本。认证是真的，售后可执行，才适合跨境下单。若页面没有中文说明或召回查询入口，建议降低优先级，避免后续沟通成本过高。",
    contentEn: "For cross-border stroller purchases, do not rely only on certificate images in a product listing. First match the market to the relevant standard, such as EN1888 in the EU or ASTM F833 and CPSC requirements in the US, then compare certificate number, test lab, model name, and production batch. If a seller shows only a brand-level certificate instead of the specific model report, request full documents and warranty terms. Also confirm local repair options, spare-part sourcing, shipping damage claims, and return cost. Certification plus executable after-sales support makes the order safer.",
    publishedAt: "2026-06-06T12:00:00.000Z"
  },
  {
    slug: "balance-bike-vs-tricycle",
    category: "category",
    titleZh: "平衡车 vs 三轮车，2 岁宝宝怎么选",
    titleEn: "Balance bike vs tricycle: best fit for a 2-year-old",
    summaryZh: "发育阶段对应车型对照",
    summaryEn: "Model selection mapped to development stages.",
    contentZh: "2 岁左右选择平衡车还是三轮车，关键看孩子的身高、跨高、核心力量和胆量。平衡车更强调身体协调和方向控制，适合能稳定行走、愿意主动滑行的孩子；三轮车支撑更强，适合刚开始练习蹬踏或需要家长辅助推行的阶段。试用时要看双脚能否自然踩地、把手是否过宽、座椅是否容易调节，以及摔倒时车身是否压腿。不要过早追求速度，先让孩子建立安全感和控制感，后续过渡会更顺。购买后前几次练习应选择平整场地，并准备头盔和护具建立安全习惯。",
    contentEn: "Choosing between a balance bike and a tricycle around age two depends on height, inseam, core strength, and confidence. Balance bikes build coordination and steering control, fitting children who walk steadily and enjoy self-propelling. Tricycles offer more support and suit children learning to pedal or needing parent assistance. During a trial, check whether both feet reach the ground naturally, whether the handlebar is too wide, whether the seat adjusts easily, and whether the frame could trap legs during a fall. Prioritize control and confidence before speed.",
    publishedAt: "2026-06-05T13:00:00.000Z"
  },
  {
    slug: "stroller-care-maintenance",
    category: "maintenance",
    titleZh: "推车清洁与保养标准流程",
    titleEn: "Standard workflow for stroller cleaning and maintenance",
    summaryZh: "延长使用年限的 5 个习惯",
    summaryEn: "Five habits that extend product lifespan.",
    contentZh: "推车保养不需要复杂工具，但需要固定节奏。每周可用湿布清理车架、座舱和轮组泥沙，检查刹车踏板、安全带扣、折叠锁和螺丝是否松动；雨天或海边使用后要及时擦干金属件，避免轴承和铆钉位置生锈。布套清洗前先查看水洗标，避免高温烘干导致缩水变形。长期不用时建议收车后放在干燥通风处，不要重压车架。做好这些基础动作，推行顺畅度和二手残值都会更稳定。若出现异响或刹车回弹变慢，应暂停使用并联系售后排查，保留维修记录备查。",
    contentEn: "Stroller maintenance does not need complicated tools, but it does need a steady routine. Weekly, wipe mud from the frame, seat, and wheels, then check the brake pedal, harness buckle, fold lock, and screws for looseness. After rain or seaside use, dry metal parts quickly to reduce rust around bearings and rivets. Read the fabric care label before washing covers, and avoid high-heat drying that can shrink or distort them. For long storage, fold the stroller in a dry ventilated place without heavy pressure on the frame. These basics preserve handling and resale value.",
    publishedAt: "2026-06-04T14:00:00.000Z"
  },
  {
    slug: "newborn-stroller-safety-checklist",
    category: "beginner",
    titleZh: "新生儿推车安全检查清单",
    titleEn: "Newborn stroller safety checklist",
    summaryZh: "上路前 10 项必查，避免新手误区",
    summaryEn: "Ten must-check items before first use to avoid common beginner mistakes.",
    contentZh: "新生儿推车上路前，建议固定做一次 5 分钟安全检查。先确认车架完全展开并听到锁止声，再踩下刹车轻推车身，观察是否有滑动。安全带要贴合肩部和胯部，不能只扣腰带；座椅角度需接近平躺，头颈位置不要悬空。遮阳篷和透气窗要同时考虑，避免为了遮光造成闷热。最后检查随车包、挂钩和杯架是否让车身重心后移。把这些动作变成习惯，比临时相信说明书更可靠。出门路线如有坡道或台阶，应提前规划绕行或双人协助方式，减少临场风险。",
    contentEn: "Before taking a newborn stroller out, run a five-minute safety check every time. Confirm the frame is fully opened and locked, then engage the brake and gently push to see whether the stroller moves. The harness should fit shoulders and hips, not only the waist. Recline should be close to flat, with the head and neck properly supported. Balance canopy coverage with ventilation so sun protection does not create overheating. Finally, check whether bags, hooks, or cup holders shift the center of gravity backward. Habitual checks are more reliable than assuming setup is correct.",
    publishedAt: "2026-06-03T08:00:00.000Z"
  },
  {
    slug: "city-commute-stroller-setup",
    category: "scenario",
    titleZh: "城市通勤推车配置建议",
    titleEn: "City-commute stroller setup recommendations",
    summaryZh: "地铁、电梯、商场三场景实用配置",
    summaryEn: "Practical setup for metro, elevators, and shopping-mall routes.",
    contentZh: "城市通勤推车的核心不是功能越多越好，而是进出地铁、电梯、商场和小区门禁时是否顺手。建议优先选择折叠步骤少、站立收纳稳定、单手推行不跑偏的车型；车宽要能通过常见闸机和窄电梯，重量要匹配主要照护人的搬运能力。储物篮够用即可，过大反而容易塞满重物影响稳定。试车时模拟抱娃收车、过减速带、进后备箱三个动作，比单看参数更接近日常体验。若日常需要公交换乘，还要重点确认收车后的握持位置和肩背可行性，避免高峰期手忙脚乱。",
    contentEn: "For city commuting, the best stroller is not the one with the most features, but the one that works smoothly through metro gates, elevators, malls, and residential access points. Prioritize fewer folding steps, stable self-standing storage, and straight one-hand pushing. Width should pass common gates and narrow elevators, while weight should match the caregiver who lifts it most often. A storage basket should be useful but not encourage heavy loading that reduces stability. Simulate folding while holding a child, crossing speed bumps, and loading the trunk before deciding.",
    publishedAt: "2026-06-02T09:00:00.000Z"
  },
  {
    slug: "budget-stroller-cost-breakdown",
    category: "budget",
    titleZh: "预算型推车成本拆解模板",
    titleEn: "Budget stroller cost breakdown template",
    summaryZh: "三层预算法，快速识别必要配置",
    summaryEn: "A three-tier budgeting method to identify essential configurations quickly.",
    contentZh: "预算型推车建议用三层法拆解成本。第一层是不能省的安全项，包括刹车、安全带、车架稳定和基础认证；第二层是影响每天体验的舒适项，例如遮阳、减震、座舱面料和推把高度；第三层才是杯架、脚套、收纳袋等可选配件。购买前估算使用周期、是否会生二胎、未来二手转卖概率，再决定是否加钱。这样能把预算花在高频价值上，而不是被套装赠品或短期折扣牵着走。预算表中还应加入雨罩、维修件和物流退换成本，避免低价变成隐性高价，决策更稳。",
    contentEn: "Use a three-layer method for budget stroller spending. The first layer is non-negotiable safety: brakes, harness, frame stability, and basic certification. The second layer affects daily comfort: canopy, suspension, seat fabric, and handlebar height. The third layer is optional accessories such as cup holders, footmuffs, and storage bags. Before buying, estimate usage duration, whether a second child may use it, and resale probability. This keeps money on high-frequency value rather than bundled gifts or temporary discounts.",
    publishedAt: "2026-06-01T10:00:00.000Z"
  },
  {
    slug: "second-hand-stroller-risk-audit",
    category: "risk",
    titleZh: "二手推车风险核查指南",
    titleEn: "Second-hand stroller risk audit guide",
    summaryZh: "二手交易前的结构与召回核验流程",
    summaryEn: "A structural and recall-verification flow before second-hand purchases.",
    contentZh: "二手推车最重要的是确认结构安全，而不是只看成色。看车时先查品牌和型号是否有召回记录，再检查车架焊点、铆钉、折叠锁、刹车齿和安全带扣是否磨损或变形。轮组如果明显偏磨，可能代表长期超载或路况使用强度高。要求卖家提供购买凭证、维修记录和原配件清单，缺少说明书时要能在线找到同型号资料。价格再低，也不建议购买事故车、改装车或无法确认批次的库存车。交易完成前最好现场演示展开、收车和刹停，确认关键动作稳定，再付款。",
    contentEn: "For second-hand strollers, structural safety matters more than cosmetic condition. First check whether the brand and model have recall records, then inspect frame welds, rivets, fold locks, brake teeth, and harness buckles for wear or deformation. Uneven wheel wear may indicate overload or heavy rough-surface use. Ask the seller for proof of purchase, repair history, and an original accessory list; if the manual is missing, make sure the same model documentation is available online. Avoid crash-damaged, modified, or batch-unclear units even at a low price.",
    publishedAt: "2026-05-31T11:00:00.000Z"
  },
  {
    slug: "crossborder-warranty-claim-guide",
    category: "crossborder",
    titleZh: "跨境售后与保修理赔指南",
    titleEn: "Cross-border after-sales and warranty claim guide",
    summaryZh: "发票、保修条款与物流理赔要点",
    summaryEn: "Key points for invoices, warranty terms, and logistics claims.",
    contentZh: "跨境售后要在下单前就设计好证据链。购买时保存商品页、订单、付款凭证、物流单号和客服承诺截图；收货开箱建议全程录像，特别记录外箱破损、配件缺失和车架划痕。保修条款要看清是否覆盖中国大陆、是否需要寄回原销售地、运费由谁承担。出现问题时先找平台售后，再联系品牌客服，最后准备信用卡争议或物流理赔材料。流程越清楚，维权成本越可控。不要过早丢弃包装和标签，它们往往是物流破损理赔的重要证据，也能证明批次来源和责任。",
    contentEn: "Cross-border after-sales support should be planned before checkout. Save the product page, order record, payment proof, tracking number, and customer-service promises. Record the unboxing, especially carton damage, missing accessories, and frame scratches. Read warranty terms carefully: whether mainland China is covered, whether the item must be shipped back to the original market, and who pays freight. If problems occur, contact platform support first, then the brand, and finally prepare credit-card dispute or logistics claim materials. Clear evidence keeps claim costs manageable.",
    publishedAt: "2026-05-30T12:00:00.000Z"
  },
  {
    slug: "balance-bike-fit-by-height",
    category: "category",
    titleZh: "平衡车按身高选型指南",
    titleEn: "Balance bike fitting guide by height",
    summaryZh: "从跨高到把位的尺寸匹配规则",
    summaryEn: "Sizing rules from inseam clearance to handlebar position.",
    contentZh: "平衡车选型要从孩子真实身高和跨高出发，而不是只按年龄。合适的座高应让孩子坐上后双脚能自然踩地、膝盖微弯，太高会增加恐惧感，太低则影响滑行动作。车重最好不超过孩子体重的三分之一，便于自己扶起和转向。把手宽度、转向限位、轮胎材质也会影响控制感。第一次练习建议选择平整空旷场地，先练推行和刹停，再逐步增加滑行距离，不急着上坡或追求速度。试骑时观察孩子是否愿意主动抬脚滑行，这比年龄标签更能说明匹配度，家长也更放心。",
    contentEn: "Balance bike fit should start with real height and inseam, not age alone. The right seat height lets the child sit with both feet flat and knees slightly bent; too high creates fear, while too low disrupts gliding. Bike weight should ideally stay under one third of the child's body weight so they can lift and steer it. Handlebar width, steering limiter, and tire material also affect control. For first practice, choose a flat open area, start with walking and stopping, then gradually extend gliding distance before hills or speed.",
    publishedAt: "2026-05-29T13:00:00.000Z"
  },
  {
    slug: "rainy-season-stroller-maintenance",
    category: "maintenance",
    titleZh: "雨季推车保养与防锈要点",
    titleEn: "Rainy-season stroller maintenance and anti-rust tips",
    summaryZh: "雨后清洁、轴承养护与存放规范",
    summaryEn: "Post-rain cleaning, bearing care, and storage best practices.",
    contentZh: "雨季使用推车后，最怕水分长期停留在轴承、铆钉、刹车齿和折叠关节处。回家后先用干布擦掉车架和轮组水迹，再把车放在通风处完全晾干，不要直接收进密闭储物间。轮胎缝隙里的泥沙要及时清理，避免干结后影响转向；布套若被雨水打湿，应按水洗标拆洗或阴干。发现刹车变涩、轮组异响或金属点锈，应尽快维护。小问题早处理，能避免后期更换大件。潮湿地区可在存放处放除湿袋，并定期打开遮阳篷检查霉味和布套状态，保持干爽卫生安全。",
    contentEn: "After rainy-season use, the main risk is moisture staying around bearings, rivets, brake teeth, and folding joints. At home, wipe water from the frame and wheels, then leave the stroller in a ventilated area until fully dry instead of sealing it in storage. Remove mud from tire grooves before it hardens and affects steering. If fabric gets wet, follow the care label for washing or shade drying. When brakes feel stiff, wheels make noise, or metal spots show rust, service them early. Small maintenance prevents expensive part replacement later.",
    publishedAt: "2026-05-28T14:00:00.000Z"
  }
];

function assertGuideSeedContentLength(seeds: GuideSeed[]): void {
  const shortSeeds = seeds.filter((seed) => Array.from(seed.contentZh || "").length < 200);
  if (shortSeeds.length > 0) {
    throw new Error(
      `[seed-guides] guide Chinese body must be at least 200 characters: ${shortSeeds.map((seed) => seed.slug).join(", ")}.`
    );
  }
}

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
    content: toGuideContent(seed, coverId),
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

async function patchEnglishLocale(id: string, seed: GuideSeed, token: string, coverId: number | null): Promise<void> {
  await request(`/api/guides/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      titleEn: seed.titleEn,
      summaryEn: seed.summaryEn,
      content: toGuideContent(seed, coverId),
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
  const coverId = await ensureGuideCoverMedia(seed, token);
  await patchEnglishLocale(id, seed, token, coverId);

  if (!hasCover) {
    console.log(`Upserted guide as draft for local preview (missing cover): ${seed.slug}`);
    return;
  }

  await transitionGuideToPublished(id, seed.publishedAt, token);
}

async function main() {
  assertGuideSeedCategoryCoverage(GUIDE_SEEDS);
  assertGuideSeedContentLength(GUIDE_SEEDS);
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
