import config from "@payload-config";
import Link from "next/link";
import { getPayload } from "payload";

type HomePageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

function pickLocale(lang?: string): "en" | "zh" {
  return lang === "en" ? "en" : "zh";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) || {};
  const locale = pickLocale(params.lang);

  const payload = await getPayload({ config });
  let page: any = null;
  try {
    const pageResult = await payload.find({
      collection: "site-pages",
      where: { slug: { equals: "home" } },
      limit: 1,
      pagination: false,
      locale,
      depth: 0,
      fallbackLocale: false,
    });
    page = pageResult.docs[0] ?? null;
  } catch (error) {
    console.error("[home] failed to query site-pages/home", error);
  }
  const title = page?.heroTitle || page?.title || (locale === "en" ? "Cbike Review Lab" : "童车评测实验室");
  const subtitle =
    page?.heroSubtitle ||
    (locale === "en"
      ? "Editable bilingual homepage content is now powered by Payload CMS."
      : "首页内容已接入 Payload CMS，可直接进行中英文编辑。");
  const ctaLabel = page?.ctaLabel || (locale === "en" ? "Browse Products" : "查看产品");
  const ctaHref = page?.ctaHref || "/products";

  let localeHint = locale === "en" ? "Switch language:" : "切换语言:";
  try {
    const localeHintResult = await payload.find({
      collection: "locale-entries",
      where: { key: { equals: "home.switchHint" } },
      limit: 1,
      pagination: false,
      locale,
      depth: 0,
      fallbackLocale: false,
    });
    localeHint = localeHintResult.docs[0]?.value || localeHint;
  } catch (error) {
    console.error("[home] failed to query locale-entries/home.switchHint", error);
  }
  const localeTarget = locale === "en" ? "Chinese" : "英文";

  return (
    <main style={{ maxWidth: 860, margin: "48px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <header style={{ padding: "28px", borderRadius: 16, background: "linear-gradient(135deg, #f7faf7 0%, #eef8ff 100%)", border: "1px solid #e3edf3" }}>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.2 }}>{title}</h1>
        <p style={{ marginTop: 12, color: "#4f5f67", fontSize: 16 }}>{subtitle}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <Link href={ctaHref} style={{ padding: "10px 16px", borderRadius: 10, background: "#1463ff", color: "#fff", textDecoration: "none", fontWeight: 600 }}>
            {ctaLabel}
          </Link>
          <Link href={locale === "en" ? "/?lang=zh" : "/?lang=en"} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #c8d9e5", color: "#1d3b53", textDecoration: "none", fontWeight: 600 }}>
            {localeHint} {localeTarget}
          </Link>
        </div>
      </header>

      <section style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {(page?.sections || []).length > 0 ? (
          (page.sections || []).map((section: { id?: string; heading?: string; body?: string }, index: number) => (
            <article key={section.id || String(index)} style={{ padding: "18px 20px", borderRadius: 12, border: "1px solid #e6edf2", background: "#fff" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{section.heading || (locale === "en" ? "Section" : "内容区块")}</h2>
              <p style={{ margin: 0, color: "#55646d" }}>{section.body || "-"}</p>
            </article>
          ))
        ) : (
          <article style={{ padding: "18px 20px", borderRadius: 12, border: "1px dashed #cad8e0", color: "#5f707b" }}>
            {locale === "en"
              ? "No homepage sections yet. Add content in Admin > Content > Site Pages."
              : "首页区块尚未配置。可在后台 内容编辑 > 站点页面 中新增内容。"}
          </article>
        )}
      </section>
    </main>
  );
}
