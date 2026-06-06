import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { en } from "@payloadcms/translations/languages/en";
import { zh } from "@payloadcms/translations/languages/zh";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./src/payload/collections/Users";
import { Members } from "./src/payload/collections/Members";
import { Media } from "./src/payload/collections/Media";
import { Brands } from "./src/payload/collections/Brands";
import { Categories } from "./src/payload/collections/Categories";
import { Products } from "./src/payload/collections/Products";
import { Reviews } from "./src/payload/collections/Reviews";
import { SitePages } from "./src/payload/collections/SitePages";
import { LocaleEntries } from "./src/payload/collections/LocaleEntries";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "true";
const isRender = process.env.RENDER === "true";
const rawDatabaseURL = process.env.DATABASE_URL;

// On Vercel/Render production, fail fast if DATABASE_URL is missing or points to local SQLite.
if (isProduction && (isVercel || isRender) && !rawDatabaseURL) {
  throw new Error(
    "DATABASE_URL is required in production. Set a PostgreSQL URL (Neon recommended: https://neon.tech)."
  );
}

const databaseURL = process.env.DATABASE_URL ?? `file:${path.resolve(dirname, "payload.db")}`;
if (isProduction && (isVercel || isRender) && databaseURL.startsWith("file:")) {
  throw new Error(
    "SQLite not supported on Vercel/Render. Set DATABASE_URL to a PostgreSQL connection string."
  );
}

const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const hasR2Storage = Boolean(
  process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
);
const localOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:8081",
  "http://localhost:8081",
  "http://127.0.0.1:8083",
  "http://localhost:8083"
];

const parseOriginList = (rawValue?: string) =>
  (rawValue ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const toOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const configuredOrigins = [
  process.env.NEXTAUTH_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.PROTOTYPE_SITE_URL ?? "https://cbike-show-front.vercel.app",
  ...parseOriginList(process.env.CORS_ORIGINS)
]
  .map((value) => (value ? toOrigin(value) : null))
  .filter((value): value is string => Boolean(value));

const allowedOrigins = Array.from(new Set([...localOrigins, ...configuredOrigins]));

const dbAdapter = databaseURL.startsWith("file:")
  ? sqliteAdapter({ client: { url: databaseURL } })
  : postgresAdapter({ pool: { connectionString: databaseURL } });

const storagePlugins = hasR2Storage
  ? [
      s3Storage({
        collections: { media: true },
        bucket: process.env.R2_BUCKET_NAME!,
        config: {
          endpoint: process.env.R2_ENDPOINT,
          region: process.env.R2_REGION ?? "auto",
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
          },
          forcePathStyle: true
        }
      })
    ]
  : [];

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "dev-secret-change-in-production",
  sharp,
  email: hasSmtp
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM_ADDRESS ?? "no-reply@cbike-lab.example",
        defaultFromName: process.env.SMTP_FROM_NAME ?? "Cbike Review Lab",
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! }
        }
      })
    : undefined,
  i18n: {
    supportedLanguages: { en, zh },
    fallbackLanguage: "zh"
  },
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    meta: { titleSuffix: " — 童车评测实验室" },
    importMap: { autoGenerate: false }
  },
  cors: allowedOrigins,
  csrf: allowedOrigins,
  editor: lexicalEditor({}),
  db: dbAdapter,
  plugins: storagePlugins,
  collections: [Users, Members, Media, Brands, Categories, Products, Reviews, SitePages, LocaleEntries],
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  upload: { limits: { fileSize: 10 * 1024 * 1024 } }
});
