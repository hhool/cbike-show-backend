import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, Mail, Globe } from "lucide-react";
import { companies } from "@/lib/data";

export const metadata = { title: "企业库 | 曲周童车产业带" };

const categories = [
  { key: "", label: "全部类型" },
  { key: "brand", label: "龙头企业" },
  { key: "export", label: "出口贸易" },
  { key: "parts", label: "零配件" },
  { key: "general", label: "综合型" },
];

const scales = [
  { key: "", label: "全部规模" },
  { key: "large", label: "大型（500人以上）" },
  { key: "medium", label: "中型（100-500人）" },
  { key: "small", label: "小型（100人以下）" },
];

export default function CompaniesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">企业库</h1>
          <p className="text-gray-500 mt-1">曲周童车产业带 {companies.length}+ 家优质企业</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-56 shrink-0 space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">企业类型</div>
            <div className="space-y-1">
              {categories.map((c) => (
                <div key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-700 transition-colors">
                  {c.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">企业规模</div>
            <div className="space-y-1">
              {scales.map((s) => (
                <div key={s.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-700 transition-colors">
                  {s.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">其他筛选</div>
            <label className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" className="accent-blue-600" />
              仅看出口企业
            </label>
          </div>
          <Link
            href="/companies/apply"
            className="block w-full bg-blue-700 text-white text-center text-sm font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors"
          >
            + 企业入驻申请
          </Link>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">共 <span className="font-semibold text-gray-800">{companies.length}</span> 家企业</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {companies.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                      <Image src={c.logo} alt={c.name.zh} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/companies/${c.slug}`} className="font-semibold text-gray-900 text-sm hover:text-blue-700 line-clamp-1">{c.name.zh}</Link>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{c.category}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{c.scale}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-3">{c.intro.zh}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><MapPin className="w-3 h-3" />{c.region}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><Phone className="w-3 h-3" />{c.phone}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><Mail className="w-3 h-3" />{c.email}</div>
                  </div>
                </div>
                <div className="border-t px-5 py-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.exportFlag ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {c.exportFlag ? "✓ 出口" : "内销"}
                  </span>
                  <Link href={`/companies/${c.slug}`} className="text-blue-700 text-xs font-medium flex items-center gap-1 hover:underline">
                    查看详情 <ArrowRight className="w-3 h-3" />
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
