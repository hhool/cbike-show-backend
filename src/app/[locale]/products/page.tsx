import Link from "next/link";
import Image from "next/image";
import { products, companies } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

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
    { key: "scooter", label: isEn ? "Scooters" : "滑板车" },
    { key: "toy", label: isEn ? "Toy Cars" : "玩具车" },
    { key: "stroller", label: isEn ? "Strollers" : "婴儿车/推车" },
    { key: "electric", label: isEn ? "Electric Bikes" : "电动车" },
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
                <Link key={p.id} href={`/${locale}/products/${p.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                    <Image src={p.images[0]} alt={p.nameEn} width={300} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">{p.categoryLabel}</div>
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2">{isEn ? p.nameEn : p.name}</div>
                    <div className="text-xs text-gray-400 mt-1 truncate">{isEn ? company?.nameEn : company?.name}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-blue-700">{p.priceRange}</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{dp.inquiry}</span>
                    </div>
                    {p.certifications.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {p.certifications.slice(0, 2).map((cert) => (
                          <span key={cert} className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{cert}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
