from uuid import uuid4

from app.core.db import SessionLocal
from app.models.task import Task
from app.repositories.util import now_iso


class TaskRepository:
    def create(self, task_type: str, target_type: str, target_id: str, result: dict | None = None) -> dict:
        timestamp = now_iso()
        with SessionLocal() as session:
            task = Task(
                id=f"task-{uuid4().hex[:10]}",
                task_type=task_type,
                status="done",
                target_type=target_type,
                target_id=target_id,
                result=result or {"updated_analysis": True},
                error_message=None,
                created_at=timestamp,
                updated_at=timestamp,
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            return self._to_dict(task)

    def get(self, task_id: str) -> dict | None:
        with SessionLocal() as session:
            task = session.get(Task, task_id)
            return self._to_dict(task) if task else None

    def _to_dict(self, task: Task) -> dict:
        return {
            "id": task.id,
            "task_type": task.task_type,
            "status": task.status,
            "target_type": task.target_type,
            "target_id": task.target_id,
            "result": task.result,
            "error_message": task.error_message,
        }
