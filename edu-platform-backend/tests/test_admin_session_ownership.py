"""1:1 session ownership fix: a mentor may only schedule/complete a session
already assigned to their own mentors-table row — previously
mentor_schedule_session/mentor_complete_session had no ownership check at
all, so any mentor could act on any other mentor's session.
"""


def _seed_two_mentors_and_a_session(fake_db, session_id="sess-1", owner="mentor-a-id"):
    fake_db.seed("mentors", [
        {"id": "mentor-a-id", "profile_id": "mentor-a-profile", "name": "Mentor A"},
        {"id": "mentor-b-id", "profile_id": "mentor-b-profile", "name": "Mentor B"},
    ])
    fake_db.seed("mentor_permissions", [
        {"mentor_id": "mentor-a-id", "permissions": {"manage_sessions": True}},
        {"mentor_id": "mentor-b-id", "permissions": {"manage_sessions": True}},
    ])
    fake_db.seed("session_bookings", [{
        "id": session_id, "mentor_id": owner, "student_id": "some-student",
        "status": "pending_schedule", "scheduled_at": None, "google_meet_link": None,
    }])


def test_mentor_cannot_schedule_another_mentors_session(make_client, fake_db):
    _seed_two_mentors_and_a_session(fake_db)
    mentor_b = {"id": "mentor-b-profile", "role": "mentor", "email": "b@example.com"}
    client = make_client(mentor_b, as_mentor=True)

    res = client.patch("/api/admin/sessions/sess-1/schedule", json={
        "scheduledAt": "2026-09-01T10:00:00Z", "meetLink": "https://meet.example/xyz", "note": "",
    })
    assert res.status_code == 403


def test_mentor_can_schedule_their_own_session(make_client, fake_db):
    _seed_two_mentors_and_a_session(fake_db)
    mentor_a = {"id": "mentor-a-profile", "role": "mentor", "email": "a@example.com"}
    client = make_client(mentor_a, as_mentor=True)

    res = client.patch("/api/admin/sessions/sess-1/schedule", json={
        "scheduledAt": "2026-09-01T10:00:00Z", "meetLink": "https://meet.example/xyz", "note": "",
    })
    assert res.status_code == 200


def test_mentor_cannot_complete_another_mentors_session(make_client, fake_db):
    _seed_two_mentors_and_a_session(fake_db)
    mentor_b = {"id": "mentor-b-profile", "role": "mentor", "email": "b@example.com"}
    client = make_client(mentor_b, as_mentor=True)

    res = client.patch("/api/admin/sessions/sess-1/complete")
    assert res.status_code == 403


def test_admin_can_schedule_any_session_regardless_of_ownership(make_client, fake_db):
    _seed_two_mentors_and_a_session(fake_db)
    admin = {"id": "admin-1", "role": "admin", "email": "admin@example.com"}
    client = make_client(admin, as_admin=True, as_mentor=True)

    res = client.patch("/api/admin/sessions/sess-1/schedule", json={
        "scheduledAt": "2026-09-01T10:00:00Z", "meetLink": "https://meet.example/xyz", "note": "",
    })
    assert res.status_code == 200


def test_mentor_without_manage_sessions_permission_is_blocked_even_if_owner(make_client, fake_db):
    fake_db.seed("mentors", [{"id": "mentor-a-id", "profile_id": "mentor-a-profile", "name": "Mentor A"}])
    # No mentor_permissions row at all — fail-closed default.
    fake_db.seed("session_bookings", [{
        "id": "sess-2", "mentor_id": "mentor-a-id", "student_id": "some-student",
        "status": "pending_schedule", "scheduled_at": None, "google_meet_link": None,
    }])
    mentor_a = {"id": "mentor-a-profile", "role": "mentor", "email": "a@example.com"}
    client = make_client(mentor_a, as_mentor=True)

    res = client.patch("/api/admin/sessions/sess-2/schedule", json={
        "scheduledAt": "2026-09-01T10:00:00Z", "meetLink": "https://meet.example/xyz", "note": "",
    })
    assert res.status_code == 403
