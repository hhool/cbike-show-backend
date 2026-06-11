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

function extractRelationID(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "number") return String(id);
    if (typeof id === "string") return id.trim();
  }
  return "";
}

type ReviewStatus = "draft" | "compliance" | "chief" | "published" | "archived";

function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === "draft" || value === "compliance" || value === "chief" || value === "published" || value === "archived";
}

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: { singular: { en: "Review", zh: "测评" }, plural: { en: "Reviews", zh: "测评" } },
  admin: {
    useAsTitle: "title",
    group: { en: "Editorial", zh: "内容编辑" },
    defaultColumns: ["title", "type", "status", "scoreOverall", "publishedAt"],
    description: "测评标题、摘要、正文均按 zh / en locale 分开保存；编辑正文时请切换顶部语言分别填写。"
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
      type: "text",
      required: true,
      defaultValue: "single",
      label: { en: "Review Type Key", zh: "测评分类键" },
      admin: {
        position: "sidebar",
        description: "兼容筛选键，建议与测评分类 key 一致，如 ranking/newbie/single。"
      }
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "review-categories",
      label: { en: "Review Category", zh: "测评分类" },
      admin: {
        position: "sidebar",
        description: "用于测评中心分类展示；支持后台新增/编辑/删除/排序。"
      }
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
      label: { en: "Review Body (English / Chinese separated by locale)", zh: "正文内容（中文 / 英文按语言分开填写）" },
      admin: { description: "请在后台顶部切换 zh / en locale，分别填写中文正文和英文正文；不要把中英文混写在同一个语言正文里。" }
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

        const categoryID = extractRelationID(nextData?.category ?? originalDoc?.category);
        if (categoryID) {
          try {
            const categoryDoc = await req.payload.findByID({
              collection: "review-categories",
              id: categoryID,
              depth: 0,
              locale: "zh",
              fallbackLocale: false,
            });
            const key = String(categoryDoc?.key ?? "").trim();
            if (key) nextData.type = key;
          } catch {
            // keep existing type when category lookup fails
          }
        } else {
          const typeKey = String(nextData?.type ?? originalDoc?.type ?? "").trim().toLowerCase();
          if (typeKey) {
            try {
              const categoryPayload = await req.payload.find({
                collection: "review-categories",
                locale: "zh",
                fallbackLocale: false,
                depth: 0,
                limit: 1,
                where: { key: { equals: typeKey } },
              });
              const matched = Array.isArray(categoryPayload?.docs) ? categoryPayload.docs[0] : null;
              if (matched?.id) nextData.category = matched.id;
            } catch {
              // keep type-only compatibility when category is not configured
            }
          }
        }

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

          if (activeLocale === locale) {
            localeSnapshots[locale] = mergeLocaleDraft(dbDoc, nextData);
          } else {
            localeSnapshots[locale] = mergeLocaleDraft(dbDoc, {});
          }
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
