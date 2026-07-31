from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_key: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    # Cloudflare Turnstile
    turnstile_secret_key: str = ""

    # SendGrid
    sendgrid_api_key: str = ""
    sendgrid_from_email: str = "noreply@calibereducation.com"

    # Supabase Storage Buckets
    supabase_submission_bucket: str = "test-submissions"
    supabase_evaluation_bucket: str = "evaluated-papers"

    # App
    frontend_url: str = "http://localhost:3000"
    app_env: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
