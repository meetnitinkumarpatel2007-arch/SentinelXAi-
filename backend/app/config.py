import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Runtime settings sourced from the .env file."""

    # .env ફાઈલ ક્યાં છે તેનો પાથ સેટ કરો
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = ""
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:5174"
    jwt_secret: str = "supersecretkey12345"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

# આ લાઈન ઉમેરવી જેથી main.py માં 'settings' વેરીએબલ સીધું મળે
settings = get_settings()