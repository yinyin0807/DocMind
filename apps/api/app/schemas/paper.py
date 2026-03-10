from pydantic import BaseModel


class PaperItem(BaseModel):
    id: str
    title: str
    original_abstract: str
    summary: str
    translation_status: str


class PaperListResponse(BaseModel):
    items: list[PaperItem]
