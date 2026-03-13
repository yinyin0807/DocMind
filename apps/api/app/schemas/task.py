from pydantic import BaseModel


class TaskCreateResponse(BaseModel):
    task_id: str
    task_type: str
    status: str
    target_type: str
    target_id: str


class TaskDetailResponse(BaseModel):
    id: str
    task_type: str
    status: str
    target_type: str
    target_id: str
    result: dict[str, bool | str | int | float | None] | None = None
    error_message: str | None = None
