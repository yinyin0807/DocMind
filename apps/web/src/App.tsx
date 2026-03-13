import { useEffect, useMemo, useState } from "react";

type ViewMode = "welcome" | "workspace";
type ContentTab = "overview" | "abstract" | "summary" | "translation" | "citation" | "records";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type PaperListItem = {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  tags: string[];
  status: string;
  note: string;
};

type PaperDetail = {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  doi: string | null;
  language: string;
  focus: string;
  is_favorite: boolean;
  reading_status: string;
  tags: string[];
};

type PaperAnalysis = {
  paper_id: string;
  abstract_raw: string | null;
  summary_short: string | null;
  summary_long: string | null;
  research_problem: string | null;
  method: string | null;
  dataset: string | null;
  results: string | null;
  innovation: string | null;
  limitations: string | null;
  translations: {
    title_zh: string | null;
    abstract_zh: string | null;
    summary_zh: string | null;
  };
  citations: {
    gbt: string | null;
    apa: string | null;
    ieee: string | null;
    mla: string | null;
  };
  records: string[];
};

type ChatHistory = {
  session: {
    id: string;
    paper_id: string;
    title: string;
  };
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }>;
};

type ChatAskResponse = {
  session: {
    id: string;
    paper_id: string;
    title: string;
  };
  user_message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  };
  assistant_message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  };
};

