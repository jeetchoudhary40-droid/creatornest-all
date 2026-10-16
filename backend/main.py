"""
FastAPI Backend for YouTube Monetization Channel Audit Tool.
Exposes POST /api/generate-audit combining:
1. YouTube Data API v3 JSON metrics (public channel & video stats)
2. Gemini Vision OCR text from user-uploaded YouTube Studio screenshots (Earn & Dashboard tabs)
3. Raw text pasted from YouTube 'Ask Studio' internal conversational agent
"""

import os
import json
import re
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import urllib.request

app = FastAPI(
    title="Creator Nest - YouTube Monetization Channel Audit Engine",
    description="Hybrid AI engine evaluating YouTube Partner Program readiness and monetization health.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuditRequest(BaseModel):
    channel_data: Dict[str, Any] = Field(..., description="YouTube Data API JSON payload or metrics")
    ocr_text: Optional[str] = Field(default="", description="OCR text extracted from Earn & Dashboard tab screenshots")
    ask_studio_text: Optional[str] = Field(default="", description="Raw conversational text from Ask Studio")

class AuditMatrixRow(BaseModel):
    auditPoint: str
    requirement: str
    currentStatus: str
    status: str  # Pass | Fail | Warning | Unknown
    recommendedSolution: str

class RevenueStream(BaseModel):
    stream: str
    eligible: bool
    estimatedMonthlyMin: float
    estimatedMonthlyMax: float
    currency: str = "INR"
    note: str

class ActionItem(BaseModel):
    priority: str  # High | Medium | Low
    action: str
    timeframe: str
    impact: str

class AuditResponse(BaseModel):
    overallScore: int
    monetizationStatus: str
    yppEligibility: Dict[str, Any]
    auditMatrix: List[AuditMatrixRow]
    revenueStreams: List[RevenueStream]
    topStrengths: List[str]
    criticalIssues: List[str]
    actionPlan: List[ActionItem]
    estimatedMonthlyAdRevenue: Dict[str, Any]
    channelHealthSummary: str
    nextMilestone: str

def get_gemini_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    env_local_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
    if os.path.exists(env_local_path):
        with open(env_local_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

def call_gemini_llm(prompt: str) -> str:
    api_key = get_gemini_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json"
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API generation failed: {str(e)}")

def build_system_audit_prompt(channel_data: Dict[str, Any], ocr_text: str, ask_studio_text: str) -> str:
    title = channel_data.get("title", "Unknown")
    handle = channel_data.get("handle", "")
    subs = channel_data.get("subscribers", 0)
    views = channel_data.get("totalViews", 0)
    video_count = channel_data.get("videoCount", 0)
    country = channel_data.get("country", "IN")
    niche = channel_data.get("detectedNiche", {}).get("name") if isinstance(channel_data.get("detectedNiche"), dict) else channel_data.get("detectedNiche", "General")
    
    top_viewed = channel_data.get("top10MostViewed", []) or channel_data.get("analyzedVideos", [])
    recent_uploads = channel_data.get("top5RecentUploads", []) or channel_data.get("analyzedVideos", [])[:5]

    top_viewed_str = "\n".join([
        f"  - {v.get('title', 'Video')}: {v.get('views', 0):,} views, {v.get('likes', 0):,} likes"
        for v in top_viewed[:10]
    ]) or "  No top video data provided"

    recent_uploads_str = "\n".join([
        f"  - {v.get('title', 'Video')}: {v.get('views', 0):,} views (published {v.get('publishedAt', 'recently')})"
        for v in recent_uploads[:5]
    ]) or "  No recent video data provided"

    prompt = f"""You are a master YouTube Monetization and Channel Health Auditor with 10+ years of channel consulting experience.
You will conduct a rigorous audit of this YouTube channel based on three distinct data sources:

1. PUBLIC CHANNEL DATA (YouTube Data API v3):
- Channel Name: {title} ({handle})
- Subscribers: {subs:,}
- Total Views: {views:,}
- Total Videos: {video_count}
- Origin Country: {country}
- Primary Niche: {niche}

TOP 10 MOST VIEWED VIDEOS:
{top_viewed_str}

TOP 5 RECENT UPLOADS:
{recent_uploads_str}

2. PRIVATE STUDIO OCR TELEMETRY (Earn & Dashboard Tabs):
{ocr_text if ocr_text.strip() else "No screenshot OCR data provided. Estimate watch hours and community status based on public view velocity and video duration benchmarks."}

3. 'ASK STUDIO' CONVERSATIONAL LOGS / CREATOR NOTES:
{ask_studio_text if ask_studio_text.strip() else "No Ask Studio conversational notes provided."}

Return a single, strictly valid JSON object (no markdown code fences, no extra text) with EXACTLY the following structure:
{{
  "overallScore": <integer 0-100 reflecting overall channel health & monetization readiness>,
  "monetizationStatus": "<Eligible | Near Eligible | Not Eligible>",
  "yppEligibility": {{
    "subscriberCheck": {{
      "required": 1000,
      "current": {subs},
      "pass": {"true" if subs >= 1000 else "false"},
      "note": "<clear explanation of subscriber qualification>"
    }},
    "watchHoursCheck": {{
      "required": 4000,
      "current": <estimated or OCR extracted valid public watch hours integer, or null if unknown>,
      "pass": <boolean or null>,
      "note": "<detailed watch hours status>"
    }},
    "contentPolicyCheck": {{
      "pass": <boolean>,
      "note": "<assessment of original content, reused content policies, and AI generation disclosure>"
    }},
    "communityGuidelinesCheck": {{
      "pass": <boolean>,
      "note": "<assessment of active strikes, warnings, or age-restriction flags>"
    }}
  }},
  "auditMatrix": [
    {{
      "auditPoint": "YPP Subscriber Threshold",
      "requirement": "1,000 active subscribers",
      "currentStatus": "{subs:,} subscribers",
      "status": "{"Pass" if subs >= 1000 else "Fail"}",
      "recommendedSolution": "<actionable step>"
    }},
    {{
      "auditPoint": "Valid Public Watch Hours (Past 365 Days)",
      "requirement": "4,000 hours on long-form content or 10M Shorts views in 90 days",
      "currentStatus": "<calculated or OCR status>",
      "status": "<Pass | Fail | Warning | Unknown>",
      "recommendedSolution": "<actionable step to bridge the gap>"
    }},
    {{
      "auditPoint": "Reused Content & Originality Policy",
      "requirement": "Original commentary, significant creative transformation, no repetitive scraped clips",
      "currentStatus": "<assessment based on video catalog>",
      "status": "<Pass | Fail | Warning>",
      "recommendedSolution": "<how to ensure compliance>"
    }},
    {{
      "auditPoint": "Community Guidelines & Copyright Strikes",
      "requirement": "Zero active Community Guidelines strikes (warnings acceptable)",
      "currentStatus": "<status from OCR/Ask Studio or healthy baseline>",
      "status": "<Pass | Fail | Warning>",
      "recommendedSolution": "<guidance on strike expiration and appeals>"
    }},
    {{
      "auditPoint": "2-Step Verification & Advanced Features",
      "requirement": "Active 2FA on Google Account and Advanced Channel Features unlocked",
      "currentStatus": "Verified in Studio",
      "status": "Pass",
      "recommendedSolution": "Maintain security and verified phone number"
    }},
    {{
      "auditPoint": "Audience Retention & View-to-Sub Ratio",
      "requirement": "Healthy engagement indicating active human viewership",
      "currentStatus": "<calculated from top and recent videos>",
      "status": "<Pass | Warning | Fail>",
      "recommendedSolution": "<tactical pacing or hook improvement>"
    }},
    {{
      "auditPoint": "Upload Cadence & Consistency",
      "requirement": "Regular publishing schedule in the last 90 days",
      "currentStatus": "<based on recent uploads>",
      "status": "<Pass | Warning | Fail>",
      "recommendedSolution": "<sustainable schedule recommendation>"
    }},
    {{
      "auditPoint": "Niche CPM & Commercial Advertisability",
      "requirement": "Brand-safe themes with high advertiser demand",
      "currentStatus": "<niche CPM assessment in INR>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<how to maximize commercial appeal>"
    }},
    {{
      "auditPoint": "Click-Through Rate (CTR) & Packaging",
      "requirement": "Distinctive thumbnail branding and non-misleading titles",
      "currentStatus": "<analysis of titles and video style>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<title formula and contrast advice>"
    }},
    {{
      "auditPoint": "Shorts vs Long-form Funnel Strategy",
      "requirement": "Using Shorts to drive long-form watch time conversion",
      "currentStatus": "<evaluation of format mix>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<related video links and pinned comments strategy>"
    }},
    {{
      "auditPoint": "Alternative Revenue Diversification",
      "requirement": "Multi-stream monetization (sponsorships, digital products, affiliate)",
      "currentStatus": "<current readiness>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<launch plan for non-ad revenue>"
    }},
    {{
      "auditPoint": "Channel SEO & Search Discovery",
      "requirement": "Optimized channel tags, playlist architecture, and descriptions",
      "currentStatus": "<evaluation of channel description and metadata>",
      "status": "<Pass | Warning>",
      "recommendedSolution": "<playlist clustering and keyword strategy>"
    }}
  ],
  "revenueStreams": [
    {{
      "stream": "YouTube Partner Program (AdSense)",
      "eligible": {"true" if subs >= 1000 else "false"},
      "estimatedMonthlyMin": <float in INR>,
      "estimatedMonthlyMax": <float in INR>,
      "currency": "INR",
      "note": "<based on Indian CPM benchmarks and view volume>"
    }},
    {{
      "stream": "Brand Sponsorships & Integrations",
      "eligible": <boolean>,
      "estimatedMonthlyMin": <float in INR>,
      "estimatedMonthlyMax": <float in INR>,
      "currency": "INR",
      "note": "<based on niche and typical creator rate cards on Creator Nest>"
    }},
    {{
      "stream": "Super Thanks & Channel Memberships",
      "eligible": {"true" if subs >= 500 else "false"},
      "estimatedMonthlyMin": <float in INR>,
      "estimatedMonthlyMax": <float in INR>,
      "currency": "INR",
      "note": "<community patronage potential>"
    }},
    {{
      "stream": "Affiliate Marketing & Tools",
      "eligible": true,
      "estimatedMonthlyMin": <float in INR>,
      "estimatedMonthlyMax": <float in INR>,
      "currency": "INR",
      "note": "<recommended gear, software, or niche products in description>"
    }},
    {{
      "stream": "Digital Products, Courses & Consultations",
      "eligible": <boolean>,
      "estimatedMonthlyMin": <float in INR>,
      "estimatedMonthlyMax": <float in INR>,
      "currency": "INR",
      "note": "<1-on-1 calls, presets, guides, or cohorts>"
    }}
  ],
  "topStrengths": [
    "<strength 1 with specific data>",
    "<strength 2 with specific data>",
    "<strength 3 with specific data>"
  ],
  "criticalIssues": [
    "<critical issue 1 needing attention>",
    "<critical issue 2 needing attention>"
  ],
  "actionPlan": [
    {{
      "priority": "High",
      "action": "<immediate action to unlock or protect monetization>",
      "timeframe": "<e.g. Next 7 Days>",
      "impact": "<e.g. +1,200 Watch Hours>"
    }},
    {{
      "priority": "Medium",
      "action": "<action to increase RPM or CTR>",
      "timeframe": "<e.g. Next 30 Days>",
      "impact": "<e.g. +35% AdSense Revenue>"
    }},
    {{
      "priority": "Low",
      "action": "<long-term diversification or branding>",
      "timeframe": "<e.g. Next 60-90 Days>",
      "impact": "<e.g. ₹50,000/mo Sponsorship Floor>"
    }}
  ],
  "estimatedMonthlyAdRevenue": {{
    "min": <float in INR>,
    "max": <float in INR>,
    "currency": "INR",
    "basis": "<e.g. Based on 150K monthly views at ₹120-₹280 RPM>"
  }},
  "channelHealthSummary": "<compelling 2-3 paragraph executive summary of the channel audit>",
  "nextMilestone": "<e.g. Unlock 4,000 Watch Hours or Scale to 50K Subscribers>"
}}
"""
    return prompt

@app.get("/")
def health_check():
    return {"status": "ok", "service": "YouTube Monetization Channel Audit Engine"}

@app.post("/api/generate-audit", response_model=AuditResponse)
def generate_audit(request: AuditRequest):
    """
    Master audit generation endpoint compiling:
    - YouTube Data API JSON
    - Screenshot OCR text
    - 'Ask Studio' text
    """
    if not request.channel_data:
        raise HTTPException(status_code=400, detail="channel_data is required.")
        
    prompt = build_system_audit_prompt(
        request.channel_data,
        request.ocr_text or "",
        request.ask_studio_text or ""
    )
    
    raw_response = call_gemini_llm(prompt)
    
    # Strip any potential markdown wrappers
    cleaned_json = re.sub(r"^```json\s*", "", raw_response, flags=re.IGNORECASE)
    cleaned_json = re.sub(r"\s*```$", "", cleaned_json, flags=re.IGNORECASE).strip()
    
    try:
        parsed_data = json.loads(cleaned_json)
        return parsed_data
    except json.JSONDecodeError as err:
        raise HTTPException(status_code=500, detail=f"Failed to parse LLM JSON output: {str(err)}. Raw: {cleaned_json[:200]}")

# ── YouTube Automation Pipeline Endpoints ──────────────────────
from backend.oauth_manager import get_auth_consent_url, exchange_code_for_tokens
from backend.audit_engine import audit_channel_data
from backend.rules_engine import evaluate_channel_rules
from backend.ai_engine import generate_video_fixes
from backend.review_queue import add_draft, get_channel_drafts, update_draft_status, bulk_approve_all
from backend.publisher import publish_approved_drafts, rollback_change

class AutomationAuditRequest(BaseModel):
    channel_handle: str

class SuggestionRequest(BaseModel):
    channel_title: str
    channel_id: str
    flagged_videos: List[Dict[str, Any]]
    provider: Optional[str] = "auto" # auto | gemini | openai | claude
    api_keys: Optional[Dict[str, str]] = None

class ReviewUpdateRequest(BaseModel):
    draft_id: str
    status: str # approved | rejected
    edited_value: Optional[str] = None

class PublishRequest(BaseModel):
    channel_id: str
    access_token: Optional[str] = None

class RollbackRequest(BaseModel):
    log_id: str
    access_token: Optional[str] = None

@app.get("/api/oauth/consent-url")
def get_oauth_consent_url():
    """Generates official Google OAuth consent URL for YouTube scopes."""
    return {"consentUrl": get_auth_consent_url()}

@app.post("/api/oauth/callback")
def oauth_callback(code: str):
    """Exchanges Google authorization code for tokens."""
    try:
        tokens = exchange_code_for_tokens(code)
        return {"success": True, "tokens": tokens}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/automation/audit")
def automation_audit(req: AutomationAuditRequest):
    """Runs full channel extraction and rules evaluation."""
    try:
        raw_data = audit_channel_data(req.channel_handle)
        rules = evaluate_channel_rules(raw_data)
        return {"channel": raw_data, "evaluation": rules}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/automation/generate-suggestions")
def automation_suggestions(req: SuggestionRequest):
    """Uses AI (Gemini, ChatGPT, or Claude) to generate policy-compliant titles, descriptions, and tags."""
    created_draft_ids = []
    for v in req.flagged_videos[:10]:
        fixes = generate_video_fixes(req.channel_title, v, provider=req.provider or "auto", api_keys=req.api_keys)
        draft_id = add_draft(
            channel_id=req.channel_id,
            item_type="video_title",
            field_name="title",
            current_value=v.get("title", ""),
            suggested_value=fixes.get("suggestedTitle", ""),
            reason=fixes.get("reason", "Policy fix & SEO optimization"),
            video_id=v.get("id")
        )
        created_draft_ids.append(draft_id)
    return {"success": True, "draftIds": created_draft_ids}

@app.get("/api/automation/review-queue/{channel_id}")
def get_review_queue(channel_id: str):
    """Fetches all draft changes awaiting human review."""
    drafts = get_channel_drafts(channel_id)
    return {"drafts": drafts}

@app.post("/api/automation/review-queue/update")
def update_review(req: ReviewUpdateRequest):
    """Approves, edits, or rejects a draft item."""
    success = update_draft_status(req.draft_id, req.status, req.edited_value)
    return {"success": success}

@app.post("/api/automation/publish")
def publish_changes(req: PublishRequest):
    """Publishes approved changes to YouTube via API and logs for rollback."""
    res = publish_approved_drafts(req.channel_id, req.access_token)
    return res

@app.post("/api/automation/rollback")
def rollback(req: RollbackRequest):
    """Rolls back a published change in 1-click."""
    res = rollback_change(req.log_id, req.access_token)
    return res

