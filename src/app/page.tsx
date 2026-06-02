export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 720, margin: "60px auto", padding: "0 16px", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>童车评测实验室 · 后台已就位</h1>
      <p style={{ color: "#555" }}>
        Payload CMS 项目骨架已搭建完成。前台页面尚未实现,当前阶段先专注后台数据建模与会员注册主流程。
      </p>
      <ul style={{ marginTop: 20 }}>
        <li>🛠 后台管理:<a href="/admin">/admin</a>(首次访问会引导创建超级管理员)</li>
        <li>📡 REST API:<code>/api/{`{collection}`}</code>(如 <code>/api/products</code>)</li>
        <li>📐 静态原型:<code>cbike_show/prototype/index.html</code></li>
      </ul>
      <p style={{ marginTop: 30, fontSize: 13, color: "#888" }}>
        本页仅占位,正式前台将按 <code>Site-IA-V1.0.md</code> 的路由表实现。
      </p>
    </main>
  );
}
