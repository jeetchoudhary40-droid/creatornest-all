"""
Pytest Test Suite for /api/generate-audit endpoint.
Tests end-to-end audit generation with mock data for YouTube API and Studio OCR results.
"""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# Mock sample YouTube Data API payload
MOCK_CHANNEL_DATA = {
    "channelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    "title": "Tech With Tim",
    "handle": "@TechWithTim",
    "subscribers": 1420000,
    "totalViews": 165000000,
    "videoCount": 940,
    "country": "IN",
    "detectedNiche": {"name": "Tech & Programming"},
    "top10MostViewed": [
        {"id": "v1", "title": "Python Full Course for Beginners", "views": 8500000, "likes": 210000, "comments": 14200},
        {"id": "v2", "title": "Build a Machine Learning App", "views": 4200000, "likes": 98000, "comments": 6100},
        {"id": "v3", "title": "Next.js 14 Complete Guide", "views": 2900000, "likes": 65000, "comments": 3800}
    ],
    "top5RecentUploads": [
        {"id": "v4", "title": "Building AI Agents in Python", "views": 85000, "publishedAt": "2026-03-28T12:00:00Z"},
        {"id": "v5", "title": "Full Stack Next.js + FastAPI", "views": 112000, "publishedAt": "2026-03-24T14:30:00Z"}
    ]
}

MOCK_OCR_TEXT = """
[Earn Tab Screenshot OCR]
Become a partner
Status: Apply Now
Requirements:
1,000 subscribers: 1.42M (Completed)
4,000 public watch hours: 4,820 (Completed)
2-Step Verification: Active (Turned On)
Follow Community Guidelines: 0 active strikes
"""

MOCK_ASK_STUDIO_TEXT = "Ask Studio confirmed watch time is 4,820 valid public hours and no active copyright strikes."

MOCK_GEMINI_AUDIT_RESPONSE = """{
  "overallScore": 92,
  "monetizationStatus": "Eligible",
  "yppEligibility": {
    "subscriberCheck": {
      "required": 1000,
      "current": 1420000,
      "pass": true,
      "note": "Exceeds requirement by 1.4M+ subscribers."
    },
    "watchHoursCheck": {
      "required": 4000,
      "current": 4820,
      "pass": true,
      "note": "4,820 valid watch hours verified from Studio OCR."
    },
    "contentPolicyCheck": {
      "pass": true,
      "note": "High original value with programming demonstrations."
    },
    "communityGuidelinesCheck": {
      "pass": true,
      "note": "Zero active strikes on record."
    }
  },
  "auditMatrix": [
    {
      "auditPoint": "YPP Subscriber Threshold",
      "requirement": "1,000 active subscribers",
      "currentStatus": "1,420,000 subscribers",
      "status": "Pass",
      "recommendedSolution": "Continue consistent top-of-funnel reach."
    },
    {
      "auditPoint": "Valid Public Watch Hours (Past 365 Days)",
      "requirement": "4,000 hours on long-form content",
      "currentStatus": "4,820 verified hours",
      "status": "Pass",
      "recommendedSolution": "Submit YPP monetization application immediately."
    },
    {
      "auditPoint": "Reused Content & Originality Policy",
      "requirement": "Original commentary and creative transformation",
      "currentStatus": "100% original code walkthroughs",
      "status": "Pass",
      "recommendedSolution": "Maintain facecam or unique code style attribution."
    },
    {
      "auditPoint": "Community Guidelines & Copyright Strikes",
      "requirement": "Zero active strikes",
      "currentStatus": "0 strikes confirmed via Studio",
      "status": "Pass",
      "recommendedSolution": "Keep third-party code licenses clean."
    }
  ],
  "revenueStreams": [
    {
      "stream": "YouTube Partner Program (AdSense)",
      "eligible": true,
      "estimatedMonthlyMin": 180000,
      "estimatedMonthlyMax": 340000,
      "currency": "INR",
      "note": "Tech niche commands ₹300-₹600 CPM in India and high Tier-1 viewers."
    },
    {
      "stream": "Brand Sponsorships & Integrations",
      "eligible": true,
      "estimatedMonthlyMin": 250000,
      "estimatedMonthlyMax": 600000,
      "currency": "INR",
      "note": "Dev tools and AI platforms actively sponsor high-affinity coding channels."
    }
  ],
  "topStrengths": [
    "Massive subscriber baseline (1.42M)",
    "Evergreen tutorial videos driving ongoing passive watch time",
    "High developer affinity and premium advertiser CPMs"
  ],
  "criticalIssues": [
    "Upload frequency dipped slightly in recent 30 days"
  ],
  "actionPlan": [
    {
      "priority": "High",
      "action": "Submit YPP review in YouTube Studio Earn tab",
      "timeframe": "Next 24 Hours",
      "impact": "Monetize backlog of 165M views"
    },
    {
      "priority": "Medium",
      "action": "Add sponsor disclosure links and media kit link in descriptions",
      "timeframe": "Next 14 Days",
      "impact": "Secure ₹2.5L+ brand sponsorships"
    }
  ],
  "estimatedMonthlyAdRevenue": {
    "min": 180000,
    "max": 340000,
    "currency": "INR",
    "basis": "Based on 600K monthly views at ₹350 RPM average"
  },
  "channelHealthSummary": "Tech With Tim is in outstanding monetization condition. The channel comfortably passes all four YouTube Partner Program requirements with zero active strikes and strong video velocity.",
  "nextMilestone": "Unlock ₹5,00,000/month combined ad and sponsorship revenue"
}"""

def test_health_check():
    """Verify backend health endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@patch("backend.main.call_gemini_llm")
def test_generate_audit_success(mock_call_gemini):
    """Test /api/generate-audit with mock YouTube and Studio OCR data."""
    mock_call_gemini.return_value = MOCK_GEMINI_AUDIT_RESPONSE

    payload = {
        "channel_data": MOCK_CHANNEL_DATA,
        "ocr_text": MOCK_OCR_TEXT,
        "ask_studio_text": MOCK_ASK_STUDIO_TEXT
    }

    response = client.post("/api/generate-audit", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Assert overall score and monetization status
    assert data["overallScore"] == 92
    assert data["monetizationStatus"] == "Eligible"

    # Assert YPP 4-point eligibility structure
    ypp = data["yppEligibility"]
    assert ypp["subscriberCheck"]["pass"] is True
    assert ypp["watchHoursCheck"]["pass"] is True
    assert ypp["contentPolicyCheck"]["pass"] is True
    assert ypp["communityGuidelinesCheck"]["pass"] is True

    # Assert Audit Matrix contains required fields
    matrix = data["auditMatrix"]
    assert len(matrix) >= 4
    for row in matrix:
        assert "auditPoint" in row
        assert "requirement" in row
        assert "currentStatus" in row
        assert row["status"] in ["Pass", "Fail", "Warning", "Unknown"]
        assert "recommendedSolution" in row

    # Assert Revenue Streams
    assert len(data["revenueStreams"]) >= 2
    for stream in data["revenueStreams"]:
        assert stream["currency"] == "INR"
        assert stream["estimatedMonthlyMin"] >= 0

    # Assert Action Plan
    assert len(data["actionPlan"]) >= 2
    assert data["actionPlan"][0]["priority"] in ["High", "Medium", "Low"]

def test_generate_audit_missing_channel_data():
    """Test validation when channel_data is missing."""
    response = client.post("/api/generate-audit", json={"ocr_text": "sample"})
    assert response.status_code == 422  # Pydantic validation error
