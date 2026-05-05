"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ExternalLink, Search, X } from "lucide-react";
import type { Product, Company } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { l } from "@/lib/utils";

interface ProductsDict {
  allCategories: string;
  categories: Record<string, string>;
}

interface Props {
  products: Product[];
  companies: Company[];
  locale: Locale;
  dp: ProductsDict;
  isEn: boolean;
}

export function ProductsFilter({ products, companies, locale, dp, isEn }: Props) {
  const [category, setCategory] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (ageGroup) {
        const ageStr = l(p.ageRange, locale).toLowerCase();
        if (ageGroup === "infant" && !ageStr.includes("0") && !ageStr.includes("infant") && !ageStr.includes("婴")) return false;
        if (ageGroup === "toddler" && !ageStr.includes("1") && !ageStr.includes("toddler") && !ageStr.includes("幼")) return false;
        if (ageGroup === "kids" && !ageStr.includes("3") && !ageStr.includes("kid") && !ageStr.includes("儿童")) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          l(p.name, locale).toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (dp.categories[p.category] || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, category, ageGroup, search, locale, dp.categories]);

  const categoryList = [
    { key: "", label: dp.allCategories },
    { key: "bike", label: isEn ? "Kids Bikes" : "儿童自行车" },
    { key: "balance", label: isEn ? "Balance Bikes" : "平衡车" },
    { key: "tricycle", label: isEn ? "Tricycles" : "三轮童车" },
    { key: "ride-on", label: isEn ? "Ride-On / Wiggle Cars" : "扭扭车/溜溜车" },
    { key: "scooter", label: isEn ? "Kids Scooters" : "儿童滑板车" },
    { key: "toddler-scooter", label: isEn ? "Toddler Scooters" : "幼儿滑板车" },
    { key: "stroller", label: isEn ? "Strollers" : "婴儿推车" },
    { key: "highchair", label: isEn ? "High Chairs" : "高脚餐椅" },
    { key: "electric", label: isEn ? "Electric Ride-Ons" : "电动童车" },
  ];

  const ageGroups = [
    { key: "", label: isEn ? "All Ages" : "全部年龄" },
    { key: "infant", label: isEn ? "Infant (0–1 yr)" : "婴儿 0–1岁" },
    { key: "toddler", label: isEn ? "Toddler (1–3 yr)" : "幼儿 1–3岁" },
    { key: "kids", label: isEn ? "Kids (3–12 yr)" : "儿童 3–12岁" },
  ];

  const hasFilters = !!(category || ageGroup || search.trim());

  function clearFilters() {
    setCategory("");
    setAgeGroup("");
    setSearch("");
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-52 shrink-0 space-y-4">
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
              placeholder={isEn ? "Product name…" : "产品名称…"}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {isEn ? "Category" : "产品分类"}
          </div>
          <div className="space-y-0.5">
            {categoryList.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  category === c.key
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age group */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {isEn ? "Age Group" : "适用年龄"}
          </div>
          <div className="space-y-0.5">
            {ageGroups.map((a) => (
              <button
                key={a.key}
                onClick={() => setAgeGroup(a.key)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  ageGroup === a.key
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {isEn ? (
              <>{filtered.length} products</>
            ) : (
              <>
                共 <span className="font-semibold text-gray-800">{filtered.length}</span> 件产品
              </>
            )}
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
            {isEn ? "No products match your filters." : "没有符合筛选条件的产品"}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => {
              const company = companies.find((c) => c.id === p.companyId);
              return (
                <div
                  key={p.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow"
                >
                  <Link
                    href={`/${locale}/products/${p.slug}`}
                    className="absolute inset-0 z-0"
                    aria-label={l(p.name, locale)}
                  />
                  <div className="aspect-4/3 overflow-hidden bg-gray-50">
                    <Image
                      src={p.images[0]}
                      alt={l(p.name, locale)}
                      width={300}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <div className="text-xs text-blue-600 font-medium">
                        {dp.categories[p.category] ?? p.category}
                      </div>
                      {p.ageRange && (
                        <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">
                          {l(p.ageRange, locale)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {l(p.name, locale)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {company ? l(company.name, locale) : ""}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-blue-700">
                        {p.retailPrice ?? p.priceRange}
                      </span>
                      {p.buyLinks && p.buyLinks.length > 0 ? (
                        <a
                          href={p.buyLinks[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 inline-flex items-center gap-1 text-xs bg-orange-500 hover:bg-orange-400 text-white font-semibold px-2.5 py-1 rounded-full transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          {isEn ? "Buy" : "购买"}
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {isEn ? "View" : "查看"}
                        </span>
                      )}
                    </div>
                    {p.certifications.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {p.certifications.slice(0, 2).map((cert) => (
                          <span
                            key={cert}
                            className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
