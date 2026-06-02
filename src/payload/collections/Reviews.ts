import type { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: { singular: { en: "Review", zh: "评测" }, plural: { en: "Reviews", zh: "评测" } },
  admin: {
    useAsTitle: "title",
    group: { en: "Editorial", zh: "内容编辑" },
    defaultColumns: ["title", "type", "status", "scoreOverall", "publishedAt"]
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "single",
      options: [
        { label: "单品实测（Single Review）", value: "single" },
        { label: "多品横评（Comparison Review）", value: "compare" },
        { label: "新品首发（New Arrival Review）", value: "newbie" },
        { label: "跨境专项（Cross-border Special）", value: "cross_border" },
        { label: "性价比（Best Value）", value: "value" },
        { label: "实测甄别（Hands-on Verification）", value: "debunk" },
        { label: "年度榜单（Annual Rankings）", value: "ranking" }
      ],
      admin: { position: "sidebar" }
    },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true, required: true },
    { name: "cover", type: "upload", relationTo: "media" },
    { name: "summary", type: "textarea", localized: true },
    { name: "body", type: "richText", localized: true },
    {
      name: "scores",
      type: "group",
      label: { en: "5-Axis Scores", zh: "五维评分" },
      fields: [
        { name: "safety", type: "number", min: 0, max: 10 },
        { name: "comfort", type: "number", min: 0, max: 10 },
        { name: "portability", type: "number", min: 0, max: 10 },
        { name: "function", type: "number", min: 0, max: 10 },
        { name: "value", type: "number", min: 0, max: 10 }
      ]
    },
    { name: "scoreOverall", type: "number", min: 0, max: 10, admin: { readOnly: true, position: "sidebar", description: "系统加权计算" } },
    { name: "scoreLocked", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "草稿（Draft）", value: "draft" },
        { label: "待合规（Compliance Review）", value: "compliance" },
        { label: "待主编（Chief Review）", value: "chief" },
        { label: "已发布（Published）", value: "published" },
        { label: "已下线（Archived）", value: "archived" }
      ],
      admin: { position: "sidebar" }
    },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } }
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const s = data?.scores;
        if (s && [s.safety, s.comfort, s.portability, s.function, s.value].every((x: unknown) => typeof x === "number")) {
          // Weighted formula: safety 0.30 / comfort 0.25 / portability 0.15 / function 0.20 / value 0.10
          const overall = s.safety * 0.3 + s.comfort * 0.25 + s.portability * 0.15 + s.function * 0.2 + s.value * 0.1;
          return { ...data, scoreOverall: Math.round(overall * 10) / 10 };
        }
        return data;
      }
    ]
  },
  timestamps: true
};
