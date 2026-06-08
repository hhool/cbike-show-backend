# site_cbike_show — 童车评测实验室(Payload + Next.js)

## 启动

```bash
cd cbike_show/site_cbike_show
cp .env.local.example .env.local
# 编辑 .env.local,至少修改 PAYLOAD_SECRET

npm install
npx payload generate:importmap   # 生成 src/app/(payload)/admin/importMap.js
npm run dev                       # http://localhost:3000
```

## 运行稳定性说明

- 不要在同一工作区里让 `npm run dev` 与 `npm run build` 并行运行。`build` 会清理 `.next`，可能导致正在运行的 dev 服务短时 500。
- 若已发生：先停止 dev，执行 `rm -rf .next`，再重新启动 dev。

## Seed 说明

```bash
npx tsx scripts/seed.ts
```

`scripts/seed.ts` 会自动探测本地可用 API 地址，顺序如下：

- 显式设置的 `API_BASE`
- `http://localhost:3000`
- `http://localhost:3001`

如果你的 dev 端口不是默认值，请显式设置 `API_BASE`。

首次访问 [http://localhost:3000/admin](http://localhost:3000/admin) 会引导创建第一个超级管理员账号。

## 目录速览

- `payload.config.ts` — Payload 配置(7 个 collection)
- `src/payload/collections/` — Users / Members / Media / Brands / Categories / Products / Reviews
- `src/app/(payload)/` — Payload Admin + REST API 路由
- `src/app/page.tsx` — 临时前台首页占位

## 前台路由补充

- `/products` 支持筛选参数：`q`、`region`、`brand`、`category`

## 设计文档

- 需求:`../env/PRD-V1.0.md`
- 信息架构:`../env/Site-IA-V1.0.md`
- 后台 CMS:`../env/Admin-CMS-V1.0.md`
- 技术架构:`../env/Tech-Architecture-V1.0.md`
- 静态原型:`../prototype/`
- 部署执行版:`../env/process/DeploymentRunbook_Production_V2_zh.md`
- 生产人工验收:`../env/process/ProductionAcceptanceChecklist_V1_zh.md`
- 后台逐页验收模板:`../env/process/AdminPageAcceptanceTemplate_V1_zh.md`
- 最终交付摘要:`../env/process/DeliverySummary_V1_zh.md`

## 生产环境补充变量

- `PROTOTYPE_SITE_URL`：静态 Vercel 前端域名，默认线上原型为 `https://cbike-show-front.vercel.app`
- `CORS_ORIGINS`：附加允许访问后端 API 的前端来源，多个域名用逗号分隔
