import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

export const metadata = { title: "产地区位 | 曲周童车产业带" };

export default function ClusterLocationPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-green-800 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-sm text-green-300 mb-2">产业集群 / 产地区位</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">产地区位</h1>
          <p className="text-green-200 max-w-xl">优越的地理区位与完善的物流配套，是曲周童车走向全球的重要基础</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Map embed */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">地理位置</h2>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm aspect-[2/1]">
            <iframe
              src="https://maps.google.com/maps?q=曲周县,邯郸,河北&z=11&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="曲周县地图"
            />
          </div>
          <div className="flex items-start gap-2 mt-3 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            河北省邯郸市曲周县 — 北纬 36°42′，东经 114°58′
          </div>
        </section>

        {/* Traffic */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">交通优势</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "公路", items: ["京港澳高速 40 km", "邢汾高速穿境而过", "国道 G308 连接邯郸市区", "距县城至各厂区均有宽敞产业道路"] },
              { title: "铁路", items: ["邯郸火车站 40 km", "邯郸东高铁站 50 km", "货运专线可直达天津港"] },
              { title: "航空", items: ["邯郸机场 45 km", "石家庄正定机场 180 km", "北京首都机场 430 km"] },
            ].map((t) => (
              <div key={t.title} className="bg-green-50 rounded-xl p-5 border border-green-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">{t.title}</h3>
                <ul className="space-y-1.5">
                  {t.items.map((i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">•</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Port access */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">港口出海通道</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold border-b">港口</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold border-b">距离</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold border-b">参考运输时间</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold border-b">主要航线</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { port: "天津港", dist: "约 370 km", time: "4–5 小时", routes: "北美、北欧、澳洲" },
                  { port: "青岛港", dist: "约 460 km", time: "5–6 小时", routes: "东南亚、中东、欧洲" },
                  { port: "上海港", dist: "约 900 km", time: "10 小时（夜班车）", routes: "全球主要港口" },
                ].map((r) => (
                  <tr key={r.port} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{r.port}</td>
                    <td className="py-3 px-4 text-gray-500">{r.dist}</td>
                    <td className="py-3 px-4 text-gray-500">{r.time}</td>
                    <td className="py-3 px-4 text-gray-500">{r.routes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">原材料资源</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: "钢铁产业", desc: "邯郸是全国重要钢铁基地，低成本优质钢材直供" },
              { title: "橡塑产业", desc: "周边地区橡胶、塑料件配套完善" },
              { title: "纺织产业", desc: "鞍座面料、安全带等纺织配件就近采购" },
              { title: "劳动力资源", desc: "农业大县劳动力充足，人工成本低于平均水平" },
            ].map((r) => (
              <div key={r.title} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="font-semibold text-sm text-gray-800 mb-1">{r.title}</div>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <Link href="/cluster/honors" className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors">
            查看荣誉资质 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/companies" className="inline-flex items-center gap-2 border border-green-700 text-green-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-50 transition-colors">
            进入企业库
          </Link>
        </div>
      </div>
    </div>
  );
}
