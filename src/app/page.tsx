import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Factory, Truck, Package, TrendingUp } from "lucide-react";
import { companies, products, articles, stats } from "@/lib/data";

export default function Home() {
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);
  const latestArticles = articles.slice(0, 3);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-blue-600/40 text-blue-100 text-xs font-medium px-3 py-1 rounded-full mb-4">中国童车之都 · 河北曲周</div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">曲周童车产业带<br /><span className="text-yellow-300">全球童车采购</span>的首选之地</h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl">汇聚 1,680+ 家优质童车企业，年产值 120 亿元，产品远销全球 63 个国家和地区。</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href="/companies" className="bg-yellow-400 text-blue-900 font-semibold px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors flex items-center gap-2">进入企业库 <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/products" className="border border-blue-300 text-white px-6 py-3 rounded-full hover:bg-blue-700/50 transition-colors">浏览产品中心</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{s.value}<span className="text-lg ml-1">{s.unit}</span></div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cluster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">产业集群</h2>
          <p className="text-gray-500 mt-2">深入了解曲周童车产业的历史、区位与荣誉</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "走进曲周", desc: "探索曲周童车产业带的发展历史、产业规模与政府扶持政策。", href: "/cluster/about", color: "from-blue-500 to-blue-700", icon: "🏭" },
            { title: "产地区位", desc: "优越的地理位置，便捷的交通网络，充足的原材料资源。", href: "/cluster/location", color: "from-green-500 to-green-700", icon: "📍" },
            { title: "荣誉资质", desc: "中国童车之都称号，多项国家及行业认证，品质保障。", href: "/cluster/honors", color: "from-yellow-500 to-orange-600", icon: "🏆" },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className={`bg-gradient-to-br ${card.color} text-white p-8`}>
                <div className="text-4xl mb-3">{card.icon}</div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{card.desc}</p>
              </div>
              <div className="bg-white px-6 py-3 flex items-center justify-between text-sm font-medium text-blue-700">了解更多 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">企业库</h2><p className="text-gray-500 mt-1">发现产业带内优质童车企业</p></div>
            <Link href="/companies" className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">查看全部 <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/companies/${c.slug}`} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex gap-4 items-start">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium shrink-0 overflow-hidden">
                  <Image src={c.logo} alt={c.name} width={56} height={56} className="object-cover" unoptimized />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{c.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.region} · {c.categoryLabel}</div>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{c.intro.slice(0, 60)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">热门产品</h2><p className="text-gray-500 mt-1">精选产业带热销童车产品</p></div>
          <Link href="/products" className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">查看全部 <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {featuredProducts.map((p) => {
            const company = companies.find((c) => c.id === p.companyId);
            return (
              <Link key={p.id} href={`/products/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <Image src={p.images[0]} alt={p.name} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                </div>
                <div className="p-4">
                  <div className="text-xs text-blue-600 font-medium mb-1">{p.categoryLabel}</div>
                  <div className="font-semibold text-sm text-gray-900 line-clamp-2">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{company?.name}</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-blue-700">{p.priceRange}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">询盘</span>
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
          <div className="text-center mb-10"><h2 className="text-2xl md:text-3xl font-bold">供应链服务</h2><p className="text-blue-300 mt-2">一站式童车采购与生产解决方案</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Factory className="w-8 h-8" />, title: "OEM/ODM 定制加工", desc: "从选款、打样到大货生产全流程服务，支持品牌定制，最快30天交货。", href: "/supply-chain#oem" },
              { icon: <Truck className="w-8 h-8" />, title: "物流仓储服务", desc: "本地童车专属物流专线，覆盖全国及主要港口，海运、空运一站安排。", href: "/supply-chain#logistics" },
              { icon: <Package className="w-8 h-8" />, title: "零配件采购", desc: "车架、轮胎、座垫、把手等配件批发对接，满足整车厂及零售商需求。", href: "/supply-chain#parts" },
            ].map((s) => (
              <Link key={s.href} href={s.href} className="bg-blue-800/50 rounded-xl p-6 hover:bg-blue-800 transition-colors border border-blue-700/50 group">
                <div className="text-yellow-400 mb-4">{s.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-blue-300 text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="text-yellow-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">了解详情 <ArrowRight className="w-3.5 h-3.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl md:text-3xl font-bold text-gray-900">产业资讯</h2><p className="text-gray-500 mt-1">行业动态、选购指南、厂家访谈</p></div>
          <Link href="/news" className="text-blue-700 text-sm font-medium hover:underline flex items-center gap-1">查看全部 <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestArticles.map((a) => (
            <Link key={a.id} href={`/news/${a.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
              <div className="aspect-[16/9] overflow-hidden">
                <Image src={a.featuredImg} alt={a.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a.categoryLabel}</span>
                  {a.tags.slice(0, 2).map((t) => (<span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>))}
                </div>
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{a.excerpt}</p>
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">寻找合作伙伴？</h2>
          <p className="text-gray-700 mb-6">无论是产品采购、OEM定制还是供应链对接，我们都能为您提供一站式解决方案。</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors">立即在线询盘 <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
    </div>
  );
}
