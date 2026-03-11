import { useMemo, useState } from "react";

type ViewMode = "welcome" | "workspace";
type ContentTab = "overview" | "abstract" | "summary" | "translation" | "citation" | "records";
type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// 前端当前完全依赖本地 mock 数据，Paper 类型就是这版工作台的数据契约。
type Paper = {
  id: string;
  title: string;
  authors: string;
  year: string;
  venue: string;
  tags: string[];
  status: string;
  note: string;
  focus: string;
  abstract: string;
  summaryShort: string;
  summaryLong: string;
  researchProblem: string;
  method: string;
  dataset: string;
  results: string;
  innovation: string;
  limitations: string;
  translationTitle: string;
  translationAbstract: string;
  translationSummary: string;
  citations: { label: string; content: string }[];
  records: string[];
  quickQuestions: string[];
  messages: Message[];
};

const valueCards = [
  {
    title: "原文与 AI 结果并存",
    text: "保留论文原始摘要，同时提供结构化总结，避免把系统输出伪装成论文原文。",
  },
  {
    title: "论文库成为知识资产",
    text: "论文不只是文件列表，而是可检索、可比较、可追问、可继续沉淀的研究材料。",
  },
  {
    title: "单工作台完成主要任务",
    text: "阅读、总结、翻译、引文和问答放在同一空间完成，减少科研流程中的上下文切换。",
  },
];

const featureCards = [
  "论文导入与管理",
  "单篇论文总结",
  "原始摘要对照",
  "中英翻译",
  "对话式问答",
  "多论文对比与综述",
  "引文生成",
  "结果记录沉淀",
];

const filterTabs = ["全部", "最近阅读", "收藏", "待精读", "已总结"];

const contentTabs: { id: ContentTab; label: string }[] = [
  { id: "overview", label: "概览" },
  { id: "abstract", label: "原始摘要" },
  { id: "summary", label: "AI 总结" },
  { id: "translation", label: "翻译" },
  { id: "citation", label: "引文" },
  { id: "records", label: "记录" },
];

