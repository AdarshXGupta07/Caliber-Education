import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import Optional, List, Dict, Any

from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.mcq import (
    QuizAttemptRequest,
    CalculateMCQPriceRequest,
    CalculateMCQPriceResponse,
    TestSubmissionV2Request,
    SubmissionAnalyticsResponse,
)

router = APIRouter(tags=["MCQ & Quizzes"])


# ─── Default In-Memory Pricing Matrix & Bundles ─────────────────────────────

DEFAULT_MCQ_SUBJECTS = [
    # FINAL Group I
    {
        "id": "final-g1-fr",
        "level": "FINAL",
        "group_name": "Group I",
        "name": "Financial Reporting",
        "code": "FR",
        "description": "Comprehensive Ind AS & case scenarios practice sets",
        "prices": {"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500},
        "is_active": True,
        "sort_order": 1,
    },
    {
        "id": "final-g1-afm",
        "level": "FINAL",
        "group_name": "Group I",
        "name": "Advanced Financial Management",
        "code": "AFM",
        "description": "Portfolio management, derivatives, forex & corporate valuation",
        "prices": {"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625},
        "is_active": True,
        "sort_order": 2,
    },
    {
        "id": "final-g1-audit",
        "level": "FINAL",
        "group_name": "Group I",
        "name": "Advanced Auditing & Professional Ethics",
        "code": "Audit",
        "description": "Standards on auditing, professional ethics, digital audit",
        "prices": {"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500},
        "is_active": True,
        "sort_order": 3,
    },
    # FINAL Group II
    {
        "id": "final-g2-dt",
        "level": "FINAL",
        "group_name": "Group II",
        "name": "Direct Tax Laws & International Taxation",
        "code": "DT",
        "description": "Income tax computations, transfer pricing & non-resident taxation",
        "prices": {"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500},
        "is_active": True,
        "sort_order": 4,
    },
    {
        "id": "final-g2-idt",
        "level": "FINAL",
        "group_name": "Group II",
        "name": "Indirect Tax Laws (GST & Customs)",
        "code": "IDT",
        "description": "GST procedures, input tax credit, customs valuation & FTP",
        "prices": {"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500},
        "is_active": True,
        "sort_order": 5,
    },
    {
        "id": "final-g2-case",
        "level": "FINAL",
        "group_name": "Group II",
        "name": "Law + SCMPE + IBS Case Studies",
        "code": "Case Studies",
        "description": "Integrated business solutions, multi-disciplinary case scenarios",
        "prices": {"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625},
        "is_active": True,
        "sort_order": 6,
    },
    # INTERMEDIATE Group I
    {
        "id": "inter-g1-adv-acc",
        "level": "INTERMEDIATE",
        "group_name": "Group I",
        "name": "Advanced Accounting",
        "code": "Adv Accounting",
        "description": "Accounting standards, consolidation, buyback, internal reconstruction",
        "prices": {"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400},
        "is_active": True,
        "sort_order": 7,
    },
    {
        "id": "inter-g1-corp-law",
        "level": "INTERMEDIATE",
        "group_name": "Group I",
        "name": "Corporate and Other Laws",
        "code": "Corp Laws",
        "description": "Company Law, LLP Act, interpretation of statutes, General Clauses Act",
        "prices": {"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400},
        "is_active": True,
        "sort_order": 8,
    },
    {
        "id": "inter-g1-tax",
        "level": "INTERMEDIATE",
        "group_name": "Group I",
        "name": "Taxation",
        "code": "Taxation",
        "description": "Income Tax law & Goods and Services Tax basics",
        "prices": {"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400},
        "is_active": True,
        "sort_order": 9,
    },
    # INTERMEDIATE Group II
    {
        "id": "inter-g2-cost",
        "level": "INTERMEDIATE",
        "group_name": "Group II",
        "name": "Cost and Management Accounting",
        "code": "Costing",
        "description": "Standard costing, marginal costing, budget controls & ABC",
        "prices": {"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400},
        "is_active": True,
        "sort_order": 10,
    },
    {
        "id": "inter-g2-audit",
        "level": "INTERMEDIATE",
        "group_name": "Group II",
        "name": "Auditing and Ethics",
        "code": "Audit & Ethics",
        "description": "Nature of audit, audit documentation, internal controls & risk assessment",
        "prices": {"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400},
        "is_active": True,
        "sort_order": 11,
    },
    {
        "id": "inter-g2-fm-sm",
        "level": "INTERMEDIATE",
        "group_name": "Group II",
        "name": "Financial Management & Strategic Management",
        "code": "FM & SM",
        "description": "Capital structure, leverage, strategic analysis & implementation",
        "prices": {"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400},
        "is_active": True,
        "sort_order": 12,
    },
    # FOUNDATIONS
    {
        "id": "found-quant",
        "level": "FOUNDATIONS",
        "group_name": "All",
        "name": "Quantitative Aptitude",
        "code": "Quant",
        "description": "Business mathematics, logical reasoning, and statistics",
        "prices": {"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625},
        "is_active": True,
        "sort_order": 13,
    },
    {
        "id": "found-eco",
        "level": "FOUNDATIONS",
        "group_name": "All",
        "name": "Business Economics",
        "code": "Economics",
        "description": "Microeconomics, macroeconomics, national income & business cycles",
        "prices": {"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500},
        "is_active": True,
        "sort_order": 14,
    },
]

DEFAULT_MCQ_BUNDLES = [
    {
        "id": "final-bundle-g1",
        "title": "Group I All Subjects",
        "level": "FINAL",
        "group_name": "Group I",
        "subject_ids": ["final-g1-fr", "final-g1-afm", "final-g1-audit"],
        "prices": {"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500},
        "is_custom": False,
        "is_active": True,
        "badge": "Group 1 Bundle",
    },
    {
        "id": "final-bundle-g2",
        "title": "Group II All Subjects",
        "level": "FINAL",
        "group_name": "Group II",
        "subject_ids": ["final-g2-dt", "final-g2-idt", "final-g2-case"],
        "prices": {"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500},
        "is_custom": False,
        "is_active": True,
        "badge": "Group 2 Bundle",
    },
    {
        "id": "final-bundle-both",
        "title": "Both Groups Complete Super Bundle",
        "level": "FINAL",
        "group_name": "Both Groups",
        "subject_ids": ["final-g1-fr", "final-g1-afm", "final-g1-audit", "final-g2-dt", "final-g2-idt", "final-g2-case"],
        "prices": {"1_month": 900, "3_months": 1800, "6_months": 2400, "1_year": 3000},
        "is_custom": False,
        "is_active": True,
        "badge": "Super Bundle",
    },
    {
        "id": "inter-bundle-g1",
        "title": "Group I All Subjects",
        "level": "INTERMEDIATE",
        "group_name": "Group I",
        "subject_ids": ["inter-g1-adv-acc", "inter-g1-corp-law", "inter-g1-tax"],
        "prices": {"1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000},
        "is_custom": False,
        "is_active": True,
        "badge": "Group 1 Bundle",
    },
    {
        "id": "inter-bundle-g2",
        "title": "Group II All Subjects",
        "level": "INTERMEDIATE",
        "group_name": "Group II",
        "subject_ids": ["inter-g2-cost", "inter-g2-audit", "inter-g2-fm-sm"],
        "prices": {"1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000},
        "is_custom": False,
        "is_active": True,
        "badge": "Group 2 Bundle",
    },
    {
        "id": "inter-bundle-both",
        "title": "Both Groups Complete Super Bundle",
        "level": "INTERMEDIATE",
        "group_name": "Both Groups",
        "subject_ids": ["inter-g1-adv-acc", "inter-g1-corp-law", "inter-g1-tax", "inter-g2-cost", "inter-g2-audit", "inter-g2-fm-sm"],
        "prices": {"1_month": 500, "3_months": 1000, "6_months": 1600, "1_year": 2000},
        "is_custom": False,
        "is_active": True,
        "badge": "Super Bundle",
    },
    {
        "id": "found-bundle-all",
        "title": "All Subjects Foundation Bundle",
        "level": "FOUNDATIONS",
        "group_name": "All",
        "subject_ids": ["found-quant", "found-eco"],
        "prices": {"1_month": 300, "3_months": 650, "6_months": 800, "1_year": 1000},
        "is_custom": False,
        "is_active": True,
        "badge": "Complete Bundle",
    },
]


def _get_active_subjects_and_bundles(db: Client):
    """Fetches subjects and bundles from DB if table exists, otherwise returns defaults."""
    try:
        sub_res = db.table("mcq_subjects").select("*").eq("is_active", True).order("sort_order").execute()
        subjects = sub_res.data if sub_res.data else DEFAULT_MCQ_SUBJECTS
    except Exception:
        subjects = DEFAULT_MCQ_SUBJECTS

    try:
        bun_res = db.table("mcq_bundles").select("*").eq("is_active", True).execute()
        bundles = bun_res.data if bun_res.data else DEFAULT_MCQ_BUNDLES
    except Exception:
        bundles = DEFAULT_MCQ_BUNDLES

    return subjects, bundles


def calculate_mcq_cart(level: str, subject_ids: list[str], duration: str, db: Client):
    subjects, bundles = _get_active_subjects_and_bundles(db)
    level_norm = level.upper()
    dur_norm = duration.lower().replace("-", "_").replace(" ", "_")
    if dur_norm not in ["1_month", "3_months", "6_months", "1_year"]:
        dur_norm = "1_month"

    # Map selected subjects
    level_subjects = [s for s in subjects if s["level"].upper() == level_norm]
    sub_map = {s["id"]: s for s in level_subjects}
    selected = [sub_map[sid] for sid in subject_ids if sid in sub_map]

    # Compute base sum
    real_total = sum(float(s["prices"].get(dur_norm, 0)) for s in selected)

    # Check for bundle matches
    selected_set = set(s["id"] for s in selected)
    level_bundles = [b for b in bundles if b["level"].upper() == level_norm and b.get("is_active", True)]

    # Check exact super bundle or matching bundles
    applied_bundle = None
    discounted_price = real_total

    # Find the largest matching bundle subset
    best_bundle = None
    for b in level_bundles:
        bundle_set = set(b.get("subject_ids", []))
        if bundle_set and bundle_set.issubset(selected_set):
            b_price = float(b["prices"].get(dur_norm, 0))
            # Calculate remaining subjects not covered by bundle
            remaining_ids = selected_set - bundle_set
            rem_price = sum(float(sub_map[rid]["prices"].get(dur_norm, 0)) for rid in remaining_ids if rid in sub_map)
            candidate_price = b_price + rem_price

            if candidate_price < discounted_price:
                discounted_price = candidate_price
                best_bundle = b

    if best_bundle and discounted_price < real_total:
        applied_bundle = best_bundle

    savings = max(0.0, real_total - discounted_price)
    savings_pct = round((savings / real_total * 100), 1) if real_total > 0 else 0.0

    # Build smart upsell recommendation if user selected fewer subjects than a full group/bundle
    upsell = None
    if len(selected) > 0 and len(selected) < len(level_subjects):
        # Identify group of selected subjects
        first_sub = selected[0]
        group = first_sub.get("group_name", "Group I")
        group_subjects = [s for s in level_subjects if s.get("group_name") == group or group == "All"]
        group_sub_ids = set(s["id"] for s in group_subjects)

        # If user has not selected the full group, recommend the group bundle
        if not group_sub_ids.issubset(selected_set):
            matching_g_bundle = next((b for b in level_bundles if b.get("group_name") == group), None)
            if matching_g_bundle:
                bundle_price = float(matching_g_bundle["prices"].get(dur_norm, 0))
                full_base_sum = sum(float(s["prices"].get(dur_norm, 0)) for s in group_subjects)
                upsell = {
                    "type": "group_upgrade",
                    "group": group,
                    "bundleId": matching_g_bundle["id"],
                    "bundleTitle": matching_g_bundle["title"],
                    "subjectIds": matching_g_bundle["subject_ids"],
                    "subjectNames": [s["name"] for s in group_subjects],
                    "bundlePrice": bundle_price,
                    "originalSum": full_base_sum,
                    "savings": max(0.0, full_base_sum - bundle_price),
                    "message": f"Get all {group} subjects for just ₹{int(bundle_price)} (Normally ₹{int(full_base_sum)})"
                }
        elif level_norm in ["FINAL", "INTERMEDIATE"] and len(selected_set) < 6:
            # Upsell to Both Groups Super Bundle
            both_bundle = next((b for b in level_bundles if b.get("group_name") == "Both Groups"), None)
            if both_bundle:
                bundle_price = float(both_bundle["prices"].get(dur_norm, 0))
                full_base_sum = sum(float(s["prices"].get(dur_norm, 0)) for s in level_subjects)
                upsell = {
                    "type": "both_groups_upgrade",
                    "group": "Both Groups",
                    "bundleId": both_bundle["id"],
                    "bundleTitle": both_bundle["title"],
                    "subjectIds": both_bundle["subject_ids"],
                    "bundlePrice": bundle_price,
                    "originalSum": full_base_sum,
                    "savings": max(0.0, full_base_sum - bundle_price),
                    "message": f"Upgrade to Both Groups Super Bundle for just ₹{int(bundle_price)} (Normally ₹{int(full_base_sum)})"
                }

    return {
        "level": level_norm,
        "duration": dur_norm,
        "selected_subject_ids": [s["id"] for s in selected],
        "real_total_price": round(real_total, 2),
        "discounted_price": round(discounted_price, 2),
        "savings_amount": round(savings, 2),
        "savings_percentage": savings_pct,
        "applied_bundle_id": applied_bundle["id"] if applied_bundle else None,
        "applied_bundle_title": applied_bundle["title"] if applied_bundle else None,
        "upsell_recommendation": upsell,
    }


# ─── MCQ Packages & Pricing Endpoints ─────────────────────────────────────────

def _format_subject_for_client(s: dict) -> dict:
    group = s.get("group_name") or s.get("groupName") or "All"
    return {
        "id": s.get("id", ""),
        "level": (s.get("level") or "FINAL").upper(),
        "group_name": group,
        "groupName": group,
        "name": s.get("name", ""),
        "code": s.get("code", ""),
        "description": s.get("description", ""),
        "prices": s.get("prices") or {"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500},
        "is_active": s.get("is_active", True),
        "isActive": s.get("is_active", True),
        "sort_order": s.get("sort_order", 0),
    }

def _format_bundle_for_client(b: dict) -> dict:
    group = b.get("group_name") or b.get("groupName") or "All"
    sub_ids = b.get("subject_ids") or b.get("subjectIds") or []
    return {
        "id": b.get("id", ""),
        "title": b.get("title", ""),
        "level": (b.get("level") or "FINAL").upper(),
        "group_name": group,
        "groupName": group,
        "subject_ids": sub_ids,
        "subjectIds": sub_ids,
        "prices": b.get("prices") or {"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500},
        "badge": b.get("badge") or group,
        "is_custom": b.get("is_custom", False),
        "isCustom": b.get("is_custom", False),
        "is_active": b.get("is_active", True),
        "isActive": b.get("is_active", True),
    }

@router.get("/api/mcq/packages")
async def get_mcq_packages(db: Client = Depends(get_db)):
    """Returns flat subjects catalog and promotional bundles grouped by level."""
    raw_subjects, raw_bundles = _get_active_subjects_and_bundles(db)
    
    subjects = [_format_subject_for_client(s) for s in raw_subjects]
    bundles = [_format_bundle_for_client(b) for b in raw_bundles]
    
    levels = ["FINAL", "INTERMEDIATE", "FOUNDATIONS"]
    res_levels = {}
    for lvl in levels:
        lvl_subs = [s for s in subjects if s["level"].upper() == lvl]
        lvl_buns = [b for b in bundles if b["level"].upper() == lvl]
        res_levels[lvl] = {
            "subjects": lvl_subs,
            "bundles": lvl_buns,
        }
    
    return {
        "levels": res_levels,
        "allSubjects": subjects,
        "allBundles": bundles,
    }


@router.post("/api/mcq/calculate-price", response_model=CalculateMCQPriceResponse)
async def calculate_price(body: CalculateMCQPriceRequest, db: Client = Depends(get_db)):
    """Calculates real total vs bundle discounted price and returns smart upsells."""
    result = calculate_mcq_cart(body.level, body.subject_ids, body.duration, db)
    return result


# ─── MCQ Series ───────────────────────────────────────────────────────────────

@router.get("/api/mcq-series")
async def list_series(db: Client = Depends(get_db)):
    result = db.table("mcq_series").select("*").execute()
    return result.data or []


@router.get("/api/mcq-series/{series_id}")
async def get_series(series_id: str, db: Client = Depends(get_db)):
    series = db.table("mcq_series").select("*").eq("id", series_id).single().execute()
    if not series.data:
        raise HTTPException(status_code=404, detail="Series not found")

    sets = db.table("mcq_papers").select(
        "id, title, is_locked, price, description, subject, topper_score, topper_total_time_seconds"
    ).eq("series_id", series_id).execute()

    return {**series.data, "sets": sets.data or []}


# ─── Student MCQ Catalog ─────────────────────────────────────────────────────

@router.get("/api/mcq/catalog")
async def get_mcq_catalog(
    level: Optional[str] = None,
    group_name: Optional[str] = None,
    subject_code: Optional[str] = None,
    test_type: Optional[str] = None,
    db: Client = Depends(get_db),
):
    """Returns published MCQ sets structured for student browsing."""
    try:
        query = db.table("mcq_papers").select("*").eq("status", "published")
        if level:
            query = query.eq("level", level.upper())
        if group_name:
            query = query.eq("group_name", group_name)
        if subject_code:
            query = query.eq("subject_code", subject_code.upper())
        if test_type:
            query = query.eq("test_type", test_type)

        sets_res = query.order("created_at", desc=True).execute()
        sets_data = sets_res.data or []

        enriched = []
        for s in sets_data:
            sec_res = db.table("exam_sections").select("id, title").eq("paper_id", s["id"]).execute()
            sections = sec_res.data or []
            sec_ids = [sec["id"] for sec in sections]
            q_count = 0
            if sec_ids:
                q_res = db.table("questions").select("id", count="exact").in_("section_id", sec_ids).execute()
                q_count = q_res.count or 0

            enriched.append({
                "id": s["id"],
                "seriesId": s.get("series_id"),
                "title": s.get("title", "Untitled Test"),
                "level": s.get("level", "FINAL"),
                "groupName": s.get("group_name", "GROUP_1"),
                "subjectCode": s.get("subject_code") or s.get("subject", ""),
                "testType": s.get("test_type", "FULL_SUBJECT"),
                "chapterName": s.get("chapter_name"),
                "durationMinutes": s.get("duration_minutes", 60),
                "passingMarks": float(s.get("passing_marks") or 40.0),
                "totalMarks": float(s.get("total_marks") or 30.0),
                "isLocked": s.get("is_locked", False),
                "price": float(s.get("price") or 0.0),
                "description": s.get("description", ""),
                "subject": s.get("subject", ""),
                "sectionCount": len(sections),
                "questionCount": q_count,
            })
        return enriched
    except Exception:
        return []


# ─── Quiz Sets / Attempts / Analytics ────────────────────────────────────────

@router.get("/api/quizzes/{set_id}")
async def get_quiz(set_id: str, db: Client = Depends(get_db)):
    """Returns full quiz with sections, case studies, questions, and test guidelines."""
    mcq_set = db.table("mcq_papers").select("*").eq("id", set_id).single().execute()
    if not mcq_set.data:
        raise HTTPException(status_code=404, detail="Quiz set not found")

    # Fetch sections
    sections_res = db.table("exam_sections").select("*").eq("paper_id", set_id).execute()
    sections = sections_res.data or []

    enriched_sections = []
    for section in sections:
        questions_res = (
            db.table("questions")
            .select("*")
            .eq("section_id", section["id"])
            .execute()
        )
        mapped_questions = []
        for q in (questions_res.data or []):
            mapped_questions.append({
                "id": q["id"],
                "type": q.get("type", "normal"),
                "caseText": q.get("case_text", ""),
                "caseId": q.get("case_id"),
                "chapterTag": q.get("chapter_tag"),
                "difficulty": q.get("difficulty", "medium"),
                "marks": float(q.get("marks") or 1.0),
                "negativeMarks": float(q.get("negative_marks") or 0.0),
                "text": q.get("content", ""),
                "options": q["options"],
                "correctOptionIndex": q.get("correct_option", 0),
                "explanation": q.get("explanation", "")
            })
        enriched_sections.append({
            "id": section["id"],
            "title": section["title"],
            "questions": mapped_questions
        })

    data = mcq_set.data
    return {
        "id": data["id"],
        "seriesId": data.get("series_id"),
        "title": data["title"],
        "level": data.get("level", "FINAL"),
        "groupName": data.get("group_name", "GROUP_1"),
        "subjectCode": data.get("subject_code") or data.get("subject", ""),
        "testType": data.get("test_type", "FULL_SUBJECT"),
        "chapterName": data.get("chapter_name"),
        "durationMinutes": int(data.get("duration_minutes") or 60),
        "passingMarks": float(data.get("passing_marks") or 40.0),
        "totalMarks": float(data.get("total_marks") or 30.0),
        "shuffleQuestions": bool(data.get("shuffle_questions", False)),
        "shuffleOptions": bool(data.get("shuffle_options", False)),
        "allowRetake": bool(data.get("allow_retake", True)),
        "maxAttempts": data.get("max_attempts"),
        "isLocked": data.get("is_locked", False),
        "price": float(data.get("price") or 0.0),
        "description": data.get("description", ""),
        "subject": data.get("subject", ""),
        "topperStats": {
            "score": data.get("topper_score", 0),
            "totalTimeSeconds": data.get("topper_total_time_seconds", 0),
            "perQuestionTimes": data.get("topper_per_question_times", []),
        },
        "sections": enriched_sections,
    }


@router.post("/api/quizzes/{set_id}/submit-v2")
async def submit_quiz_v2(
    set_id: str,
    body: TestSubmissionV2Request,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Production ICAI scoring engine: computes marks with negative marking, accuracy, and topic analytics."""
    user_id = current_user["id"]

    # 1. Fetch full quiz set definition
    mcq_set = db.table("mcq_papers").select("*").eq("id", set_id).single().execute()
    if not mcq_set.data:
        raise HTTPException(status_code=404, detail="Quiz set not found")

    sections_res = db.table("exam_sections").select("*").eq("paper_id", set_id).execute()
    sections = sections_res.data or []

    # Flatten all questions across sections
    all_questions = []
    section_map = {}
    for sec in sections:
        section_map[sec["id"]] = sec["title"]
        q_res = db.table("questions").select("*").eq("section_id", sec["id"]).execute()
        for q in (q_res.data or []):
            all_questions.append({
                "id": q["id"],
                "section_id": sec["id"],
                "section_title": sec["title"],
                "type": q.get("type", "normal"),
                "case_text": q.get("case_text", ""),
                "case_id": q.get("case_id"),
                "chapter_tag": q.get("chapter_tag") or mcq_set.data.get("chapter_name") or "General",
                "difficulty": q.get("difficulty", "medium"),
                "marks": float(q.get("marks") or 1.0),
                "negative_marks": float(q.get("negative_marks") or 0.0),
                "text": q.get("content", ""),
                "options": q["options"],
                "correct_option_index": int(q.get("correct_option", 0)),
                "explanation": q.get("explanation", "")
            })

    total_possible_marks = sum(q["marks"] for q in all_questions) if all_questions else float(mcq_set.data.get("total_marks") or 30.0)
    
    total_score = 0.0
    correct_count = 0
    incorrect_count = 0
    skipped_count = 0
    
    section_breakdown = {}
    topic_breakdown = {}
    question_analysis = []

    user_answers = body.answers
    per_q_times = body.perQuestionTimes

    for idx, q in enumerate(all_questions):
        user_ans = user_answers[idx] if idx < len(user_answers) else None
        time_spent = per_q_times[idx] if idx < len(per_q_times) else 0.0
        sec_title = q["section_title"]
        topic = q["chapter_tag"]

        # Initialize section aggregator
        if sec_title not in section_breakdown:
            section_breakdown[sec_title] = {"totalMarks": 0.0, "earnedMarks": 0.0, "correct": 0, "incorrect": 0, "skipped": 0}
        section_breakdown[sec_title]["totalMarks"] += q["marks"]

        # Initialize topic aggregator
        if topic not in topic_breakdown:
            topic_breakdown[topic] = {"totalMarks": 0.0, "earnedMarks": 0.0, "correct": 0, "incorrect": 0, "skipped": 0}
        topic_breakdown[topic]["totalMarks"] += q["marks"]

        # Scoring logic
        if user_ans is None:
            status = "skipped"
            earned = 0.0
            skipped_count += 1
            section_breakdown[sec_title]["skipped"] += 1
            topic_breakdown[topic]["skipped"] += 1
        elif user_ans == q.get("correct_option", 0):
            status = "correct"
            earned = q["marks"]
            correct_count += 1
            section_breakdown[sec_title]["correct"] += 1
            topic_breakdown[topic]["correct"] += 1
        else:
            status = "incorrect"
            earned = -q["negative_marks"]
            incorrect_count += 1
            section_breakdown[sec_title]["incorrect"] += 1
            topic_breakdown[topic]["incorrect"] += 1

        total_score += earned
        section_breakdown[sec_title]["earnedMarks"] += earned
        topic_breakdown[topic]["earnedMarks"] += earned

        question_analysis.append({
            "questionIndex": idx,
            "questionId": q["id"],
            "sectionId": q["section_id"],
            "sectionTitle": sec_title,
            "chapterTag": topic,
            "type": q["type"],
            "caseText": "",
            "status": status,
            "userSelected": user_ans,
            "correctOptionIndex": q.get("correct_option", 0),
            "marks": q["marks"],
            "negativeMarks": q["negative_marks"],
            "marksEarned": earned,
            "timeTakenSeconds": time_spent,
            "text": q.get("content", ""),
            "options": q["options"],
            "explanation": q["explanation"]
        })

    # Floor score at 0 if needed or keep raw
    final_score = max(0.0, round(total_score, 2))
    percentage = round((final_score / max(1.0, total_possible_marks)) * 100, 2)
    passing_cutoff = float(mcq_set.data.get("passing_marks") or 40.0)
    is_passed = percentage >= passing_cutoff
    attempted_count = correct_count + incorrect_count
    accuracy = round((correct_count / max(1, attempted_count)) * 100, 2) if attempted_count > 0 else 0.0
    avg_time = round(body.elapsedSeconds / max(1, len(all_questions)), 1) if all_questions else 0.0

    submission_id = f"sub-{uuid.uuid4().hex[:12]}"

    # Save to test_submissions / quiz_attempts
    try:
        db.table("test_submissions").insert({
            "id": submission_id,
            "user_id": user_id,
            "set_id": set_id,
            "score": int(final_score),
            "total_marks": int(total_possible_marks),
            "time_taken_seconds": body.elapsedSeconds,
            "answers": user_answers,
            "section_scores": section_breakdown,
            "topic_scores": topic_breakdown,
            "question_analysis": question_analysis,
            "status": "evaluated",
            "submitted_at": datetime.now(timezone.utc).isoformat()
        }).execute()
    except Exception:
        pass

    # Save to legacy quiz_attempts for leaderboard parity
    try:
        db.table("quiz_attempts").insert({
            "user_id": user_id,
            "set_id": set_id,
            "score": int(final_score),
            "total": int(total_possible_marks),
            "elapsed_seconds": body.elapsedSeconds,
            "per_question_times": per_q_times,
        }).execute()
    except Exception:
        pass

    # Calculate Rank & Percentile
    try:
        better = (
            db.table("quiz_attempts")
            .select("id")
            .eq("paper_id", set_id)
            .or_(
                f"score.gt.{final_score},"
                f"and(score.eq.{final_score},elapsed_seconds.lt.{body.elapsedSeconds})"
            )
            .execute()
        )
        rank = len(better.data or []) + 1
        total_res = db.table("quiz_attempts").select("id", count="exact").eq("paper_id", set_id).execute()
        total_comp = max(1, total_res.count or 1)
        percentile = round(((total_comp - rank + 1) / total_comp) * 100, 1)
    except Exception:
        rank = 1
        total_comp = 1
        percentile = 100.0

    return {
        "submissionId": submission_id,
        "setId": set_id,
        "score": final_score,
        "totalMarks": total_possible_marks,
        "percentage": percentage,
        "isPassed": is_passed,
        "correctCount": correct_count,
        "incorrectCount": incorrect_count,
        "skippedCount": skipped_count,
        "accuracyPercentage": accuracy,
        "averageTimePerQuestion": avg_time,
        "totalTimeSeconds": body.elapsedSeconds,
        "rank": rank,
        "totalCompetitors": total_comp,
        "percentile": percentile,
        "sectionBreakdown": section_breakdown,
        "topicBreakdown": topic_breakdown,
        "questionAnalysis": question_analysis
    }


@router.post("/api/quizzes/{set_id}/attempts", status_code=201)
async def submit_attempt(
    set_id: str,
    body: QuizAttemptRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Legacy submission route preserved for backward compatibility."""
    user_id = current_user["id"]

    attempt = db.table("quiz_attempts").insert({
        "user_id": user_id,
        "set_id": set_id,
        "score": body.score,
        "total": body.total,
        "elapsed_seconds": body.elapsedSeconds,
        "per_question_times": body.perQuestionTimes,
    }).execute()

    attempt_id = attempt.data[0]["id"] if attempt.data else "unknown"

    better = (
        db.table("quiz_attempts")
        .select("id")
        .eq("paper_id", set_id)
        .or_(
            f"score.gt.{body.score},"
            f"and(score.eq.{body.score},elapsed_seconds.lt.{body.elapsedSeconds})"
        )
        .execute()
    )
    rank = len(better.data or []) + 1
    total_res = db.table("quiz_attempts").select("id", count="exact").eq("paper_id", set_id).execute()
    total_competitors = total_res.count or 1

    return {
        "success": True,
        "attemptId": attempt_id,
        "rank": rank,
        "totalCompetitors": total_competitors,
    }


@router.get("/api/quizzes/{set_id}/leaderboard")
async def get_leaderboard(
    set_id: str,
    current_user: dict | None = Depends(lambda: None),
    db: Client = Depends(get_db),
):
    """Returns top 20 attempts sorted by score desc, then time asc."""
    attempts = (
        db.table("quiz_attempts")
        .select("user_id, score, elapsed_seconds")
        .eq("paper_id", set_id)
        .order("score", desc=True)
        .order("elapsed_seconds", desc=False)
        .limit(20)
        .execute()
    )

    board = []
    for a in (attempts.data or []):
        try:
            profile = db.table("profiles").select("email").eq("id", a["user_id"]).single().execute()
            email = profile.data.get("email", "Student") if profile.data else "Student"
            name = email.split("@")[0]
        except Exception:
            name = "Student"
            
        board.append({
            "name": name,
            "score": a["score"],
            "time": a["elapsed_seconds"],
            "isUser": False,
        })
    return board
