import { ValidationError, type CollectionConfig } from "payload";

type NewsStatus = "draft" | "compliance" | "chief" | "published" | "archived";
type LocaleCode = "zh" | "en";

type LocalizedSnapshot = {
  title: string;
  summary: string;
  body: unknown;
};

function isNewsStatus(value: unknown): value is NewsStatus {
  return value === "draft" || value === "compliance" || value === "chief" || value === "published" || value === "archived";
}

function normalizeSlug(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-/]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");
}

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

function fieldLabel(field: "title" | "summary" | "body", language: LocaleCode): string {
  if (language === "zh") {
    if (field === "title") return "标题";
    if (field === "summary") return "摘要";
    return "正文";
  }

  if (field === "title") return "title";
  if (field === "summary") return "summary";
  return "body";
}

function localeLabel(locale: LocaleCode, language: LocaleCode): string {
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

function pickMediaVariantUrl(cover: any, variant: "thumb" | "card" | "hero" | "original"): string {
  if (!cover || typeof cover !== "object") return "";

  const bySize = String(cover?.sizes?.[variant]?.url ?? "").trim();
  if (bySize) return bySize;

  const storageKeyMap: Record<string, string> = {
    thumb: "storageKeyThumb",
    card: "storageKeyCard",
    hero: "storageKeyHero",
    original: "storageKeyOriginal",
  };

  const byStorage = String(cover?.[storageKeyMap[variant]] ?? "").trim();
  if (byStorage) return byStorage;

  const fallback = String(cover?.url ?? "").trim();
  return fallback;
}

function deriveNewsThumbnail(doc: any): any {
  if (!doc || typeof doc !== "object") return doc;

  const cover = doc.cover;
  if (!cover || typeof cover !== "object") {
    doc.thumbnail = null;
    return doc;
  }

  doc.thumbnail = {
    thumb: pickMediaVariantUrl(cover, "thumb"),
    card: pickMediaVariantUrl(cover, "card"),
    hero: pickMediaVariantUrl(cover, "hero"),
    original: pickMediaVariantUrl(cover, "original"),
  };

  return doc;
}

function isTransitionAllowed(from: NewsStatus, to: NewsStatus): boolean {
  if (from === to) return true;
  if (to === "draft") return true;

  if (from === "draft" && to === "compliance") return true;
  if (from === "compliance" && to === "chief") return true;
  if (from === "chief" && to === "published") return true;
  if (from === "published" && to === "archived") return true;
  if (from === "archived" && to === "draft") return true;

  return false;
}

export const News: CollectionConfig = {
  slug: "news",
  labels: {
    singular: { en: "News Article", zh: "资讯文章" },
    plural: { en: "News", zh: "全球资讯" }
  },
  admin: {
    useAsTitle: "title",
    group: { en: "Editorial", zh: "内容编辑" },
    defaultColumns: ["title", "category", "status", "isAlert", "isPinned", "publishedAt", "updatedAt"],
    description: "支持三审流转、双语完整度校验、定时发布与置顶/预警运营位。"
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
      label: { en: "Title", zh: "标题" }
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { en: "Slug", zh: "标识" },
      admin: { description: "建议使用英文短横线，作为前台详情路由 key。" }
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "news-categories",
      required: true,
      label: { en: "Category", zh: "分类" }
    },
    {
      name: "tags",
      type: "array",
      labels: { singular: { en: "Tag", zh: "标签" }, plural: { en: "Tags", zh: "标签" } },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          localized: true,
          label: { en: "Tag Name", zh: "标签名称" }
        }
      ]
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: { en: "Cover", zh: "封面图" },
      admin: {
        description: "用于前台列表缩略图与详情头图。建议上传横版封面（至少 1200x800）。"
      }
    },
    {
      name: "summary",
      type: "textarea",
      localized: true,
      label: { en: "Summary", zh: "摘要" }
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      label: { en: "Body", zh: "正文" }
    },
    {
      name: "sourceName",
      type: "text",
      label: { en: "Source Name", zh: "来源名称" },
      admin: { description: "如 CPSC / ASTM / CEN / 官方公告。" }
    },
    {
      name: "sourceUrl",
      type: "text",
      label: { en: "Source URL", zh: "来源链接" }
    },
    {
      name: "regions",
      type: "select",
      hasMany: true,
      defaultValue: ["global"],
      label: { en: "Target Regions", zh: "目标区域" },
      options: [
        { label: "全球（Global）", value: "global" },
        { label: "北美（North America）", value: "north_america" },
        { label: "欧洲（Europe）", value: "europe" },
        { label: "亚太（APAC）", value: "apac" },
        { label: "中东（Middle East）", value: "middle_east" },
        { label: "拉美（LATAM）", value: "latam" }
      ]
    },
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
    {
      name: "transitionNote",
      type: "textarea",
      label: { en: "Transition Note", zh: "流转备注" },
      admin: {
        position: "sidebar",
        description: "状态变更建议写明原因；从非草稿回退到草稿时为必填。"
      }
    },
    {
      name: "scheduledAt",
      type: "date",
      admin: { position: "sidebar" },
      label: { en: "Scheduled Publish Time", zh: "定时发布时间" }
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
      label: { en: "Published Time", zh: "实际发布时间" }
    },
    {
      name: "expiresAt",
      type: "date",
      admin: { position: "sidebar" },
      label: { en: "Expire Time", zh: "下线时间" }
    },
    {
      name: "isPinned",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
      label: { en: "Pinned", zh: "置顶" }
    },
    {
      name: "pinWeight",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
      label: { en: "Pin Weight", zh: "置顶权重" }
    },
    {
      name: "pinExpiresAt",
      type: "date",
      admin: { position: "sidebar" },
      label: { en: "Pin Expire Time", zh: "置顶过期时间" }
    },
    {
      name: "isAlert",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
      label: { en: "Safety Alert", zh: "预警插队" }
    },
    {
      name: "alertLevel",
      type: "select",
      defaultValue: "notice",
      options: [
        { label: "提示（Notice）", value: "notice" },
        { label: "警示（Warning）", value: "warning" },
        { label: "严重（Critical）", value: "critical" }
      ],
      admin: { position: "sidebar" },
      label: { en: "Alert Level", zh: "预警级别" }
    },
    {
      name: "seo",
      type: "group",
      label: { en: "SEO", zh: "SEO" },
      fields: [
        { name: "metaTitle", type: "text", localized: true, label: { en: "Meta Title", zh: "Meta 标题" } },
        { name: "metaDescription", type: "textarea", localized: true, label: { en: "Meta Description", zh: "Meta 描述" } }
      ]
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar", readOnly: true },
      label: { en: "Created By", zh: "创建人" }
    }
  ],
  hooks: {
    beforeChange: [
      async (args: any) => {
        const { data, originalDoc, req, operation } = args;
        const nextData = { ...(data ?? {}) };

        if (typeof nextData.slug === "string") {
          nextData.slug = normalizeSlug(nextData.slug);
        }

        const currentStatus: NewsStatus = isNewsStatus(originalDoc?.status) ? originalDoc.status : "draft";
        const requestedStatus: NewsStatus = isNewsStatus(nextData?.status) ? nextData.status : currentStatus;

        if (operation === "create") {
          nextData.status = "draft";
          nextData._status = "draft";
          if (!nextData.createdBy && req?.user?.id) {
            nextData.createdBy = req.user.id;
          }
          return nextData;
        }

        if (!isTransitionAllowed(currentStatus, requestedStatus)) {
          throw new ValidationError({
            collection: "news",
            errors: [
              {
                path: "status",
                message: `状态流转不允许：${currentStatus} -> ${requestedStatus}。Allowed transitions only follow draft -> compliance -> chief -> published -> archived, or rollback to draft.`
              }
            ],
            req
          });
        }

        const statusChanged = requestedStatus !== currentStatus;
        nextData.status = requestedStatus;
        nextData._status = requestedStatus;

        if (statusChanged && requestedStatus === "published") {
          const coverValue = nextData?.cover ?? originalDoc?.cover;
          if (!coverValue) {
            throw new ValidationError({
              collection: "news",
              errors: [
                {
                  path: "cover",
                  message:
                    "发布前必须设置封面图（Cover）以支持前台缩略图渲染。Cover image is required when publishing to ensure thumbnail rendering on the frontend."
                }
              ],
              req
            });
          }
        }

        if (statusChanged && requestedStatus === "draft" && currentStatus !== "draft") {
          const transitionNote = String(nextData.transitionNote ?? "").trim();
          if (!transitionNote) {
            throw new ValidationError({
              collection: "news",
              errors: [
                {
                  path: "transitionNote",
                  message: "回退到草稿时必须填写流转备注。Transition note is required when rolling back to draft."
                }
              ],
              req
            });
          }
        }

        if (requestedStatus !== "published") {
          return nextData;
        }

        const locales: LocaleCode[] = ["zh", "en"];
        const activeLocale = req?.locale === "zh" || req?.locale === "en" ? (req.locale as LocaleCode) : null;
        const docId = String(originalDoc?.id ?? nextData?.id ?? "").trim();

        const localeSnapshots: Record<LocaleCode, LocalizedSnapshot> = {
          zh: { title: "", summary: "", body: null },
          en: { title: "", summary: "", body: null }
        };

        for (const locale of locales) {
          let dbDoc: any = null;
          if (docId) {
            try {
              dbDoc = await req.payload.findByID({
                collection: "news",
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
          throw new ValidationError({
            collection: "news",
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
                  .join(", ")}.`
              }
            ],
            req
          });
        }

        if (!nextData?.publishedAt && !originalDoc?.publishedAt) {
          nextData.publishedAt = new Date().toISOString();
        }

        return nextData;
      }
    ],
    afterRead: [
      async ({ doc }) => deriveNewsThumbnail(doc)
    ]
  },
  timestamps: true
};
