"""
Database Module for Creator Nest YouTube Automation & Monetization Engine.
Uses SQLite for zero-setup local persistence and high reliability.
Supports channels, encrypted tokens, draft suggestions, and change history.
"""

import sqlite3
import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "creatornest_yt.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Connected Channels & Tokens
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        handle TEXT NOT NULL,
        title TEXT NOT NULL,
        subscribers INTEGER DEFAULT 0,
        total_views INTEGER DEFAULT 0,
        video_count INTEGER DEFAULT 0,
        thumbnail_url TEXT,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TEXT,
        connected_at TEXT,
        updated_at TEXT
    )
    """)

    # 2. Audit Reports
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_reports (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        monetization_status TEXT NOT NULL,
        policy_flags TEXT,
        seo_issues TEXT,
        raw_json TEXT,
        created_at TEXT
    )
    """)

    # 3. Draft Changes (Review Queue)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS draft_changes (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        video_id TEXT,
        item_type TEXT NOT NULL,
        field_name TEXT NOT NULL,
        current_value TEXT NOT NULL,
        suggested_value TEXT NOT NULL,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | published
        created_at TEXT,
        reviewed_at TEXT
    )
    """)

    # 4. Change Logs (Publisher & Rollback History)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS change_logs (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        video_id TEXT,
        field_name TEXT NOT NULL,
        old_value TEXT NOT NULL,
        new_value TEXT NOT NULL,
        published_at TEXT,
        status TEXT NOT NULL DEFAULT 'published', -- published | rolled_back
        rolled_back_at TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()
