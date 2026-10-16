"""
Audit Engine for Creator Nest YouTube Automation.
Connects via YouTube Data API v3 (using YOUTUBE_API_KEY or OAuth tokens).
Extracts:
- Channel details (snippet, statistics, brandingSettings, contentDetails)
- Recent uploads playlist and video items
- Top viewed videos
"""

import os
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional
import re

YT_API_BASE = "https://www.googleapis.com/youtube/v3"

def get_api_key() -> str:
    key = os.environ.get("YOUTUBE_API_KEY")
    if key and key != "${YOUTUBE_API_KEY}":
        return key

    # Check root .env.local
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("YOUTUBE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

def _fetch_url(url: str, token: Optional[str] = None) -> Dict[str, Any]:
    headers = {"User-Agent": "CreatorNest-Audit-Engine/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def audit_channel_data(channel_identifier: str, access_token: Optional[str] = None) -> Dict[str, Any]:
    api_key = get_api_key()
    if not api_key and not access_token:
        raise ValueError("YOUTUBE_API_KEY is not set.")

    clean = channel_identifier.strip()
    if "youtube.com/" in clean:
        match = re.search(r"@([a-zA-Z0-9_\-\.]+)", clean)
        if match:
            clean = match.group(1)
        elif "/channel/" in clean:
            clean = clean.split("/channel/")[1].split("/")[0].split("?")[0]
        elif "/c/" in clean:
            clean = clean.split("/c/")[1].split("/")[0].split("?")[0]
    clean = clean.lstrip("@")

    # 1. Fetch channel info by handle or ID
    key_param = f"&key={api_key}" if api_key else ""
    channel_url = f"{YT_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails,topicDetails&forHandle={urllib.parse.quote(clean)}{key_param}"
    data = _fetch_url(channel_url, access_token)
    items = data.get("items", [])

    if not items:
        # Search fallback
        search_url = f"{YT_API_BASE}/search?part=snippet&type=channel&q={urllib.parse.quote(clean)}&maxResults=1{key_param}"
        s_data = _fetch_url(search_url, access_token)
        s_items = s_data.get("items", [])
        if not s_items:
            raise ValueError(f"Channel '{channel_identifier}' not found on YouTube.")
        c_id = s_items[0]["snippet"]["channelId"]
        detail_url = f"{YT_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails,topicDetails&id={c_id}{key_param}"
        d_data = _fetch_url(detail_url, access_token)
        items = d_data.get("items", [])
        if not items:
            raise ValueError(f"Failed to fetch details for channel ID: {c_id}")

    chan = items[0]
    channel_id = chan["id"]
    snippet = chan.get("snippet", {})
    stats = chan.get("statistics", {})
    branding = chan.get("brandingSettings", {})
    uploads_id = chan.get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads")

    # 2. Fetch up to 25 recent uploads
    videos: List[Dict[str, Any]] = []
    if uploads_id:
        pl_url = f"{YT_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId={uploads_id}&maxResults=25{key_param}"
        pl_data = _fetch_url(pl_url, access_token)
        v_ids = [it["contentDetails"]["videoId"] for it in pl_data.get("items", []) if "contentDetails" in it]
        if v_ids:
            v_url = f"{YT_API_BASE}/videos?part=snippet,statistics,contentDetails&id={','.join(v_ids)}{key_param}"
            v_data = _fetch_url(v_url, access_token)
            for v in v_data.get("items", []):
                v_s = v.get("snippet", {})
                v_st = v.get("statistics", {})
                v_cd = v.get("contentDetails", {})
                videos.append({
                    "id": v["id"],
                    "title": v_s.get("title", ""),
                    "description": v_s.get("description", ""),
                    "tags": v_s.get("tags", []),
                    "publishedAt": v_s.get("publishedAt", ""),
                    "views": int(v_st.get("viewCount", 0)),
                    "likes": int(v_st.get("likeCount", 0)),
                    "comments": int(v_st.get("commentCount", 0)),
                    "duration": v_cd.get("duration", ""),
                    "thumbnailUrl": v_s.get("thumbnails", {}).get("medium", {}).get("url", "")
                })

    return {
        "channelId": channel_id,
        "title": snippet.get("title", ""),
        "handle": f"@{clean}",
        "customUrl": snippet.get("customUrl", ""),
        "description": snippet.get("description", ""),
        "avatarUrl": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
        "bannerUrl": branding.get("image", {}).get("bannerExternalUrl", ""),
        "subscribers": int(stats.get("subscriberCount", 0)),
        "totalViews": int(stats.get("viewCount", 0)),
        "videoCount": int(stats.get("videoCount", 0)),
        "videos": videos
    }
