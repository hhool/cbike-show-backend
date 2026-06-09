import type { CollectionConfig } from "payload";

function sanitizeSections(input: unknown): unknown {
  if (!Array.isArray(input)) return input;
  return input.map((item) => {
    if (!item || typeof item !== "object") return item;
    const section = { ...(item as Record<string, unknown>) };
    // Payload array rows are reconciled by _id in updates.
    // Admin payloads may send id only, which can cause duplicate locale-row inserts.
    if (typeof section.id === "string" && section.id.trim() && typeof section._id !== "string") {
      section._id = section.id;
    }
    delete section.id;
    delete section._parent_id;
    delete section._locale;
    return section;
  });
}

export const SitePages: CollectionConfig = {
  slug: "site-pages",
  labels: {
    singular: { en: "Site Page", zh: "站点页面" },
    plural: { en: "Site Pages", zh: "站点页面" }
  },
  admin: {
    useAsTitle: "slug",
    group: { en: "Content", zh: "内容编辑" },
    defaultColumns: ["slug", "updatedAt"]
  },
  access: {
    read: () => true,
    readVersions: () => true,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { en: "Page Slug", zh: "页面标识" },
      admin: { description: "Use values like home, products, reviews." }
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { en: "Page Title", zh: "页面标题" }
    },
    {
      name: "heroTitle",
      type: "text",
      localized: true,
      label: { en: "Hero Title", zh: "首屏标题" }
    },
    {
      name: "heroSubtitle",
      type: "textarea",
      localized: true,
      label: { en: "Hero Subtitle", zh: "首屏副标题" }
    },
    {
      name: "ctaLabel",
      type: "text",
      localized: true,
      label: { en: "CTA Label", zh: "CTA 文案" }
    },
    {
      name: "ctaHref",
      type: "text",
      defaultValue: "/products",
      label: { en: "CTA Link", zh: "CTA 链接" }
    },
    {
      name: "sections",
      type: "array",
      labels: { singular: { en: "Section", zh: "区块" }, plural: { en: "Sections", zh: "区块" } },
      fields: [
        {
          name: "heading",
          type: "text",
          required: true,
          localized: true,
          label: { en: "Heading", zh: "标题" }
        },
        {
          name: "body",
          type: "textarea",
          localized: true,
          label: { en: "Body", zh: "内容" }
        }
      ]
    }
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data;
        const next = { ...(data as Record<string, unknown>) };
        next.sections = sanitizeSections(next.sections);
        return next;
      },
    ],
  },
  timestamps: true
};