type PaperImportResponse = {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  focus: string;
  tags: string[];
  status: string;
  note: string;
  stored_filename: string;
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

const quickQuestionMap: Record<string, string[]> = {
  "paper-1": [
    "这篇论文的核心贡献是什么？",
    "它使用了什么数据集？",
    "这项方法的局限性有哪些？",
    "它与传统语义检索相比改进在哪里？",
  ],
  "paper-2": [
    "这篇综述主要分了哪几类问题？",
    "作者如何定义可信学术写作支持？",
    "它有哪些值得引用的框架性观点？",
    "这篇论文适合作为相关工作引用吗？",
  ],
  "paper-3": [
    "这篇论文为什么强调证据定位？",
    "它的 benchmark 有什么特别之处？",
    "这篇论文对 DocMind 的问答设计有什么启发？",
    "它比较了哪些方法路线？",
  ],
};

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function mapMessages(messages: ChatHistory["messages"]): Message[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: formatTimestamp(message.created_at),
  }));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function renderTabContent(activeAnalysis: PaperAnalysis | null, activeTab: ContentTab) {
  if (!activeAnalysis) {
    return (
      <article className="text-panel">
        <p>当前论文分析内容还未加载。</p>
      </article>
    );
  }

  const citationEntries = [
    { label: "GB/T 7714", content: activeAnalysis.citations.gbt },
    { label: "APA", content: activeAnalysis.citations.apa },
    { label: "IEEE", content: activeAnalysis.citations.ieee },
    { label: "MLA", content: activeAnalysis.citations.mla },
  ].filter((item) => item.content);

  switch (activeTab) {
    case "overview":
      return (
        <div className="overview-grid">
          <article className="info-card emphasis-card">
            <span className="section-kicker">一句话总结</span>
            <p>{activeAnalysis.summary_short ?? "暂无总结"}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">研究问题</span>
            <p>{activeAnalysis.research_problem ?? "暂无内容"}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">核心方法</span>
            <p>{activeAnalysis.method ?? "暂无内容"}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">数据与实验</span>
            <p>{activeAnalysis.dataset ?? "暂无内容"}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">主要结果</span>
            <p>{activeAnalysis.results ?? "暂无内容"}</p>
          </article>
          <article className="info-card">
            <span className="section-kicker">创新点</span>
            <p>{activeAnalysis.innovation ?? "暂无内容"}</p>
          </article>
          <article className="info-card full-width-card">
            <span className="section-kicker">局限性</span>
            <p>{activeAnalysis.limitations ?? "暂无内容"}</p>
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
          <p>{activeAnalysis.abstract_raw ?? "暂无摘要"}</p>
        </article>
      );
    case "summary":
      return (
        <div className="stack-panel">
          <article className="text-panel">
            <span className="section-kicker">简洁版</span>
            <p>{activeAnalysis.summary_short ?? "暂无总结"}</p>
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
            <p>{activeAnalysis.summary_long ?? "暂无总结"}</p>
          </article>
        </div>
      );
    case "translation":
      return (
        <div className="stack-panel">
          <article className="text-panel">
            <span className="section-kicker">标题翻译</span>
            <p>{activeAnalysis.translations.title_zh ?? "暂无翻译"}</p>
          </article>
          <article className="text-panel prose-panel">
            <span className="section-kicker">摘要翻译</span>
            <p>{activeAnalysis.translations.abstract_zh ?? "暂无翻译"}</p>
          </article>
          <article className="text-panel prose-panel">
            <span className="section-kicker">总结翻译</span>
            <p>{activeAnalysis.translations.summary_zh ?? "暂无翻译"}</p>
          </article>
        </div>
      );
    case "citation":
      return (
        <div className="stack-panel citation-stack">
          {citationEntries.map((citation) => (
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
            {activeAnalysis.records.map((record) => (
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
  const [paperList, setPaperList] = useState<PaperListItem[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(filterTabs[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ContentTab>("overview");
  const [draftQuestion, setDraftQuestion] = useState("");
  const [activePaperDetail, setActivePaperDetail] = useState<PaperDetail | null>(null);
  const [activePaperAnalysis, setActivePaperAnalysis] = useState<PaperAnalysis | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isPaperLoading, setIsPaperLoading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [paperError, setPaperError] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTitle, setImportTitle] = useState("");
  const [importAuthors, setImportAuthors] = useState("");
  const [importYear, setImportYear] = useState("");
  const [importVenue, setImportVenue] = useState("");
  const [importFocus, setImportFocus] = useState("");
  const [importTags, setImportTags] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPaperList() {
      setIsListLoading(true);
      setListError(null);
      try {
        const payload = await fetchJson<{ items: PaperListItem[] }>("/api/papers");
        if (!isMounted) {
          return;
        }
        setPaperList(payload.items);
        setSelectedPaperId((current) => current ?? payload.items[0]?.id ?? null);
      } catch {
        if (isMounted) {
          setListError("论文列表加载失败，请确认后端服务已启动。");
        }
      } finally {
        if (isMounted) {
          setIsListLoading(false);
        }
      }
    }

    void loadPaperList();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPaperId) {
      return;
    }

    let isMounted = true;

    async function loadPaperWorkspace() {
      setIsPaperLoading(true);
      setPaperError(null);
      try {
        const [detail, analysis, chat] = await Promise.all([
          fetchJson<PaperDetail>(`/api/papers/${selectedPaperId}`),
          fetchJson<PaperAnalysis>(`/api/papers/${selectedPaperId}/analysis`),
          fetchJson<ChatHistory>(`/api/papers/${selectedPaperId}/chat`),
        ]);

        if (!isMounted) {
          return;
        }

        setActivePaperDetail(detail);
        setActivePaperAnalysis(analysis);
        setMessages(mapMessages(chat.messages));
      } catch {
        if (isMounted) {
          setPaperError("论文详情加载失败，请稍后重试。");
        }
      } finally {
        if (isMounted) {
          setIsPaperLoading(false);
        }
      }
    }

    void loadPaperWorkspace();

    return () => {
      isMounted = false;
    };
  }, [selectedPaperId]);

  const visiblePapers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return paperList.filter((paper) => {
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
  }, [activeFilter, paperList, searchTerm]);

  const activePaperListItem =
    visiblePapers.find((paper) => paper.id === selectedPaperId) ??
    paperList.find((paper) => paper.id === selectedPaperId) ??
    null;

  const quickQuestions = quickQuestionMap[selectedPaperId ?? ""] ?? [
    "这篇论文的核心贡献是什么？",
    "它使用了什么数据集？",
    "这篇论文的局限性有哪些？",
  ];

  const handlePaperSelect = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActiveTab("overview");
  };

  const handleEnterWorkspace = () => {
    setViewMode("workspace");
  };

  const handleQuestionSubmit = async () => {
    const question = draftQuestion.trim();
    if (!selectedPaperId || question.length === 0) {
      return;
    }

    setIsAsking(true);
    try {
      const payload = await fetchJson<ChatAskResponse>(`/api/papers/${selectedPaperId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      setMessages((current) => [
        ...current,
        {
          id: payload.user_message.id,
          role: payload.user_message.role,
          content: payload.user_message.content,
          timestamp: formatTimestamp(payload.user_message.created_at),
        },
        {
          id: payload.assistant_message.id,
          role: payload.assistant_message.role,
          content: payload.assistant_message.content,
          timestamp: formatTimestamp(payload.assistant_message.created_at),
        },
      ]);
      setDraftQuestion("");
    } catch {
      setPaperError("提问失败，请确认后端服务正常运行。");
    } finally {
      setIsAsking(false);
    }
  };

  const handleImportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!importFile) {
      setImportError("请先选择一个 PDF 文件。");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);
    if (importTitle.trim()) formData.append("title", importTitle.trim());
    if (importAuthors.trim()) formData.append("authors", importAuthors.trim());
    if (importYear.trim()) formData.append("year", importYear.trim());
    if (importVenue.trim()) formData.append("venue", importVenue.trim());
    if (importFocus.trim()) formData.append("focus", importFocus.trim());
    if (importTags.trim()) formData.append("tags", importTags.trim());

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const created = await fetchJson<PaperImportResponse>("/api/papers/import", {
        method: "POST",
        body: formData,
      });
      const payload = await fetchJson<{ items: PaperListItem[] }>("/api/papers");
      setPaperList(payload.items);
      setSelectedPaperId(created.id);
      setActiveTab("overview");
      setImportSuccess(`论文已导入：${created.title}`);
      setImportFile(null);
      setImportTitle("");
      setImportAuthors("");
      setImportYear("");
      setImportVenue("");
      setImportFocus("");
      setImportTags("");
    } catch {
      setImportError("导入失败，请确认后端服务正常运行，并上传 PDF 文件。");
    } finally {
      setIsImporting(false);
    }
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
            {featureCards.map((feature, index) => (
              <article className="feature-card" key={feature}>
                <span className="feature-index">0{index + 1}</span>
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
          <button className="soft-button" type="button" onClick={() => setIsImportOpen((current) => !current)}>
            {isImportOpen ? "收起导入" : "导入论文"}
          </button>
          <button className="primary-button" type="button">
            最近任务
          </button>
        </div>
      </header>

      {isImportOpen ? (
        <section className="import-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">Paper Import</span>
              <h3>上传本地 PDF 论文</h3>
            </div>
          </div>
          <form className="import-form" onSubmit={handleImportSubmit}>
            <label className="import-field import-field-full">
              <span>PDF 文件</span>
              <input
                accept=".pdf,application/pdf"
                type="file"
                onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <label className="import-field">
              <span>标题</span>
              <input value={importTitle} onChange={(event) => setImportTitle(event.target.value)} placeholder="默认使用文件名" />
            </label>
            <label className="import-field">
              <span>作者</span>
              <input value={importAuthors} onChange={(event) => setImportAuthors(event.target.value)} placeholder="可选" />
            </label>
            <label className="import-field">
              <span>年份</span>
              <input value={importYear} onChange={(event) => setImportYear(event.target.value)} placeholder="例如 2026" />
            </label>
            <label className="import-field">
              <span>来源</span>
              <input value={importVenue} onChange={(event) => setImportVenue(event.target.value)} placeholder="例如 arXiv / ACL" />
            </label>
            <label className="import-field import-field-full">
              <span>研究焦点</span>
              <input value={importFocus} onChange={(event) => setImportFocus(event.target.value)} placeholder="导入后显示在右侧元信息区" />
            </label>
            <label className="import-field import-field-full">
              <span>标签</span>
              <input value={importTags} onChange={(event) => setImportTags(event.target.value)} placeholder="多个标签用逗号分隔，例如：综述,待精读" />
            </label>
            <div className="import-actions import-field-full">
              <button className="primary-button" disabled={isImporting} type="submit">
                {isImporting ? "导入中..." : "开始导入"}
              </button>
              {importError ? <p className="form-status is-error">{importError}</p> : null}
              {importSuccess ? <p className="form-status is-success">{importSuccess}</p> : null}
            </div>
          </form>
        </section>
      ) : null}

      <section className="workspace-layout">
        <aside className="sidebar-panel">
          <div className="sidebar-head">
            <div>
              <span className="section-kicker">Paper Library</span>
              <h2>我的论文</h2>
            </div>
            <div className="sidebar-stats">
              <span>{paperList.length} 篇论文</span>
              <span>{paperList.filter((paper) => paper.status === "已总结").length} 篇已总结</span>
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
            {isListLoading ? (
              <div className="empty-state">
                <strong>正在加载论文列表</strong>
                <p>请稍候，正在从后端读取数据。</p>
              </div>
            ) : listError ? (
              <div className="empty-state">
                <strong>列表加载失败</strong>
                <p>{listError}</p>
              </div>
            ) : visiblePapers.length > 0 ? (
              visiblePapers.map((paper) => (
                <button
                  className={paper.id === activePaperListItem?.id ? "paper-item is-active" : "paper-item"}
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
              <h1>{activePaperDetail?.title ?? "正在加载论文"}</h1>
              <p>{activePaperDetail?.authors ?? ""}</p>
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
              <strong>{activePaperDetail?.venue ?? "暂无信息"}</strong>
            </div>
            <div>
              <span className="meta-label">研究焦点</span>
              <strong>{activePaperDetail?.focus ?? "暂无信息"}</strong>
            </div>
            <div>
              <span className="meta-label">标签</span>
              <div className="meta-tags">
                {(activePaperDetail?.tags ?? []).map((tag) => (
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

          <section className="content-panel">
            {isPaperLoading ? (
              <article className="text-panel">
                <p>正在加载当前论文内容...</p>
              </article>
            ) : paperError ? (
              <article className="text-panel">
                <p>{paperError}</p>
              </article>
            ) : (
              renderTabContent(activePaperAnalysis, activeTab)
            )}
          </section>

          <section className="chat-panel">
            <div className="chat-header">
              <div>
                <span className="section-kicker">Paper Chat</span>
                <h2>围绕当前论文提问</h2>
              </div>
              <p>当前提问默认只针对这篇论文，当前已切到真实后端接口。</p>
            </div>

            <div className="quick-question-row">
              {quickQuestions.map((question) => (
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
              {messages.map((message) => (
                <article
                  className={message.role === "assistant" ? "message-bubble assistant" : "message-bubble user"}
                  key={message.id}
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
              <button className="primary-button" type="button" onClick={handleQuestionSubmit} disabled={isAsking}>
                {isAsking ? "发送中..." : "发送问题"}
              </button>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
