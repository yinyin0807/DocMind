from fastapi import APIRouter

from app.schemas.task import TaskDetailResponse
from app.services.task_service import TaskService

router = APIRouter()
_task_service = TaskService()


@router.get("/tasks/{task_id}", response_model=TaskDetailResponse)
def get_task(task_id: str) -> TaskDetailResponse:
    return _task_service.get_task(task_id)
