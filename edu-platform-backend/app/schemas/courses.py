from pydantic import BaseModel
from typing import Optional, Any


class CourseResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    price_display: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    outcomes: list[str] = []
    curriculum: list[Any] = []
    enrolled_count: int = 0
    rating: float = 4.5
    tag: Optional[str] = None
    mentors: list[Any] = []
    delivery_type: str
    whatsapp_link: Optional[str] = None
    linked_series_id: Optional[str] = None
    status: str


class CourseUpsertRequest(BaseModel):
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    price_display: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    outcomes: list[str] = []
    curriculum: list[Any] = []
    enrolled_count: int = 0
    rating: float = 4.5
    tag: Optional[str] = None
    mentors: list[Any] = []
    delivery_type: str = "whatsapp"
    whatsapp_link: Optional[str] = None
    linked_series_id: Optional[str] = None
    status: str = "coming_soon"


class WhatsAppAccessResponse(BaseModel):
    whatsappLink: str
