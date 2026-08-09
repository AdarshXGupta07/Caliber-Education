from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.limiter import limiter
from app.routers import auth, courses, payments, mcq, sessions, tests, contact, admin, test_series
from app.routers.coupons import router as coupons_router, admin_router as coupons_admin_router

settings = get_settings()

app = FastAPI(
    title="Caliber Education API",
    description="Backend API for the Caliber Education platform — CA prep courses, MCQ practice, 1:1 mentoring, and test evaluations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── Rate limiting (per client IP) ───────────────────────────────────────────
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    # slowapi's default handler returns {"error": ...} — every other error in
    # this API returns {"detail": ...} (FastAPI's own convention), and every
    # frontend catch block only ever reads err.detail. Keeping this
    # consistent means rate-limit errors show a real message instead of
    # silently falling back to a generic "something went wrong".
    return JSONResponse(
        status_code=429,
        content={"detail": f"Too many attempts. Please wait a moment and try again ({exc.detail})."},
    )

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(payments.router)
app.include_router(mcq.router)
app.include_router(sessions.router)
app.include_router(tests.router)
app.include_router(contact.router)
app.include_router(admin.router)
app.include_router(test_series.router)
app.include_router(coupons_router)
app.include_router(coupons_admin_router)


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "Caliber Education API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# Render's health check is hitting the literal path "/." (not "/") on this
# deployment — most HTTP clients normalize away a trailing "/." dot-segment
# before sending the request, but whatever's probing here isn't, so it 404s
# forever and Render restart-loops the service. Answering "/." directly
# sidesteps needing to chase down which Render setting controls that path.
@app.get("/.", include_in_schema=False)
async def health_check_dot():
    return await health_check()
