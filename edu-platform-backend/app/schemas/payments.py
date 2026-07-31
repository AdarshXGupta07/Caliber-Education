from pydantic import BaseModel
from typing import Optional


class CreateOrderRequest(BaseModel):
    courseId: str


class CreateOrderResponse(BaseModel):
    orderId: str
    amount: int          # In paise (INR smallest unit)
    currency: str = "INR"
    key: str             # Razorpay key_id sent to frontend for checkout


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
