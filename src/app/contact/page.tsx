"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    productType: "",
    quantity: "",
    message: "",
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">询盘已提交！</h2>
          <p className="text-gray-500 text-sm mb-6">我们已收到您的询盘，将在 24 小时内联系您。如有紧急需求，请直接拨打电话或发送 WhatsApp 消息。</p>
          <button
            onClick={() => setSubmitted(false)}
            className="inline-block bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            再次提交
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">联系我们 / 在线询盘</h1>
          <p className="text-gray-500 mt-1">填写您的采购需求，24小时内专人回复</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-6">填写询盘信息</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">您的姓名 *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your Name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">公司名称</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Company Name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱 *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">电话 / WhatsApp</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">所在国家 / 地区</label>
                  <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="USA / Germany / …"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">产品类型</label>
                  <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">请选择</option>
                    <option value="bike">儿童自行车</option>
                    <option value="balance">平衡车</option>
                    <option value="scooter">滑板车</option>
                    <option value="toy">玩具车</option>
                    <option value="stroller">婴儿车/推车</option>
                    <option value="electric">电动车</option>
                    <option value="parts">零配件</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">预计采购量</label>
                  <input type="text" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="如：500件/月"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">详细需求 *</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="请描述您的具体需求，包括产品规格、认证要求、交货期、目标价位等..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
              <button type="submit"
                className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm">
                提交询盘
              </button>
              <p className="text-xs text-gray-400 text-center">提交即表示您同意我们使用您的信息与您联系，我们不会将信息分享给第三方。</p>
            </form>
          </div>
        </div>

        {/* Contact info + map */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">联系方式</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                <div className="text-sm text-gray-600">河北省邯郸市曲周县童车产业园区综合服务中心</div>
              </div>
              <a href="tel:0310-5550000" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-700">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                0310-5550000（工作日 9:00-18:00）
              </a>
              <a href="mailto:info@cbike-quzhou.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-700">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                info@cbike-quzhou.com
              </a>
              <a href="https://wa.me/8613000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-green-600">
                <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                WhatsApp：+86 130 0000 0000
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">产业园位置</h2>
            <div className="rounded-xl overflow-hidden aspect-[4/3]">
              <iframe
                src="https://maps.google.com/maps?q=曲周县,邯郸,河北&z=13&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="曲周童车产业园位置"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-xs text-blue-700 font-semibold mb-1">承诺快速回复</p>
            <p className="text-xs text-gray-600">工作日内 4 小时内专人回复，周末 24 小时内回复。对于紧急采购需求，欢迎直接通过 WhatsApp 联系。</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
