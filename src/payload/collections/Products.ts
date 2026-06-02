import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: { en: "Product", zh: "产品" }, plural: { en: "Products", zh: "产品" } },
  admin: {
    useAsTitle: "modelName",
    group: { en: "Catalog", zh: "目录管理" },
    defaultColumns: ["modelName", "brand", "category", "msrpCNY", "score", "updatedAt"]
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: "modelName", type: "text", required: true, label: { en: "Model", zh: "型号" } },
    { name: "slug", type: "text", required: true, unique: true, index: true, label: { en: "Slug", zh: "标识" } },
    { name: "brand", type: "relationship", relationTo: "brands", required: true, label: { en: "Brand", zh: "品牌" } },
    { name: "category", type: "relationship", relationTo: "categories", required: true, label: { en: "Category", zh: "品类" } },
    { name: "cover", type: "upload", relationTo: "media" },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    { name: "msrpCNY", type: "number", label: { en: "MSRP (CNY)", zh: "建议零售价(¥)" } },
    {
      name: "params",
      type: "group",
      label: { en: "Parameters", zh: "参数" },
      fields: [
        { name: "weightKg", type: "number", label: { en: "Weight (kg)", zh: "整车重量(kg)" } },
        { name: "loadKg", type: "number", label: { en: "Max Load (kg)", zh: "最大承重(kg)" } },
        { name: "foldedSize", type: "text", label: { en: "Folded Size", zh: "折叠尺寸" } },
        { name: "expandedSize", type: "text", label: { en: "Expanded Size", zh: "展开尺寸" } },
        { name: "reclineDeg", type: "number", label: { en: "Recline Angle (deg)", zh: "躺角(度)" } },
        { name: "bidirectional", type: "checkbox", label: { en: "Bidirectional Seat", zh: "双向座椅" } }
      ]
    },
    {
      name: "certifications",
      type: "select",
      hasMany: true,
      label: { en: "Certifications", zh: "合规认证" },
      options: [
        { label: "EN1888", value: "en1888" },
        { label: "ASTM F833", value: "astm_f833" },
        { label: "CPSC", value: "cpsc" },
        { label: "GB 14749", value: "gb14749" },
        { label: "CCC", value: "ccc" }
      ]
    },
    { name: "summary", type: "textarea", localized: true },
    {
      name: "score",
      type: "number",
      min: 0, max: 10,
      admin: { description: "Calculated by review system; read-only after chief lock", readOnly: true, position: "sidebar" }
    },
    {
      name: "scoreLocked",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "After chief lock, all changes must be audited", position: "sidebar" }
    }
  ],
  timestamps: true
};
