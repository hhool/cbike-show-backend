import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Globe, MessageCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { companies, products } from "@/lib/data";

export async function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies.find((c) => c.slug === slug);
  return { title: company ? `${company.name.zh} | 曲周童车产业带` : "企业详情" };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies.find((c) => c.slug === slug);
  if (!company) notFound();

  const companyProducts = products.filter((p) => company.products.includes(p.id));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/companies" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回企业库
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main */}
          <div className="flex-1 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  <Image src={company.logo} alt={company.name.zh} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{company.name.zh}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{company.name.en}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{company.category}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{company.scale}</span>
                    {company.exportFlag && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">✓ 出口企业</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">{company.intro.zh}</p>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400">成立年份</dt>
                  <dd className="font-semibold text-gray-800">{company.founded} 年</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400">所在区域</dt>
                  <dd className="font-semibold text-gray-800">{company.region}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400">企业规模</dt>
                  <dd className="font-semibold text-gray-800">{company.scale}</dd>
                </div>
              </dl>
            </div>

            {/* Gallery */}
            {company.gallery.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">企业图库</h2>
                <div className="grid grid-cols-3 gap-2">
                  {company.gallery.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                      <Image src={img} alt={`${company.name.zh} 图片${i + 1}`} width={300} height={225} className="w-full h-full object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {companyProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">主营产品</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {companyProducts.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`} className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                        <Image src={p.images[0]} alt={p.name.zh} width={200} height={150} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-medium text-gray-800 line-clamp-2">{p.name.zh}</div>
                        <div className="text-xs text-blue-700 font-semibold mt-1">{p.priceRange}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">联系方式</h2>
              <div className="space-y-3">
                <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
                  <Phone className="w-4 h-4 text-blue-600" /> {company.phone}
                </a>
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
                  <Mail className="w-4 h-4 text-blue-600" /> {company.email}
                </a>
                {company.whatsapp && (
                  <a href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600">
                    <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
                    <Globe className="w-4 h-4 text-blue-600" /> 官方网站 <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="bg-blue-700 rounded-xl p-5 text-white">
              <h2 className="font-semibold mb-1">在线询盘</h2>
              <p className="text-xs text-blue-200 mb-4">填写需求，我们将安排工厂快速回复</p>
              <Link href={`/contact?company=${company.slug}`} className="block w-full bg-yellow-400 text-blue-900 text-center text-sm font-semibold py-2.5 rounded-lg hover:bg-yellow-300 transition-colors">
                发起询盘
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">位置</h2>
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                河北省邯郸市曲周县 {company.region}
              </div>
              <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  src={`https://maps.google.com/maps?q=${company.lat},${company.lng}&z=14&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${company.name.zh}位置`}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
