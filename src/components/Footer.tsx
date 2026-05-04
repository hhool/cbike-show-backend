import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import type { Locale, Dict } from "@/lib/i18n";

type Props = { locale: Locale; d: Dict };

export default function Footer({ locale, d }: Props) {
  const isEn = locale === "en";

  const navGroups = [
    {
      title: isEn ? "Shop by Category" : "按品类购物",
      links: [
        { label: isEn ? "Kids Bikes" : "儿童自行车", href: `/${locale}/products?category=bike` },
        { label: isEn ? "Balance Bikes" : "平衡车", href: `/${locale}/products?category=balance` },
        { label: isEn ? "Tricycles" : "三轮童车", href: `/${locale}/products?category=tricycle` },
        { label: isEn ? "Scooters" : "滑板车", href: `/${locale}/products?category=scooter` },
        { label: isEn ? "Strollers" : "婴儿推车", href: `/${locale}/products?category=stroller` },
        { label: isEn ? "High Chairs" : "高脚餐椅", href: `/${locale}/products?category=highchair` },
      ],
    },
    {
      title: isEn ? "Shop by Age" : "按年龄选购",
      links: [
        { label: isEn ? "Infant (0–1 yr)" : "婴儿 0–1岁", href: `/${locale}/products?age=infant` },
        { label: isEn ? "Toddler (1–3 yr)" : "幼儿 1–3岁", href: `/${locale}/products?age=toddler` },
        { label: isEn ? "Kids (3–12 yr)" : "儿童 3–12岁", href: `/${locale}/products?age=kids` },
        { label: isEn ? "All Products" : "全部产品", href: `/${locale}/products` },
      ],
    },
    {
      title: isEn ? "Industry Cluster" : "产业集群",
      links: [
        { label: d.nav.clusterAbout, href: `/${locale}/cluster/about` },
        { label: d.nav.clusterLocation, href: `/${locale}/cluster/location` },
        { label: d.nav.clusterHonors, href: `/${locale}/cluster/honors` },
        { label: isEn ? "Manufacturers" : "合作厂家", href: `/${locale}/companies` },
      ],
    },
    {
      title: isEn ? "Contact Us" : "联系我们",
      links: [
        { label: d.nav.contact, href: `/${locale}/contact` },
      ],
    },
  ];

  const socials = isEn
    ? ["Amazon", "TikTok", "Instagram"]
    : ["亚马逊", "抖音", "小红书"];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">曲</div>
              <div>
                <div className="font-bold text-white text-sm">{d.siteTitle}</div>
                <div className="text-gray-400 text-xs">{d.siteSubtitle}</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{d.footer.tagline}</p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <span
                  key={s}
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  {s[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Nav Groups */}
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-white font-semibold text-sm mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{isEn ? "Quzhou Industrial Park, Handan, Hebei, China" : "河北省邯郸市曲周县工业园区"}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />0310-5550000</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />info@qzcbike.com</span>
          </div>
          <div className="text-sm text-gray-600 md:text-right">
            {d.footer.copyright} · {d.footer.icp}
          </div>
        </div>
      </div>
    </footer>
  );
}
