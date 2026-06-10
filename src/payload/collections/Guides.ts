import { ValidationError, type CollectionAfterReadHook, type CollectionBeforeChangeHook, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload';

type GuideStatus = 'draft' | 'compliance' | 'chief' | 'published' | 'archived';

type GuidePublishSnapshot = {
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  content: unknown;
  cover: unknown;
};

function slugifyText(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isGuideStatus(value: unknown): value is GuideStatus {
  return value === 'draft' || value === 'compliance' || value === 'chief' || value === 'published' || value === 'archived';
}

function isTransitionAllowed(from: GuideStatus, to: GuideStatus): boolean {
  if (from === to) return true;
  if (to === 'draft') return true;

  if (from === 'draft' && to === 'compliance') return true;
  if (from === 'compliance' && to === 'chief') return true;
  if (from === 'chief' && to === 'published') return true;
  if (from === 'published' && to === 'archived') return true;
  if (from === 'archived' && to === 'draft') return true;

  return false;
}

function extractRichTextPlainText(value: unknown): string {
  const walk = (node: any): string => {
    if (node == null) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(walk).join(' ');
    if (typeof node !== 'object') return '';

    const text = typeof node.text === 'string' ? node.text : '';
    const children = walk(node.children);
    const root = walk(node.root);
    const content = walk(node.content);

    return `${text} ${children} ${root} ${content}`.trim();
  };

  return walk(value).replace(/\s+/g, ' ').trim();
}

function getGuidePublishMissingFields(snapshot: GuidePublishSnapshot): string[] {
  const missing: string[] = [];

  if (!snapshot.cover) missing.push('封面图 cover');
  if (!snapshot.titleZh.trim()) missing.push('中文标题 titleZh');
  if (!snapshot.titleEn.trim()) missing.push('英文标题 titleEn');
  if (!snapshot.summaryZh.trim()) missing.push('中文摘要 summaryZh');
  if (!snapshot.summaryEn.trim()) missing.push('英文摘要 summaryEn');
  if (!extractRichTextPlainText(snapshot.content)) missing.push('正文内容 content');

  return missing;
}

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

function isPastDate(value: unknown, now = Date.now()): boolean {
  if (!value) return false;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) && time <= now;
}

function isLocalPreviewHost(host: string): boolean {
  return host === 'localhost'
    || host === '127.0.0.1'
    || host.endsWith('.local')
    || host.startsWith('localhost:')
    || host.startsWith('127.0.0.1:');
}

const deriveGuideThumbnailAfterRead: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return doc;
  const now = Date.now();
  doc.thumbnail = deriveGuideThumbnail(doc);
  if (isPastDate(doc.pinExpiresAt, now)) {
    doc.isPinned = false;
  }
  return doc;
};

