import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client

from app.core.config import get_settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.schemas.admin import ContactRequest

router = APIRouter(prefix="/api/contact", tags=["Contact"])


async def _verify_turnstile(token: str) -> bool:
    settings = get_settings()
    if settings.app_env == "development":
        return True
    if not settings.turnstile_secret_key:
        return False  # fail closed outside dev
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.turnstile_secret_key, "response": token},
        )
        return res.json().get("success", False)


@router.post("")
@limiter.limit("5/minute")
async def submit_contact(request: Request, body: ContactRequest, db: Client = Depends(get_db)):
    if not await _verify_turnstile(body.turnstileToken):
        raise HTTPException(status_code=400, detail="Bot verification failed")

    print(f"[CONTACT] From: {body.email} | Name: {body.name} | Msg: {body.message}")

    # Persisted to the DB and surfaced in the admin panel — no third-party
    # email sender involved, so a message can never be silently lost.
    try:
        db.table("contact_messages").insert({
            "name": body.name,
            "email": body.email,
            "message": body.message,
        }).execute()
    except Exception as e:
        print(f"[CONTACT] Failed to store message: {e}")
        raise HTTPException(status_code=500, detail="Couldn't send your message. Please try again.")

    return {"success": True, "message": "Your message has been received. We'll respond within 24 hours."}
