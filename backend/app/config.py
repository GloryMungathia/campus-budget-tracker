import os
from dataclasses import dataclass, field
from functools import lru_cache


def normalize_db_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


def split_origins(value: str) -> list[str]:
    return [o.strip().rstrip("/") for o in value.split(",") if o.strip()]


@dataclass(frozen=True)
class Settings:
    database_url: str = field(default_factory=lambda: normalize_db_url(os.getenv("DATABASE_URL", "sqlite:///./budget.db")))
    secret_key: str = field(default_factory=lambda: os.getenv("SECRET_KEY", "change-me-in-production") or "change-me-in-production")
    access_token_minutes: int = field(default_factory=lambda: int(os.getenv("ACCESS_TOKEN_MINUTES", str(60 * 24))))
    remember_token_days: int = field(default_factory=lambda: int(os.getenv("REMEMBER_TOKEN_DAYS", "30")))
    origins: list[str] = field(
        default_factory=lambda: split_origins(os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"))
    )


DEV_SECRET = "change-me-in-production"


def check_settings(settings: Settings) -> Settings:
    if not settings.database_url.startswith("sqlite") and settings.secret_key == DEV_SECRET:
        raise RuntimeError("SECRET_KEY must be set when using a hosted database")
    return settings


@lru_cache
def get_settings() -> Settings:
    return check_settings(Settings())
