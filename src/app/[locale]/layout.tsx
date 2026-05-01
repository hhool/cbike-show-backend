import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const d = getDictionary(locale);
  const isEn = locale === "en";
  return {
    title: {
      default: isEn
        ? "Quzhou Kids Bike Belt — China's Kids Bike Capital"
        : "曲周童车产业带 — 中国童车之都",
      template: isEn ? `%s | ${d.siteTitle}` : `%s | 曲周童车产业带`,
    },
    description: isEn
      ? "1,680+ quality manufacturers, RMB 12 billion annual output, exporting to 63 countries. Browse companies, products and supply chain services."
      : "曲周童车产业带汇聚1,680余家童车企业，年产值120亿元，产品远销全球63个国家。查询企业、浏览产品、了解供应链服务。",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const d = getDictionary(locale);

  return (
    <>
      <Header locale={locale} d={d} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} d={d} />
    </>
  );
}
