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
    defaultColumns: ["namespace", "key", "updatedAt"],
    description: "用于维护前台/后台的固定文案词条，适合批量检索、校对和补译。"
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
        { label: "后台（Admin）", value: "admin" },
        { label: "首页（Home）", value: "home" },
        { label: "产品（Products）", value: "products" },
        { label: "评测（Reviews）", value: "reviews" },
        { label: "品类（Categories）", value: "categories" },
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
      admin: { description: "建议使用稳定 key，例如 home.emptyState、reviews.filter.single。" }
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
      label: { en: "Description", zh: "说明" },
      admin: { description: "用于标记词条用途、上下文或来源。" }
    }
  ],
  timestamps: true
};
