from app.db import SEED_JOBS


def test_list_jobs_returns_all_sample_jobs(client):
    response = client.get("/api/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) == len(SEED_JOBS)
    assert {"id", "name", "job_type", "status", "attempts", "created_at"} <= jobs[0].keys()


def test_list_jobs_is_newest_first(client):
    created = [job["created_at"] for job in client.get("/api/jobs").json()]
    assert created == sorted(created, reverse=True)


def test_filter_by_status(client):
    jobs = client.get("/api/jobs", params={"status": "failed"}).json()
    assert len(jobs) == 4
    assert all(job["status"] == "failed" for job in jobs)
    assert all(job["error_message"] for job in jobs)


def test_filter_rejects_unknown_status(client):
    assert client.get("/api/jobs", params={"status": "bogus"}).status_code == 422


def test_summary_counts_add_up(client):
    summary = client.get("/api/jobs/summary").json()
    assert summary["total"] == len(SEED_JOBS)
    assert sum(summary["by_status"].values()) == summary["total"]
    assert summary["by_status"] == {"queued": 2, "running": 2, "succeeded": 8, "failed": 4}
