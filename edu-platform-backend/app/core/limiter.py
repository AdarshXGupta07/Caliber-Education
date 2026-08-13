from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_client_ip(request: Request) -> str:
    """Render (and most PaaS) terminate the connection at their edge and
    forward to this container over an internal network — request.client.host
    (what get_remote_address reads) is Render's proxy, not the real visitor,
    so every request looked like a "new" IP and rate limiting silently never
    triggered in production. X-Forwarded-For is set by Render's own edge and
    isn't attacker-overridable there, so it's safe to trust as the real
    client IP; falls back to the raw peer address for local dev, where
    there's no proxy in front of uvicorn at all."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=get_client_ip)
