"""
OTP Flow Integration Tests
==========================
Tests OTP generation and verification endpoints:
- POST /api/v1/auth/otp/send
- POST /api/v1/auth/otp/verify
"""

import pytest
from fastapi.testclient import TestClient


def test_send_and_verify_otp(client: TestClient):
    email = "testotp@example.com"

    # 1. Send OTP
    send_res = client.post(
        "/api/v1/auth/otp/send",
        json={"email": email, "type": "ACCOUNT_VERIFICATION"},
    )
    assert send_res.status_code == 200
    assert send_res.json()["success"] is True

    # 2. Verify invalid OTP fails
    verify_bad = client.post(
        "/api/v1/auth/otp/verify",
        json={"email": email, "code": "000000", "type": "ACCOUNT_VERIFICATION"},
    )
    assert verify_bad.status_code == 400
    assert "Invalid OTP code" in verify_bad.json()["detail"]
