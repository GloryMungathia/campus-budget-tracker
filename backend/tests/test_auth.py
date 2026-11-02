from datetime import datetime, timedelta, timezone

import jwt

from app.config import get_settings, normalize_db_url, split_origins
from app.security import ALGORITHM, hash_password, verify_password
from tests.conftest import register


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_register_returns_token_and_user(client):
    res = register(client)
    assert res.status_code == 201
    body = res.json()
    assert body["accessToken"]
    assert body["tokenType"] == "bearer"
    assert body["user"]["email"] == "wanjiku@example.com"
    assert body["user"]["name"] == "Wanjiku"
    assert "passwordHash" not in body["user"]


def test_register_lowercases_email(client):
    res = register(client, email="  Wanjiku@Example.COM ")
    assert res.json()["user"]["email"] == "wanjiku@example.com"


def test_register_duplicate_email(client):
    register(client)
    res = register(client, email="WANJIKU@example.com")
    assert res.status_code == 409


def test_register_rejects_bad_input(client):
    assert register(client, email="not-an-email").status_code == 422
    assert register(client, password="short").status_code == 422
    assert register(client, name="   ").status_code == 422


def test_login_success(client):
    register(client)
    res = client.post("/api/auth/login", json={"email": "WANJIKU@example.com", "password": "secret123"})
    assert res.status_code == 200
    assert res.json()["user"]["name"] == "Wanjiku"


def test_login_wrong_password(client):
    register(client)
    res = client.post("/api/auth/login", json={"email": "wanjiku@example.com", "password": "wrongpass"})
    assert res.status_code == 401


def test_login_unknown_email(client):
    res = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "secret123"})
    assert res.status_code == 401


def test_me(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "wanjiku@example.com"


def test_me_without_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_with_bad_token(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer nonsense"})
    assert res.status_code == 401


def test_me_with_expired_token(client, auth_headers):
    past = datetime.now(timezone.utc) - timedelta(days=1)
    token = jwt.encode({"sub": "1", "exp": past}, get_settings().secret_key, algorithm=ALGORITHM)
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401


def test_me_for_deleted_user(client):
    token = jwt.encode(
        {"sub": "999", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        get_settings().secret_key,
        algorithm=ALGORITHM,
    )
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401


def test_password_hashing():
    stored = hash_password("secret123")
    assert stored.startswith("scrypt$")
    assert "secret123" not in stored
    assert verify_password("secret123", stored)
    assert not verify_password("secret124", stored)
    assert not verify_password("secret123", "garbage")
    assert not verify_password("secret123", "bcrypt$a$b")


def test_normalize_db_url():
    assert normalize_db_url("postgres://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_db_url("postgresql://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_db_url("sqlite:///./x.db") == "sqlite:///./x.db"


def test_split_origins():
    assert split_origins("https://a.netlify.app/, http://localhost:5173 ,") == [
        "https://a.netlify.app",
        "http://localhost:5173",
    ]


def test_cors_allows_frontend(client):
    res = client.options(
        "/api/health",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
    )
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_category_matches_type():
    from app.categories import category_matches_type

    assert category_matches_type("food", "expense")
    assert category_matches_type("helb", "income")
    assert not category_matches_type("food", "income")
    assert not category_matches_type("food", "gift")


def test_get_db_yields_session():
    from app.database import get_db

    gen = get_db()
    db = next(gen)
    assert db is not None
    gen.close()


def test_hosted_database_needs_secret_key():
    import pytest

    from app.config import DEV_SECRET, Settings, check_settings

    with pytest.raises(RuntimeError):
        check_settings(Settings(database_url="postgresql+psycopg://u:p@h/db", secret_key=DEV_SECRET))
    ok = Settings(database_url="postgresql+psycopg://u:p@h/db", secret_key="a-real-long-secret-value")
    assert check_settings(ok) is ok
    assert check_settings(Settings(database_url="sqlite://", secret_key=DEV_SECRET))