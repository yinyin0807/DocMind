from fastapi import APIRouter

from app.schemas.chat import ChatAskRequest, ChatAskResponse, ChatHistoryResponse
from app.services.chat_service import ChatService

router = APIRouter()
_chat_service = ChatService()


@router.get("/{paper_id}/chat", response_model=ChatHistoryResponse)
def get_chat_history(paper_id: str) -> ChatHistoryResponse:
    return _chat_service.get_history(paper_id)


@router.post("/{paper_id}/chat", response_model=ChatAskResponse)
def ask_about_paper(paper_id: str, payload: ChatAskRequest) -> ChatAskResponse:
    return _chat_service.ask(paper_id=paper_id, question=payload.question)
