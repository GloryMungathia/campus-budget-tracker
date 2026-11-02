from sqlalchemy import create_engine, inspect, text

from app.main import add_missing_columns
from app.schemas import AVATAR_MAX_LENGTH

PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD="


def test_new_user_has_no_photo(client, auth_headers):
    assert client.get("/api/auth/me", headers=auth_headers).json()["avatar"] is None


def test_upload_photo(client, auth_headers):
    res = client.put("/api/auth/me/avatar", json={"image": PHOTO}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["avatar"] == PHOTO
    assert client.get("/api/auth/me", headers=auth_headers).json()["avatar"] == PHOTO


def test_photo_comes_back_on_login(client, auth_headers):
    client.put("/api/auth/me/avatar", json={"image": PHOTO}, headers=auth_headers)
    res = client.post("/api/auth/login", json={"email": "wanjiku@example.com", "password": "secret123"})
    assert res.json()["user"]["avatar"] == PHOTO


def test_remove_photo(client, auth_headers):
    client.put("/api/auth/me/avatar", json={"image": PHOTO}, headers=auth_headers)
    res = client.delete("/api/auth/me/avatar", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["avatar"] is None


def test_rejects_bad_photos(client, auth_headers):
    bad = [
        "not an image",
        "data:text/html;base64,PGgxPg==",
        "data:image/svg+xml;base64,PHN2Zz4=",
        "data:image/png;base64,abc def",
        "data:image/png;base64," + "A" * AVATAR_MAX_LENGTH,
    ]
    for image in bad:
        assert client.put("/api/auth/me/avatar", json={"image": image}, headers=auth_headers).status_code == 422


def test_photo_too_big_message(client, auth_headers):
    res = client.put("/api/auth/me/avatar", json={"image": "data:image/png;base64," + "A" * AVATAR_MAX_LENGTH}, headers=auth_headers)
    assert "too big" in res.json()["detail"][0]["msg"]


def test_photo_requires_login(client):
    assert client.put("/api/auth/me/avatar", json={"image": PHOTO}).status_code == 401
    assert client.delete("/api/auth/me/avatar").status_code == 401


def test_old_database_gets_avatar_column():
    engine = create_engine("sqlite://")
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"))
    add_missing_columns(engine)
    add_missing_columns(engine)
    assert "avatar" in {c["name"] for c in inspect(engine).get_columns("users")}
