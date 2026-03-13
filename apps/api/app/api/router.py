from fastapi import APIRouter

from app.api.routes import analyses, chats, health, papers, tasks

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(papers.router, prefix="/api/papers", tags=["papers"])
api_router.include_router(analyses.router, prefix="/api/papers", tags=["analyses"])
api_router.include_router(chats.router, prefix="/api/papers", tags=["chats"])
api_router.include_router(tasks.router, prefix="/api", tags=["tasks"])
