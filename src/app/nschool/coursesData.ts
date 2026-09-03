import { Brain, Target, TrendingUp, Palette, BarChart3, Video, Rocket, Globe, Users, Shield, FileText, Zap } from 'lucide-react';

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  is_free: boolean;
  video_url?: string;
  description?: string;
}

export interface CourseSection {
  id: string;
  section_title: string;
  lessons: CourseLesson[];
}

export interface CourseItem {
  id: string | number;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  rating: number;
  students_count: number;
  instructor: string;
  category: string;
  plan: 'free' | 'silver' | 'gold' | 'platinum';
  accent: string;
  icon: any;
  short_desc: string;
  long_desc: string;
  outcomes: string[];
  curriculum: CourseSection[];
  tags: string[];
  featured?: boolean;
}

export const ALL_COURSES: Record<string, CourseItem> = {
  '1': {
    id: 1,
    title: 'ChatGPT for Script Writing',
    level: 'Beginner',
    duration: '45 min',
    rating: 4.9,
    students_count: 1240,
    instructor: 'Creator Nest AI Team',
    category: 'AI Tools',
    plan: 'free',
    accent: '#00F2FE',
    icon: Brain,
    short_desc: 'Master AI-powered scriptwriting with hooks, storytelling arcs, and viral formats using ChatGPT.',
    long_desc: 'This guide walks you through the exact ChatGPT prompts and frameworks used by top creators to write scripts that hook viewers in the first 5 seconds. Learn to build story arcs, create CTAs that convert, and adapt formats for YouTube, Reels, and Shorts.',
    outcomes: [
      'Write a full YouTube script in under 10 minutes using AI',
      'Create 5 different viral hook formulas for any niche',
      'Build a ChatGPT prompt library personalised to your voice',
      'Adapt scripts across platforms (YouTube, Reels, Shorts)',
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Getting Started',
        lessons: [
          { id: 'l1', title: 'Why AI Changes Scriptwriting Forever', duration: '5 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Setting Up ChatGPT for Creator Use', duration: '4 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l3', title: 'Your First AI Script (Live Demo)', duration: '8 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
      },
      {
        id: 's2',
        section_title: 'Hook Mastery & Narrative Arcs',
        lessons: [
          { id: 'l4', title: 'The 5 Hook Formulas That Go Viral', duration: '7 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l5', title: 'Adapting Hooks for Different Niches', duration: '5 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l6', title: 'The 3-Act Structure for YouTube', duration: '6 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
      },
      {
        id: 's3',
        section_title: 'Retention & Conversion',
        lessons: [
          { id: 'l7', title: 'Retention Loops and B-Roll Cues', duration: '5 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l8', title: 'CTA Writing That Actually Converts', duration: '5 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
      }
    ],
    tags: ['ChatGPT', 'Scripts', 'AI', 'YouTube', 'Hooks']
  },
  '2': {
    id: 2,
    title: 'Midjourney Thumbnail Mastery',
    level: 'Intermediate',
    duration: '1.5 hrs',
    rating: 4.8,
    students_count: 980,
    instructor: 'Visual Design Lab',
    category: 'Design & AI',
    plan: 'silver',
    accent: '#8B5CF6',
    icon: Palette,
    short_desc: 'Create scroll-stopping thumbnails with Midjourney. Learn prompting, style tuning, and A/B testing workflows.',
    long_desc: 'Thumbnails decide 80% of your click-through rate. In this course, learn how to prompt Midjourney v6 for photorealistic creator faces, glowing futuristic elements, 3D typography backgrounds, and high-CTR color palettes.',
    outcomes: [
      'Generate ultra-realistic thumbnail assets in Midjourney v6',
      'Master lighting, camera angles, and character consistency',
      'Integrate AI backgrounds with Photoshop text overlays',
      'Run data-backed A/B testing on YouTube Studio'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Midjourney Foundations',
        lessons: [
          { id: 'l1', title: 'Setting Up Discord & Midjourney v6', duration: '6 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Parameters That Matter: --ar 16:9 and --style raw', duration: '8 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
      },
      {
        id: 's2',
        section_title: 'High-CTR Prompt Engineering',
        lessons: [
          { id: 'l3', title: 'Curiosity-Inducing Lighting & Composition', duration: '12 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l4', title: 'Consistent Character Faces with --cref', duration: '15 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l5', title: 'Final Polish in Photoshop / Photopea', duration: '10 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Midjourney', 'Thumbnails', 'Design', 'CTR']
  },
  '3': {
    id: 3,
    title: 'AI Video Generation with Runway & Sora',
    level: 'Advanced',
    duration: '2 hrs',
    rating: 4.7,
    students_count: 750,
    instructor: 'Future Media Studio',
    category: 'Video AI',
    plan: 'gold',
    accent: '#EF4444',
    icon: Video,
    short_desc: 'Produce cinematic B-roll and effects using Runway Gen-3 and Sora. No camera required.',
    long_desc: 'Take your video production to the next level by generating hyper-realistic cinematic B-roll, motion graphics, and surreal visual sequences using Runway Gen-3 Alpha, Pika Labs, and OpenAI Sora models.',
    outcomes: [
      'Direct cinematic camera movements using Gen-3 motion brush',
      'Create high-end commercial B-roll without a film crew',
      'Seamlessly blend AI clips into timeline edits in Premiere / DaVinci'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Generative Video Tools',
        lessons: [
          { id: 'l1', title: 'The Generative Video Landscape in 2026', duration: '7 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Runway Gen-3 Prompting & Motion Controls', duration: '14 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l3', title: 'Upscaling & Color Grading AI Footage', duration: '12 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Runway', 'Sora', 'Video AI', 'B-Roll']
  },
  '4': {
    id: 4,
    title: 'Landing Your First Brand Deal',
    level: 'Beginner',
    duration: '1 hr',
    rating: 4.9,
    students_count: 870,
    instructor: 'Creator Nest Partnerships',
    category: 'Brand Deals',
    plan: 'free',
    accent: '#F59E0B',
    icon: Target,
    short_desc: 'Step-by-step playbook to pitch brands, negotiate rates, and close your first paid collaboration.',
    long_desc: 'Even with under 10K followers, you can land paid brand deals. This playbook breaks down exactly how to find the right brands, build a professional pitch, set your rates, and close deals using email and DMs.',
    outcomes: [
      'Build a cold pitch that gets replies within 48 hours',
      'Set your rate card based on engagement metrics',
      'Negotiate your first deal without feeling awkward',
      'Create a media kit brands actually save',
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Foundation',
        lessons: [
          { id: 'l1', title: 'What Brands Actually Look For', duration: '6 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Finding Your Perfect Brand Match', duration: '5 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
      },
      {
        id: 's2',
        section_title: 'The Pitch & Rates',
        lessons: [
          { id: 'l3', title: 'Building Your Rate Card', duration: '7 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l4', title: 'Writing Cold Pitch Emails That Convert', duration: '8 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l5', title: 'Negotiation & Contract Terms 101', duration: '8 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
      }
    ],
    tags: ['Brand Deals', 'Pitching', 'Negotiation', 'Media Kit']
  },
  '5': {
    id: 5,
    title: 'Rate Card & Media Kit Builder',
    level: 'Beginner',
    duration: '50 min',
    rating: 4.8,
    students_count: 620,
    instructor: 'Creator Nest Business Lab',
    category: 'Brand Deals',
    plan: 'free',
    accent: '#00F2FE',
    icon: FileText,
    short_desc: 'Build a professional rate card and media kit that commands premium pricing. Includes free templates.',
    long_desc: 'Learn how to present your audience demographics, engagement rates, past case studies, and package pricing so marketing managers can approve deals immediately.',
    outcomes: [
      'Calculate CPM and deliverable-based pricing',
      'Design a modern 1-page media kit PDF and Notion page',
      'Position multi-platform package bundles'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Media Kit Blueprint',
        lessons: [
          { id: 'l1', title: 'The Essential 5 Sections of a Media Kit', duration: '8 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Customizing the Creator Nest Template', duration: '12 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
      }
    ],
    tags: ['Rate Card', 'Media Kit', 'Pricing']
  },
  '6': {
    id: 6,
    title: 'Long-Term Brand Partnerships',
    level: 'Intermediate',
    duration: '1.5 hrs',
    rating: 4.7,
    students_count: 510,
    instructor: 'Brand Advisory Team',
    category: 'Monetization',
    plan: 'silver',
    accent: '#F59E0B',
    icon: Shield,
    short_desc: 'Move beyond one-off deals. Learn retention strategies, exclusivity clauses, and ambassador frameworks.',
    long_desc: 'One-off sponsored videos leave money on the table. Turn single sponsorships into 6-month ambassador retainers that guarantee monthly revenue.',
    outcomes: [
      'Structure 3-month to 12-month retainer deals',
      'Understand usage rights, whitelisting, and exclusivity',
      'Deliver ROI recap reports that secure renewals'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Ambassador Frameworks',
        lessons: [
          { id: 'l1', title: 'Why Retainers Are Better for Both Sides', duration: '9 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Drafting the Retainer Proposal', duration: '14 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Retention', 'Ambassador', 'Strategy']
  },
  '7': {
    id: 7,
    title: 'Creator Quick Start: 0 to First Video',
    level: 'Beginner',
    duration: '30 min',
    rating: 5.0,
    students_count: 2100,
    instructor: 'Community Launch Team',
    category: 'Growth',
    plan: 'free',
    accent: '#10B981',
    icon: Rocket,
    short_desc: 'Everything to publish your first professional video — gear, editing, SEO, and distribution in one checklist.',
    long_desc: 'Overcome analysis paralysis. This 30-minute quick start guides you step-by-step from zero to your first published video with high quality.',
    outcomes: [
      'Set up basic lighting, audio, and camera settings on your smartphone',
      'Follow the frictionless editing checklist',
      'Publish with optimal SEO tags and metadata'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Quickstart Checklist',
        lessons: [
          { id: 'l1', title: 'Overcoming the Camera Hesitation', duration: '5 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Smartphone Setup: Lighting & Audio Secrets', duration: '8 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l3', title: 'Publishing Your First Video Live', duration: '7 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Setup', 'First Video', 'Checklist']
  },
  '8': {
    id: 8,
    title: 'Channel Setup & Branding Blueprint',
    level: 'Beginner',
    duration: '40 min',
    rating: 4.8,
    students_count: 890,
    instructor: 'Brand Strategy Studio',
    category: 'Branding',
    plan: 'free',
    accent: '#6366F1',
    icon: Globe,
    short_desc: 'Set up your YouTube channel, Instagram bio, and cross-platform branding like a pro from Day 1.',
    long_desc: 'Design a cohesive visual identity across YouTube, Instagram, X, and TikTok with high-converting banner layouts, bio formulas, and logo guidelines.',
    outcomes: [
      'Design channel banners that clearly communicate your value proposition',
      'Write Instagram and YouTube bios that convert viewers into followers',
      'Organize playlists and featured sections for maximum binge-watching'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Visual Identity',
        lessons: [
          { id: 'l1', title: 'Channel Banners That Sell Your Channel in 3 Seconds', duration: '8 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Structuring YouTube Layout & Playlists', duration: '10 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Branding', 'Setup', 'Identity']
  },
  '9': {
    id: 9,
    title: 'YouTube Algorithm Deep Dive',
    level: 'Intermediate',
    duration: '2 hrs',
    rating: 4.9,
    students_count: 1450,
    instructor: 'Creator Nest Analytics Team',
    category: 'Analytics',
    plan: 'silver',
    accent: '#EF4444',
    icon: TrendingUp,
    short_desc: 'Data-driven strategies to master the YouTube algorithm — impressions, CTR, and AVD.',
    long_desc: 'Unlock the mechanics of the YouTube recommendation system. Discover how CTR and Average View Duration interact to trigger browse features and suggested video surges.',
    outcomes: [
      'Decode YouTube Studio analytics to identify retention drops',
      'Optimize Click-Through Rate (CTR) and Average View Duration (AVD)',
      'Trigger the Suggested Videos algorithm systematically'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'The Algorithm Mechanics',
        lessons: [
          { id: 'l1', title: 'How Browse vs Suggested vs Search Works', duration: '12 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'CTR Benchmarks by Impressions & Niche', duration: '15 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l3', title: 'Retention Engineering: Fixing the 30-Second Dropoff', duration: '18 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Algorithm', 'YouTube', 'Analytics']
  },
  '10': {
    id: 10,
    title: 'Instagram Reels Growth System',
    level: 'Beginner',
    duration: '1 hr',
    rating: 4.7,
    students_count: 1100,
    instructor: 'Shorts & Reels Lab',
    category: 'Growth',
    plan: 'free',
    accent: '#EC4899',
    icon: Zap,
    short_desc: 'A systematic approach to Reels — trending audio, hooks, and posting cadence.',
    long_desc: 'Build a repeatable workflow for Instagram Reels that captures 100K+ organic views. Master audio trends, visual text placement, and caption SEO.',
    outcomes: [
      'Identify audio trends before they peak',
      'Create 3-second visual scroll-stoppers',
      'Optimize Reels descriptions for Instagram Search'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Reels Growth Framework',
        lessons: [
          { id: 'l1', title: 'The Anatomy of a 1M View Reel', duration: '8 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Trending Audio Hacks and Timing', duration: '9 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Reels', 'Instagram', 'Growth']
  },
  '11': {
    id: 11,
    title: 'Professional Lighting on a Budget',
    level: 'Beginner',
    duration: '1 hr',
    rating: 4.6,
    students_count: 580,
    instructor: 'Studio Production Lab',
    category: 'Production',
    plan: 'free',
    accent: '#F59E0B',
    icon: Video,
    short_desc: 'Achieve studio-quality lighting with affordable gear. Three-point setups and natural light hacks.',
    long_desc: 'Good lighting transforms an ordinary webcam or smartphone into a cinema-level visual. Learn three-point lighting, practical background lamps, and color temperatures.',
    outcomes: [
      'Set up key, fill, and rim lights on any budget',
      'Diffuse hard light for smooth cinematic skin tones',
      'Create mood with RGB accent lights and background contrast'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Lighting Fundamentals',
        lessons: [
          { id: 'l1', title: 'The 3-Point Lighting Rule Explained', duration: '7 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Budget Lighting Gear Under ₹3,000', duration: '10 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Lighting', 'Budget', 'Quality']
  },
  '12': {
    id: 12,
    title: 'DaVinci Resolve Masterclass',
    level: 'Advanced',
    duration: '4 hrs',
    rating: 4.9,
    students_count: 940,
    instructor: 'Hollywood Post Team',
    category: 'Editing',
    plan: 'gold',
    accent: '#8B5CF6',
    icon: Video,
    short_desc: 'Professional video editing with free software used by Hollywood editors.',
    long_desc: 'Learn DaVinci Resolve 19 from the ground up: Cut page speed-editing, Fusion motion graphics, Fairlight audio mastering, and Color grading with PowerGrades.',
    outcomes: [
      'Edit 5x faster using shortcuts and ripple trim workflows',
      'Master color grading using nodes and LUTs',
      'Master voice cleanup and background music leveling in Fairlight'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Editing Workflow & Color Grading',
        lessons: [
          { id: 'l1', title: 'DaVinci Interface & Cut Page Speed', duration: '15 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Color Wheels, Curves, and LUTs', duration: '22 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['DaVinci', 'Editing', 'Color']
  },
  '13': {
    id: 13,
    title: 'Monetization Beyond AdSense',
    level: 'Intermediate',
    duration: '1.5 hrs',
    rating: 4.8,
    students_count: 730,
    instructor: 'Creator Wealth Lab',
    category: 'Monetization',
    plan: 'silver',
    accent: '#10B981',
    icon: BarChart3,
    short_desc: 'Diversify revenue: memberships, merch, digital courses, affiliate, and licensing.',
    long_desc: 'Don’t rely purely on AdSense. Build a diversified creator business model with high-margin digital products, affiliate funnels, and paid communities.',
    outcomes: [
      'Launch a digital download or template store in 48 hours',
      'Set up affiliate recommendation funnels with 15%+ conversion',
      'Design recurring membership tiers that retain members'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Revenue Diversification',
        lessons: [
          { id: 'l1', title: 'The 5 Creator Income Streams', duration: '10 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Launching High-Ticket Digital Products', duration: '16 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Revenue', 'Monetization', 'Business']
  },
  '14': {
    id: 14,
    title: 'Building a Community That Pays',
    level: 'Advanced',
    duration: '2 hrs',
    rating: 4.7,
    students_count: 460,
    instructor: 'Community Growth Studio',
    category: 'Community',
    plan: 'gold',
    accent: '#EC4899',
    icon: Users,
    short_desc: 'Turn followers into superfans. Discord strategies, membership tiers, and community-led content.',
    long_desc: 'Create an engaged Discord/Telegram community where members actively help each other and happily pay for exclusive live events and mastermind sessions.',
    outcomes: [
      'Set up Discord roles, channels, and automation bots',
      'Host interactive monthly live Q&As that drive retention',
      'Turn active community members into brand ambassadors'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Community Strategy',
        lessons: [
          { id: 'l1', title: 'Why Followers != Community', duration: '8 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Setting Up Premium Discord & Membership', duration: '14 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Community', 'Membership', 'Superfans']
  },
  '15': {
    id: 15,
    title: 'AI Voiceover & Dubbing Tools',
    level: 'Intermediate',
    duration: '1 hr',
    rating: 4.6,
    students_count: 590,
    instructor: 'AI Voice Lab',
    category: 'AI Tools',
    plan: 'silver',
    accent: '#00F2FE',
    icon: Brain,
    short_desc: 'Clone your voice, auto-dub in 50+ languages, and create faceless content using ElevenLabs.',
    long_desc: 'Expand to global audiences by auto-dubbing your content in Spanish, Hindi, German, and Portuguese using ElevenLabs and HeyGen voice-cloning technology.',
    outcomes: [
      'Create high-fidelity AI voice clones with emotion modulation',
      'Translate and lip-sync video content automatically',
      'Produce faceless YouTube channels with AI voice actors'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Voice Cloning & Global Dubbing',
        lessons: [
          { id: 'l1', title: 'ElevenLabs Setup & Voice Training', duration: '9 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Multi-Language Dubbing Workflows', duration: '12 min', is_free: false, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Voiceover', 'Dubbing', 'ElevenLabs']
  },
  '16': {
    id: 16,
    title: 'Collaboration & Cross-Promotion Playbook',
    level: 'Beginner',
    duration: '45 min',
    rating: 4.8,
    students_count: 670,
    instructor: 'Creator Network Advisory',
    category: 'Growth',
    plan: 'free',
    accent: '#10B981',
    icon: Users,
    short_desc: 'Find the right collab partners, structure win-win deals, and cross-promote to double your reach.',
    long_desc: 'Collaborations are the fastest organic growth hack on YouTube and Instagram. Learn how to pitch peer creators, co-create viral videos, and exchange audiences.',
    outcomes: [
      'Identify peer creators in complementary niches',
      'Pitch collaboration concepts with mutual subscriber benefits',
      'Execute cross-channel premieres and co-hosted livestreams'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Collab Playbook',
        lessons: [
          { id: 'l1', title: 'Finding Your Perfect Collab Peers', duration: '7 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Executing the Win-Win Video Formula', duration: '11 min', is_free: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ],
    tags: ['Collab', 'Cross-Promo', 'Networking']
  },
  '17': {
    id: 17,
    title: 'Understand Brand Deals: The Complete Creator Sponsorship Blueprint',
    level: 'All Levels',
    duration: '1 hr 15 min · Reading Course',
    rating: 5.0,
    students_count: 2450,
    instructor: 'Creator Nest Sponsorship Advisory',
    category: 'Monetization',
    plan: 'free',
    accent: '#10B981',
    icon: Target,
    featured: true,
    short_desc: 'Master creator brand deals: Barter vs Paid, Deliverable Rates in ₹, 70/30 Pricing Formula, Media Kits, Commercial Add-Ons & Cold Pitching.',
    long_desc: 'Whether you are a Nano creator with 2,000 followers or an established creator with 100,000 subscribers, this complete blueprint breaks down how commercial brand sponsorships operate.\n\nWritten in clear, professional, step-by-step English with real-world examples, commercial pricing models, contract terms, and copy-paste outreach templates to help you command premium rates and negotiate with confidence.',
    outcomes: [
      'Understand all sponsorship formats: Barter, Dedicated Videos, Integrated Mentions, Story Funnels & Retainers',
      'Calculate exact deliverable pricing using the scientific 70/30 Views + Follower Floor model in ₹',
      'Charge extra for commercial rights: Category Exclusivity (+50%), Meta Ad Whitelisting (+40-65%), and Reposting',
      'Decode common sponsorship terms: Media Kit, Scope of Work (SOW), ER%, Effective CPM, Net-30 Invoicing, and TDS',
      'Deploy high-converting cold email and Instagram DM pitch templates to land paid brand deals'
    ],
    curriculum: [
      {
        id: 's1',
        section_title: 'Module 1: Fundamentals of Creator Sponsorships',
        lessons: [
          {
            id: 'l1',
            title: '1.1 The Anatomy of a Brand Deal & Why Brands Invest in Creators',
            duration: '10 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 📌 Chapter 1.1: The Anatomy of a Brand Deal & Why Brands Invest in Creators

#### 1. What is a Brand Deal?
A **Brand Deal (or Creator Sponsorship)** is a commercial business agreement where a company pays a content creator either **Direct Cash (Sponsorship Fee)** or **High-Value Products** in exchange for featuring, reviewing, or promoting their product or service to the creator's audience.

As a creator, you integrate the brand into your content (such as a dedicated YouTube review, an integrated 60-second segment, an Instagram Reel, or an interactive Story set) and provide measurable visibility and traffic to the sponsor.

---

#### 2. Why Brands Shift Budgets from TV & Billboards to Creators
Traditional media (TV commercials, print ads, and static billboards) is rapidly losing efficacy. Forward-thinking marketing teams prefer creator partnerships for three fundamental reasons:

* **1. High Trust & Authentic Social Proof:** When an actor appears in a television advertisement, viewers inherently understand they were paid to read a script. In contrast, when a trusted creator tests and demonstrates a camera lens, a productivity tool, or a financial service, the audience perceives it as a genuine peer recommendation.
* **2. Laser-Targeted Niche Demographics:** If a SaaS company launches an AI coding assistant, a mass television commercial wastes over 95% of its budget on disinterested viewers. However, partnering with a software development creator whose videos average 25,000 views guarantees that nearly 100% of those impressions reach developers and tech enthusiasts with immediate buyer intent.
* **3. Measurable Return on Ad Spend (ROAS):** Digital sponsorships provide tracked attribution through custom UTM landing pages, trackable promo codes (e.g., \`CREATOR20\`), and referral links. Brands can measure click-through rates (CTR), conversion rates, and exact customer acquisition costs (CAC) in real time.

---

#### 3. The 3 Key Stakeholders in Every Sponsorship:
1. **The Brand (The Advertiser):** The corporate entity manufacturing or selling the product (e.g., Sony, Notion, Boat, Zerodha, Hostinger).
2. **The Agency / Middleman (PR & Influencer Marketing Agencies):** Many major brands do not handle creator outreach directly. Instead, they allocate a campaign budget (e.g., ₹20 Lakhs) to an agency, which identifies creators, negotiates rates, and coordinates deliverables.
3. **The Creator (The Publisher):** You—the independent media house providing creative production, audience attention, and brand advocacy.

---

#### 4. Inbound Opportunities vs. Outbound Pitching:
* **Inbound Deals:** When a brand or agency discovers your content organically and reaches out to your business email or direct messages.
* **Outbound Pitching:** When you proactively research target brands, locate marketing decision-makers, and submit a tailored creative pitch alongside your Media Kit. Nano and Micro creators generate over 70% of their early sponsorship revenue through structured outbound pitching.

---

### 💡 Core Industry Principle:
Brands do not buy your **Subscriber or Follower Count**—they pay for your **Verified 30-Day Average Views, Audience Engagement Rate, and Niche Purchasing Power**!`
          },
          {
            id: 'l2',
            title: '1.2 Industry Vocabulary & Core Metrics Decoded (CPM, CPV, ER, SOW)',
            duration: '10 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 📖 Chapter 1.2: Essential Sponsorship Terminology Decoded

When negotiating with brand managers and PR agencies, you will encounter standard corporate terminology. Mastering this vocabulary ensures you present yourself as a commercial professional:

---

| Metric / Term | Definition & Commercial Meaning | Practical Creator Example |
| :--- | :--- | :--- |
| **Media Kit** | A 1-to-2 page digital executive summary highlighting your audience demographics (age, gender, top cities), reach statistics, past brand case studies, and contact details. | *"Please find attached our updated Q3 Media Kit with verified channel analytics."* |
| **Deliverable** | The specific content asset(s) you are contracted to produce and publish (e.g., 1x Dedicated YouTube Video + 2x Instagram Reels). | *"The agreed deliverable is 1x 60-second Integrated Mid-Roll segment."* |
| **Scope of Work (SOW)** | The binding legal agreement detailing deliverable specifications, scripting guidelines, draft submission deadlines, revision rounds, and payment milestones. | *"We will commence video production once both parties sign the formal SOW."* |
| **Campaign Brief** | The brand's creative guideline outlining mandatory talking points, key value propositions, logo guidelines, and strict do's & don'ts. | *"Review the campaign brief to ensure all three product USPs are addressed."* |
| **Engagement Rate (ER%)** | Mathematical formula: \`((Total Likes + Comments + Shares) / Total Followers) * 100\`. Healthy benchmarks range from 3.5% to 7.0%. | *50,000 followers with 3,000 interactions yields a strong 6.0% ER.* |
| **CPM (Cost Per Mille)** | The advertising cost per 1,000 impressions or views. Formula: \`(Total Sponsorship Fee / Expected Views) * 1,000\`. | *A ₹40,000 deal on 20,000 views equals an effective CPM of ₹2,000.* |
| **CPV (Cost Per View)** | The monetary valuation assigned to each single organic view. Industry benchmarks: YouTube Long-Form (₹1.00–₹1.35) and Instagram Reels (₹0.80–₹1.10). | *20,000 average views at ₹1.15 CPV establishes a ₹23,000 base production rate.* |
| **Whitelisting (Dark Ads)** | Granting a brand backend advertising access to run paid Meta/Google ads directly through your social media handle. | *Always charge an additional +40% to +65% fee for whitelisting access.* |
| **Category Exclusivity** | A contractual clause barring you from promoting competing brands within the same commercial category for a specified duration (e.g., 30–60 days). | *Always charge a +30% to +50% premium for category exclusivity.* |
| **Net-30 / Net-45 Terms** | Corporate payment scheduling where funds are disbursed 30 or 45 calendar days following invoice submission. | *Standard corporate enterprise payment cycle in India.* |
| **TDS (Section 194J)** | Tax Deducted at Source: Indian companies deduct 10% (or 2% for technical services) before payment disbursement and remit it to your PAN credit on Form 26AS. | *On a ₹50,000 deal, you receive ₹45,000 net cash + ₹5,000 tax credit reclaimable via ITR.* |`
          }
        ]
      },
      {
        id: 's2',
        section_title: 'Module 2: Sponsorship Formats & Deliverable Structures',
        lessons: [
          {
            id: 'l3',
            title: '2.1 Barter Collaborations vs. Paid Deals (The 80% Value Rule)',
            duration: '12 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 🎁 Chapter 2.1: Barter Collaborations vs. Paid Deals

#### What is a Barter Sponsorship?
In a **Barter Deal (or Product Gifting Collaboration)**, the brand does not provide monetary compensation. Instead, they ship you physical goods or grant software licenses in exchange for a dedicated review, video integration, or social post.

---

### ⚠️ When to Accept a Barter Collaboration (The 80% Rule):
1. **The 80% MRP Valuation Rule:** Accept barter only if the product's verified retail market price exceeds **80% of your standard commercial rate**, and the product provides direct utility to your production.
   * *Example:* If your standard video fee is ₹25,000, and a brand provides a ₹55,000 Sony Camera Lens or a ₹35,000 Studio Lighting kit, this represents an advantageous high-value trade.
2. **Early Portfolio Construction (Nano Creators):** Creators with fewer than 3,000 followers can complete 2–3 high-quality product collaborations to showcase production capability on their initial Media Kit.
3. **Essential Hardware / Software Upgrades:** Items you would otherwise purchase out-of-pocket (e.g., pro audio gear, monitors, or premium software subscriptions).

---

### ❌ When to Reject Barter (Exploitation Red Flags):
* Low-ticket items (e.g., a ₹499 t-shirt, skin cream, or phone case) requesting multiple Reels, Stories, or full YouTube videos. **(Always decline lowball gifting).**
* "Sample Return" demands where the brand requests you ship the product back after filming. Never create content for temporary review samples without full commercial fees.

---

### 💡 The "Barter + Cash Hybrid" Counter-Script:
When a brand offers low-ticket products for heavy deliverables, pivot the negotiation into a paid hybrid structure:

> *"Hi [Brand Partnerships Team], thank you for reaching out! We appreciate your product offer. Because our standard production and post-editing overhead per dedicated video is ₹28,000, we would be delighted to accept the complimentary product (MRP ₹7,000) alongside a nominal cash production fee of ₹21,000 to cover our studio costs. Let us know if this hybrid structure works for your campaign timeline!"*`
          },
          {
            id: 'l4',
            title: '2.2 Dedicated Videos, Integrated Mentions, Story Funnels & Retainers',
            duration: '12 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 🎬 Chapter 2.2: The 4 Core Commercial Deliverable Formats

Each deliverable format commands distinct production effort, audience impact, and market pricing:

---

#### 1. 🌟 Dedicated Video / Dedicated Reel (100% Benchmark Rate — 1.0x Base)
* **Description:** An entire video (8–12 minutes on YouTube or a 60–90 second Instagram Reel) exclusively focused on the sponsor's product (e.g., Deep-Dive Tutorial, Product Comparison, or Unboxing).
* **Production Scope:** Comprehensive scripting, dedicated B-roll footage, on-screen demonstrations, and custom visual assets.
* **Pricing Benchmark:** This represents your **100% Anchor Rate** (e.g., ₹45,000 for 20K views in the Tech/SaaS space).

---

#### 2. ⚡ Integrated Mid-Roll Segment (55%–60% of Dedicated Rate — 0.55x Base)
* **Description:** You produce an organic, value-driven video on your standard topic (e.g., *"Top 5 Productivity Workflows for 2026"*), embedding a seamless 60–90 second sponsor integration in the middle third of the video.
* **Why Brands Love It:** Audience drop-off remains minimal, and the sponsor benefits from the full organic momentum of your high-performing content.
* **Pricing Benchmark:** **55% to 60% of your dedicated rate** (e.g., Dedicated ₹45,000 $\rightarrow$ Integrated ₹25,000).

---

#### 3. 📱 3-Frame Instagram Story Funnel (25%–35% of Base Rate — 0.35x Base)
* **Description:** A sequential three-story storytelling framework:
  * **Frame 1 (The Hook/Problem):** A poll or engaging question addressing an audience pain point.
  * **Frame 2 (The Solution):** Live demonstration or screenshot of the product solving the issue.
  * **Frame 3 (The CTA & Link):** Direct link sticker with a trackable discount code and urgency prompt.
* **Pricing Benchmark:** **30% to 35% of your base Reel rate** (e.g., ₹15,000).

---

#### 4. 🤝 Monthly Retainers & Brand Ambassador Partnerships (20%–25% Bulk Discount)
* **Description:** A recurring 3-to-6 month commercial contract (e.g., 2x YouTube Integrations + 4x Reels per month).
* **Creator Benefit:** Guaranteed, predictable monthly cash flow (e.g., ₹80,000/month recurring income).
* **Brand Benefit:** Extended brand recall, sustained customer acquisition, and a 20% to 25% volume discount over one-off bookings.`
          }
        ]
      },
      {
        id: 's3',
        section_title: 'Module 3: Scientific Pricing & Deliverable Valuation',
        lessons: [
          {
            id: 'l5',
            title: '3.1 The 70/30 Pricing Formula: Follower Floors vs. Real 30-Day Views',
            duration: '15 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 🧮 Chapter 3.1: The Mathematical Formula Behind Creator Pricing

Professional media buying agencies and Creator Nest calculate deliverable pricing using an objective, data-backed algorithm:

$$\\text{Total 1-Deal Rate} = \\Big(\\text{Avg 30-Day Views} \\times \\text{Platform CPV} \\times \\text{Niche Factor} \\times \\text{City Tier} \\times \\text{ER Factor}\\Big)$$

---

### 1. Platform CPV (Cost Per View) Benchmarks:
* **YouTube Long-Form Video:** **₹1.15 per view** (Reflects search longevity, high viewer intent, and deep retention).
* **Instagram Reel / YouTube Short:** **₹0.90 per view** (Reflects viral algorithm distribution and rapid consumption).

---

### 2. The 70/30 Safe-Floor Pricing Model:
To protect creators whose recent videos experience temporary view variance, top talent agencies blend **70% Dynamic 30-Day Views + 30% Follower Tier Floor**:

| Creator Tier | Follower / Subscriber Range | Standard 1-Deal Commercial Pricing Band |
| :--- | :--- | :--- |
| **Sub-Nano** | Under 1,000 Followers | ₹500 – ₹2,500 per deal |
| **Nano** | 1,000 – 10,000 Followers | ₹2,500 – ₹10,000 per deal |
| **Micro** | 10,000 – 100,000 Followers | ₹10,000 – ₹85,000 per deal |
| **Mid-Tier** | 100,000 – 500,000 Followers | ₹60,000 – ₹3,50,000 per deal |
| **Macro** | 500,000 – 1,000,000 Followers | ₹1,50,000 – ₹8,00,000 per deal |
| **Mega / Celebrity** | 1,000,000+ Followers | ₹5,00,000 – ₹50,00,000+ per deal |

---

### 🎯 Pro Tip:
Use our interactive **Brand Deal Price Calculator** to generate instant, customized 1-deal quotes based on your exact social handle and engagement metrics!`
          },
          {
            id: 'l6',
            title: '3.2 The 13 Niche Multipliers: Why Tech & Finance Pay +67% Higher',
            duration: '12 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 📊 Chapter 3.2: The Niche Gap Explained (Why Tech Pays +67% More)

A common misconception among beginner creators is that two channels with 50,000 followers earn identical sponsorship fees. **This is commercially inaccurate.**

---

### All 13 Creator Niches & Their Commercial Multipliers:

| Niche Category | Commercial Multiplier | Example Payout (50K Followers, 20K Views) | Primary High-Budget Advertisers |
| :--- | :--- | :--- | :--- |
| **1. Finance & Stock Market** | **2.00x** | **₹60,000** | Demat Brokers, Credit Cards, Mutual Funds, Wealth Apps |
| **2. Crypto & Web3** | **1.80x** | **₹54,000** | Crypto Exchanges, Hardware Wallets, Global Protocols |
| **3. Tech, SaaS & AI Tools** | **1.50x** | **₹45,000** | Laptops, Enterprise SaaS, AI Tools, Cloud Hosting |
| **4. Health & Fitness** | **1.40x** | **₹42,000** | Whey Protein, Fitness Trackers, Gym Apparel, Supplements |
| **5. Beauty & Skincare** | **1.35x** | **₹40,500** | D2C Skincare, Premium Cosmetics, Haircare Systems |
| **6. Fashion & Lifestyle** | **1.30x** | **₹39,000** | E-Commerce Brands, Watches, Footwear, Fragrances |
| **7. EdTech & Career** | **1.25x** | **₹37,500** | Coding Bootcamps, Degree Programs, Professional Certifications |
| **8. Gaming & Esports** | **1.20x** | **₹36,000** | Gaming Hardware, Peripherals, Monitors, Game Publishers |
| **9. Food & Culinary** | **1.15x** | **₹34,500** | Kitchen Appliances, Food Delivery Platforms, Specialty Foods |
| **10. Travel & Tourism** | **1.10x** | **₹33,000** | Hotel Chains, Booking Portals, Airlines, Luggage Brands |
| **11. Parenting & Family** | **1.05x** | **₹31,500** | Baby Nutrition, Diapers, Educational Toys, Family Apps |
| **12. General Lifestyle** | **1.00x** | **₹30,000** | FMCG Brands, Home Decor, Beverage Products |
| **13. Comedy & Entertainment** | **0.90x** | **₹27,000** | Mass Apps, OTT Platforms, Consumer Goods |

---

### 💡 Buyer Intent Psychology:
A Finance or Tech subscriber has substantial disposable income and specific purchasing intent (e.g., investing ₹50,000 or buying an ₹80,000 laptop). Because conversion value is high, brands willingly pay 67% to 120% premiums for high-intent audiences over general entertainment views.`
          }
        ]
      },
      {
        id: 's4',
        section_title: 'Module 4: Commercial Rights, Legal Terms & Scam Defense',
        lessons: [
          {
            id: 'l7',
            title: '4.1 High-Value Commercial Add-Ons (Exclusivity, Whitelisting & Reposting)',
            duration: '10 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 🛡️ Chapter 4.1: Commercial Add-Ons (Never Give Rights for Free)

PR agencies frequently bundle high-value legal commercial rights into base production agreements. Always itemize and charge separate fees for these three commercial add-ons:

---

#### 1. 🚫 Category Exclusivity (Charge +30% to +50% Extra)
* **What it is:** A contractual clause prohibiting you from promoting any competing brand in the sponsor's commercial sector for 30, 60, or 90 days (e.g., if you sign with Boat, you cannot accept sponsorships from Noise, Sony, or JBL during that window).
* **Why You Must Charge:** You are actively turning down competing revenue opportunities during the exclusivity window.
* **Standard Pricing Formula:** **Add +30% to +50% on top of the base deliverable fee**.

---

#### 2. 📢 Meta / YouTube Ad Whitelisting (Charge +40% to +65% Extra)
* **What it is:** Granting the brand advertiser access to run paid ads through your personal Instagram or YouTube account via Meta Ads Manager or Google Ads.
* **Why You Must Charge:** The sponsor leverages your personal face and audience trust to drive massive commercial sales.
* **Standard Pricing Formula:** **Add +40% to +65% extra fee for a 30-to-60 day ad run**.

---

#### 3. 🌐 Brand Reposting & Website Usage Rights (Charge +25% to +35% Extra)
* **What it is:** The brand downloads your video/Reel and hosts it on their official company Instagram page, Amazon product listing, or homepage landing page.
* **Standard Pricing Formula:** **Add +25% to +35% additional licensing fee**. Never grant perpetual (lifetime) usage rights without substantial compensation.`
          },
          {
            id: 'l8',
            title: '4.2 Professional Invoicing, TDS (Section 194J), GST & Scam Protection',
            duration: '10 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 💼 Chapter 4.2: Invoicing, Taxation & Scam Defense for Creators

#### 1. Professional Invoicing Standards:
Upon completing any campaign deliverable, submit a formal PDF invoice containing:
* **Your Legal Full Name, Registered Address & PAN Number**
* **Invoice Reference Number & Issue Date** (e.g., \`INV-2026-001\`)
* **Banking Details:** Account Holder Name, Account Number, Bank Name, and IFSC Code
* **Itemized Deliverable Breakdown:** (e.g., *"1x Dedicated 4K Review Video for [Brand Name] - ₹45,000"*)

---

#### 2. Understanding TDS (Tax Deducted at Source) under Section 194J:
* Under Indian tax law, corporate entities paying creators for professional services deduct **10% TDS (or 2% for specific technical classifications)** and remit it directly to the Income Tax Department against your PAN.
* *Example:* On a ₹50,000 invoice, the company deposits **₹45,000** into your bank account and credits **₹5,000** to your government tax ledger.
* Following each financial quarter, request your **Form 16A** certificate. When filing your annual Income Tax Return (ITR), this full TDS amount is credited against your liability or refunded directly to your bank account if your total income is within the non-taxable slab.

---

#### 3. GST Thresholds for Digital Creators:
* If your aggregate annual turnover across all revenue streams (AdSense, Sponsorships, Affiliate commissions) is **under ₹20 Lakhs per year**, GST registration is optional.
* Once your annual revenue crosses ₹20 Lakhs, GST registration is legally mandatory, and you must add +18% GST to your invoices.

---

#### 4. ⚠️ Top 3 Sponsorship Scams to Avoid:
1. **The Malware File Attachment (.exe / .zip / .scr):** A malicious actor poses as a brand offering a collaboration: *"Please download our beta software from this zip file to review it"*. Launching the file executes a session-hijacking script that compromises your channel credentials. Never open executable files from unknown emails.
2. **"Registration Fee" Fake Agencies:** Any agency requiring creators to pay an upfront "onboarding" or "membership fee" (₹500–₹2,000) is a fraud. Legitimate agencies earn their fee from brand commissions, never from creator fees.
3. **90-Day Unsecured Payment Terms:** Avoid Net-90 or Net-120 payment terms without an upfront token advance (at least 30% to 50% deposit before filming).`
          }
        ]
      },
      {
        id: 's5',
        section_title: 'Module 5: Outbound Pitching & High-Stakes Negotiation',
        lessons: [
          {
            id: 'l9',
            title: '5.1 High-Converting Cold Email & Instagram DM Pitch Templates',
            duration: '10 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### ✉️ Chapter 5.1: High-Converting Outreach Pitch Templates

Customize these battle-tested pitch templates with your specific channel metrics to reach marketing decision-makers and PR agencies:

---

### 📧 Template 1: High-Converting Cold Email (YouTube & Tech/SaaS)

**Subject:** Collaboration Concept: [Your Channel Name] x [Brand Name] (Reaching [Monthly Views] [Your Niche] Viewers)

---

**Hi [Marketing Manager Name / Brand Partnerships Team],**

I have been actively utilizing **[Brand Name]** for my own creative workflows over the past few months, and our dedicated audience of **[Your Niche: e.g., Software Engineers & Tech Creators]** frequently asks for recommendations on **[Specific Problem Product Solves]**.

I run **[Your Channel Name & Hyperlink]**, where we generate **[e.g., 140,000+ monthly views]** with an average retention rate exceeding 75% and concentrated viewership across Tier-1 Indian tech hubs.

We are currently scripting a high-intent video scheduled for next month:
📌 **Upcoming Video Title:** *"[Insert Catchy Upcoming Video Title]"*

I would love to seamlessly integrate **[Brand Name]** as a dedicated 60-second mid-roll segment demonstrating how [Specific Feature] helps our viewers save time and boost productivity.

**Our Channel At A Glance:**
• **Monthly Impressions:** 1.5M+
• **Core Audience:** 18–34 Tech & Creative Professionals (84% India, 65% Tier-1 Cities)
• **Average Dedicated Reach:** [e.g., 20,000 – 35,000 organic views]
• **Verified Media Kit & Case Studies:** [Link to your 1-page PDF media kit]

Would you be open to reviewing a 1-page storyboard and rate breakdown this week?

Warm regards,  
**[Your Full Name]**  
*Creator, [Your Channel Name]*  
*WhatsApp: +91 XXXXXXXXXX | Email: creator@gmail.com*

---

### 📱 Template 2: Direct Instagram DM Pitch to PR Managers

> *"Hi [Brand Team / Name]! 👋 Congratulations on the recent launch of [Product Name]. I manage @[YourHandle] (50K+ highly engaged followers in the [Your Niche] space). We are currently planning an upcoming content series on [Topic] that aligns directly with your target customer base. I would love to send over our 1-page Media Kit and creative deliverable proposals. Which marketing email should I direct our formal deck to? Thank you!"*`
          },
          {
            id: 'l10',
            title: '5.2 Overcoming Lowball Offers & Agency Negotiation Frameworks',
            duration: '8 min read',
            is_free: true,
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: `### 💬 Chapter 5.2: Overcoming Lowball Offers & Agency Negotiation Frameworks

When a PR agency responds with: *"We love your profile, but our total campaign budget is only ₹10,000 (when your rate is ₹30,000)"*, do not immediately accept or outright reject. Use these three strategic negotiation frameworks:

---

#### 1. Strategy A: Reduce Deliverable Scope (Scope Down, Never Discount Rate)
If you slash your price in half without reducing deliverables, the agency assumes your original rate was artificial. Always adjust the deliverable scope:
> *"Hi Team, we completely understand your current campaign budget constraints! While our standard Dedicated Video rate is fixed at ₹30,000 to maintain high production quality, we can gladly offer a 45-second Integrated Mid-Roll segment or an Instagram 3-Frame Story Funnel for ₹12,000 within your budget. Let us know if this deliverable fits your current campaign objectives!"*

---

#### 2. Strategy B: Multi-Month Volume Bundling:
> *"If budget is tight for a single activation, we can bundle 3 monthly integrations across the upcoming quarter for ₹65,000 (providing your brand with a 25% volume savings). This guarantees continuous exposure for your product across 90 days."*

---

#### 3. Strategy C: Ground Negotiations in Verified Benchmark Data:
> *"Based on our channel's 22,000 average verified views and 6.4% engagement rate in the Tech/AI niche, our rate card is aligned with standard 2026 industry benchmarks (₹1.80–₹2.20 CPM) to guarantee strong conversion and positive ROAS for your brand."*`
          }
        ]
      }
    ],
    tags: ['Brand Deals', 'Sponsorship', 'Pricing', 'Media Kit', 'Monetization', 'Creator Skool']
  }
};

// Also support 'c1', 'c2', etc. mapping to '1', '2'
Object.keys(ALL_COURSES).forEach(numKey => {
  ALL_COURSES['c' + numKey] = { ...ALL_COURSES[numKey], id: 'c' + numKey };
});

export const getCourseById = (id: string | number): CourseItem | undefined => {
  const cleanId = String(id).replace(/^c/, '');
  return ALL_COURSES[String(id)] || ALL_COURSES[cleanId] || Object.values(ALL_COURSES).find(c => String(c.id) === String(id) || String(c.title).toLowerCase() === String(id).toLowerCase() || (String(id).includes('brand-deal') && c.id === 17));
};

