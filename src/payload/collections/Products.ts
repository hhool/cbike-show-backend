import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: { en: "Product", zh: "产品" }, plural: { en: "Products", zh: "产品" } },
  admin: {
    useAsTitle: "modelName",
    group: { en: "Catalog", zh: "目录管理" },
    defaultColumns: ["modelName", "brand", "category", "msrpCNY", "score", "updatedAt"],
    description: "产品主数据建议先补齐品牌、品类、价格、参数和摘要，再关注评分与锁定状态。"
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: "modelName", type: "text", required: true, label: { en: "Model", zh: "型号" }, admin: { description: "前台展示的主型号名称。" } },
    { name: "slug", type: "text", required: true, unique: true, index: true, label: { en: "Slug", zh: "标识" }, admin: { description: "用于 URL 和数据关联，建议固定且唯一。" } },
    { name: "brand", type: "relationship", relationTo: "brands", required: true, label: { en: "Brand", zh: "品牌" }, admin: { description: "先选品牌，再选品类。" } },
    { name: "category", type: "relationship", relationTo: "categories", required: true, label: { en: "Category", zh: "品类" }, admin: { description: "产品所属主品类。" } },
    { name: "cover", type: "upload", relationTo: "media", label: { en: "Cover Image", zh: "封面图" } },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true, label: { en: "Gallery", zh: "图集" } },
    { name: "msrpCNY", type: "number", label: { en: "MSRP (CNY)", zh: "建议零售价(¥)" }, admin: { description: "用于前台价格展示与筛选。" } },
    {
      name: "params",
      type: "group",
      label: { en: "Parameters", zh: "参数" },
      fields: [
        { name: "weightKg", type: "number", label: { en: "Weight (kg)", zh: "整车重量(kg)" }, admin: { description: "用于前台规格卡和便携性判断。" } },
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
    { name: "summary", type: "textarea", localized: true, label: { en: "Summary", zh: "摘要" }, admin: { description: "建议写 1-2 句，分别在 zh / en locale 下维护。" } },
    {
      name: "score",
      type: "number",
      min: 0, max: 10,
      admin: { description: "由评测系统计算，主编锁定后只读。", readOnly: true, position: "sidebar" }
    },
    {
      name: "scoreLocked",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "锁定后评分改动需要审计。", position: "sidebar" }
    }
  ],
  timestamps: true
};
