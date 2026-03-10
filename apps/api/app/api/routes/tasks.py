from fastapi import APIRouter

from app.schemas.task import TaskItem, TaskListResponse

router = APIRouter()

_TASKS = [
    TaskItem(id="task-001", kind="summary", status="pending"),
    TaskItem(id="task-002", kind="translation", status="pending"),
]


@router.get("", response_model=TaskListResponse)
def list_tasks() -> TaskListResponse:
    return TaskListResponse(items=_TASKS)
