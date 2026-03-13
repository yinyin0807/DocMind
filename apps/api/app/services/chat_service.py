from fastapi import HTTPException, status

from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import ChatAskResponse, ChatHistoryResponse, ChatMessageResponse, ChatSessionResponse


class ChatService:
    def __init__(self) -> None:
        self.repository = ChatRepository()

    def get_history(self, paper_id: str) -> ChatHistoryResponse:
        session = self.repository.get_session_by_paper(paper_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
        messages = [ChatMessageResponse(**item) for item in self.repository.get_messages(session["id"])]
        return ChatHistoryResponse(session=ChatSessionResponse(**session), messages=messages)

    def ask(self, paper_id: str, question: str) -> ChatAskResponse:
        session = self.repository.get_session_by_paper(paper_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

        user_message = self.repository.append_message(session["id"], "user", question)
        assistant_reply = self._build_reply(paper_id, question)
        assistant_message = self.repository.append_message(session["id"], "assistant", assistant_reply)

        return ChatAskResponse(
            session=ChatSessionResponse(**session),
            user_message=ChatMessageResponse(**user_message),
            assistant_message=ChatMessageResponse(**assistant_message),
        )

    def _build_reply(self, paper_id: str, question: str) -> str:
        replies = {
            "paper-1": "核心贡献在于把引文图结构当作检索表示学习的重要监督信号，并用图对比学习联合建模文本语义与论文关系。",
            "paper-2": "这篇综述的价值在于把可信学术写作支持拆成事实依据、引文忠实性、可控生成和人工修订四个方向。",
            "paper-3": "最大的启发是：科研问答必须绑定证据，而不是只给流畅答案。",
        }
        return replies.get(paper_id, f"已收到你的问题：{question}。当前是第一版占位回答，后续会替换成真实检索与问答能力。")
