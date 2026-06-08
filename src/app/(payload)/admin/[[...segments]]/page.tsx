import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "@/app/(payload)/admin/importMap";
import config from "@payload-config";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

type ShortcutCard = {
  title: string;
  description: string;
  href: string;
  tone: "primary" | "mint" | "amber" | "slate";
};

type StatCard = {
  label: string;
  value: string;
  hint: string;
  tone: ShortcutCard["tone"];
};

type TaskCard = {
  label: string;
  value: string;
  hint: string;
  href: string;
  tone: ShortcutCard["tone"];
};

const shortcutCards: ShortcutCard[] = [
  {
    title: "评测编辑 Review Editing",
    description: "进入 Review 集合，补齐中英文标题、摘要、正文与评分状态。",
    href: "/admin/collections/reviews",
    tone: "primary"
  },
  {
    title: "多语言运营 Locale Ops",
    description: "批量维护多语言词条，按命名空间检索和更新。",
    href: "/i18n/brands",
    tone: "mint"
  },
  {
    title: "产品目录 Products",
    description: "维护产品主数据、关联品牌/品类、参数与合规认证。",
    href: "/admin/collections/products",
    tone: "amber"
  },
  {
    title: "品类管理 Categories",
    description: "管理品类命名、kind 分类和年龄段说明。",
    href: "/admin/collections/categories",
    tone: "slate"
  },
  {
    title: "媒体资源 Media",
    description: "上传和检查封面、图库与派生图元数据。",
    href: "/admin/collections/media",
    tone: "mint"
  },
  {
    title: "站点页面 Site Pages",
    description: "维护首页、产品页、评测页等可配置页面文案。",
    href: "/admin/collections/site-pages",
    tone: "amber"
  }
];

function cardStyle(tone: ShortcutCard["tone"]): React.CSSProperties {
  const palette: Record<ShortcutCard["tone"], React.CSSProperties> = {
    primary: { borderColor: "#cfe1ef", background: "linear-gradient(135deg, #eef7fd 0%, #ffffff 100%)" },
    mint: { borderColor: "#cfe9df", background: "linear-gradient(135deg, #eefbf6 0%, #ffffff 100%)" },
    amber: { borderColor: "#f1dec0", background: "linear-gradient(135deg, #fff7ea 0%, #ffffff 100%)" },
    slate: { borderColor: "#d8e0e8", background: "linear-gradient(135deg, #f6f9fb 0%, #ffffff 100%)" }
  };
  return palette[tone];
}

function statStyle(tone: ShortcutCard["tone"]): React.CSSProperties {
  return {
    ...cardStyle(tone),
    border: "1px solid",
    borderRadius: 14,
    padding: 14,
    color: "#18313f",
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
    minHeight: 92,
  };
}

