def test_requires_login(client):
    assert client.get("/api/budgets").status_code == 401
    assert client.put("/api/budgets/food", json={"limit": 100}).status_code == 401
    assert client.delete("/api/budgets/food").status_code == 401


def test_starts_empty(client, auth_headers):
    assert client.get("/api/budgets", headers=auth_headers).json() == []


def test_create_and_update_budget(client, auth_headers):
    res = client.put("/api/budgets/food", json={"limit": 12000}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == {"categoryId": "food", "limit": 12000}

    res = client.put("/api/budgets/food", json={"limit": 9000}, headers=auth_headers)
    assert res.json()["limit"] == 9000

    budgets = client.get("/api/budgets", headers=auth_headers).json()
    assert budgets == [{"categoryId": "food", "limit": 9000}]


def test_rejects_invalid_budgets(client, auth_headers):
    assert client.put("/api/budgets/food", json={"limit": 0}, headers=auth_headers).status_code == 422
    assert client.put("/api/budgets/food", json={"limit": -1}, headers=auth_headers).status_code == 422
    assert client.put("/api/budgets/helb", json={"limit": 100}, headers=auth_headers).status_code == 422
    assert client.put("/api/budgets/unknown", json={"limit": 100}, headers=auth_headers).status_code == 422


def test_delete_budget(client, auth_headers):
    client.put("/api/budgets/transport", json={"limit": 2000}, headers=auth_headers)
    assert client.delete("/api/budgets/transport", headers=auth_headers).status_code == 204
    assert client.get("/api/budgets", headers=auth_headers).json() == []
    assert client.delete("/api/budgets/transport", headers=auth_headers).status_code == 404


def test_users_only_see_their_own(client, auth_headers, other_headers):
    client.put("/api/budgets/food", json={"limit": 5000}, headers=auth_headers)
    assert client.get("/api/budgets", headers=other_headers).json() == []
    client.put("/api/budgets/food", json={"limit": 7000}, headers=other_headers)
    assert client.get("/api/budgets", headers=auth_headers).json()[0]["limit"] == 5000
    assert client.delete("/api/budgets/food", headers=other_headers).status_code == 204
    assert client.get("/api/budgets", headers=auth_headers).json()[0]["limit"] == 5000