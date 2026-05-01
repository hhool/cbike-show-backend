import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import type { Locale, Dict } from "@/lib/i18n";

type Props = { locale: Locale; d: Dict };

export default function Footer({ locale, d }: Props) {
  const navGroups = [
    {
      title: locale === "en" ? "Industry Cluster" : "产业集群",
      links: [
        { label: d.nav.clusterAbout, href: `/${locale}/cluster/about` },
        { label: d.nav.clusterLocation, href: `/${locale}/cluster/location` },
        { label: d.nav.clusterHonors, href: `/${locale}/cluster/honors` },
      ],
    },
    {
      title: locale === "en" ? "Companies & Products" : "企业与产品",
      links: [
        { label: d.nav.companies, href: `/${locale}/companies` },
        { label: d.nav.products, href: `/${locale}/products` },
        { label: locale === "en" ? "Apply to Join" : "企业入驻申请", href: `/${locale}/companies/apply` },
      ],
    },
    {
      title: locale === "en" ? "Supply Chain & News" : "供应链与资讯",
      links: [
        { label: d.nav.supplyChain, href: `/${locale}/supply-chain` },
        { label: d.nav.news, href: `/${locale}/news` },
        { label: d.nav.contact, href: `/${locale}/contact` },
      ],
    },
  ];

  const socials = locale === "en" ? ["WeChat", "TikTok", "LinkedIn"] : ["微信", "抖音", "领英"];

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
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{locale === "en" ? "Quzhou Industrial Park, Handan, Hebei, China" : "河北省邯郸市曲周县工业园区"}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />0310-5550000</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />info@qzcbike.com</span>
            <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />WhatsApp: +86138xxxx</span>
          </div>
          <div className="text-sm text-gray-600 md:text-right">
            {d.footer.copyright} · {d.footer.icp}
          </div>
        </div>
      </div>
    </footer>
  );
}
