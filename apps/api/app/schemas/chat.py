from pydantic import BaseModel


class EvidenceItem(BaseModel):
    quote: str | None = None
    source: str | None = None


class ChatSessionResponse(BaseModel):
    id: str
    paper_id: str
    title: str


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str
    evidence: list[EvidenceItem] = []


class ChatHistoryResponse(BaseModel):
    session: ChatSessionResponse
    messages: list[ChatMessageResponse]


class ChatAskRequest(BaseModel):
    question: str


class ChatAskResponse(BaseModel):
    session: ChatSessionResponse
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse
