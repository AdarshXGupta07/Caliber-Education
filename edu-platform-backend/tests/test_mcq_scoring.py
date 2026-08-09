"""Question-ID-based scoring: submit-v2 must grade each answer against the
question it actually belongs to, looked up by ID — not by array position.

Also regression-covers a second bug found while rewriting this endpoint: the
per-question dict stored the answer key under `correct_option_index`, but the
grading comparison read `q.get("correct_option", 0)` — a key that was never
set on that dict — so every question was silently graded as if option index
0 were always correct, independent of shuffle.
"""


def _seed_scoring_paper(fake_db, paper_id="paper-score", locked=False):
    fake_db.seed("mcq_papers", [{
        "id": paper_id, "title": "Scoring Test", "level": "FINAL",
        "subject_code": "FR", "is_locked": locked, "shuffle_questions": True,
        "passing_marks": 40.0,
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
        {
            "id": "q3", "section_id": "sec-score", "type": "normal", "case_narrative": "",
            "case_group_id": None, "chapter_tag": "General", "difficulty": "medium",
            "marks": 1.0, "negative_marks": 0.0, "content": "Q3",
            "options": ["a", "b", "c", "d"], "correct_option": 0, "explanation": "", "order_index": 2,
        },
    ])


def test_submit_v2_grades_by_question_id_and_returns_ordered_analysis(make_client, fake_db, student_user):
    _seed_scoring_paper(fake_db)
    client = make_client(student_user)

    res = client.post(f"/api/quizzes/paper-score/submit-v2", json={
        # Deliberately not in order_index order — simulates a client-shuffled
        # attempt where the display order differs from the canonical order.
        "answers": {"q3": None, "q1": 2, "q2": 3},
        "perQuestionTimes": [10, 12, 8],
        "elapsedSeconds": 30,
    })
    assert res.status_code == 200
    body = res.json()

    assert body["correctCount"] == 1
    assert body["incorrectCount"] == 1
    assert body["skippedCount"] == 1
    # q1: marks 1 correct = +1.0; q2: negative_marks 0.5 incorrect = -0.5; q3: skipped = 0
    assert body["score"] == 0.5

    analysis = body["questionAnalysis"]
    # Must come back in canonical order_index order (q1, q2, q3), regardless
    # of the order keys were submitted in.
    assert [a["questionId"] for a in analysis] == ["q1", "q2", "q3"]

    by_id = {a["questionId"]: a for a in analysis}
    assert by_id["q1"]["status"] == "correct"
    assert by_id["q2"]["status"] == "incorrect"
    assert by_id["q3"]["status"] == "skipped"


def test_submit_v2_grades_against_actual_correct_option_not_always_zero(make_client, fake_db, student_user):
    """Regression test for the correct_option/correct_option_index key bug:
    before the fix this always compared against a hardcoded 0 default."""
    _seed_scoring_paper(fake_db)
    client = make_client(student_user)

    # q1's real correct_option is 2 (not 0). Selecting it must score correct.
    res = client.post("/api/quizzes/paper-score/submit-v2", json={
        "answers": {"q1": 2, "q2": None, "q3": None},
        "perQuestionTimes": [5, 0, 0],
        "elapsedSeconds": 5,
    })
    assert res.status_code == 200
    body = res.json()
    q1_analysis = next(a for a in body["questionAnalysis"] if a["questionId"] == "q1")
    assert q1_analysis["status"] == "correct"
    assert q1_analysis["correctOptionIndex"] == 2
    assert body["correctCount"] == 1
    assert body["incorrectCount"] == 0
