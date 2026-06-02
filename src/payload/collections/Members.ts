import type { CollectionConfig } from "payload";

/**
 * 前台会员账号(End-User)— 邮箱验证码注册,GDPR 默认合规。
 * 与后台 Users 严格隔离;不参与任何评分/榜单计算。
 */
export const Members: CollectionConfig = {
  slug: "members",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    verify: true,
    forgotPassword: { generateEmailSubject: () => "重置您的童车评测实验室密码" }
  },
  labels: { singular: { en: "Member", zh: "会员" }, plural: { en: "Members", zh: "会员" } },
  admin: {
    useAsTitle: "email",
    group: { en: "Membership", zh: "会员体系" },
    defaultColumns: ["email", "tier", "locale", "region", "lastLoginAt", "createdAt"],
    description: "前台注册会员;后台支持 GDPR 数据导出 / 删除。"
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === "users") return true;
      return { id: { equals: req.user.id } };
    },
    create: () => true,
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === "users") return true;
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.collection === "users" && req.user?.role === "editor_chief"
  },
  fields: [
    {
      name: "tier",
      type: "select",
      defaultValue: "free",
      required: true,
      options: [
        { label: "Free", value: "free" },
        { label: "Pro (Subscriber)", value: "pro" },
        { label: "B2B", value: "b2b" }
      ],
      admin: { position: "sidebar" }
    },
    { name: "locale", type: "select", defaultValue: "zh", options: [
      { label: "中文", value: "zh" }, { label: "English", value: "en" }
    ], admin: { position: "sidebar" } },
    { name: "region", type: "text", admin: { position: "sidebar", description: "ISO 国家/地区代码" } },
    {
      name: "consent",
      type: "group",
      label: { en: "Consent (GDPR)", zh: "同意书(GDPR)" },
      fields: [
        { name: "privacy", type: "checkbox", required: true, label: { en: "Privacy Policy", zh: "隐私政策" } },
        { name: "terms", type: "checkbox", required: true, label: { en: "Terms of Service", zh: "用户协议" } },
        { name: "marketing", type: "checkbox", defaultValue: false, label: { en: "Marketing", zh: "营销邮件" } },
        { name: "consentedAt", type: "date" }
      ]
    },
    { name: "favorites", type: "relationship", relationTo: "products", hasMany: true },
    { name: "lastLoginAt", type: "date", admin: { readOnly: true, position: "sidebar" } },
    { name: "lockedUntil", type: "date", admin: { readOnly: true, position: "sidebar" } }
  ],
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        try {
          await req.payload.update({
            collection: "members",
            id: user.id,
            data: { lastLoginAt: new Date().toISOString() },
            overrideAccess: true
          });
        } catch (e) { req.payload.logger.warn(`afterLogin update failed: ${(e as Error).message}`); }
      }
    ]
  }
};
