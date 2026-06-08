import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocaleEntryMap, getSitePageBySlug, pickLocale } from "../../lib/cms";

type BrandDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
};

export default async function BrandDetailPage({ params, searchParams }: BrandDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const locale = pickLocale(resolvedSearchParams.lang);

  const { payload } = await getSitePageBySlug("brands", locale);

  const brandResult = await payload.find({
    collection: "brands",
    limit: 1,
    pagination: false,
    locale,
    where: {
      slug: { equals: resolvedParams.slug },
    },
    depth: 0,
  });

  const brand = brandResult.docs[0] as any;
  if (!brand) {
    notFound();
  }

  const localeMap = await getLocaleEntryMap(
    [
      "brands.detail.back",
      "brands.detail.field.regionCountry",
      "brands.detail.field.priority",
      "brands.detail.field.marketFocus",
      "brands.detail.section.relatedProducts",
      "brands.detail.section.famousProducts",
      "brands.detail.section.latest2026",
      "brands.detail.section.relatedReviews",
      "brands.detail.section.sameCountryTop5",
      "brands.detail.empty.products",
      "brands.detail.empty.famousProducts",
      "brands.detail.empty.latest2026",
      "brands.detail.empty.reviews",
      "brands.detail.empty.marketFocus",
      "brands.detail.empty.sameCountry",
      "brands.detail.score.overall",
      "brands.detail.marketFocus.stroller",
      "brands.detail.marketFocus.balance_bike",
      "brands.detail.marketFocus.scooter",
      "brands.detail.marketFocus.bicycle",
      "brands.detail.marketFocus.electric_toy_car",
    ],
    locale,
  );

  const productsResult = await payload.find({
    collection: "products",
    limit: 8,
    locale,
    depth: 1,
    sort: "-updatedAt",
    where: {
      and: [
        { _status: { equals: "published" } },
        { brand: { equals: brand.id } },
      ],
    },
  });

  const reviewsResult = await payload.find({
    collection: "reviews",
    limit: 30,
    locale,
    depth: 1,
    sort: "-publishedAt",
    where: {
      _status: {
        equals: "published",
      },
    },
  });

  const relatedReviews = reviewsResult.docs.filter((item: any) => {
    if (!Array.isArray(item.products)) return false;
    return item.products.some((p: any) => {
      if (typeof p === "number") return false;
      if (!p || typeof p !== "object") return false;
      const productBrand = p.brand;
      if (!productBrand) return false;
      if (typeof productBrand === "number") return productBrand === brand.id;
      return typeof productBrand === "object" && productBrand.id === brand.id;
    });
  });

  const sameCountryResult = await payload.find({
    collection: "brands",
    limit: 20,
    pagination: false,
    locale,
    sort: "-priorityScore",
    where: {
      and: [
        { region: { equals: brand.region } },
        { country: { equals: brand.country } },
      ],
    },
    depth: 0,
  });

  const competitors = (sameCountryResult.docs as any[])
    .filter((item) => item.id !== brand.id)
    .slice(0, 5);

  const marketFocusValues = Array.isArray(brand.marketFocus) ? brand.marketFocus : [];
  const relatedProducts = productsResult.docs as any[];
  const famousProducts = [...relatedProducts]
    .sort((a, b) => {
      const scoreA = typeof a.score === "number" ? a.score : -1;
      const scoreB = typeof b.score === "number" ? b.score : -1;
      if (scoreB !== scoreA) return scoreB - scoreA;
      const ta = new Date(a.updatedAt || 0).getTime();
      const tb = new Date(b.updatedAt || 0).getTime();
      return tb - ta;
    })
    .slice(0, 6);
  const latest2026Products = relatedProducts
    .filter((item) => {
      const name = String(item.modelName || "");
      const summary = String(item.summary || "");
      return name.includes("2026") || summary.includes("2026");
    })
    .sort((a, b) => {
      const ta = new Date(a.updatedAt || 0).getTime();
      const tb = new Date(b.updatedAt || 0).getTime();
      return tb - ta;
    })
    .slice(0, 6);
  const marketFocusLabel: Record<string, string> = {
    stroller: localeMap["brands.detail.marketFocus.stroller"] || (locale === "en" ? "Stroller" : "婴儿推车"),
    balance_bike: localeMap["brands.detail.marketFocus.balance_bike"] || (locale === "en" ? "Balance Bike" : "平衡车"),
    scooter: localeMap["brands.detail.marketFocus.scooter"] || (locale === "en" ? "Scooter" : "滑板车"),
    bicycle: localeMap["brands.detail.marketFocus.bicycle"] || (locale === "en" ? "Bicycle" : "自行车"),
    electric_toy_car: localeMap["brands.detail.marketFocus.electric_toy_car"] || (locale === "en" ? "Kids Electric Ride-on Car" : "儿童电动玩具车"),
  };

  return (
    <main style={{ maxWidth: 920, margin: "42px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <p style={{ margin: "0 0 12px" }}>
        <Link href={`/brands?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["brands.detail.back"] || (locale === "en" ? "Back to brands" : "返回品牌列表")}
        </Link>
      </p>

      <article style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 20, background: "#fff" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 34 }}>{brand.name || "-"}</h1>
        <p style={{ margin: "0 0 10px", color: "#4f5f67" }}>
          {localeMap["brands.detail.field.regionCountry"] || (locale === "en" ? "Region/Country" : "区域/国家")}: {brand.region || "-"} / {brand.country || "-"}
        </p>
        <p style={{ margin: "0 0 10px", color: "#4f5f67" }}>
          {localeMap["brands.detail.field.priority"] || (locale === "en" ? "Priority Score" : "优先级评分")}: {typeof brand.priorityScore === "number" ? brand.priorityScore : "-"}
        </p>
        <p style={{ margin: "0 0 10px", color: "#4f5f67" }}>
          {localeMap["brands.detail.field.marketFocus"] || (locale === "en" ? "Market Focus" : "市场聚焦")}: {marketFocusValues.length > 0
            ? marketFocusValues.map((value: string) => marketFocusLabel[value] || value).join(" / ")
            : (localeMap["brands.detail.empty.marketFocus"] || (locale === "en" ? "Not specified" : "未配置"))}
        </p>
        <p style={{ margin: 0, color: "#5d6d77" }}>{brand.intro || "-"}</p>
      </article>

      <section style={{ marginTop: 16, border: "1px solid #e4ebf0", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{localeMap["brands.detail.section.relatedProducts"] || (locale === "en" ? "Related Products" : "关联产品")}</h2>
        {relatedProducts.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {relatedProducts.map((item: any) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <Link href={`/products/${item.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                  {item.modelName || "-"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: "#5f707b" }}>{localeMap["brands.detail.empty.products"] || (locale === "en" ? "No related products yet." : "暂无关联产品。")}</p>
        )}
      </section>

      <section style={{ marginTop: 16, border: "1px solid #e4ebf0", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{localeMap["brands.detail.section.famousProducts"] || (locale === "en" ? "Famous Products" : "知名产品")}</h2>
        {famousProducts.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {famousProducts.map((item: any) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <Link href={`/products/${item.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                  {item.modelName || "-"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: "#5f707b" }}>{localeMap["brands.detail.empty.famousProducts"] || (locale === "en" ? "No famous products yet." : "暂无知名产品。")}</p>
        )}
      </section>

      <section style={{ marginTop: 16, border: "1px solid #e4ebf0", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{localeMap["brands.detail.section.latest2026"] || (locale === "en" ? "Latest 2026 Products" : "2026 最新款产品")}</h2>
        {latest2026Products.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {latest2026Products.map((item: any) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <Link href={`/products/${item.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                  {item.modelName || "-"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: "#5f707b" }}>{localeMap["brands.detail.empty.latest2026"] || (locale === "en" ? "No 2026 products yet." : "暂无 2026 新款产品。")}</p>
        )}
      </section>

      <section style={{ marginTop: 16, border: "1px solid #e4ebf0", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{localeMap["brands.detail.section.relatedReviews"] || (locale === "en" ? "Related Reviews" : "关联评测")}</h2>
        {relatedReviews.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {relatedReviews.slice(0, 8).map((item: any) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <Link href={`/reviews/${item.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                  {item.title || "-"}
                </Link>
                <span style={{ marginLeft: 8, color: "#5d6d77" }}>
                  {localeMap["brands.detail.score.overall"] || (locale === "en" ? "Overall" : "综合")}: {typeof item.scoreOverall === "number" ? item.scoreOverall : "-"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: "#5f707b" }}>{localeMap["brands.detail.empty.reviews"] || (locale === "en" ? "No related reviews yet." : "暂无关联评测。")}</p>
        )}
      </section>

      <section style={{ marginTop: 16, border: "1px solid #e4ebf0", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{localeMap["brands.detail.section.sameCountryTop5"] || (locale === "en" ? "Same-country Top5" : "同国家 Top5")}</h2>
        {competitors.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {competitors.map((item: any) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <Link href={`/brands/${item.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                  {item.name || "-"}
                </Link>
                <span style={{ marginLeft: 8, color: "#5d6d77" }}>#{item.priorityScore || 0}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: "#5f707b" }}>{localeMap["brands.detail.empty.sameCountry"] || (locale === "en" ? "No same-country brands yet." : "同国家暂无其他品牌。")}</p>
        )}
      </section>
    </main>
  );
}