const enforceGuidePublishRules: CollectionBeforeChangeHook = ({ data, originalDoc, req, operation }) => {
  const nextData = { ...(data ?? {}) };
  const currentStatus: GuideStatus = isGuideStatus(originalDoc?.status) ? originalDoc.status : 'draft';
  const requestedStatus: GuideStatus = isGuideStatus(nextData?.status)
    ? nextData.status
    : currentStatus;

  if (operation === 'create') {
    nextData.status = 'draft';
    nextData._status = 'draft';
    if (!nextData.createdBy && req?.user?.id) {
      nextData.createdBy = req.user.id;
    }
    return nextData;
  }

  if (!isTransitionAllowed(currentStatus, requestedStatus)) {
    throw new ValidationError({
      collection: 'guides',
      errors: [
        {
          path: 'status',
          message: `状态流转不允许：${currentStatus} -> ${requestedStatus}。Allowed transitions only follow draft -> compliance -> chief -> published -> archived, or rollback to draft.`,
        },
      ],
      req,
    });
  }

  const statusChanged = requestedStatus !== currentStatus;
  nextData.status = requestedStatus;
  nextData._status = requestedStatus;

  if (statusChanged && requestedStatus === 'published') {
    const coverValue = nextData?.cover ?? originalDoc?.cover;
    if (!coverValue) {
      throw new ValidationError({
        collection: 'guides',
        errors: [
          {
            path: 'cover',
            message: '发布前必须设置封面图（Cover）以支持前台缩略图渲染。Cover image is required when publishing to ensure thumbnail rendering on the frontend.',
          },
        ],
        req,
      });
    }
  }

  if (statusChanged && requestedStatus === 'draft' && currentStatus !== 'draft') {
    const transitionNote = String(nextData.transitionNote ?? '').trim();
    if (!transitionNote) {
      throw new ValidationError({
        collection: 'guides',
        errors: [
          {
            path: 'transitionNote',
            message: '回退到草稿时必须填写流转备注。Transition note is required when rolling back to draft.',
          },
        ],
        req,
      });
    }
  }

  if (requestedStatus !== 'published') {
    return nextData;
  }

  const snapshot: GuidePublishSnapshot = {
    titleZh: String(nextData?.titleZh ?? originalDoc?.titleZh ?? ''),
    titleEn: String(nextData?.titleEn ?? originalDoc?.titleEn ?? ''),
    summaryZh: String(nextData?.summaryZh ?? originalDoc?.summaryZh ?? ''),
    summaryEn: String(nextData?.summaryEn ?? originalDoc?.summaryEn ?? ''),
    content: nextData?.content ?? originalDoc?.content ?? null,
    cover: nextData?.cover ?? originalDoc?.cover ?? null,
  };

  const missing = getGuidePublishMissingFields(snapshot);
  if (missing.length > 0) {
    throw new ValidationError({
      collection: 'guides',
      errors: [
        {
          path: 'status',
          message: `发布已阻止：请先补齐 ${missing.join('、')}。Publishing blocked: complete the required guide fields before setting status to published.`,
        },
      ],
      req,
    });
  }

  if (!nextData?.publishedAt && !originalDoc?.publishedAt) {
    nextData.publishedAt = new Date().toISOString();
  }

  return nextData;
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
    defaultColumns: ['titleEn', 'category', 'status', 'isPinned', 'publishedAt', 'updatedAt'],
    group: { zh: 'Editor', en: 'Editorial' },
    description: {
      zh: '选购指南：采用与全球资讯一致的三审流转，发布前必须补齐中英标题/摘要/正文并上传 cover 封面。',
      en: 'Buying guides use the same editorial workflow as News: compliance -> chief -> published, with bilingual completeness and cover required before publishing.'
    }
  },
  hooks: {
    beforeValidate: [ensureGuideSlug],
    beforeChange: [enforceGuidePublishRules],
    afterRead: [deriveGuideThumbnailAfterRead]
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;

      const hostHeader = String(req.headers?.host ?? '').trim().toLowerCase();
      const host = hostHeader.split(',')[0]?.trim() ?? '';
      if (process.env.NODE_ENV !== 'production' || isLocalPreviewHost(host)) {
        return true;
      }

      const now = new Date().toISOString();
      return {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            or: [
              {
                scheduledAt: {
                  exists: false,
                },
              },
              {
                scheduledAt: {
                  less_than_equal: now,
                },
              },
            ],
          },
          {
            or: [
              {
                expiresAt: {
                  exists: false,
                },
              },
              {
                expiresAt: {
                  greater_than: now,
                },
              },
            ],
          },
        ],
      };
    },
    readVersions: () => true,
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
      type: 'text',
      label: { zh: '指南分类', en: 'Guide Category' },
      required: true,
      admin: {
        position: 'sidebar',
        description: {
          zh: '填写“选购分类”里的稳定键（例如：beginner、scenario），用于前台过滤与映射。',
          en: 'Use the stable key from Buying Categories (for example: beginner, scenario) for frontend filtering/mapping.'
        }
      }
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
        { label: { zh: '待合规', en: 'Compliance Review' }, value: 'compliance' },
        { label: { zh: '待主编', en: 'Chief Review' }, value: 'chief' },
        { label: { zh: '已发布', en: 'Published' }, value: 'published' },
        { label: { zh: '已归档', en: 'Archived' }, value: 'archived' }
      ],
      admin: { position: 'sidebar' }
    },
    {
      name: 'transitionNote',
      type: 'textarea',
      label: { zh: '流转备注', en: 'Transition Note' },
      admin: {
        position: 'sidebar',
        description: { zh: '状态变更建议写明原因；从非草稿回退到草稿时为必填。', en: 'Recommended for status changes; required when rolling back to draft.' }
      }
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: { zh: '发布时间', en: 'Published At' },
      admin: { position: 'sidebar' }
    },
    {
      name: 'scheduledAt',
      type: 'date',
      label: { zh: '定时发布时间', en: 'Scheduled Publish Time' },
      admin: { position: 'sidebar' }
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: { zh: '下线时间', en: 'Expire Time' },
      admin: { position: 'sidebar' }
    },
    {
      name: 'isPinned',
      type: 'checkbox',
      defaultValue: false,
      label: { zh: '置顶', en: 'Pinned' },
      admin: { position: 'sidebar' }
    },
    {
      name: 'pinWeight',
      type: 'number',
      defaultValue: 0,
      label: { zh: '置顶权重', en: 'Pin Weight' },
      admin: { position: 'sidebar' }
    },
    {
      name: 'pinExpiresAt',
      type: 'date',
      label: { zh: '置顶过期时间', en: 'Pin Expire Time' },
      admin: { position: 'sidebar' }
    },
    {
      name: 'seo',
      type: 'group',
      label: { zh: 'SEO', en: 'SEO' },
      fields: [
        {
          name: 'metaTitleZh',
          type: 'text',
          label: { zh: 'Meta 标题（中文）', en: 'Meta Title (Chinese)' }
        },
        {
          name: 'metaTitleEn',
          type: 'text',
          label: { zh: 'Meta 标题（英文）', en: 'Meta Title (English)' }
        },
        {
          name: 'metaDescriptionZh',
          type: 'textarea',
          label: { zh: 'Meta 描述（中文）', en: 'Meta Description (Chinese)' }
        },
        {
          name: 'metaDescriptionEn',
          type: 'textarea',
          label: { zh: 'Meta 描述（英文）', en: 'Meta Description (English)' }
        }
      ]
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: { zh: '创建人', en: 'Created By' },
      admin: { position: 'sidebar', readOnly: true }
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
