"""Payment verification idempotency: replaying/retrying a verify call for a
payment already marked approved must short-circuit instead of re-running the
grant logic a second time (which would stack/duplicate access). Mirrors the
guard the webhook handler already had; these three grant helpers didn't.
"""
import asyncio

from app.routers.payments import _apply_course_grant_or_extend, _apply_mcq_grant, _apply_test_series_grant


def test_course_grant_short_circuits_when_already_approved(fake_db):
    seeded = {"id": "pay-1", "status": "approved", "course_id": "course-1", "utr_number": ""}
    fake_db.seed("payments", [seeded])
    payment_data = fake_db.store["payments"][0]

    result = asyncio.run(
        _apply_course_grant_or_extend(fake_db, payment_data, "user-1", "user@example.com", "pay_x", "sig_x", None)
    )
    assert result["success"] is True
    assert "already" in result["message"].lower()
    # Nothing else ran — no second write to payments, no enrollment side effect.
    assert fake_db.store["payments"] == [seeded]
    assert fake_db.store.get("enrollments", []) == []


def test_mcq_grant_short_circuits_when_already_approved(fake_db):
    fake_db.seed("payments", [{
        "id": "pay-2", "razorpay_order_id": "order-2", "status": "approved",
        "course_id": None, "utr_number": "mcq-1_month|final-fr", "user_id": "user-1",
    }])

    result = asyncio.run(_apply_mcq_grant(fake_db, "order-2", "user-1", "pay_x", "sig_x"))
    assert result["success"] is True
    assert "already" in result["message"].lower()
    assert fake_db.store.get("mcq_enrollments", []) == []


def test_mcq_grant_does_not_match_a_different_users_order(fake_db):
    """Ownership check: an order_id that exists but belongs to someone else
    must not be grantable just by knowing the order_id — closes the gap
    where a payment lookup that didn't filter by user_id let a caller claim
    another user's paid order for themselves."""
    fake_db.seed("payments", [{
        "id": "pay-2b", "razorpay_order_id": "order-2b", "status": "pending",
        "course_id": None, "utr_number": "mcq-1_month|final-fr", "user_id": "user-owner",
    }])

    result = asyncio.run(_apply_mcq_grant(fake_db, "order-2b", "user-attacker", "pay_x", "sig_x"))
    assert "no matching payment" in result["message"].lower()
    updated = next(p for p in fake_db.store["payments"] if p["id"] == "pay-2b")
    assert updated["status"] == "pending"


def test_test_series_grant_short_circuits_when_already_approved(fake_db):
    fake_db.seed("payments", [{
        "id": "pay-3", "razorpay_order_id": "order-3", "status": "approved",
        "course_id": None, "utr_number": "testseries-final-fr|sub-1", "user_id": "user-1",
    }])

    result = asyncio.run(_apply_test_series_grant(fake_db, "order-3", "user-1", "pay_x", "sig_x"))
    assert result["success"] is True
    assert "already" in result["message"].lower()
    assert fake_db.store.get("test_series_enrollments", []) == []


def test_mcq_grant_still_activates_a_pending_payment(fake_db):
    """Sanity check that the guard only blocks already-approved payments —
    a genuinely pending payment still gets processed normally."""
    fake_db.seed("payments", [{
        "id": "pay-4", "razorpay_order_id": "order-4", "status": "pending",
        "course_id": None, "utr_number": "mcq-1_month|", "user_id": "user-1",
    }])

    result = asyncio.run(_apply_mcq_grant(fake_db, "order-4", "user-1", "pay_x", "sig_x"))
    assert result["success"] is True
    assert "already" not in result["message"].lower()
    updated = next(p for p in fake_db.store["payments"] if p["id"] == "pay-4")
    assert updated["status"] == "approved"
