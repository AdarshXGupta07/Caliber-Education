"""Manual UPI payment flow (Razorpay not live yet). Covers: a student
submitting a manual payment creates the same shape of pending row the
Razorpay create-*-order endpoints do (just with payment_method="manual_upi"
and no real Razorpay order); duplicate reference submissions are rejected;
and admin approve/reject reuses the existing grant functions unchanged,
including coupon/affiliate recording — directly verifying the question this
feature was built to answer: coupons and affiliate commission still work
correctly through the manual path.
"""


def test_submit_manual_course_creates_pending_manual_payment(make_client, fake_db, student_user):
    client = make_client(student_user)
    fake_db.seed("courses", [{"id": "course-1", "title": "CA Final Mentorship", "price": 1000}])

    res = client.post("/api/payments/submit-manual-course", json={
        "courseId": "course-1",
        "upiReference": "  123456789012  ",
    })
    assert res.status_code == 201, res.text
    assert res.json()["success"] is True

    rows = fake_db.store["payments"]
    assert len(rows) == 1
    row = rows[0]
    assert row["payment_method"] == "manual_upi"
    assert row["payment_reference"] == "123456789012"  # normalized (stripped)
    assert row["status"] == "pending"
    assert row["course_id"] == "course-1"
    assert row["amount"] == 1000
    assert row["razorpay_order_id"].startswith("manual_")


def test_submit_manual_course_rejects_duplicate_reference(make_client, fake_db, student_user):
    client = make_client(student_user)
    fake_db.seed("courses", [{"id": "course-1", "title": "CA Final Mentorship", "price": 1000}])
    fake_db.seed("payments", [{
        "id": "pay-existing", "user_id": "someone-else", "payment_method": "manual_upi",
        "payment_reference": "999999999999", "status": "pending",
    }])

    res = client.post("/api/payments/submit-manual-course", json={
        "courseId": "course-1",
        "upiReference": "999999999999",
    })
    assert res.status_code == 400
    assert "already been submitted" in res.json()["detail"]
    assert len(fake_db.store["payments"]) == 1  # no new row added


def test_submit_manual_mcq_packs_raw_duration_into_utr_number(make_client, fake_db, student_user):
    client = make_client(student_user)

    res = client.post("/api/payments/submit-manual-mcq", json={
        "level": "FINAL",
        "subjectIds": ["final-g1-fr"],
        "duration": "1_month",
        "upiReference": "abc123",
    })
    assert res.status_code == 201, res.text

    row = fake_db.store["payments"][0]
    assert row["payment_method"] == "manual_upi"
    assert row["payment_reference"] == "abc123"
    # Same packing convention _apply_mcq_grant expects: "mcq-{level}-{duration}|{subjects}|{suffix}"
    assert row["utr_number"].startswith("mcq-final-1_month|final-g1-fr|")


def test_admin_approve_manual_mcq_payment_grants_and_records_coupon(make_client, fake_db, student_user, admin_user):
    # MCQ, not course, because _apply_course_grant_or_extend calls
    # db.rpc("grant_or_extend_enrollment", ...) which the shared fake
    # Supabase test double doesn't implement (a pre-existing gap, unrelated
    # to this feature) — _apply_mcq_grant only does table inserts/updates,
    # so it proves the same coupon/affiliate claim without that gap.
    student_client = make_client(student_user)

    fake_db.seed("affiliates", [{"id": "aff-1", "commission_type": "percent", "commission_value": 10}])
    fake_db.seed("coupons", [{
        "id": "coupon-1", "code": "SAVE10", "discount_type": "percent", "discount_value": 10,
        "affiliate_id": "aff-1", "max_uses": None, "used_count": 0, "max_uses_per_user": 1,
        "valid_from": None, "valid_until": None, "applicable_course_ids": [], "is_active": True,
    }])
    fake_db.seed("profiles", [{"id": student_user["id"], "email": student_user["email"]}])

    submit_res = student_client.post("/api/payments/submit-manual-mcq", json={
        "level": "FINAL",
        "subjectIds": ["final-g1-fr"],
        "duration": "1_month",
        "couponCode": "save10",
        "upiReference": "ref-001",
    })
    assert submit_res.status_code == 201, submit_res.text

    row = fake_db.store["payments"][0]
    assert row["coupon_id"] == "coupon-1"
    assert row["discount_amount"] > 0
    assert row["affiliate_id"] == "aff-1"
    assert row["commission_amount"] > 0
    assert row["status"] == "pending"

    admin_client = make_client(admin_user, as_admin=True)
    approve_res = admin_client.post(f"/api/admin/payments/{row['id']}/approve")
    assert approve_res.status_code == 200, approve_res.text
    assert approve_res.json()["success"] is True

    updated = next(p for p in fake_db.store["payments"] if p["id"] == row["id"])
    assert updated["status"] == "approved"
    assert len(fake_db.store.get("mcq_enrollments", [])) == 1

    # Coupon usage recorded exactly like a real Razorpay confirmation would —
    # this is the actual thing the manual flow needed to prove it preserves.
    coupon = next(c for c in fake_db.store["coupons"] if c["id"] == "coupon-1")
    assert coupon["used_count"] == 1
    assert len(fake_db.store["coupon_usages"]) == 1


def test_reject_payment_sets_status_rejected(make_client, fake_db, admin_user):
    client = make_client(admin_user, as_admin=True)
    fake_db.seed("payments", [{"id": "pay-r1", "status": "pending", "payment_method": "manual_upi"}])

    res = client.post("/api/admin/payments/pay-r1/reject")
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert fake_db.store["payments"][0]["status"] == "rejected"
