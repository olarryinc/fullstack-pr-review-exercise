# Background Job Dashboard

A small full-stack demo app that lists background jobs (image resizing, CSV
imports, report generation), shows how many are in each status, and lets you
retry failed ones.

> **This is a fictional exercise.** The code, data, and architecture are
> invented for a code-review interview and are unrelated to any production
> system, including OLarry's. All job names and error messages are made up.

## Stack

| Layer    | Technology                                                  |
| -------- | ----------------------------------------------------------- |
| Backend  | Python 3.11+, FastAPI, SQLite (standard library)            |
| Frontend | React 18, TypeScript, Vite                                  |
| Tests    | pytest (backend), Vitest + React Testing Library (frontend) |

## Project layout

```
backend/
  app/
    main.py       FastAPI routes
    db.py         SQLite schema, sample data, queries
    schemas.py    Pydantic response models
  tests/
frontend/
  src/
    App.tsx       Page container: loads data, owns the filter state
    api.ts        Typed fetch wrapper
    types.ts      Shared types and labels
    components/   Table, summary cards, status filter
    test/         Test setup and fixtures
```

## Running locally

### Backend (port 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The first start creates `backend/jobs.db` with sample jobs. Delete the file to
reset. Interactive API docs: http://localhost:8000/docs

### Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the
backend on port 8000.

## Tests and checks

```bash
cd backend && source .venv/bin/activate && pytest

cd frontend
npm test            # vitest
npm run typecheck   # tsc
npm run lint        # eslint
```

## API

| Method | Path                         | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/api/jobs?status=<status>`  | List jobs, optionally filtered       |
| GET    | `/api/jobs/summary`          | Job counts by status                 |

Job statuses: `queued`, `running`, `succeeded`, `failed`.
