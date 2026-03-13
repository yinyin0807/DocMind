from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.chat_repository import ChatRepository
from app.repositories.paper_repository import PaperRepository
from app.schemas.paper import PaperDetailResponse, PaperImportResponse, PaperListItem, PaperListResponse


class PaperService:
    def __init__(self) -> None:
        self.repository = PaperRepository()
        self.analysis_repository = AnalysisRepository()
        self.chat_repository = ChatRepository()

    def list_papers(self) -> PaperListResponse:
        papers = [PaperListItem(**item) for item in self.repository.list()]
        return PaperListResponse(items=papers, total=len(papers), page=1, page_size=len(papers))

    def get_paper(self, paper_id: str) -> PaperDetailResponse:
        paper = self.repository.get(paper_id)
        if paper is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")
        return PaperDetailResponse(**paper)

    async def import_paper(
        self,
        upload: UploadFile,
        title: str | None = None,
        authors: str | None = None,
        year: int | None = None,
        venue: str | None = None,
        focus: str | None = None,
        tags: str | None = None,
    ) -> PaperImportResponse:
        if not upload.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing filename")

        suffix = Path(upload.filename).suffix.lower()
        if suffix != ".pdf":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

        settings.paper_storage_dir.mkdir(parents=True, exist_ok=True)
        stored_filename = f"{uuid4().hex[:12]}-{Path(upload.filename).name}"
        storage_path = settings.paper_storage_dir / stored_filename
        content = await upload.read()
        storage_path.write_bytes(content)

        paper_id = f"paper-{uuid4().hex[:8]}"
        derived_title = title.strip() if title else Path(upload.filename).stem
        tag_string = tags or "新导入"
        created_paper = self.repository.create(
            {
                "id": paper_id,
                "title": derived_title,
                "authors": authors.strip() if authors else "待补充作者",
                "year": year or datetime.now().year,
                "venue": venue.strip() if venue else "本地导入",
                "doi": None,
                "language": "unknown",
                "focus": focus.strip() if focus else "等待解析论文内容",
                "is_favorite": False,
                "reading_status": "unread",
                "status": "待解析",
                "note": "已上传 PDF，等待解析",
                "tags": ",".join([item.strip() for item in tag_string.replace("，", ",").split(",") if item.strip()]),
                "abstract_raw": None,
            }
        )

        record = f"{datetime.now().strftime('%Y-%m-%d %H:%M')} 上传论文文件 {Path(upload.filename).name}"
        self.analysis_repository.create_placeholder(paper_id=paper_id, record=record)
        session = self.chat_repository.create_session(paper_id=paper_id)
        self.chat_repository.append_message(
            session_id=session["id"],
            role="assistant",
            content="论文已导入成功。当前还未解析全文，你可以先补充元数据，后续再触发解析、总结和翻译任务。",
        )

        return PaperImportResponse(
            id=created_paper["id"],
            title=created_paper["title"],
            authors=created_paper["authors"],
            year=created_paper["year"],
            venue=created_paper["venue"],
            focus=created_paper["focus"],
            tags=created_paper["tags"],
            status=created_paper["status"],
            note=created_paper["note"],
            stored_filename=stored_filename,
        )
