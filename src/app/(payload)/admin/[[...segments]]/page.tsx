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

function extractRichTextPlainText(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  const walk = (node: any): string => {
    if (!node || typeof node !== "object") return "";

    const text = typeof node.text === "string" ? node.text : "";
    const children = Array.isArray(node.children) ? node.children.map(walk).join(" ") : "";
    return `${text} ${children}`.trim();
  };

  return walk(value).replace(/\s+/g, " ").trim();
}

function isLocaleCopyComplete(doc: any): boolean {
  const title = String(doc?.title ?? "").trim();
  const summary = String(doc?.summary ?? "").trim();
  const body = extractRichTextPlainText(doc?.body);
  return Boolean(title && summary && body);
}

function getFirstMissingField(doc: any): "title" | "summary" | "body" | null {
  const title = String(doc?.title ?? "").trim();
  if (!title) return "title";
  const summary = String(doc?.summary ?? "").trim();
  if (!summary) return "summary";
  const body = extractRichTextPlainText(doc?.body);
  if (!body) return "body";
  return null;
}

function missingLabel(field: "title" | "summary" | "body" | null, locale: "zh" | "en"): string {
  if (!field) return locale === "zh" ? "已完成" : "Done";
  if (locale === "zh") {
    if (field === "title") return "缺标题";
    if (field === "summary") return "缺摘要";
    return "缺正文";
  }
  if (field === "title") return "Missing Title";
  if (field === "summary") return "Missing Summary";
  return "Missing Body";
}

