from fastapi import APIRouter

from app.schemas.analysis import PaperAnalysisResponse
from app.services.analysis_service import AnalysisService

router = APIRouter()
_analysis_service = AnalysisService()


@router.get("/{paper_id}/analysis", response_model=PaperAnalysisResponse)
def get_paper_analysis(paper_id: str) -> PaperAnalysisResponse:
    return _analysis_service.get_analysis(paper_id)
