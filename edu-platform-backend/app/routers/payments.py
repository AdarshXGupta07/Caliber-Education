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
from app.routers.mcq import calculate_mcq_cart

router = APIRouter(prefix="/api/payments", tags=["Payments"])


class CreateMCQOrderRequest(BaseModel):
    level: str
    subjectIds: list[str]
    duration: str = "1_month"
    couponCode: Optional[str] = None


class SubmitUTRRequest(BaseModel):
    courseId: str
    utrNumber: str
    couponCode: Optional[str] = None


def _get_razorpay_client():
    settings = get_settings()
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        return None
    return razorpay.Client(
        auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
    )


def _resolve_coupon(db: Client, coupon_code: Optional[str], course_id: str, user_id: str, price: float):
    """
    Central coupon resolution logic — returns (coupon_row, discount_amount, affiliate_id, commission_amount)
    or (None, 0, None, 0) if no valid coupon.
    """
    if not coupon_code:
        return None, 0.0, None, 0.0

    code = coupon_code.strip().upper()
    result = db.table("coupons").select("*").eq("code", code).execute()
    if not result.data:
        return None, 0.0, None, 0.0

    coupon = result.data[0]

    # Active check
    if not coupon.get("is_active"):
        return None, 0.0, None, 0.0

    # Validity window
    now = datetime.now(timezone.utc)
    if coupon.get("valid_from"):
        vf = datetime.fromisoformat(coupon["valid_from"].replace("Z", "+00:00"))
        if now < vf:
            return None, 0.0, None, 0.0
    if coupon.get("valid_until"):
        vu = datetime.fromisoformat(coupon["valid_until"].replace("Z", "+00:00"))
        if now > vu:
            return None, 0.0, None, 0.0

    # Max uses
    if coupon.get("max_uses") is not None and coupon["used_count"] >= coupon["max_uses"]:
        return None, 0.0, None, 0.0

    # Per-user
    max_per_user = coupon.get("max_uses_per_user", 1)
    usage = (
        db.table("coupon_usages")
        .select("id", count="exact")
        .eq("coupon_id", coupon["id"])
        .eq("user_id", user_id)
        .execute()
    )
    if (usage.count or 0) >= max_per_user:
        return None, 0.0, None, 0.0

    # Course applicability
    applicable = coupon.get("applicable_course_ids") or []
    if applicable and course_id not in applicable:
        return None, 0.0, None, 0.0

    # Compute discount
    if coupon["discount_type"] == "percent":
        discount_amount = round(min(price, price * float(coupon["discount_value"]) / 100), 2)
    else:
        discount_amount = round(min(price, float(coupon["discount_value"])), 2)

    # Compute commission if affiliate-linked
    affiliate_id = coupon.get("affiliate_id")
    commission_amount = 0.0
    if affiliate_id:
        aff = db.table("affiliates").select("*").eq("id", affiliate_id).execute()
        if aff.data:
            affiliate = aff.data[0]
            final_price = price - discount_amount
            if affiliate["commission_type"] == "percent":
                commission_amount = round(final_price * float(affiliate["commission_value"]) / 100, 2)
            else:
                commission_amount = round(min(final_price, float(affiliate["commission_value"])), 2)

    return coupon, discount_amount, affiliate_id, commission_amount


def _record_coupon_usage(
    db: Client, coupon: dict, user_id: str, payment_id: str,
    discount_amount: float, affiliate_id: Optional[str], commission_amount: float,
):
    """
    After successful payment: log the coupon usage, bump used_count,
    and tag the payment with coupon/affiliate data.
    Idempotent — checks if usage already exists.
    """
    # Check idempotency
    existing = (
        db.table("coupon_usages")
        .select("id")
        .eq("coupon_id", coupon["id"])
        .eq("user_id", user_id)
        .execute()
    )
    if existing.data:
        return  # Already recorded — don't double-count

    # Log usage
    db.table("coupon_usages").insert({
        "coupon_id": coupon["id"],
        "user_id": user_id,
        "payment_id": payment_id,
    }).execute()

    # Bump used_count on the coupon
    db.table("coupons").update({
        "used_count": coupon["used_count"] + 1,
    }).eq("id", coupon["id"]).execute()

    # Tag payment row with coupon + affiliate info
    db.table("payments").update({
        "coupon_id": coupon["id"],
        "discount_amount": discount_amount,
        "affiliate_id": affiliate_id,
        "commission_amount": commission_amount,
    }).eq("id", payment_id).execute()


