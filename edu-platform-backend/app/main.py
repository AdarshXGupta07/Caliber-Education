from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, courses, payments, mcq, sessions, tests, contact, admin

settings = get_settings()

app = FastAPI(
    title="Caliber Education API",
    description="Backend API for the Caliber Education platform — CA prep courses, MCQ practice, 1:1 mentoring, and test evaluations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
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


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "Caliber Education API",
        "version": "1.0.0",
        "docs": "/docs",
    }
