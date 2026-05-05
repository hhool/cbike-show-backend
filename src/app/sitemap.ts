import type { MetadataRoute } from "next";
import { companies, products, articles } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cbike.quzhou.com";
const locales = ["en", "zh"] as const;

function alternates(path: string) {
  return locales.map((locale) => `${BASE_URL}/${locale}${path}`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/cluster/about",
    "/cluster/location",
    "/cluster/honors",
    "/companies",
    "/companies/apply",
    "/products",
    "/supply-chain",
    "/news",
    "/contact",
  ];

  const staticEntries = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    }))
  );

  const companyEntries = companies.flatMap((c) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/companies/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  const productEntries = products.flatMap((p) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  const articleEntries = articles.flatMap((a) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/news/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...companyEntries, ...productEntries, ...articleEntries];
}
