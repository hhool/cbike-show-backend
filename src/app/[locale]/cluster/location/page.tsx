import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export default async function ClusterLocationPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const dc = d.cluster.location;
  const isEn = locale === "en";

  const advantages = isEn
    ? [
        { title: "Port Access", desc: "200 km to Tianjin Port and 300 km to Qingdao Port — China's major export gateways." },
        { title: "Road Network", desc: "G36 Nanjing–Luoyang expressway and multiple provincial roads pass through, ensuring fast domestic distribution." },
        { title: "Rail Freight", desc: "Nearby freight rail station enables efficient bulk shipment across China." },
        { title: "Raw Materials", desc: "Steel, aluminum, rubber, and plastics sourced locally and from surrounding Hebei/Shandong provinces." },
      ]
    : [
        { title: "港口优势", desc: "距天津港约200公里，距青岛港约300公里，是中国主要出口大港。" },
        { title: "公路网络", desc: "G36南京–洛阳高速及多条省道贯通，实现快速国内配送。" },
        { title: "铁路货运", desc: "附近货运铁路站点支持大宗商品的高效全国发运。" },
        { title: "原材料供应", desc: "钢铁、铝材、橡胶、塑料等原材料在河北、山东省内就地取材。" },
      ];

  const navLinks = [
    { href: `/${locale}/cluster/about`, label: isEn ? "About Quzhou" : "走进曲周" },
    { href: `/${locale}/cluster/location`, label: isEn ? "Location" : "产地区位" },
    { href: `/${locale}/cluster/honors`, label: isEn ? "Honors & Certs" : "荣誉资质" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-green-800 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-4 mb-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-green-200 hover:text-white border-b border-green-400 pb-0.5">{l.label}</Link>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{dc.pageTitle}</h1>
          <p className="text-green-200 text-lg max-w-xl">{dc.pageDesc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-10">
          <MapPin className="w-4 h-4 text-blue-600" />
          {isEn ? "Quzhou County, Handan City, Hebei Province, China" : "中国 · 河北省邯郸市曲周县"}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advantages.map((a) => (
            <div key={a.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 aspect-[16/6] rounded-2xl overflow-hidden bg-gray-100">
          <iframe
            src="https://maps.google.com/maps?q=36.77,115.00&z=10&output=embed"
            width="100%" height="100%"
            style={{ border: 0 }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={isEn ? "Quzhou location map" : "曲周位置地图"}
          />
        </div>

        <div className="mt-12 text-center">
          <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
            {isEn ? "Contact Us" : "联系我们"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
