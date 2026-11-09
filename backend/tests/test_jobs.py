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


def _first_with_status(client, status):
    return client.get("/api/jobs", params={"status": status}).json()[0]


def test_retry_failed_job_queues_it_and_increments_attempts(client, monkeypatch):
    monkeypatch.setenv("JOBS_RUN_SECONDS", "0")
    failed = _first_with_status(client, "failed")

    response = client.post(f"/api/jobs/{failed['id']}/retry")

    assert response.status_code == 202
    assert response.json()["status"] == "queued"
    assert response.json()["attempts"] == failed["attempts"] + 1
    assert response.json()["error_message"] is None


def test_retried_job_reaches_a_final_status(client, monkeypatch):
    monkeypatch.setenv("JOBS_RUN_SECONDS", "0")
    failed = _first_with_status(client, "failed")
    client.post(f"/api/jobs/{failed['id']}/retry")

    jobs = {job["id"]: job for job in client.get("/api/jobs").json()}
    assert jobs[failed["id"]]["status"] in ("succeeded", "failed")


def test_retry_succeeded_job_is_rejected(client):
    succeeded = _first_with_status(client, "succeeded")
    assert client.post(f"/api/jobs/{succeeded['id']}/retry").status_code == 409


def test_retry_unknown_job_404(client):
    assert client.post("/api/jobs/9999/retry").status_code == 404


def test_summary_counts_add_up(client):
    summary = client.get("/api/jobs/summary").json()
    assert summary["total"] == len(SEED_JOBS)
    assert sum(summary["by_status"].values()) == summary["total"]
    assert summary["by_status"] == {"queued": 2, "running": 2, "succeeded": 8, "failed": 4}
