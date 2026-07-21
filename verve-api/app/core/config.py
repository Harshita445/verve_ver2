from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "verve-api"
    environment: str = "development"

    database_url: str = "postgresql+psycopg2://verve:verve@localhost:5432/verve"

    jwt_secret: str = "change-me-in-env"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    cors_origins: list[str] = ["http://localhost:3000"]

    openai_api_key: str | None = None
    whisper_api_key: str | None = None

    storage_bucket: str | None = None
    storage_access_key: str | None = None
    storage_secret_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