function taskStyle(tone: ShortcutCard["tone"], active: boolean): React.CSSProperties {
  const base = cardStyle(tone);
  return {
    ...base,
    border: "1px solid",
    borderRadius: 14,
    padding: 14,
    color: "#18313f",
    boxShadow: active ? "0 0 0 2px rgba(29, 91, 136, 0.16), 0 1px 0 rgba(0,0,0,0.03)" : "0 1px 0 rgba(0,0,0,0.02)",
    minHeight: 94,
    display: "block",
    textDecoration: "none",
    opacity: active ? 1 : 0.68,
    transform: active ? "translateY(-1px)" : "none",
    transition: "all 120ms ease",
  };
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default async function Page({ params, searchParams }: Args) {
  const { segments = [] } = await params;
  const isDashboardRoot = segments.length === 0;

  if (segments[0] === "create-first-user") {
    const payload = await getPayload({ config });
    const users = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      pagination: false,
    });

    if (users.docs.length > 0) {
      redirect("/admin/login");
    }
  }

  const payload = await getPayload({ config });
  const [reviewsResult, productsResult, localeResult, categoriesResult] = await Promise.all([
    payload.find({ collection: "reviews", depth: 0, limit: 300, pagination: false }),
    payload.find({ collection: "products", depth: 0, limit: 300, pagination: false }),
    payload.find({ collection: "locale-entries", depth: 0, limit: 300, pagination: false }),
    payload.find({ collection: "categories", depth: 0, limit: 300, pagination: false })
  ]);

  const reviewDocs = reviewsResult.docs.length;
  const publishedReviews = reviewsResult.docs.filter((doc: any) => doc?.status === "published").length;
  const draftReviews = reviewsResult.docs.filter((doc: any) => doc?.status === "draft").length;
  const complianceReviews = reviewsResult.docs.filter((doc: any) => doc?.status === "compliance").length;
  const chiefReviews = reviewsResult.docs.filter((doc: any) => doc?.status === "chief").length;
  const productDocs = productsResult.docs.length;
  const productsMissingSummary = productsResult.docs.filter((doc: any) => !String(doc?.summary ?? "").trim()).length;
  const localeDocs = localeResult.docs.length;
  const localesMissingDescription = localeResult.docs.filter((doc: any) => !String(doc?.description ?? "").trim()).length;
  const categoryDocs = categoriesResult.docs.length;
  const categoriesMissingAgeRange = categoriesResult.docs.filter((doc: any) => !String(doc?.ageRange ?? "").trim()).length;

  const stats: StatCard[] = [
    { label: "评测总数 Reviews", value: String(reviewDocs), hint: `${publishedReviews} 已发布`, tone: "primary" },
    { label: "产品总数 Products", value: String(productDocs), hint: "目录主数据", tone: "amber" },
    { label: "词条总数 Locale Entries", value: String(localeDocs), hint: "多语言运营", tone: "mint" },
    { label: "品类总数 Categories", value: String(categoryDocs), hint: "分类结构", tone: "slate" }
  ];

  const tasks: TaskCard[] = [
    { label: "评测草稿 Reviews", value: String(draftReviews), hint: "还没进入审核流", href: "/admin/collections/reviews?where[status][equals]=draft", tone: "primary" },
    { label: "待合规 Reviews", value: String(complianceReviews), hint: "需要合规确认", href: "/admin/collections/reviews?where[status][equals]=compliance", tone: "amber" },
    { label: "待主编 Reviews", value: String(chiefReviews), hint: "等待终审和锁分", href: "/admin/collections/reviews?where[status][equals]=chief", tone: "slate" },
    {
      label: "待补摘要产品",
      value: String(productsMissingSummary),
      hint: "产品摘要为空",
      href: "/admin/collections/products?where[or][0][summary][exists]=false&where[or][1][summary][equals]=",
      tone: "amber"
    },
    {
      label: "待补说明词条",
      value: String(localesMissingDescription),
      hint: "Locale Entries 缺少说明",
      href: "/admin/collections/locale-entries?where[or][0][description][exists]=false&where[or][1][description][equals]=",
      tone: "mint"
    },
    {
      label: "待补年龄段品类",
      value: String(categoriesMissingAgeRange),
      hint: "品类年龄段为空",
      href: "/admin/collections/categories?where[or][0][ageRange][exists]=false&where[or][1][ageRange][equals]=",
      tone: "slate"
    }
  ];

  return (
    <>
      {isDashboardRoot && (
        <section
          style={{
            margin: "12px 16px 0",
            padding: 16,
            border: "1px solid #d8e3ea",
            borderRadius: 14,
            background: "linear-gradient(180deg, #f8fbfd 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: "#163a57" }}>后台运营工作台</h2>
              <p style={{ margin: "6px 0 0", color: "#55646d", fontSize: 13 }}>
                先看待处理内容，再进入集合编辑，减少后台来回跳转。
              </p>
            </div>
            <a
              href="/i18n/brands"
              style={{
                color: "#174a74",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              快捷入口: 多语言运营页 (Locale Operations)
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 16 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={statStyle(stat.tone)}>
                <div style={{ fontSize: 13, color: "#5a6a75", marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color: "#123047" }}>{stat.value}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#60717d" }}>{stat.hint}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: "#163a57" }}>待处理任务</h3>
                <p style={{ margin: "6px 0 0", color: "#55646d", fontSize: 13 }}>这些内容优先处理，能最快改善前台数据完整度。</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {tasks.map((task) => (
                <a key={task.label} href={task.href} style={taskStyle(task.tone, Number(task.value) > 0)}>
                  <div style={{ fontSize: 13, color: "#5a6a75", marginBottom: 8 }}>{task.label}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color: "#123047" }}>{task.value}</div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        color: Number(task.value) > 0 ? "#0f4a75" : "#718793",
                        background: Number(task.value) > 0 ? "#e6f1fb" : "#eef2f5",
                        border: "1px solid",
                        borderColor: Number(task.value) > 0 ? "#c8dff2" : "#d7e0e6",
                        borderRadius: 999,
                        padding: "2px 8px"
                      }}
                    >
                      {Number(task.value) > 0 ? "需处理" : "已清空"}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#60717d" }}>{task.hint}</div>
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
            {shortcutCards.map((card) => (
              <a
                key={card.href}
                href={card.href}
                style={{
                  ...cardStyle(card.tone),
                  border: "1px solid",
                  borderRadius: 14,
                  padding: 14,
                  color: "#18313f",
                  textDecoration: "none",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, color: "#516371" }}>{card.description}</div>
              </a>
            ))}
          </div>
        </section>
      )}
      {RootPage({ config, params, searchParams, importMap })}
    </>
  );
}
