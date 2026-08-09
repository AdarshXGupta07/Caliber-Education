import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.dependencies import get_current_user, require_admin, require_mentor
from tests.fake_supabase import FakeSupabaseClient


@pytest.fixture
def fake_db():
    return FakeSupabaseClient()


@pytest.fixture
def make_client(fake_db):
    """Factory: make_client(user, as_admin=False, as_mentor=False) -> TestClient.

    Wires the app to `fake_db` (never the real Supabase project) and a fixed
    authenticated user, bypassing real JWT decoding entirely via FastAPI's
    dependency_overrides — the same mechanism the app already uses `Depends`
    for, just pointed at test doubles.
    """

    def _make(user: dict, as_admin: bool = False, as_mentor: bool = False):
        app.dependency_overrides[get_db] = lambda: fake_db
        app.dependency_overrides[get_current_user] = lambda: user
        if as_admin:
            app.dependency_overrides[require_admin] = lambda: user
        if as_mentor:
            app.dependency_overrides[require_mentor] = lambda: user
        return TestClient(app)

    yield _make
    app.dependency_overrides.clear()


@pytest.fixture
def student_user():
    return {"id": "student-1", "role": "student", "email": "student@example.com"}


@pytest.fixture
def admin_user():
    return {"id": "admin-1", "role": "admin", "email": "admin@example.com"}


@pytest.fixture
def mentor_user():
    return {"id": "mentor-1", "role": "mentor", "email": "mentor@example.com"}
