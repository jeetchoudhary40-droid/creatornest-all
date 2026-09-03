/* ─── Types ─── */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Download {
  name: string;
  size: string;
  type: 'pdf' | 'zip' | 'pptx' | 'xlsx';
}

export interface Slide {
  title: string;
  bullets: string[];
  highlight?: string;
}

export type BlogBlock =
  | { type: 'heading'; content: string }
  | { type: 'text'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; content: string; variant: 'tip' | 'warning' | 'info' }
  | { type: 'code'; content: string };

export interface Lesson {
  id: number;
  title: string;
  type: 'video' | 'slides' | 'blog';
  duration: string;
  description: string;
  videoUrl?: string;
  slides?: Slide[];
  blogContent?: BlogBlock[];
  quiz: QuizQuestion[];
  downloads?: Download[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  totalDuration: string;
  rating: number;
  studentsEnrolled: number;
  tags: string[];
  lessons: Lesson[];
}

/* ─── Course Data ─── */
export const courses: Course[] = [
  {
    id: 1,
    title: 'ChatGPT for Script Writing',
    description: 'Master AI-powered scriptwriting — hooks, storytelling arcs, and viral formats using ChatGPT prompts built for creators.',
    instructor: 'Creator Nest Team',
    category: 'AI Tools',
    level: 'Beginner',
    totalDuration: '45 min',
    rating: 4.9,
    studentsEnrolled: 1240,
    tags: ['ChatGPT', 'Scripts', 'AI'],
    lessons: [
      {
        id: 1, title: 'Welcome to AI Script Writing', type: 'video', duration: '8 min',
        description: 'Learn why AI-powered scriptwriting is the future of content creation and how ChatGPT can 10x your output without losing authenticity.',
        quiz: [
          { question: 'What is the primary advantage of using AI for scriptwriting?', options: ['It replaces human creativity entirely', 'It accelerates ideation and drafting while you add your voice', 'It only works for short-form content', 'It generates thumbnails automatically'], correctIndex: 1, explanation: 'AI is a creative accelerator — it handles the heavy lifting of drafting so you can focus on adding your unique perspective and voice.' },
          { question: 'Which AI model is recommended for script writing in this course?', options: ['DALL-E', 'Midjourney', 'ChatGPT (GPT-4)', 'Stable Diffusion'], correctIndex: 2, explanation: 'ChatGPT with GPT-4 excels at understanding context, tone, and structure — making it ideal for scriptwriting.' },
        ],
      },
      {
        id: 2, title: 'Prompt Engineering for Creators', type: 'slides', duration: '12 min',
        description: 'The art of crafting prompts that give you exactly the script output you need — from hooks to full narratives.',
        slides: [
          { title: 'What is Prompt Engineering?', bullets: ['The practice of designing inputs to get optimal AI outputs', 'Think of it as "directing" the AI like a film director', 'Better prompts = better scripts, every single time'], highlight: '💡 A well-crafted prompt can save you 3+ hours per video' },
          { title: 'The RICE Framework', bullets: ['Role — Tell ChatGPT who it should be', 'Instructions — Be specific about format & length', 'Context — Share your niche, audience, and tone', 'Examples — Provide sample outputs you like'], highlight: '🎯 Always start with: "You are a [role] writing for [audience]"' },
          { title: 'Hook Prompt Patterns', bullets: ['The Curiosity Gap: "Write a hook that creates mystery around [topic]"', 'The Bold Claim: "Start with a surprising statistic about [topic]"', 'The Story Loop: "Begin with a 2-sentence personal anecdote about [topic]"', 'The Direct Challenge: "Open by challenging a common belief about [topic]"'] },
          { title: 'Script Structure Prompts', bullets: ['Use chain-of-thought: break scripts into Hook → Story → Teaching → CTA', 'Specify duration: "Write a script for a 10-minute YouTube video"', 'Request formatting: "Add [B-ROLL] and [CUT TO] markers"', 'Set the tone: "Conversational, like explaining to a friend"'] },
          { title: 'Iteration & Refinement', bullets: ['Never accept the first output — iterate 2-3 times minimum', 'Use "Make it more [adjective]" to fine-tune tone', 'Ask ChatGPT to critique its own output, then improve', 'Save your best prompts in a swipe file for reuse'], highlight: '⚡ Pro tip: Create a "System Prompt" template you reuse for every video' },
          { title: 'Common Mistakes to Avoid', bullets: ['Too vague: "Write me a script" (no context)', 'Too restrictive: Overly long prompts that confuse the model', 'No examples: Not showing the AI what "good" looks like', 'Copy-pasting raw output without adding your personality'] },
        ],
        quiz: [
          { question: 'What does the R in the RICE framework stand for?', options: ['Results', 'Role', 'Research', 'Review'], correctIndex: 1, explanation: 'R stands for Role — you tell ChatGPT what expert persona to adopt when writing your script.' },
          { question: 'How many times should you iterate on AI output minimum?', options: ['0 — first output is usually perfect', '1 time', '2-3 times', '10+ times'], correctIndex: 2, explanation: 'Iterating 2-3 times ensures the output matches your voice and quality standards without over-engineering.' },
        ],
        downloads: [{ name: 'RICE Prompt Template Pack', size: '2.4 MB', type: 'pdf' }],
      },
      {
        id: 3, title: 'Writing Viral Hooks with ChatGPT', type: 'blog', duration: '15 min',
        description: 'Deep dive into the anatomy of hooks that stop the scroll — with real ChatGPT prompts you can copy and use today.',
        blogContent: [
          { type: 'heading', content: 'Why Your First 5 Seconds Decide Everything' },
          { type: 'text', content: 'YouTube data shows that 70% of viewers decide whether to continue watching within the first 5 seconds. On Instagram Reels and TikTok, that window shrinks to just 1-2 seconds. Your hook is not just important — it IS the video for most viewers.' },
          { type: 'callout', content: 'Creators who improved their hooks saw an average 40% increase in Average View Duration (AVD) within 30 days.', variant: 'tip' },
          { type: 'heading', content: 'The 5 Hook Archetypes' },
          { type: 'list', items: [
            'The Curiosity Gap — "I discovered something about [topic] that nobody talks about…"',
            'The Bold Claim — "This one trick will change how you [action] forever."',
            'The Relatable Pain — "If you\'ve ever struggled with [problem], watch this."',
            'The Social Proof — "After helping 500+ creators, here\'s what actually works."',
            'The Time Pressure — "You have 30 days before [platform] changes this…"',
          ]},
          { type: 'heading', content: 'ChatGPT Prompts for Each Archetype' },
          { type: 'code', content: '// Curiosity Gap Prompt:\n"Write 5 YouTube video hooks using the curiosity gap technique\nfor a video about [YOUR TOPIC]. Each hook should be under 15\nwords and make the viewer NEED to know what comes next.\nTone: conversational, slightly dramatic."' },
          { type: 'code', content: '// Bold Claim Prompt:\n"Generate 5 bold, attention-grabbing opening lines for a\nvideo about [YOUR TOPIC]. Each should make a surprising\nclaim backed by a real insight. Avoid clickbait — the\nclaim must be deliverable in the video."' },
          { type: 'callout', content: 'Always test your hooks by reading them aloud. If you wouldn\'t stop scrolling for it, neither will your audience.', variant: 'warning' },
          { type: 'heading', content: 'A/B Testing Your Hooks' },
          { type: 'text', content: 'Generate 10 hook variations using ChatGPT, narrow down to your top 3, then test them with your audience using YouTube\'s A/B thumbnail feature or by posting variations on different platforms. Track CTR and AVD to identify winning patterns — then build a personal hook formula library.' },
        ],
        quiz: [
          { question: 'Within how many seconds do most YouTube viewers decide to keep watching?', options: ['1 second', '5 seconds', '15 seconds', '30 seconds'], correctIndex: 1, explanation: 'Research shows 70% of viewers make their stay/leave decision within the first 5 seconds.' },
          { question: 'Which hook archetype uses phrases like "Nobody talks about this"?', options: ['Bold Claim', 'Social Proof', 'Curiosity Gap', 'Time Pressure'], correctIndex: 2, explanation: 'The Curiosity Gap creates an information void that viewers feel compelled to fill by watching.' },
          { question: 'What should you do after generating hook variations?', options: ['Use the first one ChatGPT gives you', 'A/B test top 3 and track CTR + AVD', 'Ignore data and go with gut feeling', 'Use all 10 variations in one video'], correctIndex: 1, explanation: 'Testing your top hooks with real audience data helps you identify winning patterns unique to your channel.' },
        ],
        downloads: [{ name: 'Hook Formula Cheat Sheet', size: '1.8 MB', type: 'pdf' }],
      },
      {
        id: 4, title: 'Full Script Workshop — Live Build', type: 'video', duration: '10 min',
        description: 'Watch a complete script being built from scratch using all the techniques covered — from prompt to final polished draft.',
        quiz: [
          { question: 'What is the recommended final step before recording a script?', options: ['Run it through Grammarly', 'Read it aloud and time it', 'Post it on social media', 'Translate it to another language'], correctIndex: 1, explanation: 'Reading your script aloud reveals awkward phrasing, pacing issues, and helps you estimate actual video length.' },
          { question: 'What structure should a 10-minute YouTube script follow?', options: ['Just freestyle and see what happens', 'Hook → Story → 3 Teaching Points → CTA', 'Introduction → Conclusion only', 'Only bullet points, no structure needed'], correctIndex: 1, explanation: 'The Hook → Story → Teaching → CTA framework maintains viewer engagement through the entire video.' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Landing Your First Brand Deal',
    description: 'Step-by-step playbook to pitch brands, negotiate rates, and close your first paid collaboration.',
    instructor: 'Creator Nest Team',
    category: 'Brand Deals',
    level: 'Beginner',
    totalDuration: '1 hr',
    rating: 4.9,
    studentsEnrolled: 890,
    tags: ['Pitching', 'Negotiation', 'First Deal'],
    lessons: [
      {
        id: 1, title: 'The Brand Deal Landscape', type: 'video', duration: '15 min',
        description: 'Understand how brands find creators, what they look for, and why even small creators can land paid deals.',
        quiz: [
          { question: 'What is the minimum follower count needed to land a brand deal?', options: ['100K+', '50K+', 'There is no minimum — value matters more', '1M+'], correctIndex: 2, explanation: 'Brands increasingly value engagement rate and niche relevance over raw follower counts. Micro-creators often convert better.' },
          { question: 'What do brands look for most in a creator partner?', options: ['Only subscriber count', 'Audience alignment and engagement rate', 'Number of videos posted', 'Account age'], correctIndex: 1, explanation: 'Audience alignment with the brand\'s target market and strong engagement are the top factors in brand decisions.' },
        ],
      },
      {
        id: 2, title: 'Building Your Media Kit', type: 'slides', duration: '20 min',
        description: 'Create a professional media kit that makes brands want to work with you. Includes templates and real examples.',
        slides: [
          { title: 'What Is a Media Kit?', bullets: ['A 1-3 page document that showcases your value to brands', 'Think of it as your "creator resume"', 'The #1 thing brands request before a deal', 'Professional kits can increase your rates by 30-50%'], highlight: '📊 Creators with media kits close deals 3x faster' },
          { title: 'Essential Sections', bullets: ['Bio & Brand Story (who you are, why you create)', 'Audience Demographics (age, gender, location, interests)', 'Platform Stats (followers, engagement rate, AVD)', 'Past Collaborations & Testimonials', 'Rate Card (your pricing packages)'] },
          { title: 'Design Best Practices', bullets: ['Use your brand colors and fonts consistently', 'Include high-quality photos of yourself and content', 'Keep it scannable — use icons, charts, and bullet points', 'Save as PDF and keep under 5 pages'], highlight: '🎨 Use Canva or Figma — free templates available in downloads' },
          { title: 'Common Mistakes', bullets: ['Inflating numbers — brands WILL verify', 'No pricing — makes you look amateur', 'Too long — 2-3 pages is the sweet spot', 'Outdated stats — update monthly'] },
          { title: 'Rate Card Pricing Formula', bullets: ['Base rate: (Followers ÷ 1000) × $5-15 for a sponsored post', 'Adjust for: engagement rate, niche premium, usage rights', 'Package deals: offer bundles (1 video + 3 Stories)', 'Always quote higher — brands expect to negotiate 10-20% down'], highlight: '💰 Start at $X and let them negotiate down, never up' },
        ],
        quiz: [
          { question: 'What is the ideal length for a media kit?', options: ['1 page', '2-3 pages', '10+ pages', 'A full website'], correctIndex: 1, explanation: 'The sweet spot is 2-3 pages — enough to showcase your value without overwhelming busy brand managers.' },
          { question: 'How often should you update your media kit stats?', options: ['Once a year', 'Monthly', 'Never, keep the highest numbers', 'Only when a brand asks'], correctIndex: 1, explanation: 'Monthly updates ensure your stats are current and accurate, building trust with potential brand partners.' },
        ],
        downloads: [{ name: 'Media Kit Template (Canva)', size: '3.2 MB', type: 'zip' }, { name: 'Rate Card Calculator', size: '450 KB', type: 'xlsx' }],
      },
      {
        id: 3, title: 'The Perfect Pitch Email', type: 'blog', duration: '25 min',
        description: 'Craft cold outreach emails that actually get responses. Real templates from deals worth ₹50K-5L+.',
        blogContent: [
          { type: 'heading', content: 'Why Most Pitch Emails Fail' },
          { type: 'text', content: 'Brand managers receive 50-100 pitch emails per week. Most get deleted within 3 seconds because they\'re generic, too long, or self-centered. The key to a winning pitch is making it about the BRAND\'s goals, not yours.' },
          { type: 'callout', content: 'The average response rate for creator pitches is just 5%. With these templates, our creators achieve 25-35% response rates.', variant: 'info' },
          { type: 'heading', content: 'The 5-Line Pitch Framework' },
          { type: 'list', items: [
            'Line 1: Personalized opener referencing their recent campaign or product',
            'Line 2: Your unique value prop in ONE sentence',
            'Line 3: One specific content idea tailored to their brand',
            'Line 4: Social proof — one metric or testimonial',
            'Line 5: Clear CTA — "Can I send over my media kit?"',
          ]},
          { type: 'heading', content: 'Sample Pitch Email' },
          { type: 'code', content: 'Subject: Content idea for [Brand]\'s summer campaign 🎯\n\nHi [Name],\n\nLoved your recent collab with [Creator X] — the product\nintegration felt natural and the comments were glowing.\n\nI create [niche] content for [audience size] engaged\n[platform] followers who match your target demographic\n(18-28, India, tech-savvy).\n\nIdea: A "Day in My Life" featuring [Product] as my\ngo-to [use case] — similar to what performed well for\n[competitor reference], but with my signature style.\n\nMy last sponsored video hit [metric], and [Brand Y]\nsaw a 3x ROAS from our collaboration.\n\nWould love to share my media kit — worth a quick look?\n\nBest,\n[Your Name]' },
          { type: 'callout', content: 'Never send a pitch without researching the brand first. Mention a specific campaign, product, or social post to prove you did your homework.', variant: 'warning' },
        ],
        quiz: [
          { question: 'What is the most critical element of a pitch email?', options: ['Making it very long and detailed', 'Using lots of emojis', 'Making it about the brand\'s goals, not yours', 'Attaching your full portfolio'], correctIndex: 2, explanation: 'Brand-centric pitches show you understand their business and can deliver value — this is what gets responses.' },
          { question: 'How many lines should your core pitch be?', options: ['1 line', '5 lines', '20+ lines', 'As many as needed'], correctIndex: 1, explanation: 'The 5-line framework keeps your pitch scannable and respectful of the brand manager\'s limited time.' },
        ],
        downloads: [{ name: 'Pitch Email Templates (5 Pack)', size: '1.1 MB', type: 'pdf' }],
      },
    ],
  },
  {
    id: 9,
    title: 'YouTube Algorithm Deep Dive',
    description: 'Understand impressions, CTR, AVD, and the recommendation engine. Data-driven strategies to hack the algorithm.',
    instructor: 'Creator Nest Team',
    category: 'Growth',
    level: 'Intermediate',
    totalDuration: '2 hrs',
    rating: 4.9,
    studentsEnrolled: 2100,
    tags: ['Algorithm', 'YouTube', 'Analytics'],
    lessons: [
      {
        id: 1, title: 'How the Algorithm Actually Works', type: 'video', duration: '20 min',
        description: 'Demystify the YouTube recommendation engine — what signals it tracks and how to optimize for each one.',
        quiz: [
          { question: 'What is the PRIMARY signal YouTube uses to recommend videos?', options: ['Subscriber count', 'Upload frequency', 'Viewer satisfaction (CTR + AVD + engagement)', 'Video length'], correctIndex: 2, explanation: 'YouTube optimizes for viewer satisfaction — a combination of click-through rate, watch time, and engagement signals.' },
          { question: 'What does AVD stand for?', options: ['Average Video Downloads', 'Average View Duration', 'Audience Video Data', 'Advanced Video Delivery'], correctIndex: 1, explanation: 'AVD (Average View Duration) measures how long viewers typically watch your video — a critical algorithm signal.' },
        ],
      },
      {
        id: 2, title: 'CTR & Thumbnail Optimization', type: 'slides', duration: '25 min',
        description: 'Master the art of thumbnails and titles that drive clicks without resorting to clickbait.',
        slides: [
          { title: 'CTR: The First Gate', bullets: ['CTR (Click-Through Rate) = Impressions that become views', 'Average CTR across YouTube: 2-10%', 'Top creators consistently hit 8-15%', 'CTR is the #1 lever you can control'], highlight: '📈 Improving CTR by just 2% can double your views' },
          { title: 'Thumbnail Psychology', bullets: ['Faces with exaggerated emotions get 30% higher CTR', 'High contrast colors pop in the feed', 'Maximum 3 elements — keep it simple', 'Text should be readable at mobile size (think 3-4 words max)'] },
          { title: 'Title Formulas That Work', bullets: ['"I [did extreme thing] for [time period]"', '"Why [common belief] is wrong"', '"The [number] [topic] mistakes killing your [metric]"', '"How I [achieved result] in [short timeframe]"'], highlight: '🎯 The best titles create a curiosity gap AND promise value' },
          { title: 'A/B Testing Thumbnails', bullets: ['YouTube now offers built-in A/B testing (Test & Compare)', 'Test one variable at a time: face vs no face, color scheme, text', 'Run tests for at least 7 days with 50K+ impressions', 'Keep the winner, iterate on the loser'], },
          { title: 'Real CTR Data Analysis', bullets: ['0-2% CTR → Thumbnail/title needs complete rework', '3-5% CTR → Good but room for improvement', '6-10% CTR → Strong performer, analyze what works', '10%+ CTR → Viral potential, double down on this style'], highlight: '🔥 Check your CTR in YouTube Studio → Analytics → Reach' },
        ],
        quiz: [
          { question: 'What is a good CTR benchmark for YouTube?', options: ['0-1%', '2-3%', '6-10%', '50%+'], correctIndex: 2, explanation: '6-10% CTR indicates strong thumbnail/title performance that the algorithm rewards with more impressions.' },
          { question: 'How many elements should a thumbnail ideally have?', options: ['Maximum 3', 'As many as possible', 'Only text, no images', 'Exactly 10'], correctIndex: 0, explanation: 'Thumbnails with 3 or fewer elements are easier to read at small sizes and drive higher click-through rates.' },
          { question: 'How long should you run an A/B thumbnail test?', options: ['1 hour', '1 day', 'At least 7 days', '6 months'], correctIndex: 2, explanation: '7+ days with sufficient impressions gives statistically significant data to identify the winning thumbnail.' },
        ],
        downloads: [{ name: 'CTR Optimization Checklist', size: '890 KB', type: 'pdf' }],
      },
      {
        id: 3, title: 'Watch Time & AVD Strategies', type: 'blog', duration: '30 min',
        description: 'Proven techniques to keep viewers watching longer — from pacing to pattern interrupts.',
        blogContent: [
          { type: 'heading', content: 'Why Watch Time Is King' },
          { type: 'text', content: 'YouTube has repeatedly confirmed that watch time (and specifically Average View Duration) is the most important metric for video recommendations. A video with 50% AVD will outperform one with 30% AVD even if the latter has more total views.' },
          { type: 'callout', content: 'Target: 50%+ AVD for videos under 10 minutes, 40%+ for longer content. Check yours in YouTube Studio → Analytics → Engagement.', variant: 'tip' },
          { type: 'heading', content: '8 Proven Retention Techniques' },
          { type: 'list', items: [
            'Pattern Interrupts: Change visuals every 15-30 seconds (B-roll, graphics, angle changes)',
            'Open Loops: Tease upcoming content ("Later I\'ll show you the #1 mistake…")',
            'The "But Wait" Technique: Just when viewers think the video is wrapping up, add unexpected bonus value',
            'Engagement Hooks: Ask questions, run polls, prompt comments at natural break points',
            'Pacing Control: Alternate between high-energy and calm segments',
            'Visual Storytelling: Use screen recordings, diagrams, and animations to illustrate points',
            'Chapter Markers: Help viewers navigate but also increase perceived value',
            'Strong Closers: End with your best insight, not a generic "like and subscribe"',
          ]},
          { type: 'heading', content: 'Reading Your Retention Graph' },
          { type: 'text', content: 'The audience retention graph in YouTube Analytics tells a story. Look for: (1) The initial drop-off — how steep is it in the first 30 seconds? (2) Dips — where are viewers leaving? These are content or pacing issues. (3) Spikes — where are viewers replaying? This is your best content. (4) The tail — how does the graph look in the final 20%?' },
          { type: 'callout', content: 'Study your retention graphs for your top 5 and bottom 5 videos. The patterns will reveal exactly what your audience wants more and less of.', variant: 'info' },
        ],
        quiz: [
          { question: 'What AVD percentage should you target for sub-10-minute videos?', options: ['20%', '30%', '50%+', '100%'], correctIndex: 2, explanation: '50%+ AVD for short videos signals strong content quality to the algorithm, resulting in more recommendations.' },
          { question: 'What does a spike in the retention graph indicate?', options: ['Viewers are leaving', 'Viewers are replaying that section', 'The video is buffering', 'An ad played'], correctIndex: 1, explanation: 'Spikes show viewers replaying content — this is your most valuable content that you should create more of.' },
        ],
      },
      {
        id: 4, title: 'Analytics Dashboard Mastery', type: 'video', duration: '25 min',
        description: 'Navigate YouTube Studio like a pro — every metric explained, every insight actionable.',
        quiz: [
          { question: 'Which YouTube Studio tab shows your traffic sources?', options: ['Content', 'Reach', 'Engagement', 'Audience'], correctIndex: 1, explanation: 'The Reach tab shows impressions, CTR, and all traffic sources including Browse, Search, Suggested, and External.' },
          { question: 'How often should you review your analytics?', options: ['Every hour', 'Weekly deep dive + daily quick check', 'Once a year', 'Never, just focus on creating'], correctIndex: 1, explanation: 'A weekly deep dive with daily quick checks keeps you informed without becoming obsessed with metrics.' },
        ],
        downloads: [{ name: 'Analytics Tracking Spreadsheet', size: '620 KB', type: 'xlsx' }],
      },
    ],
  },
];

export function getCourseById(id: number): Course | undefined {
  return courses.find(c => c.id === id);
}
