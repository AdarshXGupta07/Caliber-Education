from pydantic import BaseModel
from typing import Optional


class TestResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    questionPaperLink: str
    subject: Optional[str] = None
    duration: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: str
    testId: str
    status: str
    submittedAt: str
    studentFiles: list[str] = []
    marksAwarded: Optional[float] = None
    maxMarks: int = 100
    remarks: Optional[str] = None
    checkedCopyLink: Optional[str] = None
