from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from typing import Optional

from app.core.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.get("")
async def list_courses(
    level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Client = Depends(get_db),
):
    query = db.table("courses").select("*")
    if level:
        query = query.eq("level", level)
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return result.data or []

@router.get("/bundles", summary="Get all available course bundle discounts")
async def list_course_bundles(db: Client = Depends(get_db)):
    result = db.table("course_bundles").select("*").execute()
    return result.data or []


@router.get("/{course_id}")
async def get_course(course_id: str, db: Client = Depends(get_db)):
    result = db.table("courses").select("*").eq("id", course_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")
    return result.data


@router.get("/{course_id}/whatsapp-access")
async def get_whatsapp_access(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Returns the WhatsApp group link only if the student is enrolled."""
    user_id = current_user["id"]

    enrollment = (
        db.table("enrollments")
        .select("course_id")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .execute()
    )
    if not enrollment.data:
        raise HTTPException(
            status_code=403,
            detail="You are not enrolled in this course",
        )

    course = db.table("courses").select("whatsapp_link, delivery_type").eq("id", course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.data.get("delivery_type") != "whatsapp":
        raise HTTPException(status_code=400, detail="This course does not have a WhatsApp group")

    link = course.data.get("whatsapp_link")
    if not link:
        raise HTTPException(status_code=404, detail="WhatsApp link not configured for this course yet")

    return {"whatsappLink": link}


@router.post("/{course_id}/enroll-free", status_code=201)
async def enroll_free(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """
    Allows a student to self-enroll in a course with price = 0 or price = NULL.
    Paid courses must go through the payment flow instead.
    """
    from datetime import datetime, timezone

    user_id = current_user["id"]

    course = db.table("courses").select("id, title, price, status").eq("id", course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.data.get("status") != "available":
        raise HTTPException(status_code=400, detail="This course is not yet available for enrollment")

    price = course.data.get("price") or 0
    if float(price) > 0:
        raise HTTPException(
            status_code=400,
            detail="This is a paid course. Please use the payment flow to enroll.",
        )

    # Check already enrolled
    existing = (
        db.table("enrollments")
        .select("user_id")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .execute()
    )
    if existing.data:
        return {"success": True, "message": "Already enrolled in this course"}

    db.table("enrollments").insert({
        "user_id": user_id,
        "course_id": course_id,
        "added_by": "purchase",
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return {"success": True, "message": f"Successfully enrolled in {course.data['title']}"}
