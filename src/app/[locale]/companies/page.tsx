import { companies } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { CompaniesFilter } from "@/components/CompaniesFilter";

type Props = { params: Promise<{ locale: Locale }> };

export default async function CompaniesPage({ params }: Props) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const c = d.companies;
  const isEn = locale === "en";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{c.pageTitle}</h1>
          <p className="text-gray-500 mt-1">{c.pageDesc.replace("{n}", String(companies.length))}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CompaniesFilter
          companies={companies}
          locale={locale}
          dict={{
            allTypes: c.allTypes,
            allScales: c.allScales,
            filterType: c.filterType,
            filterScale: c.filterScale,
            filterOther: c.filterOther,
            exportOnly: c.exportOnly,
            applyBtn: c.applyBtn,
            total: c.total,
            viewDetail: c.viewDetail,
            scales: c.scales,
          }}
          isEn={isEn}
        />
      </div>
    </div>
  );
}
