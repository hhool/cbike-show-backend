import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart, ExternalLink, Factory, Truck, Package } from "lucide-react";
import { companies, products, articles } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";
import { StatsCounter } from "@/components/StatsCounter";

type Props = { params: Promise<{ locale: Locale }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const h = d.home;
  const isEn = locale === "en";

  const featuredProducts = products.filter((p) => p.isFeatured);
  const heroProducts = featuredProducts.slice(0, 3);
  const featuredCompanies = companies.slice(0, 6);
  const latestArticles = articles.slice(0, 3);

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

      {/* Stats Counter */}
      <section className="bg-blue-50 border-y border-blue-100 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold text-blue-500 uppercase tracking-widest mb-8">
            {isEn ? "Quzhou Kids Bike Cluster in Numbers" : "曲周童车产业带数据"}
          </p>
          <StatsCounter isEn={isEn} />
        </div>
      </section>

      {/* Cluster Entry Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.clusterTitle}</h2>
            <p className="text-gray-500 mt-1">{h.clusterDesc}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {h.clusterCards.map((card: { title: string; desc: string; href: string }) => (
            <Link
              key={card.href}
              href={`/${locale}${card.href}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 flex-1">{card.desc}</p>
              <div className="flex items-center gap-1 mt-4 text-blue-600 text-sm font-medium">
                {h.learnMore} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Companies */}
      <section className="bg-gray-50 border-y py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.companiesTitle}</h2>
              <p className="text-gray-500 mt-1">{h.companiesDesc}</p>
            </div>
            <Link href={`/${locale}/companies`} className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">
              {h.viewAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCompanies.map((co) => (
              <Link
                key={co.id}
                href={`/${locale}/companies/${co.slug}`}
                className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="w-16 h-10 rounded overflow-hidden mb-3 bg-gray-50 flex items-center justify-center">
                  <Image src={co.logo} alt={l(co.name, locale)} width={64} height={40} className="object-cover w-full h-full" unoptimized />
                </div>
                <div className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors">
                  {l(co.name, locale)}
                </div>
              </Link>
            ))}
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

      {/* Supply Chain */}
      <section className="bg-gray-50 border-t py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.supplyChainTitle}</h2>
            <p className="text-gray-500 mt-1">{h.supplyChainDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(h.supplyChainItems as { title: string; desc: string }[]).map((item, i) => {
              const icons = [Factory, Truck, Package];
              const Icon = icons[i] ?? Factory;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href={`/${locale}/supply-chain`} className="inline-flex items-center gap-2 border border-blue-700 text-blue-700 font-semibold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors text-sm">
              {isEn ? "Learn About Supply Chain" : "了解供应链服务"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.newsTitle}</h2>
            <p className="text-gray-500 mt-1">{h.newsDesc}</p>
          </div>
          <Link href={`/${locale}/news`} className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">
            {h.viewAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestArticles.map((a) => (
            <Link
              key={a.id}
              href={`/${locale}/news/${a.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow"
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={a.featuredImg}
                  alt={l(a.title, locale)}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <div className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-block mb-2">
                  {a.category === "news" ? (isEn ? "Industry News" : "行业动态") : a.category === "guide" ? (isEn ? "Buying Guide" : "选购指南") : (isEn ? "Interview" : "厂家访谈")}
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{l(a.title, locale)}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{l(a.excerpt, locale)}</p>
                <div className="text-xs text-gray-400">{a.publishDate} · {a.author}</div>
              </div>
            </Link>
          ))}
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
