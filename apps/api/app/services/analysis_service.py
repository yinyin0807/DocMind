from fastapi import HTTPException, status

from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import PaperAnalysisResponse


class AnalysisService:
    def __init__(self) -> None:
        self.repository = AnalysisRepository()

    def get_analysis(self, paper_id: str) -> PaperAnalysisResponse:
        analysis = self.repository.get_by_paper(paper_id)
        if analysis is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
        return PaperAnalysisResponse(**analysis)
