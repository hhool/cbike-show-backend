import type { CollectionConfig } from "payload";

/**
 * 后台运营账号(Staff)— 与前台 Members 严格隔离。
 * 7 角色 RBAC:super_admin / editor_chief / editor / tester / compliance / seo / viewer
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  labels: { singular: { en: "Staff User", zh: "运营账号" }, plural: { en: "Staff Users", zh: "运营账号" } },
  admin: {
    useAsTitle: "email",
    group: { en: "System", zh: "系统设置" },
    defaultColumns: ["email", "name", "role", "updatedAt"],
    description: "后台运营账号(测评 / 编辑 / 合规 / 主编 / SEO / 只读 / 超管)。"
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === "super_admin",
    update: ({ req }) => Boolean(req.user) && (req.user.role === "super_admin" || req.user.role === "editor_chief"),
    delete: ({ req }) => req.user?.role === "super_admin"
  },
  fields: [
    { name: "name", type: "text", required: true, label: { en: "Name", zh: "姓名" } },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "viewer",
      options: [
        { label: "Super Admin", value: "super_admin" },
        { label: "Editor-in-Chief", value: "editor_chief" },
        { label: "Editor", value: "editor" },
        { label: "Tester", value: "tester" },
        { label: "Compliance", value: "compliance" },
        { label: "SEO", value: "seo" },
        { label: "Viewer", value: "viewer" }
      ],
      admin: { position: "sidebar" }
    }
  ]
};
