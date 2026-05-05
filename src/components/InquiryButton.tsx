"use client";

import { useState } from "react";
import { X, MessageSquare, CheckCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface Props {
  targetName: string;
  locale: Locale;
  isEn: boolean;
  className?: string;
  label?: string;
}

export function InquiryButton({ targetName, locale: _locale, isEn, className, label }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: integrate with Resend / Formspree for real delivery
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  function openModal() {
    setSubmitted(false);
    setIsOpen(true);
  }

  const buttonLabel = label ?? (isEn ? "Send Inquiry" : "发送询盘");

  return (
    <>
      <button
        onClick={openModal}
        className={
          className ??
          "w-full bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        }
      >
        <MessageSquare className="w-4 h-4" />
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {isEn ? "Inquiry Sent!" : "询盘已发送！"}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {isEn
                    ? "We'll get back to you within 24 hours."
                    : "我们将在24小时内与您联系。"}
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-blue-700 hover:underline"
                >
                  {isEn ? "Close" : "关闭"}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                  {isEn ? "Send Inquiry" : "发送询盘"}
                </h2>
                <p className="text-xs text-gray-500 mb-5">
                  {isEn ? `About: ${targetName}` : `关于: ${targetName}`}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        {isEn ? "Your Name *" : "姓名 *"}
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={isEn ? "John Smith" : "张三"}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        {isEn ? "Company" : "公司"}
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder={isEn ? "Your company" : "公司名称"}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        {isEn ? "Phone / WhatsApp *" : "电话/WhatsApp *"}
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 555 0000"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        {isEn ? "Email *" : "邮箱 *"}
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      {isEn ? "Message *" : "需求描述 *"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={
                        isEn
                          ? "Tell us your requirements (quantity, size, budget…)"
                          : "请描述您的需求（数量、规格、预算等）…"
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-colors text-sm"
                  >
                    {submitting
                      ? isEn ? "Sending…" : "发送中…"
                      : isEn ? "Send Inquiry" : "发送询盘"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
