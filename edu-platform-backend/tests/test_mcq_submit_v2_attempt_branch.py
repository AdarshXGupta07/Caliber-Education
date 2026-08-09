"""submit-v2's additive attemptId branch: double-submission/race protection
(idempotent replay) and grading from the server-persisted snapshot once an
attempt is past its deadline, instead of trusting a late client POST body.
Does not touch — and these tests don't re-cover — the underlying ID-based
scoring/case-cluster/ordering logic already verified in test_mcq_scoring.py.
"""
from datetime import datetime, timedelta, timezone


def _seed_scoring_paper_and_attempt(fake_db, user_id, attempt_id="att-1", started_at=None, duration_minutes=45,
                                     answers=None, paper_id="paper-score"):
    fake_db.seed("mcq_papers", [{
        "id": paper_id, "title": "Attempt Submit Test", "level": "FINAL",
        "subject_code": "FR", "is_locked": False, "shuffle_questions": True,
        "duration_minutes": duration_minutes, "passing_marks": 40.0,
    }])
    fake_db.seed("exam_sections", [{"id": "sec-score", "paper_id": paper_id, "title": "Section A", "order_index": 0}])
    fake_db.seed("questions", [
        {
            "id": "q1", "section_id": "sec-score", "type": "normal", "case_narrative": "",
            "case_group_id": None, "chapter_tag": "General", "difficulty": "medium",
            "marks": 1.0, "negative_marks": 0.25, "content": "Q1",
            "options": ["a", "b", "c", "d"], "correct_option": 2, "explanation": "", "order_index": 0,
        },
        {
            "id": "q2", "section_id": "sec-score", "type": "normal", "case_narrative": "",
            "case_group_id": None, "chapter_tag": "General", "difficulty": "medium",
            "marks": 2.0, "negative_marks": 0.5, "content": "Q2",
            "options": ["a", "b", "c", "d"], "correct_option": 1, "explanation": "", "order_index": 1,
        },
    ])
    started = started_at or datetime.now(timezone.utc).isoformat()
    fake_db.seed("mcq_attempt_sessions", [{
        "id": attempt_id, "user_id": user_id, "set_id": paper_id,
        "status": "in_progress", "question_order": ["q1", "q2"],
        "answers": answers if answers is not None else {"q1": None, "q2": None},
        "per_question_times": [0.0, 0.0], "current_index": 0, "section_elapsed": {},
        "started_at": started, "duration_minutes": duration_minutes,
        "last_saved_at": started, "submitted_at": None,
    }])


def test_submit_with_attempt_id_claims_it_and_grades_correctly(make_client, fake_db, student_user):
    _seed_scoring_paper_and_attempt(fake_db, student_user["id"])
    client = make_client(student_user)

    res = client.post("/api/quizzes/paper-score/submit-v2", json={
        "answers": {"q1": 2, "q2": 3}, "perQuestionTimes": [5, 5], "elapsedSeconds": 10,
        "attemptId": "att-1",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["correctCount"] == 1
    assert body["incorrectCount"] == 1
    assert body["submissionId"]

    row = fake_db.store["mcq_attempt_sessions"][0]
    assert row["status"] == "submitted"
    # The attempt row's own answers snapshot is what actually got graded.
    assert row["answers"] == {"q1": 2, "q2": 3}


def test_resubmitting_the_same_attempt_id_reproduces_the_identical_result(make_client, fake_db, student_user):
    _seed_scoring_paper_and_attempt(fake_db, student_user["id"])
    client = make_client(student_user)

    first = client.post("/api/quizzes/paper-score/submit-v2", json={
        "answers": {"q1": 2, "q2": 3}, "perQuestionTimes": [5, 5], "elapsedSeconds": 10,
        "attemptId": "att-1",
    })
    assert first.status_code == 200
    first_body = first.json()

    # A second call with the same attemptId — simulates a duplicate/retried
    # request racing the first, or a double-click on Submit — deliberately
    # sends DIFFERENT (wrong) answers, which must be ignored: grading is
    # re-derived from the persisted attempt snapshot, not this request body.
    second = client.post("/api/quizzes/paper-score/submit-v2", json={
        "answers": {"q1": 0, "q2": 0}, "perQuestionTimes": [1, 1], "elapsedSeconds": 1,
        "attemptId": "att-1",
    })
    assert second.status_code == 200
    second_body = second.json()
    assert second_body["score"] == first_body["score"]
    assert second_body["correctCount"] == first_body["correctCount"] == 1
    assert second_body["incorrectCount"] == first_body["incorrectCount"] == 1

    # No second leaderboard/result row was inserted for the replay.
    assert len(fake_db.store["quiz_attempts"]) == 1


def test_submitting_past_deadline_grades_the_persisted_snapshot_not_the_request_body(make_client, fake_db, student_user):
    started_at = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    # Persisted (autosaved) answers are the CORRECT ones.
    _seed_scoring_paper_and_attempt(
        fake_db, student_user["id"], started_at=started_at, duration_minutes=10,
        answers={"q1": 2, "q2": 1},
    )
    client = make_client(student_user)

    # The late request body claims WRONG answers — must be ignored.
    res = client.post("/api/quizzes/paper-score/submit-v2", json={
        "answers": {"q1": 0, "q2": 0}, "perQuestionTimes": [1, 1], "elapsedSeconds": 999999,
        "attemptId": "att-1",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["correctCount"] == 2
    assert body["incorrectCount"] == 0
    # elapsedSeconds is capped at the attempt's real duration, not the
    # (absurd) client-supplied value.
    assert body["totalTimeSeconds"] <= 10 * 60


def test_submit_with_attempt_id_belonging_to_another_user_is_rejected(make_client, fake_db, student_user):
    _seed_scoring_paper_and_attempt(fake_db, "someone-else")
    client = make_client(student_user)

    res = client.post("/api/quizzes/paper-score/submit-v2", json={
        "answers": {"q1": 2, "q2": 1}, "perQuestionTimes": [5, 5], "elapsedSeconds": 10,
        "attemptId": "att-1",
    })
    assert res.status_code == 403
