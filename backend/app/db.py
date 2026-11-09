"""SQLite access: schema, sample data, and the queries the API needs."""

import os
import sqlite3
from collections.abc import Iterator
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path

DATABASE_PATH = os.environ.get(
    "JOBS_DATABASE_PATH", str(Path(__file__).resolve().parent.parent / "jobs.db")
)

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    job_type      TEXT NOT NULL,
    status        TEXT NOT NULL,
    attempts      INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);
"""

# Fictional sample jobs: (name, job_type, status, attempts, error_message, created_at)
SEED_JOBS = [
    ("Resize product images (batch 42)", "image_resize", "succeeded", 1, None, "2025-11-03T09:12:00Z"),
    ("Import customers_oct.csv", "csv_import", "failed", 2, "Row 118: invalid date format", "2025-11-03T09:05:00Z"),
    ("Generate monthly sales report", "report", "succeeded", 1, None, "2025-11-03T08:40:00Z"),
    ("Resize banner images", "image_resize", "running", 1, None, "2025-11-03T08:31:00Z"),
    ("Import inventory_snapshot.csv", "csv_import", "succeeded", 1, None, "2025-11-03T08:02:00Z"),
    ("Generate weekly signups report", "report", "failed", 1, "Timed out after 30s", "2025-11-02T17:45:00Z"),
    ("Resize avatar uploads", "image_resize", "succeeded", 1, None, "2025-11-02T16:20:00Z"),
    ("Import suppliers.csv", "csv_import", "queued", 1, None, "2025-11-02T15:58:00Z"),
    ("Generate quarterly finance report", "report", "succeeded", 2, None, "2025-11-02T14:10:00Z"),
    ("Resize product images (batch 41)", "image_resize", "failed", 3, "Unsupported image format: .heic", "2025-11-02T11:33:00Z"),
    ("Import orders_backfill.csv", "csv_import", "succeeded", 1, None, "2025-11-02T10:05:00Z"),
    ("Generate daily error digest", "report", "running", 1, None, "2025-11-02T09:00:00Z"),
    ("Resize catalog thumbnails", "image_resize", "succeeded", 1, None, "2025-11-01T18:22:00Z"),
    ("Import returns_q3.csv", "csv_import", "failed", 1, "Out of memory while parsing", "2025-11-01T16:47:00Z"),
    ("Generate retention report", "report", "queued", 1, None, "2025-11-01T15:30:00Z"),
    ("Resize marketing assets", "image_resize", "succeeded", 1, None, "2025-11-01T13:15:00Z"),
]


def now() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with closing(connect()) as conn:
        conn.executescript(SCHEMA)
        if conn.execute("SELECT COUNT(*) FROM jobs").fetchone()[0] == 0:
            conn.executemany(
                "INSERT INTO jobs (name, job_type, status, attempts, error_message, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                [(*job, job[-1]) for job in SEED_JOBS],
            )
        conn.commit()


def get_db() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency: one connection per request."""
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()


def list_jobs(conn: sqlite3.Connection, status: str | None = None) -> list[dict]:
    sql = "SELECT * FROM jobs"
    params: list[object] = []
    if status is not None:
        sql += " WHERE status = ?"
        params.append(status)
    sql += " ORDER BY created_at DESC, id DESC"
    return [dict(row) for row in conn.execute(sql, params)]


def get_job(conn: sqlite3.Connection, job_id: int) -> dict | None:
    row = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    return dict(row) if row else None


def count_by_status(conn: sqlite3.Connection) -> dict[str, int]:
    rows = conn.execute("SELECT status, COUNT(*) AS n FROM jobs GROUP BY status")
    return {row["status"]: row["n"] for row in rows}
