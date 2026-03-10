from pydantic import BaseModel


class TaskItem(BaseModel):
    id: str
    kind: str
    status: str


class TaskListResponse(BaseModel):
    items: list[TaskItem]
