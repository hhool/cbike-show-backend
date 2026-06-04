import type { CollectionConfig } from "payload";

export const LocaleEntries: CollectionConfig = {
  slug: "locale-entries",
  labels: {
    singular: { en: "Locale Entry", zh: "多语言词条" },
    plural: { en: "Locale Entries", zh: "多语言词条" }
  },
  admin: {
    useAsTitle: "key",
    group: { en: "Content", zh: "内容编辑" },
    defaultColumns: ["namespace", "key", "updatedAt"]
  },
  access: { read: () => true },
  fields: [
    {
      name: "namespace",
      type: "select",
      required: true,
      defaultValue: "common",
      options: [
        { label: "通用（Common）", value: "common" },
        { label: "首页（Home）", value: "home" },
        { label: "产品（Products）", value: "products" },
        { label: "评测（Reviews）", value: "reviews" },
        { label: "品牌（Brands）", value: "brands" }
      ]
    },
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { en: "Entry Key", zh: "词条键" },
      admin: { description: "Use stable keys like home.emptyState." }
    },
    {
      name: "value",
      type: "textarea",
      required: true,
      localized: true,
      label: { en: "Localized Value", zh: "本地化值" }
    },
    {
      name: "description",
      type: "text",
      label: { en: "Description", zh: "说明" }
    }
  ],
  timestamps: true
};
