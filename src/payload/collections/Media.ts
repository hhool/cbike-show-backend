import type { CollectionConfig } from "payload";
import { buildStorageKeys, resolveStorageEnv, type StorageEntityType } from "../utils/storageKeys";

const isVercel = process.env.VERCEL === "true";
const hasR2Storage = Boolean(
  process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
);
const mediaStorageMetadataEnabled = process.env.MEDIA_STORAGE_METADATA_ROLLOUT === "true";

const storageEntityTypeOptions = [
  { label: "product", value: "product" },
  { label: "brand", value: "brand" },
  { label: "review", value: "review" },
  { label: "page", value: "page" },
  { label: "member", value: "member" },
  { label: "common", value: "common" }
] as const;

const mediaUpload = isVercel && !hasR2Storage
  ? undefined
  : {
      // On Vercel, staticDir must be undefined (use external storage via handlers instead)
      // Locally, use public/media for file storage
      staticDir: isVercel ? undefined : "public/media",
      imageSizes: [
        { name: "thumb", width: 400, height: 300, position: "centre" },
        { name: "card", width: 800, height: 600, position: "centre" },
        { name: "hero", width: 1920, height: 1080, position: "centre" }
      ],
      adminThumbnail: "thumb",
      mimeTypes: ["image/*"],
      maxFileSize: 10 * 1024 * 1024
    };

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: { en: "Media", zh: "媒体" }, plural: { en: "Media", zh: "媒体" } },
  admin: { group: { en: "Assets", zh: "媒体资源" } },
  access: { read: () => true },
  ...(mediaUpload ? { upload: mediaUpload } : {}),
  ...(mediaStorageMetadataEnabled
    ? {
        hooks: {
          beforeValidate: [
            ({ data }) => {
              if (!data) return data;

              data.storageEnv = data.storageEnv || resolveStorageEnv();
              data.storageVersion = data.storageVersion || 2;
              data.entityType = (data.entityType || "common") as StorageEntityType;
              data.entityId = data.entityId || "common";

              return data;
            }
          ],
          afterChange: [
            async ({ doc, req }) => {
              if (!hasR2Storage) return doc;
              if (!doc?.id || !doc?.filename) return doc;
              if (req.context?.skipStorageKeySync) return doc;

              const hasAllKeys = Boolean(
                doc.storageKeyOriginal &&
                  doc.storageKeyThumb &&
                  doc.storageKeyCard &&
                  doc.storageKeyHero
              );

              if (hasAllKeys) return doc;

              const keys = buildStorageKeys({
                env: (doc.storageEnv || resolveStorageEnv()) as "prod" | "preview" | "dev",
                entityType: (doc.entityType || "common") as StorageEntityType,
                entityId: String(doc.entityId || doc.id || "common"),
                now: doc.createdAt ? new Date(doc.createdAt) : new Date(),
                filename: String(doc.filename)
              });

              await req.payload.update({
                collection: "media",
                id: doc.id,
                data: {
                  storageKeyOriginal: keys.original,
                  storageKeyThumb: keys.thumb,
                  storageKeyCard: keys.card,
                  storageKeyHero: keys.hero,
                  storageVersion: doc.storageVersion || 2
                },
                overrideAccess: true,
                context: { ...req.context, skipStorageKeySync: true }
              });

              return doc;
            }
          ]
        }
      }
    : {}),
  fields: [
    { name: "alt", type: "text", required: true, label: { en: "Alt Text", zh: "Alt 描述" } },
    { name: "credit", type: "text", admin: { description: "图片版权署名(自摄/品牌素材/Unsplash 等)" } },
    ...(mediaStorageMetadataEnabled
      ? [
          {
            name: "storageEnv",
            type: "select",
            options: [
              { label: "prod", value: "prod" },
              { label: "preview", value: "preview" },
              { label: "dev", value: "dev" }
            ],
            defaultValue: resolveStorageEnv,
            admin: { position: "sidebar", readOnly: true }
          },
          {
            name: "entityType",
            type: "select",
            options: storageEntityTypeOptions,
            defaultValue: "common",
            admin: { position: "sidebar" }
          },
          { name: "entityId", type: "text", defaultValue: "common", admin: { position: "sidebar" } },
          { name: "storageVersion", type: "number", defaultValue: 2, admin: { position: "sidebar", readOnly: true } },
          { name: "storageKeyOriginal", type: "text", admin: { position: "sidebar", readOnly: true } },
          { name: "storageKeyThumb", type: "text", admin: { position: "sidebar", readOnly: true } },
          { name: "storageKeyCard", type: "text", admin: { position: "sidebar", readOnly: true } },
          { name: "storageKeyHero", type: "text", admin: { position: "sidebar", readOnly: true } }
        ]
      : [])
  ],
  timestamps: true
};
