import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingCart, Package, ExternalLink, ShieldCheck } from "lucide-react";
import { products, companies } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";

export async function generateStaticParams() {
  return products.flatMap((p) => [
    { locale: "zh", slug: p.slug },
    { locale: "en", slug: p.slug },
  ]);
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

const platformLogo: Record<string, string> = {
  amazon: "🛒",
  walmart: "🏪",
  ebay: "🔵",
  other: "🛍️",
};

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const d = getDictionary(locale);
  const dp = d.products;
  const isEn = locale === "en";

  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const company = companies.find((c) => c.id === product.companyId);
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const hasBuyLinks = product.buyLinks && product.buyLinks.length > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/${locale}/products`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {isEn ? "Back to Products" : "返回产品中心"}
        </Link>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Images */}
                <div className="w-full md:w-80 shrink-0">
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-gray-50">
                    <Image src={product.images[0]} alt={l(product.name, locale)} width={400} height={300} className="w-full h-full object-cover" unoptimized />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {product.images.slice(1).map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-400 cursor-pointer">
                          <Image src={img} alt={`${l(product.name, locale)} ${i + 2}`} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{dp.categories[product.category as keyof typeof dp.categories]}</span>
                    {product.ageRange && <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{l(product.ageRange, locale)}</span>}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{l(product.name, locale)}</h1>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{l(product.intro, locale)}</p>

                  {/* Price */}
                  {product.retailPrice ? (
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-blue-700">{product.retailPrice}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{isEn ? "Retail price (varies by platform)" : "零售参考价（各平台略有差异）"}</div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-blue-700 mb-4">{product.priceRange}</div>
                  )}

                  {/* Buy Buttons */}
                  {hasBuyLinks ? (
                    <div className="mb-5 space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {isEn ? "Buy on" : "立即购买"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.buyLinks!.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors shadow-sm"
                          >
                            <span>{platformLogo[link.platform]}</span>
                            {link.label}
                            {link.region && <span className="text-orange-200 text-xs">{link.region}</span>}
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a href={`https://www.amazon.com/s?k=${encodeURIComponent(l(product.name, "en"))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-400 transition-colors mb-5">
                      <ShoppingCart className="w-4 h-4" /> {isEn ? "Search on Amazon" : "在亚马逊搜索"}
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {/* Safety badges */}
                  {product.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                      {product.certifications.map((cert) => (
                        <span key={cert} className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">{cert}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" /> {dp.specs}
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-50">
                        <td className="py-2 pr-4 text-gray-500 w-1/3">{key}</td>
                        <td className="py-2 font-medium text-gray-800">{value as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-4">
            {/* Manufacturer */}
            {company && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="text-xs text-gray-400 mb-2">{isEn ? "Made by" : "生产厂家"}</div>
                <Link href={`/${locale}/companies/${company.slug}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <Image src={company.logo} alt={l(company.name, locale)} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{l(company.name, locale)}</div>
                    <div className="text-xs text-gray-400">{isEn ? "Quzhou, China" : "中国 · 曲周"}</div>
                  </div>
                </Link>
              </div>
            )}

            {/* Buy Again CTA */}
            {hasBuyLinks && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                <div className="text-sm font-semibold text-orange-900 mb-1">{isEn ? "Ready to order?" : "准备好购买了吗？"}</div>
                <p className="text-xs text-orange-700 mb-3">{isEn ? "Shop directly on Amazon or other trusted platforms." : "通过亚马逊等平台安全购买，支持全球配送。"}</p>
                {product.buyLinks!.slice(0, 1).map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors w-full">
                    <ShoppingCart className="w-4 h-4" />
                    {isEn ? "Shop Now" : "立即购买"}
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                ))}
              </div>
            )}

            {/* Related */}
            {relatedProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{dp.relatedProducts}</h3>
                <div className="space-y-3">
                  {relatedProducts.map((rp) => (
                    <Link key={rp.id} href={`/${locale}/products/${rp.slug}`} className="flex gap-3 group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={rp.images[0]} alt={l(rp.name, locale)} width={56} height={56} className="w-full h-full object-cover group-hover:scale-105 transition-transform" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2">{l(rp.name, locale)}</div>
                        <div className="text-xs text-blue-600 font-medium mt-0.5">{rp.retailPrice ?? rp.priceRange}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

