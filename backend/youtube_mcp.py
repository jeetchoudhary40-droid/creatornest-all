"""
YouTube Data API v3 utility connecting securely via MCP configuration or environment credentials.
Fetches a channel's total subscribers, top 10 most viewed videos, and top 5 most recent uploads.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.parse

def load_mcp_config() -> Dict[str, Any]:
    """Reads .agents/mcp_config.json for MCP server settings."""
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".agents", "mcp_config.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def get_youtube_api_key() -> str:
    """Retrieves the YouTube Data API key from environment or .env.local."""
    key = os.environ.get("YOUTUBE_API_KEY")
    if key and key != "${YOUTUBE_API_KEY}":
        return key

    # Check .env.local in project root
    env_local_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
    if os.path.exists(env_local_path):
        with open(env_local_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("YOUTUBE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

def _fetch_json(url: str) -> Dict[str, Any]:
    req = urllib.request.Request(url, headers={"User-Agent": "CreatorNest-YT-Audit/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def fetch_channel_data(channel_handle: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetches channel details:
    1. Total subscribers, total views, total videos
    2. Top 10 most viewed videos
    3. Top 5 most recent uploads
    """
    key = api_key or get_youtube_api_key()
    if not key:
        raise ValueError("YOUTUBE_API_KEY is not configured in environment or .agents/mcp_config.json")

    # Clean handle
    clean_handle = channel_handle.strip()
    if "youtube.com/" in clean_handle:
        match = re.search(r"@([a-zA-Z0-9_\-\.]+)", clean_handle)
        if match:
            clean_handle = match.group(1)
        elif "/channel/" in clean_handle:
            clean_handle = clean_handle.split("/channel/")[1].split("/")[0].split("?")[0]
        elif "/c/" in clean_handle:
            clean_handle = clean_handle.split("/c/")[1].split("/")[0].split("?")[0]
    
    clean_handle = clean_handle.lstrip("@")

    # 1. Resolve channel ID
    channel_id = ""
    # Try by handle
    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&forHandle={urllib.parse.quote(clean_handle)}&key={key}"
    data = _fetch_json(url)
    items = data.get("items", [])

    if not items:
        # Fallback to search by username / query
        search_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={urllib.parse.quote(clean_handle)}&maxResults=1&key={key}"
        search_data = _fetch_json(search_url)
        search_items = search_data.get("items", [])
        if not search_items:
            raise ValueError(f"YouTube channel '{channel_handle}' could not be found.")
        channel_id = search_items[0]["snippet"]["channelId"]
        
        detail_url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id={channel_id}&key={key}"
        data = _fetch_json(detail_url)
        items = data.get("items", [])
        if not items:
            raise ValueError(f"Failed to fetch details for channel ID: {channel_id}")

    channel_item = items[0]
    channel_id = channel_item["id"]
    snippet = channel_item.get("snippet", {})
    stats = channel_item.get("statistics", {})
    uploads_playlist_id = channel_item.get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads")

    subscribers = int(stats.get("subscriberCount", 0))
    total_views = int(stats.get("viewCount", 0))
    video_count = int(stats.get("videoCount", 0))

    # 2. Fetch top 5 most recent uploads via uploads playlist
    recent_videos: List[Dict[str, Any]] = []
    if uploads_playlist_id:
        playlist_url = f"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId={uploads_playlist_id}&maxResults=5&key={key}"
        pl_data = _fetch_json(playlist_url)
        recent_video_ids = [it["contentDetails"]["videoId"] for it in pl_data.get("items", []) if "contentDetails" in it]
        
        if recent_video_ids:
            videos_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id={','.join(recent_video_ids)}&key={key}"
            v_data = _fetch_json(videos_url)
            for v in v_data.get("items", []):
                v_stats = v.get("statistics", {})
                recent_videos.append({
                    "id": v["id"],
                    "title": v.get("snippet", {}).get("title"),
                    "publishedAt": v.get("snippet", {}).get("publishedAt"),
                    "views": int(v_stats.get("viewCount", 0)),
                    "likes": int(v_stats.get("likeCount", 0)),
                    "comments": int(v_stats.get("commentCount", 0)),
                })

    # 3. Fetch top 10 most viewed videos via search API ordered by viewCount
    top_viewed_videos: List[Dict[str, Any]] = []
    search_top_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={channel_id}&order=viewCount&type=video&maxResults=10&key={key}"
    top_search_data = _fetch_json(search_top_url)
    top_ids = [it["id"]["videoId"] for it in top_search_data.get("items", []) if "videoId" in it.get("id", {})]
    
    if top_ids:
        top_details_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id={','.join(top_ids)}&key={key}"
        top_data = _fetch_json(top_details_url)
        for v in top_data.get("items", []):
            v_stats = v.get("statistics", {})
            top_viewed_videos.append({
                "id": v["id"],
                "title": v.get("snippet", {}).get("title"),
                "publishedAt": v.get("snippet", {}).get("publishedAt"),
                "views": int(v_stats.get("viewCount", 0)),
                "likes": int(v_stats.get("likeCount", 0)),
                "comments": int(v_stats.get("commentCount", 0)),
            })
        top_viewed_videos.sort(key=lambda x: x["views"], reverse=True)

    return {
        "channelId": channel_id,
        "title": snippet.get("title", ""),
        "handle": f"@{clean_handle}",
        "customUrl": snippet.get("customUrl", ""),
        "description": snippet.get("description", ""),
        "country": snippet.get("country", "IN"),
        "avatarUrl": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
        "bannerUrl": channel_item.get("brandingSettings", {}).get("image", {}).get("bannerExternalUrl", ""),
        "subscribers": subscribers,
        "totalViews": total_views,
        "videoCount": video_count,
        "top10MostViewed": top_viewed_videos,
        "top5RecentUploads": recent_videos,
    }

if __name__ == "__main__":
    import sys
    handle = sys.argv[1] if len(sys.argv) > 1 else "CreatorNest"
    try:
        res = fetch_channel_data(handle)
        print(f"Fetched channel: {res['title']} ({res['handle']})")
        print(f"Subscribers: {res['subscribers']:,}")
        print(f"Top 10 Most Viewed: {len(res['top10MostViewed'])} videos")
        print(f"Top 5 Recent: {len(res['top5RecentUploads'])} videos")
    except Exception as e:
        print(f"Error fetching channel data: {e}")
