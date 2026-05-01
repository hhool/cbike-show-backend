import Link from "next/link";
import { Trophy, ArrowRight, Star } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export default async function ClusterHonorsPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const dc = d.cluster.honors;
  const isEn = locale === "en";

  const honors = isEn
    ? [
        { title: "China's Kids Bike Capital", year: "2008", desc: "Awarded by the China Bicycle Association, recognizing Quzhou as the national hub for children's bicycle production.", level: "National" },
        { title: "National Characteristic Industrial Base", year: "2012", desc: "Designated as a national characteristic industrial base by the Ministry of Industry and Information Technology.", level: "National" },
        { title: "Province-Level Export Base", year: "2015", desc: "Hebei Province designated Quzhou as an export base for the light manufacturing industry.", level: "Provincial" },
        { title: "Quality Excellence Award", year: "2019", desc: "Cluster-level quality management excellence recognized by national industry authority.", level: "National" },
        { title: "Green Manufacturing Base", year: "2021", desc: "Certified as a green manufacturing industrial park with environmental standards compliance.", level: "National" },
        { title: "Top 100 Industry Clusters", year: "2023", desc: "Ranked among China's top 100 specialty industry clusters by national industrial planning commission.", level: "National" },
      ]
    : [
        { title: "中国童车之都", year: "2008", desc: "由中国自行车协会授予，认定曲周为全国童车生产核心产区。", level: "国家级" },
        { title: "国家特色产业基地", year: "2012", desc: "工业和信息化部认定的国家特色产业基地。", level: "国家级" },
        { title: "省级出口基地", year: "2015", desc: "河北省将曲周设立为轻工制造出口基地。", level: "省级" },
        { title: "质量管理卓越奖", year: "2019", desc: "国家行业主管机构认定产业带质量管理体系卓越。", level: "国家级" },
        { title: "绿色制造产业园", year: "2021", desc: "通过绿色制造标准体系认证，环保合规工业园区。", level: "国家级" },
        { title: "中国特色产业集群百强", year: "2023", desc: "由国家产业规划委员会评选为中国特色产业集群百强。", level: "国家级" },
      ];

  const navLinks = [
    { href: `/${locale}/cluster/about`, label: isEn ? "About Quzhou" : "走进曲周" },
    { href: `/${locale}/cluster/location`, label: isEn ? "Location" : "产地区位" },
    { href: `/${locale}/cluster/honors`, label: isEn ? "Honors & Certs" : "荣誉资质" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-yellow-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-4 mb-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-yellow-200 hover:text-white border-b border-yellow-400 pb-0.5">{l.label}</Link>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{dc.pageTitle}</h1>
          <p className="text-yellow-100 text-lg max-w-xl">{dc.pageDesc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {honors.map((h) => (
            <div key={h.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 border-b border-orange-100">
                <div className="flex items-start justify-between">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{h.level}</span>
                </div>
                <h3 className="font-bold text-gray-900 mt-3 text-lg">{h.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-gray-400">{h.year}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href={`/${locale}/companies`} className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
            {isEn ? "Browse Certified Companies" : "浏览认证企业"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
