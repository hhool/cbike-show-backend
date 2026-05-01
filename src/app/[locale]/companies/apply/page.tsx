"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default function CompanyApplyPage() {
  const pathname = usePathname();
  const locale = (pathname.split("/")[1] as Locale) || "zh";
  const d = getDictionary(locale);
  const dc = d.companies;
  const isEn = locale === "en";

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    website: "",
    category: "",
    scale: "",
    exportFlag: false,
    intro: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{dc.applyTitle}</h2>
          <p className="text-gray-500 text-sm mb-6">{dc.applySuccess}</p>
          <Link href={`/${locale}/companies`} className="inline-block bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
            {isEn ? "Back to Companies" : "返回企业库"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href={`/${locale}/companies`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {isEn ? "Back to Companies" : "返回企业库"}
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{dc.applyTitle}</h1>
          <p className="text-gray-500 text-sm mb-8">{dc.applyDesc}</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Company Name *" : "企业名称 *"}</label>
                <input required type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder={isEn ? "Your company name" : "曲周××童车有限公司"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Contact Person *" : "联系人 *"}</label>
                <input required type="text" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder={isEn ? "Full name" : "姓名"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Phone *" : "联系电话 *"}</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0310-XXXXXXX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Email *" : "邮箱 *"}</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@company.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Website" : "企业网站"}</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://www.example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Company Type *" : "企业类型 *"}</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">{isEn ? "Select..." : "请选择"}</option>
                  <option value="brand">{isEn ? "Leading Brand" : "龙头/品牌企业"}</option>
                  <option value="export">{isEn ? "Export Trade" : "出口贸易"}</option>
                  <option value="parts">{isEn ? "Parts Manufacturer" : "零配件生产"}</option>
                  <option value="general">{isEn ? "General" : "综合型"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Company Scale *" : "企业规模 *"}</label>
                <select required value={form.scale} onChange={(e) => setForm({ ...form, scale: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">{isEn ? "Select..." : "请选择"}</option>
                  <option value="small">{dc.scales.small}</option>
                  <option value="medium">{dc.scales.medium}</option>
                  <option value="large">{dc.scales.large}</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="exportFlag" checked={form.exportFlag} onChange={(e) => setForm({ ...form, exportFlag: e.target.checked })}
                  className="accent-blue-600 w-4 h-4" />
                <label htmlFor="exportFlag" className="text-sm text-gray-700">{isEn ? "Has export business" : "有出口业务"}</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Company Introduction *" : "企业简介 *"}</label>
              <textarea required rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })}
                placeholder={isEn ? "Describe your main products, history, and core strengths" : "请描述企业主营产品、发展历程、核心优势等（100字以内）"}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
            <button type="submit" className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm">
              {dc.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
