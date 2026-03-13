from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.paper import PaperDetailResponse, PaperImportResponse, PaperListResponse
from app.services.paper_service import PaperService
from app.services.task_service import TaskService

router = APIRouter()
_paper_service = PaperService()
_task_service = TaskService()


@router.get("", response_model=PaperListResponse)
def list_papers() -> PaperListResponse:
    return _paper_service.list_papers()


@router.post("/import", response_model=PaperImportResponse)
async def import_paper(
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
    authors: str | None = Form(default=None),
    year: int | None = Form(default=None),
    venue: str | None = Form(default=None),
    focus: str | None = Form(default=None),
    tags: str | None = Form(default=None),
) -> PaperImportResponse:
    return await _paper_service.import_paper(
        upload=file,
        title=title,
        authors=authors,
        year=year,
        venue=venue,
        focus=focus,
        tags=tags,
    )


@router.get("/{paper_id}", response_model=PaperDetailResponse)
def get_paper(paper_id: str) -> PaperDetailResponse:
    return _paper_service.get_paper(paper_id)


@router.post("/{paper_id}/summary-tasks")
def create_summary_task(paper_id: str):
    return _task_service.create_task(paper_id=paper_id, task_type="summary")


@router.post("/{paper_id}/translation-tasks")
def create_translation_task(paper_id: str):
    return _task_service.create_task(paper_id=paper_id, task_type="translation")
