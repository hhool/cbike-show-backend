import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { getPayload } from 'payload';
import config from '@payload-config';

const SEED_HEADER = 'x-seed-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.SEED_TRIGGER_SECRET;
  if (!secret) return res.status(500).json({ error: 'SEED_TRIGGER_SECRET not configured on server' });

  const header = req.headers[SEED_HEADER];
  if (!header || header !== secret) return res.status(403).json({ error: 'Forbidden' });

  try {
    const payload = await getPayload({ config });
    const base = path.resolve(process.cwd(), 'scripts');
    const candidates = [
      path.join(base, 'seed-products.json'),
      path.join(base, 'products-migrated.json'),
      path.join(base, 'products-to-migrate.json'),
    ];

    let file: string | null = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        file = c;
        break;
      }
    }

    if (!file) return res.status(500).json({ error: 'No seed file found in scripts/' });

    const raw = fs.readFileSync(file, 'utf8');
    const items = JSON.parse(raw);
    const results: any[] = [];

    const ensureBrand = async (brandName: string) => {
      const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const existing = await payload.find({
        collection: 'brands',
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: true,
      });

      if (existing.docs.length) return existing.docs[0];

      return payload.create({
        collection: 'brands',
        overrideAccess: true,
        data: {
          name: brandName,
          slug,
          region: brandName === 'Bebe Confort' ? 'europe' : 'north_america',
          country: brandName === 'Bebe Confort' ? 'FR' : 'US',
          marketFocus: ['stroller'],
          priorityScore: 70,
          intro: {
            en: `${brandName} stroller and nursery travel brand.`,
            zh: `${brandName} 婴童出行与推车品牌。`,
          },
        },
      });
    };

    const ensureCategory = async (categorySlug: string) => {
      const normalizedSlug = categorySlug === 'carseat' ? 'carseat' : 'stroller';
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: normalizedSlug } },
        limit: 1,
        overrideAccess: true,
      });

      if (existing.docs.length) {
        const doc = existing.docs[0] as any;
        const desiredName = normalizedSlug === 'carseat' ? '安全座椅' : '婴儿推车';
        const currentName = typeof doc.name === 'string' ? doc.name : '';
        if (currentName.startsWith('{') || currentName !== desiredName) {
          return payload.update({
            collection: 'categories',
            id: doc.id,
            overrideAccess: true,
            data: {
              name: desiredName,
              kind: 'stroller',
              ageRange: '0-4y',
            },
          });
        }
        return doc;
      }

      return payload.create({
        collection: 'categories',
        overrideAccess: true,
        data: {
          slug: normalizedSlug,
          name: normalizedSlug === 'carseat' ? '安全座椅' : '婴儿推车',
          // Current schema does not support a dedicated carseat kind; map to stroller for now.
          kind: 'stroller',
          ageRange: normalizedSlug === 'carseat' ? '0-4y' : '0-4y',
        },
      });
    };

    const mapCertifications = (categorySlug: string) => {
      if (categorySlug === 'carseat') return ['cpsc'];
      return ['en1888', 'astm_f833'];
    };

    for (const item of items) {
      try {
        // Ensure slug exists
        if (!item.slug) {
          results.push({ slug: null, error: 'missing slug' });
          continue;
        }

        const brand = await ensureBrand(String(item.brand || 'Unknown'));
        const category = await ensureCategory(String(item.category || 'stroller'));

        const productData = {
          modelName: item.title?.en || item.slug,
          slug: item.slug,
          brand: brand.id,
          category: category.id,
          _status: 'published',
          summary: {
            en: item.description?.en || '',
            zh: item.description?.zh || '',
          },
          msrpCNY: item.category === 'carseat' ? 2999 : 4999,
          params: {
            weightKg: item.category === 'carseat' ? 7.5 : 12.5,
            loadKg: item.category === 'carseat' ? 18 : 22,
            foldedSize: item.category === 'carseat' ? 'N/A' : '65 x 52 x 35 cm',
            expandedSize: item.category === 'carseat' ? 'N/A' : '92 x 58 x 108 cm',
            reclineDeg: item.category === 'carseat' ? 140 : 170,
            bidirectional: item.category !== 'carseat',
          },
          certifications: mapCertifications(String(item.category || 'stroller')),
        };

        // Try to find by slug
        const found = await payload.find({
          collection: 'products',
          where: { slug: { equals: item.slug } },
          limit: 1,
          overrideAccess: true,
        });

        if (found && found.docs && found.docs.length) {
          const doc = found.docs[0];
          const updated = await payload.update({
            collection: 'products',
            id: doc.id,
            data: productData,
            overrideAccess: true,
          });
          results.push({ slug: item.slug, action: 'updated', id: updated.id });
        } else {
          const created = await payload.create({
            collection: 'products',
            data: productData,
            overrideAccess: true,
          });
          results.push({ slug: item.slug, action: 'created', id: created.id });
        }
      } catch (err: any) {
        results.push({ slug: item.slug ?? null, error: err?.message ?? String(err) });
      }
    }

    return res.status(200).json({ results });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
}
