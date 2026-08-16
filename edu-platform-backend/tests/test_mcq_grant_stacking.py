"""Regression test for a real bug found while investigating duplicate
mcq_enrollments rows in production test data: extending an existing
enrollment logs a message containing "→", which raises UnicodeEncodeError
on any stdout that isn't UTF-8 (e.g. a default Windows console). Because the
grant loop no longer swallows exceptions (see payments.py's comments), that
crash aborted the whole grant mid-loop instead of completing it — so a
second purchase covering an already-owned subject created a brand-new
enrollment row instead of extending the existing one.
"""
import asyncio

from app.routers.payments import _apply_mcq_grant


def test_second_order_extends_existing_subject_instead_of_duplicating(fake_db):
    fake_db.seed("payments", [
        {
            "id": "pay-A", "razorpay_order_id": "order-A", "status": "pending",
            "course_id": None, "utr_number": "mcq-final-1_month|final-fr,final-afm,final-audit|aaa",
            "user_id": "user-1",
        },
        {
            "id": "pay-B", "razorpay_order_id": "order-B", "status": "pending",
            "course_id": None, "utr_number": "mcq-final-1_month|final-fr,final-afm,final-audit,final-dt|bbb",
            "user_id": "user-1",
        },
    ])

    asyncio.run(_apply_mcq_grant(fake_db, "order-A", "user-1", "pay_x", "sig_x"))
    asyncio.run(_apply_mcq_grant(fake_db, "order-B", "user-1", "pay_y", "sig_y"))

    enrollments = fake_db.store.get("mcq_enrollments", [])
    afm_rows = [e for e in enrollments if e["subject_code"] == "final-afm"]

    assert len(afm_rows) == 1, "second order should extend the existing row, not create a duplicate"
    assert afm_rows[0]["payment_id"] == "pay-B", "the existing row should be updated to reflect the latest payment"
