from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "SmartHire AI"
    debug: bool = False
    database_url: str = "sqlite:///./smarthire.db"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    cors_origins: str = "*"
    max_upload_mb: int = 10
    frontend_dir: str = ".."
    vercel: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    import os

    settings = Settings()
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        # Writable path on Vercel serverless
        if settings.database_url.startswith("sqlite:///./"):
            object.__setattr__(settings, "database_url", "sqlite:////tmp/smarthire.db")
        object.__setattr__(settings, "vercel", True)
    return settings
