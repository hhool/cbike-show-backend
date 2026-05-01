import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export const metadata = { title: "走进曲周 | 曲周童车产业带" };

export default function ClusterAboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-sm text-blue-300 mb-2">产业集群 / 走进曲周</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">走进曲周</h1>
          <p className="text-blue-200 max-w-xl">中国最重要的童车产业基地，年产童车超过 3,000 万辆</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">产业概述</h2>
          <p className="text-gray-600 text-sm leading-loose">
            曲周县位于河北省邯郸市东部，是享誉国内外的"中国童车之都"。自20世纪80年代起步，
            经过四十年的发展积淀，曲周已形成集设计研发、零配件生产、整车制造、仓储物流、国际贸易于一体的完整产业链。
            现有童车相关企业超过 1,680 家，从业人员逾 10 万人，年产值突破 120 亿元人民币，
            产品销往全球 63 个国家和地区。
          </p>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">发展历程</h2>
          <div className="relative border-l-2 border-blue-200 ml-4 space-y-6">
            {[
              { year: "1980s", title: "产业萌芽", desc: "少数家庭作坊开始生产简易儿童三轮车，就地取材，以内销为主。" },
              { year: "1990s", title: "规模扩张", desc: "工厂数量快速增加，出现专业配件分工，逐步形成集群雏形。" },
              { year: "2000s", title: "品牌升级", desc: "龙头企业涌现，开始申请国际认证，出口份额大幅提升。" },
              { year: "2010s", title: "集群成熟", desc: "获授\"中国童车之都\"称号，政府加大基础设施投入，建立专业市场。" },
              { year: "2020s", title: "创新转型", desc: "智能制造与品牌出海齐头并进，电动童车、智能平衡车成为新增长极。" },
            ].map((e) => (
              <div key={e.year} className="ml-6 relative">
                <div className="absolute -left-[34px] w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs font-bold text-blue-600 mb-1">{e.year}</div>
                  <div className="font-semibold text-gray-800 mb-1">{e.title}</div>
                  <p className="text-xs text-gray-500">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key data */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">核心数据</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: "1,680+", l: "家企业" },
              { v: "10万+", l: "从业人员" },
              { v: "120亿", l: "年产值（元）" },
              { v: "63", l: "出口国家和地区" },
            ].map((d) => (
              <div key={d.l} className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">{d.v}</div>
                <div className="text-xs text-gray-500 mt-1">{d.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Government support */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">政策扶持</h2>
          <ul className="space-y-2">
            {[
              '县政府设立「童车产业发展专项资金」，每年拨款 2,000 万元',
              "建立专业童车产业园区，提供优惠厂房租赁和税收减免",
              "资助企业参加广州、义乌等国内外专业展会",
              "对获得国际认证（CE/EN71/ASTM）的企业给予一次性补贴",
              '推进「曲周童车」地理标志品牌认证申请',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex gap-3">
          <Link href="/cluster/location" className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
            了解产地区位 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/cluster/honors" className="inline-flex items-center gap-2 border border-blue-700 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors">
            查看荣誉资质
          </Link>
        </div>
      </div>
    </div>
  );
}
