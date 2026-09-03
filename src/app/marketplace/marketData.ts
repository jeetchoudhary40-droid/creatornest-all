import {
  Brain, Palette, Zap, Target, TrendingUp, BarChart3,
  BookOpen, Video, Scissors, Mic, FileText, Shield, Megaphone,
  Globe, Users, Rocket, GraduationCap, Coins, Calculator, Wrench
} from 'lucide-react';

export interface PricingPackage {
  name: string;
  price: number; // INR, 0 = free
  delivery: string;
  revisions: number;
  features: string[];
}

export interface ServiceDetails {
  provider: string;
  delivery_time: string;
  revisions: number;
  features: string[];
  packages: PricingPackage[];
  longDesc: string;
  faqs?: { q: string; a: string }[];
}

export interface ToolDetails {
  longDesc: string;
  usageLimits: { plan: string; limit: string }[];
  features: string[];
  howItWorks: string[];
}

export interface MarketItem {
  id: string | number;
  type: 'tool' | 'course' | 'service' | 'template';
  title: string;
  desc: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  icon: any;
  accent: string;
  plan: 'free' | 'silver' | 'gold' | 'platinum';
  meta?: string;
  rating?: number;
  cta: string;
  href: string; // main navigation target
  featured?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  thumbnail_url?: string;
  details?: ServiceDetails | ToolDetails | any;
}

