import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Globe, MessageCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { companies, products, categoryLabelsEn } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";
import { InquiryButton } from "@/components/InquiryButton";

export async function generateStaticParams() {
  return companies.flatMap((c) => [
    { locale: "zh", slug: c.slug },
    { locale: "en", slug: c.slug },
  ]);
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export default async function CompanyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const d = getDictionary(locale);
  const dc = d.companies;
  const isEn = locale === "en";

  const company = companies.find((c) => c.slug === slug);
  if (!company) notFound();

  const companyProducts = products.filter((p) => company.products.includes(p.id));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/${locale}/companies`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {isEn ? "Back to Companies" : "返回企业库"}
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  <Image src={company.logo} alt={l(company.name, locale)} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{l(company.name, locale)}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{l(company.name, locale)}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{categoryLabelsEn[company.category]}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{dc.scales[company.scale as keyof typeof dc.scales]}</span>
                    {company.exportFlag && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">{isEn ? "✓ Exporter" : "✓ 出口企业"}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">{l(company.intro, locale)}</p>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400">{isEn ? "Founded" : "成立年份"}</dt>
                  <dd className="font-semibold text-gray-800">{company.founded}{isEn ? "" : " 年"}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400">{isEn ? "Region" : "所在区域"}</dt>
                  <dd className="font-semibold text-gray-800">{company.region}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs text-gray-400">{isEn ? "Scale" : "企业规模"}</dt>
                  <dd className="font-semibold text-gray-800">{dc.scales[company.scale as keyof typeof dc.scales]}</dd>
                </div>
              </dl>
            </div>

            {company.gallery.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">{isEn ? "Gallery" : "企业图库"}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {company.gallery.map((img, i) => (
                    <div key={i} className="aspect-4/3 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={img} alt={`${l(company.name, locale)} ${i + 1}`} width={300} height={225} className="w-full h-full object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {companyProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">{isEn ? "Main Products" : "主营产品"}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {companyProducts.map((p) => (
                    <Link key={p.id} href={`/${locale}/products/${p.slug}`} className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="aspect-4/3 overflow-hidden bg-gray-50">
                        <Image src={p.images[0]} alt={l(p.name, locale)} width={200} height={150} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-medium text-gray-800 line-clamp-2">{l(p.name, locale)}</div>
                        <div className="text-xs text-blue-700 font-semibold mt-1">{p.priceRange}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                {isEn ? "Send Inquiry" : "发送询盘"}
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                {isEn
                  ? "Contact this company directly for product pricing and cooperation."
                  : "直接联系该企业，了解产品报价与合作方式。"}
              </p>
              <InquiryButton
                targetName={l(company.name, locale)}
                locale={locale}
                isEn={isEn}
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">{dc.contact}</h2>
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
                    <Globe className="w-4 h-4 text-blue-600" /> {isEn ? "Official Website" : "官方网站"} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="bg-orange-500 rounded-xl p-5 text-white">
              <h2 className="font-semibold mb-1">{isEn ? "Shop Their Products" : "浏览产品"}</h2>
              <p className="text-xs text-orange-100 mb-4">{isEn ? "Explore and buy products from this manufacturer on Amazon." : "在亚马逊上浏览并购买该厂商的产品。"}</p>
              <Link href={`/${locale}/products`} className="block w-full bg-white text-orange-600 text-center text-sm font-semibold py-2.5 rounded-lg hover:bg-orange-50 transition-colors">
                {isEn ? "Shop Now" : "立即购买"}
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">{isEn ? "Location" : "位置"}</h2>
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                {isEn ? `Quzhou County, Handan, Hebei · ${company.region}` : `河北省邯郸市曲周县 ${company.region}`}
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
                  title={`${l(company.name, locale)} location`}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
