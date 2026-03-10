from fastapi import APIRouter

from app.schemas.paper import PaperItem, PaperListResponse

router = APIRouter()

_PAPERS = [
    PaperItem(
        id="paper-001",
        title="Graph Neural Networks for Recommendation",
        original_abstract="Original abstract placeholder.",
        summary="AI summary placeholder.",
        translation_status="pending",
    )
]


@router.get("", response_model=PaperListResponse)
def list_papers() -> PaperListResponse:
    return PaperListResponse(items=_PAPERS)
