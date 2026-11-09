import asyncio
import os
import sqlite3
from contextlib import asynccontextmanager, closing

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import db
from .schemas import ALL_STATUSES, Job, JobStatus, Summary


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Background Job Dashboard API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/jobs", response_model=list[Job])
def list_jobs(status: JobStatus | None = None, conn: sqlite3.Connection = Depends(db.get_db)) -> list[dict]:
    return db.list_jobs(conn, status)


@app.get("/api/jobs/summary", response_model=Summary)
def get_summary(conn: sqlite3.Connection = Depends(db.get_db)) -> dict:
    counts = db.count_by_status(conn)
    by_status = {status: counts.get(status, 0) for status in ALL_STATUSES}
    return {"total": sum(by_status.values()), "by_status": by_status}


@app.post("/api/jobs/{job_id}/retry", response_model=Job, status_code=202)
def retry_job(
    job_id: int, background_tasks: BackgroundTasks, conn: sqlite3.Connection = Depends(db.get_db)
) -> dict:
    job = db.get_job(conn, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "succeeded":
        raise HTTPException(status_code=409, detail="Job already succeeded; nothing to retry")

    db.update_job(conn, job_id, "queued", attempts=job["attempts"] + 1, error_message=None)
    background_tasks.add_task(run_job, job_id)

    updated = db.get_job(conn, job_id)
    assert updated is not None
    return updated


async def run_job(job_id: int) -> None:
    """Stand-in for a real worker: mark the job running, wait, then record an outcome."""
    with closing(db.connect()) as conn:
        db.update_job(conn, job_id, "running")

    await asyncio.sleep(float(os.environ.get("JOBS_RUN_SECONDS", "3")))

    with closing(db.connect()) as conn:
        job = db.get_job(conn, job_id)
        if job is None:
            return
        if (job["id"] + job["attempts"]) % 3 == 0:
            db.update_job(conn, job_id, "failed", error_message=f"Simulated failure on attempt {job['attempts']}")
        else:
            db.update_job(conn, job_id, "succeeded")