function normalizeComparableText(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

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
  const query = await searchParams;
  const isDashboardRoot = segments.length === 0;
  const isReviewCreate = segments[0] === "collections" && segments[1] === "reviews" && segments[2] === "create";
  const isReviewEdit =
    segments[0] === "collections" &&
    segments[1] === "reviews" &&
    typeof segments[2] === "string" &&
    segments[2].length > 0 &&
    segments[2] !== "create";
  const isReviewLocalizedEditor = isReviewCreate || isReviewEdit;

  const localeQuery = Array.isArray(query.locale) ? query.locale[0] : query.locale;
  const activeLocale: "zh" | "en" = localeQuery === "en" ? "en" : "zh";

  const reviewLocaleHref = (targetLocale: "zh" | "en") => {
    const reviewPath = `/admin/${segments.join("/")}`;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (key === "locale" || key === "fallback-locale") continue;
      if (Array.isArray(value)) {
        for (const v of value) params.append(key, v);
      } else if (value !== undefined) {
        params.set(key, value);
      }
    }
    params.set("locale", targetLocale);
    params.set("fallback-locale", "none");
    return `${reviewPath}?${params.toString()}`;
  };

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
  let reviewsResult: { docs: any[] } = { docs: [] };
  let productsResult: { docs: any[] } = { docs: [] };
  let localeResult: { docs: any[] } = { docs: [] };
  let categoriesResult: { docs: any[] } = { docs: [] };

  if (isDashboardRoot) {
    const safeFind = async (args: Parameters<typeof payload.find>[0], label: string): Promise<{ docs: any[] }> => {
      try {
        const result = await payload.find(args);
        return { docs: Array.isArray(result.docs) ? (result.docs as any[]) : [] };
      } catch (error) {
        console.error(`[admin-dashboard] failed to query ${label}`, error);
        return { docs: [] };
      }
    };

    [reviewsResult, productsResult, localeResult, categoriesResult] = await Promise.all([
      safeFind({ collection: "reviews", depth: 0, limit: 300, pagination: false }, "reviews"),
      safeFind({ collection: "products", depth: 0, limit: 300, pagination: false }, "products"),
      safeFind({ collection: "locale-entries", depth: 0, limit: 300, pagination: false }, "locale-entries"),
      safeFind({ collection: "categories", depth: 0, limit: 300, pagination: false }, "categories"),
    ]);
  }

  let zhComplete = false;
  let enComplete = false;
  let zhMissingField: "title" | "summary" | "body" | null = null;
  let enMissingField: "title" | "summary" | "body" | null = null;
  let hasSameTitle = false;
  let hasSameSummary = false;
  let hasSameBody = false;
  let recommendedStatusZh = "建议状态：draft（先完善中文）";
  let recommendedStatusEn = "Suggested status: draft (complete Chinese first)";
  let currentStatus: string | null = null;
  let statusRiskZh = "";
  let statusRiskEn = "";
  let publishPrecheckZh = "";
  let publishPrecheckEn = "";
  if (isReviewEdit) {
    const reviewId = segments[2];
    const [zhDoc, enDoc] = await Promise.all([
      payload.findByID({ collection: "reviews", id: reviewId, depth: 0, locale: "zh", fallbackLocale: false }),
      payload.findByID({ collection: "reviews", id: reviewId, depth: 0, locale: "en", fallbackLocale: false })
    ]);
    zhComplete = isLocaleCopyComplete(zhDoc);
    enComplete = isLocaleCopyComplete(enDoc);
    zhMissingField = getFirstMissingField(zhDoc);
    enMissingField = getFirstMissingField(enDoc);

    const zhTitle = normalizeComparableText(zhDoc?.title);
    const enTitle = normalizeComparableText(enDoc?.title);
    const zhSummary = normalizeComparableText(zhDoc?.summary);
    const enSummary = normalizeComparableText(enDoc?.summary);
    const zhBody = normalizeComparableText(extractRichTextPlainText(zhDoc?.body));
    const enBody = normalizeComparableText(extractRichTextPlainText(enDoc?.body));

    hasSameTitle = Boolean(zhTitle && enTitle && zhTitle === enTitle);
    hasSameSummary = Boolean(zhSummary && enSummary && zhSummary === enSummary);
    hasSameBody = Boolean(zhBody && enBody && zhBody === enBody);
    currentStatus = String(zhDoc?.status ?? "").trim() || null;

    if (zhComplete && !enComplete) {
      recommendedStatusZh = "建议状态：compliance（中文已完成，继续补英文）";
      recommendedStatusEn = "Suggested status: compliance (zh ready, continue en copy)";
    } else if (zhComplete && enComplete) {
      recommendedStatusZh = "建议状态：chief / published（双语完整，可进入终审与发布）";
      recommendedStatusEn = "Suggested status: chief / published (both locales complete)";
    }

    if (currentStatus === "published" && (!zhComplete || !enComplete)) {
      statusRiskZh = "风险：当前状态为 published，但双语内容未完整。下次保存会被发布校验阻断。";
      statusRiskEn = "Risk: status is published while bilingual copy is incomplete; next save will be blocked by publish guard.";
    } else if (currentStatus === "chief" && (!zhComplete || !enComplete)) {
      statusRiskZh = "提示：当前为 chief，但双语尚未补齐，建议先回补再发布。";
      statusRiskEn = "Notice: status is chief but bilingual copy is incomplete; complete content before publish.";
    }

    const precheckMissing: string[] = [];
    if (zhMissingField) precheckMissing.push(`中文 zh[${zhMissingField}]`);
    if (enMissingField) precheckMissing.push(`英文 en[${enMissingField}]`);
    if (precheckMissing.length > 0) {
      publishPrecheckZh = `发布前预检：若当前保存为 published，将被阻断。缺失项：${precheckMissing.join("，")}。`;
      publishPrecheckEn = `Pre-publish check: saving as published would be blocked. Missing: ${[
        zhMissingField ? `zh[${zhMissingField}]` : null,
        enMissingField ? `en[${enMissingField}]` : null,
      ]
        .filter(Boolean)
        .join(", ")}.`;
    } else {
      publishPrecheckZh = "发布前预检：双语字段完整，可进入 published。";
      publishPrecheckEn = "Pre-publish check: bilingual fields are complete and ready for published.";
    }
  }

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
      {isReviewLocalizedEditor && (
        <section
          style={{
            position: "sticky",
            top: 0,
            margin: "12px 16px 0",
            zIndex: 9,
            border: "1px solid var(--theme-elevation-150, #dfe6eb)",
            borderRadius: 8,
            background: "var(--theme-elevation-0, #ffffff)",
            boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)",
            padding: "10px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--theme-text, #1f2933)" }}>
                {isReviewCreate ? "新建评测语言快捷切换 Quick Locale Switch" : "编辑评测语言快捷切换 Quick Locale Switch"}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--theme-text-light, #5b6670)" }}>
                先填 zh 再切 en。按钮会直接切换内容 locale，避免手改 URL。Fill zh first, then switch to en.
                {isReviewCreate ? " 新建时若误选非 draft，保存会自动回落为 draft。On create, non-draft status will auto-normalize to draft." : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <a
                href={reviewLocaleHref("zh")}
                style={{
                  textDecoration: "none",
                  border: "1px solid",
                  borderColor: activeLocale === "zh" ? "var(--theme-success-400, #59b284)" : "var(--theme-elevation-200, #c8d2da)",
                  background: activeLocale === "zh" ? "var(--theme-success-100, #eaf6ef)" : "var(--theme-elevation-0, #ffffff)",
                  color: "var(--theme-text, #1f2933)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                中文填写 zh
                {isReviewEdit && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: "1px 6px",
                      border: "1px solid",
                      borderColor: zhComplete ? "var(--theme-success-300, #87c9a8)" : "var(--theme-warning-300, #f0c27a)",
                      background: zhComplete ? "var(--theme-success-50, #f0f9f4)" : "var(--theme-warning-50, #fff7ea)",
                      color: zhComplete ? "var(--theme-success-700, #145a39)" : "var(--theme-warning-800, #8a5a14)",
                    }}
                  >
                    {zhComplete ? "已完成" : "未完成"}
                  </span>
                )}
              </a>
              <a
                href={reviewLocaleHref("en")}
                style={{
                  textDecoration: "none",
                  border: "1px solid",
                  borderColor: activeLocale === "en" ? "var(--theme-success-400, #59b284)" : "var(--theme-elevation-200, #c8d2da)",
                  background: activeLocale === "en" ? "var(--theme-success-100, #eaf6ef)" : "var(--theme-elevation-0, #ffffff)",
                  color: "var(--theme-text, #1f2933)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                English Copy en
                {isReviewEdit && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: "1px 6px",
                      border: "1px solid",
                      borderColor: enComplete ? "var(--theme-success-300, #87c9a8)" : "var(--theme-warning-300, #f0c27a)",
                      background: enComplete ? "var(--theme-success-50, #f0f9f4)" : "var(--theme-warning-50, #fff7ea)",
                      color: enComplete ? "var(--theme-success-700, #145a39)" : "var(--theme-warning-800, #8a5a14)",
                    }}
                  >
                    {enComplete ? "Done" : "Pending"}
                  </span>
                )}
              </a>
            </div>
          </div>
          {isReviewEdit && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--theme-text-light, #5b6670)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span>zh: {missingLabel(zhMissingField, "zh")}</span>
              <span>en: {missingLabel(enMissingField, "en")}</span>
              <span style={{ color: "var(--theme-success-700, #145a39)", fontWeight: 700 }}>{recommendedStatusZh}</span>
              <span style={{ color: "var(--theme-success-700, #145a39)", fontWeight: 700 }}>{recommendedStatusEn}</span>
              {(hasSameTitle || hasSameSummary || hasSameBody) && (
                <span style={{ color: "var(--theme-error-700, #8f1d1d)", fontWeight: 700 }}>
                  预警：检测到 zh/en 存在相同内容（
                  {[hasSameTitle ? "title" : null, hasSameSummary ? "summary" : null, hasSameBody ? "body" : null]
                    .filter(Boolean)
                    .join("/")}
                  ），请确认 en 是否已翻译。Warning: zh/en fields look identical; verify English translation.
                </span>
              )}
              {statusRiskZh && (
                <span style={{ color: "var(--theme-warning-800, #8a5a14)", fontWeight: 700 }}>
                  {statusRiskZh} {statusRiskEn}
                </span>
              )}
              {publishPrecheckZh && (
                <span style={{ color: "var(--theme-text, #1f2933)", fontWeight: 700 }}>
                  {publishPrecheckZh} {publishPrecheckEn}
                </span>
              )}
            </div>
          )}
        </section>
      )}
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
