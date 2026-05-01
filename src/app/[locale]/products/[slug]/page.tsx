import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Package } from "lucide-react";
import { products, companies } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return products.flatMap((p) => [
    { locale: "zh", slug: p.slug },
    { locale: "en", slug: p.slug },
  ]);
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const d = getDictionary(locale);
  const dp = d.products;
  const isEn = locale === "en";

  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const company = companies.find((c) => c.id === product.companyId);
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

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
                <div className="w-full md:w-80 shrink-0">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-50">
                    <Image src={product.images[0]} alt={product.nameEn} width={400} height={300} className="w-full h-full object-cover" unoptimized />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {product.images.slice(1).map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-400 cursor-pointer">
                          <Image src={img} alt={`${product.nameEn} ${i + 2}`} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-medium mb-2">{product.categoryLabel}</div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{isEn ? product.nameEn : product.name}</h1>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{isEn ? product.introEn : product.intro}</p>
                  <div className="text-2xl font-bold text-blue-700 mb-4">{product.priceRange}</div>
                  <dl className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <dt className="text-xs text-gray-400">{dp.moq}</dt>
                      <dd className="font-semibold text-gray-800">{product.moq}</dd>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <dt className="text-xs text-gray-400">{dp.leadTime}</dt>
                      <dd className="font-semibold text-gray-800">{product.leadTime}</dd>
                    </div>
                  </dl>
                  {product.certifications.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-1.5">{dp.certifications}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.certifications.map((cert) => (
                          <span key={cert} className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">{cert}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <Link href={`/${locale}/contact?product=${product.slug}`} className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" /> {dp.inquiry}
                  </Link>
                </div>
              </div>
            </div>
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
          <aside className="w-full lg:w-64 shrink-0 space-y-4">
            {company && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="text-xs text-gray-400 mb-2">{dp.supplier}</div>
                <Link href={`/${locale}/companies/${company.slug}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <Image src={company.logo} alt={company.nameEn} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{isEn ? company.nameEn : company.name}</div>
                    <div className="text-xs text-gray-400">{company.region}</div>
                  </div>
                </Link>
              </div>
            )}
            {relatedProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{dp.relatedProducts}</h3>
                <div className="space-y-3">
                  {relatedProducts.map((rp) => (
                    <Link key={rp.id} href={`/${locale}/products/${rp.slug}`} className="flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <Image src={rp.images[0]} alt={rp.nameEn} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-blue-700">{isEn ? rp.nameEn : rp.name}</div>
                        <div className="text-xs text-blue-700 font-semibold mt-0.5">{rp.priceRange}</div>
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
