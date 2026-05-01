import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { articles } from "@/lib/data";

export const metadata = { title: "产业资讯 | 曲周童车产业带" };

const tabs = [
  { key: "", label: "全部" },
  { key: "news", label: "行业动态" },
  { key: "guide", label: "选购指南" },
  { key: "interview", label: "厂家访谈" },
];

export default function NewsPage() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">产业资讯</h1>
          <p className="text-gray-500 mt-1">行业动态、选购指南、厂家访谈一手资讯</p>
          <div className="flex gap-1 mt-4">
            {tabs.map((t) => (
              <button key={t.key} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${t.key === "" ? "bg-blue-700 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Featured article */}
        <Link href={`/news/${featured.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 aspect-[16/9] md:aspect-auto overflow-hidden">
              <Image src={featured.featuredImg} alt={featured.title} width={800} height={450} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
            </div>
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <div className="flex gap-2 mb-3">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{featured.categoryLabel}</span>
                <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">精选</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{featured.title}</h2>
              <p className="text-gray-500 text-sm line-clamp-3 mb-4">{featured.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{featured.publishDate} · {featured.author}</span>
                <span className="text-blue-700 font-medium flex items-center gap-1">阅读全文 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
              </div>
            </div>
          </div>
        </Link>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((a) => (
            <Link key={a.id} href={`/news/${a.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
              <div className="aspect-[16/9] overflow-hidden">
                <Image src={a.featuredImg} alt={a.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a.categoryLabel}</span>
                  {a.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{a.excerpt}</p>
                <div className="text-xs text-gray-400 mt-3">{a.publishDate} · {a.author}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
