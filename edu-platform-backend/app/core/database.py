from supabase import create_client, Client
from app.core.config import get_settings

_client: Client | None = None


def get_db() -> Client:
    """Shared service-role client for data access (`.table(...)` calls).

    Never call stateful auth methods on this client (sign_in_with_otp,
    verify_otp, sign_in_with_password, reset_password_email, update_user) —
    those mutate the client's internal session, and since this instance is
    a process-wide singleton shared by every concurrent request, one user's
    login would silently swap the session out from under every other
    request until that borrowed (short-lived) token expires, at which point
    every `.table(...)` call anywhere in the app starts failing with
    "JWT expired". Use `get_auth_client()` for those instead.
    """
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


def get_auth_client() -> Client:
    """Fresh, single-use client for stateful auth operations (OTP, password
    login/reset). Never reused across requests, so it can't leak one user's
    session into another request the way the shared get_db() client would.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_key)
