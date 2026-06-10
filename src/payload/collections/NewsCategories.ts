import { ValidationError, type CollectionConfig } from "payload";

const SYSTEM_KEYS = ["industry", "new", "compliance", "warn", "brand", "explain"] as const;

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-]/g, "-")
    .replace(/-+/g, "-");
}

export const NewsCategories: CollectionConfig = {
  slug: "news-categories",
  labels: {
    singular: { en: "News Category", zh: "资讯分类" },
    plural: { en: "News Categories", zh: "资讯分类" }
  },
  admin: {
    useAsTitle: "key",
    group: { en: "Editorial", zh: "内容编辑" },
    defaultColumns: ["key", "isSystem", "isVisibleInTabs", "sortOrder", "updatedAt"],
    description: "固定 6 类建议保持稳定 key，扩展类可新增并控制前台是否展示。"
  },
  access: {
    read: () => true,
    readVersions: () => true,
    delete: ({ doc }) => !(doc as any)?.isSystem
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { en: "Stable Key", zh: "稳定键" },
      admin: { description: "例如 industry/new/compliance/warn/brand/explain 或自定义 key。" }
    },
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      label: { en: "Display Name", zh: "显示名称" }
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: { en: "Description", zh: "说明" }
    },
    {
      name: "isSystem",
      type: "checkbox",
      defaultValue: false,
      label: { en: "System Category", zh: "系统分类" },
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "系统分类不允许删除，且 key 不可变。"
      }
    },
    {
      name: "isVisibleInTabs",
      type: "checkbox",
      defaultValue: true,
      label: { en: "Show in Front Tabs", zh: "前台 Tab 可见" },
      admin: { position: "sidebar" }
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 100,
      label: { en: "Sort Order", zh: "排序值" },
      admin: { position: "sidebar" }
    },
    {
      name: "styleVariant",
      type: "select",
      defaultValue: "normal",
      label: { en: "Visual Variant", zh: "视觉样式" },
      options: [
        { label: "普通（Normal）", value: "normal" },
        { label: "预警（Warn）", value: "warn" }
      ],
      admin: { position: "sidebar" }
    }
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data;
        const next = { ...(data as Record<string, unknown>) };

        if (typeof next.key === "string") {
          next.key = normalizeKey(next.key);
        }

        if (typeof next.key === "string" && SYSTEM_KEYS.includes(next.key as (typeof SYSTEM_KEYS)[number])) {
          next.isSystem = true;
        }

        return next;
      }
    ],
    beforeChange: [
      ({ operation, originalDoc, data, req }) => {
        if (operation !== "update") return data;

        const original = (originalDoc ?? {}) as Record<string, unknown>;
        const next = { ...(data as Record<string, unknown> | undefined) };
        const originalIsSystem = Boolean(original.isSystem);

        if (!originalIsSystem) return data;

        const nextKey = typeof next.key === "string" ? normalizeKey(next.key) : String(original.key ?? "");
        const originalKey = normalizeKey(original.key);

        if (nextKey !== originalKey) {
          throw new ValidationError({
            collection: "news-categories",
            errors: [{ path: "key", message: "系统分类 key 不允许修改。System category key is immutable." }],
            req
          });
        }

        if (next.isSystem === false) {
          throw new ValidationError({
            collection: "news-categories",
            errors: [{ path: "isSystem", message: "系统分类标记不可关闭。System category flag cannot be disabled." }],
            req
          });
        }

        return data;
      }
    ],
    beforeDelete: [
      ({ req, id, collection }) => {
        const systemId = String(id ?? "");
        if (!systemId) return;

        throw new ValidationError({
          collection: collection?.slug ?? "news-categories",
          errors: [{ path: "id", message: "系统分类不允许删除。System category cannot be deleted." }],
          req
        });
      }
    ]
  },
  timestamps: true
};
