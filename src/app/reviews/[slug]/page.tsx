import Link from "next/link";
import { notFound } from "next/navigation";
import { getSitePageBySlug, pickLocale } from "../../lib/cms";

type ReviewDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
};

export default async function ReviewDetailPage({ params, searchParams }: ReviewDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const locale = pickLocale(resolvedSearchParams.lang);

  const { payload, fallbackLocale } = await getSitePageBySlug("reviews", locale);

  const result = await payload.find({
    collection: "reviews",
    limit: 1,
    pagination: false,
    locale,
    fallbackLocale,
    depth: 1,
    where: {
      and: [
        { slug: { equals: resolvedParams.slug } },
        { _status: { equals: "published" } },
      ],
    },
  });

  const review = result.docs[0] as any;
  if (!review) {
    notFound();
  }

  const linkedProducts = Array.isArray(review.products) ? review.products : [];

  return (
    <main style={{ maxWidth: 900, margin: "42px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <p style={{ margin: "0 0 12px" }}>
        <Link href={`/reviews?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {locale === "en" ? "Back to reviews" : "返回评测列表"}
        </Link>
      </p>

      <article style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 20, background: "#fff" }}>
        <h1 style={{ margin: "0 0 10px", fontSize: 34 }}>{review.title}</h1>
        <p style={{ margin: "0 0 10px", color: "#4f5f67" }}>
          {locale === "en" ? "Type" : "类型"}: {review.type || "-"}
        </p>
        <p style={{ margin: "0 0 10px", color: "#5d6d77" }}>{review.summary || "-"}</p>
        <p style={{ margin: "0 0 16px", fontWeight: 700, color: "#17486b", fontSize: 18 }}>
          {locale === "en" ? "Overall" : "综合评分"}: {typeof review.scoreOverall === "number" ? review.scoreOverall : "-"}
        </p>

        <section style={{ borderTop: "1px solid #edf2f6", paddingTop: 12, marginBottom: 14 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{locale === "en" ? "Score Radar" : "评分维度"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
              <strong>{locale === "en" ? "Safety" : "安全"}</strong>
              <p style={{ margin: "6px 0 0" }}>{review.scores?.safety ?? "-"}</p>
            </div>
            <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
              <strong>{locale === "en" ? "Comfort" : "舒适"}</strong>
              <p style={{ margin: "6px 0 0" }}>{review.scores?.comfort ?? "-"}</p>
            </div>
            <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
              <strong>{locale === "en" ? "Portability" : "便携"}</strong>
              <p style={{ margin: "6px 0 0" }}>{review.scores?.portability ?? "-"}</p>
            </div>
            <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
              <strong>{locale === "en" ? "Function" : "功能"}</strong>
              <p style={{ margin: "6px 0 0" }}>{review.scores?.function ?? "-"}</p>
            </div>
            <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
              <strong>{locale === "en" ? "Value" : "性价比"}</strong>
              <p style={{ margin: "6px 0 0" }}>{review.scores?.value ?? "-"}</p>
            </div>
          </div>
        </section>

        <section style={{ borderTop: "1px solid #edf2f6", paddingTop: 14 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>{locale === "en" ? "Related Products" : "关联产品"}</h2>
          {linkedProducts.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {linkedProducts.map((p: any) => {
                const name = p?.modelName || p?.id || "-";
                const slug = p?.slug;
                return (
                  <li key={String(p?.id || name)} style={{ marginBottom: 6 }}>
                    {slug ? (
                      <Link href={`/products/${slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={{ margin: 0, color: "#6b7b86" }}>{locale === "en" ? "No linked products." : "暂无关联产品。"}</p>
          )}
        </section>
      </article>
    </main>
  );
}
