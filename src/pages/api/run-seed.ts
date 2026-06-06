import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import payload from 'payload';

const SEED_HEADER = 'x-seed-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.SEED_TRIGGER_SECRET;
  if (!secret) return res.status(500).json({ error: 'SEED_TRIGGER_SECRET not configured on server' });

  const header = req.headers[SEED_HEADER];
  if (!header || header !== secret) return res.status(403).json({ error: 'Forbidden' });

  try {
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

    for (const item of items) {
      try {
        // Ensure slug exists
        if (!item.slug) {
          results.push({ slug: null, error: 'missing slug' });
          continue;
        }

        // Try to find by slug
        const found = await payload.find({
          collection: 'products',
          where: { slug: { equals: item.slug } },
          limit: 1,
        });

        if (found && found.docs && found.docs.length) {
          const doc = found.docs[0];
          const updated = await payload.update({ collection: 'products', id: doc.id, data: item });
          results.push({ slug: item.slug, action: 'updated', id: updated.id });
        } else {
          const created = await payload.create({ collection: 'products', data: item });
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