// 这批 mock 数据用于同时驱动左侧论文列表、右侧详情标签和底部对话区。
const papers: Paper[] = [
  {
    id: "paper-1",
    title: "Graph Contrastive Learning for Scientific Literature Retrieval",
    authors: "Lina Zhao, Wei Sun, Hao Li",
    year: "2024",
    venue: "ACL Findings",
    tags: ["图学习", "检索", "待精读"],
    status: "已总结",
    note: "有 6 条问答记录",
    focus: "围绕科研语料检索与表示学习",
    abstract:
      "This paper studies scientific literature retrieval with graph contrastive learning. The authors construct a citation-aware graph and align semantic embeddings with citation structure to improve retrieval quality under sparse supervision.",
    summaryShort: "论文提出结合语义表征与引文图结构的检索框架，用于提升科研文献检索效果。",
    summaryLong:
      "作者以科研文献检索为目标，构建了结合文本语义与引文关系的图对比学习框架。核心思路是让语义相近且引文结构相关的论文在嵌入空间中更接近，从而提升在监督信号较弱场景下的召回与排序质量。实验显示该方法在多个学术语料数据集上优于传统双塔检索模型。",
    researchProblem: "如何在监督较弱、论文关系复杂的情况下提升科研文献检索质量。",
    method: "构建 citation-aware graph，并通过 graph contrastive learning 对文本表示和引文结构进行联合建模。",
    dataset: "SciDocs、OpenAlex 子集、自建引文图数据。",
    results: "在 Recall@20 与 nDCG 指标上优于基线模型，尤其在长尾主题检索中更稳定。",
    innovation: "把引文结构视为语义学习的重要监督来源，并将其显式纳入检索表示学习。",
    limitations: "依赖引文图质量；对缺少结构信息的新论文支持有限；训练成本较高。",
    translationTitle: "面向科研文献检索的图对比学习方法",
    translationAbstract:
      "本文研究了科研文献检索任务。作者构建了一个考虑引文关系的图结构，并将语义嵌入与引文结构对齐，以在弱监督条件下提升检索质量。",
    translationSummary:
      "该论文通过联合学习文本语义和引文图关系，提高了科研论文检索中的召回与排序效果，特别适合监督信号不足的场景。",
    citations: [
      {
        label: "GB/T 7714",
        content:
          "Zhao L, Sun W, Li H. Graph Contrastive Learning for Scientific Literature Retrieval[C]//Findings of ACL. 2024.",
      },
      {
        label: "APA",
        content:
          "Zhao, L., Sun, W., & Li, H. (2024). Graph Contrastive Learning for Scientific Literature Retrieval. Findings of ACL.",
      },
      {
        label: "IEEE",
        content:
          "L. Zhao, W. Sun, and H. Li, \"Graph Contrastive Learning for Scientific Literature Retrieval,\" in Findings of ACL, 2024.",
      },
      {
        label: "MLA",
        content:
          "Zhao, Lina, et al. \"Graph Contrastive Learning for Scientific Literature Retrieval.\" Findings of ACL, 2024.",
      },
    ],
    records: [
      "2026-03-10 20:10 生成第一版结构化总结",
      "2026-03-10 20:24 生成中译文摘要",
      "2026-03-10 20:40 回答了“核心贡献是什么”问题",
    ],
    quickQuestions: [
      "这篇论文的核心贡献是什么？",
      "它使用了什么数据集？",
      "这项方法的局限性有哪些？",
      "它与传统语义检索相比改进在哪里？",
    ],
    messages: [
      {
        role: "assistant",
        content: "你正在查看这篇论文。可以直接问我它的研究问题、方法、数据集、结果或局限性。",
        timestamp: "20:10",
      },
      {
        role: "user",
        content: "这篇论文的核心贡献是什么？",
        timestamp: "20:11",
      },
      {
        role: "assistant",
        content: "核心贡献在于把引文图结构当作检索表示学习的重要监督信号，并用图对比学习联合建模文本语义与论文关系。",
        timestamp: "20:11",
      },
    ],
  },
  {
    id: "paper-2",
    title: "Survey of Trustworthy LLMs for Academic Writing Support",
    authors: "Ming Chen, Yutong Guo",
    year: "2025",
    venue: "arXiv",
    tags: ["综述", "LLM", "收藏"],
    status: "待精读",
    note: "暂无问答记录",
    focus: "围绕学术写作支持中的可信大模型",
    abstract:
      "The survey reviews trustworthy large language model techniques for academic writing support, focusing on factual grounding, citation faithfulness, controllability, and human-in-the-loop revision.",
    summaryShort: "这是一篇关于学术写作支持场景下可信大模型的综述论文。",
    summaryLong:
      "论文系统梳理了大模型在学术写作辅助中的关键可信性问题，包括事实依据、引用一致性、可控生成和人工校验机制。作者认为，如果没有证据绑定与人工修订闭环，LLM 很难直接服务于高严谨性的科研写作。",
    researchProblem: "如何让大模型在学术写作支持场景下具备可验证性与可控性。",
    method: "综述式整理，按事实性、引文忠实性、可控性、人机协同四个方向归纳方法。",
    dataset: "无统一实验数据集，主要整理现有方法与评测基准。",
    results: "提出了可信学术写作助手的分析框架，并总结当前评测缺口。",
    innovation: "从科研写作场景出发，对 trustworthy LLMs 做了更贴近学术工作流的框架化整理。",
    limitations: "更多是框架性综述，缺少统一实验复现；部分结论依赖已有论文质量。",
    translationTitle: "面向学术写作支持的可信大模型综述",
    translationAbstract:
      "该综述围绕学术写作支持中的可信大模型技术展开，重点讨论事实依据、引文忠实性、可控生成和人工参与修订。",
    translationSummary:
      "论文指出，若缺乏证据绑定和人工修订闭环，大模型难以直接满足科研写作的严谨要求。",
    citations: [
      {
        label: "GB/T 7714",
        content: "Chen M, Guo Y. Survey of Trustworthy LLMs for Academic Writing Support[EB/OL]. arXiv, 2025.",
      },
      {
        label: "APA",
        content: "Chen, M., & Guo, Y. (2025). Survey of Trustworthy LLMs for Academic Writing Support. arXiv.",
      },
      {
        label: "IEEE",
        content: "M. Chen and Y. Guo, \"Survey of Trustworthy LLMs for Academic Writing Support,\" arXiv, 2025.",
      },
      {
        label: "MLA",
        content: "Chen, Ming, and Yutong Guo. \"Survey of Trustworthy LLMs for Academic Writing Support.\" arXiv, 2025.",
      },
    ],
    records: [
      "2026-03-09 22:15 保存到“可信科研助手”分组",
      "2026-03-09 22:18 标记为收藏",
      "2026-03-09 22:20 待补充问答记录",
    ],
    quickQuestions: [
      "这篇综述主要分了哪几类问题？",
      "作者如何定义可信学术写作支持？",
      "它有哪些值得引用的框架性观点？",
      "这篇论文适合作为相关工作引用吗？",
    ],
    messages: [
      {
        role: "assistant",
        content: "当前论文还没有历史问答。你可以从可信性框架、评测缺口或引文忠实性问题开始提问。",
        timestamp: "19:58",
      },
    ],
  },
  {
    id: "paper-3",
    title: "Multilingual Evidence Grounding for Paper Question Answering",
    authors: "Ananya Rao, Qifan Xu, Peng Lu",
    year: "2023",
    venue: "EMNLP",
    tags: ["问答", "多语言", "已读"],
    status: "已总结",
    note: "有证据片段记录",
    focus: "围绕多语言论文问答与证据定位",
    abstract:
      "We introduce a multilingual paper question answering benchmark with evidence grounding, enabling systems to answer research questions while citing paragraph-level evidence across English and Chinese papers.",
    summaryShort: "论文提出多语言论文问答基准，并强调答案必须附带证据定位。",
    summaryLong:
      "作者构建了一个覆盖中英论文的问答基准，要求系统不仅回答问题，还要定位段落级证据。论文的重点不只是提升回答准确率，更强调科研场景中证据可追溯的重要性。结果表明，纯生成式方法在缺乏检索支撑时较容易出现无依据回答。",
    researchProblem: "如何在多语言论文问答中兼顾回答质量与证据可追溯性。",
    method: "构建多语言 benchmark，并比较生成式、检索增强式和证据监督式方法。",
    dataset: "自建中英论文问答数据集，附带 paragraph-level evidence annotations。",
    results: "证据监督式方法在答案可靠性和可解释性上明显更好。",
    innovation: "把多语言问答与证据定位放到同一评测框架中。",
    limitations: "标注成本高；证据粒度仍以段落为主；跨领域迁移能力待验证。",
    translationTitle: "面向论文问答的多语言证据绑定方法",
    translationAbstract:
      "本文提出一个带证据定位的多语言论文问答基准，使系统能够在中英文论文中回答研究问题并引用段落级证据。",
    translationSummary:
      "该工作强调，科研问答不仅需要回答正确，还必须明确给出证据来源。",
    citations: [
      {
        label: "GB/T 7714",
        content: "Rao A, Xu Q, Lu P. Multilingual Evidence Grounding for Paper Question Answering[C]//EMNLP. 2023.",
      },
      {
        label: "APA",
        content: "Rao, A., Xu, Q., & Lu, P. (2023). Multilingual Evidence Grounding for Paper Question Answering. EMNLP.",
      },
      {
        label: "IEEE",
        content: "A. Rao, Q. Xu, and P. Lu, \"Multilingual Evidence Grounding for Paper Question Answering,\" in EMNLP, 2023.",
      },
      {
        label: "MLA",
        content: "Rao, Ananya, et al. \"Multilingual Evidence Grounding for Paper Question Answering.\" EMNLP, 2023.",
      },
    ],
    records: [
      "2026-03-08 18:30 导入论文元数据",
      "2026-03-08 18:42 生成对比候选卡片",
      "2026-03-08 19:05 记录证据绑定思路",
    ],
    quickQuestions: [
      "这篇论文为什么强调证据定位？",
      "它的 benchmark 有什么特别之处？",
      "这篇论文对 DocMind 的问答设计有什么启发？",
      "它比较了哪些方法路线？",
    ],
    messages: [
      {
        role: "assistant",
        content: "你可以把这篇论文当作 DocMind 问答模块的参考论文，尤其关注证据返回和多语言设计。",
        timestamp: "18:42",
      },
      {
        role: "user",
        content: "这篇论文对我们的产品有什么启发？",
        timestamp: "18:44",
      },
      {
        role: "assistant",
        content: "最大的启发是：科研问答必须绑定证据，而不是只给流畅答案。这正对应需求文档里对可追溯性的要求。",
        timestamp: "18:45",
      },
    ],
  },
];

