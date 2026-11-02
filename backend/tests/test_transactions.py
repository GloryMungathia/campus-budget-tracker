def make_tx(**overrides):
    data = {"type": "expense", "categoryId": "food", "amount": 250, "date": "2026-11-02", "note": "  Canteen lunch  "}
    data.update(overrides)
    return data


def test_requires_login(client):
    assert client.get("/api/transactions").status_code == 401
    assert client.post("/api/transactions", json=make_tx()).status_code == 401
    assert client.delete("/api/transactions/1").status_code == 401


def test_starts_empty(client, auth_headers):
    res = client.get("/api/transactions", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_create_transaction(client, auth_headers):
    res = client.post("/api/transactions", json=make_tx(), headers=auth_headers)
    assert res.status_code == 201
    body = res.json()
    assert body["id"]
    assert body["type"] == "expense"
    assert body["categoryId"] == "food"
    assert body["amount"] == 250
    assert body["date"] == "2026-11-02"
    assert body["note"] == "Canteen lunch"
    assert body["createdAt"]


def test_create_income(client, auth_headers):
    res = client.post("/api/transactions", json=make_tx(type="income", categoryId="helb", amount=45000), headers=auth_headers)
    assert res.status_code == 201


def test_note_is_optional(client, auth_headers):
    data = make_tx()
    del data["note"]
    res = client.post("/api/transactions", json=data, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["note"] == ""


def test_rejects_invalid_transactions(client, auth_headers):
    bad = [
        make_tx(amount=0),
        make_tx(amount=-5),
        make_tx(type="gift"),
        make_tx(categoryId="helb"),
        make_tx(type="income", categoryId="food"),
        make_tx(categoryId="unknown"),
        make_tx(date="not-a-date"),
        make_tx(note="x" * 81),
    ]
    for data in bad:
        assert client.post("/api/transactions", json=data, headers=auth_headers).status_code == 422, data


def test_list_sorted_newest_first(client, auth_headers):
    client.post("/api/transactions", json=make_tx(date="2026-10-01", note="old"), headers=auth_headers)
    client.post("/api/transactions", json=make_tx(date="2026-11-01", note="new"), headers=auth_headers)
    client.post("/api/transactions", json=make_tx(date="2026-10-15", note="mid"), headers=auth_headers)
    notes = [t["note"] for t in client.get("/api/transactions", headers=auth_headers).json()]
    assert notes == ["new", "mid", "old"]


def test_delete_transaction(client, auth_headers):
    tx_id = client.post("/api/transactions", json=make_tx(), headers=auth_headers).json()["id"]
    assert client.delete(f"/api/transactions/{tx_id}", headers=auth_headers).status_code == 204
    assert client.get("/api/transactions", headers=auth_headers).json() == []
    assert client.delete(f"/api/transactions/{tx_id}", headers=auth_headers).status_code == 404


def test_users_only_see_their_own(client, auth_headers, other_headers):
    tx_id = client.post("/api/transactions", json=make_tx(), headers=auth_headers).json()["id"]
    assert client.get("/api/transactions", headers=other_headers).json() == []
    assert client.delete(f"/api/transactions/{tx_id}", headers=other_headers).status_code == 404
    assert len(client.get("/api/transactions", headers=auth_headers).json()) == 1


def test_edit_transaction(client, auth_headers):
    created = client.post("/api/transactions", json=make_tx(), headers=auth_headers).json()
    res = client.put(
        f"/api/transactions/{created['id']}",
        json=make_tx(amount=300, categoryId="transport", date="2026-11-01", note=" Matatu "),
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["id"] == created["id"]
    assert body["amount"] == 300
    assert body["categoryId"] == "transport"
    assert body["date"] == "2026-11-01"
    assert body["note"] == "Matatu"
    assert body["createdAt"] == created["createdAt"]
    listed = client.get("/api/transactions", headers=auth_headers).json()
    assert len(listed) == 1
    assert listed[0]["amount"] == 300


def test_edit_can_switch_type(client, auth_headers):
    tx_id = client.post("/api/transactions", json=make_tx(), headers=auth_headers).json()["id"]
    res = client.put(f"/api/transactions/{tx_id}", json=make_tx(type="income", categoryId="helb"), headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["type"] == "income"


def test_edit_rejects_invalid_data(client, auth_headers):
    tx_id = client.post("/api/transactions", json=make_tx(), headers=auth_headers).json()["id"]
    assert client.put(f"/api/transactions/{tx_id}", json=make_tx(amount=0), headers=auth_headers).status_code == 422
    assert client.put(f"/api/transactions/{tx_id}", json=make_tx(categoryId="helb"), headers=auth_headers).status_code == 422
    assert client.get("/api/transactions", headers=auth_headers).json()[0]["amount"] == 250


def test_edit_missing_or_other_users_transaction(client, auth_headers, other_headers):
    tx_id = client.post("/api/transactions", json=make_tx(), headers=auth_headers).json()["id"]
    assert client.put("/api/transactions/9999", json=make_tx(), headers=auth_headers).status_code == 404
    assert client.put(f"/api/transactions/{tx_id}", json=make_tx(amount=1), headers=other_headers).status_code == 404
    assert client.put(f"/api/transactions/{tx_id}", json=make_tx()).status_code == 401
    assert client.get("/api/transactions", headers=auth_headers).json()[0]["amount"] == 250
