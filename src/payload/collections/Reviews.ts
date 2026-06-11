import { ValidationError, type CollectionConfig } from "payload";

type LocalizedSnapshot = {
  title: string;
  summary: string;
  body: unknown;
};

function extractRichTextPlainText(value: unknown): string {
  const walk = (node: any): string => {
    if (node == null) return "";
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(walk).join(" ");
    if (typeof node !== "object") return "";

    const text = typeof node.text === "string" ? node.text : "";
    const children = walk(node.children);
    const root = walk(node.root);
    const content = walk(node.content);

    return `${text} ${children} ${root} ${content}`.trim();
  };

  return walk(value).replace(/\s+/g, " ").trim();
}

function getMissingFields(snapshot: LocalizedSnapshot): Array<"title" | "summary" | "body"> {
  const missing: Array<"title" | "summary" | "body"> = [];
  if (!String(snapshot.title ?? "").trim()) missing.push("title");
  if (!String(snapshot.summary ?? "").trim()) missing.push("summary");
  if (!extractRichTextPlainText(snapshot.body)) missing.push("body");
  return missing;
}

function fieldLabel(field: "title" | "summary" | "body", language: "zh" | "en"): string {
  if (language === "zh") {
    if (field === "title") return "标题";
    if (field === "summary") return "摘要";
    return "正文";
  }
  if (field === "title") return "title";
  if (field === "summary") return "summary";
  return "body";
}

function localeLabel(locale: "zh" | "en", language: "zh" | "en"): string {
  if (language === "zh") return locale === "zh" ? "中文 zh" : "英文 en";
  return locale === "zh" ? "Chinese zh" : "English en";
}

function mergeLocaleDraft(base: Partial<LocalizedSnapshot> | null, data: any): LocalizedSnapshot {
  return {
    title: String(data?.title ?? base?.title ?? ""),
    summary: String(data?.summary ?? base?.summary ?? ""),
    body: data?.body ?? base?.body ?? null,
  };
}

type ReviewStatus = "draft" | "compliance" | "chief" | "published" | "archived";

