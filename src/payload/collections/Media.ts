import type { CollectionConfig } from "payload";
import { buildStoragePrefix, resolveStorageEnv, type StorageEntityType } from "../utils/storageKeys";

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
        // Width-only resizing keeps the original aspect ratio and avoids forced cropping.
        { name: "thumb", width: 400, withoutEnlargement: true },
        { name: "card", width: 800, withoutEnlargement: true },
        { name: "hero", width: 1920, withoutEnlargement: true }
      ],
      adminThumbnail: "thumb",
      mimeTypes: ["image/*"],
      maxFileSize: 10 * 1024 * 1024
    };

const mediaHooks: CollectionConfig["hooks"] = {
  beforeOperation: [
    ({ args }: { args: any }) => {
      if (!args || typeof args !== "object") return args;

      const nextData = "data" in args && args.data && typeof args.data === "object" ? args.data : undefined;
      if (!nextData) return args;

      const storageEnv = (nextData.storageEnv || resolveStorageEnv()) as "prod" | "preview" | "dev";
      const entityType = (nextData.entityType || "common") as StorageEntityType;
      const entityId = String(nextData.entityId || "common");

      if (!nextData.prefix) {
        nextData.prefix = buildStoragePrefix({
          env: storageEnv,
          entityType,
          entityId,
          now: nextData.createdAt ? new Date(nextData.createdAt) : new Date()
        });
      }

      nextData.storageEnv = storageEnv;
      nextData.entityType = entityType;
      nextData.entityId = entityId;
      nextData.storageVersion = nextData.storageVersion || 2;

      return args;
    }
  ]
};

if (hasR2Storage) {
  mediaHooks.beforeValidate = [
    ({ data }: { data: any }) => {
      if (!data) return data;

      const storageEnv = (data.storageEnv || resolveStorageEnv()) as "prod" | "preview" | "dev";
      const entityType = (data.entityType || "common") as StorageEntityType;
      const entityId = String(data.entityId || "common");

      if (!data.prefix) {
        data.prefix = buildStoragePrefix({
          env: storageEnv,
          entityType,
          entityId,
          now: data.createdAt ? new Date(data.createdAt) : new Date()
        });
      }

      if (mediaStorageMetadataEnabled) {
        data.storageEnv = storageEnv;
        data.storageVersion = data.storageVersion || 2;
        data.entityType = entityType;
        data.entityId = entityId;
      }

      return data;
    }
  ];

  if (mediaStorageMetadataEnabled) {
    mediaHooks.afterChange = [
      async ({ doc, req }: { doc: any; req: any }) => {
        if (!doc?.id || !doc?.filename) return doc;
        if (req.context?.skipStorageKeySync) return doc;

        const storageEnv = (doc.storageEnv || resolveStorageEnv()) as "prod" | "preview" | "dev";
        const entityType = (doc.entityType || "common") as StorageEntityType;
        const entityId = String(doc.entityId || doc.id || "common");
        const prefix = doc.prefix || buildStoragePrefix({
          env: storageEnv,
          entityType,
          entityId,
          now: doc.createdAt ? new Date(doc.createdAt) : new Date()
        });

        const nextOriginal = `${prefix}/${String(doc.filename)}`;
        const nextThumb = doc?.sizes?.thumb?.filename ? `${prefix}/${doc.sizes.thumb.filename}` : doc.storageKeyThumb;
        const nextCard = doc?.sizes?.card?.filename ? `${prefix}/${doc.sizes.card.filename}` : doc.storageKeyCard;
        const nextHero = doc?.sizes?.hero?.filename ? `${prefix}/${doc.sizes.hero.filename}` : doc.storageKeyHero;

        const hasAllKeys = Boolean(doc.storageKeyOriginal && doc.storageKeyThumb && doc.storageKeyCard && doc.storageKeyHero);
        const noChange =
          hasAllKeys &&
          doc.prefix === prefix &&
          doc.storageKeyOriginal === nextOriginal &&
          doc.storageKeyThumb === nextThumb &&
          doc.storageKeyCard === nextCard &&
          doc.storageKeyHero === nextHero;

        if (noChange) return doc;

        try {
          await req.payload.update({
            collection: "media",
            id: doc.id,
            data: {
              prefix,
              storageEnv,
              entityType,
              entityId,
              storageVersion: doc.storageVersion || 2,
              storageKeyOriginal: nextOriginal,
              storageKeyThumb: nextThumb,
              storageKeyCard: nextCard,
              storageKeyHero: nextHero
            },
            overrideAccess: true,
            context: { ...req.context, skipStorageKeySync: true, skipCloudStorage: true }
          });
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
          const code = error instanceof Error && "code" in error ? String((error as Error & { code?: string }).code || "").toLowerCase() : "";
          const isNotFound = code === "not_found" || code === "404" || message.includes("not found") || message.includes("未找到");

          if (!isNotFound) {
            throw error;
          }

          req.payload.logger.warn(
            `Media metadata sync skipped because the follow-up update could not find doc ${doc.id}; save will still succeed.`
          );
        }

        return doc;
      }
    ];
  }
}

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: { en: "Media", zh: "媒体" }, plural: { en: "Media", zh: "媒体" } },
  admin: { group: { en: "Assets", zh: "媒体资源" } },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user)
  },
  ...(mediaUpload ? { upload: mediaUpload } : {}),
  hooks: mediaHooks,
  fields: [
    { name: "alt", type: "text", required: true, label: { en: "Alt Text", zh: "Alt 描述" } },
    { name: "credit", type: "text", admin: { description: "图片版权署名(自摄/品牌素材/Unsplash 等)" } },
    {
      name: "prefix",
      type: "text",
      admin: { position: "sidebar", readOnly: true, hidden: true }
    },
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
