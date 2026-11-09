import sqlite3
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
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
