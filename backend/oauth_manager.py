"""
OAuth Module for Creator Nest YouTube Automation.
Handles Google OAuth consent flow, per-channel token exchange, and encrypted storage.
Ground Rules:
- OAuth only, never passwords
- Request sensitive scopes only when needed (youtube.force-ssl, youtube.readonly)
- Store encrypted refresh tokens
"""

import os
import urllib.parse
import urllib.request
import json
import base64
from typing import Dict, Any, Optional
from datetime import datetime

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/youtube/automation/oauth/callback")

ENCRYPTION_KEY = os.environ.get("ENCRYPTION_SECRET", "creatornest-yt-sec-key-2026")

def encrypt_token(token: str) -> str:
    """Simple XOR-based reversible obfuscation/encryption for local credentials."""
    if not token:
        return ""
    key = ENCRYPTION_KEY
    enc = []
    for i in range(len(token)):
        key_c = key[i % len(key)]
        enc_c = chr((ord(token[i]) + ord(key_c)) % 256)
        enc.append(enc_c)
    return base64.urlsafe_b64encode("".join(enc).encode("latin-1")).decode("ascii")

def decrypt_token(enc_token: str) -> str:
    if not enc_token:
        return ""
    try:
        decoded = base64.urlsafe_b64decode(enc_token.encode("ascii")).decode("latin-1")
        key = ENCRYPTION_KEY
        orig = []
        for i in range(len(decoded)):
            key_c = key[i % len(key)]
            orig_c = chr((ord(decoded[i]) - ord(key_c)) % 256)
            orig.append(orig_c)
        return "".join(orig)
    except Exception:
        return enc_token

def get_auth_consent_url(state: str = "creatornest") -> str:
    """Generates the Google OAuth consent URL for YouTube Data & Analytics scopes."""
    scopes = [
        "https://www.googleapis.com/auth/youtube.force-ssl",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly"
    ]
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(scopes),
        "access_type": "offline",
        "prompt": "consent",
        "state": state
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    """Exchanges Google authorization code for access and refresh tokens."""
    token_url = "https://oauth2.googleapis.com/token"
    payload = urllib.parse.urlencode({
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }).encode("utf-8")

    req = urllib.request.Request(token_url, data=payload, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))
