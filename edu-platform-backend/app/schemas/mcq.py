from pydantic import BaseModel
from typing import Optional, Any


class QuizAttemptRequest(BaseModel):
    score: int
    total: int
    elapsedSeconds: int
    perQuestionTimes: list[float] = []


class QuizAttemptResponse(BaseModel):
    success: bool
    attemptId: str
    rank: int
    totalCompetitors: int


class LeaderboardEntry(BaseModel):
    name: str
    score: int
    time: int
    isUser: bool


class MCQSeriesResponse(BaseModel):
    id: str
    title: str
    subject: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_locked: bool = True
