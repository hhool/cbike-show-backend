import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { products, companies } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale }> };

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const dp = d.products;
  const isEn = locale === "en";

  const categoryList = [
    { key: "", label: dp.allCategories },
    { key: "bike", label: isEn ? "Kids Bikes" : "儿童自行车" },
    { key: "balance", label: isEn ? "Balance Bikes" : "平衡车" },
    { key: "tricycle", label: isEn ? "Tricycles" : "三轮童车" },
    { key: "ride-on", label: isEn ? "Ride-On / Wiggle Cars" : "扭扭车/溜溜车" },
    { key: "scooter", label: isEn ? "Kids Scooters" : "儿童滑板车" },
    { key: "toddler-scooter", label: isEn ? "Toddler Scooters" : "幼儿滑板车" },
    { key: "stroller", label: isEn ? "Strollers" : "婴儿推车" },
    { key: "highchair", label: isEn ? "High Chairs" : "高脚餐椅" },
    { key: "electric", label: isEn ? "Electric Ride-Ons" : "电动童车" },
  ];

  const ageGroups = [
    { key: "", label: isEn ? "All Ages" : "全部年龄" },
    { key: "infant", label: isEn ? "Infant (0–1 yr)" : "婴儿 0–1岁" },
    { key: "toddler", label: isEn ? "Toddler (1–3 yr)" : "幼儿 1–3岁" },
    { key: "kids", label: isEn ? "Kids (3–12 yr)" : "儿童 3–12岁" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{dp.pageTitle}</h1>
          <p className="text-gray-500 mt-1">{dp.pageDesc}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-52 shrink-0 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{isEn ? "Category" : "产品分类"}</div>
            <div className="space-y-1">
              {categoryList.map((c) => (
                <div key={c.key} className="px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-700 transition-colors">
                  {c.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{isEn ? "Age Group" : "适用年龄"}</div>
            <div className="space-y-1">
              {ageGroups.map((a) => (
                <div key={a.key} className="px-2 py-1.5 rounded-lg hover:bg-orange-50 cursor-pointer text-sm text-gray-700 hover:text-orange-600 transition-colors">
                  {a.label}
                </div>
              ))}
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {isEn ? <>{products.length} products</> : <>共 <span className="font-semibold text-gray-800">{products.length}</span> 件产品</>}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => {
              const company = companies.find((c) => c.id === p.companyId);
              return (
                <div key={p.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
                  <Link href={`/${locale}/products/${p.slug}`} className="absolute inset-0 z-0" aria-label={l(p.name, locale)} />
                  <div className="aspect-4/3 overflow-hidden bg-gray-50">
                    <Image src={p.images[0]} alt={l(p.name, locale)} width={300} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="text-xs text-blue-600 font-medium">{dp.categories[p.category as keyof typeof dp.categories] ?? l(p.name, locale)}</div>
                      {p.ageRange && (
                        <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">{l(p.ageRange, locale)}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2">{l(p.name, locale)}</div>
                    <div className="text-xs text-gray-400 mt-1 truncate">{company ? l(company.name, locale) : ""}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-blue-700">{p.retailPrice ?? p.priceRange}</span>
                      {p.buyLinks && p.buyLinks.length > 0 ? (
                        <a
                          href={p.buyLinks[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 inline-flex items-center gap-1 text-xs bg-orange-500 hover:bg-orange-400 text-white font-semibold px-2.5 py-1 rounded-full transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          {isEn ? "Buy" : "购买"}
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{isEn ? "View" : "查看"}</span>
                      )}
                    </div>
                    {p.certifications.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {p.certifications.slice(0, 2).map((cert) => (
                          <span key={cert} className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{cert}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