// 右侧主内容区只由两个状态控制：当前论文 + 当前标签。
function renderTabContent(activePaper: Paper, activeTab: ContentTab) {
  switch (activeTab) {
    case "overview":
      return (
        <div className="overview-grid">
          <article className="info-card emphasis-card">
            <span className="section-kicker">一句话总结</span>
            <p>{activePaper.summaryShort}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">研究问题</span>
            <p>{activePaper.researchProblem}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">核心方法</span>
            <p>{activePaper.method}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">数据与实验</span>
            <p>{activePaper.dataset}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">主要结果</span>
            <p>{activePaper.results}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">创新点</span>
            <p>{activePaper.innovation}</p>
          </article>
          <article className="info-card full-width-card">
            <span className="section-kicker">局限性</span>
            <p>{activePaper.limitations}</p>
          </article>
        </div>
      );
    case "abstract":
      return (
        <article className="text-panel prose-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">原始摘要</span>
              <h3>论文原文摘要</h3>
            </div>
            <button className="ghost-action" type="button">
              复制摘要
            </button>
          </div>
          <p>{activePaper.abstract}</p>
        </article>
      );
    case "summary":
      return (
        <div className="stack-panel">
          <article className="text-panel">
            <span className="section-kicker">简洁版</span>
            <p>{activePaper.summaryShort}</p>
          </article>
          <article className="text-panel prose-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">详细版</span>
                <h3>结构化论文总结</h3>
              </div>
              <button className="ghost-action" type="button">
                重新生成
              </button>
            </div>
            <p>{activePaper.summaryLong}</p>
          </article>
        </div>
      );
    case "translation":
      return (
        <div className="stack-panel">
          <article className="text-panel">
            <span className="section-kicker">标题翻译</span>
            <p>{activePaper.translationTitle}</p>
          </article>
          <article className="text-panel prose-panel">
            <span className="section-kicker">摘要翻译</span>
            <p>{activePaper.translationAbstract}</p>
          </article>
          <article className="text-panel prose-panel">
            <span className="section-kicker">总结翻译</span>
            <p>{activePaper.translationSummary}</p>
          </article>
        </div>
      );
    case "citation":
      return (
        <div className="stack-panel citation-stack">
          {activePaper.citations.map((citation) => (
            <article className="text-panel citation-row" key={citation.label}>
              <div>
                <span className="section-kicker">{citation.label}</span>
                <p>{citation.content}</p>
              </div>
              <button className="ghost-action" type="button">
                复制
              </button>
            </article>
          ))}
        </div>
      );
    case "records":
      return (
        <article className="text-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">相关记录</span>
              <h3>近期操作沉淀</h3>
            </div>
          </div>
          <ul className="timeline-list">
            {activePaper.records.map((record) => (
              <li key={record}>{record}</li>
            ))}
          </ul>
        </article>
      );
    default:
      return null;
  }
}

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("welcome");
  const [selectedPaperId, setSelectedPaperId] = useState(papers[0].id);
  const [activeFilter, setActiveFilter] = useState(filterTabs[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ContentTab>("overview");
  const [draftQuestion, setDraftQuestion] = useState("");

  // ???????????????????????????????
  // ??????????????????????????????.
  // 左侧列表的搜索和筛选只影响可见列表，不直接改写右侧工作区数据。
  const visiblePapers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return papers.filter((paper) => {
      const matchesQuery =
        query.length === 0 ||
        paper.title.toLowerCase().includes(query) ||
        paper.authors.toLowerCase().includes(query) ||
        paper.tags.some((tag) => tag.toLowerCase().includes(query));

      const matchesFilter =
        activeFilter === "全部" ||
        (activeFilter === "最近阅读" && paper.tags.includes("已读")) ||
        (activeFilter === "收藏" && paper.tags.includes("收藏")) ||
        (activeFilter === "待精读" && paper.tags.includes("待精读")) ||
        (activeFilter === "已总结" && paper.status === "已总结");

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, searchTerm]);

  // ??????????????????????????????????????
  // ?????????????????????????????????????.
  // 如果当前筛选把已选论文过滤掉，右侧仍退回到最近一次有效论文，避免工作区闪空。
  const activePaper =
    visiblePapers.find((paper) => paper.id === selectedPaperId) ??
    papers.find((paper) => paper.id === selectedPaperId) ??
    papers[0];

  const handlePaperSelect = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActiveTab("overview");
  };

  const handleEnterWorkspace = () => {
    setViewMode("workspace");
  };

  const handleQuestionSubmit = () => {
    setDraftQuestion("");
  };

  if (viewMode === "welcome") {
    return (
      <main className="shell shell-welcome">
        <section className="welcome-nav">
          <div className="brand-block">
            <span className="brand-mark">DM</span>
            <div>
              <strong>DocMind</strong>
              <p>面向科研人员的论文管理与智能分析平台</p>
            </div>
          </div>
          <div className="nav-links">
            <a href="#value">产品说明</a>
            <a href="#features">功能概览</a>
            <button className="primary-button" type="button" onClick={handleEnterWorkspace}>
              进入工作台
            </button>
          </div>
        </section>

        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Research Workspace</span>
            <h1>把论文库变成可阅读、可追问、可沉淀的研究工作台</h1>
            <p>
              DocMind 以论文为中心组织科研工作流。你可以在同一页面里查看原始摘要、AI 总结、翻译、引文和问答记录，而不是在多个工具之间来回切换。
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={handleEnterWorkspace}>
                进入主功能页
              </button>
              <a className="secondary-link" href="#features">
                查看核心功能
              </a>
            </div>
          </div>

          <div className="hero-preview">
            <div className="preview-window">
              <div className="preview-topbar">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-body">
                <aside>
                  <h3>我的论文</h3>
                  <ul>
                    <li className="is-active">Graph Contrastive Learning...</li>
                    <li>Survey of Trustworthy LLMs...</li>
                    <li>Multilingual Evidence Grounding...</li>
                  </ul>
                </aside>
                <section>
                  <div className="preview-card strong-card">
                    <span>概览</span>
                    <p>研究问题、核心方法、结果与局限性</p>
                  </div>
                  <div className="preview-card">
                    <span>对话区</span>
                    <p>围绕当前论文提问与追问</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>

        <section className="value-section" id="value">
          {valueCards.map((card) => (
            <article className="value-card" key={card.title}>
              <span className="section-kicker">核心价值</span>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="feature-section" id="features">
          <div className="section-heading">
            <span className="section-kicker">功能结构</span>
            <h2>欢迎页负责建立认知，主功能页负责完成工作</h2>
            <p>第一阶段先聚焦欢迎页和单页式主工作台，后续再逐步接入上传、对比、综述与真实后端能力。</p>
          </div>
          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article className="feature-card" key={feature}>
                <span className="feature-index">0{featureCards.indexOf(feature) + 1}</span>
                <h3>{feature}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="entry-banner">
          <div>
            <span className="section-kicker">下一步</span>
            <h2>直接进入主工作台，在单篇论文上下文中完成阅读、总结与问答</h2>
          </div>
          <button className="primary-button" type="button" onClick={handleEnterWorkspace}>
            进入主功能页
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell shell-workspace">
      <header className="workspace-topbar">
        <div className="brand-block">
          <span className="brand-mark">DM</span>
          <div>
            <strong>DocMind Workspace</strong>
            <p>围绕当前论文完成阅读、总结、翻译与问答</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="soft-button" type="button" onClick={() => setViewMode("welcome")}>
            返回欢迎页
          </button>
          <button className="soft-button" type="button">
            导入论文
          </button>
          <button className="primary-button" type="button">
            最近任务
          </button>
        </div>
      </header>

      <section className="workspace-layout">
        <aside className="sidebar-panel">
          <div className="sidebar-head">
            <div>
              <span className="section-kicker">Paper Library</span>
              <h2>我的论文</h2>
            </div>
            <div className="sidebar-stats">
              <span>{papers.length} 篇论文</span>
              <span>2 篇已总结</span>
            </div>
          </div>

          <label className="search-box">
            <span>搜索论文</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="输入标题、作者或标签"
            />
          </label>

          <div className="filter-strip">
            {filterTabs.map((filter) => (
              <button
                className={filter === activeFilter ? "filter-pill is-active" : "filter-pill"}
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="paper-list">
            {visiblePapers.length > 0 ? (
              visiblePapers.map((paper) => (
                <button
                  className={paper.id === activePaper.id ? "paper-item is-active" : "paper-item"}
                  key={paper.id}
                  type="button"
                  onClick={() => handlePaperSelect(paper.id)}
                >
                  <div className="paper-item-meta">
                    <span>{paper.year}</span>
                    <span>{paper.status}</span>
                  </div>
                  <strong>{paper.title}</strong>
                  <p>{paper.authors}</p>
                  <div className="paper-item-tags">
                    {paper.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <small>{paper.note}</small>
                </button>
              ))
            ) : (
              <div className="empty-state">
                <strong>没有匹配结果</strong>
                <p>可以尝试修改搜索词或切换筛选条件。</p>
              </div>
            )}
          </div>
        </aside>

        <section className="workspace-main">
          <header className="paper-header-panel">
            <div className="paper-title-block">
              <span className="section-kicker">当前论文</span>
              <h1>{activePaper.title}</h1>
              <p>{activePaper.authors}</p>
            </div>
            <div className="paper-actions">
              <button className="soft-button" type="button">
                生成总结
              </button>
              <button className="soft-button" type="button">
                翻译摘要
              </button>
              <button className="soft-button" type="button">
                复制引文
              </button>
              <button className="soft-button" type="button">
                加入对比
              </button>
            </div>
          </header>

          <section className="paper-meta-band">
            <div>
              <span className="meta-label">来源</span>
              <strong>{activePaper.venue}</strong>
            </div>
            <div>
              <span className="meta-label">研究焦点</span>
              <strong>{activePaper.focus}</strong>
            </div>
            <div>
              <span className="meta-label">标签</span>
              <div className="meta-tags">
                {activePaper.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </section>

          <nav className="content-tabs" aria-label="论文内容切换">
            {contentTabs.map((tab) => (
              <button
                className={tab.id === activeTab ? "content-tab is-active" : "content-tab"}
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <section className="content-panel">{renderTabContent(activePaper, activeTab)}</section>

          <section className="chat-panel">
            <div className="chat-header">
              <div>
                <span className="section-kicker">Paper Chat</span>
                <h2>围绕当前论文提问</h2>
              </div>
              <p>当前提问默认只针对这篇论文，后续再接入真实检索与证据返回。</p>
            </div>

            <div className="quick-question-row">
              {activePaper.quickQuestions.map((question) => (
                <button
                  className="question-chip"
                  key={question}
                  type="button"
                  onClick={() => setDraftQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="message-list">
              {activePaper.messages.map((message, index) => (
                <article
                  className={message.role === "assistant" ? "message-bubble assistant" : "message-bubble user"}
                  key={`${message.timestamp}-${index}`}
                >
                  <header>
                    <strong>{message.role === "assistant" ? "DocMind" : "你"}</strong>
                    <span>{message.timestamp}</span>
                  </header>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>

            <div className="composer">
              <textarea
                value={draftQuestion}
                onChange={(event) => setDraftQuestion(event.target.value)}
                placeholder="例如：这篇论文的核心贡献是什么？"
              />
              <button className="primary-button" type="button" onClick={handleQuestionSubmit}>
                发送问题
              </button>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}



