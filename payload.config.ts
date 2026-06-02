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

import { Users } from "./src/payload/collections/Users";
import { Members } from "./src/payload/collections/Members";
import { Media } from "./src/payload/collections/Media";
import { Brands } from "./src/payload/collections/Brands";
import { Categories } from "./src/payload/collections/Categories";
import { Products } from "./src/payload/collections/Products";
import { Reviews } from "./src/payload/collections/Reviews";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const databaseURL = process.env.DATABASE_URL ?? `file:${path.resolve(dirname, "payload.db")}`;
const isPostgres = !databaseURL.startsWith("file:");
const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const localOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:8081",
  "http://localhost:8081",
  "http://127.0.0.1:8083",
  "http://localhost:8083"
];

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
  cors: localOrigins,
  csrf: localOrigins,
  editor: lexicalEditor({}),
  db: dbAdapter,
  collections: [Users, Members, Media, Brands, Categories, Products, Reviews],
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  upload: { limits: { fileSize: 10 * 1024 * 1024 } }
});
