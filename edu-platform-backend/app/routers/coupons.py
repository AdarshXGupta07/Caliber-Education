"""
Coupons & Affiliates router — public validation + admin CRUD.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from postgrest.exceptions import APIError as PostgrestAPIError
from supabase import Client

from app.core.database import get_db
from app.core.limiter import limiter
from app.dependencies import get_current_user, require_admin
from app.schemas.coupons import (
    CouponCreateRequest, CouponUpdateRequest,
    ValidateCouponRequest, ValidateCouponResponse,
    AffiliateCreateRequest, AffiliateUpdateRequest,
)

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])


# ═══════════════════════════════════════════════════════════════════════════
# PUBLIC: Validate a coupon code at checkout
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/validate", response_model=ValidateCouponResponse)
@limiter.limit("20/minute")
async def validate_coupon(
    request: Request,
    body: ValidateCouponRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    code = body.code.strip().upper()

    # 1. Find coupon by code
    result = db.table("coupons").select("*").eq("code", code).execute()
    if not result.data:
        return ValidateCouponResponse(valid=False, message="Invalid coupon code.")

    coupon = result.data[0]

    # 2. Is it active?
    if not coupon.get("is_active"):
        return ValidateCouponResponse(valid=False, message="This coupon is no longer active.")

    # 3. Validity window
    now = datetime.now(timezone.utc)
    if coupon.get("valid_from"):
        vf = datetime.fromisoformat(coupon["valid_from"].replace("Z", "+00:00"))
        if vf.tzinfo is None: vf = vf.replace(tzinfo=timezone.utc)
        if now < vf:
            return ValidateCouponResponse(valid=False, message="This coupon is not yet valid.")
    if coupon.get("valid_until"):
        vu = datetime.fromisoformat(coupon["valid_until"].replace("Z", "+00:00"))
        if vu.tzinfo is None: vu = vu.replace(tzinfo=timezone.utc)
        if now > vu:
            return ValidateCouponResponse(valid=False, message="This coupon has expired.")

    # 4. Max total uses
    if coupon.get("max_uses") is not None and coupon["used_count"] >= coupon["max_uses"]:
        return ValidateCouponResponse(valid=False, message="This coupon has been fully redeemed.")

    # 5. Per-user limit
    user_id = current_user["id"]
    max_per_user = coupon.get("max_uses_per_user", 1)
    usage = (
        db.table("coupon_usages")
        .select("id", count="exact")
        .eq("coupon_id", coupon["id"])
        .eq("user_id", user_id)
        .execute()
    )
    if (usage.count or 0) >= max_per_user:
        return ValidateCouponResponse(valid=False, message="You have already used this coupon.")

    # 6. Course applicability
    applicable = coupon.get("applicable_course_ids") or []
    if applicable and body.course_id not in applicable:
        return ValidateCouponResponse(valid=False, message="This coupon is not applicable to this item.")

    # 7. Compute discount
    if body.cart_amount is not None:
        price = body.cart_amount
    elif body.course_id:
        course = db.table("courses").select("id, price").eq("id", body.course_id).single().execute()
        if not course.data:
            raise HTTPException(status_code=404, detail="Course or Cart Base Not Found")
        price = float(course.data.get("price") or 0)
    else:
        raise HTTPException(status_code=400, detail="Either course_id or cart_amount must be provided")

    if coupon["discount_type"] == "percent":
        discount_amount = round(min(price, price * coupon["discount_value"] / 100), 2)
    else:
        discount_amount = round(min(price, float(coupon["discount_value"])), 2)

    return ValidateCouponResponse(
        valid=True,
        coupon_id=coupon["id"],
        code=coupon["code"],
        discount_type=coupon["discount_type"],
        discount_value=coupon["discount_value"],
        discount_amount=discount_amount,
        message=f"Coupon applied! You save ₹{discount_amount:,.0f}",
    )


# ═══════════════════════════════════════════════════════════════════════════
# ADMIN: Coupon CRUD
# ═══════════════════════════════════════════════════════════════════════════

admin_router = APIRouter(prefix="/api/admin", tags=["Admin — Coupons & Affiliates"])


@admin_router.get("/coupons")
async def list_coupons(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return (
        db.table("coupons")
        .select("*, affiliates(name, email)")
        .order("created_at", desc=True)
        .execute()
        .data or []
    )


@admin_router.post("/coupons", status_code=201)
async def create_coupon(
    body: CouponCreateRequest,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    code = body.code.strip().upper()

    # Duplicate check
    existing = db.table("coupons").select("id").eq("code", code).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail=f"Coupon code '{code}' already exists.")

    data = {
        "code": code,
        "discount_type": body.discount_type,
        "discount_value": body.discount_value,
        "affiliate_id": body.affiliate_id or None,
        "max_uses": body.max_uses,
        "max_uses_per_user": body.max_uses_per_user,
        "valid_from": body.valid_from,
        "valid_until": body.valid_until,
        "applicable_course_ids": body.applicable_course_ids,
        "is_active": body.is_active,
        "created_by": admin["id"],
    }
    result = db.table("coupons").insert(data).execute()
    if not result.data:
        return {}
    # Re-select with the affiliate join so the response matches list_coupons'
    # shape — returning the bare insert row leaves `affiliates` undefined,
    # which made a just-linked affiliate show as "—" until the next reload.
    coupon_id = result.data[0]["id"]
    joined = db.table("coupons").select("*, affiliates(name, email)").eq("id", coupon_id).single().execute()
    return joined.data or result.data[0]


@admin_router.patch("/coupons/{coupon_id}")
async def update_coupon(
    coupon_id: str,
    body: CouponUpdateRequest,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nothing to update")
    result = db.table("coupons").update(update_data).eq("id", coupon_id).execute()
    if not result.data:
        return {}
    joined = db.table("coupons").select("*, affiliates(name, email)").eq("id", coupon_id).single().execute()
    return joined.data or result.data[0]


@admin_router.delete("/coupons/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("coupons").delete().eq("id", coupon_id).execute()
    return {"success": True}


# ═══════════════════════════════════════════════════════════════════════════
# ADMIN: Affiliates CRUD
# ═══════════════════════════════════════════════════════════════════════════

@admin_router.get("/affiliates")
async def list_affiliates(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    return db.table("affiliates").select("*").order("created_at", desc=True).execute().data or []


@admin_router.post("/affiliates", status_code=201)
async def create_affiliate(
    body: AffiliateCreateRequest,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    data = body.model_dump()
    try:
        result = db.table("affiliates").insert(data).execute()
    except PostgrestAPIError as e:
        if e.code == "23505":
            raise HTTPException(status_code=400, detail=f"An affiliate with the email '{data['email']}' already exists.")
        raise
    return result.data[0] if result.data else {}


@admin_router.patch("/affiliates/{affiliate_id}")
async def update_affiliate(
    affiliate_id: str,
    body: AffiliateUpdateRequest,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nothing to update")
    try:
        result = db.table("affiliates").update(update_data).eq("id", affiliate_id).execute()
    except PostgrestAPIError as e:
        if e.code == "23505":
            raise HTTPException(status_code=400, detail=f"An affiliate with the email '{update_data.get('email')}' already exists.")
        raise
    return result.data[0] if result.data else {}


@admin_router.delete("/affiliates/{affiliate_id}")
async def delete_affiliate(
    affiliate_id: str,
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    db.table("affiliates").delete().eq("id", affiliate_id).execute()
    return {"success": True}


# ═══════════════════════════════════════════════════════════════════════════
# ADMIN: Affiliate Performance / Profit Report
# ═══════════════════════════════════════════════════════════════════════════

@admin_router.get("/affiliates/performance")
async def affiliate_performance(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """
    Returns per-affiliate sales, revenue, and commission owed.
    Uses the payments table (affiliate_id, amount, discount_amount, commission_amount).
    """
    # Fetch all approved payments that have an affiliate_id
    payments = (
        db.table("payments")
        .select("affiliate_id, amount, discount_amount, commission_amount, original_amount")
        .eq("status", "approved")
        .not_.is_("affiliate_id", "null")
        .execute()
    )

    # Fetch affiliates for name lookup
    affiliates = db.table("affiliates").select("id, name, email").execute()
    aff_map = {a["id"]: a for a in (affiliates.data or [])}

    # Aggregate
    stats: dict = {}
    for p in (payments.data or []):
        aid = p["affiliate_id"]
        if aid not in stats:
            aff = aff_map.get(aid, {})
            stats[aid] = {
                "affiliate_id": aid,
                "name": aff.get("name", "Unknown"),
                "email": aff.get("email", ""),
                "sales": 0,
                "revenue": 0.0,
                "commission_owed": 0.0,
            }
        stats[aid]["sales"] += 1
        stats[aid]["revenue"] += float(p.get("amount") or 0)
        stats[aid]["commission_owed"] += float(p.get("commission_amount") or 0)

    # Sort by revenue desc
    result = sorted(stats.values(), key=lambda x: x["revenue"], reverse=True)
    return result


@admin_router.get("/coupons/usage-report")
async def coupon_usage_report(
    admin: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    """
    Returns detailed coupon usage data for Excel export on the frontend.
    """
    usages = (
        db.table("coupon_usages")
        .select("*, coupons(code, discount_type, discount_value), profiles(email)")
        .order("used_at", desc=True)
        .execute()
    )
    result = []
    for u in (usages.data or []):
        coupon_info = u.get("coupons") or {}
        profile_info = u.get("profiles") or {}
        result.append({
            "id": u["id"],
            "coupon_code": coupon_info.get("code", ""),
            "discount_type": coupon_info.get("discount_type", ""),
            "discount_value": coupon_info.get("discount_value", 0),
            "user_email": profile_info.get("email", ""),
            "used_at": u["used_at"],
        })
    return result
