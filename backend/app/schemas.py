from typing import Literal

from pydantic import BaseModel

JobStatus = Literal["queued", "running", "succeeded", "failed"]

ALL_STATUSES: tuple[str, ...] = ("queued", "running", "succeeded", "failed")


class Job(BaseModel):
    id: int
    name: str
    job_type: str
    status: JobStatus
    attempts: int
    error_message: str | None
    created_at: str
    updated_at: str


class Summary(BaseModel):
    total: int
    by_status: dict[JobStatus, int]
