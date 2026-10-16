"""
Review Queue Module for Creator Nest YouTube Automation.
Enforces human-in-the-loop review before any change is published to YouTube.
Operations:
- List drafts with before/after diff
- Approve draft
- Edit proposed change
- Reject draft
- Bulk approve low-risk items
"""

import sqlite3
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.database import get_connection

def add_draft(
    channel_id: str,
    item_type: str,
    field_name: str,
    current_value: str,
    suggested_value: str,
    reason: str,
    video_id: Optional[str] = None
) -> str:
    draft_id = f"draft-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO draft_changes (id, channel_id, video_id, item_type, field_name, current_value, suggested_value, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    """, (draft_id, channel_id, video_id, item_type, field_name, current_value, suggested_value, reason, now))
    conn.commit()
    conn.close()
    return draft_id

def get_channel_drafts(channel_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM draft_changes WHERE channel_id = ? ORDER BY created_at DESC", (channel_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_draft_status(draft_id: str, status: str, edited_value: Optional[str] = None) -> bool:
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    if edited_value:
        cursor.execute("""
        UPDATE draft_changes SET status = ?, suggested_value = ?, reviewed_at = ? WHERE id = ?
        """, (status, edited_value, now, draft_id))
    else:
        cursor.execute("""
        UPDATE draft_changes SET status = ?, reviewed_at = ? WHERE id = ?
        """, (status, now, draft_id))
    conn.commit()
    conn.close()
    return True

def bulk_approve_all(channel_id: str) -> int:
    now = datetime.utcnow().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE draft_changes SET status = 'approved', reviewed_at = ?
    WHERE channel_id = ? AND status = 'pending'
    """, (now, channel_id))
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return count
