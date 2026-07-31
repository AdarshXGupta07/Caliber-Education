from pydantic import BaseModel
from typing import Optional


class BookSessionRequest(BaseModel):
    mentorId: str
    slotId: str
    datetime: str          # ISO 8601


class SessionResponse(BaseModel):
    id: str
    mentorName: str
    specialty: Optional[str] = None
    datetime: str
    status: str
    meetLink: Optional[str] = None
