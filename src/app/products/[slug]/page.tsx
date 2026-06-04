import Link from "next/link";
import { notFound } from "next/navigation";
import { getSitePageBySlug, pickLocale } from "../../lib/cms";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const locale = pickLocale(resolvedSearchParams.lang);

  const { payload, fallbackLocale } = await getSitePageBySlug("products", locale);

  const result = await payload.find({
    collection: "products",
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

  const product = result.docs[0] as any;
  if (!product) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 900, margin: "42px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <p style={{ margin: "0 0 12px" }}>
        <Link href={`/products?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {locale === "en" ? "Back to products" : "返回产品列表"}
        </Link>
      </p>

      <article style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 20, background: "#fff" }}>
        <h1 style={{ margin: "0 0 10px", fontSize: 34 }}>{product.modelName}</h1>
        <p style={{ margin: "0 0 10px", color: "#4f5f67" }}>
          {(product.brand && typeof product.brand === "object" ? product.brand.name : "-") || "-"}
        </p>
        <p style={{ margin: "0 0 8px", color: "#4f5f67" }}>
          {locale === "en" ? "Category" : "品类"}: {(product.category && typeof product.category === "object" ? product.category.name : "-") || "-"}
        </p>
        <p style={{ margin: "0 0 10px", color: "#4f5f67" }}>
          {locale === "en" ? "Region/Country" : "区域/国家"}: {(product.brand && typeof product.brand === "object" ? `${product.brand.region || "-"}/${product.brand.country || "-"}` : "-")}
        </p>
        <p style={{ margin: "0 0 14px", color: "#5d6d77" }}>{product.summary || "-"}</p>
        <p style={{ margin: "0 0 16px", fontWeight: 700, color: "#17486b", fontSize: 18 }}>
          ¥{typeof product.msrpCNY === "number" ? product.msrpCNY.toLocaleString() : "-"}
        </p>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
            <strong>{locale === "en" ? "Weight" : "重量"}</strong>
            <p style={{ margin: "6px 0 0" }}>{product.params?.weightKg ?? "-"} kg</p>
          </div>
          <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
            <strong>{locale === "en" ? "Load" : "承重"}</strong>
            <p style={{ margin: "6px 0 0" }}>{product.params?.loadKg ?? "-"} kg</p>
          </div>
          <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
            <strong>{locale === "en" ? "Folded" : "折叠尺寸"}</strong>
            <p style={{ margin: "6px 0 0" }}>{product.params?.foldedSize || "-"}</p>
          </div>
          <div style={{ border: "1px solid #edf2f6", borderRadius: 10, padding: 10 }}>
            <strong>{locale === "en" ? "Expanded" : "展开尺寸"}</strong>
            <p style={{ margin: "6px 0 0" }}>{product.params?.expandedSize || "-"}</p>
          </div>
        </section>

        <section style={{ marginTop: 16, borderTop: "1px solid #edf2f6", paddingTop: 12 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{locale === "en" ? "Certifications" : "认证信息"}</h2>
          {Array.isArray(product.certifications) && product.certifications.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {product.certifications.map((cert: string) => (
                <li key={cert}>{cert}</li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: "#6b7b86" }}>{locale === "en" ? "No certifications listed." : "暂无认证信息。"}</p>
          )}
        </section>
      </article>
    </main>
  );
}