function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === "draft" || value === "compliance" || value === "chief" || value === "published" || value === "archived";
}

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: { singular: { en: "Review", zh: "评测" }, plural: { en: "Reviews", zh: "评测" } },
  admin: {
    useAsTitle: "title",
    group: { en: "Editorial", zh: "内容编辑" },
    defaultColumns: ["title", "type", "status", "scoreOverall", "publishedAt"],
    description: "评测正文使用“中文正文 / English Body”两个独立字段填写，避免中英文混写。"
  },
  access: {
    read: () => true,
    readVersions: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { en: "Review Title", zh: "评测标题" },
      admin: { description: "分别在 zh / en locale 下填写对应标题。" }
    },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "single",
      options: [
        { label: "单品实测（Single Review）", value: "single" },
        { label: "多品横评（Comparison Review）", value: "compare" },
        { label: "新品首发（New Arrival Review）", value: "newbie" },
        { label: "跨境专项（Cross-border Special）", value: "cross_border" },
        { label: "性价比（Best Value）", value: "value" },
        { label: "实测甄别（Hands-on Verification）", value: "debunk" },
        { label: "年度榜单（Annual Rankings）", value: "ranking" }
      ],
      admin: { position: "sidebar" }
    },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true, required: true, label: { en: "Related Products", zh: "关联产品" } },
    { name: "cover", type: "upload", relationTo: "media", label: { en: "Cover Image", zh: "封面图" } },
    {
      name: "summary",
      type: "textarea",
      localized: true,
      label: { en: "Summary", zh: "摘要" },
      admin: { description: "建议 1 段精简摘要，zh / en 分别维护。" }
    },
    {
      name: "bodyZh",
      type: "richText",
      label: { en: "Chinese Body", zh: "中文正文" },
      admin: { description: "中文正文内容。前台中文测评详情优先读取此字段。" }
    },
    {
      name: "bodyEn",
      type: "richText",
      label: { en: "English Body", zh: "英文正文" },
      admin: { description: "English body content. The English review detail page prefers this field." }
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      label: { en: "Legacy Localized Body", zh: "旧版多语言正文" },
      admin: { hidden: true, description: "兼容历史 localized 正文数据；新内容请填写中文正文 bodyZh 与英文正文 bodyEn。" }
    },
    {
      name: "scores",
      type: "group",
      label: { en: "5-Axis Scores", zh: "五维评分" },
      fields: [
        { name: "safety", type: "number", min: 0, max: 10 },
        { name: "comfort", type: "number", min: 0, max: 10 },
        { name: "portability", type: "number", min: 0, max: 10 },
        { name: "function", type: "number", min: 0, max: 10 },
        { name: "value", type: "number", min: 0, max: 10 }
      ]
    },
    { name: "scoreOverall", type: "number", min: 0, max: 10, admin: { readOnly: true, position: "sidebar", description: "系统按五维评分自动计算" } },
    { name: "scoreLocked", type: "checkbox", defaultValue: false, admin: { position: "sidebar", description: "主编锁定后不允许手工改分" } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "草稿（Draft）", value: "draft" },
        { label: "待合规（Compliance Review）", value: "compliance" },
        { label: "待主编（Chief Review）", value: "chief" },
        { label: "已发布（Published）", value: "published" },
        { label: "已下线（Archived）", value: "archived" }
      ],
      admin: { position: "sidebar" }
    },
    { name: "publishedAt", type: "date", admin: { position: "sidebar", description: "前台展示发布日期" } }
  ],
  hooks: {
    beforeChange: [
      async (args: any) => {
        const { data, originalDoc, req, operation } = args;
        const nextData = { ...(data ?? {}) };
        const s = nextData?.scores;
        if (s && [s.safety, s.comfort, s.portability, s.function, s.value].every((x: unknown) => typeof x === "number")) {
          // Weighted formula: safety 0.30 / comfort 0.25 / portability 0.15 / function 0.20 / value 0.10
          const overall = s.safety * 0.3 + s.comfort * 0.25 + s.portability * 0.15 + s.function * 0.2 + s.value * 0.1;
          nextData.scoreOverall = Math.round(overall * 10) / 10;
        }

        const docId = String(originalDoc?.id ?? nextData?.id ?? "").trim();
        const isCreate = operation === "create";
        const nextStatus = isReviewStatus(nextData?.status)
          ? nextData.status
          : isReviewStatus(originalDoc?.status)
            ? originalDoc.status
            : "draft";

        if (isCreate && nextStatus !== "draft") {
          // Create flow is always normalized to draft to reduce admin friction.
          nextData.status = "draft";
          nextData._status = "draft";
        } else {
          // Keep status fields aligned on update so admin workflow state persists consistently.
          nextData.status = nextStatus;
          nextData._status = nextStatus;
        }

        const locales: Array<"zh" | "en"> = ["zh", "en"];
        const activeLocale = (req?.locale === "zh" || req?.locale === "en") ? req.locale : null;

        const localeSnapshots: Record<"zh" | "en", LocalizedSnapshot> = {
          zh: { title: "", summary: "", body: null },
          en: { title: "", summary: "", body: null },
        };

        for (const locale of locales) {
          let dbDoc: any = null;
          if (docId) {
            try {
              dbDoc = await req.payload.findByID({
                collection: "reviews",
                id: docId,
                depth: 0,
                locale,
                fallbackLocale: false,
              });
            } catch {
              dbDoc = null;
            }
          }

          const baseSnapshot = activeLocale === locale
            ? mergeLocaleDraft(dbDoc, nextData)
            : mergeLocaleDraft(dbDoc, {});

          const explicitBody = locale === "zh"
            ? (nextData?.bodyZh ?? dbDoc?.bodyZh)
            : (nextData?.bodyEn ?? dbDoc?.bodyEn);

          localeSnapshots[locale] = {
            ...baseSnapshot,
            body: explicitBody ?? baseSnapshot.body,
          };
        }

        if (nextStatus !== "published") return nextData;

        const missingByLocale = locales
          .map((locale) => ({ locale, missing: getMissingFields(localeSnapshots[locale]) }))
          .filter((entry) => entry.missing.length > 0);

        if (missingByLocale.length > 0) {
          throw new ValidationError({
            collection: "reviews",
            errors: [
              {
                path: "status",
                message: `发布已阻止：以下语言字段未完整 ${missingByLocale
                  .map((entry) => {
                    const fields = entry.missing.map((field) => `${fieldLabel(field, "zh")}(${field})`).join("/");
                    return `${localeLabel(entry.locale, "zh")}[${fields}]`;
                  })
                  .join("，")}。Publishing blocked: missing localized fields ${missingByLocale
                  .map((entry) => `${localeLabel(entry.locale, "en")}[${entry.missing.map((field) => fieldLabel(field, "en")).join("/")}]`)
                  .join(", ")}.`,
              },
            ],
            req,
          });
        }

        if (!nextData?.publishedAt && !originalDoc?.publishedAt) {
          nextData.publishedAt = new Date().toISOString();
        }

        return nextData;
      }
    ]
  },
  timestamps: true
};
