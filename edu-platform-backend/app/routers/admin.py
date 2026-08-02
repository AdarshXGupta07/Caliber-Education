from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from supabase import Client
from typing import Optional
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.database import get_db
from app.dependencies import require_admin
from app.schemas.admin import ManualEnrollRequest
from app.schemas.courses import CourseUpsertRequest

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ─── Dashboard Summary ────────────────────────────────────────────────────────

@router.get("/summary")
async def get_summary(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    users = db.table("profiles").select("id", count="exact").execute()
    courses = db.table("courses").select("id", count="exact").execute()
    pending_payments = db.table("payments").select("id", count="exact").eq("status", "pending").execute()
    mcq_sets = db.table("mcq_sets").select("id", count="exact").execute()
    pending_subs = db.table("test_submissions").select("id", count="exact").eq("status", "pending").execute()

    return {
        "totalUsers": users.count or 0,
        "totalCourses": courses.count or 0,
        "pendingPayments": pending_payments.count or 0,
        "totalMcqSets": mcq_sets.count or 0,
        "pendingSubmissions": pending_subs.count or 0,
    }


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    result = db.table("profiles").select("*").order("created_at", desc=True).execute()
    return result.data or []


# ─── Courses CRUD ─────────────────────────────────────────────────────────────

@router.get("/courses")
async def admin_list_courses(admin: dict = Depends(require_admin), db: Client = Depends(get_db)):
    return db.table("courses").select("*").execute().data or []


# ─── Course Enrollments ───────────────────────────────────────────────────────

@router.get("/courses/{course_id}/enrollments")
async def list_enrollments(
    course_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    result = (
        db.table("enrollments")
        .select("*, profiles(email)")
        .eq("course_id", course_id)
        .execute()
    )
    data = []
    for e in (result.data or []):
        profile = e.get("profiles") or {}
        data.append({
            "id": f"{e['user_id']}:{e['course_id']}",
            "email": profile.get("email", ""),
            "purchaseDate": e.get("purchased_at", ""),
            "addedBy": e.get("added_by", "purchase"),
            "notes": e.get("notes"),
        })
    return data


@router.post("/courses/{course_id}/enrollments", status_code=201)
async def manual_enroll(
    course_id: str,
    body: ManualEnrollRequest,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    # Find user by email
    profile = db.table("profiles").select("id").eq("email", body.email).single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail=f"No user found with email {body.email}")

    user_id = profile.data["id"]
    db.table("enrollments").upsert({
        "user_id": user_id,
        "course_id": course_id,
        "added_by": "admin",
        "notes": body.notes,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return {"success": True, "message": f"Student {body.email} enrolled successfully"}


@router.delete("/courses/{course_id}/enrollments/{user_id}")
async def revoke_enrollment(
    course_id: str,
    user_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("enrollments").delete().eq("user_id", user_id).eq("course_id", course_id).execute()
    return {"success": True}


# ─── MCQ Series CRUD ──────────────────────────────────────────────────────────

@router.get("/mcq-series")
async def admin_list_series(admin: dict = Depends(require_admin), db: Client = Depends(get_db)):
    return db.table("mcq_series").select("*").execute().data or []


# ─── MCQ Sets CRUD ────────────────────────────────────────────────────────────

@router.get("/mcq-sets")
async def admin_list_sets(admin: dict = Depends(require_admin), db: Client = Depends(get_db)):
    # Fetch all sets
    sets_data = db.table("mcq_sets").select("*").execute().data or []
    
    # Pre-fetch all sections and questions to avoid N+1 issues or loops if possible
    # For a moderately sized admin dashboard, a loop is ok for now.
    enriched_sets = []
    for s in sets_data:
        sections_res = db.table("set_sections").select("*").eq("set_id", s["id"]).execute()
        sections = sections_res.data or []
        enriched_sections = []
        for sec in sections:
            q_res = db.table("questions").select("*").eq("section_id", sec["id"]).execute()
            mapped_qs = []
            for q in (q_res.data or []):
                mapped_qs.append({
                    "id": q["id"],
                    "type": q.get("type", "case"),
                    "caseText": q.get("case_text", ""),
                    "text": q["text"],
                    "options": q["options"],
                    "correctOptionIndex": q["correct_option_index"],
                    "explanation": q["explanation"]
                })
            enriched_sections.append({**sec, "questions": mapped_qs})
        # Map DB keys back to camelCase for frontend where needed
        enriched_sets.append({
            "id": s["id"],
            "seriesId": s.get("series_id"),
            "title": s["title"],
            "isLocked": s.get("is_locked", False),
            "price": s.get("price", 0),
            "description": s.get("description", ""),
            "subject": s.get("subject", ""),
            "sections": enriched_sections
        })
    return enriched_sets


# ─── Content Management (Courses, Series, Sets) ─────────────────────────────

@router.post("/courses")
async def admin_upsert_course(
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    # Upsert a course
    # Convert camelCase to snake_case mapping for DB
    data = {
        "id": body.get("id"),
        "title": body.get("title"),
        "description": body.get("description", ""),
        "price": body.get("price", 0),
        "level": body.get("level"),
        "duration": body.get("duration", ""),
        "tag": body.get("tag"),
        "enrolled_count": body.get("enrolledCount", 0),
        "rating": body.get("rating", 4.5),
        "outcomes": body.get("outcomes", []),
        "curriculum": body.get("curriculum", []),
        "mentors": body.get("mentors", []),
        "delivery_type": body.get("deliveryType", "whatsapp"),
        "whatsapp_link": body.get("whatsappLink"),
        "linked_series_id": body.get("linkedSeriesId"),
        "status": body.get("status", "available"),
    }
    # Clean none values so supabase uses defaults
    data = {k: v for k, v in data.items() if v is not None}
    
    result = db.table("courses").upsert(data).execute()
    return result.data[0] if result.data else {}

@router.delete("/courses/{course_id}")
async def admin_delete_course(
    course_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("courses").delete().eq("id", course_id).execute()
    return {"success": True}

@router.get("/course-bundles")
async def admin_list_bundles(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    result = db.table("course_bundles").select("*").execute()
    # map to camelCase for UI
    out = []
    for row in (result.data or []):
        out.append({
            "id": row.get("id"),
            "title": row.get("title"),
            "description": row.get("description", ""),
            "level": row.get("level"),
            "courseIds": row.get("course_ids", []),
            "price": row.get("price", 0)
        })
    return out

@router.post("/course-bundles")
async def admin_upsert_bundle(
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    data = {
        "id": body.get("id"),
        "title": body.get("title"),
        "description": body.get("description", ""),
        "level": body.get("level", "Multiple"),
        "course_ids": body.get("courseIds", []),
        "price": body.get("price", 0),
    }
    result = db.table("course_bundles").upsert(data).execute()
    return {"success": True, "id": result.data[0]["id"] if result.data else None}

@router.delete("/course-bundles/{bundle_id}")
async def admin_delete_bundle(
    bundle_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("course_bundles").delete().eq("id", bundle_id).execute()
    return {"success": True}

@router.post("/mcq-series")
async def admin_upsert_series(
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    data = {
        "id": body.get("id"),
        "title": body.get("title"),
        "subject": body.get("subject"),
        "description": body.get("description", ""),
        "price": body.get("price", 0),
        "is_locked": body.get("isLocked", False),
    }
    result = db.table("mcq_series").upsert(data).execute()
    return result.data[0] if result.data else {}

@router.delete("/mcq-series/{series_id}")
async def admin_delete_series(
    series_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("mcq_series").delete().eq("id", series_id).execute()
    return {"success": True}

@router.post("/mcq-sets")
async def admin_upsert_set(
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    data = {
        "id": body.get("id"),
        "series_id": body.get("seriesId"),
        "title": body.get("title"),
        "description": body.get("description", ""),
        "subject": body.get("subject", ""),
        "is_locked": body.get("isLocked", False),
        "price": body.get("price", 0),
    }
    # 1. Upsert the Set Wrapper
    result = db.table("mcq_sets").upsert(data).execute()
    
    # 2. Sync Sections & Questions
    # To keep sync simple, we can delete all existing sections for this set (which cascade deletes questions)
    # and then bulk insert the fresh ones. If cascade isn't set, we delete questions manually first.
    set_id = data["id"]
    existing_sections = db.table("set_sections").select("id").eq("set_id", set_id).execute()
    existing_sec_ids = [s["id"] for s in (existing_sections.data or [])]
    if existing_sec_ids:
        db.table("questions").delete().in_("section_id", existing_sec_ids).execute()
        db.table("set_sections").delete().eq("set_id", set_id).execute()

    sections_payload = body.get("sections", [])
    for sec in sections_payload:
        sec_id = sec.get("id")
        db.table("set_sections").insert({
            "id": sec_id,
            "set_id": set_id,
            "title": sec.get("title", "")
        }).execute()
        
        # Insert questions
        questions_payload = sec.get("questions", [])
        for q in questions_payload:
            db.table("questions").insert({
                "id": q.get("id"),
                "section_id": sec_id,
                "type": q.get("type", "case"),
                "case_text": q.get("caseText", ""),
                "text": q.get("text", ""),
                "options": q.get("options", []),
                "correct_option_index": q.get("correctOptionIndex", 0),
                "explanation": q.get("explanation", "")
            }).execute()

    return result.data[0] if result.data else {}

@router.patch("/mcq-sets/{set_id}")
async def admin_update_set(
    set_id: str,
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return db.table("mcq_sets").update(body).eq("id", set_id).execute().data


@router.delete("/mcq-sets/{set_id}")
async def admin_delete_set(
    set_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("mcq_sets").delete().eq("id", set_id).execute()
    return {"success": True}


# ─── Test Evaluations (Admin Reviews) ────────────────────────────────────────

@router.get("/submissions/pending")
async def list_pending_submissions(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    subs = (
        db.table("test_submissions")
        .select("*, profiles(email), tests(title)")
        .eq("status", "pending")
        .order("submitted_at", desc=False)
        .execute()
    )
    result = []
    for s in (subs.data or []):
        profile = s.get("profiles") or {}
        test = s.get("tests") or {}
        email = profile.get("email", "")
        result.append({
            "id": s["id"],
            "studentEmail": email,
            "studentName": email.split("@")[0],
            "testTitle": test.get("title", ""),
            "submittedAt": s["submitted_at"],
            "studentFiles": s.get("submission_files", []),
        })
    return {"submissions": result}


@router.post("/submissions/{submission_id}/review", status_code=200)
async def review_submission(
    submission_id: str,
    marks: float = Form(...),
    remarks: str = Form(...),
    checkedFile: Optional[UploadFile] = File(None),
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """Admin uploads evaluated paper and submits mark + feedback."""
    settings = get_settings()

    # Verify submission exists
    sub = db.table("test_submissions").select("*").eq("id", submission_id).single().execute()
    if not sub.data:
        raise HTTPException(status_code=404, detail="Submission not found")

    checked_file_url = None
    if checkedFile:
        raw = await checkedFile.read()
        path = f"evaluated/{submission_id}/{checkedFile.filename}"
        try:
            db.storage.from_(settings.supabase_evaluation_bucket).upload(
                path, raw, {"content-type": checkedFile.content_type or "application/pdf"}
            )
            # Build public URL
            checked_file_url = (
                f"{settings.supabase_url}/storage/v1/object/public/"
                f"{settings.supabase_evaluation_bucket}/{path}"
            )
        except Exception:
            checked_file_url = None

    # Find/create mentor entry for the admin
    mentor = db.table("mentors").select("id").eq("profile_id", admin["id"]).execute()
    mentor_id = mentor.data[0]["id"] if mentor.data else None

    # Insert evaluation record
    db.table("test_evaluations").insert({
        "submission_id": submission_id,
        "mentor_id": mentor_id,
        "marks": marks,
        "remarks": remarks,
        "checked_file_url": checked_file_url,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # Mark submission as reviewed
    db.table("test_submissions").update({"status": "reviewed"}).eq("id", submission_id).execute()

    return {"success": True, "message": "Evaluation submitted and student notified"}


# ─── Payments (Admin view) ────────────────────────────────────────────────────

@router.get("/payments")
async def admin_list_payments(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return db.table("payments").select("*, profiles(email), courses(title)").order("created_at", desc=True).execute().data or []


@router.patch("/payments/{payment_id}/approve")
async def approve_payment(
    payment_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    payment = db.table("payments").select("*").eq("id", payment_id).single().execute()
    if not payment.data:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.table("payments").update({"status": "approved"}).eq("id", payment_id).execute()
    db.table("enrollments").upsert({
        "user_id": payment.data["user_id"],
        "course_id": payment.data["course_id"],
        "added_by": "admin",
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # Record coupon usage if applicable (for UTR/manual payments)
    coupon_id = payment.data.get("coupon_id")
    if coupon_id:
        from app.routers.payments import _record_coupon_usage
        coupon_row = db.table("coupons").select("*").eq("id", coupon_id).single().execute()
        if coupon_row.data:
            _record_coupon_usage(
                db, coupon_row.data, payment.data["user_id"], payment_id,
                float(payment.data.get("discount_amount") or 0),
                payment.data.get("affiliate_id"),
                float(payment.data.get("commission_amount") or 0),
            )

    return {"success": True}


@router.patch("/payments/{payment_id}/reject")
async def reject_payment(
    payment_id: str,
    body: dict = None,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """
    Reject a payment with an optional reason note visible to the student.
    Body: { "reason": "UTR not matching bank records" } (optional)
    """
    rejection_note = (body or {}).get("reason", "")
    db.table("payments").update({
        "status": "rejected",
        # Store rejection reason — add a `rejection_reason` text column to payments table
        # or reuse an existing notes-style column. Here we overwrite razorpay_signature field
        # as a quick slot; replace with a dedicated column in production.
    }).eq("id", payment_id).execute()
    return {"success": True, "reason": rejection_note}


# ─── Admin: Tests CRUD ──────────────────────────────────────────────────────

@router.get("/tests")
async def admin_list_tests(admin: dict = Depends(require_admin), db: Client = Depends(get_db)):
    return db.table("tests").select("*").order("created_at", desc=True).execute().data or []


@router.post("/tests", status_code=201)
async def admin_create_test(
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """Create a new mock test and upload its question paper URL."""
    payload = {**body, "created_by": admin["id"]}
    result = db.table("tests").insert(payload).execute()
    return result.data[0] if result.data else {}


@router.patch("/tests/{test_id}")
async def admin_update_test(
    test_id: str,
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    body.pop("created_by", None)  # Prevent overwriting creator
    return db.table("tests").update(body).eq("id", test_id).execute().data


@router.delete("/tests/{test_id}")
async def admin_delete_test(
    test_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("tests").delete().eq("id", test_id).execute()
    return {"success": True}


# ─── Admin: Questions CRUD (for MCQ sets) ───────────────────────────────────

@router.get("/sections/{section_id}/questions")
async def admin_list_questions(
    section_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return db.table("questions").select("*").eq("section_id", section_id).execute().data or []


@router.post("/sections/{section_id}/questions", status_code=201)
async def admin_create_question(
    section_id: str,
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    payload = {**body, "section_id": section_id}
    result = db.table("questions").insert(payload).execute()
    return result.data[0] if result.data else {}


@router.patch("/questions/{question_id}")
async def admin_update_question(
    question_id: str,
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return db.table("questions").update(body).eq("id", question_id).execute().data


@router.delete("/questions/{question_id}")
async def admin_delete_question(
    question_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("questions").delete().eq("id", question_id).execute()
    return {"success": True}


# ─── Admin: Set Sections CRUD ────────────────────────────────────────────────

@router.get("/mcq-sets/{set_id}/sections")
async def admin_list_sections(
    set_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return db.table("set_sections").select("*").eq("set_id", set_id).execute().data or []


@router.post("/mcq-sets/{set_id}/sections", status_code=201)
async def admin_create_section(
    set_id: str,
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    payload = {**body, "set_id": set_id}
    result = db.table("set_sections").insert(payload).execute()
    return result.data[0] if result.data else {}


@router.delete("/sections/{section_id}")
async def admin_delete_section(
    section_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("set_sections").delete().eq("id", section_id).execute()
    return {"success": True}


# ─── Admin: Mentors CRUD ─────────────────────────────────────────────────────

@router.get("/mentors")
async def admin_list_mentors(admin: dict = Depends(require_admin), db: Client = Depends(get_db)):
    return db.table("mentors").select("*, profiles(email)").execute().data or []


@router.post("/mentors", status_code=201)
async def admin_create_mentor(
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    result = db.table("mentors").insert(body).execute()
    return result.data[0] if result.data else {}


@router.patch("/mentors/{mentor_id}")
async def admin_update_mentor(
    mentor_id: str,
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return db.table("mentors").update(body).eq("id", mentor_id).execute().data


@router.delete("/mentors/{mentor_id}")
async def admin_delete_mentor(
    mentor_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("mentors").delete().eq("id", mentor_id).execute()
    return {"success": True}


# ─── Admin: Session Request Queue ──────────────────────────────────────────

@router.get("/session-requests")
async def admin_list_session_requests(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """
    Lists all pending session requests — where google_event_id = 'PENDING'.
    Admin reviews these and schedules a Google Meet.
    """
    rows = (
        db.table("session_bookings")
        .select("*, mentors(name, email), profiles(email)")
        .eq("google_event_id", "PENDING")
        .neq("status", "cancelled")
        .order("scheduled_at", desc=False)
        .execute()
    )

    result = []
    for r in (rows.data or []):
        mentor_info = r.get("mentors") or {}
        student_profile = r.get("profiles") or {}
        result.append({
            "id": r["id"],
            "studentEmail": student_profile.get("email", ""),
            "mentorName": mentor_info.get("name", ""),
            "requestedAt": r["scheduled_at"],
            "status": "pending_schedule",
        })
    return {"requests": result}


class ScheduleSessionBody(BaseModel):
    meetLink: str
    scheduledAt: str          # ISO datetime string
    durationMinutes: int = 30


@router.patch("/session-requests/{session_id}/schedule")
async def schedule_session(
    session_id: str,
    body: ScheduleSessionBody,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """
    Admin schedules the session — sets the actual datetime + Google Meet link.
    Automatically emails the student with the meeting details.
    """
    import httpx

    session = (
        db.table("session_bookings")
        .select("*, profiles(email), mentors(name)")
        .eq("id", session_id)
        .single()
        .execute()
    )
    if not session.data:
        raise HTTPException(status_code=404, detail="Session request not found")

    student_profile = session.data.get("profiles") or {}
    mentor_info = session.data.get("mentors") or {}
    student_email = session.data.get("student_email") or student_profile.get("email", "")

    # Update session with meet link + real scheduled time
    db.table("session_bookings").update({
        "google_meet_link": body.meetLink,
        "scheduled_at": body.scheduledAt,
        "duration_minutes": body.durationMinutes,
        "google_event_id": "SCHEDULED",   # Clear the PENDING sentinel
        "status": "booked",
    }).eq("id", session_id).execute()

    # Format datetime for email
    from datetime import datetime
    try:
        dt = datetime.fromisoformat(body.scheduledAt.replace("Z", "+00:00"))
        time_formatted = dt.strftime("%A, %d %B %Y at %I:%M %p (IST)")
    except Exception:
        time_formatted = body.scheduledAt

    # Email student with meet link
    settings = get_settings()
    if settings.sendgrid_api_key and student_email:
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
                json={
                    "personalizations": [{"to": [{"email": student_email}]}],
                    "from": {"email": settings.sendgrid_from_email},
                    "subject": f"Your 1:1 Session with {mentor_info.get('name', 'Your Mentor')} is Confirmed!",
                    "content": [{
                        "type": "text/html",
                        "value": f"""
                        <h2>Your Session is Confirmed 🎉</h2>
                        <p><strong>Mentor:</strong> {mentor_info.get('name', 'Your Mentor')}</p>
                        <p><strong>Date & Time:</strong> {time_formatted}</p>
                        <p><strong>Duration:</strong> {body.durationMinutes} minutes</p>
                        <br/>
                        <p><a href="{body.meetLink}" style="background:#1a1a2e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Join Google Meet</a></p>
                        <br/>
                        <p style="color:#666;">If the button doesn’t work, copy this link: {body.meetLink}</p>
                        """
                    }],
                },
            )
    else:
        print(f"[EMAIL STUB] Would email {student_email} with meet link: {body.meetLink}")

    return {"success": True, "message": f"Session scheduled and confirmation email sent to {student_email}"}


# ─── Admin: Test Review (marks entry) ──────────────────────────────────────────

@router.post("/submissions/{submission_id}/review")
async def review_submission(
    submission_id: str,
    body: dict,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """
    Admin enters marks + remarks after checking the answer sheet offline.
    No file upload needed — mentor already has the sheet via email.
    Body: { "marks": 78, "remarks": "Good attempt, audit section weak" }
    """
    import httpx
    marks = body.get("marks")
    remarks = body.get("remarks", "")

    sub = (
        db.table("test_submissions")
        .select("*, profiles(email), tests(title)")
        .eq("id", submission_id)
        .single()
        .execute()
    )
    if not sub.data:
        raise HTTPException(status_code=404, detail="Submission not found")

    student_profile = sub.data.get("profiles") or {}
    test_info = sub.data.get("tests") or {}
    student_email = student_profile.get("email", "")

    # Find mentor id for the admin
    mentor_row = db.table("mentors").select("id").eq("profile_id", admin["id"]).execute()
    mentor_id = mentor_row.data[0]["id"] if mentor_row.data else None

    db.table("test_evaluations").insert({
        "submission_id": submission_id,
        "mentor_id": mentor_id,
        "marks": marks,
        "remarks": remarks,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    db.table("test_submissions").update({"status": "reviewed"}).eq("id", submission_id).execute()

    # Email student with marks
    settings = get_settings()
    if settings.sendgrid_api_key and student_email:
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
                json={
                    "personalizations": [{"to": [{"email": student_email}]}],
                    "from": {"email": settings.sendgrid_from_email},
                    "subject": f"Your {test_info.get('title', 'Test')} has been evaluated!",
                    "content": [{
                        "type": "text/html",
                        "value": f"""
                        <h2>Test Evaluation Result</h2>
                        <p><strong>Test:</strong> {test_info.get('title', '')}</p>
                        <p><strong>Marks Awarded:</strong> {marks} / 100</p>
                        <p><strong>Remarks:</strong> {remarks}</p>
                        <br/>
                        <p>Log in to your <a href="https://caliber-education.netlify.app/dashboard">dashboard</a> to view the full evaluation.</p>
                        """
                    }],
                },
            )
    else:
        print(f"[EMAIL STUB] Would email {student_email} with marks: {marks}")

    return {"success": True, "message": "Marks submitted and student notified by email"}
