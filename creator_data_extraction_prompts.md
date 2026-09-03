# Creator Intake & Data Extraction Prompt Library

Use these prompts to gather data from creators (via forms, emails, or surveys) and parse them automatically into the database JSON structure required by Creator Nest.

---

## 1. Creator Intake Questionnaire (Copy-paste into Google Forms or Email)
Send this template to creators to collect all the fields required by our CRM.

```text
Subject: Creator Nest Onboarding - Information Request for Brand Sponsorships

Hello,

To construct a highly detailed, professional profile for you on Creator Nest and match you with premium brand sponsorships, please provide the following details:

1. GENERAL INFORMATION
- Full Name:
- Contact Email (For Platform Account):
- Secondary Business Email (If different, for brands):
- Personal Phone Number:
- WhatsApp Number (For collaboration notifications):
- Current Location (City & Country):
- Short Professional Bio (1-3 sentences describing your content & style):

2. SOCIAL MEDIA HANDLES & LINKS
- YouTube Handle (e.g. @username) & Channel Link:
- YouTube Subscriber Count (Current):
- Instagram Handle (e.g. @username) & Profile Link:
- Instagram Follower Count (Current):
- LinkedIn Profile Link (If active):
- Twitter/X Handle & Link:
- TikTok Handle & Link:

3. ANALYTICS & AUDIENCE DEMOGRAPHICS
- Average Video Views (Last 30 Days):
- Engagement Rate (Percentage, if known):
- Average View Duration (AVD - e.g., "4m 12s" or percentage):
- Primary Language spoken in content:
- Main Target Country of audience:
- Audience Gender Split (Male % / Female %):
- Audience Age Split (Approx % for 18-24, and % for 25-34):

4. RATE CARD & EXPERIENCE
- Sponsorship Rate for Post/Reel/Static Image (INR or USD):
- Sponsorship Rate for Video Integration/Dedicated Video (INR or USD):
- Top 3 Brand Categories you have worked with (e.g. Tech, Beauty, Fintech):
- Any specific notes, payment terms, or preferences:

Thank you! We look forward to connecting you with major campaigns.
```

---

## 2. AI Parser Prompt (Use in Gemini / ChatGPT to Extract JSON)
Paste the prompt below into your AI model (along with the creator's raw email, bio, resume, or Media Kit text/PDF) to output the exact JSON format required for our Supabase database.

### System Prompt:
```text
You are a highly structured data extractor for a Creator Talent CRM. 
Your task is to take raw creator information (emails, media kits, chat logs, or survey responses) and extract all relevant details into a single clean JSON object matching the schema below.

Rules:
1. Do not make up values. If a field is not present or cannot be inferred, set it to "" (for strings) or 0 (for numbers).
2. Clean up subscriber formats: e.g. "1.5 Million" -> youtube_subs: "1.5M", youtube_num: 1500000.
3. If platforms are missing, default to 0 followers and empty handles.
4. Ensure the output is strictly valid JSON with no conversational text before or after.

JSON SCHEMA:
{
  "full_name": "Full name of the creator (String)",
  "email": "Account or login email (String)",
  "niche": "One primary niche e.g., Gaming, Fashion & Lifestyle, Tech, Finance, Food & Cooking, Travel & Vlog, Beauty, Comedy, Fitness, Entertainment (String)",
  "location": "City, Country format (String)",
  "bio": "A summary of their channel or content style (String)",
  "youtube_subs": "Subscriber label e.g., '1.5M' or '250K' (String)",
  "youtube_num": 1500000, // Numeric subscriber count (Integer)
  "insta_subs": "Follower label e.g., '80K' or '1.2M' (String)",
  "insta_num": 80000, // Numeric follower count (Integer)
  "avd": "Average View Duration or Retention percentage (String)",
  
  "contact_phone": "Personal contact phone (String)",
  "whatsapp_number": "WhatsApp contact number (String)",
  "business_email": "Official collaboration or business email (String)",
  
  "youtube_url": "Direct link to channel (String)",
  "youtube_handle": "Channel handle starting with @ (String)",
  "insta_url": "Direct link to Instagram profile (String)",
  "insta_handle": "Instagram handle without @ (String)",
  "linkedin_url": "Direct link to LinkedIn (String)",
  "linkedin_handle": "Display name on LinkedIn (String)",
  "twitter_url": "Direct link to Twitter/X (String)",
  "twitter_handle": "Twitter/X handle (String)",
  "tiktok_url": "Direct link to TikTok (String)",
  "tiktok_handle": "TikTok handle (String)",
  
  "avg_views": 0, // Numeric average video views (Integer)
  "engagement_rate": 0.0, // Numeric engagement rate percentage (Float)
  "primary_language": "Main language e.g. Hindi, English (String)",
  "target_country": "Main audience country e.g. India (String)",
  
  "audience_gender_male": 50.0, // Percentage of male audience (Float)
  "audience_gender_female": 50.0, // Percentage of female audience (Float)
  "audience_age_18_24": 0.0, // Percentage of audience aged 18-24 (Float)
  "audience_age_25_34": 0.0, // Percentage of audience aged 25-34 (Float)
  
  "rate_post": 0, // Numeric rate in INR or USD for posts (Integer)
  "rate_video": 0, // Numeric rate in INR or USD for videos (Integer)
  "manager_notes": "Internal notes, contact preferences or payment details (String)",
  "brand_categories": ["Category 1", "Category 2"] // Array of brand categories worked with (JSON Array of Strings)
}

Here is the creator raw text to parse:
---
[PASTE CREATOR TEXT / MEDIA KIT HERE]
---
```