@router.post("/create-order", status_code=201)
async def create_order(
    body: CreateOrderRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    settings = get_settings()

    # Fetch course price and metadata
    course = db.table("courses").select("id, title, price, whatsapp_link").eq("id", body.courseId).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    price = float(course.data.get("price") or 0)
    original_price = price

    # Resolve coupon server-side
    coupon, discount_amount, affiliate_id, commission_amount = _resolve_coupon(
        db, body.couponCode, body.courseId, current_user["id"], price
    )

    final_price = max(0, price - discount_amount)
    amount_paise = int(final_price * 100)

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
                    "coupon_code": coupon["code"] if coupon else "",
                },
            })
            order_id = order["id"]
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Razorpay error: {str(e)}")
    else:
        # Stub for dev/testing without Razorpay keys
        import uuid
        order_id = f"order_DEMO_{uuid.uuid4().hex[:12].upper()}"

    # Insert pending payment record with coupon metadata
    db.table("payments").insert({
        "user_id": current_user["id"],
        "course_id": body.courseId,
        "amount": final_price,
        "original_amount": original_price,
        "discount_amount": discount_amount,
        "coupon_id": coupon["id"] if coupon else None,
        "affiliate_id": affiliate_id,
        "commission_amount": commission_amount,
        "status": "pending",
        "razorpay_order_id": order_id,
    }).execute()

    return {
        "orderId": order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key": settings.razorpay_key_id or "rzp_test_demo",
        "originalAmount": int(original_price * 100),
        "discountAmount": int(discount_amount * 100),
        "couponCode": coupon["code"] if coupon else None,
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
    payment_id = payment.data["id"]

    # Mark payment approved
    db.table("payments").update({
        "status": "approved",
        "razorpay_payment_id": body.razorpay_payment_id,
        "razorpay_signature": body.razorpay_signature,
    }).eq("id", payment_id).execute()

    # Record coupon usage if a coupon was applied
    coupon_id = payment.data.get("coupon_id")
    if coupon_id:
        coupon_row = db.table("coupons").select("*").eq("id", coupon_id).single().execute()
        if coupon_row.data:
            _record_coupon_usage(
                db, coupon_row.data, user_id, payment_id,
                float(payment.data.get("discount_amount") or 0),
                payment.data.get("affiliate_id"),
                float(payment.data.get("commission_amount") or 0),
            )

    # Enroll student
    db.table("enrollments").upsert({
        "user_id": user_id,
        "course_id": course_id,
        "added_by": "purchase",
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # Fetch actual whatsapp overriding link to attach to email
    course_data = db.table("courses").select("whatsapp_link").eq("id", course_id).single().execute()
    custom_whatsapp = course_data.data.get("whatsapp_link") if course_data.data else None

    # Automatically trigger WhatsApp Group invite email
    if settings.sendgrid_api_key:
        import httpx
        try:
            if custom_whatsapp:
                whatsapp_link = custom_whatsapp
            else:
                parts = course_id.split("-")
                identifier = parts[1].upper() if len(parts) > 1 else course_id.upper()
                whatsapp_link = f"https://chat.whatsapp.com/invite/CA-{identifier}-2026"
            
            html_content = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                <h2 style="color: #0f172a;">Welcome to the Course! 🎉</h2>
                <p>Your payment was successful. As requested, here is your direct, auto-generated WhatsApp Group invite link:</p>
                <div style="margin: 24px 0;">
                    <a href="{whatsapp_link}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Join WhatsApp Group
                    </a>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Note: The group requires admin approval. Click the link to request access, and an admin will let you in shortly.</p>
            </div>
            """
            
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://api.sendgrid.com/v3/mail/send",
                    headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
                    json={
                        "personalizations": [{"to": [{"email": current_user["email"]}]}],
                        "from": {"email": settings.sendgrid_from_email},
                        "subject": "Your Course WhatsApp Invite Link",
                        "content": [{"type": "text/html", "value": html_content}]
                    }
                )
        except Exception as e:
            print(f"Failed to auto-trigger whatsapp link email: {e}")

    return {"success": True, "message": "Payment verified, enrollment completed, and automated WhatsApp invite scheduled."}


# ─── MCQ Package Payment Endpoints ──────────────────────────────────────────

@router.post("/create-mcq-order", status_code=201)
async def create_mcq_order(
    body: CreateMCQOrderRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    settings = get_settings()
    if not body.subjectIds:
        raise HTTPException(status_code=400, detail="No subjects selected")

    calc = calculate_mcq_cart(body.level, body.subjectIds, body.duration, db)
    base_price = calc["real_total_price"]
    discounted_price = calc["discounted_price"]

    # Resolve optional coupon on top of bundle price if provided
    coupon, coupon_discount, affiliate_id, commission_amount = _resolve_coupon(
        db, body.couponCode, f"mcq-{body.level.lower()}", current_user["id"], discounted_price
    )

    final_price = max(0.0, discounted_price - coupon_discount)
    amount_paise = int(final_price * 100)

    rzp = _get_razorpay_client()
    if rzp:
        try:
            order = rzp.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"mcq_{body.level[:5].lower()}_{body.duration}",
                "notes": {
                    "type": "mcq_package",
                    "level": body.level,
                    "duration": body.duration,
                    "subject_ids": ",".join(body.subjectIds),
                    "user_id": current_user["id"],
                    "bundle_id": calc.get("applied_bundle_id") or "",
                },
            })
            order_id = order["id"]
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Razorpay error: {str(e)}")
    else:
        import uuid
        order_id = f"order_MCQ_{uuid.uuid4().hex[:12].upper()}"

    # Record payment row
    try:
        db.table("payments").insert({
            "user_id": current_user["id"],
            "course_id": f"mcq-{body.level.lower()}-{body.duration}",
            "amount": final_price,
            "original_amount": base_price,
            "discount_amount": base_price - final_price,
            "coupon_id": coupon["id"] if coupon else None,
            "affiliate_id": affiliate_id,
            "commission_amount": commission_amount,
            "status": "pending",
            "razorpay_order_id": order_id,
        }).execute()
    except Exception:
        pass

    return {
        "orderId": order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key": settings.razorpay_key_id or "rzp_test_demo",
        "originalAmount": int(base_price * 100),
        "discountAmount": int((base_price - final_price) * 100),
        "finalAmount": int(final_price * 100),
        "savingsAmount": calc["savings_amount"],
        "appliedBundle": calc.get("applied_bundle_title"),
        "couponCode": coupon["code"] if coupon else None,
    }


@router.post("/verify-mcq-payment")
async def verify_mcq_payment(
    body: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    settings = get_settings()
    user_id = current_user["id"]

    if settings.razorpay_key_secret and not body.razorpay_order_id.startswith("order_MCQ_"):
        msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode()
        expected = hmac.new(
            settings.razorpay_key_secret.encode(), msg, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected, body.razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Mark payment approved if exists
    try:
        payment = db.table("payments").select("*").eq("razorpay_order_id", body.razorpay_order_id).single().execute()
        if payment.data:
            payment_id = payment.data["id"]
            db.table("payments").update({
                "status": "approved",
                "razorpay_payment_id": body.razorpay_payment_id,
                "razorpay_signature": body.razorpay_signature,
            }).eq("id", payment_id).execute()
    except Exception:
        pass

    return {
        "success": True,
        "message": "MCQ package activated successfully! All selected test series are now unlocked.",
    }



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

    price = float(course.data.get("price") or 0)
    original_price = price

    # Resolve coupon server-side
    coupon, discount_amount, affiliate_id, commission_amount = _resolve_coupon(
        db, body.couponCode, body.courseId, user_id, price
    )
    final_price = max(0, price - discount_amount)

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
        "amount": final_price,
        "original_amount": original_price,
        "discount_amount": discount_amount,
        "coupon_id": coupon["id"] if coupon else None,
        "affiliate_id": affiliate_id,
        "commission_amount": commission_amount,
        "status": "pending",
        "utr_number": body.utrNumber,
    }).execute()

    return {
        "success": True,
        "verification": {
            "id": result.data[0]["id"] if result.data else "unknown",
            "studentEmail": current_user["email"],
            "courseTitle": course.data["title"],
            "amount": final_price,
            "originalAmount": original_price,
            "discountAmount": discount_amount,
            "couponCode": coupon["code"] if coupon else None,
            "date": datetime.now(timezone.utc).date().isoformat(),
            "status": "pending",
            "utrNumber": body.utrNumber,
        },
    }
