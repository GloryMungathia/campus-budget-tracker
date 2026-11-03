from sqlalchemy import create_engine, inspect, text

from app.main import add_missing_columns
from app.ratelimit import LoginLimiter, login_limiter, wait_message
from tests.conftest import register


def login(client, password="secret123"):
    return client.post("/api/auth/login", json={"email": "wanjiku@example.com", "password": password})


def test_next_money_date_starts_empty(client, auth_headers):
    assert client.get("/api/auth/me", headers=auth_headers).json()["nextMoneyDate"] is None


def test_set_and_clear_next_money_date(client, auth_headers):
    res = client.put("/api/auth/me/next-money", json={"nextMoneyDate": "2026-11-25"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["nextMoneyDate"] == "2026-11-25"
    assert client.get("/api/auth/me", headers=auth_headers).json()["nextMoneyDate"] == "2026-11-25"
    res = client.put("/api/auth/me/next-money", json={"nextMoneyDate": None}, headers=auth_headers)
    assert res.json()["nextMoneyDate"] is None


def test_next_money_date_rejects_bad_dates(client, auth_headers):
    res = client.put("/api/auth/me/next-money", json={"nextMoneyDate": "soon"}, headers=auth_headers)
    assert res.status_code == 422


def test_next_money_date_requires_login(client):
    assert client.put("/api/auth/me/next-money", json={"nextMoneyDate": "2026-11-25"}).status_code == 401


def test_five_wrong_passwords_locks_login(client):
    register(client)
    for _ in range(5):
        assert login(client, "wrongpass1").status_code == 401
    res = login(client)
    assert res.status_code == 429
    assert res.json()["detail"] == "Too many wrong attempts. Try again in 3 minutes."
    assert int(res.headers["retry-after"]) > 170


def test_correct_password_resets_count(client):
    register(client)
    for _ in range(4):
        login(client, "wrongpass1")
    assert login(client).status_code == 200
    for _ in range(4):
        assert login(client, "wrongpass1").status_code == 401
    assert login(client).status_code == 200


def test_lock_is_per_email(client):
    register(client)
    register(client, email="otieno@example.com", name="Otieno")
    for _ in range(5):
        login(client, "wrongpass1")
    res = client.post("/api/auth/login", json={"email": "otieno@example.com", "password": "secret123"})
    assert res.status_code == 200


def test_limiter_unlocks_after_wait():
    now = [1000.0]
    limiter = LoginLimiter(max_attempts=2, lock_seconds=180, clock=lambda: now[0])
    limiter.record_failure("a")
    assert limiter.seconds_left("a") == 0
    limiter.record_failure("a")
    assert limiter.seconds_left("a") == 181
    now[0] += 100
    assert 0 < limiter.seconds_left("a") <= 81
    now[0] += 81
    assert limiter.seconds_left("a") == 0
    limiter.record_failure("a")
    assert limiter.seconds_left("a") == 0


def test_wait_message():
    assert wait_message(180) == "Too many wrong attempts. Try again in 3 minutes."
    assert wait_message(30) == "Too many wrong attempts. Try again in 1 minute."


def test_shared_limiter_is_clean_between_tests(client):
    assert login_limiter.failures == {}


def test_old_database_gets_next_money_column():
    engine = create_engine("sqlite://")
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, avatar TEXT)"))
    add_missing_columns(engine)
    cols = {c["name"] for c in inspect(engine).get_columns("users")}
    assert {"avatar", "next_money_date"} <= cols
