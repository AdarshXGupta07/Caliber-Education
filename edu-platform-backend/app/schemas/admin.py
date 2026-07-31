from pydantic import BaseModel, EmailStr
from typing import Optional


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str
    turnstileToken: str = ""


class ManualEnrollRequest(BaseModel):
    email: EmailStr
    notes: Optional[str] = None


class EnrollmentResponse(BaseModel):
    id: str
    email: str
    purchaseDate: str
    addedBy: str
    notes: Optional[str] = None


class AdminSummaryResponse(BaseModel):
    totalUsers: int
    totalCourses: int
    pendingPayments: int
    totalMcqSets: int
    pendingSubmissions: int
