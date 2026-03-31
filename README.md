# Capital Ops

Capital Ops is a portfolio-grade analytics platform for evaluating how well public companies allocate capital and run their operations.

This repo currently contains **scaffolding only** (no product features yet): a Next.js frontend, a FastAPI backend, and a Postgres container for saved analyses.

---

## Prerequisites

- Docker + Docker Compose
- Node.js 18+
- Python 3.10+ (3.11+ recommended)

---

## Local development (localhost)

### 1 — Copy the env file

```bash
cp .env.example .env
```

Leave `NEXT_PUBLIC_BASE_PATH` empty in `.env` for local dev.

### 2 — Start Postgres

```bash
docker compose up -d postgres
```

### 3 — Run the backend (Terminal 1)

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Check: [http://localhost:8000/health](http://localhost:8000/health) → `{"status":"ok"}`

### 4 — Run the frontend (Terminal 2)

```bash
cd apps/web
npm run dev
```

Check: [http://localhost:3000](http://localhost:3000) → Next.js default page

---

## Deployment to sonamdatok.com/capital-ops

The project is designed to live at `sonamdatok.com/capital-ops`. It uses two separately hosted services:

| Service | Recommended host | Free tier |
|---|---|---|
| Next.js frontend | Vercel | Yes |
| FastAPI backend | Railway or Render | Yes |

### Frontend — Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo.
3. Set **Root Directory** to `apps/web`.
4. Add these environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE_URL` → your deployed API URL (e.g. `https://capital-ops-api.railway.app`)
   - `NEXT_PUBLIC_BASE_PATH` → `/capital-ops`
5. Deploy. Vercel gives you a URL like `capital-ops.vercel.app`.

### Backend — Railway (recommended)

1. New Project → Deploy from GitHub → set **Root Directory** to `apps/api`.
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add environment variable: `DATABASE_URL` pointing to a Railway-provisioned Postgres instance.
4. Copy the public URL Railway gives you (e.g. `https://capital-ops-api.railway.app`).

### Routing sonamdatok.com/capital-ops → Vercel

Choose one option depending on how sonamdatok.com is hosted:

**Option A — sonamdatok.com is on Vercel**

Add a rewrite in your sonamdatok.com `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/capital-ops/:path*",
      "destination": "https://capital-ops.vercel.app/capital-ops/:path*"
    }
  ]
}
```

**Option B — sonamdatok.com is on a server with nginx**

Add to your nginx config:

```nginx
location /capital-ops {
  proxy_pass https://capital-ops.vercel.app;
  proxy_set_header Host capital-ops.vercel.app;
}
```

**Option C — Subdomain instead (simplest path)**

Skip the rewrite entirely. Add a CNAME in your DNS:

```
capital-ops.sonamdatok.com  CNAME  cname.vercel-dns.com
```

Configure the custom domain in Vercel. The project lives at `capital-ops.sonamdatok.com`. No basePath needed — remove `NEXT_PUBLIC_BASE_PATH` from the Vercel environment variables.

---

## Notes

- Backend currently exposes `/health` only. Product endpoints come in the next implementation step.
- DuckDB seed placeholders exist under `apps/api/data/seed/` but are not wired up yet.
- `NEXT_PUBLIC_BASE_PATH` controls whether Next.js prefixes all links and assets with `/capital-ops`. Set it in Vercel env vars at deploy time; leave it empty locally.
