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


class MentorPermissionsUpdateRequest(BaseModel):
    evaluate_papers: Optional[bool] = None
    manage_sessions: Optional[bool] = None
    manage_test_series: Optional[bool] = None
