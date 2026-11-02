import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret-key-that-is-long-enough-1234"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def register(client, email="wanjiku@example.com", password="secret123", name="Wanjiku"):
    return client.post("/api/auth/register", json={"name": name, "email": email, "password": password})


@pytest.fixture
def auth_headers(client):
    token = register(client).json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_headers(client):
    token = register(client, email="otieno@example.com", name="Otieno").json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}