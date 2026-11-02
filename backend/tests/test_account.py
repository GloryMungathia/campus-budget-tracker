from datetime import datetime, timezone

import jwt

from app.config import get_settings
from app.security import ALGORITHM
from tests.conftest import register


def token_days(token: str) -> float:
    payload = jwt.decode(token, get_settings().secret_key, algorithms=[ALGORITHM])
    left = datetime.fromtimestamp(payload["exp"], timezone.utc) - datetime.now(timezone.utc)
    return left.total_seconds() / 86400


def login(client, remember=None, password="secret123"):
    body = {"email": "wanjiku@example.com", "password": password}
    if remember is not None:
        body["remember"] = remember
    return client.post("/api/auth/login", json=body)


def test_password_needs_letter_and_number(client):
    assert register(client, password="12345678").status_code == 422
    assert register(client, password="abcdefgh").status_code == 422
    res = register(client, password="abcdefgh")
    assert "letter and one number" in res.json()["detail"][0]["msg"]


def test_register_keeps_user_logged_in_for_30_days(client):
    token = register(client).json()["accessToken"]
    assert 29 < token_days(token) <= 30


def test_login_without_remember_lasts_one_day(client):
    register(client)
    token = login(client).json()["accessToken"]
    assert 0.9 < token_days(token) <= 1


def test_login_with_remember_lasts_30_days(client):
    register(client)
    token = login(client, remember=True).json()["accessToken"]
    assert 29 < token_days(token) <= 30


def test_update_name(client, auth_headers):
    res = client.patch("/api/auth/me", json={"name": "  Wanjiku Mwangi "}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["name"] == "Wanjiku Mwangi"
    assert client.get("/api/auth/me", headers=auth_headers).json()["name"] == "Wanjiku Mwangi"


def test_update_name_rejects_blank(client, auth_headers):
    assert client.patch("/api/auth/me", json={"name": "   "}, headers=auth_headers).status_code == 422


def test_update_name_requires_login(client):
    assert client.patch("/api/auth/me", json={"name": "X"}).status_code == 401


def test_change_password(client, auth_headers):
    res = client.post(
        "/api/auth/change-password",
        json={"currentPassword": "secret123", "newPassword": "newpass456"},
        headers=auth_headers,
    )
    assert res.status_code == 204
    assert login(client).status_code == 401
    assert login(client, password="newpass456").status_code == 200


def test_change_password_wrong_current(client, auth_headers):
    res = client.post(
        "/api/auth/change-password",
        json={"currentPassword": "wrong1234", "newPassword": "newpass456"},
        headers=auth_headers,
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Current password is wrong"


def test_change_password_must_be_different(client, auth_headers):
    res = client.post(
        "/api/auth/change-password",
        json={"currentPassword": "secret123", "newPassword": "secret123"},
        headers=auth_headers,
    )
    assert res.status_code == 400


def test_change_password_checks_new_password(client, auth_headers):
    res = client.post(
        "/api/auth/change-password",
        json={"currentPassword": "secret123", "newPassword": "short"},
        headers=auth_headers,
    )
    assert res.status_code == 422


def test_delete_account_removes_everything(client, auth_headers):
    client.post(
        "/api/transactions",
        json={"type": "expense", "categoryId": "food", "amount": 100, "date": "2026-11-02"},
        headers=auth_headers,
    )
    client.put("/api/budgets/food", json={"limit": 500}, headers=auth_headers)
    res = client.post("/api/auth/delete-account", json={"password": "secret123"}, headers=auth_headers)
    assert res.status_code == 204
    assert client.get("/api/auth/me", headers=auth_headers).status_code == 401
    assert login(client).status_code == 401
    assert register(client).status_code == 201


def test_delete_account_wrong_password(client, auth_headers):
    res = client.post("/api/auth/delete-account", json={"password": "wrong1234"}, headers=auth_headers)
    assert res.status_code == 400
    assert client.get("/api/auth/me", headers=auth_headers).status_code == 200
