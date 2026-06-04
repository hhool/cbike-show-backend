import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocaleEntryMap, getSitePageBySlug, pickLocale } from "../../../lib/cms";

type BrandRegionPageProps = {
  params: Promise<{ region: string }>;
  searchParams?: Promise<{ lang?: string; country?: string }>;
};

type BrandDoc = {
  id: number;
  name?: string;
  slug?: string;
  country?: string;
  intro?: string;
  priorityScore?: number;
};

export default async function BrandRegionPage({ params, searchParams }: BrandRegionPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const locale = pickLocale(resolvedSearchParams.lang);
  const region = (resolvedParams.region || "").trim();
  const country = (resolvedSearchParams.country || "").trim();

  if (!region) {
    notFound();
  }

  const { payload, fallbackLocale } = await getSitePageBySlug("brands", locale);

  const whereClause: Record<string, unknown> = {
    region: {
      equals: region,
    },
  };
  if (country) {
    whereClause.country = { equals: country };
  }

  const brandResult = await payload.find({
    collection: "brands",
    limit: 200,
    pagination: false,
    locale,
    fallbackLocale,
    sort: "-priorityScore",
    where: whereClause,
    depth: 0,
  });

  const docs = brandResult.docs as BrandDoc[];

  const localeMap = await getLocaleEntryMap(
    [
      "brands.region.back",
      "brands.region.title",
      "brands.region.subtitle",
      "brands.region.empty",
      "brands.region.top5Hint",
    ],
    locale,
  );

  const grouped = new Map<string, BrandDoc[]>();
  for (const item of docs) {
    const key = item.country || "unknown";
    const list = grouped.get(key) || [];
    list.push(item);
    grouped.set(key, list);
  }

  const countries = Array.from(grouped.entries())
    .map(([countryCode, list]) => ({
      countryCode,
      list: [...list].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).slice(0, 5),
    }))
    .sort((a, b) => a.countryCode.localeCompare(b.countryCode));

  return (
    <main style={{ maxWidth: 980, margin: "42px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <p style={{ margin: "0 0 12px" }}>
        <Link href={`/brands?lang=${locale}&region=${region}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["brands.region.back"] || (locale === "en" ? "Back to brand groups" : "返回品牌分组")}
        </Link>
      </p>

      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>
          {localeMap["brands.region.title"] || (locale === "en" ? "Region Board" : "区域榜单")}: {region}
        </h1>
        <p style={{ marginTop: 10, color: "#55646d" }}>
          {localeMap["brands.region.subtitle"] ||
            (locale === "en"
              ? "Country-grouped Top5 brands in the selected region."
              : "当前区域下按国家分组展示 Top5 品牌。")}
        </p>
      </header>

      {countries.length > 0 ? (
        <section style={{ display: "grid", gap: 14 }}>
          {countries.map((group) => (
            <article key={group.countryCode} style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 16, background: "#fff" }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{group.countryCode}</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {group.list.map((brand) => (
                  <li key={brand.id} style={{ marginBottom: 8 }}>
                    <Link href={`/brands/${brand.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none", fontWeight: 600 }}>
                      {brand.name || "-"}
                    </Link>
                    <span style={{ marginLeft: 8, color: "#5d6d77" }}>#{brand.priorityScore || 0}</span>
                    <p style={{ margin: "4px 0 0", color: "#5d6d77" }}>{brand.intro || "-"}</p>
                  </li>
                ))}
              </ul>
              <p style={{ margin: "10px 0 0", color: "#5d6d77", fontSize: 13 }}>
                {localeMap["brands.region.top5Hint"] || (locale === "en" ? "Top 5 by priority score" : "按优先级评分 Top5")}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <article style={{ border: "1px dashed #c8d6df", borderRadius: 12, padding: 18, color: "#5f707b" }}>
          {localeMap["brands.region.empty"] || (locale === "en" ? "No brands in this region filter." : "当前区域筛选下暂无品牌。")}
        </article>
      )}
    </main>
  );
}
