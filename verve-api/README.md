# verve-api

FastAPI backend for Verve.

## Local setup

```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive API docs.

## Testing

```bash
python -m pytest tests/ -v
```

## Migrations

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Production

- Set `ENVIRONMENT=production`
- Configure all env vars in `.env`
- Run with `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Celery worker: `celery -A app.workers.celery_app worker --loglevel=info`
