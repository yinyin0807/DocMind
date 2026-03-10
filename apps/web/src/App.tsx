const productPrinciples = [
  "原始摘要和论文总结同时保留，避免 AI 输出替代原文。",
  "翻译能力作为一等功能处理，优先覆盖标题、摘要和总结。",
  "所有高风险分析能力都走任务化设计，避免前端直接耦合模型调用。",
];

const mvpModules = [
  "论文导入与解析",
  "文献管理与检索",
  "单篇总结、摘要对比与翻译",
  "引文生成",
  "基础问答与多论文对比",
];

const plannedApi = [
  "GET /health",
  "GET /api/papers",
  "POST /api/papers",
  "GET /api/tasks",
  "POST /api/tasks",
];

export function App() {
  return (
    <main className="page">
      <section className="hero">
        <span className="badge">DocMind MVP Skeleton</span>
        <h1>论文管理与智能分析平台</h1>
        <p className="lead">
          当前页面不是最终产品，而是项目骨架的可视化入口。它明确展示了 MVP
          边界、核心模块和接口分层，便于后续按需求文档推进实现。
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>产品约束</h2>
          <ul>
            {productPrinciples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>MVP 模块</h2>
          <ul>
            {mvpModules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card api-card">
        <h2>后端初始接口</h2>
        <div className="api-list">
          {plannedApi.map((item) => (
            <code key={item}>{item}</code>
          ))}
        </div>
      </section>
    </main>
  );
}
