"""Centralized mentor permission system: _mentor_has_permission's fail-closed
defaults, and enforcement at the actual endpoints it gates (evaluate_papers
on the submissions queue, manage_test_series on authoring endpoints), plus
the admin-facing grant/revoke endpoint.
"""
import asyncio

from app.routers.admin import _mentor_has_permission


def test_admin_and_super_admin_always_pass(fake_db):
    admin = {"id": "a1", "role": "admin"}
    assert asyncio.run(_mentor_has_permission(admin, "evaluate_papers", fake_db)) is True
    super_admin = {"id": "a2", "role": "super_admin"}
    assert asyncio.run(_mentor_has_permission(super_admin, "manage_sessions", fake_db)) is True


def test_student_role_never_passes(fake_db):
    student = {"id": "s1", "role": "student"}
    assert asyncio.run(_mentor_has_permission(student, "evaluate_papers", fake_db)) is False


def test_mentor_without_mentors_row_fails_closed(fake_db):
    mentor = {"id": "no-mentor-row", "role": "mentor"}
    assert asyncio.run(_mentor_has_permission(mentor, "evaluate_papers", fake_db)) is False


def test_mentor_without_permissions_row_fails_closed(fake_db):
    fake_db.seed("mentors", [{"id": "m1", "profile_id": "mentor-x"}])
    mentor = {"id": "mentor-x", "role": "mentor"}
    assert asyncio.run(_mentor_has_permission(mentor, "evaluate_papers", fake_db)) is False


def test_mentor_with_key_explicitly_false_fails(fake_db):
    fake_db.seed("mentors", [{"id": "m1", "profile_id": "mentor-x"}])
    fake_db.seed("mentor_permissions", [{"mentor_id": "m1", "permissions": {"evaluate_papers": False}}])
    mentor = {"id": "mentor-x", "role": "mentor"}
    assert asyncio.run(_mentor_has_permission(mentor, "evaluate_papers", fake_db)) is False


def test_mentor_with_key_true_passes(fake_db):
    fake_db.seed("mentors", [{"id": "m1", "profile_id": "mentor-x"}])
    fake_db.seed("mentor_permissions", [{"mentor_id": "m1", "permissions": {"evaluate_papers": True}}])
    mentor = {"id": "mentor-x", "role": "mentor"}
    assert asyncio.run(_mentor_has_permission(mentor, "evaluate_papers", fake_db)) is True


def test_list_pending_submissions_requires_evaluate_papers_permission(make_client, fake_db):
    fake_db.seed("mentors", [{"id": "m1", "profile_id": "mentor-x"}])
    mentor = {"id": "mentor-x", "role": "mentor", "email": "m@example.com"}
    client = make_client(mentor, as_mentor=True)

    res = client.get("/api/admin/submissions/pending")
    assert res.status_code == 403


def test_list_pending_submissions_allowed_once_granted(make_client, fake_db):
    fake_db.seed("mentors", [{"id": "m1", "profile_id": "mentor-x"}])
    fake_db.seed("mentor_permissions", [{"mentor_id": "m1", "permissions": {"evaluate_papers": True}}])
    mentor = {"id": "mentor-x", "role": "mentor", "email": "m@example.com"}
    client = make_client(mentor, as_mentor=True)

    res = client.get("/api/admin/submissions/pending")
    assert res.status_code == 200


def test_manage_test_series_gates_authoring_endpoint(make_client, fake_db):
    fake_db.seed("mentors", [{"id": "m1", "profile_id": "mentor-x"}])
    mentor = {"id": "mentor-x", "role": "mentor", "email": "m@example.com"}
    client = make_client(mentor, as_mentor=True)

    denied = client.get("/api/admin/test-series/subjects")
    assert denied.status_code == 403

    fake_db.seed("mentor_permissions", [{"mentor_id": "m1", "permissions": {"manage_test_series": True}}])
    allowed = client.get("/api/admin/test-series/subjects")
    assert allowed.status_code == 200


def test_admin_can_grant_and_partially_update_mentor_permissions(make_client, fake_db):
    fake_db.seed("mentors", [{"id": "m1", "profile_id": "mentor-x", "name": "Mentor X"}])
    admin = {"id": "admin-1", "role": "admin", "email": "admin@example.com"}
    client = make_client(admin, as_admin=True)

    res = client.patch("/api/admin/mentors/m1/permissions", json={"evaluate_papers": True})
    assert res.status_code == 200
    assert res.json()["permissions"] == {"evaluate_papers": True, "manage_sessions": False, "manage_test_series": False}

    # A second, partial update must not clobber the first grant.
    res2 = client.patch("/api/admin/mentors/m1/permissions", json={"manage_sessions": True})
    assert res2.status_code == 200
    assert res2.json()["permissions"] == {"evaluate_papers": True, "manage_sessions": True, "manage_test_series": False}


def test_admin_update_permissions_404s_for_unknown_mentor(make_client, fake_db):
    admin = {"id": "admin-1", "role": "admin", "email": "admin@example.com"}
    client = make_client(admin, as_admin=True)

    res = client.patch("/api/admin/mentors/does-not-exist/permissions", json={"evaluate_papers": True})
    assert res.status_code == 404
