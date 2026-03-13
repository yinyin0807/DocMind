from pydantic import BaseModel


class TranslationPayload(BaseModel):
    title_zh: str | None = None
    abstract_zh: str | None = None
    summary_zh: str | None = None


class CitationPayload(BaseModel):
    gbt: str | None = None
    apa: str | None = None
    ieee: str | None = None
    mla: str | None = None


class PaperAnalysisResponse(BaseModel):
    paper_id: str
    abstract_raw: str | None = None
    summary_short: str | None = None
    summary_long: str | None = None
    research_problem: str | None = None
    method: str | None = None
    dataset: str | None = None
    results: str | None = None
    innovation: str | None = None
    limitations: str | None = None
    translations: TranslationPayload
    citations: CitationPayload
    records: list[str]
