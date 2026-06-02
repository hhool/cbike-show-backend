import type { CollectionConfig } from "payload";

export const Brands: CollectionConfig = {
  slug: "brands",
  labels: { singular: { en: "Brand", zh: "品牌" }, plural: { en: "Brands", zh: "品牌" } },
  admin: { useAsTitle: "name", group: { en: "Catalog", zh: "目录管理" }, defaultColumns: ["name", "country", "updatedAt"] },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true, label: { en: "Brand Name", zh: "品牌名称" } },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "country", type: "text", label: { en: "Country", zh: "国家/地区" }, admin: { description: "ISO country code, e.g. NL / US / CN" } },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "intro", type: "textarea", localized: true, label: { en: "Brand Intro", zh: "品牌简介" } }
  ],
  timestamps: true
};
