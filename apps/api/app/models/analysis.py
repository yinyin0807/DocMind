from sqlalchemy import ForeignKey, Integer, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class PaperAnalysis(Base):
    __tablename__ = "paper_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    paper_id: Mapped[str] = mapped_column(ForeignKey("papers.id"), unique=True)
    summary_short: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary_long: Mapped[str | None] = mapped_column(Text, nullable=True)
    research_problem: Mapped[str | None] = mapped_column(Text, nullable=True)
    method: Mapped[str | None] = mapped_column(Text, nullable=True)
    dataset: Mapped[str | None] = mapped_column(Text, nullable=True)
    results: Mapped[str | None] = mapped_column(Text, nullable=True)
    innovation: Mapped[str | None] = mapped_column(Text, nullable=True)
    limitations: Mapped[str | None] = mapped_column(Text, nullable=True)
    translations: Mapped[dict] = mapped_column(JSON, default=dict)
    citations: Mapped[dict] = mapped_column(JSON, default=dict)
    records: Mapped[list] = mapped_column(JSON, default=list)
