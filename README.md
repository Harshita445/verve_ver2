# Verve

Communication practice platform with AI-powered feedback. Monorepo containing:

- **verve-api/** — FastAPI backend (Python 3.12)
- **verve-web/** — Next.js 15 frontend (TypeScript, Tailwind)

## Quick start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16 (or Docker Compose)

### Backend setup

```bash
cd verve-api
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend setup

```bash
cd verve-web
cp .env.example .env.local
npm install
npm run dev
```

### Docker Compose (full stack)

```bash
cd verve-api
docker compose up --build
```

## Testing

### Backend

```bash
cd verve-api
python -m pytest tests/ -v
```

### Frontend

```bash
cd verve-web
npx vitest run          # unit tests
npx playwright test     # E2E tests
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
- Backend: lint (ruff) + test (pytest)
- Frontend: lint (next lint) + build

## Deployment

### Production checklist

1. Set `ENVIRONMENT=production` and a strong `JWT_SECRET`
2. Configure `CORS_ORIGINS` for your frontend domain
3. Set up PostgreSQL (Railway / AWS RDS / self-hosted)
4. Configure Redis for Celery task queue
5. Set up S3/Cloudinary for audio file storage
6. Configure Sentry DSN for error monitoring
7. Run `alembic upgrade head` before starting the API
8. Start Celery worker: `celery -A app.workers.celery_app worker --loglevel=info`

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Next.js 15  │────▶│  FastAPI     │────▶│ PostgreSQL │
│  (verve-web) │     │  (verve-api) │     └────────────┘
└─────────────┘     │              │     ┌────────────┐
                    │  Celery      │────▶│  Redis      │
                    │  Worker      │     └────────────┘
                    └──────────────┘
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive OpenAPI docs.
