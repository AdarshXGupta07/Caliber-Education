from pydantic import BaseModel, Field
from typing import Optional, Any, List, Dict


# ─── Legacy Quiz Schemas (Preserved for 100% Backward Compatibility) ─────────

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


# ─── Pricing Matrix Models ───────────────────────────────────────────────────

class MCQSubjectModel(BaseModel):
    id: str
    level: str
    group_name: str
    name: str
    code: str
    description: Optional[str] = None
    prices: dict[str, float]
    is_active: bool = True
    sort_order: int = 0


class MCQBundleModel(BaseModel):
    id: str
    title: str
    level: str
    group_name: str
    subject_ids: list[str]
    prices: dict[str, float]
    is_custom: bool = False
    is_active: bool = True
    badge: Optional[str] = None


class CalculateMCQPriceRequest(BaseModel):
    level: str
    subject_ids: list[str]
    duration: str  # "1_month", "3_months", "6_months", "1_year"
    coupon_code: Optional[str] = None


class CalculateMCQPriceResponse(BaseModel):
    level: str
    duration: str
    selected_subject_ids: list[str]
    real_total_price: float
    discounted_price: float
    savings_amount: float
    savings_percentage: float
    applied_bundle_id: Optional[str] = None
    applied_bundle_title: Optional[str] = None
    upsell_recommendation: Optional[dict] = None


# ─── Enhanced CA Exam Question & Section Models ──────────────────────────────

class QuestionPayload(BaseModel):
    id: Optional[Any] = None
    type: str = "normal"  # "normal" | "case"
    caseText: Optional[str] = None
    caseId: Optional[str] = None
    chapterTag: Optional[str] = None
    difficulty: str = "medium"  # "easy" | "medium" | "hard"
    marks: float = 1.0
    negativeMarks: float = 0.0
    text: str
    options: List[str]
    correctOptionIndex: int
    explanation: Optional[str] = ""


class SectionPayload(BaseModel):
    id: Optional[str] = None
    title: str
    orderIndex: Optional[int] = 0
    questions: List[QuestionPayload] = []


class MCQSetUpsertRequest(BaseModel):
    id: Optional[str] = None
    seriesId: Optional[str] = None
    title: str
    level: str = "FINAL"  # "FINAL", "INTERMEDIATE", "FOUNDATIONS"
    groupName: str = "GROUP_1"  # "GROUP_1", "GROUP_2", "BOTH", "NONE"
    subjectCode: Optional[str] = None
    testType: str = "FULL_SUBJECT"  # "COMPLETE_GROUP", "FULL_SUBJECT", "CHAPTER_WISE"
    chapterName: Optional[str] = None
    durationMinutes: int = 60
    passingMarks: float = 40.0
    totalMarks: float = 30.0
    status: str = "published"  # "draft", "published", "archived"
    shuffleQuestions: bool = False
    shuffleOptions: bool = False
    allowRetake: bool = True
    maxAttempts: Optional[int] = None
    isLocked: bool = False
    price: float = 0.0
    description: Optional[str] = ""
    subject: Optional[str] = ""
    sections: List[SectionPayload] = []


class BulkImportRequest(BaseModel):
    format: str = "json"  # "json" | "csv"
    content: str
    targetSectionId: Optional[str] = None
    defaultMarks: float = 1.0
    defaultNegativeMarks: float = 0.0


class ChapterModel(BaseModel):
    id: Optional[str] = None
    level: str
    group_name: str
    subject_code: str
    subject_name: str
    chapter_number: int
    chapter_title: str


# ─── ICAI Exam Submission & Detailed Analytics Models ────────────────────────

class QuestionAttemptAnalysis(BaseModel):
    questionId: Any
    sectionId: Optional[str] = None
    chapterTag: Optional[str] = None
    status: str  # "correct", "incorrect", "skipped", "marked_review"
    userSelected: Optional[int] = None
    correctOptionIndex: int
    marksEarned: float
    timeTakenSeconds: float
    explanation: Optional[str] = None


class TestSubmissionV2Request(BaseModel):
    answers: Dict[str, Optional[int]]  # question ID -> selected option index (or null if skipped)
    perQuestionTimes: List[float]
    elapsedSeconds: int
    attemptId: Optional[str] = None  # links this submission to a persisted mcq_attempt_sessions row


class AttemptStartRequest(BaseModel):
    questionOrder: List[str] = []  # client-computed display order (question IDs) for a fresh attempt


class AttemptProgressRequest(BaseModel):
    answers: Dict[str, Optional[int]]
    perQuestionTimes: List[float]
    currentIndex: int
    sectionElapsed: Dict[str, float] = {}
    elapsedSeconds: int = 0  # display-only, never trusted for scoring/expiry


class SubmissionAnalyticsResponse(BaseModel):
    submissionId: str
    setId: str
    score: float
    totalMarks: float
    percentage: float
    isPassed: bool
    correctCount: int
    incorrectCount: int
    skippedCount: int
    accuracyPercentage: float
    averageTimePerQuestion: float
    totalTimeSeconds: int
    rank: int
    totalCompetitors: int
    percentile: float
    sectionBreakdown: Dict[str, Any]
    topicBreakdown: Dict[str, Any]
    questionAnalysis: List[Dict[str, Any]]
