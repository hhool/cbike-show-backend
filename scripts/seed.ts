/**
 * REST 种子脚本：通过 Payload HTTP API 创建示例数据，并验证 Reviews 加权公式
 * 运行：
 *   export PATH=/tmp/node-v22.18.0-darwin-x64/bin:$PATH
 *   API_BASE=http://localhost:3000 npx tsx scripts/seed.ts
 */

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@cbike-lab.example";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";

type AnyObject = Record<string, any>;

async function request(path: string, init?: RequestInit, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `JWT ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || json?.message || `HTTP ${res.status}`;
    throw new Error(`${path} -> ${msg}`);
  }
  return json;
}

function unwrapDoc<T extends AnyObject>(payload: T): AnyObject {
  if (payload && typeof payload === "object" && payload.doc && typeof payload.doc === "object") {
    return payload.doc as AnyObject;
  }
  return payload;
}

async function ensureAdminToken(): Promise<string> {
  try {
    const login = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    console.log("ℹ️  使用现有管理员登录成功");
    return login.token;
  } catch {
    await request("/api/users/first-register", {
      method: "POST",
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: "Super Admin",
        role: "super_admin",
      }),
    });
    console.log("✅ 已创建首个超级管理员");
    const login = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    return login.token;
  }
}

async function findBySlug(collection: string, slug: string, token: string): Promise<any | null> {
  const q = `/api/${collection}?limit=1&where[slug][equals]=${encodeURIComponent(slug)}`;
  const data = await request(q, undefined, token);
  return data?.docs?.[0] || null;
}

async function main() {
  const token = await ensureAdminToken();

  let brand = await findBySlug("brands", "babyzen", token);
  if (!brand) {
    brand = unwrapDoc(await request(
      "/api/brands",
      {
        method: "POST",
        body: JSON.stringify({
          name: "Babyzen",
          slug: "babyzen",
          country: "法国",
          intro: "全球超轻婴儿推车领导品牌，以 YOYO 系列闻名。",
        }),
      },
      token,
    ));
    console.log(`✅ 品牌已创建 id=${brand.id}`);
  } else {
    console.log(`ℹ️  品牌已存在 id=${brand.id}`);
  }

  let category = await findBySlug("categories", "stroller-lightweight", token);
  if (!category) {
    category = unwrapDoc(await request(
      "/api/categories",
      {
        method: "POST",
        body: JSON.stringify({
          name: "轻便婴儿推车",
          slug: "stroller-lightweight",
          kind: "stroller",
          ageRange: "0–3岁",
        }),
      },
      token,
    ));
    console.log(`✅ 品类已创建 id=${category.id}`);
  } else {
    console.log(`ℹ️  品类已存在 id=${category.id}`);
  }

  let product = await findBySlug("products", "babyzen-yoyo2-6", token);
  if (!product) {
    product = unwrapDoc(await request(
      "/api/products",
      {
        method: "POST",
        body: JSON.stringify({
          modelName: "Babyzen YOYO² 6+",
          slug: "babyzen-yoyo2-6",
          brand: brand.id,
          category: category.id,
          msrpCNY: 3280,
          certifications: ["en1888"],
          params: {
            weightKg: 6.4,
            loadKg: 22,
            foldedSize: "52×44×18cm",
            expandedSize: "52×44×89cm",
            reclineDeg: 165,
            bidirectional: false,
          },
          _status: "published",
        }),
      },
      token,
    ));
    console.log(`✅ 产品已创建 id=${product.id}`);
  } else {
    console.log(`ℹ️  产品已存在 id=${product.id}`);
  }

  const scores = { safety: 9, comfort: 8, portability: 10, function: 8, value: 7 };
  const expected = Math.round((scores.safety * 0.3 + scores.comfort * 0.25 + scores.portability * 0.15 + scores.function * 0.2 + scores.value * 0.1) * 10) / 10;

  let review = await findBySlug("reviews", "yoyo2-6-single-2026", token);
  if (!review) {
    review = unwrapDoc(await request(
      "/api/reviews",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Babyzen YOYO² 6+ 单品实测（Single Review）2026",
          slug: "yoyo2-6-single-2026",
          type: "single",
          status: "published",
          publishedAt: new Date().toISOString(),
          products: [product.id],
          scores,
          _status: "published",
        }),
      },
      token,
    ));
    console.log(`✅ 评测已创建 id=${review.id}`);
  } else {
    console.log(`ℹ️  评测已存在 id=${review.id}`);
  }

  // 重新读取，确保拿到 hook 计算后的 scoreOverall
  const check = await request(`/api/reviews/${review.id}`, undefined, token);
  const got = Number(check?.scoreOverall);
  const pass = got === expected;
  console.log(`   期望 scoreOverall=${expected}  实际=${got}  ${pass ? "✅ 加权公式正确" : "❌ 公式异常"}`);

  if (!pass) throw new Error("scoreOverall mismatch");
}

main()
  .then(() => {
    console.log("🎉 种子脚本执行完成");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
