from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Literal, Optional, List
from datetime import datetime


def _check_discount_bounds(discount_type: Optional[str], discount_value: Optional[float]):
    # A percent discount above 100 or a negative value of either type would
    # let the final charged price come out *above* the listed price
    # (payments.py: final_price = max(0, price - discount_amount)) — a
    # negative discount_amount increases what the customer is charged.
    if discount_value is None:
        return
    if discount_value < 0:
        raise ValueError("discount_value can't be negative")
    if discount_type == "percent" and discount_value > 100:
        raise ValueError("A percent discount can't exceed 100")


# ─── Coupon Schemas ───────────────────────────────────────────────────────────

class CouponCreateRequest(BaseModel):
    code: str
    discount_type: Literal["percent", "flat"] = "percent"
    discount_value: float = 0
    affiliate_id: Optional[str] = None
    max_uses: Optional[int] = None
    max_uses_per_user: int = 1
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    applicable_course_ids: List[str] = []
    is_active: bool = True

    @model_validator(mode="after")
    def _validate_discount(self):
        _check_discount_bounds(self.discount_type, self.discount_value)
        return self


class CouponUpdateRequest(BaseModel):
    discount_type: Optional[Literal["percent", "flat"]] = None
    discount_value: Optional[float] = None
    affiliate_id: Optional[str] = None
    max_uses: Optional[int] = None
    max_uses_per_user: Optional[int] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    applicable_course_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None

    @model_validator(mode="after")
    def _validate_discount(self):
        _check_discount_bounds(self.discount_type, self.discount_value)
        return self


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
