from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/cat_life_ai"
    redis_url: str = "redis://localhost:6379"
    openai_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
