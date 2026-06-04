import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { zh } from "@payloadcms/translations/languages/zh";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./src/payload/collections/Users.ts";
import { Members } from "./src/payload/collections/Members.ts";
import { Media } from "./src/payload/collections/Media.ts";
import { Brands } from "./src/payload/collections/Brands.ts";
import { Categories } from "./src/payload/collections/Categories.ts";
import { Products } from "./src/payload/collections/Products.ts";
import { Reviews } from "./src/payload/collections/Reviews.ts";
import { SitePages } from "./src/payload/collections/SitePages.ts";
import { LocaleEntries } from "./src/payload/collections/LocaleEntries.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const isProduction = process.env.NODE_ENV === "production";
const isRender = process.env.RENDER === "true";
const rawDatabaseURL = process.env.DATABASE_URL;

// On Render production, fail fast if DATABASE_URL is missing or accidentally points to local SQLite.
if (isProduction && isRender && !rawDatabaseURL) {
  throw new Error("DATABASE_URL is required in production. Set a Postgres URL (Neon recommended).");
}

const databaseURL = process.env.DATABASE_URL ?? `file:${path.resolve(dirname, "payload.db")}`;
if (isProduction && isRender && databaseURL.startsWith("file:")) {
  throw new Error("Invalid production database configuration: SQLite fallback is disabled in production.");
}

const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
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
  collections: [Users, Members, Media, Brands, Categories, Products, Reviews, SitePages, LocaleEntries],
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  upload: { limits: { fileSize: 10 * 1024 * 1024 } }
});
