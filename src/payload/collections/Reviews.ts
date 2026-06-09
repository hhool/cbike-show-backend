import type { CollectionConfig } from "payload";

type LocalizedSnapshot = {
  title: string;
  summary: string;
  body: unknown;
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

function isLocaleContentComplete(snapshot: LocalizedSnapshot): boolean {
  const title = String(snapshot.title ?? "").trim();
  const summary = String(snapshot.summary ?? "").trim();
  const body = extractRichTextPlainText(snapshot.body);
  return Boolean(title && summary && body);
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

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: { singular: { en: "Review", zh: "评测" }, plural: { en: "Reviews", zh: "评测" } },
  admin: {
    useAsTitle: "title",
    group: { en: "Editorial", zh: "内容编辑" },
    defaultColumns: ["title", "type", "status", "scoreOverall", "publishedAt"],
    description: "评测内容建议按当前 locale 单独填写，不要把中文和英文混写在同一个字段里。"
  },
  access: { read: () => true },
  versions: { drafts: true },
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
      name: "body",
      type: "richText",
      localized: true,
      label: { en: "Review Body", zh: "正文" },
      admin: { description: "正文按当前语言单独填写，建议分成 3 段，方便前台切分展示。" }
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
      async ({ data, originalDoc, req }) => {
        const nextData = { ...(data ?? {}) };
        const s = nextData?.scores;
        if (s && [s.safety, s.comfort, s.portability, s.function, s.value].every((x: unknown) => typeof x === "number")) {
          // Weighted formula: safety 0.30 / comfort 0.25 / portability 0.15 / function 0.20 / value 0.10
          const overall = s.safety * 0.3 + s.comfort * 0.25 + s.portability * 0.15 + s.function * 0.2 + s.value * 0.1;
          nextData.scoreOverall = Math.round(overall * 10) / 10;
        }

        const nextStatus = nextData?.status ?? originalDoc?.status;
        if (nextStatus !== "published") return nextData;

        const locales: Array<"zh" | "en"> = ["zh", "en"];
        const docId = String(originalDoc?.id ?? nextData?.id ?? "").trim();
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

          if (activeLocale === locale) {
            localeSnapshots[locale] = mergeLocaleDraft(dbDoc, nextData);
          } else {
            localeSnapshots[locale] = mergeLocaleDraft(dbDoc, {});
          }
        }

        const missingByLocale = locales
          .map((locale) => ({ locale, missing: getMissingFields(localeSnapshots[locale]) }))
          .filter((entry) => entry.missing.length > 0);

        if (missingByLocale.length > 0) {
          const zhDetails = missingByLocale
            .map((entry) => {
              const fields = entry.missing.map((field) => `${fieldLabel(field, "zh")}(${field})`).join("/");
              return `${localeLabel(entry.locale, "zh")}[${fields}]`;
            })
            .join("，");
          const enDetails = missingByLocale
            .map((entry) => `${localeLabel(entry.locale, "en")}[${entry.missing.map((field) => fieldLabel(field, "en")).join("/")}]`)
            .join(", ");
          throw new Error(`发布已阻止：以下语言字段未完整 ${zhDetails}。Publishing blocked: missing localized fields ${enDetails}.`);
        }

        return nextData;
      }
    ]
  },
  timestamps: true
};
