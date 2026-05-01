import Link from "next/link";
import { Factory, Truck, Package, ArrowRight, CheckCircle } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export default async function SupplyChainPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const ds = d.supplyChain;
  const isEn = locale === "en";

  const oemFeatures = isEn
    ? ["MOQ from 1,000 pcs", "30–45 day lead time", "CE / EN71 / ASTM cert support", "Free sample development", "Custom brand packaging", "Factory audit support"]
    : ["支持 1,000 件起订", "30–45 天交货期", "CE / EN71 / ASTM 认证辅助", "免费提供打样", "品牌Logo定制包装", "深度工厂审核支持"];

  const logisticsFeatures = isEn
    ? ["Direct routes to Tianjin / Qingdao port", "Sea freight FCL / LCL", "Air express (3–5 days)", "Local bonded warehouse", "Customs clearance agency", "Destination port clearance"]
    : ["天津/青岛港直达", "海运 FCL / LCL", "空运快线（3–5 天）", "本地保税仓", "报关清关代理", "目的地港清关服务"];

  const partsFeatures = isEn
    ? ["1,200+ certified parts suppliers", "Single-part to full-set sourcing", "Quality testing support", "1-day local delivery", "Custom fabrication"]
    : ["1,200+ 家认证配件供应商", "单件到整套一站采购", "质量检测支持", "本地1日达", "定制加工"];

  const oemSteps = isEn
    ? ["Sample Development", "Mold Development", "Mass Production", "Quality Inspection"]
    : ["设计打样", "模具开发", "大货生产", "品质检验"];

  const destinations = isEn
    ? ["USA", "Europe", "Middle East", "Southeast Asia", "South America", "Africa"]
    : ["美国", "欧洲", "中东", "东南亚", "南美", "非洲"];

  const partCategories = isEn
    ? ["Frames", "Wheels & Tires", "Handlebars", "Seats", "Brakes", "Pedals"]
    : ["车架", "轮胎/轮毂", "车把", "座垫", "刹车组件", "脚踏"];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{ds.pageTitle}</h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">{ds.pageDesc}</p>
        </div>
      </div>

      <section id="oem" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Factory className="w-6 h-6 text-blue-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{isEn ? "OEM / ODM Manufacturing" : "OEM / ODM 定制加工"}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {isEn
                ? "Quzhou has a complete kids bike design, tooling, and production chain. We support full-process customization from product design, sampling, certification, to mass production — for both own-brand building and ODM."
                : "曲周拥有完整的童车设计、模具、生产链条，支持从产品设计、打样、认证到大货生产的全流程定制。无论是自有品牌建设，还是ODM代工，都可以快速响应。"}
            </p>
            <ul className="space-y-2">
              {oemFeatures.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 mt-6 bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
              {isEn ? "Inquire OEM Partnership" : "咨询OEM合作"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {oemSteps.map((s) => (
              <div key={s} className="aspect-square rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm border border-blue-200">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      <section id="logistics" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="flex-1">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-green-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{isEn ? "Logistics & Warehousing" : "物流仓储服务"}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {isEn
                ? "Direct highway routes from Quzhou to Tianjin and Qingdao ports. Full container (FCL) and less-than-container (LCL) sea freight, plus air express. Local bonded warehouse supports temporary storage and distribution."
                : "依托曲周至天津港、青岛港的直达公路干线，提供整柜（FCL）和拼箱（LCL）海运，以及空运快线服务。本地保税仓支持临时存储与分拨。"}
            </p>
            <ul className="space-y-2">
              {logisticsFeatures.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 mt-6 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-500 transition-colors">
              {isEn ? "Inquire Logistics" : "咨询物流方案"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h3 className="font-semibold text-gray-800 mb-4">{isEn ? "Main Export Destinations" : "主要出口目的地"}</h3>
              <div className="flex flex-wrap gap-2">
                {destinations.map((dest) => (
                  <span key={dest} className="bg-white text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm">
                    {dest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      <section id="parts" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-orange-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{isEn ? "Parts Sourcing" : "零配件采购"}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {isEn
                ? "The cluster hosts 1,200+ certified parts and component suppliers covering frames, wheels, handlebars, seats, brakes, and more — enabling one-stop procurement."
                : "产业带内汇聚 1,200+ 家认证零配件供应商，覆盖车架、轮胎、车把、座垫、刹车等各类部件，满足整车厂及零售商的一站式采购需求。"}
            </p>
            <ul className="space-y-2">
              {partsFeatures.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 mt-6 bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-400 transition-colors">
              {isEn ? "Inquire Parts Sourcing" : "咨询配件采购"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-3">
              {partCategories.map((cat) => (
                <div key={cat} className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                  <div className="text-sm font-semibold text-orange-700">{cat}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-900 text-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">{isEn ? "Ready to Source from Quzhou?" : "准备开始采购？"}</h2>
          <p className="text-blue-200 mb-6">{isEn ? "Contact us for a customized supply chain proposal." : "联系我们，获取专属供应链解决方案。"}</p>
          <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition-colors">
            {isEn ? "Contact Us" : "立即联系"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
