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

首次访问 [http://localhost:3000/admin](http://localhost:3000/admin) 会引导创建第一个超级管理员账号。

## 目录速览

- `payload.config.ts` — Payload 配置(7 个 collection)
- `src/payload/collections/` — Users / Members / Media / Brands / Categories / Products / Reviews
- `src/app/(payload)/` — Payload Admin + REST API 路由
- `src/app/page.tsx` — 临时前台首页占位

## 设计文档

- 需求:`../env/PRD-V1.0.md`
- 信息架构:`../env/Site-IA-V1.0.md`
- 后台 CMS:`../env/Admin-CMS-V1.0.md`
- 技术架构:`../env/Tech-Architecture-V1.0.md`
- 静态原型:`../prototype/`
