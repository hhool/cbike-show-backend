import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { articles } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return articles.flatMap((a) => [
    { locale: "zh", slug: a.slug },
    { locale: "en", slug: a.slug },
  ]);
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const d = getDictionary(locale);
  const dn = d.news;
  const isEn = locale === "en";

  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/${locale}/news`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {dn.backToList}
        </Link>
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-[16/6] overflow-hidden">
            <Image src={article.featuredImg} alt={article.titleEn} width={900} height={338} className="w-full h-full object-cover" unoptimized />
          </div>
          <div className="p-6 md:p-10">
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{article.categoryLabel}</span>
              {article.tags.map((t) => (<span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>))}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{isEn ? article.titleEn : article.title}</h1>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-8 pb-6 border-b">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.publishDate}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{article.author}</span>
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{article.categoryLabel}</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              <p className="text-base">{isEn ? article.excerptEn : article.excerpt}</p>
            </div>
          </div>
        </article>
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{dn.relatedArticles}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((a) => (
                <Link key={a.id} href={`/${locale}/news/${a.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
                  <div className="aspect-[16/9] overflow-hidden">
                    <Image src={a.featuredImg} alt={a.titleEn} width={300} height={169} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700">{isEn ? a.titleEn : a.title}</h3>
                    <div className="text-xs text-gray-400 mt-2">{a.publishDate}</div>
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
