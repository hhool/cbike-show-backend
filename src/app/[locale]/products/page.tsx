import { products, companies } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { ProductsFilter } from "@/components/ProductsFilter";

type Props = { params: Promise<{ locale: Locale }> };

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const dp = d.products;
  const isEn = locale === "en";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{dp.pageTitle}</h1>
          <p className="text-gray-500 mt-1">{dp.pageDesc}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ProductsFilter
          products={products}
          companies={companies}
          locale={locale}
          dp={{ allCategories: dp.allCategories, categories: dp.categories }}
          isEn={isEn}
        />
      </div>
    </div>
  );
}
