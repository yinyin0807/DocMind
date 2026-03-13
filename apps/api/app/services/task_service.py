from fastapi import HTTPException, status

from app.repositories.paper_repository import PaperRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreateResponse, TaskDetailResponse


class TaskService:
    def __init__(self) -> None:
        self.paper_repository = PaperRepository()
        self.task_repository = TaskRepository()

    def create_task(self, paper_id: str, task_type: str) -> TaskCreateResponse:
        paper = self.paper_repository.get(paper_id)
        if paper is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")
        task = self.task_repository.create(task_type=task_type, target_type="paper", target_id=paper_id)
        return TaskCreateResponse(
            task_id=task["id"],
            task_type=task["task_type"],
            status=task["status"],
            target_type=task["target_type"],
            target_id=task["target_id"],
        )

    def get_task(self, task_id: str) -> TaskDetailResponse:
        task = self.task_repository.get(task_id)
        if task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return TaskDetailResponse(**task)
