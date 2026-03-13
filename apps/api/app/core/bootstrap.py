from sqlalchemy import select

from app.core.db import Base, SessionLocal, engine
from app.models.analysis import PaperAnalysis
from app.models.chat import ChatMessage, ChatSession
from app.models.paper import Paper
from app.models.task import Task

SEED_PAPERS = [
    {
        "id": "paper-1",
        "title": "Graph Contrastive Learning for Scientific Literature Retrieval",
        "authors": "Lina Zhao, Wei Sun, Hao Li",
        "year": 2024,
        "venue": "ACL Findings",
        "doi": None,
        "language": "en",
        "focus": "围绕科研语料检索与表示学习",
        "is_favorite": False,
        "reading_status": "reading",
        "status": "已总结",
        "note": "有 6 条问答记录",
        "tags": "图学习,检索,待精读",
        "abstract_raw": "This paper studies scientific literature retrieval with graph contrastive learning. The authors construct a citation-aware graph and align semantic embeddings with citation structure to improve retrieval quality under sparse supervision.",
    },
    {
        "id": "paper-2",
        "title": "Survey of Trustworthy LLMs for Academic Writing Support",
        "authors": "Ming Chen, Yutong Guo",
        "year": 2025,
        "venue": "arXiv",
        "doi": None,
        "language": "en",
        "focus": "围绕学术写作支持中的可信大模型",
        "is_favorite": True,
        "reading_status": "unread",
        "status": "待精读",
        "note": "暂无问答记录",
        "tags": "综述,LLM,收藏",
        "abstract_raw": "The survey reviews trustworthy large language model techniques for academic writing support, focusing on factual grounding, citation faithfulness, controllability, and human-in-the-loop revision.",
    },
    {
        "id": "paper-3",
        "title": "Multilingual Evidence Grounding for Paper Question Answering",
        "authors": "Ananya Rao, Qifan Xu, Peng Lu",
        "year": 2023,
        "venue": "EMNLP",
        "doi": None,
        "language": "en",
        "focus": "围绕多语言论文问答与证据定位",
        "is_favorite": False,
        "reading_status": "done",
        "status": "已总结",
        "note": "有证据片段记录",
        "tags": "问答,多语言,已读",
        "abstract_raw": "We introduce a multilingual paper question answering benchmark with evidence grounding, enabling systems to answer research questions while citing paragraph-level evidence across English and Chinese papers.",
    },
]

