import Link from "next/link";
import { getLocaleEntryMap, getSitePageBySlug, pickLocale } from "../lib/cms";

type ProductsPageProps = {
  searchParams?: Promise<{ lang?: string; q?: string; region?: string; brand?: string; category?: string }>;
};

function omitStatusFilter(where: Record<string, unknown>): Record<string, unknown> {
  const next = { ...where };
  delete next._status;
  return next;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) || {};
  const locale = pickLocale(params.lang);
  const q = (params.q || "").trim();
  const region = (params.region || "").trim();
  const brandSlug = (params.brand || "").trim();
  const categorySlug = (params.category || "").trim();

  const { payload, page } = await getSitePageBySlug("products", locale);

  const safeFind = async (args: Parameters<typeof payload.find>[0], label: string): Promise<{ docs: any[] }> => {
    try {
      const result = await payload.find(args);
      return { docs: Array.isArray(result.docs) ? (result.docs as any[]) : [] };
    } catch (error) {
      console.error(`[products-page] failed to query ${label}`, error);
      return { docs: [] };
    }
  };

  let brandIdsByRegion: number[] = [];
  if (region) {
    const brandResult = await safeFind({
      collection: "brands",
      limit: 100,
      pagination: false,
      where: { region: { equals: region } },
      depth: 0,
    }, "brands-by-region");
    brandIdsByRegion = brandResult.docs.map((b: any) => b.id).filter((id: unknown): id is number => typeof id === "number");
  }

  let selectedBrand: any = null;
  if (brandSlug) {
    const selectedBrandResult = await safeFind({
      collection: "brands",
      limit: 1,
      pagination: false,
      locale,
      where: { slug: { equals: brandSlug } },
      depth: 0,
    }, "selected-brand");
    selectedBrand = selectedBrandResult.docs[0] || null;
  }

  let selectedCategory: any = null;
  if (categorySlug) {
    const selectedCategoryResult = await safeFind({
      collection: "categories",
      limit: 1,
      pagination: false,
      locale,
      where: { slug: { equals: categorySlug } },
      depth: 0,
    }, "selected-category");
    selectedCategory = selectedCategoryResult.docs[0] || null;
  }

  const whereClause: Record<string, unknown> = {
    _status: {
      equals: "published",
    },
  };
  if (q) {
    whereClause.modelName = { like: q };
  }
  if (region && brandSlug) {
    if (!selectedBrand || typeof selectedBrand.id !== "number") {
      whereClause.brand = { equals: -1 };
    } else if (brandIdsByRegion.length > 0 && !brandIdsByRegion.includes(selectedBrand.id)) {
      whereClause.brand = { equals: -1 };
    } else {
      whereClause.brand = { equals: selectedBrand.id };
    }
  } else if (brandSlug) {
    whereClause.brand = selectedBrand && typeof selectedBrand.id === "number" ? { equals: selectedBrand.id } : { equals: -1 };
  } else if (region) {
    whereClause.brand = brandIdsByRegion.length > 0 ? { in: brandIdsByRegion } : { equals: -1 };
  }
  if (categorySlug) {
    whereClause.category = selectedCategory && typeof selectedCategory.id === "number" ? { equals: selectedCategory.id } : { equals: -1 };
  }

  const quickBrandsResult = await safeFind({
    collection: "brands",
    limit: 8,
    pagination: false,
    locale,
    sort: "-priorityScore",
    ...(region ? { where: { region: { equals: region } } } : {}),
    depth: 0,
  }, "quick-brands");

  const productsQueryArgs: Parameters<typeof payload.find>[0] = {
    collection: "products",
    limit: 12,
    sort: "-updatedAt",
    locale,
    depth: 1,
    where: whereClause,
  };

  let productsResult = await safeFind(productsQueryArgs, "products-list");
  let usedStatusFallback = false;

  if (productsResult.docs.length === 0) {
    const fallbackWhere = omitStatusFilter(whereClause);
    productsResult = await safeFind({
      ...productsQueryArgs,
      where: fallbackWhere,
    }, "products-list-without-status");
    usedStatusFallback = productsResult.docs.length > 0;
  }

  const title = page?.heroTitle || page?.title || (locale === "en" ? "Products" : "产品库");
  const subtitle =
    page?.heroSubtitle ||
    (locale === "en"
      ? "Editable product listing powered by Payload CMS."
      : "可在后台维护的产品列表，数据由 Payload CMS 提供。");

  const localeMap = await getLocaleEntryMap(
    [
      "products.filter.reset",
      "products.filter.examples",
      "products.filter.regionNA",
      "products.filter.searchNuna",
      "products.filter.brandLabel",
      "products.filter.categoryLabel",
      "products.filter.categoryLightweight",
      "products.filter.categoryElectricToyCar",
      "products.filter.selectedCategory",
      "products.switchTo",
      "products.empty",
      "products.viewDetail",
    ],
    locale,
  );

  return (
    <main style={{ maxWidth: 980, margin: "42px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>{title}</h1>
        <p style={{ marginTop: 10, color: "#55646d" }}>{subtitle}</p>
        <Link href={locale === "en" ? "/products?lang=zh" : "/products?lang=en"} style={{ color: "#1c5b88", textDecoration: "none", fontWeight: 600 }}>
          {localeMap["products.switchTo"] || (locale === "en" ? "Switch to Chinese" : "切换到英文")}
        </Link>
      </header>

      <section style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Link href={`/products?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["products.filter.reset"] || (locale === "en" ? "Reset" : "重置")}
        </Link>
        <span style={{ color: "#6a7a85" }}>{localeMap["products.filter.examples"] || (locale === "en" ? "Examples:" : "示例:")}</span>
        <Link href={`/products?lang=${locale}&region=north_america`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["products.filter.regionNA"] || (locale === "en" ? "North America" : "北美")}
        </Link>
        <Link href={`/products?lang=${locale}&q=Nuna`} style={{ color: "#1c5b88", textDecoration: "none" }}>
          {localeMap["products.filter.searchNuna"] || (locale === "en" ? "Search Nuna" : "检索 Nuna")}
        </Link>
        <span style={{ color: "#6a7a85" }}>
          {localeMap["products.filter.categoryLabel"] || (locale === "en" ? "Category:" : "品类:")}
        </span>
        <Link
          href={`/products?lang=${locale}${region ? `&region=${region}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}${brandSlug ? `&brand=${brandSlug}` : ""}&category=stroller-lightweight`}
          style={{ color: "#1c5b88", textDecoration: "none" }}
        >
          {localeMap["products.filter.categoryLightweight"] || (locale === "en" ? "Lightweight Stroller" : "轻便婴儿推车")}
        </Link>
        <Link
          href={`/products?lang=${locale}${region ? `&region=${region}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}${brandSlug ? `&brand=${brandSlug}` : ""}&category=kids-electric-toy-car`}
          style={{ color: "#1c5b88", textDecoration: "none" }}
        >
          {localeMap["products.filter.categoryElectricToyCar"] || (locale === "en" ? "Kids Electric Ride-on Car" : "儿童电动玩具车")}
        </Link>
        <span style={{ color: "#6a7a85" }}>
          {localeMap["products.filter.brandLabel"] || (locale === "en" ? "Brand:" : "品牌:")}
        </span>
        {quickBrandsResult.docs.map((brand: any) => (
          <Link
            key={brand.id}
            href={`/products?lang=${locale}${region ? `&region=${region}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}${categorySlug ? `&category=${categorySlug}` : ""}&brand=${brand.slug}`}
            style={{ color: "#1c5b88", textDecoration: "none" }}
          >
            {brand.name || "-"}
          </Link>
        ))}
        {selectedBrand?.name && (
          <span style={{ color: "#4f5f67" }}>
            {locale === "en" ? "Selected" : "已选"}: <strong>{selectedBrand.name}</strong>
          </span>
        )}
        {selectedCategory?.name && (
          <span style={{ color: "#4f5f67" }}>
            {localeMap["products.filter.selectedCategory"] || (locale === "en" ? "Category" : "品类")}: <strong>{selectedCategory.name}</strong>
          </span>
        )}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {productsResult.docs.length > 0 ? (
          productsResult.docs.map((item: any) => (
            <article key={item.id} style={{ border: "1px solid #e4ebf0", borderRadius: 12, padding: 14, background: "#fff" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{item.modelName}</h2>
              <p style={{ margin: "0 0 8px", color: "#495a65" }}>
                {(item.brand && typeof item.brand === "object" ? item.brand.name : "-") || "-"}
              </p>
              <p style={{ margin: "0 0 8px", color: "#5d6d77" }}>{item.summary || "-"}</p>
              <p style={{ margin: 0, fontWeight: 700, color: "#17486b" }}>
                ¥{typeof item.msrpCNY === "number" ? item.msrpCNY.toLocaleString() : "-"}
              </p>
              <p style={{ margin: "10px 0 0" }}>
                <Link href={`/products/${item.slug}?lang=${locale}`} style={{ color: "#1c5b88", textDecoration: "none", fontWeight: 600 }}>
                  {localeMap["products.viewDetail"] || (locale === "en" ? "View details" : "查看详情")}
                </Link>
              </p>
            </article>
          ))
        ) : (
          <article style={{ border: "1px dashed #c8d6df", borderRadius: 12, padding: 18, color: "#5f707b" }}>
            {localeMap["products.empty"] ||
              (locale === "en"
                ? "No published products yet. Add records in Admin > Catalog > Products."
                : "暂无已发布产品。可在后台 目录管理 > 产品 中新增并发布。")}
          </article>
        )}
      </section>
      {usedStatusFallback && (
        <p style={{ marginTop: 10, color: "#8a5b00", fontSize: 13 }}>
          {locale === "en"
            ? "Compatibility mode: displaying records without publish-status filter. Please run database migrations to restore strict published filtering."
            : "兼容模式：当前未按发布状态过滤展示数据。请尽快执行数据库迁移，以恢复严格的“已发布”过滤。"}
        </p>
      )}
    </main>
  );
}
