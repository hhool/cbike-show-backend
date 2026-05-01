"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default function ContactPage() {
  const pathname = usePathname();
  const locale = (pathname.split("/")[1] as Locale) || "zh";
  const d = getDictionary(locale);
  const dc = d.contact;
  const isEn = locale === "en";

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", country: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 800);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{isEn ? "Inquiry Submitted!" : "询盘已提交！"}</h2>
          <p className="text-gray-500 text-sm mb-6">{dc.success}</p>
          <button onClick={() => setSubmitted(false)} className="inline-block bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors">
            {dc.submitAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{dc.pageTitle}</h1>
          <p className="text-blue-200 text-lg">{dc.pageDesc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{isEn ? "Contact Information" : "联系方式"}</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">0310-5500000</div>
                  <div className="text-xs text-gray-400">{isEn ? "Mon–Fri 9:00–18:00 CST" : "周一至周五 9:00–18:00"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">info@qzcbike.com</div>
                  <div className="text-xs text-gray-400">{isEn ? "Reply within 24 hours" : "24小时内回复"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">{isEn ? "Quzhou County, Handan, Hebei" : "河北省邯郸市曲周县"}</div>
                  <div className="text-xs text-gray-400">{isEn ? "Industry Service Center" : "产业服务中心"}</div>
                </div>
              </div>
              <a href="https://wa.me/8631055000000" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{isEn ? "Send an Inquiry" : "在线询盘"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Name *" : "姓名 *"}</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Company" : "公司名称"}</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Email *" : "邮箱 *"}</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Country" : "国家/地区"}</label>
                  <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{isEn ? "Message *" : "询盘内容 *"}</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={isEn ? "Describe your requirements, products of interest, or questions..." : "请描述您的采购需求、感兴趣的产品或问题…"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm disabled:opacity-60">
                {submitting ? dc.submitting : dc.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
