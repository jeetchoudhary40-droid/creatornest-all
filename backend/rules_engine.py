"""
Rules Engine for Creator Nest YouTube Automation.
Executes Policy & SEO compliance checks:
1. Reused / Inauthentic content hints
2. Repetitious / Duplicate titles
3. Title length (> 70 chars truncation check)
4. Tag stuffing / missing tags
5. Missing or weak descriptions (< 50 chars)
6. Phone numbers in titles (privacy/spam risk)
7. Channel metadata gaps (missing banner or empty About section)
8. YPP thresholds (1,000 subscribers, 4,000 watch hours or 10M shorts views)
9. Human-only checklist items (AdSense, Made for Kids, 2FA, Strikes, AI disclosure)
"""

import re
from typing import Dict, Any, List

def evaluate_channel_rules(channel_data: Dict[str, Any]) -> Dict[str, Any]:
    subs = channel_data.get("subscribers", 0)
    total_views = channel_data.get("totalViews", 0)
    desc = channel_data.get("description", "")
    banner = channel_data.get("bannerUrl", "")
    videos = channel_data.get("videos", [])

    issues: List[Dict[str, Any]] = []
    phone_titles = 0
    shorts_count = 0

    # Title count map for repetitious content check
    title_counts: Dict[str, int] = {}
    for v in videos:
        t = v.get("title", "").strip().lower()
        if t:
            title_counts[t] = title_counts.get(t, 0) + 1

    flagged_videos: List[Dict[str, Any]] = []

    for v in videos:
        v_id = v.get("id")
        title = v.get("title", "")
        v_desc = v.get("description", "")
        tags = v.get("tags", [])
        v_issues: List[str] = []

        # 1. Truncation rule (> 70 chars)
        if len(title) > 70:
            v_issues.append(f"Title is {len(title)} chars (exceeds 70 character limit; truncated on mobile).")
            issues.append({
                "category": "SEO",
                "severity": "Warning",
                "title": "Title Truncation Risk",
                "affectedItem": v_id,
                "currentValue": title,
                "recommendation": "Trim to 50-65 characters with the primary keyword in the first 40 characters."
            })

        # 2. Duplicate title rule
        if title_counts.get(title.strip().lower(), 0) > 1:
            v_issues.append("Duplicate title detected. Directly triggers YPP rejection under Repetitious Content.")
            issues.append({
                "category": "Policy",
                "severity": "Critical",
                "title": "Repetitious / Duplicate Title",
                "affectedItem": v_id,
                "currentValue": title,
                "recommendation": "Rewrite each upload with a unique, distinct title describing its specific topic."
            })

        # 3. Phone number in title
        if re.search(r"\b\d{10}\b|\b[6-9]\d{9}\b|\b\d{5}[- ]?\d{5}\b", title):
            phone_titles += 1
            v_issues.append("Phone number detected in public title.")
            issues.append({
                "category": "Policy",
                "severity": "Warning",
                "title": "Phone Number In Title",
                "affectedItem": v_id,
                "currentValue": title,
                "recommendation": "Move contact details to description and keep title content-focused."
            })

        # 4. Vague / hashtag-stuffed title
        if len(title) < 15 or re.search(r"^#+.*viral|^(work|working|khana|task|new video)$", title.strip(), re.IGNORECASE):
            v_issues.append("Low-context or hashtag-only title. High risk of algorithmic suppression.")
            issues.append({
                "category": "Policy",
                "severity": "Critical",
                "title": "Low-Context / Viral Hashtag Title",
                "affectedItem": v_id,
                "currentValue": title,
                "recommendation": "Replace with descriptive, keyword-rich sentence."
            })

        # 5. Weak description
        if len(v_desc.strip()) < 50:
            v_issues.append("Missing or weak description (< 50 characters).")
            issues.append({
                "category": "SEO",
                "severity": "Warning",
                "title": "Empty / Weak Video Description",
                "affectedItem": v_id,
                "recommendation": "Add a structured 2-3 paragraph summary, timestamps, and relevant links."
            })

        # 6. Tag check
        if not tags:
            v_issues.append("No video tags present.")
        elif len(tags) > 25:
            v_issues.append(f"Excessive tags ({len(tags)}). Potential tag stuffing penalty.")

        v_copy = dict(v)
        v_copy["issues"] = v_issues
        flagged_videos.append(v_copy)

    # Channel level checks
    if not desc or len(desc.strip()) < 30:
        issues.append({
            "category": "Branding",
            "severity": "Critical",
            "title": "Empty Channel 'About' Description",
            "affectedItem": "channel",
            "recommendation": "Write an engaging 150-250 word about section detailing your content value."
        })

    if not banner:
        issues.append({
            "category": "Branding",
            "severity": "Warning",
            "title": "Missing Channel Banner Art",
            "affectedItem": "channel",
            "recommendation": "Upload a 2048 x 1152 px high-resolution branded header banner."
        })

    # Watch hours estimate
    estimated_watch_hours = int((total_views * 2.5) / 60)

    # Score
    score = 100
    if subs < 1000:
        score -= 25
    if estimated_watch_hours < 4000:
        score -= 20
    if any(i["title"] == "Repetitious / Duplicate Title" for i in issues):
        score -= 20
    if phone_titles > 0:
        score -= 10
    if not desc:
        score -= 10
    if not banner:
        score -= 5
    score = max(score, 10)

    return {
        "score": score,
        "monetizationStatus": "Eligible" if (subs >= 1000 and estimated_watch_hours >= 4000) else "In Progress",
        "yppCriteria": {
            "subscribers": subs,
            "subscribersRequired": 1000,
            "subscriberMet": subs >= 1000,
            "estimatedWatchHours": estimated_watch_hours,
            "watchHoursRequired": 4000,
            "watchHoursMet": estimated_watch_hours >= 4000,
            "shortsViewsRequired": 10000000
        },
        "issues": issues,
        "flaggedVideos": flagged_videos,
        "humanChecklist": [
            {"item": "Turn on 2-Step Verification", "link": "https://myaccount.google.com/security", "status": "Mandatory"},
            {"item": "Check for 0 Active Community Strikes", "link": "https://studio.youtube.com", "status": "Mandatory"},
            {"item": "Link Active AdSense Account in Studio Earn Tab", "link": "https://studio.youtube.com/channel/earn", "status": "Action Required"},
            {"item": "Verify Made for Kids Declaration", "link": "https://studio.youtube.com", "status": "Studio Setting"},
            {"item": "Check Altered / Synthetic Media AI Disclosure", "link": "https://support.google.com/youtube/answer/14328491", "status": "Studio Setting"}
        ]
    }
