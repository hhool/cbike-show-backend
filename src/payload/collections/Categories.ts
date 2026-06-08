import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: { en: "Category", zh: "品类" }, plural: { en: "Categories", zh: "品类" } },
  admin: {
    useAsTitle: "name",
    group: { en: "Catalog", zh: "目录管理" },
    defaultColumns: ["name", "kind", "slug", "ageRange", "updatedAt"],
    description: "品类名建议与前台分类保持一致，避免同类内容出现多个命名。"
  },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true, localized: true, label: { en: "Category Name", zh: "品类名称" }, admin: { description: "分别在 zh / en locale 下填写。" } },
    { name: "slug", type: "text", required: true, unique: true, index: true, label: { en: "Slug", zh: "标识" }, admin: { description: "用于 URL 和前台筛选。" } },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "stroller",
      label: { en: "Kind", zh: "品类类型" },
      options: [
        { label: "婴儿推车（Stroller）", value: "stroller" },
        { label: "儿童平衡车（Balance Bike）", value: "balance_bike" },
        { label: "儿童滑板车（Scooter）", value: "scooter" },
        { label: "儿童自行车（Bicycle）", value: "bicycle" },
        { label: "儿童三轮车（Tricycle）", value: "tricycle" },
        { label: "儿童电动车（Electric Bike）", value: "electric_bike" },
        { label: "儿童滑行车（Ride-on Toy）", value: "ride_on_toy" },
        { label: "儿童电动玩具车（Kids Electric Ride-on Car）", value: "electric_toy_car" },
        { label: "儿童学步车（Walker）", value: "walker" },
        { label: "儿童多功能车（Multi-functional Bike）", value: "multi_functional_bike" }
      ],
      admin: { position: "sidebar", description: "决定前台筛选与归类逻辑。" }
    },
    { name: "ageRange", type: "text", label: { en: "Age Range", zh: "适配年龄" }, admin: { description: "例如 0–6m, 1–3y，用于前台筛选和说明。" } }
  ],
  timestamps: true
};
