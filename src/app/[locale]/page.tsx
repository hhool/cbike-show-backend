import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart, ExternalLink } from "lucide-react";
import { companies, products } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const h = d.home;
  const isEn = locale === "en";

  const featuredProducts = products.filter((p) => p.isFeatured);
  const heroProducts = featuredProducts.slice(0, 3);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          {/* Left: text + CTA */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-blue-600/40 text-blue-100 text-xs font-medium px-3 py-1 rounded-full mb-4">{h.heroBadge}</div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              {h.heroTitle}<br /><span className="text-yellow-300">{h.heroHighlight}</span>{h.heroSuffix ? ` ${h.heroSuffix}` : ""}
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl">{h.heroDesc}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href={`/${locale}/products`} className="bg-yellow-400 text-blue-900 font-semibold px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors flex items-center gap-2">{h.ctaProducts} <ArrowRight className="w-4 h-4" /></Link>
              <Link href={`/${locale}/companies`} className="border border-blue-300 text-white px-6 py-3 rounded-full hover:bg-blue-700/50 transition-colors">{h.ctaCompanies}</Link>
            </div>
          </div>
          {/* Right: featured product cards */}
          <div className="hidden md:flex flex-col gap-3 w-72 shrink-0">
            {heroProducts.map((p) => {
              const company = companies.find((c) => c.id === p.companyId);
              return (
                <Link
                  key={p.id}
                  href={`/${locale}/products/${p.slug}`}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/10">
                    <Image src={p.images[0]} alt={l(p.name, locale)} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-blue-200 mb-0.5">{d.products.categories[p.category as keyof typeof d.products.categories]} · {l(p.ageRange, locale)}</div>
                    <div className="text-sm font-semibold text-white line-clamp-1 group-hover:text-yellow-200 transition-colors">{l(p.name, locale)}</div>
                    <div className="text-xs text-gray-300 mt-0.5 truncate">{company ? l(company.name, locale) : ""}</div>
                    <div className="text-yellow-300 text-sm font-bold mt-1">{p.retailPrice ?? p.priceRange}</div>
                  </div>
                </Link>
              );
            })}
            <Link href={`/${locale}/products`} className="text-center text-blue-200 text-xs hover:text-white transition-colors flex items-center justify-center gap-1 mt-1">
              {isEn ? "View all products" : "查看全部产品"} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products — main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.productsTitle}</h2>
            <p className="text-gray-500 mt-1">{h.productsDesc}</p>
          </div>
          <Link href={`/${locale}/products`} className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">{h.viewAll} <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((p) => {
            const company = companies.find((c) => c.id === p.companyId);
            const buyLink = p.buyLinks?.[0];
            return (
              <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow flex flex-col">
                <Link href={`/${locale}/products/${p.slug}`} className="aspect-4/3 overflow-hidden block">
                  <Image src={p.images[0]} alt={l(p.name, locale)} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-xs text-blue-600 font-medium">{d.products.categories[p.category as keyof typeof d.products.categories]}</span>
                    {p.ageRange && <span className="text-xs bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full">{l(p.ageRange, locale)}</span>}
                  </div>
                  <Link href={`/${locale}/products/${p.slug}`} className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-blue-700">{l(p.name, locale)}</Link>
                  <div className="text-xs text-gray-400 mt-1 truncate">{company ? l(company.name, locale) : ""}</div>
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <span className="text-sm font-bold text-blue-700">{p.retailPrice ?? p.priceRange}</span>
                    {buyLink ? (
                      <a
                        href={buyLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-orange-500 hover:bg-orange-400 text-white font-semibold px-2.5 py-1 rounded-full transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        {isEn ? "Buy" : "购买"}
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    ) : (
                      <Link href={`/${locale}/products/${p.slug}`} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full hover:bg-blue-100">
                        {isEn ? "View" : "查看"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-r from-yellow-400 to-orange-400 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <ShoppingCart className="w-10 h-10 mx-auto text-orange-700 mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{h.ctaBannerTitle}</h2>
          <p className="text-gray-700 mb-6">{h.ctaBannerDesc}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors">{h.ctaBannerBtn} <ArrowRight className="w-4 h-4" /></Link>
            <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 border-2 border-blue-900 text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-900/10 transition-colors">{h.ctaBannerLink}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
