"""
Route-level integration tests for /api/v1/auth/*.

Tests cover:
  - register: happy path, duplicate email
  - login: valid credentials, wrong password, unknown email
  - cookie presence and HttpOnly flag after login
  - refresh: via cookie, via body, invalid token
  - logout: clears cookies and invalidates refresh token in DB
  - ownership: resource created by user A is not accessible by user B
"""
import os
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-chars-long!")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import pytest

AUTH = "/api/v1/auth"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _register(client, email="user@example.com", password="SecurePass1!"):
    return client.post(f"{AUTH}/register", json={"email": email, "password": password})


def _login(client, email="user@example.com", password="SecurePass1!"):
    return client.post(f"{AUTH}/login", json={"email": email, "password": password})


def _register_and_login(client, email="user@example.com", password="SecurePass1!"):
    _register(client, email, password)
    return _login(client, email, password)


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

class TestRegister:
    def test_returns_201_with_user(self, client):
        r = _register(client)
        assert r.status_code == 201
        body = r.json()
        assert body["email"] == "user@example.com"
        assert "id" in body
        assert "password" not in body
        assert "password_hash" not in body

    def test_duplicate_email_returns_422(self, client):
        _register(client)
        r = _register(client)
        assert r.status_code == 422

    def test_password_too_long_returns_422(self, client):
        r = _register(client, password="x" * 73)
        assert r.status_code == 422

    def test_invalid_email_returns_422(self, client):
        r = _register(client, email="not-an-email")
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class TestLogin:
    def test_returns_200_with_tokens(self, client):
        _register(client)
        r = _login(client)
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"

    def test_sets_httponly_access_cookie(self, client):
        _register(client)
        r = _login(client)
        assert r.status_code == 200
        cookies = r.headers.get_list("set-cookie")
        access_cookies = [c for c in cookies if "access_token" in c]
        assert access_cookies, "access_token cookie not set"
        assert any("HttpOnly" in c or "httponly" in c.lower() for c in access_cookies)

    def test_sets_httponly_refresh_cookie(self, client):
        _register(client)
        r = _login(client)
        cookies = r.headers.get_list("set-cookie")
        refresh_cookies = [c for c in cookies if "refresh_token" in c]
        assert refresh_cookies, "refresh_token cookie not set"
        assert any("HttpOnly" in c or "httponly" in c.lower() for c in refresh_cookies)

    def test_wrong_password_returns_401(self, client):
        _register(client)
        r = _login(client, password="WrongPass!")
        assert r.status_code == 401

    def test_unknown_email_returns_401(self, client):
        r = _login(client, email="ghost@example.com")
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------

class TestRefresh:
    def test_refresh_via_body_returns_new_tokens(self, client):
        _register(client)
        login_r = _login(client)
        old_refresh = login_r.json()["refresh_token"]

        r = client.post(f"{AUTH}/refresh", json={"refresh_token": old_refresh})
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        # Token rotation: new refresh token differs from the old one
        assert body["refresh_token"] != old_refresh

    def test_refresh_via_cookie_returns_new_tokens(self, client):
        _register(client)
        _login(client)  # sets cookies on the TestClient jar
        r = client.post(f"{AUTH}/refresh", json={})
        assert r.status_code == 200

    def test_invalid_token_returns_401(self, client):
        r = client.post(f"{AUTH}/refresh", json={"refresh_token": "not.a.valid.jwt"})
        assert r.status_code == 401

    def test_old_refresh_token_rejected_after_rotation(self, client):
        _register(client)
        login_r = _login(client)
        old_refresh = login_r.json()["refresh_token"]

        # Rotate
        client.post(f"{AUTH}/refresh", json={"refresh_token": old_refresh})

        # Old token must now be rejected
        r = client.post(f"{AUTH}/refresh", json={"refresh_token": old_refresh})
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

class TestLogout:
    def test_returns_204(self, client):
        _register(client)
        _login(client)
        r = client.post(f"{AUTH}/logout")
        assert r.status_code == 204

    def test_clears_cookies(self, client):
        _register(client)
        _login(client)
        r = client.post(f"{AUTH}/logout")
        cookies = r.headers.get_list("set-cookie")
        # FastAPI delete_cookie sets Max-Age=0 to expire the cookie
        access_cleared = any("access_token" in c and "max-age=0" in c.lower() for c in cookies)
        refresh_cleared = any("refresh_token" in c and "max-age=0" in c.lower() for c in cookies)
        assert access_cleared
        assert refresh_cleared

    def test_refresh_token_invalidated_after_logout(self, client):
        _register(client)
        login_r = _login(client)
        refresh = login_r.json()["refresh_token"]

        client.post(f"{AUTH}/logout")

        r = client.post(f"{AUTH}/refresh", json={"refresh_token": refresh})
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Ownership / authorization
# ---------------------------------------------------------------------------

class TestOwnership:
    def test_user_cannot_delete_another_users_transaction(self, client):
        # Create two users
        _register(client, email="alice@example.com")
        alice_login = _login(client, email="alice@example.com")
        alice_token = alice_login.json()["access_token"]

        _register(client, email="bob@example.com")
        bob_login = _login(client, email="bob@example.com")
        bob_token = bob_login.json()["access_token"]

        # Alice creates a transaction
        tx_r = client.post(
            "/api/v1/transactions",
            json={"amount": 1000, "currency": "HUF", "transaction_date": "2026-04-23"},
            headers={"Authorization": f"Bearer {alice_token}"},
        )
        assert tx_r.status_code == 201
        tx_id = tx_r.json()["id"]

        # Bob tries to delete it — must get 404, not 204
        del_r = client.delete(
            f"/api/v1/transactions/{tx_id}",
            headers={"Authorization": f"Bearer {bob_token}"},
        )
        assert del_r.status_code == 404
