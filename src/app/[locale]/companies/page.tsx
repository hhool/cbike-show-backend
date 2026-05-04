import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { companies, categoryLabelsEn } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale }> };

export default async function CompaniesPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const c = d.companies;
  const isEn = locale === "en";

  const categories = [
    { key: "", label: c.allTypes },
    { key: "brand", label: isEn ? "Leading Brands" : "龙头企业" },
    { key: "export", label: isEn ? "Export Trade" : "出口贸易" },
    { key: "parts", label: isEn ? "Parts & Components" : "零配件" },
    { key: "general", label: isEn ? "General" : "综合型" },
  ];

  const scales = [
    { key: "", label: c.allScales },
    { key: "large", label: c.scales.large },
    { key: "medium", label: c.scales.medium },
    { key: "small", label: c.scales.small },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{c.pageTitle}</h1>
          <p className="text-gray-500 mt-1">{c.pageDesc.replace("{n}", String(companies.length))}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-56 shrink-0 space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{c.filterType}</div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-700 transition-colors">
                  {cat.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{c.filterScale}</div>
            <div className="space-y-1">
              {scales.map((s) => (
                <div key={s.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-700 transition-colors">
                  {s.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{c.filterOther}</div>
            <label className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" className="accent-blue-600" />
              {c.exportOnly}
            </label>
          </div>
          <Link href={`/${locale}/companies/apply`} className="block w-full bg-blue-700 text-white text-center text-sm font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors">
            {c.applyBtn}
          </Link>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{c.total.replace("{n}", String(companies.length))}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {companies.map((co) => (
              <div key={co.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                      <Image src={co.logo} alt={l(co.name, locale)} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/${locale}/companies/${co.slug}`} className="font-semibold text-gray-900 text-sm hover:text-blue-700 line-clamp-1">
                        {l(co.name, locale)}
                      </Link>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{categoryLabelsEn[co.category]}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{c.scales[co.scale as keyof typeof c.scales]}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-3">{l(co.intro, locale)}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><MapPin className="w-3 h-3" />{co.region}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><Phone className="w-3 h-3" />{co.phone}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><Mail className="w-3 h-3" />{co.email}</div>
                  </div>
                </div>
                <div className="border-t px-5 py-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${co.exportFlag ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {co.exportFlag ? (isEn ? "✓ Export" : "✓ 出口") : (isEn ? "Domestic" : "内销")}
                  </span>
                  <Link href={`/${locale}/companies/${co.slug}`} className="text-blue-700 text-xs font-medium flex items-center gap-1 hover:underline">
                    {c.viewDetail} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
