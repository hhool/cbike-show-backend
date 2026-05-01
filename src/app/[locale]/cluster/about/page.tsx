import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export default async function ClusterAboutPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const dc = d.cluster.about;
  const isEn = locale === "en";

  const facts = isEn
    ? ["1,680+ registered manufacturers", "RMB 12 billion annual output", "Exports to 63 countries", "30+ years of industry history", "Leading cluster in China"]
    : ["1,680+ 家注册企业", "年产值 120 亿元", "出口 63 个国家和地区", "30+ 年产业历史", "全国领先产业集群"];

  const navLinks = [
    { href: `/${locale}/cluster/about`, label: isEn ? "About Quzhou" : "走进曲周" },
    { href: `/${locale}/cluster/location`, label: isEn ? "Location" : "产地区位" },
    { href: `/${locale}/cluster/honors`, label: isEn ? "Honors & Certs" : "荣誉资质" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-4 mb-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-blue-200 hover:text-white border-b border-blue-400 pb-0.5">{l.label}</Link>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{dc.pageTitle}</h1>
          <p className="text-blue-200 text-lg max-w-xl">{dc.pageDesc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{isEn ? "Industry at a Glance" : "产业概览"}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {isEn
                ? "Quzhou County in Handan, Hebei Province, has become China's largest and most complete children's bicycle production base. The cluster brings together manufacturing, parts supply, R&D, and export services."
                : "河北省邯郸市曲周县已成为中国最大、最完整的童车生产基地之一。产业带汇聚了整车制造、零配件供应、研发设计和出口贸易全产业链。"}
            </p>
            <ul className="space-y-3">
              {facts.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-2">{isEn ? "History" : "发展历史"}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isEn
                  ? "Starting in the 1980s as cottage workshops, Quzhou has grown over 40 years into a nationally recognized industry cluster with modern factories, global export capability, and government backing."
                  : "从20世纪80年代的作坊式起步，经过40余年发展，曲周已成为国家认可的现代化产业集群，拥有先进工厂、全球出口能力和政策支持。"}
              </p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h3 className="font-bold text-gray-900 mb-2">{isEn ? "Government Support" : "政府扶持"}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isEn
                  ? "Designated as a national characteristic industrial base with strong local government policies supporting R&D, export, and international certification."
                  : "被列为国家特色产业基地，地方政府出台政策扶持企业开展研发、出口和国际认证。"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href={`/${locale}/companies`} className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
            {isEn ? "Browse Companies" : "浏览企业库"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
