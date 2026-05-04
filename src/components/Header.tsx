"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, Globe } from "lucide-react";
import type { Locale, Dict } from "@/lib/i18n";

type Props = { locale: Locale; d: Dict };

export default function Header({ locale, d }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isEn = locale === "en";

  const otherLocale: Locale = locale === "zh" ? "en" : "zh";
  const switchHref = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const switchLabel = locale === "zh" ? "EN" : "中文";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">曲</div>
            <div className="leading-tight">
              <div className="font-bold text-blue-900 text-sm">{d.siteTitle}</div>
              <div className="text-gray-500 text-xs hidden sm:block">{d.siteSubtitle}</div>
            </div>
          </Link>



          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center ${searchOpen ? "w-48" : "w-8"}`}>
              {searchOpen ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim())
                      window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery)}`;
                  }}
                  className="flex items-center w-full border border-blue-300 rounded-full overflow-hidden"
                >
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={d.searchPlaceholder}
                    className="flex-1 text-sm px-3 py-1 outline-none"
                  />
                  <button type="submit" className="p-1.5 text-blue-600">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-500 hover:text-blue-700 rounded-full hover:bg-blue-50"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            <Link
              href={switchHref}
              className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              {switchLabel}
            </Link>

            <Link
              href={`/${locale}/products`}
              className="hidden sm:block bg-orange-500 text-white text-sm px-4 py-1.5 rounded-full hover:bg-orange-400 transition-colors font-semibold"
            >
              {d.shopCta}
            </Link>

            <button
              className="lg:hidden p-2 text-gray-500"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <div className="mt-3 flex gap-2">
            <Link
              href={`/${locale}/products`}
              className="flex-1 text-center bg-orange-500 text-white text-sm px-4 py-2 rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              {d.shopCta}
            </Link>
            <Link
              href={switchHref}
              className="flex items-center gap-1 border border-gray-200 text-xs text-gray-600 px-3 py-2 rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              <Globe className="w-3.5 h-3.5" />
              {switchLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
