import Link from "next/link";
import { getLocaleEntryMap, getSitePageBySlug, pickLocale } from "../lib/cms";

type ReviewsPageProps = {
  searchParams?: Promise<{ lang?: string; type?: string }>;
};

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = (await searchParams) || {};
  const locale = pickLocale(params.lang);
  const type = (params.type || "").trim();

  const { payload, page } = await getSitePageBySlug("reviews", locale);

  const whereClause: Record<string, unknown> = {
    _status: {
      equals: "published",
    },
  };
  if (type) {
    whereClause.type = { equals: type };
  }

  const reviewsResult = await payload.find({
    collection: "reviews",
    limit: 12,
    sort: "-publishedAt",
    locale,
    depth: 1,
    where: whereClause,
  });

  const title = page?.heroTitle || page?.title || (locale === "en" ? "Reviews" : "评测库");
  const subtitle =
    page?.heroSubtitle ||
    (locale === "en"
      ? "Bilingual review entries managed from Payload CMS."
      : "评测内容支持中英文双语管理，统一由 Payload CMS 提供。");

  const localeMap = await getLocaleEntryMap(
    [
      "reviews.filter.reset",
      "reviews.filter.type",
      "reviews.filter.single",
      "reviews.filter.compare",
      "reviews.switchTo",
      "reviews.empty",
      "reviews.viewDetail",
      "reviews.field.type",
      "reviews.field.overall",
    ],
    locale,
  );

  return (
    <main style={{ maxWidth: 980, margin: "42px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>{title}</h1>
        <p style={{ marginTop: 10, color: "#55646d" }}>{subtitle}</p>
        <Link href={locale === "en" ? "/reviews?lang=zh" : "/reviews?lang=en"} style={{ color: "#1c5b88", textDecoration: "none", fontWeight: 600 }}>
          {localeMap["reviews.switchTo"] || (locale === "en" ? "Switch to Chinese" : "切换到英文")}
        </Link>
      </header>

      <section style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Link href={`/reviews?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["reviews.filter.reset"] || (locale === "en" ? "Reset" : "重置")}
        </Link>
        <span style={{ color: "#6a7a85" }}>{localeMap["reviews.filter.type"] || (locale === "en" ? "Type:" : "类型:")}</span>
        <Link href={`/reviews?lang=${locale}&type=single`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["reviews.filter.single"] || (locale === "en" ? "Single" : "单品")}
        </Link>
        <Link href={`/reviews?lang=${locale}&type=compare`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["reviews.filter.compare"] || (locale === "en" ? "Compare" : "横评")}
        </Link>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {reviewsResult.docs.length > 0 ? (
          reviewsResult.docs.map((item: any) => (
            <article key={item.id} style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 14, background: "#fff" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{item.title}</h2>
              <p style={{ margin: "0 0 8px", color: "#4f5f67" }}>
                {localeMap["reviews.field.type"] || (locale === "en" ? "Type" : "类型")}: {item.type || "-"}
              </p>
              <p style={{ margin: "0 0 8px", color: "#5d6d77" }}>{item.summary || "-"}</p>
              <p style={{ margin: 0, fontWeight: 700, color: "#17486b" }}>
                {localeMap["reviews.field.overall"] || (locale === "en" ? "Overall" : "综合评分")}: {typeof item.scoreOverall === "number" ? item.scoreOverall : "-"}
              </p>
              <p style={{ margin: "10px 0 0" }}>
                <Link href={`/reviews/${item.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none", fontWeight: 600 }}>
                  {localeMap["reviews.viewDetail"] || (locale === "en" ? "View details" : "查看详情")}
                </Link>
              </p>
            </article>
          ))
        ) : (
          <article style={{ border: "1px dashed #c8d6df", borderRadius: 12, padding: 18, color: "#5f707b" }}>
            {localeMap["reviews.empty"] ||
              (locale === "en"
                ? "No published reviews yet. Add records in Admin > Editorial > Reviews."
                : "暂无已发布评测。可在后台 内容编辑 > 评测 中新增并发布。")}
          </article>
        )}
      </section>
    </main>
  );
}
