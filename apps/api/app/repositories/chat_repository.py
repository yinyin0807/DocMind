from sqlalchemy import select

from app.core.db import SessionLocal
from app.models.chat import ChatMessage, ChatSession
from app.models.paper import Paper
from app.repositories.util import now_iso


class ChatRepository:
    def get_session_by_paper(self, paper_id: str) -> dict | None:
        with SessionLocal() as session:
            chat_session = session.scalar(select(ChatSession).where(ChatSession.paper_id == paper_id))
            if chat_session is None:
                paper = session.get(Paper, paper_id)
                if paper is None:
                    return None
                chat_session = ChatSession(id=f"session-{paper_id}", paper_id=paper_id, title="默认会话")
                session.add(chat_session)
                session.commit()
                session.refresh(chat_session)
            return {"id": chat_session.id, "paper_id": chat_session.paper_id, "title": chat_session.title}

    def create_session(self, paper_id: str, title: str = "默认会话") -> dict:
        with SessionLocal() as session:
            chat_session = ChatSession(id=f"session-{paper_id}", paper_id=paper_id, title=title)
            session.add(chat_session)
            session.commit()
            session.refresh(chat_session)
            return {"id": chat_session.id, "paper_id": chat_session.paper_id, "title": chat_session.title}

    def get_messages(self, session_id: str) -> list[dict]:
        with SessionLocal() as session:
            messages = session.scalars(
                select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.id.asc())
            ).all()
            return [self._to_dict(item) for item in messages]

    def append_message(self, session_id: str, role: str, content: str) -> dict:
        with SessionLocal() as session:
            message = ChatMessage(
                session_id=session_id,
                role=role,
                content=content,
                created_at=now_iso(),
                evidence_json=[],
            )
            session.add(message)
            session.commit()
            session.refresh(message)
            return self._to_dict(message)

    def _to_dict(self, message: ChatMessage) -> dict:
        return {
            "id": str(message.id),
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at,
            "evidence": message.evidence_json,
        }
