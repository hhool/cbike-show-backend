#!/usr/bin/env node
/*
  migrate-media-to-r2.js
  - Reads `scripts/products-to-migrate.json` which contains an array of product objects with image URLs
  - Downloads each image and uploads to R2 using S3-compatible API (@aws-sdk/client-s3)
  - Produces `scripts/products-migrated.json` with updated image URLs pointing to R2

  Usage:
    R2_ACCOUNT_ID=... R2_BUCKET_NAME=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... node migrate-media-to-r2.js

  Note: This script does not modify your database. It outputs an updated JSON you can use for seeding.
*/

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = path.resolve(__dirname, "products-to-migrate.json");
const OUTPUT = path.resolve(__dirname, "products-migrated.json");

if (!process.env.R2_BUCKET_NAME || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT) {
  console.error("Missing R2 env vars. Please set R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT");
  process.exit(1);
}

const s3 = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.R2_REGION ?? "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
});

const downloadBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

const uploadToR2 = async (buffer, key, contentType) => {
  const cmd = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });
  await s3.send(cmd);
  const endpoint = process.env.R2_ENDPOINT.replace(/\/$/, "");
  return `${endpoint}/${process.env.R2_BUCKET_NAME}/${key}`;
};

const main = async () => {
  if (!fs.existsSync(INPUT)) {
    console.error(`Missing input file: ${INPUT}`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  for (const p of products) {
    p.images = p.images || [];
    const migrated = [];
    for (const img of p.images) {
      try {
        console.log(`Downloading ${img.url}`);
        const buf = await downloadBuffer(img.url);
        const ext = path.extname(new URL(img.url).pathname) || ".jpg";
        const key = `products/${p.brand || 'unknown'}/${p.slug || 'unknown'}-${Date.now()}${ext}`;
        console.log(`Uploading to R2 as ${key}`);
        const contentType = img.contentType || "image/jpeg";
        const r2url = await uploadToR2(buf, key, contentType);
        migrated.push({ url: r2url, alt: img.alt || img.altText || "" });
        console.log(`Uploaded -> ${r2url}`);
      } catch (err) {
        console.error(`Error migrating image ${img.url}:`, err.message);
      }
    }
    p.images = migrated;
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(products, null, 2));
  console.log(`Wrote migrated product JSON to ${OUTPUT}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
