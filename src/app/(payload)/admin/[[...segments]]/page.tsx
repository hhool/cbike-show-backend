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
    primary: { borderColor: "var(--theme-elevation-150, #dfe6eb)", background: "var(--theme-elevation-0, #ffffff)" },
    mint: { borderColor: "var(--theme-elevation-150, #dfe6eb)", background: "var(--theme-elevation-0, #ffffff)" },
    amber: { borderColor: "var(--theme-elevation-150, #dfe6eb)", background: "var(--theme-elevation-0, #ffffff)" },
    slate: { borderColor: "var(--theme-elevation-150, #dfe6eb)", background: "var(--theme-elevation-0, #ffffff)" }
  };
  return palette[tone];
}

function statStyle(tone: ShortcutCard["tone"]): React.CSSProperties {
  return {
    ...cardStyle(tone),
    border: "1px solid",
    borderRadius: 8,
    padding: 14,
    color: "var(--theme-text, #1f2933)",
    boxShadow: "none",
    minHeight: 92,
  };
}

function taskStyle(tone: ShortcutCard["tone"], active: boolean): React.CSSProperties {
  const base = cardStyle(tone);
  return {
    ...base,
    border: "1px solid",
    borderRadius: 8,
    padding: 14,
    color: "var(--theme-text, #1f2933)",
    boxShadow: "none",
    borderColor: active ? "var(--theme-success-500, #1f7a4d)" : "var(--theme-elevation-150, #dfe6eb)",
    minHeight: 94,
    display: "block",
    textDecoration: "none",
    opacity: 1,
    transform: "none",
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
      href: "/admin/collections/products?where[summary][equals]=",
      tone: "amber"
    },
    {
      label: "待补说明词条",
      value: String(localesMissingDescription),
      hint: "Locale Entries 缺少说明",
      href: "/admin/collections/locale-entries?where[description][equals]=",
      tone: "mint"
    },
    {
      label: "待补年龄段品类",
      value: String(categoriesMissingAgeRange),
      hint: "品类年龄段为空",
      href: "/admin/collections/categories?where[ageRange][equals]=",
      tone: "slate"
    }
  ];

  return (
    <>
      {isDashboardRoot && (
        <section
          style={{
            position: "sticky",
            top: 0,
            margin: "12px 16px 0",
            zIndex: 8,
          }}
        >
          <details
            style={{
              border: "1px solid var(--theme-elevation-150, #dfe6eb)",
              borderRadius: 8,
              background: "var(--theme-elevation-0, #ffffff)",
              boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                padding: "9px 12px",
                color: "var(--theme-text, #1f2933)",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ fontWeight: 700 }}>后台运营工作台 Admin Ops Workspace</span>
              <span style={{ fontSize: 11, color: "var(--theme-text-light, #5b6670)" }}>默认收起，点击展开 Collapsed by default, click to expand</span>
            </summary>

            <div
              style={{
                padding: "10px 16px 16px",
                borderTop: "1px solid var(--theme-elevation-100, #e8edf1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <p style={{ margin: "4px 0 0", color: "var(--theme-text-light, #5b6670)", fontSize: 13 }}>
                  先看待处理内容，再进入集合编辑，减少后台来回跳转。Review pending items first, then jump into collections.
                </p>
                <a
                  href="/i18n/brands"
                  style={{
                    color: "var(--theme-success-600, #1f7a4d)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  快捷入口 Quick Access: 多语言运营页 Locale Operations
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 12 }}>
                {stats.map((stat) => (
                  <div key={stat.label} style={statStyle(stat.tone)}>
                    <div style={{ fontSize: 13, color: "var(--theme-text-light, #5b6670)", marginBottom: 8 }}>{stat.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: "var(--theme-text, #1f2933)" }}>{stat.value}</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--theme-text-light, #5b6670)" }}>{stat.hint}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: "var(--theme-text, #1f2933)" }}>待处理任务 Pending Tasks</h3>
                  <p style={{ margin: "6px 0 0", color: "var(--theme-text-light, #5b6670)", fontSize: 13 }}>这些内容优先处理，能最快改善前台数据完整度。Prioritize these items for quickest frontend quality gains.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  {tasks.map((task) => (
                    <a key={task.label} href={task.href} style={taskStyle(task.tone, Number(task.value) > 0)}>
                      <div style={{ fontSize: 13, color: "var(--theme-text-light, #5b6670)", marginBottom: 8 }}>{task.label}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: "var(--theme-text, #1f2933)" }}>{task.value}</div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.2,
                            color: Number(task.value) > 0 ? "var(--theme-success-700, #145a39)" : "var(--theme-text-light, #5b6670)",
                            background: Number(task.value) > 0 ? "var(--theme-success-100, #eaf6ef)" : "var(--theme-elevation-50, #f6f8fa)",
                            border: "1px solid",
                            borderColor: Number(task.value) > 0 ? "var(--theme-success-200, #cfe8d9)" : "var(--theme-elevation-150, #dfe6eb)",
                            borderRadius: 999,
                            padding: "2px 8px"
                          }}
                        >
                          {Number(task.value) > 0 ? "需处理 Pending" : "已清空 Clear"}
                        </span>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--theme-text-light, #5b6670)" }}>{task.hint}</div>
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
                      borderRadius: 8,
                      padding: 14,
                      color: "var(--theme-text, #1f2933)",
                      textDecoration: "none",
                      boxShadow: "none",
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>{card.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--theme-text-light, #5b6670)" }}>{card.description}</div>
                  </a>
                ))}
              </div>
            </div>
          </details>
        </section>
      )}
      {RootPage({ config, params, searchParams, importMap })}
    </>
  );
}
