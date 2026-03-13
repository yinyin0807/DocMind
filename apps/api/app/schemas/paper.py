from pydantic import BaseModel


class PaperListItem(BaseModel):
    id: str
    title: str
    authors: str
    year: int
    venue: str
    tags: list[str]
    status: str
    note: str


class PaperListResponse(BaseModel):
    items: list[PaperListItem]
    total: int
    page: int
    page_size: int


class PaperDetailResponse(BaseModel):
    id: str
    title: str
    authors: str
    year: int
    venue: str
    doi: str | None = None
    language: str
    focus: str
    is_favorite: bool
    reading_status: str
    tags: list[str]


class PaperImportResponse(BaseModel):
    id: str
    title: str
    authors: str
    year: int
    venue: str
    focus: str
    tags: list[str]
    status: str
    note: str
    stored_filename: str
