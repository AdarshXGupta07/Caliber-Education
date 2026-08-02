from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.mcq import QuizAttemptRequest

router = APIRouter(tags=["MCQ & Quizzes"])


# ─── MCQ Series ───────────────────────────────────────────────────────────────

@router.get("/api/mcq-series")
async def list_series(db: Client = Depends(get_db)):
    result = db.table("mcq_series").select("*").execute()
    return result.data or []


@router.get("/api/mcq-series/{series_id}")
async def get_series(series_id: str, db: Client = Depends(get_db)):
    series = db.table("mcq_series").select("*").eq("id", series_id).single().execute()
    if not series.data:
        raise HTTPException(status_code=404, detail="Series not found")

    sets = db.table("mcq_sets").select(
        "id, title, is_locked, price, description, subject, topper_score, topper_total_time_seconds"
    ).eq("series_id", series_id).execute()

    return {**series.data, "sets": sets.data or []}


# ─── Quiz Sets / Attempts / Leaderboard ──────────────────────────────────────

@router.get("/api/quizzes/{set_id}")
async def get_quiz(set_id: str, db: Client = Depends(get_db)):
    """Returns full quiz with sections and questions."""
    mcq_set = db.table("mcq_sets").select("*").eq("id", set_id).single().execute()
    if not mcq_set.data:
        raise HTTPException(status_code=404, detail="Quiz set not found")

    # Fetch sections
    sections_res = db.table("set_sections").select("*").eq("set_id", set_id).execute()
    sections = sections_res.data or []

    enriched_sections = []
    for section in sections:
        questions_res = (
            db.table("questions")
            .select("*")
            .eq("section_id", section["id"])
            .execute()
        )
        mapped_questions = []
        for q in (questions_res.data or []):
            mapped_questions.append({
                "id": q["id"],
                "type": q.get("type", "normal"),
                "caseText": q.get("case_text", ""),
                "text": q["text"],
                "options": q["options"],
                "correctOptionIndex": q["correct_option_index"],
                "explanation": q["explanation"]
            })
        enriched_sections.append({**section, "questions": mapped_questions})

    data = mcq_set.data
    return {
        "id": data["id"],
        "seriesId": data.get("series_id"),
        "title": data["title"],
        "isLocked": data.get("is_locked", True),
        "price": data.get("price", 0),
        "description": data.get("description", ""),
        "subject": data.get("subject", ""),
        "topperStats": {
            "score": data.get("topper_score", 0),
            "totalTimeSeconds": data.get("topper_total_time_seconds", 0),
            "perQuestionTimes": data.get("topper_per_question_times", []),
        },
        "sections": enriched_sections,
    }


@router.post("/api/quizzes/{set_id}/attempts", status_code=201)
async def submit_attempt(
    set_id: str,
    body: QuizAttemptRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    user_id = current_user["id"]

    # Insert attempt
    attempt = db.table("quiz_attempts").insert({
        "user_id": user_id,
        "set_id": set_id,
        "score": body.score,
        "total": body.total,
        "elapsed_seconds": body.elapsedSeconds,
        "per_question_times": body.perQuestionTimes,
    }).execute()

    attempt_id = attempt.data[0]["id"] if attempt.data else "unknown"

    # Calculate rank: count attempts with better score, or same score but faster time
    better = (
        db.table("quiz_attempts")
        .select("id")
        .eq("set_id", set_id)
        .or_(
            f"score.gt.{body.score},"
            f"and(score.eq.{body.score},elapsed_seconds.lt.{body.elapsedSeconds})"
        )
        .execute()
    )
    rank = len(better.data or []) + 1

    total_res = db.table("quiz_attempts").select("id", count="exact").eq("set_id", set_id).execute()
    total_competitors = total_res.count or 1

    return {
        "success": True,
        "attemptId": attempt_id,
        "rank": rank,
        "totalCompetitors": total_competitors,
    }


@router.get("/api/quizzes/{set_id}/leaderboard")
async def get_leaderboard(
    set_id: str,
    current_user: dict | None = Depends(lambda: None),
    db: Client = Depends(get_db),
):
    """Returns top 20 attempts sorted by score desc, then time asc."""
    attempts = (
        db.table("quiz_attempts")
        .select("user_id, score, elapsed_seconds")
        .eq("set_id", set_id)
        .order("score", desc=True)
        .order("elapsed_seconds", desc=False)
        .limit(20)
        .execute()
    )

    # Resolve profile emails for display names
    board = []
    for a in (attempts.data or []):
        profile = db.table("profiles").select("email").eq("id", a["user_id"]).single().execute()
        email = profile.data.get("email", "Student") if profile.data else "Student"
        name = email.split("@")[0]
        board.append({
            "name": name,
            "score": a["score"],
            "time": a["elapsed_seconds"],
            "isUser": False,  # frontend enriches this with the current user's attempt
        })
    return board
