"""
Tests Router — written test submission & evaluation.

Student Flow:
  1. Student downloads the question paper PDF
  2. Student uploads their answer sheet as a PDF
  3. POST /api/tests/:id/submit — file stored in Supabase Storage
  4. Student sees "Under evaluation" on their dashboard

Mentor/Admin Flow:
  1. Submission appears in the admin panel's Evaluations queue
  2. Mentor opens the PDF, marks it, uploads the checked copy
  3. POST /api/admin/submissions/:id/review records marks + remarks
  4. Student sees marks + checked copy on their dashboard
"""
import re
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from supabase import Client
from typing import List
import httpx

from app.core.config import get_settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.core.storage import signed_url_for
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/tests", tags=["Tests & Evaluations"])


async def _send_email_with_attachments(
    to: str,
    subject: str,
    html: str,
    attachments: list[dict],   # [{"filename": ..., "content": base64str, "type": "image/jpeg"}]
):
    """Send email via SendGrid with file attachments."""
    settings = get_settings()
    if not settings.sendgrid_api_key:
        print(f"[EMAIL STUB] To: {to} | Subject: {subject} | Attachments: {len(attachments)}")
        return

    payload = {
        "personalizations": [{"to": [{"email": to}]}],
        "from": {"email": settings.sendgrid_from_email},
        "subject": subject,
        "content": [{"type": "text/html", "value": html}],
    }
    if attachments:
        payload["attachments"] = attachments

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
            json=payload,
        )


@router.get("")
async def list_tests(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Title/description-only catalog — unlike its sibling
    GET /api/test-series/subjects/{id}/papers, this route has no purchase
    check, so it must never return the actual paper download link (that was
    previously exposed here regardless of whether the caller had bought the
    subject). Nothing in the frontend currently reads a link from this
    endpoint; the real, purchase-gated download path is the sibling route."""
    result = db.table("tests").select("*").order("created_at", desc=True).execute()
    return [
        {
            "id": t["id"],
            "title": t["title"],
            "description": t.get("description", ""),
        }
        for t in (result.data or [])
    ]


@router.get("/submissions")
async def list_submissions(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    settings = get_settings()
    user_id = current_user["id"]
    subs = (
        db.table("test_submissions")
        .select("*, test_evaluations(*), tests(title)")
        .eq("student_id", user_id)
        .execute()
    )

    result = []
    for s in (subs.data or []):
        evaluation = (s.get("test_evaluations") or [None])[0]
        test_info = s.get("tests") or {}
        checked_url = evaluation["checked_file_url"] if evaluation else None
        result.append({
            "id": s["id"],
            "testId": s["test_id"],
            "testTitle": test_info.get("title", ""),
            "status": s["status"],
            "submittedAt": s["submitted_at"],
            "marksAwarded": evaluation["marks"] if evaluation else None,
            "maxMarks": 100,
            "remarks": evaluation["remarks"] if evaluation else None,
            # Signed, short-lived — the stored value is a permanent-looking
            # public URL, but this is the student's own evaluated answer
            # sheet, so it's never handed out directly (see core/storage.py).
            "checkedFileUrl": signed_url_for(db, settings.supabase_evaluation_bucket, checked_url) if checked_url else None,
        })
    return result


@router.post("/{test_id}/submit", status_code=201)
@limiter.limit("10/minute")
async def submit_test(
    request: Request,
    test_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Student uploads their answer sheet as PDF(s). Files go to Supabase
    Storage and appear in the mentor's evaluation queue in the admin panel —
    no email provider involved, so a submission can never be silently lost."""
    settings = get_settings()

    test = db.table("tests").select("id, title, subject_id").eq("id", test_id).single().execute()
    if not test.data:
        raise HTTPException(status_code=404, detail="Test not found")

    subject_id = test.data.get("subject_id")
    if subject_id and current_user.get("role") not in {"admin", "super_admin", "mentor"}:
        enroll = (
            db.table("test_series_enrollments")
            .select("access_until")
            .eq("user_id", current_user["id"])
            .eq("subject_id", subject_id)
            .execute()
        )
        if not enroll.data:
            raise HTTPException(status_code=403, detail="Purchase this subject before submitting an answer sheet")

    MAX_BYTES = 3 * 1024 * 1024
    stored_urls = []
    for upload in files:
        if (upload.content_type or "") != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are accepted. Please combine your answer sheet into a single PDF.")
        raw = await upload.read()
        if len(raw) > MAX_BYTES:
            raise HTTPException(status_code=400, detail="Each file must be under 3MB.")
        # Content-Type is attacker-controlled and easy to spoof — also check
        # the actual file bytes start with the real PDF magic number.
        if not raw.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="File doesn't look like a valid PDF.")

        safe_filename = re.sub(r"[^A-Za-z0-9._-]", "_", upload.filename or "submission.pdf")
        path = f"submissions/{current_user['id']}/{test_id}/{uuid.uuid4().hex[:8]}-{safe_filename}"
        try:
            db.storage.from_(settings.supabase_submission_bucket).upload(
                path, raw, {"content-type": "application/pdf"}
            )
            stored_urls.append(
                f"{settings.supabase_url}/storage/v1/object/public/"
                f"{settings.supabase_submission_bucket}/{path}"
            )
        except Exception as e:
            print(f"[TESTS] Upload failed for {path}: {e}")
            raise HTTPException(status_code=500, detail="Couldn't upload your file. Please try again.")

    submission = db.table("test_submissions").insert({
        "student_id": current_user["id"],
        "test_id": test_id,
        "submission_files": stored_urls,
        "status": "pending",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return {
        "success": True,
        "submissionId": submission.data[0]["id"] if submission.data else "unknown",
        "message": "Answer sheet submitted. You'll see your marks here once a mentor has evaluated it.",
    }
