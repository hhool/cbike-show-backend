import Link from "next/link";
import { Trophy, ArrowRight, Star } from "lucide-react";

export const metadata = { title: "荣誉资质 | 曲周童车产业带" };

const honors = [
  { year: "2010", title: "中国童车之都", org: "中国自行车协会", level: "国家级" },
  { year: "2015", title: "国家外贸转型升级基地（童车）", org: "商务部", level: "国家级" },
  { year: "2016", title: "全国百佳产业集群", org: "工业和信息化部", level: "国家级" },
  { year: "2018", title: "国家级出口质量安全示范区", org: "海关总署", level: "国家级" },
  { year: "2019", title: "河北省特色产业集群", org: "河北省政府", level: "省级" },
  { year: "2021", title: "邯郸市童车智造小镇", org: "邯郸市政府", level: "市级" },
];

const certs = [
  { name: "CE", region: "欧盟", desc: "符合EN71欧洲玩具安全标准，绿色通道进欧市场" },
  { name: "3C", region: "中国", desc: "中国强制性产品认证，内销必备" },
  { name: "ASTM F963", region: "美国", desc: "美国玩具安全标准，出口美国必要认证" },
  { name: "EN71", region: "英国/欧盟", desc: "欧洲玩具安全指令，覆盖物理、化学测试" },
  { name: "ISO 9001", region: "全球", desc: "质量管理体系国际标准认证" },
  { name: "REACH", region: "欧盟", desc: "欧盟化学品注册、评估许可与限制法规" },
];

export default function ClusterHonorsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-yellow-700 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-sm text-yellow-300 mb-2">产业集群 / 荣誉资质</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">荣誉资质</h1>
          <p className="text-yellow-100 max-w-xl">国家与行业机构的多项权威认定，是曲周童车品质的最好背书</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Honors */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> 产业荣誉
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {honors.map((h) => (
              <div key={h.title} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.level === "国家级" ? "bg-red-100 text-red-600" : h.level === "省级" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                      {h.level}
                    </span>
                    <span className="text-xs text-gray-400">{h.year}年</span>
                  </div>
                  <div className="font-semibold text-gray-800">{h.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">颁发机构：{h.org}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">主要产品认证</h2>
          <p className="text-sm text-gray-500 mb-6">以下为曲周童车出口企业普遍持有或可协助申请的产品质量认证：</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {certs.map((c) => (
              <div key={c.name} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-blue-700">{c.name}</span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{c.region}</span>
                </div>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certification assistance */}
        <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">认证申请协助</h2>
          <p className="text-sm text-gray-600 mb-4">
            我们与国内多家检测机构（SGS、BV、中国质量认证中心）合作，可为入驻企业提供认证前期咨询、
            测试样品准备及认证全程跟进服务，大幅降低出口壁垒。
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
            咨询认证服务 <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <div className="flex gap-3">
          <Link href="/cluster/about" className="inline-flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
            走进曲周
          </Link>
          <Link href="/cluster/location" className="inline-flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
            产地区位
          </Link>
        </div>
      </div>
    </div>
  );
}
