import config from "@payload-config";
import { getPayload } from "payload";

export function pickLocale(lang?: string): "en" | "zh" {
  return lang === "en" ? "en" : "zh";
}

export async function getSitePageBySlug(slug: string, locale: "en" | "zh") {
  const payload = await getPayload({ config });

  const pageResult = await payload.find({
    collection: "site-pages",
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    locale,
    depth: 0,
  });

  return { payload, page: pageResult.docs[0] };
}

export async function getLocaleEntryMap(
  keys: string[],
  locale: "en" | "zh",
): Promise<Record<string, string>> {
  if (keys.length === 0) return {};

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "locale-entries",
    pagination: false,
    limit: Math.max(keys.length, 20),
    locale,
    where: {
      key: {
        in: keys,
      },
    },
    depth: 0,
  });

  const map: Record<string, string> = {};
  for (const doc of result.docs as Array<{ key?: string; value?: string }>) {
    if (doc.key && typeof doc.value === "string") {
      map[doc.key] = doc.value;
    }
  }

  return map;
}
