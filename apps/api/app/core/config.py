from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_PAPER_STORAGE_DIR = PROJECT_ROOT / "storage" / "papers"


class Settings(BaseSettings):
    app_name: str = "DocMind API"
    app_version: str = "0.1.0"
    environment: str = "development"
    database_url: str = "sqlite:///./docmind.db"
    paper_storage_dir: Path = DEFAULT_PAPER_STORAGE_DIR

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
