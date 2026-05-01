import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Factory, Truck, Package, TrendingUp } from "lucide-react";
import { companies, products, articles, stats } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const h = d.home;
  const isEn = locale === "en";

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);
  const latestArticles = articles.slice(0, 3);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-blue-600/40 text-blue-100 text-xs font-medium px-3 py-1 rounded-full mb-4">{h.heroBadge}</div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              {h.heroTitle}<br /><span className="text-yellow-300">{h.heroHighlight}</span>{h.heroSuffix ? ` ${h.heroSuffix}` : ""}
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl">{h.heroDesc}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href={`/${locale}/companies`} className="bg-yellow-400 text-blue-900 font-semibold px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors flex items-center gap-2">{h.ctaCompanies} <ArrowRight className="w-4 h-4" /></Link>
              <Link href={`/${locale}/products`} className="border border-blue-300 text-white px-6 py-3 rounded-full hover:bg-blue-700/50 transition-colors">{h.ctaProducts}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{s.value}<span className="text-lg ml-1">{isEn ? s.unitEn : s.unit}</span></div>
              <div className="text-blue-200 text-sm mt-1">{isEn ? s.labelEn : s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cluster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.clusterTitle}</h2>
          <p className="text-gray-500 mt-2">{h.clusterDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(h.clusterCards as Array<{ title: string; desc: string; href: string }>).map((card, i) => {
            const colors = ["from-blue-500 to-blue-700", "from-green-500 to-green-700", "from-yellow-500 to-orange-600"];
            const icons = ["🏭", "📍", "🏆"];
            return (
              <Link key={card.href} href={`/${locale}${card.href.replace(/^\/(zh|en)/, "")}`} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className={`bg-gradient-to-br ${colors[i]} text-white p-8`}>
                  <div className="text-4xl mb-3">{icons[i]}</div>
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <p className="text-sm opacity-80 leading-relaxed">{card.desc}</p>
                </div>
                <div className="bg-white px-6 py-3 flex items-center justify-between text-sm font-medium text-blue-700">{h.learnMore} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Companies */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.companiesTitle}</h2><p className="text-gray-500 mt-1">{h.companiesDesc}</p></div>
            <Link href={`/${locale}/companies`} className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">{h.viewAll} <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/${locale}/companies/${c.slug}`} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex gap-4 items-start">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium shrink-0 overflow-hidden">
                  <Image src={c.logo} alt={c.nameEn} width={56} height={56} className="object-cover" unoptimized />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{isEn ? c.nameEn : c.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.region} · {c.categoryLabel}</div>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{(isEn ? c.introEn : c.intro).slice(0, 80)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.productsTitle}</h2><p className="text-gray-500 mt-1">{h.productsDesc}</p></div>
          <Link href={`/${locale}/products`} className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">{h.viewAll} <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {featuredProducts.map((p) => {
            const company = companies.find((c) => c.id === p.companyId);
            return (
              <Link key={p.id} href={`/${locale}/products/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <Image src={p.images[0]} alt={p.nameEn} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                </div>
                <div className="p-4">
                  <div className="text-xs text-blue-600 font-medium mb-1">{p.categoryLabel}</div>
                  <div className="font-semibold text-sm text-gray-900 line-clamp-2">{isEn ? p.nameEn : p.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{isEn ? company?.nameEn : company?.name}</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-blue-700">{p.priceRange}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{d.products.inquiry}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Supply Chain */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10"><h2 className="text-2xl md:text-3xl font-bold">{h.supplyChainTitle}</h2><p className="text-blue-300 mt-2">{h.supplyChainDesc}</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(h.supplyChainItems as Array<{ title: string; desc: string }>).map((s, i) => {
              const icons = [<Factory key="f" className="w-8 h-8" />, <Truck key="t" className="w-8 h-8" />, <Package key="p" className="w-8 h-8" />];
              const hrefs = [`/${locale}/supply-chain#oem`, `/${locale}/supply-chain#logistics`, `/${locale}/supply-chain#parts`];
              return (
                <Link key={i} href={hrefs[i]} className="bg-blue-800/50 rounded-xl p-6 hover:bg-blue-800 transition-colors border border-blue-700/50 group">
                  <div className="text-yellow-400 mb-4">{icons[i]}</div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-blue-300 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <span className="text-yellow-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">{h.learnMore} <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">{h.newsTitle}</h2><p className="text-gray-500 mt-1">{h.newsDesc}</p></div>
          <Link href={`/${locale}/news`} className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">{h.viewAll} <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestArticles.map((a) => (
            <Link key={a.id} href={`/${locale}/news/${a.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
              <div className="aspect-[16/9] overflow-hidden">
                <Image src={a.featuredImg} alt={a.titleEn} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a.categoryLabel}</span>
                  {a.tags.slice(0, 2).map((t) => (<span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>))}
                </div>
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{isEn ? a.titleEn : a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{isEn ? a.excerptEn : a.excerpt}</p>
                <div className="text-xs text-gray-400 mt-3">{a.publishDate} · {a.author}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-yellow-400 to-orange-400 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <TrendingUp className="w-10 h-10 mx-auto text-orange-700 mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{h.ctaBannerTitle}</h2>
          <p className="text-gray-700 mb-6">{h.ctaBannerDesc}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors">{h.ctaBannerBtn} <ArrowRight className="w-4 h-4" /></Link>
            <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 border-2 border-blue-900 text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-900/10 transition-colors">{h.ctaBannerLink}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
