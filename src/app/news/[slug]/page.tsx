import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { articles } from "@/lib/data";

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return { title: article ? `${article.title.zh} | 曲周童车产业带` : "资讯详情" };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/news" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回资讯列表
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-[2/1] overflow-hidden">
            <Image src={article.featuredImg} alt={article.title.zh} width={900} height={450} className="w-full h-full object-cover" unoptimized />
          </div>
          <div className="p-6 md:p-10">
            <div className="flex gap-2 mb-3">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{article.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{article.title.zh}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{article.author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{article.publishDate}</span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {article.tags.join(" · ")}
              </span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              {article.content.split("\n\n").map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">相关资讯</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((a) => (
                <Link key={a.id} href={`/news/${a.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
                  <div className="aspect-[16/9] overflow-hidden">
                    <Image src={a.featuredImg} alt={a.title.zh} width={300} height={169} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-blue-600 mb-1">{a.category}</div>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{a.title.zh}</h3>
                    <div className="text-xs text-gray-400 mt-1">{a.publishDate}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
