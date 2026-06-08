import type { NextApiRequest, NextApiResponse } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

const HEADER = 'x-seed-secret';

const containsCJK = (value: string) => /[\u3400-\u9FFF]/.test(value);

const parseMaybeJSON = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text.startsWith('{') || !text.endsWith('}')) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
};

const fallbackBySlug = (slug: string) => {
  if (slug === 'carseat') return { zh: '安全座椅', en: 'Car Seat' };
  if (slug === 'stroller-lightweight') return { zh: '轻便婴儿推车', en: 'Lightweight Stroller' };
  if (slug === 'kids-electric-toy-car') return { zh: '儿童电动玩具车', en: 'Kids Electric Ride-on Car' };
  return { zh: '婴儿推车', en: 'Stroller' };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.SEED_TRIGGER_SECRET;
  const incoming = req.headers[HEADER];
  if (!secret || incoming !== secret) return res.status(403).json({ error: 'Forbidden' });

  try {
    const payload = await getPayload({ config });

    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      overrideAccess: true,
    });

    const results: Array<Record<string, unknown>> = [];

    for (const doc of categories.docs as any[]) {
      const slug = String(doc.slug || 'stroller');
      const fallback = fallbackBySlug(slug);

      let zh = fallback.zh;
      let en = fallback.en;

      const parsed = parseMaybeJSON(doc.name);
      if (parsed) {
        const parsedZh = typeof parsed.zh === 'string' ? parsed.zh.trim() : '';
        const parsedEn = typeof parsed.en === 'string' ? parsed.en.trim() : '';
        if (parsedZh) zh = parsedZh;
        if (parsedEn) en = parsedEn;
      } else if (typeof doc.name === 'string' && doc.name.trim()) {
        const raw = doc.name.trim();
        if (containsCJK(raw)) {
          zh = raw;
        } else {
          en = raw;
        }
      }

      await payload.update({
        collection: 'categories',
        id: doc.id,
        data: { name: zh },
        locale: 'zh',
        fallbackLocale: false,
        overrideAccess: true,
      });

      await payload.update({
        collection: 'categories',
        id: doc.id,
        data: { name: en },
        locale: 'en',
        fallbackLocale: false,
        overrideAccess: true,
      });

      results.push({ id: doc.id, slug, zh, en, action: 'normalized' });
    }

    return res.status(200).json({ results });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
