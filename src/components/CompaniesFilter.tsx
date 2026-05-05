"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, Mail, Search, X } from "lucide-react";
import type { Company } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";

const catZhLabels: Record<string, string> = {
  brand: "龙头企业",
  export: "出口贸易",
  parts: "零配件",
  general: "综合型",
};
const catEnLabels: Record<string, string> = {
  brand: "Leading Brand",
  export: "Export Trade",
  parts: "Parts & Components",
  general: "General",
};

interface CompaniesDict {
  allTypes: string;
  allScales: string;
  filterType: string;
  filterScale: string;
  filterOther: string;
  exportOnly: string;
  applyBtn: string;
  total: string;
  viewDetail: string;
  scales: { large: string; medium: string; small: string };
}

interface Props {
  companies: Company[];
  locale: Locale;
  dict: CompaniesDict;
  isEn: boolean;
}

export function CompaniesFilter({ companies, locale, dict, isEn }: Props) {
  const [category, setCategory] = useState("");
  const [scale, setScale] = useState("");
  const [exportOnly, setExportOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (category && c.category !== category) return false;
      if (scale && c.scale !== scale) return false;
      if (exportOnly && !c.exportFlag) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          l(c.name, locale).toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [companies, category, scale, exportOnly, search, locale]);

  const categories = [
    { key: "", label: dict.allTypes },
    { key: "brand", label: isEn ? "Leading Brands" : "龙头企业" },
    { key: "export", label: isEn ? "Export Trade" : "出口贸易" },
    { key: "parts", label: isEn ? "Parts & Components" : "零配件" },
    { key: "general", label: isEn ? "General" : "综合型" },
  ];

  const scales = [
    { key: "", label: dict.allScales },
    { key: "large", label: dict.scales.large },
    { key: "medium", label: dict.scales.medium },
    { key: "small", label: dict.scales.small },
  ];

  const hasFilters = !!(category || scale || exportOnly || search.trim());

  function clearFilters() {
    setCategory("");
    setScale("");
    setExportOnly(false);
    setSearch("");
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-56 shrink-0 space-y-4">
        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {isEn ? "Search" : "搜索"}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? "Company name…" : "公司名称…"}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {dict.filterType}
          </div>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  category === cat.key
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {dict.filterScale}
          </div>
          <div className="space-y-0.5">
            {scales.map((s) => (
              <button
                key={s.key}
                onClick={() => setScale(s.key)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  scale === s.key
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export only */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {dict.filterOther}
          </div>
          <label className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={exportOnly}
              onChange={(e) => setExportOnly(e.target.checked)}
              className="accent-blue-600 w-4 h-4"
            />
            {dict.exportOnly}
          </label>
        </div>

        <Link
          href={`/${locale}/companies/apply`}
          className="block w-full bg-blue-700 text-white text-center text-sm font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors"
        >
          {dict.applyBtn}
        </Link>
      </aside>

      {/* Results */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {dict.total.replace("{n}", String(filtered.length))}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
              {isEn ? "Clear filters" : "清除筛选"}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-400 text-sm">
            {isEn ? "No companies match your filters." : "没有符合筛选条件的企业"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((co) => (
              <div
                key={co.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                      <Image
                        src={co.logo}
                        alt={l(co.name, locale)}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/${locale}/companies/${co.slug}`}
                        className="font-semibold text-gray-900 text-sm hover:text-blue-700 line-clamp-1"
                      >
                        {l(co.name, locale)}
                      </Link>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {isEn ? catEnLabels[co.category] : catZhLabels[co.category]}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {dict.scales[co.scale as keyof typeof dict.scales]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                    {l(co.intro, locale)}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {co.region}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Phone className="w-3 h-3" />
                      {co.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Mail className="w-3 h-3" />
                      {co.email}
                    </div>
                  </div>
                </div>
                <div className="border-t px-5 py-3 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      co.exportFlag
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {co.exportFlag
                      ? isEn ? "✓ Export" : "✓ 出口"
                      : isEn ? "Domestic" : "内销"}
                  </span>
                  <Link
                    href={`/${locale}/companies/${co.slug}`}
                    className="text-blue-700 text-xs font-medium flex items-center gap-1 hover:underline"
                  >
                    {dict.viewDetail} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
