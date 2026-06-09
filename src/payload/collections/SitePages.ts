import type { CollectionConfig } from "payload";

function sanitizeSections(input: unknown): unknown {
  if (!Array.isArray(input)) return input;
  return input.map((item, index) => {
    if (!item || typeof item !== "object") return item;
    const section = { ...(item as Record<string, unknown>) };

    // Normalize array row keys from admin/API payloads to avoid row recreation.
    if (typeof section.id !== "string" && typeof section._id === "string" && section._id.trim()) {
      section.id = section._id;
    }

    if (typeof section._order !== "number" || !Number.isFinite(section._order)) {
      section._order = index + 1;
    }

    delete section._id;
    delete section._parent_id;
    delete section._locale;
    return section;
  });
}

const toSqlText = (value: string): string => `'${value.replace(/'/g, "''")}'`;
const toSqlNullableText = (value: unknown): string =>
  typeof value === "string" ? toSqlText(value) : "NULL";

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
    beforeChange: [
      async ({ operation, originalDoc, req, data }) => {
        if (operation !== "update") return data;

        const originalSections = Array.isArray((originalDoc as any)?.sections)
          ? ((originalDoc as any).sections as Array<Record<string, unknown>>)
          : [];
        if (!originalSections.length) return data;

        const sectionIds = originalSections
          .map((section) => String(section?.id ?? "").trim())
          .filter(Boolean);
        if (!sectionIds.length) return data;

        const drizzle = (req.payload as any)?.db?.drizzle;
        if (!drizzle) return data;

        const idListSql = sectionIds.map((id) => toSqlText(id)).join(", ");
        const result = await drizzle.execute(`
          SELECT "_parent_id", "_locale", "heading", "body"
          FROM "site_pages_sections_locales"
          WHERE "_parent_id" IN (${idListSql})
        `);

        const rows = Array.isArray((result as { rows?: unknown }).rows)
          ? ((result as { rows?: unknown }).rows as Array<Record<string, unknown>>)
          : [];

        const ctx = ((req as any).context ??= {} as Record<string, unknown>);
        ctx.sitePagesSectionLocaleSnapshot = rows;

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation !== "update") return doc;

        const prevSections = Array.isArray((previousDoc as any)?.sections)
          ? ((previousDoc as any).sections as Array<Record<string, unknown>>)
          : [];
        const nextSections = Array.isArray((doc as any)?.sections)
          ? ((doc as any).sections as Array<Record<string, unknown>>)
          : [];

        if (!prevSections.length || !nextSections.length) return doc;

        const drizzle = (req.payload as any)?.db?.drizzle;
        if (!drizzle) return doc;

        const currentLocale = typeof (req as any)?.locale === "string" ? (req as any).locale : "";
        const snapshotRows = Array.isArray((req as any)?.context?.sitePagesSectionLocaleSnapshot)
          ? ((req as any).context.sitePagesSectionLocaleSnapshot as Array<Record<string, unknown>>)
          : [];

        for (let i = 0; i < Math.min(prevSections.length, nextSections.length); i += 1) {
          const oldId = String(prevSections[i]?.id ?? "").trim();
          const newId = String(nextSections[i]?.id ?? "").trim();
          if (!oldId || !newId || oldId === newId) continue;

          const oldIdSql = toSqlText(oldId);
          const newIdSql = toSqlText(newId);

          const rowsToRestore = snapshotRows.filter((row) => {
            const parentId = String(row?._parent_id ?? "").trim();
            const locale = String(row?._locale ?? "").trim();
            return parentId === oldId && locale && locale !== currentLocale;
          });

          for (const row of rowsToRestore) {
            const localeSql = toSqlText(String(row._locale));
            const headingSql = toSqlNullableText(row.heading);
            const bodySql = toSqlNullableText(row.body);

            await drizzle.execute(`
              INSERT INTO "site_pages_sections_locales" ("_parent_id", "_locale", "heading", "body")
              VALUES (${newIdSql}, ${localeSql}, ${headingSql}, ${bodySql})
              ON CONFLICT ("_parent_id", "_locale") DO UPDATE
              SET
                "heading" = EXCLUDED."heading",
                "body" = EXCLUDED."body"
            `);
          }

          await drizzle.execute(`
            DELETE FROM "site_pages_sections_locales"
            WHERE "_parent_id" = ${oldIdSql}
          `);
        }

        return doc;
      },
    ],
  },
  timestamps: true
};
