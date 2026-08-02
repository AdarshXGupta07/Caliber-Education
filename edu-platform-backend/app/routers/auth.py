import random
import string
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.dependencies import get_current_user
from pydantic import BaseModel
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterInitRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    VerifyOTPRequest,
)

class GoogleExchangeRequest(BaseModel):
    access_token: str

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# In-memory OTP store for development (use Redis/DB in production)
_otp_store: dict[str, dict] = {}


async def _verify_turnstile(token: str) -> bool:
    """Validates Cloudflare Turnstile token. Returns True in dev if no secret set."""
    settings = get_settings()
    if not settings.turnstile_secret_key or settings.app_env == "development":
        return True  # Skip validation in dev
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.turnstile_secret_key, "response": token},
        )
        data = res.json()
        return data.get("success", False)


@router.post("/register-init")
async def register_init(body: RegisterInitRequest):
    """Step 1: Request OTP for email registration."""
    if not await _verify_turnstile(body.turnstileToken):
        raise HTTPException(status_code=400, detail="Bot verification failed")

    otp = "123456"  # Fixed for dev/demo; replace with random for production
    if get_settings().app_env == "production":
        otp = "".join(random.choices(string.digits, k=6))

    _otp_store[body.email] = {
        "otp": otp,
        "expires": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    # TODO: Send real OTP via SendGrid when SENDGRID_API_KEY is set

    env = get_settings().app_env
    msg = f"OTP sent to {body.email}" if env == "production" else f"Dev OTP: {otp} (sent to {body.email})"
    print(f"[AUTH] {msg}")
    return {"success": True, "message": "OTP sent successfully"}


@router.post("/verify-otp")
async def verify_otp(body: VerifyOTPRequest):
    """Step 2: Verify OTP and get temp token."""
    entry = _otp_store.get(body.email)
    if not entry:
        raise HTTPException(status_code=401, detail="No OTP requested for this email")

    if datetime.now(timezone.utc) > entry["expires"]:
        _otp_store.pop(body.email, None)
        raise HTTPException(status_code=401, detail="OTP expired. Request a new one.")

    if entry["otp"] != body.otp:
        raise HTTPException(status_code=401, detail="Incorrect OTP")

    _otp_store.pop(body.email, None)  # OTP is single-use
    # Issue a short-lived temp token (15 min) to carry email through step 3
    temp_token = create_access_token(
        {"sub": f"otp:{body.email}", "purpose": "registration"}, expires_days=0
    )
    # We need minutes-level expiry — use seconds trick
    from datetime import timedelta as _td
    from jose import jwt as _jwt
    settings = get_settings()
    import time
    temp_token = _jwt.encode(
        {"sub": f"otp:{body.email}", "purpose": "registration", "exp": time.time() + 900},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    return {"success": True, "tempToken": temp_token}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: Client = Depends(get_db)):
    """Step 3: Create account with validated email + password."""
    settings = get_settings()
    # Validate temp token
    from jose import jwt as _jwt, JWTError
    try:
        payload = _jwt.decode(body.tempToken, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        sub: str = payload.get("sub", "")
        purpose = payload.get("purpose", "")
        if not sub.startswith("otp:") or purpose != "registration":
            raise ValueError
        email_from_token = sub.replace("otp:", "")
        if email_from_token.lower() != body.email.lower():
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired temp token")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Create user in Supabase Auth
    try:
        auth_res = db.auth.sign_up({"email": body.email, "password": body.password})
    except Exception as e:
        raise HTTPException(status_code=409, detail="Email already registered")

    if not auth_res.user:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(auth_res.user.id)

    # profiles row is created by Supabase trigger — ensure it exists
    session_id = str(uuid.uuid4())
    db.table("profiles").upsert({
        "id": user_id,
        "email": body.email,
        "role": "student",
        "active_session_id": session_id
    }).execute()

    token = create_access_token({"sub": user_id, "email": body.email, "role": "student", "session_id": session_id})
    return TokenResponse(
        token=token,
        user=UserResponse(id=user_id, email=body.email, role="student"),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Client = Depends(get_db)):
    """Login with email and password."""
    if not await _verify_turnstile(body.turnstileToken):
        raise HTTPException(status_code=400, detail="Bot verification failed")

    try:
        auth_res = db.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not auth_res.user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    user_id = str(auth_res.user.id)

    # Fetch profile for role
    profile = db.table("profiles").select("*").eq("id", user_id).single().execute()
    role = profile.data.get("role", "student") if profile.data else "student"

    session_id = str(uuid.uuid4())
    db.table("profiles").update({"active_session_id": session_id}).eq("id", user_id).execute()

    token = create_access_token({"sub": user_id, "email": body.email, "role": role, "session_id": session_id})
    return TokenResponse(
        token=token,
        user=UserResponse(id=user_id, email=body.email, role=role),
    )


@router.get("/google/url")
async def get_google_auth_url():
    """Return the Supabase Google OAuth authorize URL."""
    settings = get_settings()
    # E.g., http://localhost:3000/auth/callback
    redirect_to = f"{settings.frontend_url}/auth/callback"
    # Construct manually or via library (constructing manually is more robust here)
    supabase_url = settings.supabase_url
    url = f"{supabase_url}/auth/v1/authorize?provider=google&redirect_to={redirect_to}"
    return {"url": url}


@router.post("/google/exchange", response_model=TokenResponse)
async def google_exchange(body: GoogleExchangeRequest, db: Client = Depends(get_db)):
    """Exchange Supabase token for our custom JWT."""
    try:
        # Validate the token directly via Supabase Auth
        res = db.auth.get_user(body.access_token)
    except Exception as e:
        print(f"Supabase Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")

    if not res.user:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user_id = str(res.user.id)
    email = res.user.email

    try:
        # Try to fetch existing profile without .single() to avoid exception on 0 rows
        profile_res = db.table("profiles").select("*").eq("id", user_id).execute()
        role = "student"
        session_id = str(uuid.uuid4())
        
        if profile_res.data:
            role = profile_res.data[0].get("role", "student")
            db.table("profiles").update({"active_session_id": session_id}).eq("id", user_id).execute()
        else:
            # Create profile safely if it doesn't exist
            db.table("profiles").upsert({"id": user_id, "email": email, "role": "student", "active_session_id": session_id}).execute()
    except Exception as e:
        print(f"Database error during profile fetch/create: {e}")
        role = "student"
        session_id = str(uuid.uuid4())

    # Generate custom caliber jwt
    token = create_access_token({"sub": user_id, "email": email, "role": role, "session_id": session_id})
    
    return TokenResponse(
        token=token,
        user=UserResponse(id=user_id, email=email, role=role),
    )


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Return current user profile with enrolled courses and recent quiz attempts."""
    user_id = current_user["id"]

    enrollments = db.table("enrollments").select("course_id, purchased_at").eq("user_id", user_id).execute()
    enrolled_ids = [e["course_id"] for e in (enrollments.data or [])]

    attempts = (
        db.table("quiz_attempts")
        .select("set_id, score, total, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )

    # Fetch extended profile info, safely falling back if missing
    profile_data = {}
    try:
        profile = db.table("profiles").select("full_name, phone_number, address, stage, attempt_status").eq("id", user_id).single().execute()
        if profile.data:
            profile_data = profile.data
    except Exception:
        pass

    return {
        "user": {**current_user, **profile_data},
        "purchases": enrolled_ids,
        "attempts": attempts.data or [],
    }

class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    address: str | None = None
    stage: str | None = None
    attempt_status: str | None = None

@router.put("/profile")
async def update_profile(body: ProfileUpdateRequest, current_user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Update user's extended profile details."""
    user_id = current_user["id"]
    update_data = {}
    if body.full_name is not None: update_data["full_name"] = body.full_name
    if body.phone_number is not None: update_data["phone_number"] = body.phone_number
    if body.address is not None: update_data["address"] = body.address
    if body.stage is not None: update_data["stage"] = body.stage
    if body.attempt_status is not None: update_data["attempt_status"] = body.attempt_status
    
    if not update_data:
        return {"success": True}

    try:
        db.table("profiles").update(update_data).eq("id", user_id).execute()
    except Exception as e:
        print(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Could not update profile information")
        
    return {"success": True, "message": "Profile updated successfully"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: Client = Depends(get_db)):
    if not await _verify_turnstile(body.turnstileToken):
        raise HTTPException(status_code=400, detail="Bot verification failed")
    try:
        db.auth.reset_password_email(body.email)
    except Exception:
        pass  # Always respond 200 to prevent user enumeration
    return {"success": True, "message": "If this email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: Client = Depends(get_db)):
    if len(body.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    try:
        db.auth.update_user({"password": body.newPassword})
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    return {"success": True, "message": "Password updated successfully"}
