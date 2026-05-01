import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { articles } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const dn = d.news;
  const isEn = locale === "en";

  const tabs = [
    { key: "", label: dn.all },
    { key: "industry", label: dn.industry },
    { key: "guide", label: dn.guide },
    { key: "interview", label: dn.interview },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{dn.pageTitle}</h1>
          <p className="text-gray-500 mt-1">{dn.pageDesc}</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 border-b">
            {tabs.map((t) => (
              <button key={t.key} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-700 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link key={a.id} href={`/${locale}/news/${a.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
              <div className="aspect-[16/9] overflow-hidden">
                <Image src={a.featuredImg} alt={a.titleEn} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a.categoryLabel}</span>
                  {a.tags.slice(0, 2).map((t) => (<span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>))}
                </div>
                <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2">{isEn ? a.titleEn : a.title}</h2>
                <p className="text-xs text-gray-500 line-clamp-3 mb-3">{isEn ? a.excerptEn : a.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{a.publishDate} · {a.author}</span>
                  <span className="text-blue-600 font-medium flex items-center gap-1">{dn.readMore} <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
