"""
LaunderyLens - Authentication & Analyst Access Control
Provides secure password verification, session tokens, and RBAC for AML investigators.
"""
import hashlib
import secrets
import time
from typing import Optional, Dict, Any
from pydantic import BaseModel

# Session token storage (token -> session_dict)
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

# Authorized Analyst Registry
# Default credentials for financial crime investigators
ANALYST_USERS: Dict[str, Dict[str, Any]] = {
    "analyst@launderylens.ai": {
        "email": "analyst@launderylens.ai",
        "name": "Sarah Jenkins, CAMS",
        "role": "Lead AML Forensic Investigator",
        "badge_id": "LL-AML-8921",
        "clearance_level": "Level 4 - FIU Sensitive Compartmented",
        "agency": "Financial Crimes Enforcement Network (FinCEN) / LaunderyLens Core",
        # PBKDF2 hash of "LaunderyLens@2026"
        "salt": "4f9d8a1c3e7b2a5f",
        "password_hash": hashlib.pbkdf2_hmac(
            "sha256",
            "LaunderyLens@2026".encode("utf-8"),
            "4f9d8a1c3e7b2a5f".encode("utf-8"),
            100000
        ).hex(),
    },
    "investigator@fiu.gov": {
        "email": "investigator@fiu.gov",
        "name": "Rajesh Kumar, CFE",
        "role": "Supervisory Intelligence Officer",
        "badge_id": "FIU-IND-4402",
        "clearance_level": "Level 5 - Director Discretionary",
        "agency": "Financial Intelligence Unit (FIU-IND)",
        "salt": "9e2c4a7b1f6d3e8a",
        "password_hash": hashlib.pbkdf2_hmac(
            "sha256",
            "FIU@Secure2026".encode("utf-8"),
            "9e2c4a7b1f6d3e8a".encode("utf-8"),
            100000
        ).hex(),
    },
    "demo@launderylens.ai": {
        "email": "demo@launderylens.ai",
        "name": "Senior AML Auditor",
        "role": "Compliance Analyst",
        "badge_id": "LL-DEMO-001",
        "clearance_level": "Level 3 - Operational Surveillance",
        "agency": "LaunderyLens Global Intelligence",
        "salt": "1a2b3c4d5e6f7a8b",
        "password_hash": hashlib.pbkdf2_hmac(
            "sha256",
            "demo123".encode("utf-8"),
            "1a2b3c4d5e6f7a8b".encode("utf-8"),
            100000
        ).hex(),
    }
}


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    expires_in_seconds: int = 86400
    user: Dict[str, Any]


def verify_analyst_password(stored_hash: str, salt: str, password_attempt: str) -> bool:
    attempt_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password_attempt.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()
    return secrets.compare_digest(stored_hash, attempt_hash)


def authenticate_analyst(email: str, password: str) -> Optional[LoginResponse]:
    clean_email = email.strip().lower()
    user_record = ANALYST_USERS.get(clean_email)
    if not user_record:
        return None

    if not verify_analyst_password(user_record["password_hash"], user_record["salt"], password):
        return None

    token = f"ll_sec_{secrets.token_urlsafe(32)}"
    user_profile = {
        "email": user_record["email"],
        "name": user_record["name"],
        "role": user_record["role"],
        "badge_id": user_record["badge_id"],
        "clearance_level": user_record["clearance_level"],
        "agency": user_record["agency"],
    }

    ACTIVE_SESSIONS[token] = {
        "user": user_profile,
        "created_at": int(time.time()),
        "expires_at": int(time.time()) + 86400,
    }

    return LoginResponse(
        token=token,
        user=user_profile,
    )


def validate_session(token: str) -> Optional[Dict[str, Any]]:
    session = ACTIVE_SESSIONS.get(token)
    if not session:
        return None
    if time.time() > session["expires_at"]:
        del ACTIVE_SESSIONS[token]
        return None
    return session["user"]


def revoke_session(token: str) -> bool:
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        return True
    return False
