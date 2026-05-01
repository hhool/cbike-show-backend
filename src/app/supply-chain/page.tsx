import Link from "next/link";
import { Factory, Truck, Package, ArrowRight, CheckCircle } from "lucide-react";

export const metadata = { title: "供应链服务 | 曲周童车产业带" };

export default function SupplyChainPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">供应链服务</h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">一站式童车采购、定制加工与物流配送解决方案</p>
        </div>
      </div>

      {/* OEM / ODM */}
      <section id="oem" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Factory className="w-6 h-6 text-blue-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">OEM / ODM 定制加工</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              曲周拥有完整的童车设计、模具、生产链条，支持从产品设计、打样、认证到大货生产的全流程定制。
              无论是自有品牌建设，还是ODM代工，都可以快速响应。
            </p>
            <ul className="space-y-2">
              {["支持 1,000 件起订", "30–45 天交货期", "CE / EN71 / ASTM 认证辅助", "免费提供打样", "品牌Logo定制包装", "深度工厂审核支持"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="inline-flex items-center gap-2 mt-6 bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
              咨询OEM合作 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {["设计打样", "模具开发", "大货生产", "品质检验"].map((s) => (
              <div key={s} className="aspect-square rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm border border-blue-200">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Logistics */}
      <section id="logistics" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="flex-1">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-green-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">物流仓储服务</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              依托曲周至天津港、青岛港的直达公路干线，提供整柜（FCL）和拼箱（LCL）海运，
              以及空运快线服务。本地保税仓支持临时存储与分拨。
            </p>
            <ul className="space-y-2">
              {["天津/青岛港直达", "海运 FCL / LCL", "空运快线（3–5 天）", "本地保税仓", "报关清关代理", "目的地港清关服务"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="inline-flex items-center gap-2 mt-6 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-500 transition-colors">
              咨询物流方案 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h3 className="font-semibold text-gray-800 mb-4">主要出口目的地</h3>
              <div className="flex flex-wrap gap-2">
                {["美国", "德国", "英国", "法国", "澳大利亚", "加拿大", "巴西", "东南亚", "中东", "俄罗斯"].map((country) => (
                  <span key={country} className="text-xs bg-white text-gray-600 border border-gray-200 px-3 py-1 rounded-full">{country}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Parts */}
      <section id="parts" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">零配件采购</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              曲周及周边聚集了大量专业零配件厂商，涵盖车架冲压件、橡胶轮胎、塑料件、座垫、把立等全系列零件，
              支持整车厂散件补货和零售商批量采购。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["车架/前叉", "轮胎/内胎", "鞍座/座垫", "把立/把横", "踏板/脚踏", "制动系统", "链条/飞轮", "灯具/配件", "包装材料"].map((part) => (
                <div key={part} className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 text-xs text-gray-700 font-medium text-center">
                  {part}
                </div>
              ))}
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 mt-6 bg-yellow-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-colors">
              查询配件供应商 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
            <h3 className="font-semibold text-gray-800 mb-3">采购优势</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />产业集群效应，同一产业带内完成全部零件采购</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />综合成本比国内其他地区低 15–25%</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />支持小批量混批，灵活应对旺季备货</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />多数配件厂可提供 ISO 9001 认证</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">准备好开始合作了吗？</h2>
          <p className="text-blue-300 mb-6">联系我们，获取定制化供应链解决方案和专属报价。</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition-colors">
            立即联系 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
