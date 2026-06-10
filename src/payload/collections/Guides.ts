import type { CollectionAfterReadHook, CollectionBeforeValidateHook, CollectionConfig } from 'payload';
import { slugifyText } from '../utils/slug';

const ensureGuideSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (!data || data.slug) return data;
  const source = (typeof data.titleEn === 'string' ? data.titleEn : typeof data.titleZh === 'string' ? data.titleZh : '').trim();
  const slug = slugifyText(source);
  return slug ? { ...data, slug } : data;
};

type Guide = {
  id?: string | number;
  cover?: { url?: string; sizes?: Record<string, { url?: string }>; storageKeyThumb?: string; storageKeyCard?: string; storageKeyHero?: string; storageKeyOriginal?: string } | null;
  thumbnail?: { thumb?: string | null; card?: string | null; hero?: string | null; original?: string | null } | null;
  [key: string]: any;
};

function pickMediaVariantUrl(cover: any, variant: string): string | null {
  if (!cover || typeof cover !== 'object') return null;
  const sizeUrl = cover.sizes?.[variant]?.url;
  if (sizeUrl && typeof sizeUrl === 'string') return sizeUrl;
  const variantKeyMap: Record<string, string> = {
    thumb: 'storageKeyThumb',
    card: 'storageKeyCard',
    hero: 'storageKeyHero',
    original: 'storageKeyOriginal'
  };
  const storageKey = variantKeyMap[variant];
  if (storageKey && cover[storageKey]) return cover[storageKey];
  return null;
}

function deriveGuideThumbnail(doc: Guide): { thumb: string | null; card: string | null; hero: string | null; original: string | null } | null {
  const cover = doc?.cover && typeof doc.cover === 'object' ? doc.cover : null;
  if (!cover) return null;
  return {
    thumb: pickMediaVariantUrl(cover, 'thumb'),
    card: pickMediaVariantUrl(cover, 'card'),
    hero: pickMediaVariantUrl(cover, 'hero'),
    original: pickMediaVariantUrl(cover, 'original'),
  };
}

const deriveGuideThumbnailAfterRead: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return doc;
  const cover = doc.cover && typeof doc.cover === 'object' ? doc.cover : null;
  doc.thumbnail = deriveGuideThumbnail(doc);
  return doc;
};

export const Guides: CollectionConfig = {
  slug: 'guides',
  defaultSort: ['-publishedAt'],
  labels: {
    singular: { zh: '选购指南', en: 'Buying Guide' },
    plural: { zh: '选购指南', en: 'Buying Guides' },
  },
  admin: {
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'category', 'status', 'publishedAt'],
    group: { zh: '内容管理', en: 'Content' },
    description: {
      zh: '选购指南：从新手入门到风险甄别的体系化内容。发布前必须上传 cover 封面，自动生成4个缩略图尺寸（thumb/card/hero/original）。',
      en: 'Buying guides: systematic content from beginner basics to risk identification. Cover image is required before publishing; 4 thumbnail sizes are auto-generated.'
    }
  },
  hooks: {
    beforeValidate: [ensureGuideSlug],
    afterRead: [deriveGuideThumbnailAfterRead]
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'titleZh',
      type: 'text',
      label: { zh: '标题（中文）', en: 'Title (Chinese)' },
    },
    {
      name: 'titleEn',
      type: 'text',
      label: { zh: '标题（英文）', en: 'Title (English)' },
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: { zh: 'URL 标识符', en: 'URL Slug' },
      admin: {
        description: { zh: '自动从英文标题生成', en: 'Auto-generated from English title if left blank' }
      }
    },
    {
      name: 'category',
      type: 'select',
      label: { zh: '指南分类', en: 'Guide Category' },
      required: true,
      options: [
        { label: { zh: '新手入门', en: 'Beginner Basics' }, value: 'beginner' },
        { label: { zh: '场景化', en: 'Scenario' }, value: 'scenario' },
        { label: { zh: '预算分级', en: 'Budget Planning' }, value: 'budget' },
        { label: { zh: '风险甄别', en: 'Risk Identification' }, value: 'risk' },
        { label: { zh: '跨境选购', en: 'Cross-Border Buying' }, value: 'crossborder' },
        { label: { zh: '品类专项', en: 'Category Deep Dive' }, value: 'category' },
        { label: { zh: '养护使用', en: 'Care and Maintenance' }, value: 'maintenance' }
      ],
      admin: { position: 'sidebar' }
    },
    {
      name: 'summaryZh',
      type: 'textarea',
      label: { zh: '摘要（中文）', en: 'Summary (Chinese)' },
      maxLength: 150,
    },
    {
      name: 'summaryEn',
      type: 'textarea',
      label: { zh: '摘要（英文）', en: 'Summary (English)' },
      maxLength: 150,
    },
    {
      name: 'cover',
      type: 'relationship',
      relationTo: 'media',
      label: { zh: 'Cover 封面图', en: 'Cover Image' },
      admin: {
        description: { zh: '发布前必须上传，用于生成缩略图。建议尺寸：1920x1080 及以上。', en: 'Required before publishing. Used to generate thumbnails. Recommended size: 1920x1080 or larger.' }
      }
    },
    {
      name: 'content',
      type: 'richText',
      label: { zh: '正文内容', en: 'Content' },
    },
    {
      name: 'status',
      type: 'select',
      label: { zh: '发布状态', en: 'Status' },
      defaultValue: 'draft',
      options: [
        { label: { zh: '草稿', en: 'Draft' }, value: 'draft' },
        { label: { zh: '已发布', en: 'Published' }, value: 'published' },
        { label: { zh: '已归档', en: 'Archived' }, value: 'archived' }
      ],
      admin: { position: 'sidebar' }
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: { zh: '发布时间', en: 'Published At' },
      admin: { position: 'sidebar' }
    },
    {
      name: 'createdAt',
      type: 'date',
      label: { zh: '创建时间', en: 'Created At' },
      admin: { readOnly: true, hidden: true }
    },
    {
      name: 'updatedAt',
      type: 'date',
      label: { zh: '更新时间', en: 'Updated At' },
      admin: { readOnly: true, hidden: true }
    }
  ]
};