SEED_ANALYSES = {
    "paper-1": {
        "summary_short": "论文提出结合语义表征与引文图结构的检索框架，用于提升科研文献检索效果。",
        "summary_long": "作者以科研文献检索为目标，构建了结合文本语义与引文关系的图对比学习框架。核心思路是让语义相近且引文结构相关的论文在嵌入空间中更接近，从而提升在监督信号较弱场景下的召回与排序质量。实验显示该方法在多个学术语料数据集上优于传统双塔检索模型。",
        "research_problem": "如何在监督较弱、论文关系复杂的情况下提升科研文献检索质量。",
        "method": "构建 citation-aware graph，并通过 graph contrastive learning 对文本表示和引文结构进行联合建模。",
        "dataset": "SciDocs、OpenAlex 子集、自建引文图数据。",
        "results": "在 Recall@20 与 nDCG 指标上优于基线模型，尤其在长尾主题检索中更稳定。",
        "innovation": "把引文结构视为语义学习的重要监督来源，并将其显式纳入检索表示学习。",
        "limitations": "依赖引文图质量；对缺少结构信息的新论文支持有限；训练成本较高。",
        "translations": {
            "title_zh": "面向科研文献检索的图对比学习方法",
            "abstract_zh": "本文研究了科研文献检索任务。作者构建了一个考虑引文关系的图结构，并将语义嵌入与引文结构对齐，以在弱监督条件下提升检索质量。",
            "summary_zh": "该论文通过联合学习文本语义和引文图关系，提高了科研论文检索中的召回与排序效果，特别适合监督信号不足的场景。",
        },
        "citations": {
            "gbt": "Zhao L, Sun W, Li H. Graph Contrastive Learning for Scientific Literature Retrieval[C]//Findings of ACL. 2024.",
            "apa": "Zhao, L., Sun, W., & Li, H. (2024). Graph Contrastive Learning for Scientific Literature Retrieval. Findings of ACL.",
            "ieee": "L. Zhao, W. Sun, and H. Li, \"Graph Contrastive Learning for Scientific Literature Retrieval,\" in Findings of ACL, 2024.",
            "mla": "Zhao, Lina, et al. \"Graph Contrastive Learning for Scientific Literature Retrieval.\" Findings of ACL, 2024.",
        },
        "records": [
            "2026-03-10 20:10 生成第一版结构化总结",
            "2026-03-10 20:24 生成中译文摘要",
            "2026-03-10 20:40 回答了“核心贡献是什么”问题",
        ],
    },
    "paper-2": {
        "summary_short": "这是一篇关于学术写作支持场景下可信大模型的综述论文。",
        "summary_long": "论文系统梳理了大模型在学术写作辅助中的关键可信性问题，包括事实依据、引用一致性、可控生成和人工校验机制。作者认为，如果没有证据绑定与人工修订闭环，LLM 很难直接服务于高严谨性的科研写作。",
        "research_problem": "如何让大模型在学术写作支持场景下具备可验证性与可控性。",
        "method": "综述式整理，按事实性、引文忠实性、可控性、人机协同四个方向归纳方法。",
        "dataset": "无统一实验数据集，主要整理现有方法与评测基准。",
        "results": "提出了可信学术写作助手的分析框架，并总结当前评测缺口。",
        "innovation": "从科研写作场景出发，对 trustworthy LLMs 做了更贴近学术工作流的框架化整理。",
        "limitations": "更多是框架性综述，缺少统一实验复现；部分结论依赖已有论文质量。",
        "translations": {
            "title_zh": "面向学术写作支持的可信大模型综述",
            "abstract_zh": "该综述围绕学术写作支持中的可信大模型技术展开，重点讨论事实依据、引文忠实性、可控生成和人工参与修订。",
            "summary_zh": "论文指出，若缺乏证据绑定和人工修订闭环，大模型难以直接满足科研写作的严谨要求。",
        },
        "citations": {
            "gbt": "Chen M, Guo Y. Survey of Trustworthy LLMs for Academic Writing Support[EB/OL]. arXiv, 2025.",
            "apa": "Chen, M., & Guo, Y. (2025). Survey of Trustworthy LLMs for Academic Writing Support. arXiv.",
            "ieee": "M. Chen and Y. Guo, \"Survey of Trustworthy LLMs for Academic Writing Support,\" arXiv, 2025.",
            "mla": "Chen, Ming, and Yutong Guo. \"Survey of Trustworthy LLMs for Academic Writing Support.\" arXiv, 2025.",
        },
        "records": [
            "2026-03-09 22:15 保存到“可信科研助手”分组",
            "2026-03-09 22:18 标记为收藏",
            "2026-03-09 22:20 待补充问答记录",
        ],
    },
    "paper-3": {
        "summary_short": "论文提出多语言论文问答基准，并强调答案必须附带证据定位。",
        "summary_long": "作者构建了一个覆盖中英论文的问答基准，要求系统不仅回答问题，还要定位段落级证据。论文的重点不只是提升回答准确率，更强调科研场景中证据可追溯的重要性。结果表明，纯生成式方法在缺乏检索支撑时较容易出现无依据回答。",
        "research_problem": "如何在多语言论文问答中兼顾回答质量与证据可追溯性。",
        "method": "构建多语言 benchmark，并比较生成式、检索增强式和证据监督式方法。",
        "dataset": "自建中英论文问答数据集，附带 paragraph-level evidence annotations。",
        "results": "证据监督式方法在答案可靠性和可解释性上明显更好。",
        "innovation": "把多语言问答与证据定位放到同一评测框架中。",
        "limitations": "标注成本高；证据粒度仍以段落为主；跨领域迁移能力待验证。",
        "translations": {
            "title_zh": "面向论文问答的多语言证据绑定方法",
            "abstract_zh": "本文提出一个带证据定位的多语言论文问答基准，使系统能够在中英文论文中回答研究问题并引用段落级证据。",
            "summary_zh": "该工作强调，科研问答不仅需要回答正确，还必须明确给出证据来源。",
        },
        "citations": {
            "gbt": "Rao A, Xu Q, Lu P. Multilingual Evidence Grounding for Paper Question Answering[C]//EMNLP. 2023.",
            "apa": "Rao, A., Xu, Q., & Lu, P. (2023). Multilingual Evidence Grounding for Paper Question Answering. EMNLP.",
            "ieee": "A. Rao, Q. Xu, and P. Lu, \"Multilingual Evidence Grounding for Paper Question Answering,\" in EMNLP, 2023.",
            "mla": "Rao, Ananya, et al. \"Multilingual Evidence Grounding for Paper Question Answering.\" EMNLP, 2023.",
        },
        "records": [
            "2026-03-08 18:30 导入论文元数据",
            "2026-03-08 18:42 生成对比候选卡片",
            "2026-03-08 19:05 记录证据绑定思路",
        ],
    },
}

SEED_CHAT = {
    "paper-1": [
        ("assistant", "你正在查看这篇论文。可以直接问我它的研究问题、方法、数据集、结果或局限性。", "2026-03-10T20:10:00+08:00"),
        ("user", "这篇论文的核心贡献是什么？", "2026-03-10T20:11:00+08:00"),
        ("assistant", "核心贡献在于把引文图结构当作检索表示学习的重要监督信号，并用图对比学习联合建模文本语义与论文关系。", "2026-03-10T20:11:01+08:00"),
    ],
    "paper-2": [
        ("assistant", "当前论文还没有历史问答。你可以从可信性框架、评测缺口或引文忠实性问题开始提问。", "2026-03-09T19:58:00+08:00"),
    ],
    "paper-3": [
        ("assistant", "你可以把这篇论文当作 DocMind 问答模块的参考论文，尤其关注证据返回和多语言设计。", "2026-03-08T18:42:00+08:00"),
        ("user", "这篇论文对我们的产品有什么启发？", "2026-03-08T18:44:00+08:00"),
        ("assistant", "最大的启发是：科研问答必须绑定证据，而不是只给流畅答案。这正对应需求文档里对可追溯性的要求。", "2026-03-08T18:45:00+08:00"),
    ],
}


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        exists = session.scalar(select(Paper.id).limit(1))
        if exists:
            return

        for paper_data in SEED_PAPERS:
            session.add(Paper(**paper_data))

        session.flush()

        for paper_id, analysis_data in SEED_ANALYSES.items():
            session.add(PaperAnalysis(paper_id=paper_id, **analysis_data))
            session.add(ChatSession(id=f"session-{paper_id}", paper_id=paper_id, title="默认会话"))

        session.flush()

        for paper_id, messages in SEED_CHAT.items():
            session_id = f"session-{paper_id}"
            for role, content, created_at in messages:
                session.add(
                    ChatMessage(
                        session_id=session_id,
                        role=role,
                        content=content,
                        created_at=created_at,
                        evidence_json=[],
                    )
                )

        session.commit()
