import pytest
from fastapi.testclient import TestClient

from app import db


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Fresh SQLite database (seeded on startup) for every test."""
    monkeypatch.setattr(db, "DATABASE_PATH", str(tmp_path / "test.db"))
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
