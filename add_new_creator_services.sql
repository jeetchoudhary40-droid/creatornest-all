-- ==============================================================================
-- Migration: Add New High-Impact Creator Services to market_items
-- Services:
--   1. Instagram Account Manager (s11)
--   2. YouTube Account Manager (s12)
--   3. YouTube Channel Monetization Apply (For Eligible Channels) (s13)
-- ==============================================================================

INSERT INTO public.market_items (
    id,
    item_type,
    title,
    short_desc,
    long_desc,
    category,
    icon,
    accent,
    plan,
    price,
    rating,
    thumbnail_url,
    external_url,
    tags,
    features,
    is_published,
    sort_order
)
VALUES 
(
    '00000000-0000-0000-0000-e20000000011',
    'service',
    'Instagram Account Manager',
    'Dedicated growth & operations management for creators and brands: viral Reels cadence, feed aesthetic curation, DM triage, and community engagement.',
    'Stop losing hours wrestling with Instagram''s algorithm and endless DMs. Our dedicated Instagram Account Managers take full ownership of your account''s daily execution, strategic scheduling, and audience retention. From viral Reels scripting and trending audio research to carousel storytelling, aesthetic feed layout, story sequence funnels, and high-intent inbound DM filtering (brand deals, customer inquiries, and creator collabs) — we act as your personal executive production and community desk.',
    'Channel Management',
    'Camera',
    '#E1306C',
    'gold',
    9999,
    4.9,
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop',
    '/marketplace/services/s11',
    ARRAY['Instagram', 'Account Manager', 'Reels Growth', 'Social Media', 'Engagement'],
    '{
        "provider": "Creator Nest Talent & Social Desk",
        "delivery_time": "Monthly Retainer / Daily Active",
        "revisions": 5,
        "badge": "🔥 Top Retainer",
        "features": [
            "Dedicated Instagram Account Manager & Private Slack/WhatsApp desk",
            "Complete 30-Day Content Calendar (Reels, Carousels & Interactive Stories)",
            "Trending Audio, Viral Hook & Format Research for your specific niche",
            "High-Retention Caption Copywriting & Strategic Hashtag Clusters",
            "Daily Comment Moderation & Spam / Bot Filtering",
            "Inbound DM Triage (Brand Sponsorship Lead Flagging & Customer Support)",
            "Aesthetic Profile Makeover (Bio, Highlights, Link-in-Bio Funnel)",
            "Bi-Weekly Growth Analytics & Reach Performance Reports"
        ],
        "packages": [
            {
                "name": "Creator Starter",
                "price": 9999,
                "delivery": "Monthly Retainer",
                "revisions": 2,
                "features": [
                    "15 Planned Posts/Reels scheduled per month",
                    "Weekly Story engagement sequences",
                    "Niche trending sound & hook curation",
                    "Comment moderation (within 24 hrs)",
                    "Bio & Highlight icons refresh",
                    "Monthly Growth & Reach KPI Report"
                ]
            },
            {
                "name": "Growth & Scale",
                "price": 19999,
                "delivery": "Monthly Retainer",
                "revisions": 4,
                "features": [
                    "25-30 Planned Posts & Reels scheduled per month",
                    "Daily Story sequence funnels (Polls, Q&As, Countdown)",
                    "Carousel design & script hooks included",
                    "Priority DM handling & Brand Deal lead forwarding",
                    "Active outreach for creator collaborations (3/mo)",
                    "Bi-Weekly Analytics review call (30 min)",
                    "Dedicated Account Manager on WhatsApp"
                ]
            },
            {
                "name": "Executive Suite",
                "price": 39999,
                "delivery": "Monthly Retainer",
                "revisions": 99,
                "features": [
                    "Daily posting (Reels, Carousels, Broadcast Channel & Stories)",
                    "Real-time DM lead qualification & CRM logging",
                    "Meta Ads booster management (budget separate)",
                    "Sponsorship deliverable compliance & media kit sync",
                    "Dedicated Senior Manager + Assistant team",
                    "Weekly 1-on-1 Strategy Sync Call",
                    "24/7 Priority Emergency Channel Support"
                ]
            }
        ],
        "faqs": [
            {"q": "How do you access my Instagram account securely?", "a": "We access your account securely through Meta Business Suite, Creator Studio, or official scheduler integrations without needing your personal login password."},
            {"q": "Do I still need to record my own videos?", "a": "Yes, you record the raw video footage or send us clips. Your Account Manager provides the scripts, hooks, trending audio recommendations, editing briefs, captions, and handles all posting, formatting, and community engagement."},
            {"q": "How do you handle incoming brand sponsorship inquiries?", "a": "Your manager filters out spam and immediately flags verified brand collaboration inquiries to you, summarizing the brand budget and deliverable requirements."},
            {"q": "Can I cancel or pause my retainer anytime?", "a": "Yes, all our account management retainers are billed month-to-month with zero lock-in contracts."}
        ]
    }'::jsonb,
    true,
    11
),
(
    '00000000-0000-0000-0000-e20000000012',
    'service',
    'YouTube Account Manager',
    'Full-spectrum channel management: upload operations, high-CTR metadata SEO, A/B thumbnail testing, Community Tab, and audience retention tuning.',
    'Transform your YouTube channel from an unpredictable hobby into a finely tuned, algorithmically optimized growth machine. Our professional YouTube Account Managers oversee your entire publishing pipeline: keyword-targeted titles, rich descriptions with timestamped chapters, end-screen and info card retention funnels, A/B thumbnail testing, community tab updates, comment moderation, and monthly deep-dive analytics.',
    'Channel Management',
    'Video',
    '#EF4444',
    'gold',
    11999,
    5.0,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    '/marketplace/services/s12',
    ARRAY['YouTube', 'Channel Manager', 'Video SEO', 'Thumbnails', 'Watch Time'],
    '{
        "provider": "Creator Nest YouTube Operations Desk",
        "delivery_time": "Monthly Retainer / Ongoing",
        "revisions": 5,
        "badge": "⭐ High Growth",
        "features": [
            "Dedicated YouTube Channel Director & Upload Manager",
            "Algorithmic SEO: Keyword-targeted titles, rich descriptions & search tags",
            "Automated Chapter Markers, Timestamps & SEO Playlists",
            "End Screen & Info Card retention funnels (Boosting Session Time)",
            "A/B Thumbnail & Title Testing using YouTube Studio native tools",
            "Community Tab Strategy (Polls, Behind-the-scenes, Image updates)",
            "Active Comment Moderation, Pinned Comments & Engagement Priming",
            "Copyright, Content ID & Monetization Pre-Upload Checks",
            "Monthly Deep-Dive Analytics (CTR, Average View Duration, Traffic Sources)"
        ],
        "packages": [
            {
                "name": "Channel Starter",
                "price": 11999,
                "delivery": "Monthly Retainer",
                "revisions": 3,
                "features": [
                    "Up to 8 Video Uploads/Scheduling per month",
                    "Complete SEO: Titles, Descriptions, Tags & Chapters",
                    "End Screen & Card configuration for retention",
                    "Basic Comment Moderation (Spam filtering)",
                    "Monthly Performance & Traffic Source report"
                ]
            },
            {
                "name": "Channel Growth",
                "price": 24999,
                "delivery": "Monthly Retainer",
                "revisions": 5,
                "features": [
                    "Up to 16 Long-form Videos + Unlimited Shorts per month",
                    "Advanced A/B Thumbnail & Title Testing setup",
                    "Weekly Community Tab engagement polls & updates",
                    "Competitor niche benchmarking & search trend alerts",
                    "Brand sponsor link insertion & deliverable tracking",
                    "Bi-Weekly Channel Strategy Call",
                    "Dedicated Channel Manager on WhatsApp"
                ]
            },
            {
                "name": "Studio Enterprise",
                "price": 49999,
                "delivery": "Monthly Retainer",
                "revisions": 99,
                "features": [
                    "Daily publishing (30+ long-form & Shorts uploads/mo)",
                    "Multi-channel or Podcast show management",
                    "Team pipeline oversight (Direct coordination with editors/designers)",
                    "YPP monetization protection & Content ID claims management",
                    "Ad revenue & CPM optimization strategy",
                    "Weekly Strategy & Retrospective Video Conference",
                    "24/7 Dedicated Senior Channel Lead"
                ]
            }
        ],
        "faqs": [
            {"q": "How do you access my YouTube channel without compromising security?", "a": "We utilize YouTube Studio Channel Permissions (Manager or Editor role). You invite our verified agency email without sharing passwords."},
            {"q": "Do you edit the videos or design the thumbnails in this package?", "a": "Account Management focuses on channel operations, SEO, publishing, and community. Video editing and thumbnail design can be bundled with our specialized services."},
            {"q": "How do you help improve Average View Duration (AVD) and CTR?", "a": "We analyze retention graph drop-offs to advise scripting/editing, formulate 3 title variations, and run Test & Compare thumbnail testing."},
            {"q": "Can you manage multi-language or dubbed secondary channels?", "a": "Yes! Our Studio Enterprise tier supports multi-channel networks and regional audio dubbing."}
        ]
    }'::jsonb,
    true,
    12
),
(
    '00000000-0000-0000-0000-e20000000013',
    'service',
    'YouTube Channel Monetization Apply (For Eligible Channels)',
    'Step-by-step YPP monetization application concierge: 20-point compliance audit, reused content cleanup, AdSense setup & approval guidance.',
    'Reaching 1,000 subscribers and 4,000 public watch hours is a huge achievement. Creator Nest''s Monetization Application Service is a policy-first diagnostic and application concierge. We perform an exhaustive 20-point pre-flight compliance audit, sanitize flagged metadata, guide seamless Google AdSense linking (preventing duplicate account bugs), and oversee your submission to maximize first-time approval rate — 100% ethically without bots or shortcuts.',
    'Monetization',
    'ShieldCheck',
    '#10B981',
    'silver',
    2499,
    5.0,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
    '/marketplace/services/s13',
    ARRAY['Monetization', 'YPP', 'YouTube Partner Program', 'AdSense', 'Reused Content Fix'],
    '{
        "provider": "Creator Nest Monetization & Compliance Wing",
        "delivery_time": "24–72 Hours / Concierge Guided",
        "revisions": 3,
        "badge": "⭐ 100% Policy-Safe",
        "features": [
            "Pre-Flight YPP Eligibility Verification (Valid Public Watch Hours vs Private/Deleted/Shorts)",
            "20-Point YouTube Monetization Policy Audit (Reused & Repetitious Content Risk)",
            "Top 5 Most Viewed Videos Deep-Dive (Commentary, Editing Value & Transformative Check)",
            "Channel Metadata & Thumbnail Cleanup (Clickbait & Misleading Title correction)",
            "Step 2 Google AdSense Account Linking Concierge (Duplicate Account Prevention)",
            "Tax Info & Indian PAN/GST Declaration Guidance for AdSense",
            "Post-Submission Tracking & Review Status Monitoring",
            "Custom 5-Minute Video Appeal Blueprint (If previously rejected by YouTube)"
        ],
        "packages": [
            {
                "name": "Pre-Apply Audit",
                "price": 2499,
                "delivery": "48 Hours",
                "revisions": 2,
                "features": [
                    "Full 20-Point YPP Policy Compliance Audit Report",
                    "Watch Hours verification check (identifies invalid hours)",
                    "Identification of high-risk videos (Reused/Copyright)",
                    "Exact metadata & thumbnail fix checklist before clicking Apply",
                    "Written Action Plan PDF"
                ]
            },
            {
                "name": "Full Concierge",
                "price": 5999,
                "delivery": "72 Hours + Until Decision",
                "revisions": 5,
                "features": [
                    "Everything in Pre-Apply Audit",
                    "1-on-1 Google Meet / Screen-share Application Session",
                    "Step 1 (YPP Terms Acceptance) guidance",
                    "Step 2 (Google AdSense Setup/Link) without duplicate profile errors",
                    "Indian Tax (W-8BEN / Indian GST) information setup",
                    "Step 3 Manual Review submission oversight",
                    "WhatsApp direct concierge support until final review decision"
                ]
            },
            {
                "name": "Rejection Recovery & Appeal",
                "price": 11999,
                "delivery": "5 Business Days",
                "revisions": 99,
                "features": [
                    "For channels previously rejected for Reused Content or Ineligible",
                    "Forensic audit of rejected channel and root-cause diagnostic",
                    "Channel cleansing blueprint (what to unlist vs keep)",
                    "Full scriptwriting for YouTube 5-minute Video Appeal",
                    "Appeal video review & editing direction showing editing software proof",
                    "Re-application timeline strategy after cooldown period",
                    "Direct Senior Compliance Specialist access"
                ]
            }
        ],
        "faqs": [
            {"q": "Can you guarantee 100% that YouTube will approve my monetization?", "a": "No honest agency can guarantee YouTube internal decisions. What we guarantee is 100% adherence to YouTube Channel Monetization Policies, identifying red flags before submission, and optimizing your chances."},
            {"q": "My watch hours reached 4,000, but Earn tab shows less. Why?", "a": "YouTube Studio Earn tab only counts valid public long-form watch hours accrued in the last 365 days. Watch hours from Shorts, unlisted, private, and ad campaigns do not count."},
            {"q": "What is the most common reason for YPP rejection?", "a": "Over 70% of rejections are due to Reused Content or Step 2 AdSense Duplicate Account errors. We specialize in resolving both issues."},
            {"q": "How do you fix the Step 2 AdSense duplicate account error?", "a": "Google permits one AdSense account per individual payee. We guide you through locating, closing, or correctly associating the existing profile or setting up a verified family/business payee profile."}
        ]
    }'::jsonb,
    true,
    13
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    short_desc = EXCLUDED.short_desc,
    long_desc = EXCLUDED.long_desc,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    accent = EXCLUDED.accent,
    plan = EXCLUDED.plan,
    price = EXCLUDED.price,
    rating = EXCLUDED.rating,
    thumbnail_url = EXCLUDED.thumbnail_url,
    external_url = EXCLUDED.external_url,
    tags = EXCLUDED.tags,
    features = EXCLUDED.features,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order;
