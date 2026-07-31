"""
Tests Router — Email-based submission flow.

Student Flow:
  1. Student views test, downloads question paper PDF link
  2. Student uploads answer photos/files
  3. POST /api/tests/:id/submit — backend emails the files as attachments to the mentor's email
  4. Student sees "Submitted" status on dashboard

Admin/Mentor Flow:
  1. Mentor receives email with student's answer sheet attached
  2. Mentor checks it offline, then logs into admin panel
  3. Admin enters marks + remarks via POST /api/admin/submissions/:id/review
  4. Student sees marks on dashboard
"""
import base64
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from supabase import Client
from typing import List
import httpx

from app.core.config import get_settings
from app.core.database import get_db
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
    result = db.table("tests").select("*").order("created_at", desc=True).execute()
    return [
        {
            "id": t["id"],
            "title": t["title"],
            "description": t.get("description", ""),
            "questionPaperLink": t["question_file_url"],
        }
        for t in (result.data or [])
    ]


@router.get("/submissions")
async def list_submissions(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
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
        result.append({
            "id": s["id"],
            "testId": s["test_id"],
            "testTitle": test_info.get("title", ""),
            "status": s["status"],
            "submittedAt": s["submitted_at"],
            "marksAwarded": evaluation["marks"] if evaluation else None,
            "maxMarks": 100,
            "remarks": evaluation["remarks"] if evaluation else None,
        })
    return result


@router.post("/{test_id}/submit", status_code=201)
async def submit_test(
    test_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """
    Student uploads answer sheet photos/PDFs.
    Backend emails them directly to the test's assigned mentor.
    No file storage bucket needed.
    """
    student_email = current_user["email"]
    student_name = student_email.split("@")[0]

    # Verify test exists + get mentor email
    test = db.table("tests").select("*, profiles(email)").eq("id", test_id).single().execute()
    if not test.data:
        raise HTTPException(status_code=404, detail="Test not found")

    test_data = test.data
    test_title = test_data.get("title", "Test")
    # Mentor email: the admin who created the test
    creator_profile = test_data.get("profiles") or {}
    mentor_email = creator_profile.get("email", "")

    # Also check if test has a linked mentor email stored directly
    # (admin can set mentor_email column — add this optionally per test)
    mentor_email = test_data.get("mentor_email") or mentor_email

    if not mentor_email:
        raise HTTPException(
            status_code=400,
            detail="No mentor email configured for this test. Please contact admin."
        )

    # Build attachments for SendGrid
    attachments = []
    filenames = []
    for upload in files:
        raw = await upload.read()
        encoded = base64.b64encode(raw).decode("utf-8")
        attachments.append({
            "content": encoded,
            "filename": upload.filename,
            "type": upload.content_type or "application/octet-stream",
            "disposition": "attachment",
        })
        filenames.append(upload.filename)

    # Send email to mentor with answer sheet attached
    await _send_email_with_attachments(
        to=mentor_email,
        subject=f"Answer Sheet: {test_title} — {student_name}",
        html=f"""
        <h2>New Answer Sheet Submission</h2>
        <p><strong>Student:</strong> {student_email}</p>
        <p><strong>Test:</strong> {test_title}</p>
        <p><strong>Files:</strong> {', '.join(filenames)}</p>
        <br/>
        <p>Please check the attachment(s), evaluate the answers, and log into the
        <strong>Admin Panel</strong> to enter the marks and remarks.</p>
        """,
        attachments=attachments,
    )

    # Record submission in DB
    submission = db.table("test_submissions").insert({
        "student_id": current_user["id"],
        "test_id": test_id,
        "submission_files": filenames,
        "status": "pending",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return {
        "success": True,
        "submissionId": submission.data[0]["id"] if submission.data else "unknown",
        "message": f"Your answer sheet has been emailed to the mentor for review. You'll see your marks here once evaluated.",
    }
