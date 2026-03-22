# Capital Ops

Capital Ops is a portfolio-grade analytics platform for evaluating how well public companies allocate capital and run their operations.

This repo currently contains **scaffolding only** (no product features yet): a Next.js frontend, a FastAPI backend, and a Postgres container for saved analyses.

## Prerequisites

- Docker + Docker Compose
- Node.js (Node 18+ recommended)
- Python 3.10+ (3.11+ recommended)

## One-time setup

1. Create your environment file:

   ```bash
   cd /Users/dev2/www/capital-ops
   cp .env.example .env
   ```

2. Start Postgres:

   ```bash
   docker compose up -d postgres
   ```

## Run the backend (FastAPI)

From the repo root:

```bash
cd /Users/dev2/www/capital-ops/apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify:

- `http://localhost:8000/health`

## Run the frontend (Next.js)

In a separate terminal:

```bash
cd /Users/dev2/www/capital-ops/apps/web
npm install
npm run dev -- --port 3000
```

Verify:

- `http://localhost:3000`

## Notes

- The backend scaffolding includes `/health` only.
- DuckDB seed “placeholders” exist under `apps/api/data/seed/` but DuckDB integration will come in the next implementation step.