export const ITEMS: MarketItem[] = [

  // ─── AI Tools ────────────────────────────────────────────────────────────────
  {
    id: 't-calc', type: 'tool', title: 'Brand Deal Pricing & Capacity Calculator',
    desc: 'Calculate your exact creator rate card in ₹, deliverable pricing, CPM/CPE, and compare rates across 13 niches.',
    category: 'AI Tools', icon: Calculator, accent: '#10B981', plan: 'free', rating: 5.0,
    meta: 'Free for All Creators', cta: 'Calculate Rates', href: '/marketplace/tool/brand-deal-calculator', featured: true,
    tags: ['Brand Deals', 'Pricing Calculator', 'Rate Card', 'Capacity'], badge: '⭐ Flagship Tool',
    details: {
      longDesc: 'The Brand Deal Pricing & Capacity Calculator is India\'s most accurate rate estimation engine for Instagram and YouTube creators. It calculates exact pricing bands for 11+ deliverables based on follower counts, average views/reach, engagement rate (ER%), city audience tier, and content language.\n\nFeaturing real-time Dual Niche Comparison Mode (e.g. Tech vs Entertainment), add-on multipliers (exclusivity, whitelisting, usage rights), a Barter/Gifting Deal Analyzer, and Retainer/Ambassador models with a 1-click negotiation formula trace for brand pitches.',
      features: [
        'Instagram & YouTube Deliverable Rate Cards',
        '13 Niche Multipliers (Finance 2.0x to Comedy 0.9x)',
        'Dual Niche Side-by-Side Comparison & Gap %',
        'Follower Band & Audience Tier Blending (70/30 Model)',
        'Effective CPM & CPE Calculations',
        'Add-ons: Exclusivity, Whitelisting, Usage Rights, Rush Delivery',
        'Barter Deal Fair Value & Cash Top-Up Analyzer',
        'Monthly Retainer & Ambassador Model Calculator',
        '1-Click Pitch Snippet & Markdown Rate Card Export'
      ],
      usageLimits: [
        { plan: 'Free', limit: 'Unlimited Calculations' },
        { plan: 'Silver', limit: 'Unlimited + PDF Export' },
        { plan: 'Gold', limit: 'Unlimited + Media Kit Sync' },
        { plan: 'Platinum', limit: 'Unlimited + Priority Agency Review' },
      ],
      howItWorks: [
        'Select platform (Instagram or YouTube)',
        'Enter your follower count, average reach/views, and engagement rate',
        'Choose audience city tier and content language',
        'Select 1 or 2 niches to compare deliverable pricing side-by-side',
        'Configure add-ons (exclusivity, whitelisting, usage rights)',
        'Copy negotiation formula trace or export rate card for brand pitch decks',
      ],
    } as ToolDetails,
  },
  {
    id: 't1', type: 'tool', title: 'AI Script Generator',
    desc: 'Generate viral video scripts with hooks, storytelling arcs & CTAs in seconds using advanced AI.',
    category: 'AI Tools', icon: Brain, accent: '#00F2FE', plan: 'free', rating: 4.9,
    meta: '3 uses/day free', cta: 'Try Free', href: '/marketplace/tool/t1', featured: true,
    tags: ['Scripts', 'YouTube', 'Reels'], badge: '🔥 Popular',
    details: {
      longDesc: 'The AI Script Generator is Creator Nest\'s most-used tool. Powered by a fine-tuned large language model trained on thousands of viral creator scripts, it outputs full scripts complete with a punchy hook, structured storytelling arc, and a conversion-focused CTA — all in under 10 seconds.\n\nChoose from YouTube long-form, Instagram Reels, Shorts, podcast episodes, or educational content. The tool learns from your niche and tone preferences to generate scripts that actually sound like you.',
      features: [
        'Hook generator (5 variants per script)',
        'Full narrative arc with act structure',
        'Niche-aware tone matching',
        'CTA templates (subscribe, follow, buy)',
        'Export to Google Docs or copy-paste',
        'YouTube, Reels, Shorts, Podcast modes',
      ],
      usageLimits: [
        { plan: 'Free', limit: '3 scripts per day' },
        { plan: 'Silver', limit: '20 scripts per day' },
        { plan: 'Gold', limit: '100 scripts per day' },
        { plan: 'Platinum', limit: 'Unlimited' },
      ],
      howItWorks: [
        'Enter your topic or niche keyword',
        'Select content format (YouTube, Reels, etc.)',
        'Choose tone: educational, entertaining, or promotional',
        'AI generates your full script in seconds',
        'Edit, copy or export directly',
      ],
    } as ToolDetails,
  },
  {
    id: 't2', type: 'tool', title: 'Thumbnail AI',
    desc: "Create scroll-stopping thumbnails with Midjourney-style prompts & A/B test ideas.",
    category: 'AI Tools', icon: Palette, accent: '#8B5CF6', plan: 'silver', rating: 4.8,
    meta: 'Silver+', cta: 'Try Tool', href: '/marketplace/tool/t2',
    tags: ['Thumbnails', 'Design', 'AI'],
    details: {
      longDesc: 'Thumbnail AI combines generative image prompting with CTR-optimised design principles. Input your video title and niche, and get 5 Midjourney-ready prompts alongside reference composition layouts used by top creators in your space.\n\nAlso includes an A/B test idea generator — get two competing thumbnail concepts so you can test what performs best with your audience.',
      features: [
        '5 Midjourney prompt variants per video',
        'A/B test concept generator',
        'Composition layout templates',
        'Colour psychology recommendations',
        'Font pairing suggestions',
        'Competitor thumbnail analysis',
      ],
      usageLimits: [
        { plan: 'Free', limit: 'No access' },
        { plan: 'Silver', limit: '10 generations per day' },
        { plan: 'Gold', limit: '50 generations per day' },
        { plan: 'Platinum', limit: 'Unlimited' },
      ],
      howItWorks: [
        'Enter your video title and target platform',
        'Select your channel niche',
        'AI generates 5 unique Midjourney prompts',
        'Choose your favourite and refine in Midjourney',
        'Get A/B testing concepts for split testing',
      ],
    } as ToolDetails,
  },
  {
    id: 't3', type: 'tool', title: 'Caption & Hook Writer',
    desc: 'Generate 10 caption hooks, CTAs, and hashtag bundles for Instagram & YouTube in one click.',
    category: 'AI Tools', icon: Zap, accent: '#F59E0B', plan: 'free', rating: 4.7,
    meta: '3 uses/day free', cta: 'Try Free', href: '/marketplace/tool/t3',
    tags: ['Captions', 'Instagram', 'Hooks'],
    details: {
      longDesc: 'Stop spending hours on captions. The Caption & Hook Writer generates 10 unique caption hooks for a single piece of content — from curiosity-gap openers to controversy hooks to storytelling openers. Each caption comes with a matching hashtag bundle of 15-20 niche-optimised tags.\n\nSupports Instagram, YouTube Community, LinkedIn, and Twitter/X formats.',
      features: [
        '10 unique caption variants per topic',
        'Platform-specific formatting (IG, YT, LinkedIn)',
        'Hashtag bundles (15-20 per caption)',
        'Emoji suggestions built-in',
        'Virality score for each hook',
        'Save to favourites library',
      ],
      usageLimits: [
        { plan: 'Free', limit: '3 uses per day' },
        { plan: 'Silver', limit: '30 uses per day' },
        { plan: 'Gold', limit: 'Unlimited' },
        { plan: 'Platinum', limit: 'Unlimited + API access' },
      ],
      howItWorks: [
        'Describe your post or paste your script excerpt',
        'Select platform and tone',
        'Get 10 hook variants in seconds',
        'Pick your favourite and copy with hashtags',
      ],
    } as ToolDetails,
  },
  {
    id: 't4', type: 'tool', title: 'Brand Pitch AI',
    desc: 'Generate personalised brand pitch emails and media kit copy. Close deals faster.',
    category: 'AI Tools', icon: Target, accent: '#10B981', plan: 'gold', rating: 4.9,
    meta: 'Gold+', cta: 'Try Tool', href: '/marketplace/tool/t4',
    tags: ['Brand Deals', 'Pitch', 'Email'], badge: '⭐ New',
    details: {
      longDesc: 'Brand Pitch AI is your personal brand deal closer. Enter the brand name, your channel stats, and your proposed collaboration format — and the AI writes a professional, personalised pitch email that brands actually respond to.\n\nIncludes rate card auto-fill, deliverable descriptions, and follow-up email sequences. Integrates with our media kit builder for end-to-end brand deal automation.',
      features: [
        'Personalised pitch email generation',
        'Rate card auto-calculation',
        'Deliverable scope templates',
        '3-email follow-up sequence',
        'Brand research briefing',
        'Response rate optimisation tips',
      ],
      usageLimits: [
        { plan: 'Free', limit: 'No access' },
        { plan: 'Silver', limit: 'No access' },
        { plan: 'Gold', limit: '20 pitches per month' },
        { plan: 'Platinum', limit: 'Unlimited pitches' },
      ],
      howItWorks: [
        'Enter brand name and campaign brief',
        'Input your channel stats and audience data',
        'Select collaboration type (sponsored video, UGC, ambassador)',
        'AI generates a complete pitch email',
        'Send or use as template in your Gmail/Outlook',
      ],
    } as ToolDetails,
  },
  {
    id: 't5', type: 'tool', title: 'YouTube SEO Optimizer',
    desc: 'Get optimised titles, descriptions and tags ranked by competition score.',
    category: 'AI Tools', icon: TrendingUp, accent: '#EF4444', plan: 'silver', rating: 4.6,
    meta: 'Silver+', cta: 'Try Tool', href: '/marketplace/tool/t5',
    tags: ['SEO', 'YouTube', 'Rankings'],
    details: {
      longDesc: 'Rank higher on YouTube with data-driven SEO. The YouTube SEO Optimizer analyses keyword competition, search volume, and trending topics in your niche to generate titles, descriptions, and tag sets that maximise discoverability.\n\nEach title suggestion comes with a competition score and estimated click-through rate, so you can make data-informed decisions before publishing.',
      features: [
        '10 title variations with CTR predictions',
        'Full video description (500+ words)',
        'Tag sets (20 tags per video)',
        'Keyword competition scoring',
        'Trending topic suggestions',
        'Thumbnail keyword overlay text ideas',
      ],
      usageLimits: [
        { plan: 'Free', limit: 'No access' },
        { plan: 'Silver', limit: '15 optimisations per day' },
        { plan: 'Gold', limit: '60 optimisations per day' },
        { plan: 'Platinum', limit: 'Unlimited' },
      ],
      howItWorks: [
        'Enter your video topic or rough title',
        'Select your channel niche and target region',
        'AI analyses competition landscape',
        'Get 10 optimised title variants with scores',
        'Copy complete description and tag set',
      ],
    } as ToolDetails,
  },
  {
    id: 't6', type: 'tool', title: 'Content Calendar AI',
    desc: 'Auto-generate a 30-day content calendar based on your niche, platform & goals.',
    category: 'AI Tools', icon: BarChart3, accent: '#6366F1', plan: 'gold', rating: 4.8,
    meta: 'Gold+', cta: 'Try Tool', href: '/marketplace/tool/t6',
    tags: ['Planning', 'Calendar', 'Strategy'],
    details: {
      longDesc: 'Stop guessing what to post next. Content Calendar AI builds a complete 30-day posting schedule tailored to your niche, platform mix, and growth goals — including topic ideas, content formats, and optimal posting times based on audience activity data.\n\nEvery calendar entry includes a ready-to-use script prompt and caption starter, so you can go from calendar to content in minutes.',
      features: [
        '30-day calendar generated in seconds',
        'Multi-platform support (YT, IG, TikTok)',
        'Topic ideas with trending hooks',
        'Optimal posting time recommendations',
        'Script prompt for each calendar slot',
        'Export to Google Sheets / Notion',
      ],
      usageLimits: [
        { plan: 'Free', limit: 'No access' },
        { plan: 'Silver', limit: 'No access' },
        { plan: 'Gold', limit: '2 calendars per month' },
        { plan: 'Platinum', limit: 'Unlimited calendars' },
      ],
      howItWorks: [
        'Set your niche, platforms, and posting frequency',
        'Define your goals (growth, monetization, brand deals)',
        'AI generates a full 30-day calendar',
        'Customise individual entries as needed',
        'Export and sync with your preferred tool',
      ],
    } as ToolDetails,
  },

  // ─── Courses (Creator Skool Suite from NSchool) ───────────────────────────
  {
    id: 'c17', type: 'course', title: 'Understand Brand Deals: Complete Sponsorship Guide',
    desc: 'Master creator brand deals in India: Barter vs Paid, Deliverable Rates in ₹, 70/30 Pricing Formula, Media Kits, Commercial Add-Ons & Cold Pitching.',
    category: 'Courses', icon: Target, accent: '#10B981', plan: 'free', rating: 5.0,
    meta: '1 hr 15 min · 10 reading guides', cta: 'Read Free', href: '/nschool/course/17',
    tags: ['Brand Deals', 'Pricing', 'Media Kit', 'Sponsorship', 'Creator Skool'], badge: '⭐ Flagship Guide', featured: true,
  },
  {
    id: 'c1', type: 'course', title: 'ChatGPT for Script Writing',
    desc: 'Master AI-powered scriptwriting with proven hooks and storytelling frameworks.',
    category: 'Courses', icon: Brain, accent: '#00F2FE', plan: 'free', rating: 4.9,
    meta: '45 min · 8 lessons', cta: 'Start Free', href: '/nschool/course/1',
    tags: ['ChatGPT', 'Scripts', 'AI'], badge: '🎓 Beginner', featured: true,
  },
  {
    id: 'c2', type: 'course', title: 'Landing Your First Brand Deal',
    desc: 'Step-by-step playbook to pitch brands and close your first paid collaboration.',
    category: 'Courses', icon: Target, accent: '#F59E0B', plan: 'free', rating: 4.9,
    meta: '1 hr · 10 lessons', cta: 'Start Free', href: '/nschool/course/4',
    tags: ['Brand Deals', 'Pitching', 'Negotiation'],
  },
  {
    id: 'c3', type: 'course', title: 'YouTube Algorithm Deep Dive',
    desc: 'Data-driven strategies to hack the algorithm — impressions, CTR, AVD mastered.',
    category: 'Courses', icon: TrendingUp, accent: '#EF4444', plan: 'silver', rating: 4.9,
    meta: '2 hrs · 14 lessons', cta: 'Enroll', href: '/nschool/course/9',
    tags: ['Algorithm', 'YouTube', 'Analytics'],
  },
  {
    id: 'c4', type: 'course', title: 'DaVinci Resolve Masterclass',
    desc: 'Professional video editing with free software used by Hollywood editors.',
    category: 'Courses', icon: Video, accent: '#8B5CF6', plan: 'gold', rating: 4.9,
    meta: '4 hrs · 22 lessons', cta: 'Enroll', href: '/nschool/course/12',
    tags: ['DaVinci', 'Editing', 'Color'], badge: '💎 Advanced',
  },
  {
    id: 'c5', type: 'course', title: 'Instagram Reels Growth System',
    desc: 'A systematic approach to Reels — trending audio, hooks, and posting cadence.',
    category: 'Courses', icon: Zap, accent: '#EC4899', plan: 'free', rating: 4.7,
    meta: '1 hr · 8 lessons', cta: 'Start Free', href: '/nschool/course/10',
    tags: ['Reels', 'Instagram', 'Growth'],
  },
  {
    id: 'c6', type: 'course', title: 'Monetization Beyond AdSense',
    desc: 'Diversify revenue: memberships, merch, courses, affiliate, licensing.',
    category: 'Courses', icon: BarChart3, accent: '#10B981', plan: 'silver', rating: 4.8,
    meta: '1.5 hrs · 11 lessons', cta: 'Enroll', href: '/nschool/course/13',
    tags: ['Revenue', 'Monetization', 'Business'],
  },
  {
    id: 'c7', type: 'course', title: 'Midjourney Thumbnail Mastery',
    desc: 'Create scroll-stopping thumbnails with Midjourney. Learn prompting, style tuning, and A/B testing workflows.',
    category: 'Courses', icon: Palette, accent: '#8B5CF6', plan: 'silver', rating: 4.8,
    meta: '1.5 hrs · 12 lessons', cta: 'Enroll', href: '/nschool/course/2',
    tags: ['Midjourney', 'Thumbnails', 'Design'],
  },
  {
    id: 'c8', type: 'course', title: 'AI Video Generation with Runway & Sora',
    desc: 'Produce cinematic B-roll and effects using Runway ML and OpenAI Sora. No camera required.',
    category: 'Courses', icon: Video, accent: '#EF4444', plan: 'gold', rating: 4.7,
    meta: '2 hrs · 15 lessons', cta: 'Enroll', href: '/nschool/course/3',
    tags: ['Runway', 'Sora', 'Video AI'], badge: '🚀 Advanced',
  },
  {
    id: 'c9', type: 'course', title: 'Rate Card & Media Kit Builder',
    desc: 'Build a professional rate card and media kit that commands premium pricing. Includes free templates.',
    category: 'Courses', icon: FileText, accent: '#00F2FE', plan: 'free', rating: 4.8,
    meta: '50 min · 6 lessons', cta: 'Start Free', href: '/nschool/course/5',
    tags: ['Rate Card', 'Media Kit', 'Pricing'],
  },
  {
    id: 'c10', type: 'course', title: 'Long-Term Brand Partnerships',
    desc: 'Move beyond one-off deals. Learn retention strategies, exclusivity clauses, and ambassador frameworks.',
    category: 'Courses', icon: Shield, accent: '#F59E0B', plan: 'silver', rating: 4.7,
    meta: '1.5 hrs · 9 lessons', cta: 'Enroll', href: '/nschool/course/6',
    tags: ['Retention', 'Ambassador', 'Strategy'],
  },
  {
    id: 'c11', type: 'course', title: 'Creator Quick Start: 0 to First Video',
    desc: 'Everything to publish your first professional video — gear, editing, SEO, and distribution in one checklist.',
    category: 'Courses', icon: Rocket, accent: '#10B981', plan: 'free', rating: 5.0,
    meta: '30 min · 5 lessons', cta: 'Start Free', href: '/nschool/course/7',
    tags: ['Setup', 'First Video', 'Checklist'], badge: '⭐ Top Rated',
  },
  {
    id: 'c12', type: 'course', title: 'Channel Setup & Branding Blueprint',
    desc: 'Set up your YouTube channel, Instagram bio, and cross-platform branding like a pro from Day 1.',
    category: 'Courses', icon: Globe, accent: '#6366F1', plan: 'free', rating: 4.8,
    meta: '40 min · 7 lessons', cta: 'Start Free', href: '/nschool/course/8',
    tags: ['Branding', 'Setup', 'Identity'],
  },
  {
    id: 'c13', type: 'course', title: 'Professional Lighting on a Budget',
    desc: 'Achieve studio-quality lighting with affordable gear. Three-point setups and natural light hacks.',
    category: 'Courses', icon: Video, accent: '#F59E0B', plan: 'free', rating: 4.6,
    meta: '1 hr · 6 lessons', cta: 'Start Free', href: '/nschool/course/11',
    tags: ['Lighting', 'Budget', 'Quality'],
  },
  {
    id: 'c14', type: 'course', title: 'Building a Community That Pays',
    desc: 'Turn followers into superfans. Discord strategies, membership tiers, and community-led content creation.',
    category: 'Courses', icon: Users, accent: '#EC4899', plan: 'gold', rating: 4.7,
    meta: '2 hrs · 13 lessons', cta: 'Enroll', href: '/nschool/course/14',
    tags: ['Community', 'Membership', 'Superfans'],
  },
  {
    id: 'c15', type: 'course', title: 'AI Voiceover & Dubbing Tools',
    desc: 'Clone your voice, auto-dub in 50+ languages, and create faceless content using ElevenLabs & HeyGen.',
    category: 'Courses', icon: Brain, accent: '#00F2FE', plan: 'silver', rating: 4.6,
    meta: '1 hr · 7 lessons', cta: 'Enroll', href: '/nschool/course/15',
    tags: ['Voiceover', 'Dubbing', 'ElevenLabs'],
  },
  {
    id: 'c16', type: 'course', title: 'Collaboration & Cross-Promotion Playbook',
    desc: 'Find the right collab partners, structure win-win deals, and cross-promote to double your reach overnight.',
    category: 'Courses', icon: Users, accent: '#10B981', plan: 'free', rating: 4.8,
    meta: '45 min · 6 lessons', cta: 'Start Free', href: '/nschool/course/16',
    tags: ['Collab', 'Cross-Promo', 'Networking'],
  },

  // ─── Services ────────────────────────────────────────────────────────────────
  {
    id: 's10', type: 'service', title: 'Tech Support for Creators: Channel Audit & Growth Blueprint',
    desc: 'Deep-dive channel/account diagnostic audit, custom 90-day algorithmic growth plan, studio tech stack optimization, and 1-on-1 technical support for onboarded talent.',
    category: 'Tech Support & Growth', icon: Wrench, accent: '#00F2FE', plan: 'free', rating: 5.0,
    meta: 'Free for Onboarded Creators / From ₹0', cta: 'Book Tech Support', href: '/marketplace/services/s10',
    tags: ['Tech Support', 'Channel Audit', 'Growth Plan', 'Onboarded Talent', 'YouTube', 'Instagram'], featured: true, badge: '⭐ Free for Onboarded Talent',
    details: {
      provider: 'Creator Nest Engineering & Growth Wing',
      delivery_time: '3 Business Days',
      revisions: 5,
      longDesc: 'Exclusive technical backing and algorithmic intelligence for Creator Nest creators. We perform a complete 360° technical and performance audit on your YouTube channel, Instagram account, and recording workflow — identifying retention drop-offs, metadata bottlenecks, and audio/video calibration flaws.\n\nThen, our team crafts a personalized 90-day Algorithmic Growth Blueprint and provides direct technical support (OBS, audio routing, studio gear, verification, and brand deliverable compliance) so you can focus entirely on creating top-tier content.',
      features: [
        '360° Channel & Account Diagnostic Audit (CTR, AVD, Watch-Time & Engagement)',
        'Custom 90-Day Algorithmic Growth Roadmap & Cadence Strategy',
        'Audio/Video Studio & OBS Setup Calibration Support',
        'Copyright, Content ID & Platform Monetization Diagnostic Fixes',
        'Direct WhatsApp Technical Concierge for Onboarded Talent',
        'Sponsorship Deliverable Technical Verification & Media Kit Sync',
        '1-on-1 Strategy & Technical Diagnostics Call'
      ],
      packages: [
        {
          name: 'Onboarded Talent Exclusive',
          price: 0,
          delivery: '48 Hours / Ongoing',
          revisions: 99,
          features: [
            '100% Free for Onboarded Creator Nest Talent',
            'Full Channel Diagnostic & Growth Audit',
            '90-Day Custom Growth & Content Roadmap',
            'Studio Gear & Audio/Video Calibration',
            'Dedicated WhatsApp Technical Concierge',
            'Brand Deal Technical Compliance Check',
          ],
        },
        {
          name: 'Creator Audit Starter',
          price: 1499,
          delivery: '3 Days',
          revisions: 2,
          features: [
            'Comprehensive Account & Channel Audit Report',
            'Top 15 Algorithmic Growth Recommendations',
            '30-Day Content Cadence & Hook Blueprint',
            'Audio/Video Settings Optimization Guide',
          ],
        },
        {
          name: 'Enterprise 360° Channel Revamp',
          price: 4999,
          delivery: '5 Days',
          revisions: 5,
          features: [
            'Everything in Creator Audit Starter',
            'Dual Platform Deep Audit (YouTube + Instagram)',
            '60-min Live Zoom Technical Diagnostics Call',
            'OBS / Stream Deck & Audio Routing Setup',
            '30-Day Direct WhatsApp Technical Support',
          ],
        },
      ],
      faqs: [
        { q: 'Is this service really free for onboarded creators?', a: 'Yes! All creators represented under the Creator Nest Talent Roster receive complimentary Channel Audits, Growth Plans, and ongoing 1-on-1 technical concierge support as part of their management.' },
        { q: 'What tools and platforms do you audit?', a: 'We audit YouTube Channels (long-form & Shorts), Instagram Accounts (Reels & engagement algorithms), audio gear (Rode, Shure, Elgato), streaming software (OBS Studio, vMix), and editing/production pipelines.' },
        { q: 'How is the 90-day growth plan delivered?', a: 'You will receive a comprehensive PDF diagnostic report + action roadmap, accompanied by an interactive Notion workspace and a 1-on-1 strategy walkthrough call.' },
      ],
    } as ServiceDetails,
  },
  {
    id: 's1', type: 'service', title: 'Professional Video Editing',
    desc: 'Hollywood-grade editing with color grading, transitions, and motion graphics. Delivered in 48hrs.',
    category: 'Video Editing', icon: Scissors, accent: '#00F2FE', plan: 'free', rating: 4.9,
    meta: 'From ₹1,499/video', cta: 'Book Now', href: '/marketplace/services/s1',
    tags: ['Editing', 'YouTube', 'Reels'], featured: true, badge: '⚡ 48hr delivery',
    details: {
      provider: 'Creator Nest Edit Team',
      delivery_time: '48 Hours',
      revisions: 3,
      longDesc: 'Our professional video editing team brings Hollywood-level production value to creator content. From precise cuts and seamless transitions to cinematic colour grading and custom motion graphics — every video is crafted to maximise watch time and viewer retention.\n\nTrusted by 500+ creators across YouTube, Instagram, and OTT platforms. We work with your raw footage and return a polished, publish-ready video.',
      features: [
        'Professional cuts & pacing optimisation',
        'Cinema-grade colour grading (LUTs)',
        'Custom intro & outro animation',
        'Background music & SFX',
        'Captions & subtitles included',
        'Thumbnail design (1 variant)',
        '4K export ready',
      ],
      packages: [
        {
          name: 'Basic',
          price: 1499,
          delivery: '72 hours',
          revisions: 1,
          features: [
            'Up to 10 min edited video',
            'Basic colour correction',
            'Music & SFX',
            '1080p export',
          ],
        },
        {
          name: 'Standard',
          price: 2999,
          delivery: '48 hours',
          revisions: 3,
          features: [
            'Up to 20 min edited video',
            'Cinema colour grading',
            'Animated intro/outro',
            'Captions included',
            '4K export',
          ],
        },
        {
          name: 'Premium',
          price: 5999,
          delivery: '24 hours',
          revisions: 5,
          features: [
            'Up to 60 min edited video',
            'Full cinematic grade',
            'Custom motion graphics',
            'Thumbnail design',
            '4K + Shorts cut',
            'Priority support',
          ],
        },
      ],
      faqs: [
        { q: 'What formats do you accept?', a: 'We accept MP4, MOV, MKV, and all major raw formats from DSLRs, mirrorless cameras, and screen recordings.' },
        { q: 'How do I share my footage?', a: 'After booking, you\'ll receive a Google Drive upload link. We start editing once all footage is uploaded.' },
        { q: 'Can I request a specific editing style?', a: 'Yes! Share reference videos during onboarding and we\'ll match the style, pacing, and tone.' },
      ],
    } as ServiceDetails,
  },
  {
    id: 's2', type: 'service', title: 'AI Content Generation',
    desc: 'Scripts, captions, hashtags, descriptions — all AI-written for your brand voice.',
    category: 'SEO Services', icon: Brain, accent: '#8B5CF6', plan: 'free', rating: 4.8,
    meta: 'From ₹499/mo', cta: 'Get Started', href: '/marketplace/services/s2',
    tags: ['AI Content', 'Scripts', 'Captions'],
    details: {
      provider: 'Creator Nest AI Studio',
      delivery_time: 'Same Day',
      revisions: 2,
      longDesc: 'Let AI handle your content pipeline. Our AI Content Generation service uses Creator Nest\'s proprietary models fine-tuned on viral creator content to produce scripts, captions, descriptions, and hashtag packs that sound like YOU — not a robot.\n\nPerfect for creators who post daily and need a constant supply of fresh, engaging copy without spending hours writing.',
      features: [
        'Daily script generation (niche-tuned)',
        'Instagram & YouTube captions (10 variants)',
        'Hashtag bundles (platform-specific)',
        'YouTube video descriptions (500+ words)',
        'Brand voice profile setup',
        'Monthly content calendar',
      ],
      packages: [
        {
          name: 'Starter',
          price: 499,
          delivery: 'Monthly',
          revisions: 1,
          features: [
            '10 scripts per month',
            '20 caption sets',
            'Hashtag bundles',
          ],
        },
        {
          name: 'Creator',
          price: 1499,
          delivery: 'Monthly',
          revisions: 3,
          features: [
            '30 scripts per month',
            'Unlimited captions',
            'SEO descriptions',
            'Content calendar',
          ],
        },
        {
          name: 'Agency',
          price: 3999,
          delivery: 'Monthly',
          revisions: 5,
          features: [
            'Unlimited scripts',
            'Unlimited captions',
            'Brand voice profile',
            'Dedicated account manager',
            'WhatsApp priority support',
          ],
        },
      ],
      faqs: [
        { q: 'Is the content plagiarism-free?', a: 'Yes. All output is unique, AI-generated and passes plagiarism checks.' },
        { q: 'Can it match my existing content style?', a: 'Yes! Share 3-5 existing scripts or captions during setup and we\'ll tune the AI to your voice.' },
      ],
    } as ServiceDetails,
  },
  {
    id: 's3', type: 'service', title: 'Thumbnail Design',
    desc: 'Click-through optimised thumbnail design by our expert visual team. A/B variants included.',
    category: 'Graphic Design', icon: Palette, accent: '#F59E0B', plan: 'free', rating: 4.7,
    meta: 'From ₹299/thumbnail', cta: 'Book Now', href: '/marketplace/services/s3',
    tags: ['Design', 'CTR', 'YouTube'],
    details: {
      provider: 'Creator Nest Design Studio',
      delivery_time: '24 Hours',
      revisions: 2,
      longDesc: 'A great thumbnail is the single most important factor in getting clicks. Our design team creates data-driven, eye-catching thumbnails that dramatically improve CTR. Every thumbnail is A/B tested with 2 variants, giving you the best chance to find what works.\n\nInspired by the top 1% of creators in your niche, optimised for mobile-first viewing where 70% of YouTube traffic comes from.',
      features: [
        '2 A/B test variants per video',
        'Mobile-first composition',
        'High-contrast colour palettes',
        'Face expressions coaching (if needed)',
        'Text overlay optimised for readability',
        'Source files (PSD/Figma) on Premium',
      ],
      packages: [
        {
          name: 'Basic',
          price: 299,
          delivery: '48 hours',
          revisions: 1,
          features: [
            '1 thumbnail design',
            'Stock image sourcing',
            'Text overlay',
            'JPG/PNG export',
          ],
        },
        {
          name: 'Standard',
          price: 599,
          delivery: '24 hours',
          revisions: 2,
          features: [
            '2 A/B variant thumbnails',
            'Custom illustration',
            'Background removal',
            'Mobile preview check',
          ],
        },
        {
          name: 'Premium',
          price: 1499,
          delivery: '12 hours',
          revisions: 4,
          features: [
            '3 thumbnails + mobile preview',
            'Source files (PSD + Figma)',
            'Brand colour palette',
            'Rush delivery',
            'Priority support',
          ],
        },
      ],
      faqs: [
        { q: 'Do you need me to provide a photo?', a: 'Optional. You can provide a photo or we can source professional stock images. For face thumbnails, a high-res photo is recommended.' },
        { q: 'What resolution are the thumbnails?', a: 'We deliver at 2560×1440px (YouTube recommended), optimised for all screens.' },
      ],
    } as ServiceDetails,
  },
  {
    id: 's4', type: 'service', title: 'Channel Strategy & Audit',
    desc: 'Full channel audit with competitor analysis and a 90-day growth roadmap from our strategists.',
    category: 'Strategy & Consulting', icon: Target, accent: '#10B981', plan: 'silver', rating: 5.0,
    meta: '₹2,999/audit', cta: 'Book Audit', href: '/marketplace/services/s4',
    tags: ['Strategy', 'Growth', 'Audit'], badge: '✨ Featured',
    details: {
      provider: 'Creator Nest Strategy Team',
      delivery_time: '5 Business Days',
      revisions: 2,
      longDesc: 'Get a full breakdown of your channel\'s performance, gaps, and opportunities from a senior Creator Nest strategist. Every audit includes competitor benchmarking, title/thumbnail analysis, content gap identification, and a personalised 90-day growth roadmap.\n\nUsed by 200+ creators to go from stagnant to growing channels. Average client sees 40% growth in the first 90 days.',
      features: [
        'Full channel performance analysis',
        '3 competitor breakdown reports',
        'Title & thumbnail CTR audit',
        'Content gap & opportunity map',
        '90-day growth roadmap (PDF)',
        '1-on-1 strategy call (45 min)',
      ],
      packages: [
        {
          name: 'Audit Only',
          price: 2999,
          delivery: '5 days',
          revisions: 1,
          features: [
            'Full written audit report',
            'Competitor analysis',
            'Action list (top 10 changes)',
          ],
        },
        {
          name: 'Audit + Roadmap',
          price: 5999,
          delivery: '5 days',
          revisions: 2,
          features: [
            'Everything in Audit Only',
            '90-day content roadmap',
            '30-min strategy call',
            'Monthly check-in (1 month)',
          ],
        },
        {
          name: 'Full Mentorship',
          price: 14999,
          delivery: 'Ongoing',
          revisions: 5,
          features: [
            'Everything in Audit + Roadmap',
            '3-month 1-on-1 mentorship',
            'Weekly strategy calls',
            'Direct WhatsApp access',
            'Channel managed reviews',
          ],
        },
      ],
      faqs: [
        { q: 'How many subscribers do I need?', a: 'We audit channels of all sizes. Even 0-subscriber channels get a launch strategy.' },
        { q: 'Is the strategy call included?', a: 'Yes for Audit + Roadmap and Full Mentorship packages. Audit Only is a written report.' },
      ],
    } as ServiceDetails,
  },
  {
    id: 's5', type: 'service', title: 'Social Media Management',
    desc: 'End-to-end social management: posting, engagement, growth & analytics reports.',
    category: 'Channel Management', icon: Megaphone, accent: '#EC4899', plan: 'gold', rating: 4.8,
    meta: 'From ₹9,999/mo', cta: 'Learn More', href: '/marketplace/services/s5',
    tags: ['Social Media', 'Management', 'Growth'],
    details: {
      provider: 'Creator Nest Social Team',
      delivery_time: 'Monthly Retainer',
      revisions: 3,
      longDesc: 'Hand off your social media completely. Our team manages your Instagram, YouTube community, and Twitter/X presence — from scheduling and posting to comments management, DM responses, and weekly performance reports.\n\nWe create content, run your accounts, and grow your following so you can focus on what you do best: making videos.',
      features: [
        'Full scheduling & posting',
        'Comment & DM management',
        'Story & Reels creation (4/week)',
        'Hashtag strategy optimisation',
        'Influencer outreach for collabs',
        'Weekly analytics reports',
        'Monthly strategy review call',
      ],
      packages: [
        {
          name: 'Starter',
          price: 9999,
          delivery: 'Monthly',
          revisions: 2,
          features: [
            '1 platform (IG or YouTube)',
            '12 posts per month',
            'Comment moderation',
            'Weekly report',
          ],
        },
        {
          name: 'Growth',
          price: 19999,
          delivery: 'Monthly',
          revisions: 3,
          features: [
            '2 platforms',
            '20 posts per month',
            'Reels & Stories creation',
            'Hashtag strategy',
            'Monthly strategy call',
          ],
        },
        {
          name: 'Full Agency',
          price: 39999,
          delivery: 'Monthly',
          revisions: 5,
          features: [
            'All platforms (IG, YT, Twitter/X)',
            'Unlimited posts',
            'Influencer collab outreach',
            'Paid ads management',
            'Dedicated account manager',
            'Daily WhatsApp updates',
          ],
        },
      ],
      faqs: [
        { q: 'Do you post for me or just give me content?', a: 'We do both — we create the content AND post it according to your approved schedule.' },
        { q: 'How do you access my accounts?', a: 'We use Meta Business Suite and YouTube Studio with restricted access. You maintain full ownership.' },
      ],
    } as ServiceDetails,
  },
  {
    id: 's6', type: 'service', title: 'Voice Over & Dubbing',
    desc: 'Professional voice-over in Hindi, English & regional languages. AI-assisted dubbing in 50+ languages.',
    category: 'Voice Over & Dubbing', icon: Mic, accent: '#6366F1', plan: 'free', rating: 4.6,
    meta: 'From ₹799/minute', cta: 'Request Quote', href: '/marketplace/services/s6',
    tags: ['Voice', 'Dubbing', 'AI'],
    details: {
      provider: 'Creator Nest Voice Studio',
      delivery_time: '24–48 Hours',
      revisions: 2,
      longDesc: 'Reach a global audience with professional voice-over and AI dubbing. We offer human voice-over artists in Hindi, English, Tamil, Telugu, Kannada, and Marathi — or AI-assisted dubbing using ElevenLabs and HeyGen technology for 50+ languages.\n\nIdeal for faceless YouTube channels, explainer videos, educational content, and brand commercials.',
      features: [
        'Human voice artists (6 Indian languages)',
        'AI dubbing in 50+ languages',
        'Lip-sync video dubbing (HeyGen)',
        'Background noise removal',
        'Studio-quality audio export',
        'SRT subtitle file included',
      ],
      packages: [
        {
          name: 'AI Dubbing',
          price: 799,
          delivery: '12 hours',
          revisions: 1,
          features: [
            'Per minute of video',
            'AI voice cloning',
            '1 language',
            'Audio track + SRT file',
          ],
        },
        {
          name: 'Human Voice Over',
          price: 1999,
          delivery: '24 hours',
          revisions: 2,
          features: [
            'Per minute of script',
            'Professional human artist',
            'Hindi or English',
            'Studio-quality recording',
          ],
        },
        {
          name: 'Full Dubbing Package',
          price: 4999,
          delivery: '48 hours',
          revisions: 3,
          features: [
            'Up to 5 min video',
            'Lip-sync video dubbing',
            'Up to 3 languages',
            'SRT subtitles for all languages',
            'Priority turnaround',
          ],
        },
      ],
      faqs: [
        { q: 'What\'s the difference between AI and human voice-over?', a: 'Human voice-over uses real artists for authentic, nuanced delivery. AI dubbing uses ElevenLabs technology — faster and cheaper but slightly less natural.' },
        { q: 'Can you match the original speaker\'s voice?', a: 'Yes — with ElevenLabs voice cloning, we can clone the original speaker\'s voice and dub in other languages.' },
      ],
    } as ServiceDetails,
  },
  {
    id: 's7', type: 'service', title: '1-on-1 Storytelling & Hook Coaching',
    desc: 'Private coaching to refine your hook scripting, video pacing, and on-camera storytelling style.',
    category: 'Skill Coaching', icon: GraduationCap, accent: '#6366F1', plan: 'free', rating: 4.9,
    meta: '₹4,999/session', cta: 'Book Session', href: '/marketplace/services/s7',
    tags: ['Coaching', 'Hook', 'Storytelling'],
    details: {
      provider: 'Creator Nest Coaching Team',
      delivery_time: '1-3 Days',
      revisions: 1,
      longDesc: 'Learn the exact storytelling patterns used by the top 1% of creators. In these private 1-on-1 coaching sessions, a senior creator coach audits your script pacing, helps you build high-retention video structures, and guides your on-camera voice and presentation style.\n\nOptimise your retention rates, write killer hooks, and convert passive viewers into active subscribers.',
      features: [
        '60-minute private Zoom coaching session',
        'Script structure & hook teardown',
        'Camera presence & delivery audit',
        'Custom storytelling workbook & guides',
        'Actionable retention optimization plan',
        'Direct email access for script reviews'
      ],
      packages: [
        {
          name: 'Single Session',
          price: 4999,
          delivery: '3 days',
          revisions: 1,
          features: [
            '60-min Zoom session',
            '1 script review',
            'Recording link & notes'
          ]
        },
        {
          name: '1-Month Intensive',
          price: 14999,
          delivery: 'Ongoing',
          revisions: 3,
          features: [
            '4 weekly Zoom sessions',
            'Unlimited script reviews',
            'Storytelling templates',
            'WhatsApp direct access'
          ]
        },
        {
          name: '3-Month Academy',
          price: 39999,
          delivery: 'Ongoing',
          revisions: 5,
          features: [
            '12 weekly Zoom sessions',
            'Niche positioning audit',
            'Direct brand pitch check',
            'Custom growth KPIs'
          ]
        }
      ],
      faqs: [
        { q: 'Is this only for beginners?', a: 'No. We work with both beginners getting started on camera and established creators looking to increase average view duration (AVD).' },
        { q: 'Do you review my edited videos too?', a: 'Yes! We can tear down both pre-production scripts and published videos to audit pacing and flow.' }
      ]
    } as ServiceDetails
  },
  {
    id: 's8', type: 'service', title: 'Brand Deal Sourcing & Pitching',
    desc: 'Pitching to premium brands, building media kits, and negotiating contracts for creators.',
    category: 'Monetization', icon: Coins, accent: '#10B981', plan: 'silver', rating: 4.8,
    meta: 'From ₹4,999/mo', cta: 'Apply for Agent', href: '/marketplace/services/s8',
    tags: ['Brand Deals', 'Sponsorship', 'Management'], badge: '🔥 Hot',
    details: {
      provider: 'Creator Nest Brand Team',
      delivery_time: 'Monthly Retainer',
      revisions: 3,
      longDesc: 'Stop waiting for brands to find you. Our brand team actively pitches you to premium brand campaigns, builds custom media kits, negotiates high-tier rates on your behalf, and manages brand contracts from start to finish.\n\nWe connect you with brands looking for authentic creator voices, helping you build a sustainable monthly revenue stream.',
      features: [
        'Professional media kit & rate card design',
        'Active pitching to 50+ target brands/mo',
        'Inbound inquiry management',
        'Rate negotiation & contract vetting',
        'Campaign delivery coordination',
        'Stripe & invoice management'
      ],
      packages: [
        {
          name: 'Media Kit Builder',
          price: 4999,
          delivery: '5 days',
          revisions: 2,
          features: [
            'Custom interactive media kit',
            'Rate card strategy',
            'Pitch template script'
          ]
        },
        {
          name: 'Active Outreach',
          price: 14999,
          delivery: 'Monthly',
          revisions: 3,
          features: [
            'Everything in Media Kit Builder',
            '30 brand pitches per month',
            'Inbound email handling',
            'Contract negotiation'
          ]
        },
        {
          name: 'Full Management',
          price: 29999,
          delivery: 'Monthly',
          revisions: 5,
          features: [
            'Everything in Active Outreach',
            'Dedicated creator agent',
            'Unlimited brand pitching',
            'Invoicing & collections',
            'WhatsApp direct support'
          ]
        }
      ],
      faqs: [
        { q: 'How many followers do I need?', a: 'We work with micro-creators (5k+ followers) and macro-creators alike. Brands care about engagement, niche, and content quality more than raw numbers.' },
        { q: 'Do you take a commission?', a: 'For the \'Full Management\' package, we work on a commission-based hybrid model base fee + 10% commission on closed deals to align incentives.' }
      ]
    } as ServiceDetails
  },
  {
    id: 's9', type: 'service', title: 'Digital Product & Community Builder',
    desc: 'Launch a private community (Skool/Discord) and package your expertise into digital products.',
    category: 'Scale & IP Creation', icon: Rocket, accent: '#EC4899', plan: 'gold', rating: 5.0,
    meta: 'From ₹9,999/launch', cta: 'Book Consultation', href: '/marketplace/services/s9',
    tags: ['Community', 'Skool', 'Launch'],
    details: {
      provider: 'Creator Nest Scale Team',
      delivery_time: '14 Days',
      revisions: 4,
      longDesc: 'Diversify your income by launching your own digital product, paid membership, or community. We set up platforms like Skool, Discord, or Circle, design high-converting landing pages, write email launch sequences, and structure your pricing models.\n\nTransition from a content creator relying on ads to a scalable business owner owning your customer base.',
      features: [
        'Skool/Discord server custom design & setup',
        'Digital product structuring (e.g. PDFs, mini-courses)',
        'High-converting landing page setup',
        'Automated payment funnel (Stripe/Instamojo)',
        '3-part launch email sequence template',
        'Creator Business Model consultation'
      ],
      packages: [
        {
          name: 'Consultation',
          price: 9999,
          delivery: '3 days',
          revisions: 1,
          features: [
            '90-min roadmap session',
            'Product idea validation',
            'Funnel blueprint outline'
          ]
        },
        {
          name: 'Community Launch',
          price: 24999,
          delivery: '14 days',
          revisions: 3,
          features: [
            'Everything in Consultation',
            'Skool or Discord setup',
            'Landing page copywriting',
            'Stripe payment funnel'
          ]
        },
        {
          name: 'End-to-End Scale',
          price: 49999,
          delivery: '30 days',
          revisions: 5,
          features: [
            'Everything in Community Launch',
            'Custom mini-course upload',
            'Complete email sequence setup',
            'Active launch management',
            'Ongoing support (30 days)'
          ]
        }
      ],
      faqs: [
        { q: 'Which community platform is best?', a: 'Skool is excellent for gamification and courses. Discord is great for real-time chat and gaming. Circle is ideal for premium, structured discussions. We help you choose the best platform for your audience.' },
        { q: 'Can I do this if I have a small audience?', a: 'Yes! A small, highly-engaged audience of 1,000 followers can generate substantial monthly income when structured with the right community model.' }
      ]
    } as ServiceDetails
  },

  // ─── Templates ────────────────────────────────────────────────────────────────
  {
    id: 'tp1', type: 'template', title: 'Creator Media Kit (Notion)',
    desc: 'The official agency-grade Notion Creator Media Kit used by 500+ Indian & Global creators to pitch brands, showcase verified audience demographics, and close high-ticket sponsorship deals.',
    category: 'Templates', icon: FileText, accent: '#00F2FE', plan: 'free', rating: 5.0,
    meta: 'Interactive Notion Template · Free', cta: 'Open Notion Media Kit', href: '/marketplace/item/tp1',
    tags: ['Media Kit', 'Brand Deals', 'Notion Workspace', 'Rate Card', 'Sponsorship'], featured: true, badge: '⭐ Top Rated Template',
    details: {
      longDesc: 'The Creator Nest Official Notion Media Kit is a battle-tested, agency-grade sponsorship pitch deck template. Researched and refined from real commercial campaigns with top consumer, tech, fintech, and lifestyle brands in India, this Notion workspace structures everything a Brand Manager, CMO, or Agency Media Planner looks for in under 30 seconds.\n\nFeaturing dynamic demographic data tables, 2026 commercial deliverable rate cards (in ₹ INR), category exclusivity clauses, Spark Ads/Whitelisting add-ons, past campaign case studies, and a 1-click Notion duplication link + Markdown export.',
      features: [
        'Executive Bio & Channel Mission Statement Block',
        'Multi-Platform Audience Demographics (YouTube, Instagram, LinkedIn)',
        'Audience Age, Gender & Indian City Tiers (Tier 1 vs Tier 2/3 Breakdown)',
        'Verified Performance Benchmarks (CTR, AVD, Avg Views & Engagement Rate %)',
        'Commercial Deliverable Rate Card (Dedicated Videos, Integrations, Reels & Shorts)',
        'Commercial Add-Ons: Exclusivity, Paid Ad Whitelisting & Perpetual Usage Rights',
        'Past Brand Collaborations Showcase & ROI Case Studies',
        'Official Booking Protocol & Net-15/30 Payment Policy Terms',
        '1-Click Copy Notion Markdown & Instant PDF Print Layout'
      ],
      usageLimits: [
        { plan: 'Free', limit: 'Full Access to Notion Template & Markdown Export' },
        { plan: 'Silver', limit: 'Custom Rate Card Sync' },
        { plan: 'Gold', limit: 'Agency Media Kit Verification' },
        { plan: 'Platinum', limit: 'Dedicated Talent Manager Custom Pitch Kit' },
      ],
      howItWorks: [
        'Preview the live interactive Notion Media Kit workspace below',
        'Customize your channel stats, handle, niches, and deliverable rates',
        'Click "Copy Notion Markdown" to paste directly into your Notion workspace',
        'Or click "Duplicate Notion Template" to open in your personal Notion account',
        'Attach the exported link or PDF to your brand pitch emails',
      ],
    } as any,
  },
  {
    id: 'tp2', type: 'template', title: 'Content Calendar (Sheets)',
    desc: '12-month content calendar with auto-fill, analytics tracking and collaboration features.',
    category: 'Templates', icon: BarChart3, accent: '#10B981', plan: 'free', rating: 4.8,
    meta: 'Google Sheets', cta: 'Download Free', href: '/marketplace/item/tp2',
    tags: ['Calendar', 'Planning', 'Sheets'],
  },
  {
    id: 'tp3', type: 'template', title: 'Brand Deal Invoice Pack',
    desc: 'Professional invoice, contract and rate card templates for brand collaborations.',
    category: 'Templates', icon: Shield, accent: '#F59E0B', plan: 'silver', rating: 4.7,
    meta: 'PDF + DOCX Bundle', cta: 'Get Templates', href: '/marketplace/item/tp3',
    tags: ['Invoice', 'Contract', 'Legal'],
  },
  {
    id: 'tp4', type: 'template', title: 'YouTube Analytics Dashboard',
    desc: 'Powerful Sheets dashboard to track subscribers, views, RPM and channel growth over time.',
    category: 'Templates', icon: TrendingUp, accent: '#EF4444', plan: 'silver', rating: 4.8,
    meta: 'Google Sheets', cta: 'Get Template', href: '/marketplace/item/tp4',
    tags: ['Analytics', 'YouTube', 'Dashboard'],
  },
];
