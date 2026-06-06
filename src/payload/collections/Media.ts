import type { CollectionConfig } from "payload";

const isVercel = process.env.VERCEL === "true";
const hasR2Storage = Boolean(
  process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
);

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
  fields: [
    { name: "alt", type: "text", required: true, label: { en: "Alt Text", zh: "Alt 描述" } },
    { name: "credit", type: "text", admin: { description: "图片版权署名(自摄/品牌素材/Unsplash 等)" } }
  ],
  timestamps: true
};
