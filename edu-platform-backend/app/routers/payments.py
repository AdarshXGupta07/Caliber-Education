import hashlib
import hmac
from datetime import datetime, timezone
from typing import Optional

import razorpay
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from app.core.config import get_settings
from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.payments import CreateOrderRequest, VerifyPaymentRequest

router = APIRouter(prefix="/api/payments", tags=["Payments"])


class SubmitUTRRequest(BaseModel):
    courseId: str
    utrNumber: str


def _get_razorpay_client():
    settings = get_settings()
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        return None
    return razorpay.Client(
        auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
    )


@router.post("/create-order", status_code=201)
async def create_order(
    body: CreateOrderRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    settings = get_settings()

    # Fetch course price
    course = db.table("courses").select("id, title, price").eq("id", body.courseId).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    price = course.data.get("price") or 0
    amount_paise = int(float(price) * 100)

    rzp = _get_razorpay_client()
    if rzp:
        try:
            order = rzp.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"course_{body.courseId[:20]}",
                "notes": {
                    "course_id": body.courseId,
                    "user_id": current_user["id"],
                },
            })
            order_id = order["id"]
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Razorpay error: {str(e)}")
    else:
        # Stub for dev/testing without Razorpay keys
        import uuid
        order_id = f"order_DEMO_{uuid.uuid4().hex[:12].upper()}"

    # Insert pending payment record
    db.table("payments").insert({
        "user_id": current_user["id"],
        "course_id": body.courseId,
        "amount": price,
        "status": "pending",
        "razorpay_order_id": order_id,
    }).execute()

    return {
        "orderId": order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key": settings.razorpay_key_id or "rzp_test_demo",
    }


@router.post("/verify-payment")
async def verify_payment(
    body: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    settings = get_settings()
    user_id = current_user["id"]

    # Verify HMAC-SHA256 signature
    if settings.razorpay_key_secret:
        msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode()
        expected = hmac.new(
            settings.razorpay_key_secret.encode(), msg, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected, body.razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Find the pending payment row
    payment = (
        db.table("payments")
        .select("*")
        .eq("razorpay_order_id", body.razorpay_order_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not payment.data:
        raise HTTPException(status_code=404, detail="Payment record not found")

    course_id = payment.data["course_id"]

    # Mark payment approved
    db.table("payments").update({
        "status": "approved",
        "razorpay_payment_id": body.razorpay_payment_id,
        "razorpay_signature": body.razorpay_signature,
    }).eq("id", payment.data["id"]).execute()

    # Enroll student
    db.table("enrollments").upsert({
        "user_id": user_id,
        "course_id": course_id,
        "added_by": "purchase",
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return {"success": True, "message": "Payment verified and enrollment completed"}


# ─── Manual UTR Payment Path ──────────────────────────────────────────────────

@router.post("/verify-utr", status_code=201)
async def submit_utr(
    body: SubmitUTRRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """
    Student submits a UTR number after completing a manual bank/UPI transfer.
    Admin then approves or rejects via /api/admin/payments.
    """
    user_id = current_user["id"]

    course = db.table("courses").select("id, title, price").eq("id", body.courseId).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    price = course.data.get("price") or 0

    # Check duplicate UTR
    existing = db.table("payments").select("id").eq("utr_number", body.utrNumber).execute()
    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="This UTR number has already been submitted. Contact support if this is an error.",
        )

    result = db.table("payments").insert({
        "user_id": user_id,
        "course_id": body.courseId,
        "amount": price,
        "status": "pending",
        "utr_number": body.utrNumber,
    }).execute()

    return {
        "success": True,
        "verification": {
            "id": result.data[0]["id"] if result.data else "unknown",
            "studentEmail": current_user["email"],
            "courseTitle": course.data["title"],
            "amount": price,
            "date": datetime.now(timezone.utc).date().isoformat(),
            "status": "pending",
            "utrNumber": body.utrNumber,
        },
    }
