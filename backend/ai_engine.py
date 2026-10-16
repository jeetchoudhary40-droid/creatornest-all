"""
AI Suggestion Engine for Creator Nest YouTube Automation.
Generates policy-compliant, high-CTR titles, structured descriptions, chapters, and tags.
Supports Google Gemini, OpenAI ChatGPT (GPT-4o), and Anthropic Claude 3.5 Sonnet.
Prompt rules:
- No misleading claims
- Keep main keywords natural
- Strictly under 70 characters for titles
- No keyword stuffing
- Match actual video content
"""

import os
import json
import urllib.request
from typing import Dict, Any, List, Optional

def get_env_key(name: str) -> str:
    key = os.environ.get(name)
    if key:
        return key
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith(f"{name}="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

def call_openai_chatgpt(prompt: str, api_key: str) -> Optional[str]:
    try:
        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            data=json.dumps({
                "model": "gpt-4o",
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": "You are an expert YouTube Monetization Policy & SEO specialist. Output valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1200,
                "temperature": 0.5
            }).encode("utf-8")
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[OpenAI API Error]: {e}")
        return None

def call_anthropic_claude(prompt: str, api_key: str) -> Optional[str]:
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            data=json.dumps({
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1200,
                "system": "You are an expert YouTube Monetization Policy & SEO specialist. Output ONLY valid JSON, no markdown.",
                "messages": [{"role": "user", "content": f"{prompt}\n\nOutput ONLY valid JSON."}]
            }).encode("utf-8")
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            return res_data["content"][0]["text"]
    except Exception as e:
        print(f"[Claude API Error]: {e}")
        return None

def call_google_gemini(prompt: str, api_key: str) -> Optional[str]:
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }
        req = urllib.request.Request(
            url,
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload).encode("utf-8")
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    except Exception as e:
        print(f"[Gemini API Error]: {e}")
        return None

def call_ai(prompt: str, provider: str = "auto", api_keys: Optional[Dict[str, str]] = None) -> str:
    """
    Unified AI dispatcher with support for Google Gemini, OpenAI ChatGPT, and Anthropic Claude.
    """
    keys = api_keys or {}
    gemini_key = keys.get("gemini") or get_env_key("GEMINI_API_KEY")
    openai_key = keys.get("openai") or get_env_key("OPENAI_API_KEY")
    claude_key = keys.get("claude") or get_env_key("ANTHROPIC_API_KEY")

    order = []
    if provider == "gemini":
        order = ["gemini", "openai", "claude"]
    elif provider == "openai":
        order = ["openai", "gemini", "claude"]
    elif provider == "claude":
        order = ["claude", "gemini", "openai"]
    else: # auto
        order = ["gemini", "openai", "claude"]

    for p in order:
        if p == "gemini" and gemini_key:
            res = call_google_gemini(prompt, gemini_key)
            if res:
                return res
        elif p == "openai" and openai_key:
            res = call_openai_chatgpt(prompt, openai_key)
            if res:
                return res
        elif p == "claude" and claude_key:
            res = call_anthropic_claude(prompt, claude_key)
            if res:
                return res

    return ""

def format_sensible_title(raw_title: str, max_len: int = 65) -> str:
    if not raw_title:
        return ""
    import re
    clean = re.sub(r'[\'\"“”‘’`]', '', raw_title)
    clean = re.sub(r'\b\d{10}\b|\b[6-9]\d{9}\b', '', clean)
    clean = re.sub(r'#\s*#?[a-zA-Z0-9_]+', '', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()

    if len(clean) <= max_len:
        return re.sub(r'[\s\-_:|;,./\\+&]+$', '', clean).strip()

    # Boundary check at max_len
    if max_len < len(clean) and clean[max_len] in {' ', '-', '|', ':', ','}:
        candidate = clean[:max_len].strip()
    else:
        candidate = clean[:max_len]
        last_space = candidate.rfind(' ')
        if last_space > 20:
            candidate = candidate[:last_space].strip()

    candidate = re.sub(r'[\s\-_:|;,./\\+&]+$', '', candidate).strip()
    words = candidate.split()
    dangling = {
        'and', '&', 'to', 'for', 'with', 'in', 'of', 'a', 'an', 'the', 'by', 'on', 'or', 'at', 'is', 'from', 'about', 'as', 'into',
        'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'aur', 'par', 'bhi', 'kare', 'karein'
    }
    for _ in range(3):
        if len(words) > 2 and words[-1].lower() in dangling:
            words.pop()
            candidate = " ".join(words)
            candidate = re.sub(r'[\s\-_:|;,./\\+&]+$', '', candidate).strip()
            words = candidate.split()
        else:
            break

    return candidate

def generate_video_fixes(
    channel_title: str,
    video: Dict[str, Any],
    provider: str = "auto",
    api_keys: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    current_title = video.get("title", "")
    current_desc = video.get("description", "")
    issues = video.get("issues", [])

    prompt = f"""You are an expert YouTube Monetization Policy & SEO specialist.
Write optimized metadata for a video on channel "{channel_title}".
Current Title: "{current_title}"
Current Description: "{current_desc}"
Identified Issues: {json.dumps(issues)}

STRICT RULES:
1. "suggestedTitle": Natural, complete, sensible, high-CTR phrase strictly between 45 and 60 CHARACTERS (TARGET: 50-58 CHARACTERS, MAX 65 CHARACTERS). NEVER slice words or cut off words in half (e.g. NEVER produce "tuto" or incomplete words). The word "Tutorial" or "Recipe" must be whole. No phone numbers. No tag stuffing like #viral.
2. "suggestedDescription": 2 informative paragraphs, 3 timestamp chapters, 3 relevant hashtags, and a contact/subscribe disclaimer.
3. "suggestedTags": Array of 10-12 focused niche tags.
4. "reason": 1 concise sentence explaining the policy fix and SEO benefit.

Output valid JSON with keys: "suggestedTitle", "suggestedDescription", "suggestedTags", "reason"."""

    raw = call_ai(prompt, provider=provider, api_keys=api_keys)
    if raw:
        try:
            parsed = json.loads(raw)
            if "suggestedTitle" in parsed:
                parsed["suggestedTitle"] = format_sensible_title(parsed["suggestedTitle"], 65)
            return parsed
        except Exception:
            pass

    # Heuristic fallback with sensible title formatting
    clean_t = current_title.replace("#viral", "").replace("#funny", "").strip()
    sensible = format_sensible_title(f"{channel_title} | {clean_t}", 65)
    return {
        "suggestedTitle": sensible,
        "suggestedDescription": f"Watch the newest video from {channel_title}.\n\n0:00 Introduction\n0:30 Highlights\n1:00 Summary\n\n#viral #{channel_title.replace(' ', '')}",
        "suggestedTags": [channel_title, "vlog", "lifestyle", "trending"],
        "reason": "Sanitized spam tags and cleaned complete title under 65 characters."
    }
