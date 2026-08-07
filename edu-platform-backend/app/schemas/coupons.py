from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Coupon Schemas ───────────────────────────────────────────────────────────

class CouponCreateRequest(BaseModel):
    code: str
    discount_type: str = "percent"      # "percent" or "flat"
    discount_value: float = 0
    affiliate_id: Optional[str] = None
    max_uses: Optional[int] = None
    max_uses_per_user: int = 1
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    applicable_course_ids: List[str] = []
    is_active: bool = True


class CouponUpdateRequest(BaseModel):
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    affiliate_id: Optional[str] = None
    max_uses: Optional[int] = None
    max_uses_per_user: Optional[int] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    applicable_course_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ValidateCouponRequest(BaseModel):
    code: str
    course_id: Optional[str] = None
    cart_amount: Optional[float] = None


class ValidateCouponResponse(BaseModel):
    valid: bool
    coupon_id: Optional[str] = None
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    discount_amount: Optional[float] = None   # computed for this specific course
    message: str = ""


# ─── Affiliate Schemas ───────────────────────────────────────────────────────

class AffiliateCreateRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    commission_type: str = "percent"     # "percent" or "flat"
    commission_value: float = 10
    payout_details: Optional[str] = None


class AffiliateUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    commission_type: Optional[str] = None
    commission_value: Optional[float] = None
    payout_details: Optional[str] = None
    is_active: Optional[bool] = None
