from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    authors: Mapped[str] = mapped_column(String(255))
    year: Mapped[int] = mapped_column(Integer)
    venue: Mapped[str] = mapped_column(String(255))
    doi: Mapped[str | None] = mapped_column(String(255), nullable=True)
    language: Mapped[str] = mapped_column(String(16), default="en")
    focus: Mapped[str] = mapped_column(String(255))
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    reading_status: Mapped[str] = mapped_column(String(32), default="unread")
    status: Mapped[str] = mapped_column(String(32), default="pending")
    note: Mapped[str] = mapped_column(String(255), default="")
    tags: Mapped[str] = mapped_column(String(255), default="")
    abstract_raw: Mapped[str | None] = mapped_column(Text, nullable=True)
