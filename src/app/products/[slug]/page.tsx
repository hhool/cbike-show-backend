import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Package } from "lucide-react";
import { products, companies } from "@/lib/data";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  return { title: product ? `${product.name.zh} | 曲周童车产业带` : "产品详情" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const company = companies.find((c) => c.id === product.companyId);
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回产品中心
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Images */}
                <div className="w-full md:w-80 shrink-0">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-50">
                    <Image src={product.images[0]} alt={product.name.zh} width={400} height={300} className="w-full h-full object-cover" unoptimized />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {product.images.slice(1).map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-400 cursor-pointer">
                          <Image src={img} alt={`${product.name.zh} ${i + 2}`} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-medium mb-1">{product.category}</div>
                  <h1 className="text-xl font-bold text-gray-900 mb-0.5">{product.name.zh}</h1>
                  <p className="text-sm text-gray-400">{product.name.en}</p>
                  <div className="text-2xl font-bold text-blue-700 mt-3 mb-4">{product.priceRange}</div>
                  <dl className="grid grid-cols-2 gap-2 text-sm mb-4">
                    {[
                      { k: "尺寸", v: product.size },
                      { k: "适用年龄", v: product.ageRange.zh },
                      { k: "材质", v: product.material },
                      { k: "起订量", v: `${product.moq} 件` },
                      { k: "交货期", v: product.leadTime },
                    ].map(({ k, v }) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                        <dt className="text-xs text-gray-400">{k}</dt>
                        <dd className="font-medium text-gray-800">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {product.certifications.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {product.certifications.map((cert) => (
                        <span key={cert} className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                          ✓ {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product intro */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">产品介绍</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{product.intro.zh}</p>
            </div>

            {/* Specs */}
            {Object.keys(product.specs).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">详细规格</h2>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <tr key={k} className="hover:bg-gray-50">
                        <td className="py-2.5 text-gray-500 w-1/3">{k}</td>
                        <td className="py-2.5 text-gray-800 font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Related */}
            {relatedProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">同类产品</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {relatedProducts.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`} className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                        <Image src={p.images[0]} alt={p.name.zh} width={200} height={150} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      </div>
                      <div className="p-2">
                        <div className="text-xs text-gray-800 line-clamp-2">{p.name.zh}</div>
                        <div className="text-xs text-blue-700 font-semibold mt-1">{p.priceRange}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-4">
            {/* Supplier */}
            {company && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">供应商</h2>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <Image src={company.logo} alt={company.name.zh} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{company.name.zh}</div>
                    <div className="text-xs text-gray-400">{company.region} · {company.category}</div>
                  </div>
                </div>
                <Link href={`/companies/${company.slug}`} className="block w-full text-center border border-blue-700 text-blue-700 text-xs font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  查看企业主页
                </Link>
              </div>
            )}
            {/* Inquiry */}
            <div className="bg-blue-700 rounded-xl p-5 text-white">
              <Package className="w-6 h-6 text-yellow-400 mb-2" />
              <h2 className="font-semibold mb-1">发起询盘</h2>
              <p className="text-xs text-blue-200 mb-4">填写采购需求，快速获取报价</p>
              <Link href={`/contact?product=${product.slug}`} className="block w-full bg-yellow-400 text-blue-900 text-center text-sm font-semibold py-2.5 rounded-lg hover:bg-yellow-300 transition-colors">
                立即询盘
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
