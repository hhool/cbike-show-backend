import { ValidationError, type CollectionConfig } from "payload";

const SYSTEM_KEYS = ["ranking", "newbie", "single", "compare", "value", "debunk", "cross_border"] as const;

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-]/g, "-")
    .replace(/-+/g, "-");
}

export const ReviewCategories: CollectionConfig = {
  slug: "review-categories",
  labels: {
    singular: { en: "Review Category", zh: "测评分类" },
    plural: { en: "Review Categories", zh: "测评分类" },
  },
  admin: {
    useAsTitle: "key",
    group: { en: "Editorial", zh: "内容编辑" },
    defaultColumns: ["key", "name", "isSystem", "isVisibleInTabs", "sortOrder", "updatedAt"],
    description: "用于测评中心后台归类与前台分类展示；建议 key 与测评 type 保持一致。",
  },
  access: {
    read: () => true,
    readVersions: () => true,
    delete: ({ doc }) => !(doc as any)?.isSystem,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data;
        return { ...(data as Record<string, unknown>), key: normalizeKey((data as any).key) };
      },
    ],
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const key = normalizeKey((data as any)?.key ?? (originalDoc as any)?.key);
        const isSystem = Boolean((data as any)?.isSystem ?? (originalDoc as any)?.isSystem);

        if (isSystem && !SYSTEM_KEYS.includes(key as (typeof SYSTEM_KEYS)[number])) {
          throw new ValidationError({
            collection: "review-categories",
            errors: [
              {
                path: "key",
                message: "系统测评分类仅允许使用预设 key。System review categories must use reserved keys.",
              },
            ],
            req,
          });
        }

        return { ...(data as Record<string, unknown>), key };
      },
    ],
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { en: "Stable Key", zh: "稳定键" },
      admin: { description: "例如 ranking/newbie/single；建议与测评记录 type 对应。" },
    },
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      label: { en: "Display Name", zh: "显示名称" },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: { en: "Description", zh: "分类说明" },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 100,
      label: { en: "Sort Order", zh: "排序" },
      admin: { position: "sidebar" },
    },
    {
      name: "isVisibleInTabs",
      type: "checkbox",
      defaultValue: true,
      label: { en: "Visible in Tabs", zh: "前台 Tab 展示" },
      admin: { position: "sidebar" },
    },
    {
      name: "isSystem",
      type: "checkbox",
      defaultValue: false,
      label: { en: "System Category", zh: "系统分类" },
      admin: { position: "sidebar" },
    },
  ],
  timestamps: true,
};
