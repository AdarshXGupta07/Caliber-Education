import httpx
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.config import get_settings
from app.core.database import get_db
from app.schemas.admin import ContactRequest

router = APIRouter(prefix="/api/contact", tags=["Contact"])


async def _verify_turnstile(token: str) -> bool:
    settings = get_settings()
    if not settings.turnstile_secret_key or settings.app_env == "development":
        return True
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.turnstile_secret_key, "response": token},
        )
        return res.json().get("success", False)


@router.post("")
async def submit_contact(body: ContactRequest, db: Client = Depends(get_db)):
    if not await _verify_turnstile(body.turnstileToken):
        raise HTTPException(status_code=400, detail="Bot verification failed")

    # Log contact message to DB (optional table) or just print in dev
    print(f"[CONTACT] From: {body.email} | Name: {body.name} | Msg: {body.message}")

    # TODO: Send email notification via SendGrid when SENDGRID_API_KEY is set

    return {"success": True, "message": "Your message has been received. We'll respond within 24 hours."}
