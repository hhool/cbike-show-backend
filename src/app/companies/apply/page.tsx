"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function CompanyApplyPage() {
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">申请已提交</h2>
          <p className="text-gray-500 text-sm mb-6">我们将在 1-3 个工作日内与您联系，审核通过后企业信息将展示在平台上。</p>
          <Link href="/companies" className="inline-block bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
            返回企业库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/companies" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回企业库
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">企业入驻申请</h1>
          <p className="text-gray-500 text-sm mb-8">提交基本信息，审核通过后免费展示在曲周童车产业带平台。</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">企业名称 *</label>
                <input required type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="曲周××童车有限公司"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联系人 *</label>
                <input required type="text" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="姓名"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话 *</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0310-XXXXXXX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱 *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@company.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">企业网站</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://www.example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">企业类型 *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">请选择</option>
                  <option value="brand">龙头/品牌企业</option>
                  <option value="export">出口贸易</option>
                  <option value="parts">零配件生产</option>
                  <option value="general">综合型</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">企业规模 *</label>
                <select required value={form.scale} onChange={(e) => setForm({ ...form, scale: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">请选择</option>
                  <option value="small">小型（100人以下）</option>
                  <option value="medium">中型（100-500人）</option>
                  <option value="large">大型（500人以上）</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="exportFlag" checked={form.exportFlag} onChange={(e) => setForm({ ...form, exportFlag: e.target.checked })}
                  className="accent-blue-600 w-4 h-4" />
                <label htmlFor="exportFlag" className="text-sm text-gray-700">有出口业务</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">企业简介 *</label>
              <textarea required rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })}
                placeholder="请描述企业主营产品、发展历程、核心优势等（100字以内）"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
            <button type="submit"
              className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm">
              提交入驻申请
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
