import config from "@payload-config";
import { getPayload } from "payload";

export function pickLocale(lang?: string): "en" | "zh" {
  return lang === "en" ? "en" : "zh";
}

export async function getSitePageBySlug(slug: string, locale: "en" | "zh") {
  const payload = await getPayload({ config });
  try {
    const pageResult = await payload.find({
      collection: "site-pages",
      where: { slug: { equals: slug } },
      limit: 1,
      pagination: false,
      locale,
      depth: 0,
      fallbackLocale: false,
    });

    return { payload, page: pageResult.docs[0] };
  } catch (error) {
    console.error(`[cms] failed to query site-page slug=${slug}`, error);
    return { payload, page: null };
  }
}

export async function getLocaleEntryMap(
  keys: string[],
  locale: "en" | "zh",
): Promise<Record<string, string>> {
  if (keys.length === 0) return {};

  const payload = await getPayload({ config });
  let result: { docs: Array<{ key?: string; value?: string }> } = { docs: [] };
  try {
    const queried = await payload.find({
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
      fallbackLocale: false,
    });
    result = { docs: queried.docs as Array<{ key?: string; value?: string }> };
  } catch (error) {
    console.error("[cms] failed to query locale-entries map", error);
  }

  const map: Record<string, string> = {};
  for (const doc of result.docs) {
    if (doc.key && typeof doc.value === "string") {
      map[doc.key] = doc.value;
    }
  }

  return map;
}
