"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, Dict } from "@/lib/i18n";

type Props = { locale: Locale; d: Dict };

export default function Header({ locale, d }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    {
      label: d.nav.cluster,
      href: `/${locale}/cluster`,
      children: [
        { label: d.nav.clusterAbout, href: `/${locale}/cluster/about` },
        { label: d.nav.clusterLocation, href: `/${locale}/cluster/location` },
        { label: d.nav.clusterHonors, href: `/${locale}/cluster/honors` },
      ],
    },
    { label: d.nav.companies, href: `/${locale}/companies` },
    { label: d.nav.products, href: `/${locale}/products` },
    { label: d.nav.supplyChain, href: `/${locale}/supply-chain` },
    { label: d.nav.news, href: `/${locale}/news` },
    { label: d.nav.contact, href: `/${locale}/contact` },
  ];

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

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-0.5 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onMouseEnter={() => item.children && setOpenDropdown(item.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3 opacity-60" />}
                </Link>
                {item.children && (
                  <div
                    className={cn(
                      "absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 transition-all",
                      openDropdown === item.href ? "opacity-100 visible" : "opacity-0 invisible"
                    )}
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className={cn("hidden sm:flex items-center", searchOpen ? "w-48" : "w-8")}>
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
              href={`/${locale}/contact`}
              className="hidden sm:block bg-blue-700 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-800 transition-colors"
            >
              {d.inquiryCta}
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
          {navItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="block py-2.5 text-sm text-gray-700 border-b border-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block py-2 pl-4 text-sm text-gray-500"
                  onClick={() => setMenuOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mt-3 flex gap-2">
            <Link
              href={`/${locale}/contact`}
              className="flex-1 text-center bg-blue-700 text-white text-sm px-4 py-2 rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              {d.inquiryCta}
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
