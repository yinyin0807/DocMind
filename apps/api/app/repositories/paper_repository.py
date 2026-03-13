from sqlalchemy import select

from app.core.db import SessionLocal
from app.models.paper import Paper


class PaperRepository:
    def list(self) -> list[dict]:
        with SessionLocal() as session:
            papers = session.scalars(select(Paper).order_by(Paper.year.desc(), Paper.title.asc())).all()
            return [self._to_dict(paper) for paper in papers]

    def get(self, paper_id: str) -> dict | None:
        with SessionLocal() as session:
            paper = session.get(Paper, paper_id)
            return self._to_dict(paper) if paper else None

    def create(self, paper_data: dict) -> dict:
        with SessionLocal() as session:
            paper = Paper(**paper_data)
            session.add(paper)
            session.commit()
            session.refresh(paper)
            return self._to_dict(paper)

    def _to_dict(self, paper: Paper) -> dict:
        return {
            "id": paper.id,
            "title": paper.title,
            "authors": paper.authors,
            "year": paper.year,
            "venue": paper.venue,
            "doi": paper.doi,
            "language": paper.language,
            "focus": paper.focus,
            "is_favorite": paper.is_favorite,
            "reading_status": paper.reading_status,
            "tags": [tag for tag in paper.tags.split(",") if tag],
            "status": paper.status,
            "note": paper.note,
            "abstract_raw": paper.abstract_raw,
        }
