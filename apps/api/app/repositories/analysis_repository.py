from sqlalchemy import select

from app.core.db import SessionLocal
from app.models.analysis import PaperAnalysis
from app.models.paper import Paper


class AnalysisRepository:
    def get_by_paper(self, paper_id: str) -> dict | None:
        with SessionLocal() as session:
            analysis = session.scalar(select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_id))
            paper = session.get(Paper, paper_id)
            if analysis is None or paper is None:
                return None
            return {
                "paper_id": analysis.paper_id,
                "abstract_raw": paper.abstract_raw,
                "summary_short": analysis.summary_short,
                "summary_long": analysis.summary_long,
                "research_problem": analysis.research_problem,
                "method": analysis.method,
                "dataset": analysis.dataset,
                "results": analysis.results,
                "innovation": analysis.innovation,
                "limitations": analysis.limitations,
                "translations": analysis.translations,
                "citations": analysis.citations,
                "records": analysis.records,
            }

    def create_placeholder(self, paper_id: str, record: str) -> dict:
        with SessionLocal() as session:
            analysis = PaperAnalysis(
                paper_id=paper_id,
                summary_short="等待生成总结",
                summary_long="当前论文已导入，等待后续解析与总结任务。",
                research_problem="待解析",
                method="待解析",
                dataset="待解析",
                results="待解析",
                innovation="待解析",
                limitations="待解析",
                translations={
                    "title_zh": None,
                    "abstract_zh": None,
                    "summary_zh": None,
                },
                citations={
                    "gbt": None,
                    "apa": None,
                    "ieee": None,
                    "mla": None,
                },
                records=[record],
            )
            session.add(analysis)
            session.commit()
            session.refresh(analysis)
            return {
                "paper_id": analysis.paper_id,
                "records": analysis.records,
            }
