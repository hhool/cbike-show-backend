/**
 * seed-products.ts
 * - Reads `products-migrated.json` (if exists) or `products-to-migrate.json`
 * - Produces a `seed-products.json` file formatted for manual import
 * - Prints example `curl` commands to create products via Payload REST API
 *
 * Usage: `node -r tsx ./scripts/seed-products.ts` or compile to JS.
 * To POST automatically you'd supply PAYLOAD_API_URL and an ADMIN_TOKEN env var.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATED = path.resolve(__dirname, "products-migrated.json");
const INPUT = path.resolve(__dirname, "products-to-migrate.json");
const OUTPUT = path.resolve(__dirname, "seed-products.json");

const data = fs.existsSync(MIGRATED)
  ? JSON.parse(fs.readFileSync(MIGRATED, "utf8"))
  : JSON.parse(fs.readFileSync(INPUT, "utf8"));

// Normalize into shape suitable for Payload 'Products' collection
const prepared = data.map((p) => ({
  slug: p.slug,
  brand: p.brand,
  category: p.category,
  title: p.title,
  description: p.description,
  images: p.images || [],
  published: true
}));

fs.writeFileSync(OUTPUT, JSON.stringify(prepared, null, 2));
console.log(`Wrote ${OUTPUT} (${prepared.length} items)`);

// Print curl examples
console.log(`\nExample curl commands (replace <PAYLOAD_API_URL> and <ADMIN_TOKEN>):\n`);
for (const item of prepared) {
  const payload = JSON.stringify(item).replace(/"/g, '\"');
  console.log(`curl -X POST '<PAYLOAD_API_URL>/api/products' -H 'Content-Type: application/json' -H 'Authorization: Bearer <ADMIN_TOKEN>' -d \"${payload}\"`);
}

console.log(`\nAlternatively import ${OUTPUT} via Payload Admin UI (Collections -> Products -> Import).`);
