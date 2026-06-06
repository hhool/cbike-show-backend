import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: { en: "Media", zh: "媒体" }, plural: { en: "Media", zh: "媒体" } },
  admin: { group: { en: "Assets", zh: "媒体资源" } },
  access: { read: () => true },
  upload: {
    // On Vercel, staticDir must be undefined (use external storage via handlers instead)
    // Locally, use public/media for file storage
    staticDir: process.env.VERCEL ? undefined : "public/media",
    imageSizes: [
      { name: "thumb", width: 400, height: 300, position: "centre" },
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" }
    ],
    adminThumbnail: "thumb",
    mimeTypes: ["image/*"],
    maxFileSize: 10 * 1024 * 1024
  },
  fields: [
    { name: "alt", type: "text", required: true, label: { en: "Alt Text", zh: "Alt 描述" } },
    { name: "credit", type: "text", admin: { description: "图片版权署名(自摄/品牌素材/Unsplash 等)" } }
  ],
  timestamps: true
};
