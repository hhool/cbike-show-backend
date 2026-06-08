import type { CollectionConfig } from "payload";

export const Brands: CollectionConfig = {
  slug: "brands",
  labels: { singular: { en: "Brand", zh: "品牌" }, plural: { en: "Brands", zh: "品牌" } },
  admin: { useAsTitle: "name", group: { en: "Catalog", zh: "目录管理" }, defaultColumns: ["name", "region", "country", "priorityScore", "updatedAt"] },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true, label: { en: "Brand Name", zh: "品牌名称" } },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "region",
      type: "select",
      required: true,
      defaultValue: "north_america",
      label: { en: "Region", zh: "区域" },
      options: [
        { label: "北美（North America）", value: "north_america" },
        { label: "欧洲（Europe）", value: "europe" },
        { label: "中东（Middle East）", value: "middle_east" },
        { label: "亚太（APAC）", value: "apac" },
        { label: "拉美（LATAM）", value: "latam" }
      ],
      admin: { position: "sidebar" }
    },
    { name: "country", type: "text", label: { en: "Country", zh: "国家/地区" }, admin: { description: "ISO country code, e.g. NL / US / CN" } },
    {
      name: "marketFocus",
      type: "select",
      hasMany: true,
      label: { en: "Market Focus", zh: "主攻市场" },
      options: [
        { label: "婴儿推车（Stroller）", value: "stroller" },
        { label: "平衡车（Balance Bike）", value: "balance_bike" },
        { label: "滑板车（Scooter）", value: "scooter" },
        { label: "自行车（Bicycle）", value: "bicycle" },
        { label: "三轮车（Tricycle）", value: "tricycle" },
        { label: "电动车（Electric Bike）", value: "electric_bike" },
        { label: "滑行车（Ride-on Toy）", value: "ride_on_toy" },
        { label: "儿童电动玩具车（Kids Electric Ride-on Car）", value: "electric_toy_car" },
        { label: "学步车（Walker）", value: "walker" },
        { label: "多功能车（Multi-functional Bike）", value: "multi_functional_bike" }
      ]
    },
    {
      name: "priorityScore",
      type: "number",
      min: 0,
      max: 100,
      defaultValue: 60,
      label: { en: "Priority Score", zh: "优先级评分" },
      admin: { description: "Used for Top-N ordering in each country/region.", position: "sidebar" }
    },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "intro", type: "textarea", localized: true, label: { en: "Brand Intro", zh: "品牌简介" } }
  ],
  timestamps: true
};
