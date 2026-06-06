import Link from "next/link";
import { getLocaleEntryMap, getSitePageBySlug, pickLocale } from "../lib/cms";

type BrandsPageProps = {
  searchParams?: Promise<{ lang?: string; region?: string; country?: string }>;
};

type BrandDoc = {
  id: number;
  name?: string;
  slug?: string;
  region?: string;
  country?: string;
  intro?: string;
  priorityScore?: number;
};

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = (await searchParams) || {};
  const locale = pickLocale(params.lang);
  const region = (params.region || "").trim();
  const country = (params.country || "").trim();

  const { payload, page } = await getSitePageBySlug("brands", locale);

  const whereClause: Record<string, unknown> = {};
  if (region) {
    whereClause.region = { equals: region };
  }
  if (country) {
    whereClause.country = { equals: country };
  }

  const brandsResult = await payload.find({
    collection: "brands",
    limit: 200,
    pagination: false,
    sort: "-priorityScore",
    locale,
    where: whereClause,
    depth: 0,
  });

  const brands = brandsResult.docs as BrandDoc[];
  const title = page?.heroTitle || page?.title || (locale === "en" ? "Global Brand Top5 by Region/Country" : "全球品牌 Top5（按区域/国家）");
  const subtitle =
    page?.heroSubtitle ||
    (locale === "en"
      ? "Grouped by region and country using priority score ranking."
      : "按区域与国家分组，基于优先级评分输出 Top5。" );

  const localeMap = await getLocaleEntryMap(
    [
      "brands.switchTo",
      "brands.filter.reset",
      "brands.filter.regionNA",
      "brands.filter.regionEU",
      "brands.filter.regionME",
      "brands.filter.regionLabel",
      "brands.filter.countryLabel",
      "brands.group.top5",
      "brands.empty",
      "brands.link.regionView",
      "brands.link.detailView",
    ],
    locale,
  );

  const grouped = new Map<string, BrandDoc[]>();
  for (const brand of brands) {
    const keyRegion = brand.region || "unknown";
    const keyCountry = brand.country || "unknown";
    const key = `${keyRegion}__${keyCountry}`;
    const current = grouped.get(key) || [];
    current.push(brand);
    grouped.set(key, current);
  }

  const groups = Array.from(grouped.entries())
    .map(([key, list]) => {
      const [r, c] = key.split("__");
      const sorted = [...list].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).slice(0, 5);
      return { region: r, country: c, list: sorted };
    })
    .sort((a, b) => a.region.localeCompare(b.region) || a.country.localeCompare(b.country));

  return (
    <main style={{ maxWidth: 980, margin: "42px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>{title}</h1>
        <p style={{ marginTop: 10, color: "#55646d" }}>{subtitle}</p>
        <p style={{ margin: "8px 0 0" }}>
          <Link href={locale === "en" ? "/brands?lang=zh" : "/brands?lang=en"} style={{ color: "#1c5b88", textDecoration: "none", fontWeight: 600 }}>
            {localeMap["brands.switchTo"] || (locale === "en" ? "Switch to Chinese" : "切换到英文")}
          </Link>
        </p>
        <p style={{ margin: "10px 0 0", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href={`/brands?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
            {localeMap["brands.filter.reset"] || (locale === "en" ? "Reset" : "重置")}
          </Link>
          <Link href={`/brands?lang=${locale}&region=north_america`} style={{ color: "#1c5b88", textDecoration: "none" }}>
            {localeMap["brands.filter.regionNA"] || (locale === "en" ? "North America" : "北美")}
          </Link>
          <Link href={`/brands?lang=${locale}&region=europe`} style={{ color: "#1c5b88", textDecoration: "none" }}>
            {localeMap["brands.filter.regionEU"] || (locale === "en" ? "Europe" : "欧洲")}
          </Link>
          <Link href={`/brands?lang=${locale}&region=middle_east`} style={{ color: "#1c5b88", textDecoration: "none" }}>
            {localeMap["brands.filter.regionME"] || (locale === "en" ? "Middle East" : "中东")}
          </Link>
        </p>
        {(region || country) && (
          <p style={{ margin: "8px 0 0", color: "#55646d", fontSize: 14 }}>
            {(localeMap["brands.filter.regionLabel"] || (locale === "en" ? "Region" : "区域")) + ": "}
            <strong>{region || "-"}</strong>
            {" · "}
            {(localeMap["brands.filter.countryLabel"] || (locale === "en" ? "Country" : "国家")) + ": "}
            <strong>{country || "-"}</strong>
          </p>
        )}
      </header>

      {groups.length > 0 ? (
        <section style={{ display: "grid", gap: 18 }}>
          {groups.map((group) => (
            <article key={`${group.region}-${group.country}`} style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 16, background: "#fff" }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>
                {group.region} / {group.country}
              </h2>
              <p style={{ margin: "0 0 10px", fontSize: 14 }}>
                <Link href={`/brands/region/${group.region}?lang=${locale}&country=${group.country}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                  {localeMap["brands.link.regionView"] || (locale === "en" ? "View region board" : "查看区域榜单")}
                </Link>
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {group.list.map((brand) => (
                  <li key={brand.id} style={{ marginBottom: 8 }}>
                    <strong>{brand.name || "-"}</strong>
                    <span style={{ marginLeft: 8, color: "#5d6d77" }}>#{brand.priorityScore || 0}</span>
                    <p style={{ margin: "4px 0 0", color: "#5d6d77" }}>{brand.intro || "-"}</p>
                    {brand.slug && (
                      <p style={{ margin: "4px 0 0" }}>
                        <Link href={`/brands/${brand.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                          {localeMap["brands.link.detailView"] || (locale === "en" ? "View brand detail" : "查看品牌详情")}
                        </Link>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <p style={{ margin: "10px 0 0", color: "#5d6d77", fontSize: 13 }}>
                {localeMap["brands.group.top5"] || (locale === "en" ? "Top 5 by priority score" : "按优先级评分 Top5")}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <article style={{ border: "1px dashed #c8d6df", borderRadius: 12, padding: 18, color: "#5f707b" }}>
          {localeMap["brands.empty"] || (locale === "en" ? "No brands found for current filters." : "当前筛选下暂无品牌数据。")}
        </article>
      )}
    </main>
  );
}
