"""
Sessions Router — Request-based 1:1 flow.

Student Flow:
  1. Student visits /book-session/[mentorId]
  2. Fills a request form (preferred timing, topic, note)
  3. POST /api/sessions/request → creates pending session_bookings row + emails mentor/admin

Admin Flow:
  1. Admin sees pending requests in /api/admin/session-slots (pending status)
  2. Admin schedules a Google Meet manually, enters the link + datetime
  3. PATCH /api/admin/session-requests/:id/schedule → updates DB + emails student the meet link
"""

import html
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from supabase import Client
from typing import Optional

from app.core.config import get_settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.dependencies import get_current_user

router = APIRouter(tags=["Sessions"])


class SessionRequestBody(BaseModel):
    mentorId: str
    topic: str = Field(..., min_length=1, max_length=300)
    preferredTiming: str = Field(..., min_length=1, max_length=300)       # Free text e.g. "Weekday evenings after 7pm"
    note: Optional[str] = Field("", max_length=1000)

    @field_validator("topic", "preferredTiming")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field can't be blank")
        return v


async def _send_email_sendgrid(to: str, subject: str, html: str):
    """Send email via SendGrid. Silent fail in dev if key not set. A
    SendGrid failure (timeout, DNS blip) must never turn an already-successful
    DB write into a 500 for the caller — every call site here fires this
    after its own insert/update already committed."""
    settings = get_settings()
    if not settings.sendgrid_api_key:
        print(f"[EMAIL STUB] To: {to} | Subject: {subject}")
        return
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
                json={
                    "personalizations": [{"to": [{"email": to}]}],
                    "from": {"email": settings.sendgrid_from_email},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html}],
                },
            )
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to}: {e}")


@router.get("/api/mentors")
async def list_mentors(db: Client = Depends(get_db)):
    """Public — returns all mentors for the booking page mentor picker."""
    result = db.table("mentors").select("id, name, email, specialty").execute()
    return result.data or []


@router.post("/api/sessions/request", status_code=201)
@limiter.limit("10/minute")
async def request_session(
    request: Request,
    body: SessionRequestBody,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """
    Student submits a session request.
    - Creates a 'pending' session_bookings row (student_id set, no scheduled_at yet)
    - Emails the mentor + admin to notify them of the request
    """
    user_id = current_user["id"]
    student_email = current_user["email"]

    # Verify mentor exists
    mentor = db.table("mentors").select("*").eq("id", body.mentorId).single().execute()
    if not mentor.data:
        raise HTTPException(status_code=404, detail="Mentor not found")

    mentor_data = mentor.data
    mentor_email = mentor_data.get("email", "")

    # Insert pending session request (scheduled_at = null, status = 'booked' placeholder)
    # We repurpose google_meet_link = None, google_event_id = "PENDING" to track state
    now = datetime.now(timezone.utc).isoformat()
    result = db.table("session_bookings").insert({
        "student_id": user_id,
        "mentor_id": body.mentorId,
        "status": "booked",
        "scheduled_at": now,          # Placeholder; admin will update with real time
        "google_event_id": "PENDING", # Sentinel indicating admin hasn't scheduled yet
        "google_meet_link": None,
        "duration_minutes": 30,
    }).execute()

    booking_id = result.data[0]["id"] if result.data else "unknown"

    # Email the mentor — the student-supplied fields are HTML-escaped before
    # interpolation; unescaped, a student could embed a styled link or break
    # the email's layout in what's otherwise a trusted-sender notification.
    if mentor_email:
        await _send_email_sendgrid(
            to=mentor_email,
            subject=f"New 1:1 Session Request from {student_email}",
            html=f"""
            <h2>New Session Request</h2>
            <p><strong>Student:</strong> {html.escape(student_email)}</p>
            <p><strong>Topic:</strong> {html.escape(body.topic)}</p>
            <p><strong>Preferred Timing:</strong> {html.escape(body.preferredTiming)}</p>
            <p><strong>Note:</strong> {html.escape(body.note) if body.note else 'None'}</p>
            <br/>
            <p>Please log in to the <strong>Admin Panel</strong> to schedule this session and send the student a Google Meet link.</p>
            """,
        )

    return {
        "success": True,
        "requestId": booking_id,
        "message": f"Your session request with {mentor_data['name']} has been submitted. You'll receive an email with the Google Meet link once it's scheduled.",
    }


@router.get("/api/sessions")
async def list_sessions(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Student's 1:1 sessions — purchased, assigned, scheduled and completed."""
    user_id = current_user["id"]
    sessions = (
        db.table("session_bookings")
        .select("*, mentors(name, specialty), courses(title)")
        .eq("student_id", user_id)
        .neq("status", "cancelled")
        .order("created_at", desc=True)
        .execute()
    )

    result = []
    for s in (sessions.data or []):
        mentor_info = s.get("mentors") or {}
        course_info = s.get("courses") or {}
        result.append({
            "id": s["id"],
            "courseTitle": course_info.get("title", "1:1 Session"),
            "mentorName": mentor_info.get("name") or None,
            "specialty": mentor_info.get("specialty", ""),
            "datetime": s.get("scheduled_at"),
            "status": s.get("status", "pending_assignment"),
            "meetLink": s.get("google_meet_link"),
            "mentorNote": s.get("mentor_note"),
        })
    return {"sessions": result}


@router.post("/api/sessions/{session_id}/cancel")
async def cancel_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    user_id = current_user["id"]
    session = (
        db.table("session_bookings")
        .select("*")
        .eq("id", session_id)
        .eq("student_id", user_id)
        .single()
        .execute()
    )
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    db.table("session_bookings").update({"status": "cancelled"}).eq("id", session_id).execute()
    return {"success": True}
