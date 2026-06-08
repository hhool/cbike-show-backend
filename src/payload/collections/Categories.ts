import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: { en: "Category", zh: "品类" }, plural: { en: "Categories", zh: "品类" } },
  admin: { useAsTitle: "name", group: { en: "Catalog", zh: "目录管理" } },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "stroller",
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
      admin: { position: "sidebar" }
    },
    { name: "ageRange", type: "text", label: { en: "Age Range", zh: "适配年龄" }, admin: { description: "e.g. 0–6m, 1–3y" } }
  ],
  timestamps: true
};
