"""Test Series — written mock papers, mentor-evaluated. Independent product
line from the MCQ system; same commerce pattern (individual subjects +
group/bundle pricing) but one-time flat pricing instead of duration tiers,
since a written evaluation isn't a time-boxed subscription."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/test-series", tags=["Test Series"])


def _get_catalog(db: Client):
    """Returns empty lists rather than raising if the test-series migration
    hasn't been applied yet — the storefront then shows a 'coming soon' state
    instead of a broken page."""
    try:
        subjects = (db.table("test_series_subjects").select("*").eq("is_active", True).order("sort_order").execute().data or [])
    except Exception as e:
        print(f"[TEST SERIES] subjects table unavailable: {e}")
        subjects = []
    try:
        bundles = (db.table("test_series_bundles").select("*").eq("is_active", True).execute().data or [])
    except Exception as e:
        print(f"[TEST SERIES] bundles table unavailable: {e}")
        bundles = []
    return subjects, bundles


@router.get("/catalog")
async def get_catalog(db: Client = Depends(get_db)):
    subjects, bundles = _get_catalog(db)
    return {"subjects": subjects, "bundles": bundles}


@router.get("/my-subjects")
async def get_my_subjects(current_user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Subjects the current student has purchased access to."""
    enrollments = (
        db.table("test_series_enrollments")
        .select("subject_id, access_until")
        .eq("user_id", current_user["id"])
        .execute()
    )
    now = datetime.now(timezone.utc)
    active_ids = set()
    for e in (enrollments.data or []):
        expiry = e.get("access_until")
        if not expiry:
            active_ids.add(e["subject_id"])  # lifetime access
            continue
        try:
            expiry_dt = datetime.fromisoformat(expiry.replace("Z", "+00:00"))
            if expiry_dt.tzinfo is None:
                expiry_dt = expiry_dt.replace(tzinfo=timezone.utc)
            if expiry_dt > now:
                active_ids.add(e["subject_id"])
        except ValueError:
            active_ids.add(e["subject_id"])

    if not active_ids:
        return []
    subjects = db.table("test_series_subjects").select("*").in_("id", list(active_ids)).execute().data or []
    return subjects


@router.get("/subjects/{subject_id}/papers")
async def get_subject_papers(subject_id: str, current_user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Papers under a subject — only for students who've purchased that subject (or staff)."""
    if current_user.get("role") not in {"admin", "super_admin", "mentor"}:
        enroll = (
            db.table("test_series_enrollments")
            .select("access_until")
            .eq("user_id", current_user["id"])
            .eq("subject_id", subject_id)
            .execute()
        )
        if not enroll.data:
            raise HTTPException(status_code=403, detail="Purchase this subject to view its papers")

    papers = (
        db.table("tests")
        .select("id, title, description, question_file_url, status, sort_order, created_at")
        .eq("subject_id", subject_id)
        .eq("status", "published")
        .order("sort_order")
        .execute()
    )
    return papers.data or []


def calculate_test_series_cart(level: str, subject_ids: list[str], db: Client) -> dict:
    """One-time flat pricing — sums selected subjects, then checks whether any
    bundle covering a subset of the selection is cheaper than buying those
    subjects individually (same bundle-optimization idea as MCQ, no duration
    dimension since this isn't a subscription).

    Some subjects (e.g. Intermediate papers) aren't sold a la carte at all —
    `price` is NULL and they're only purchasable as part of a bundle that
    covers them. Treating a NULL price as 0 would make an incomplete,
    non-bundle-completing selection of those subjects price out at ₹0, so we
    track "purchasable" separately from "discounted_price" instead of
    defaulting missing prices to zero."""
    subjects, bundles = _get_catalog(db)
    level_norm = level.upper()

    level_subjects = [s for s in subjects if s["level"].upper() == level_norm]
    sub_map = {s["id"]: s for s in level_subjects}
    selected = [sub_map[sid] for sid in subject_ids if sid in sub_map]
    selected_set = set(s["id"] for s in selected)

    all_individually_priced = bool(selected) and all(s.get("price") is not None for s in selected)
    real_total = sum(float(s.get("price") or 0) for s in selected) if all_individually_priced else None

    level_bundles = [b for b in bundles if b["level"].upper() == level_norm]
    best_bundle = None
    discounted_price = real_total
    for b in level_bundles:
        bundle_set = set(b.get("subject_ids", []))
        if not bundle_set or not bundle_set.issubset(selected_set):
            continue
        remaining_ids = selected_set - bundle_set
        remaining_subjects = [sub_map[rid] for rid in remaining_ids if rid in sub_map]
        if not all(s.get("price") is not None for s in remaining_subjects):
            continue  # leftover papers aren't sold a la carte either — can't price this combo
        rem_price = sum(float(s.get("price") or 0) for s in remaining_subjects)
        candidate_price = float(b.get("price") or 0) + rem_price
        if discounted_price is None or candidate_price < discounted_price:
            discounted_price = candidate_price
            best_bundle = b

    if discounted_price is None:
        return {
            "real_total_price": 0.0,
            "discounted_price": 0.0,
            "savings_amount": 0.0,
            "applied_bundle_id": None,
            "applied_bundle_title": None,
            "purchasable": False,
        }

    baseline = real_total if real_total is not None else discounted_price
    savings = max(0.0, baseline - discounted_price)
    return {
        "real_total_price": baseline,
        "discounted_price": discounted_price,
        "savings_amount": savings,
        "applied_bundle_id": best_bundle["id"] if best_bundle else None,
        "applied_bundle_title": best_bundle["title"] if best_bundle else None,
        "purchasable": True,
    }
