import { ValidationError, type CollectionConfig } from "payload";

const SYSTEM_KEYS = [
  "beginner",
  "scenario",
  "budget",
  "risk",
  "crossborder",
  "category",
  "maintenance",
] as const;

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-]/g, "-")
    .replace(/-+/g, "-");
}

export const GuideCategories: CollectionConfig = {
  slug: "guide-categories",
  labels: {
    singular: { en: "Buying Category", zh: "选购分类" },
    plural: { en: "Buying Categories", zh: "选购分类" },
  },
  admin: {
    useAsTitle: "key",
    group: { en: "Editor", zh: "Editor" },
    defaultColumns: ["key", "name", "isSystem", "isVisibleInTabs", "sortOrder", "updatedAt"],
    description: "用于选购指南前台筛选与后台归类；key 需与指南 category 字段一致。",
  },
  access: {
    read: () => true,
    readVersions: () => true,
    delete: ({ doc }) => !(doc as any)?.isSystem,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        return { ...data, key: normalizeKey(data.key) };
      },
    ],
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const key = normalizeKey(data?.key ?? originalDoc?.key);
        const isSystem = Boolean(data?.isSystem ?? originalDoc?.isSystem);
        if (isSystem && !SYSTEM_KEYS.includes(key as (typeof SYSTEM_KEYS)[number])) {
          throw new ValidationError({
            collection: "guide-categories",
            errors: [
              {
                path: "key",
                message: "系统选购分类仅允许使用预设 key。System buying categories must use a reserved key.",
              },
            ],
            req,
          });
        }
        return { ...data, key };
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
      admin: { description: "例如 beginner/scenario/budget；需与选购指南的 category 字段一致。" },
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
      defaultValue: 0,
      label: { en: "Sort Order", zh: "排序" },
      admin: { position: "sidebar" },
    },
    {
      name: "isVisibleInTabs",
      type: "checkbox",
      defaultValue: true,
      label: { en: "Visible in Tabs", zh: "前台分类 Tab 展示" },
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