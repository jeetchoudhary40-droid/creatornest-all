-- ====================================================================================
-- CREATORNEST BLOG SYSTEM: Database Schema & Initial Seed
-- Run this in your Supabase SQL Editor
-- ====================================================================================

-- 1. Create or update public.blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'deleted')),
    category TEXT DEFAULT 'strategy',
    read_time TEXT DEFAULT '5 min read',
    tags JSONB DEFAULT '[]'::jsonb,
    author_name TEXT DEFAULT 'Ananya Verma',
    author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    author_role TEXT DEFAULT 'Lead Creator Economy Analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist in case table was created with older schema
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'strategy'; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 min read'; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Ananya Verma'; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'Lead Creator Economy Analyst'; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 3. Idempotent Policy Cleanup (prevents 42710 policy already exists errors)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Published blog posts are viewable by everyone." ON public.blog_posts;
    DROP POLICY IF EXISTS "Admins can view all blog posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- 4. Create Policies
CREATE POLICY "Public can view published blog posts" ON public.blog_posts 
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view all blog posts" ON public.blog_posts 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert blog posts" ON public.blog_posts 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update blog posts" ON public.blog_posts 
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts 
  FOR DELETE USING (true);

-- 5. Seed all 12 Blog Posts with Indian Authors (Idempotent: updates if slug already exists)

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'all',
  'Top 10 Indian YouTubers & Content Creators in 2026 (Ranked by Subscribers & Influence)',
  'top-10-indian-youtubers-content-creators-2026',
  'India now commands one of the world\',
  '<p class="text-xs sm:text-sm text-gray-400 border-b border-white/10 pb-3 mb-6">
        <em>Last Updated: October 2026 | Verified against live YouTube Studio & Social Blade channel analytics</em>
      </p>

      <p>India is home to the world’s most dynamic and hyper-engaged creator economy. With over 500 million active internet video consumers, Indian creators no longer merely compete for clicks—they command audiences that surpass traditional television broadcasting networks, launch multi-crore D2C consumer brands, and reshape national culture.</p>

      <p>Whether you are an aspiring creator hunting for high-retention storytelling playbooks, or a brand marketer looking to partner with the <strong>top Indian influencers in 2026</strong>, understanding who dominates the algorithmic charts is essential. Below is the definitive, data-backed guide to the <strong>top 10 Indian YouTubers of 2026</strong>, ranked by subscriber milestones, audience loyalty, and cultural resonance.</p>

      <h2>Quick Summary: Top 10 Indian YouTubers in 2026</h2>
      <p>Here is how the leaderboard stacks up across subscribers, primary niches, and core content styles:</p>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Creator / Channel</th>
            <th>Approx. Subscribers</th>
            <th>Primary Niche</th>
            <th>Signature Format</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>#1</strong></td>
            <td><strong>Dushyant Kukreja</strong></td>
            <td>~49.7 Million</td>
            <td>Short-Form Comedy</td>
            <td>Relatable family & relationship Shorts</td>
          </tr>
          <tr>
            <td><strong>#2</strong></td>
            <td><strong>Ujjwal Chaurasia (Techno Gamerz)</strong></td>
            <td>~49.1 Million</td>
            <td>Gaming & Episodic Lore</td>
            <td>GTA V storyline gameplay & Minecraft</td>
          </tr>
          <tr>
            <td><strong>#3</strong></td>
            <td><strong>Indian Hacker (Dilraj Singh)</strong></td>
            <td>~48.5 Million</td>
            <td>Science Experiments & Stunts</td>
            <td>Large-scale DIY pyrotechnics & builds</td>
          </tr>
          <tr>
            <td><strong>#4</strong></td>
            <td><strong>Priyal Kukreja</strong></td>
            <td>~45.8 Million</td>
            <td>Comedy & Lifestyle</td>
            <td>Fast-paced observational humor</td>
          </tr>
          <tr>
            <td><strong>#5</strong></td>
            <td><strong>CarryMinati (Ajey Nagar)</strong></td>
            <td>~45.2 Million</td>
            <td>Roast, Satire & Rap</td>
            <td>Pop-culture commentaries & gaming</td>
          </tr>
          <tr>
            <td><strong>#6</strong></td>
            <td><strong>Total Gaming (Ajjubhai / Ajay)</strong></td>
            <td>~44.2 Million</td>
            <td>Gaming & Mobile Esports</td>
            <td>Free Fire, live commentary & tournaments</td>
          </tr>
          <tr>
            <td><strong>#7</strong></td>
            <td><strong>Ashish Chanchlani</strong></td>
            <td>~30.5 Million</td>
            <td>Cinematic Comedy Sketches</td>
            <td>Multi-character comedy & mini web series</td>
          </tr>
          <tr>
            <td><strong>#8</strong></td>
            <td><strong>Amit Bhadana</strong></td>
            <td>~24.6 Million</td>
            <td>Desi Humor & Storytelling</td>
            <td>Grassroots North Indian village sketches</td>
          </tr>
          <tr>
            <td><strong>#9</strong></td>
            <td><strong>Dhruv Rathee</strong></td>
            <td>~28.0 Million</td>
            <td>Education & Geopolitics</td>
            <td>Research-heavy explainers & documentaries</td>
          </tr>
          <tr>
            <td><strong>#10</strong></td>
            <td><strong>Sourav Joshi</strong></td>
            <td>~29.0 Million</td>
            <td>Daily Lifestyle Vlogging</td>
            <td>Family-centric 365-day vlogs & travel</td>
          </tr>
        </tbody>
      </table>

      <h2>Detailed Breakdown: Who Are India\''s Top 10 Creators in 2026?</h2>

      <h3>1. Dushyant Kukreja — The King of Short-Form Comedy (~49.7M Subscribers)</h3>
      <p>Holding the top spot on current 2026 subscriber rankings, <strong>Dushyant Kukreja</strong> represents the meteoric rise of the YouTube Shorts era. By delivering high-frequency, family-friendly sketches with instant punchlines, Dushyant cracks average watch times that exceed 120% loop retention.</p>
      <ul>
        <li><strong>Niche:</strong> Quick-hit relatable comedy, situational sketches, and sibling dynamics.</li>
        <li><strong>Why He Dominates:</strong> Universal language barriers disappear with slapstick, hyper-visual comedy. Every video hook is delivered within the first 1.5 seconds.</li>
        <li><strong>Brand Deal Appeal:</strong> High-reach FMCG, mobile apps, and youth snacking brands seeking mass top-of-funnel impression scale.</li>
      </ul>

      <h3>2. Ujjwal Chaurasia (Techno Gamerz) — The Master of Gaming Storylines (~49.1M Subscribers)</h3>
      <p>Gaming in India was once considered a niche subculture until <strong>Ujjwal Chaurasia</strong> turned it into mainstream interactive television. Operating primarily under <em>Techno Gamerz</em>, Ujjwal transformed standard Grand Theft Auto V and Minecraft gameplay into cinematic, serialized Bollywood-style dramas.</p>
      <ul>
        <li><strong>Niche:</strong> Long-form episodic gaming, game updates, and cinematic roleplay series.</li>
        <li><strong>Why He Dominates:</strong> Exceptional emotional attachment. Rather than just playing missions, Ujjwal invents storylines, recurring characters, and cliffhangers that pull tens of millions of views per episode.</li>
        <li><strong>Monetization Channels:</strong> High gaming CPMs, hardware endorsements (PC parts, mobile gaming rigs), and tech product integrations.</li>
      </ul>

      <h3>3. Indian Hacker (Dilraj Singh) — High-Octane Science & Spectacle (~48.5M Subscribers)</h3>
      <p>Hailing from Rajasthan, <strong>Dilraj Singh Rawat</strong> (better known as <em>Indian Hacker</em>) is India’s undisputed pioneer of experiential science, pyrotechnic challenges, and mega-scale DIY experiments.</p>
      <ul>
        <li><strong>Niche:</strong> Science stunts, chemical reactions, destruction tests, and mechanical experiments.</li>
        <li><strong>Why He Dominates:</strong> Visual curiosity. Whether submerging cars in water or crafting giant fireworks matrices, his videos tap into the same primal entertainment appeal as MythBusters and MrBeast.</li>
        <li><strong>Audience Demographics:</strong> Massive Tier-2, Tier-3, and rural youth following with intense communal loyalty.</li>
      </ul>

      <h3>4. Priyal Kukreja — India’s Most Followed Female Creator (~45.8M Subscribers)</h3>
      <p>Recognized as one of the <strong>top female YouTubers in India</strong>, <strong>Priyal Kukreja</strong> has built an empire around clean, humorous sketches highlighting daily Indian family life, sister-brother quarrels, and situational comedy.</p>
      <ul>
        <li><strong>Niche:</strong> Female perspective lifestyle humor, Shorts skits, and cross-platform Instagram Reels.</li>
        <li><strong>Why She Dominates:</strong> Highly brand-safe content with broad intergenerational appeal—parents, teenagers, and kids watch together without hesitation.</li>
        <li><strong>Brand Deals:</strong> Beauty, lifestyle, fashion, educational apps, and household consumer goods.</li>
      </ul>

      <h3>5. CarryMinati (Ajey Nagar) — The Cultural Roasting Phenomenon (~45.2M Subscribers)</h3>
      <p>No conversation about the history of YouTube India is complete without <strong>CarryMinati (Ajey Nagar)</strong>. From starting as a teenage gaming commentator to crossing 10 million in 2019 and holding the all-time record for single-day subscriber surges, CarryMinati is the voice of Gen-Z rebellion.</p>
      <ul>
        <li><strong>Niche:</strong> Pop-culture roasts, social satire, music videos (rap), and live gaming on <em>CarryisLive</em>.</li>
        <li><strong>Why He Dominates:</strong> Unmatched raw charisma, razor-sharp comic timing, and high-production thematic sketches. When Carry uploads, it becomes a nationwide trending event.</li>
        <li><strong>Monetization Channels:</strong> Major A-list brand partnerships, OTT film appearances, music streaming royalties, and live gaming superchats.</li>
      </ul>

      <h3>6. Total Gaming (Ajjubhai / Ajay) — The Esports Community Magnet (~44.2M Subscribers)</h3>
      <p>Starting as a faceless creator who built one of the world\''s largest Free Fire channels, <strong>Ajay (Ajjubhai)</strong> proves that authentic community rapport outlasts fancy studio equipment.</p>
      <ul>
        <li><strong>Niche:</strong> Mobile gaming, Free Fire esports, funny voiceover moments, and multiplayer collaborations.</li>
        <li><strong>Why He Dominates:</strong> Mobile gaming accessibility. Millions of Indian youth who play on budget smartphones relate intimately to Ajjubhai’s humble, friendly Hindi commentary.</li>
      </ul>

      <h3>7. Ashish Chanchlani — Cinematic Storytelling & Viral Mini-Series (~30.5M Subscribers)</h3>
      <p>Starting with vine-style comedy in 2014, <strong>Ashish Chanchlani</strong> evolved into a full-scale cinematic director. His original comedy-horror series <em>"Ekaki"</em> crossed 100+ million views, proving that long-form, high-effort video sketches continue to thrive alongside Shorts.</p>
      <ul>
        <li><strong>Niche:</strong> High-budget relatable comedy, college life parodies, and serialized web fiction.</li>
        <li><strong>Core Strength:</strong> Emotional depth, memorable recurring catchphrases, and seamless Hollywood/Bollywood celebrity promotional tie-ins.</li>
      </ul>

      <h3>8. Amit Bhadana — The Voice of Grassroots Desi Storytelling (~24.6M Subscribers)</h3>
      <p><strong>Amit Bhadana</strong> was the first individual Indian creator to cross 20 million subscribers. His lyrical dialogue delivery, Haryanvi/Western UP dialect, and heartwarming moral themes resonate deeply with North India’s vast grassroots heartland.</p>
      <ul>
        <li><strong>Niche:</strong> Desi village comedy, friendship sketches, and emotional drama films (like <em>SSC</em>).</li>
        <li><strong>Core Strength:</strong> Relatability to rural youth, authentic cultural idioms, and family values.</li>
      </ul>

      <h3>9. Dhruv Rathee — The King of Educational Deep-Dives (~28.0M Subscribers)</h3>
      <p>Dispelling the myth that only comedy or gaming can achieve mass viral scale, <strong>Dhruv Rathee</strong> has demonstrated that research-intensive educational journalism can achieve blockbuster viewership in India.</p>
      <ul>
        <li><strong>Niche:</strong> Geopolitics, environment, history, current affairs, and critical thinking explainers.</li>
        <li><strong>Why He Dominates:</strong> Flawless motion-graphics editing, structured chapter breakdowns, and an accessible presentation style that decodes complex global developments for everyday viewers.</li>
        <li><strong>Monetization Channels:</strong> High-ticket educational courses, premium financial sponsorships, book sales, and international CPM rates.</li>
      </ul>

      <h3>10. Sourav Joshi — Daily Vlogging & Family Storytelling (~29.0M Subscribers)</h3>
      <p>From sketching tutorials in Uttarakhand to becoming India’s most viewed daily vlogger, <strong>Sourav Joshi</strong> cracked the holy grail of YouTube: making his everyday life feel like a daily soap opera for tens of millions of loyal viewers.</p>
      <ul>
        <li><strong>Niche:</strong> 365-day daily family vlogs, automotive adventures, and visual arts.</li>
        <li><strong>Why He Dominates:</strong> Absolute consistency and zero controversy. Viewers tune in every morning at 8:00 AM as a daily ritual, generating billions of annual views.</li>
      </ul>

      <h2>Honorable Mentions: Fast-Rising Indian Influencers in 2026</h2>
      <p>While the top 10 represent the highest subscriber totals, several other creators wield equal or superior cultural engagement:</p>
      <ul>
        <li><strong>Elvish Yadav:</strong> Renowned for high-energy vlogging, reality TV triumphs, and strong youth community loyalty.</li>
        <li><strong>Fukra Insaan (Abhishek Malhan):</strong> Pioneer of high-budget Indian challenge videos, reality shows, and family gaming entertainment.</li>
        <li><strong>Triggered Insaan (Nischay Malhan):</strong> The undisputed king of family-friendly reaction videos, storytime rants, and roast-commentary.</li>
        <li><strong>Bhuvan Bam (BB Ki Vines):</strong> The original trailblazer who created the multi-character universe, now producing hit OTT web series (<em>Taaza Khabar</em>, <em>Dhindhora</em>).</li>
      </ul>

      <h2>What the Top Indian Creators Have in Common</h2>
      <p>Analyzing the patterns across these 10 distinct channels reveals four fundamental pillars of success in the modern Indian creator economy:</p>
      <ol>
        <li><strong>Uncompromising Consistency:</strong> Whether uploading daily at 8 AM like Sourav Joshi or dropping high-frequency Shorts like Dushyant and Priyal, top creators never leave the algorithm cold.</li>
        <li><strong>Hindi-First & Vernacular Dominance:</strong> Over 85% of India’s top YouTube channels produce in Hindi, Bhojpuri, Punjabi, or regional dialects. Vernacular content builds emotional warmth that English-first content struggles to replicate.</li>
        <li><strong>The Dual Short + Long-Form Funnel:</strong> Smart creators use YouTube Shorts as a zero-cost discovery billboard to acquire new subscribers, then funnel them into 15-to-30 minute long-form videos to capture high watch-time and ad revenue.</li>
        <li><strong>Audience Ownership & D2C Brands:</strong> Top creators are no longer reliant on AdSense alone. They have diversified into consumer brands, live touring, merchandise, and digital education.</li>
      </ol>

      <h2>How Much Do Top Indian YouTubers Earn in 2026?</h2>
      <p>Creator earnings depend heavily on niche, audience demographics, and monetization mix:</p>
      <ul>
        <li><strong>AdSense CPM Rates:</strong> In India, YouTube CPMs range between <strong>$0.50 to $2.00 (₹40 to ₹170) per 1,000 views</strong> for entertainment, comedy, and vlogging. High-finance, tech, and educational channels enjoy higher CPMs between <strong>$3.00 to $7.00+ (₹250 to ₹600+)</strong>.</li>
        <li><strong>Brand Deals & Sponsorships:</strong> A single dedicated video integration for a top-tier Indian YouTuber commands anywhere between <strong>₹15 Lakh to ₹60 Lakh+ ($18,000 to $70,000+)</strong> depending on guaranteed 48-hour views and engagement rates.</li>
      </ul>

      <h2>How Brands Can Partner With Indian Creators</h2>
      <p>Collaborating with top creators requires more than cold emails. Modern brands follow a three-step blueprint:</p>
      <ol>
        <li><strong>Verify Real Engagement vs. Ghost Followers:</strong> Look beyond subscriber numbers. Analyze average view-to-subscriber ratios and comment sentiment.</li>
        <li><strong>Request a Verified Creator Media Kit:</strong> Top influencers present structured rate cards, historical CTRs, and demographic breakdowns (age, geography, gender). You can use <a href="/tools">CreatorNest\''s Free Media Kit Tools</a> to generate professional media kits instantly.</li>
        <li><strong>Work Through Transparent Creator Platforms:</strong> Explore vetted rosters such as the <a href="/creators">CreatorNest Creator Roster</a> to discover, book, and track campaign deliverables with zero friction.</li>
      </ol>

      <h2>Frequently Asked Questions (FAQs)</h2>

      <h3>Who is the most subscribed Indian YouTuber in 2026?</h3>
      <p>Dushyant Kukreja currently leads individual creator rankings with over 49.7 million subscribers, closely followed by Techno Gamerz (Ujjwal Chaurasia) and Indian Hacker. (Note: Corporate music channels like T-Series have higher counts, but Dushyant leads individual creator channels).</p>

      <h3>Who is the top female YouTuber in India in 2026?</h3>
      <p>Priyal Kukreja stands out as the most subscribed individual female YouTuber in India with over 45.8 million subscribers, famous for her relatable comedy and viral short-form videos.</p>

      <h3>How much do Indian YouTubers earn per 1 million views?</h3>
      <p>For Indian traffic, 1 million views typically generates between ₹35,000 to ₹1,50,000 ($400 to $1,800) in AdSense revenue for entertainment and vlogs, while finance and tech channels can earn up to ₹2,50,000 to ₹4,00,000+ per million views.</p>

      <h3>Which niche is growing fastest on YouTube India?</h3>
      <p>Educational explainers (infotainment), mobile gaming storylines, and regional lifestyle vlogs are experiencing the highest viewer retention and fastest subscriber expansion.</p>',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'published',
  'strategy',
  '9 min read',
  '["Top Indian YouTubers 2026","Most Subscribed YouTubers in India","Top 10 Indian Content Creators","Top Indian Influencers 2026","Top Gaming YouTubers India","Top Female YouTubers in India","Creator Economy India","YouTube Shorts Strategy"]'::jsonb,
  'Ananya Verma',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'Lead Creator Economy Analyst',
  timezone('utc'::text, '2026-10-01T12:00:00Z'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'youtube-deepmind-veo-generative-ai-creator-tools',
  'Google DeepMind Veo on YouTube: Complete Guide to the New Generative AI Video & Studio Tools (2026)',
  'youtube-deepmind-veo-generative-ai-creator-tools',
  'At its flagship',
  '<p>At its flagship annual <strong>"Made on YouTube"</strong> event, YouTube officially crossed the threshold from being an online video hosting platform to becoming a comprehensive, AI-native creative production studio. The cornerstone of this transformation? The deep, native integration of <strong>Google DeepMind’s flagship generative video model: Veo</strong>.</p>

      <p>Until recently, video creation demanded expensive mirrorless cameras, lighting rigs, complex After Effects compositing, and hours spent searching stock footage libraries for B-roll. With the arrival of Veo inside YouTube''s <strong>Dream Screen</strong> alongside a suite of smart Studio tools, YouTube has democratized Hollywood-grade visual storytelling directly from a smartphone.</p>

      <p>At Creator Nest, we tested and analyzed every single feature rolled out in this update. Whether you run a solo educational channel, an entertainment Shorts page, or manage a roster of creators, here is your definitive breakdown of what Google DeepMind Veo brings to YouTube, how the new tools work, and how you can use them to outpace algorithmic competition.</p>

      <h2>1. Google DeepMind Veo in Dream Screen: A Quantum Leap for Shorts</h2>

      <p>When YouTube first introduced <em>Dream Screen</em>, it allowed creators to generate green-screen style AI image backgrounds for YouTube Shorts. While innovative, static backgrounds often felt unnatural behind moving human subjects.</p>

      <p>By replacing the underlying architecture with <strong>Google DeepMind Veo (and subsequent Veo 2 / Veo 3 iterations)</strong>, Dream Screen has fundamentally changed:</p>

      <ul>
        <li><strong>Photorealistic Generative Video Backgrounds:</strong> Creators can now prompt full-motion video backgrounds. Prompts like <em>"hyperrealistic neon Tokyo alleyway in midnight rain with puddle reflections"</em> or <em>"cinematic slow-motion flight over snow-capped Himalayan ridges at golden hour"</em> render fluid, physics-accurate 1080p vertical video loops.</li>
        <li><strong>Temporal Consistency & Physics Understanding:</strong> Unlike legacy AI video generators that suffered from flickering and morphing artifacts, DeepMind''s Veo understands natural lighting, gravity, fluid dynamics, and camera angles (pan, zoom, orbit).</li>
        <li><strong>Standalone 6-Second Video Clips:</strong> Creators are no longer limited to backgrounds behind their head. If you are narrating a story and need a 4-second transition showing an ancient Roman marketplace or an asteroid colliding with Jupiter, you can generate a standalone 6-second clip directly inside the Shorts camera editor and slice it into your timeline.</li>
      </ul>

      <blockquote>
        <p><strong>Key Production Win:</strong> Solo creators can now illustrate complex abstract thoughts, historical events, and futuristic concepts without spending hundreds of dollars on Envato, Storyblocks, or hours keyframing 3D Blender models.</p>
      </blockquote>

      <h2>2. Advanced Creative Video Controls: Add Motion, Stylize, and Add Objects</h2>

      <p>YouTube and Google DeepMind didn''t stop at raw text-to-video generation; they embedded granular editing controls designed to turn raw camera footage into custom art:</p>

      <h3>A. "Add Motion" (Photo-to-Video Engine)</h3>
      <p>Have an archival photo, a book cover, or a childhood snapshot? <strong>Add Motion</strong> uses Veo’s motion-transfer technology to animate still images into living videos. You can apply cinematic camera push-ins, simulate windy hair movement, or animate historical photos for compelling documentary-style Shorts.</p>

      <h3>B. "Stylize" (Neural Filter Transformation)</h3>
      <p>Recorded a regular video in your bedroom? <strong>Stylize</strong> allows creators to transform their existing video clips into distinct artistic aesthetics via simple prompts—including <em>cyberpunk anime, claymation, delicate paper origami, vintage 80s VHS, or 3D Pixar animation</em>. The subject’s facial expressions and lip movements remain locked, while the environment and texture are reimagined.</p>

      <h3>C. "Add Objects" (Generative Inpainting)</h3>
      <p>Need a neon holographic microphone in your hand, a pet cyber-dragon resting on your shoulder, or a flying UFO in your background? <strong>Add Objects</strong> lets creators type what they want and automatically blends the 3D asset into the scene, factoring in the ambient lighting, shadows, and perspective of the original video.</p>

      <h2>3. Safety, Ethics & Google DeepMind SynthID</h2>

      <p>One of the biggest concerns for creators regarding generative AI is platform penalties, copyright claims, and audience trust. YouTube has addressed these issues head-on through three structural safeguards:</p>

      <ul>
        <li><strong>SynthID Digital Watermarking:</strong> Every background, clip, and video generated via Veo is imperceptibly embedded with Google DeepMind’s <strong>SynthID</strong>. This cryptographic watermark persists across edits, compression, filters, and downloads without altering visible image quality.</li>
        <li><strong>Automated Transparency Badges:</strong> Content generated through Dream Screen is automatically tagged by YouTube with an <em>"Altered or synthetic content"</em> label in the video description and watch page. Creators do not have to stress about missing mandatory self-disclosure checkboxes.</li>
        <li><strong>Guardrails & Identity Protection:</strong> The model includes strict guardrails against generating deepfakes of real public figures, non-consensual likenesses, or content that violates YouTube’s Community Guidelines.</li>
      </ul>

      <h2>4. YouTube Studio’s AI Brain: Reimagining the "Inspiration Tab" & "Ask Studio"</h2>

      <p>Great video production is useless without a high-converting content strategy. At "Made on YouTube", YouTube Studio’s old Research tab was completely re-architected into the <strong>Inspiration Tab</strong>—an AI brainstorming copilot built directly into your analytics dashboard.</p>

      <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 my-6">
        <h3 class="text-primary font-bold text-base m-0">What Makes the Inspiration Tab Revolutionary:</h3>
        <ul class="text-sm space-y-2 m-0">
          <li><strong>Channel-Aware Personalization:</strong> Unlike generic ChatGPT prompts, the Inspiration Tab analyzes your specific channel history, top-performing videos, audience demographics, and comments.</li>
          <li><strong>"Why This Idea?" Data Rationale:</strong> For every concept suggested, YouTube Studio displays a clear data rationale (e.g., <em>"Your subscribers frequently watch videos about AI coding tools, but haven''t seen a tutorial on DeepMind Veo workflows yet"</em>).</li>
          <li><strong>Full Production Blueprints:</strong> Clicking an idea doesn''t just give you a title; it produces curated hook frameworks, 3-act script outlines, suggested B-roll cues, and 5 Midjourney/Veo style thumbnail concepts.</li>
          <li><strong>"Ask Studio" Conversational Assistant:</strong> Creators can chat with their channel analytics in plain English or Hindi: <em>"Which of my last 5 videos had the highest 30-second retention?"</em> or <em>"What are my viewers complaining about in the comments this week?"</em></li>
        </ul>
      </div>

      <h2>5. Breaking Language Barriers: Auto-Dubbing with Expressive Voice & AI Lip-Sync</h2>

      <p>Historically, reaching an international audience required either launching separate localized channels (like MrBeast) or hiring expensive voice dubbing studios. YouTube’s new <strong>Auto-Dubbing suite (powered by DeepMind and Aloud)</strong> eliminates this barrier:</p>

      <ul>
        <li><strong>Multi-Language Audio Tracks (MLAT):</strong> YouTube automatically translates your spoken audio into English, Spanish, Portuguese, French, Hindi, Japanese, and more.</li>
        <li><strong>Expressive Voice Matching:</strong> Instead of robotic text-to-speech, the AI clones the creator’s natural timbre, vocal pitch, cadence, and emotional inflection, ensuring jokes land with the same timing in Spanish as they do in Hindi or English.</li>
        <li><strong>Experimental AI Lip-Sync:</strong> To make dubbed videos feel completely native, YouTube is testing visual lip-synchronization that subtly recalculates the creator''s mouth movements to match the phonetics of the translated language.</li>
      </ul>

      <h2>6. Community & Channel Growth: "Communities" and "Hype"</h2>

      <p>Alongside AI creation tools, YouTube introduced powerful audience engagement mechanics to combat subscriber stagnation:</p>

      <h3>A. The "Communities" Hub</h3>
      <p>The old YouTube Community tab was largely a one-way broadcasting channel. The new <strong>Communities</strong> feature transforms channel pages into two-way social hubs reminiscent of Reddit or Discord. Subscribers can share fan art, initiate community debates, submit video topic suggestions, and interact with each other, supervised by creator-appointed moderators.</p>

      <h3>B. The "Hype" Discovery Leaderboard</h3>
      <p>For channels with under 500,000 subscribers, breaking through YouTube''s recommendation algorithm can be brutal. With <strong>Hype</strong>, viewers receive a weekly quota of Hypes to award to their favorite emerging creators’ newly uploaded videos (within the first 7 days of release). Videos with the most hypes earn a spot on regional <em>Hype Leaderboards</em>, granting undiscovered channels massive organic discoverability alongside trending mainstays.</p>

      <h2>7. The Creator Nest Playbook: How to Leverage YouTube’s AI Suite in 2026</h2>

      <p>At Creator Nest, our advice to creators is clear: <strong>AI tools are leverage, not a replacement for your personal perspective.</strong> Audiences follow humans, not prompt outputs. Here is the winning framework to maximize these tools:</p>

      <ol>
        <li><strong>Use Veo for Imagination Gaps:</strong> Don''t generate talking heads; generate the impossible. If you’re discussing an economic concept, use Veo to generate a cinematic visual metaphor (like a collapsing digital sandcastle).</li>
        <li><strong>A/B Test Studio Outlines Against Your Gut:</strong> Use the Inspiration Tab to spot trending audience queries, but inject your raw personal stories and contrarian opinions into the script hook.</li>
        <li><strong>Turn on Auto-Dubbing Early:</strong> Enable multilingual audio tracks on evergreen educational and tech videos. Indian creators, in particular, can unlock massive CPMs from the US, UK, and Latin America by dubbing Hindi videos into English and Spanish.</li>
        <li><strong>Mobilize Your Superfans for Hype:</strong> In your end-screens and community posts, ask your core audience to save their weekly Hypes for your most ambitious long-form projects.</li>
      </ol>

      <h2>Summary: The Future of Creator Production</h2>
      <p>The integration of <strong>Google DeepMind Veo into YouTube</strong> marks the beginning of an era where creative scale is limited only by imagination, not production budget. By mastering Dream Screen, leveraging the Inspiration Tab, and engaging fans through Communities, creators who embrace this suite today will establish insurmountable algorithmic moats tomorrow.</p>

      <blockquote>
        <p><strong>Want to monetize your channel and build brand-ready rate cards?</strong> Explore Creator Nest’s <a href="/tools/youtube-engagement-calculator">YouTube Engagement Rate Calculator</a> and <a href="/tools/media-kit-builder">Media Kit & Rate Card Suite</a> to turn your growing audience into high-paying commercial partnerships.</p>
      </blockquote>',
  '/images/blog/youtube-deepmind-veo-ai-tools.jpg',
  'published',
  'news',
  '8 min read',
  '["Google DeepMind Veo","YouTube AI","Dream Screen","Made on YouTube","Generative Video","YouTube Shorts","AI Video Editing","Creator Economy"]'::jsonb,
  'Aarav Mehta',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  'Head of Emerging AI Technologies',
  timezone('utc'::text, '2026-09-24T12:00:00Z'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'creator-economy-bill-india-2026',
  'Creator Economy Bill India 2026: What',
  'creator-economy-bill-india-2026',
  'Is the',
  '<p>If you''ve spent any time on Instagram, X, or Threads lately, you''ve probably seen the claim: <strong>"Rajya Sabha passes National Creator Economy Bill, 2026."</strong> It''s been shared by large pages, written up as a "landmark law" by marketing blogs, and repeated so often it now reads as settled fact.</p>
      
      <p>There''s just one problem — <strong>we can''t find it anywhere official.</strong></p>
      
      <p>At Creator Nest Media, we build contracts, disclosures, and brand-deal terms for creators every day, so before writing anything about a new law, we went to the source: <em>Parliament''s own records</em>, not social media threads. Here''s what''s actually confirmed about the creator economy in India right now, and what''s still just a rumour.</p>
      
      <h2>Is There Really a "Creator Economy Bill" in India?</h2>
      <p><strong>Short answer:</strong> Not that any official record shows.</p>
      
      <p>The viral version of the story is detailed enough to sound real. It claims the bill formally recognises YouTubers, Instagram influencers, and digital artists as licensed professionals, introduces a cess on platform ad spend to fund a creator welfare pool, mandates standardised brand contracts, and requires registration above a certain income threshold.</p>
      
      <p>But when the claim is checked against Parliament''s own bill-tracking sources, it doesn''t hold up. A review of official sources — including the Press Information Bureau (<a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer">PIB</a>), <a href="https://prsindia.org" target="_blank" rel="noopener noreferrer">PRS Legislative Research</a>, and <a href="https://sansad.in" target="_blank" rel="noopener noreferrer">Sansad records</a> — found <strong>no evidence</strong> of any such bill. PRS Legislative Research''s own real-time log of what actually passed in the 2026 Monsoon Session mentions bills like the <em>Mines and Minerals (Development and Regulation) Amendment Bill</em> — a Creator Economy Bill isn''t on that list. [<a href="https://www.pingnetwork.in/knowledge/ai-in-content-creation-why-quality-still-matters-more-than-tools-2/" target="_blank" rel="noopener noreferrer">PingNetwork Reference</a>]</p>
      
      <blockquote>
        <p><strong>What most likely happened:</strong> A detailed, plausible-sounding claim started circulating on social media, and a wave of blogs wrote it up as confirmed fact without tracing it back to an actual bill number — then cited each other, which made it look more verified with every repost.</p>
      </blockquote>
      
      <p><strong>The practical takeaway:</strong> If a claim about a new "creator law" doesn''t link to <a href="https://sansad.in" target="_blank" rel="noopener noreferrer">sansad.in</a>, <a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer">pib.gov.in</a>, or <a href="https://prsindia.org" target="_blank" rel="noopener noreferrer">prsindia.org</a>, treat it as unverified until it does — especially before making a registration, tax, or contract decision based on it.</p>
      
      <p>That said, the fact that this story spread so easily says something real: India''s creator economy has clearly grown large enough that formal regulation now feels inevitable to a lot of people. Here''s what''s actually true about where things stand.</p>
      
      <h2>India''s Creator Economy, By the Numbers</h2>
      <p>The creator economy isn''t a niche side conversation anymore — it''s a measurable part of India''s digital economy:</p>
      
      <ul>
        <li>A 2025 Boston Consulting Group report estimated India has more than <strong>2 to 2.5 million monetised content creators</strong> influencing over <strong>$350–400 billion</strong> in consumer spending, with creator-influenced consumption projected to exceed <strong>$1 trillion by 2030</strong>. [<a href="https://ascendants.in/spotlight/indian-content-creators-earnings-2026/" target="_blank" rel="noopener noreferrer">Ascendants Report</a>]</li>
        <li>A 2026 report from ISB''s Srini Raju Centre and Hashfame found India''s creator base expanded from <strong>0.96 million in 2020 to 4.12 million by 2025</strong>, with non-metro creators now making up <strong>66% of that base</strong> — the creator economy in India is no longer a metro-city phenomenon. [<a href="https://prodcd.isb.edu/media/ykmjlwaj/india_creator_economy_interactive_report.html" target="_blank" rel="noopener noreferrer">ISB Report</a>]</li>
        <li>India''s influencer marketing industry specifically is estimated by Kofluence at around <strong>₹3,500 crore in 2026</strong>, a distinct (smaller) number from the broader consumer-spending figure above. [<a href="https://ascendants.in/spotlight/indian-content-creators-earnings-2026/" target="_blank" rel="noopener noreferrer">Ascendants</a>]</li>
        <li>Globally, the creator economy is valued at roughly <strong>$234–250 billion in 2026</strong> and is projected to reach <strong>$480 billion by 2027</strong>. [<a href="https://fungies.io/?p=39403" target="_blank" rel="noopener noreferrer">Fungies Research</a>]</li>
      </ul>
      
      <p>That growth is exactly why regulation talk keeps swirling around this space — and why it''s worth knowing what''s already law, regardless of what one viral bill claims.</p>
      
      <h2>The Rules That Already Apply — No New Bill Required</h2>
      <p>You don''t need a new "Creator Economy Bill" to have compliance obligations. Several real frameworks already govern how creators and brands in India operate.</p>
      
      <h3>1. ASCI''s Influencer Advertising Guidelines</h3>
      <p>The Advertising Standards Council of India''s guidelines, in effect since April 2021, require any promotional content to be clearly distinguishable from independent content. In practice, that means: [<a href="https://law.asia/india-issues-guidelines-digital-media-ads-influencers/" target="_blank" rel="noopener noreferrer">Law.asia Guidelines</a>]</p>
      <ul>
        <li><strong>Periodic Livestream Disclosures:</strong> Livestreams must show a disclosure label periodically — roughly once a minute, for five-second stretches, and audio-only content must announce the disclosure at both the start and end.</li>
        <li><strong>Prohibited Beauty Filters:</strong> Filters that alter skin, hair, or teeth in a promotional video are prohibited.</li>
        <li><strong>Mandatory Due Diligence:</strong> Influencers are required to do due diligence on any performance claim they make, and advertiser–influencer agreements must include clauses covering disclosure, filter use, and due diligence — which is exactly why a documented contract matters, bill or no bill.</li>
      </ul>
      <p>This isn''t just a voluntary code with no teeth, either: influencer-related complaints have made up close to 30% of the ads ASCI reviews, and regulatory backing has since given these disclosure requirements real legal weight. [<a href="https://techcrunch.com/?p=2473016" target="_blank" rel="noopener noreferrer">TechCrunch</a>]</p>
      
      <h3>2. SEBI''s Finfluencer Crackdown</h3>
      <p>If you or your creators touch financial content, this one matters. SEBI has barred regulated entities like brokers and mutual funds from associating with unregistered financial influencers ("finfluencers"), and requires any registered finfluencer to display their registration number and grievance-redressal contact on their posts. These rules, introduced in August 2024 and reinforced by an October 2024 advisory, are now fully in effect. [<a href="https://www.angelone.in/news/market-updates/sebi-bans-regulated-entities-from-associating-with-unregistered-finfluencers" target="_blank" rel="noopener noreferrer">Angel One News</a> | <a href="https://www.angelone.in/news/market-updates/sebi-issues-further-clarifications-on-finfluencer-regulations" target="_blank" rel="noopener noreferrer">SEBI Clarifications</a>]</p>
      
      <h3>3. The DPDP Act, 2023</h3>
      <p>India''s Digital Personal Data Protection Act and its Rules were notified in November 2025, establishing the Data Protection Board and bringing administrative provisions into force immediately. Consent Manager registration follows in November 2026, with the full set of substantive obligations — notice and consent standards, breach reporting, and security safeguards — becoming enforceable by May 2027. Any creator agency or brand collecting audience data (email lists, WhatsApp groups, giveaway entries) falls under this. [<a href="https://www.amsshardul.com/wp-content/uploads/2025/11/Regulatory-Alert-Enforcement-of-DPDP-Act-and-Notification-of-DPDP-Rules.pdf" target="_blank" rel="noopener noreferrer">Shardul Amarchand Mangaldas Alert</a>]</p>
      
      <h2>What the Government Has Actually Committed To</h2>
      <p>Separate from the viral bill, the government has made real, documented moves toward supporting the creator economy:</p>
      <ul>
        <li><strong>AVGC Content Creator Labs in 15,000+ Schools:</strong> In the Union Budget 2026, presented on February 1, Finance Minister Nirmala Sitharaman announced AVGC (Animation, Visual Effects, Gaming and Comics) Content Creator Labs across 15,000 secondary schools and 500 colleges, run through the Indian Institute of Creative Technologies, Mumbai. The sector is projected to need nearly 2 million professionals by 2030. [<a href="https://www.exchange4media.com/budget-news/budget-2026-pushes-orange-economy-into-classrooms-151532.html" target="_blank" rel="noopener noreferrer">exchange4media</a> | <a href="https://www.netinfluencer.com/india-to-equip-over-15000-schools-colleges-with-animation-labs-to-meet-creator-economy-demand/" target="_blank" rel="noopener noreferrer">NetInfluencer</a>]</li>
        <li><strong>$1 Billion Creator Support Fund:</strong> Ahead of the WAVES (World Audio Visual and Entertainment Summit) in Mumbai, the Centre announced a $1 billion fund aimed at helping creators access capital, upskill, and scale their production to reach global markets. [<a href="https://www.tribuneindia.com/news/delhi/centre-announces-1-billion-fund-to-boost-creator-economy/amp" target="_blank" rel="noopener noreferrer">The Tribune</a>]</li>
      </ul>
      <p>None of this is the "Creator Economy Bill" people are searching for — but it''s the real, verifiable direction Indian policy is moving in.</p>
      
      <h2>What This Means for Creators and Brands Right Now</h2>
      <ul>
        <li><strong>Don''t wait for a law to formalise your contracts.</strong> ASCI compliance and clear brand-deal terms are enforceable today, not contingent on any future bill.</li>
        <li><strong>Track income and GST thresholds like any other professional.</strong> General GST registration rules already apply to creator income above the standard turnover threshold — this isn''t something a future bill would newly introduce. Check with a CA for your specific numbers.</li>
        <li><strong>Check SEBI status for finance content.</strong> If you''re in finance content, check your registration status before taking brand deals with SEBI-regulated entities.</li>
        <li><strong>Verify legal claims at the source.</strong> Check <a href="https://prsindia.org" target="_blank" rel="noopener noreferrer">prsindia.org</a>, <a href="https://sansad.in" target="_blank" rel="noopener noreferrer">sansad.in</a>, and <a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer">pib.gov.in</a> before changing how you run your business based on something you saw shared online.</li>
      </ul>
      
      <h2>Frequently Asked Questions (FAQs)</h2>
      
      <h3>Is there a Creator Economy Bill in India in 2026?</h3>
      <p>No bill by that name has been confirmed passed or introduced in official Parliament, PIB, or PRS records as of this writing, despite widespread claims online.</p>
      
      <h3>What is the "National Creator Economy Bill 2026" people are talking about?</h3>
      <p>It''s a detailed claim, widely shared on social media and repeated by several blogs, describing a law that recognises creators as professionals and introduces a welfare cess. It has not been traced to any official bill text or parliamentary record.</p>
      
      <h3>What laws currently apply to influencers and content creators in India?</h3>
      <p>ASCI''s influencer advertising guidelines, SEBI''s finfluencer rules (for financial content), the DPDP Act (for data handling), and the IT Rules, 2021 (for platforms) already apply.</p>
      
      <h3>Do content creators have to pay GST in India?</h3>
      <p>Creator income is treated like other professional/business income under existing tax law, and standard GST registration thresholds apply. This predates any creator-specific bill — talk to a CA about your specific situation.</p>
      
      <blockquote>
        <p><strong>Disclaimer:</strong> This article is for general information and isn''t legal or tax advice — check with a qualified professional for guidance specific to your situation.</p>
      </blockquote>',
  '/images/blog/creator-economy-bill-india-2026.jpg',
  'published',
  'news',
  '6 min read',
  '["Creator Economy India","Fact Check","National Creator Bill","ASCI Guidelines","SEBI Finfluencers","DPDP Act"]'::jsonb,
  'Pooja Sundaram',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'Head of Legal & Creator Policy',
  timezone('utc'::text, '2026-09-18T10:00:00Z'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-news-trending-1',
  'YouTube Shopping Expands in India: Creators with 500 Subscribers Can Now Tag Flipkart, Myntra & Nykaa Products',
  'youtube-shopping-affiliate-india-expansion',
  'Google and YouTube expand the Shopping affiliate program across India, enabling mid-tier and micro creators to tag e-commerce products in Shorts and long videos for automated sales commissions.',
  '<p>In one of the most consequential monetization updates for Indian creators, YouTube has officially expanded its <strong>YouTube Shopping Affiliate Program</strong> across India. Backed by Google’s ₹850-crore creator commitment, the initiative lowers the entry barrier, allowing creators with just 500 subscribers to transform their videos into interactive storefronts.</p>
      
      <h3>1. Lowered Eligibility: 500 Subscribers Unlocked</h3>
      <p>Previously reserved for mega-channels, the Shopping affiliate feature is now integrated into the expanded YouTube Partner Program (YPP) tier. Indian channels in good standing with <strong>500 subscribers, 3 valid public uploads in the past 90 days, and either 3,000 public watch hours or 3 million Shorts views</strong> can immediately apply via the YouTube Studio "Earn" tab.</p>
      
      <h3>2. Integrated Retail Giants: Flipkart, Myntra, Nykaa & Purplle</h3>
      <p>Rather than directing viewers to obscure affiliate links in description boxes that get ignored, creators can tag exact fashion items, tech gadgets, skincare cosmetics, and lifestyle products directly over their video frames. Viewers see product pricing in Indian Rupees (₹) and can purchase directly without leaving the YouTube app.</p>
      
      <h3>3. AI-Powered Precision Timestamp Tagging</h3>
      <p>YouTube has integrated machine learning that detects the precise second a creator mentions or holds up a product in a video or Short, floating a non-intrusive "View Products" overlay at peak interest. Early pilot data indicates a <strong>3.2x higher conversion rate</strong> compared to traditional bio links.</p>
      
      <blockquote>
        <strong>Pro Tip for Creators:</strong> Check YouTube Studio > Earn > Shopping. Ensure your channel is set to India and tagged products match the exact SKU you reviewed to avoid return penalties on your commission payouts.
      </blockquote>',
  '/images/blog/yt-shopping-india.jpg',
  'published',
  'news',
  '4 min read',
  '["YouTube Shopping India","Affiliate Monetization","Creator Commerce","Flipkart Myntra"]'::jsonb,
  'Rohan Singhania',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
  'Head of Talent Partnerships',
  timezone('utc'::text, '2026-08-10'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-news-trending-2',
  'SEBI Cracks Down on Unregistered Finfluencers: New Mandatory Compliance & Common Ad Code Explained',
  'sebi-finfluencer-regulations-india-compliance',
  'The Securities and Exchange Board of India enforces strict association bans and introduces the Common Advertisement Code. Financial creators must draw a hard line between education and investment advice.',
  '<p>The golden era of unregulated stock tips and cryptocurrency endorsements in India is officially over. The Securities and Exchange Board of India (SEBI) has transitioned from gentle advisories to rigorous active enforcement, enforcing sweeping restrictions on financial influencers ("finfluencers").</p>
      
      <h3>1. The Strict Broker Association Ban</h3>
      <p>Under SEBI’s latest directive, all SEBI-regulated entities—including top stockbroking apps, mutual fund houses, and algorithmic trading platforms—are legally barred from associating with, paying referral fees to, or sponsoring any creator who is not registered as a SEBI Registered Investment Adviser (RIA) or Research Analyst (RA).</p>
      
      <h3>2. Education vs. Advice: The Critical Boundary</h3>
      <p>Creators are still legally allowed to explain educational concepts (such as what a mutual fund is, how compound interest works, or historical index performances). However, the moment a creator mentions specific buy/sell price targets, predicts stock rallies, or shares personal trading P&L screenshots to entice followers, it is categorized as unauthorized financial advice punishable under the SEBI Act.</p>
      
      <h3>3. The Common Advertisement Code (CAC)</h3>
      <p>SEBI and ASCI have introduced the Common Advertisement Code, classifying prominent financial influencers under the same legal compliance tier as traditional celebrities. Advertisers must conduct third-party due diligence before signing creator contracts, ensuring every sponsor disclosure is unambiguous.</p>
      
      <blockquote>
        <strong>Compliance Checklist:</strong> If you produce finance, crypto, or investing content: (1) Display prominent disclaimers ("Educational purposes only"), (2) Remove all guaranteed return promises from titles and thumbnails, and (3) Apply for NISM certification if planning to offer research recommendations.
      </blockquote>',
  '/images/blog/sebi-finfluencer-rules.jpg',
  'published',
  'news',
  '5 min read',
  '["SEBI Guidelines","Finfluencer Regulations","Financial Content","Ad Compliance"]'::jsonb,
  'Amit Patel',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'Lead Finfluencer & Compliance Advisor',
  timezone('utc'::text, '2026-08-05'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-news-trending-3',
  'India’s Creator Economy Surges Toward ₹5,000 Crore as 66% of New Talent Emerges from Non-Metro Cities',
  'india-creator-economy-5000-crore-tier-2-boom',
  'The Indian influencer industry is projected to touch ₹5,000 crore by 2027. Fuelled by regional language audiences in cities like Jaipur, Lucknow, and Surat, vernacular creators are dominating brand budgets.',
  '<p>The myth that successful digital creators must be based in Mumbai, Delhi, or Bengaluru has been thoroughly shattered. Industry research confirms that India’s creator economy is expanding toward an unprecedented <strong>₹4,500 to ₹5,000 crore valuation by 2027</strong>, with two-thirds of all new creator talent originating in non-metro heartlands.</p>
      
      <h3>1. The Non-Metro Creator Revolution</h3>
      <p>Over <strong>66% of India''s 4.2 million active digital creators</strong> now live and produce content in Tier-2 and Tier-3 cities including Jaipur, Lucknow, Surat, Indore, Patna, and Kochi. Affordable high-speed 5G connectivity combined with accessible mobile production gear has unlocked unprecedented regional storytelling.</p>
      
      <h3>2. Vernacular Engagement Outperforming Metro Content</h3>
      <p>National FMCG, automotive, and fintech brands are allocating up to 45% of their influencer marketing budgets specifically to regional language creators (Hindi, Tamil, Telugu, Marathi, and Bengali). Engagement rates on regional content average <strong>2.8x higher</strong> than generic English-language urban posts, offering brands authentic local trust.</p>
      
      <h3>3. The National Creator Economy Recognition</h3>
      <p>The formalization of the creator sector is gaining immense momentum. With government initiatives like the National Creators Awards and legislative frameworks recognizing digital creators as licensed professionals rather than informal gig workers, creators now have growing access to institutional credit, production grants, and formal brand contracts.</p>
      
      <blockquote>
        <strong>Key Takeaway:</strong> If you create content in your native language or regional dialect, your authentic connection with your local community is your greatest competitive moat. Brands are actively looking for cultural authenticity over studio perfection.
      </blockquote>',
  '/images/blog/india-creator-boom.jpg',
  'published',
  'news',
  '5 min read',
  '["Creator Economy India","Tier 2 Tier 3 Creators","Influencer Market Growth","National Creator Bill"]'::jsonb,
  'Divya Reddy',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'Regional Creator Insights Director',
  timezone('utc'::text, '2026-07-30'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-news-1',
  'YouTube India Monetization Shift & New Tax Guidelines: What Creators Must Know',
  'india-creator-economy-policy-update-2026',
  'Government updates TDS deduction thresholds for digital influencers and YouTube rolls out revised Shorts ad-revenue sharing. Here is the full breakdown for creators.',
  '<p>The Indian creator economy has reached a historic turning point. With over 100 million active digital creators and surging brand budgets, regulatory bodies and platform algorithms have introduced critical policy updates.</p>
      
      <h3>1. Revised Section 194R & TDS on Free Perks</h3>
      <p>Under the latest clarifications from the Income Tax department, free products, luxury trips, and tech samples provided by brands for review are taxable under Section 194R if the creator retains ownership. If the product is returned after filming, no tax applies. Keeping an accurate inventory log is now non-negotiable for creators earning over ₹20 Lakh annually.</p>
      
      <h3>2. YouTube Shorts Monetization Multiplier</h3>
      <p>YouTube has revised its Shorts Revenue Sharing Pool in India, adding a 15% bonus pool for original audio tracks and long-form video click-throughs. Creators who anchor vertical shorts directly to their long-form videos via the "Related Video" feature are reporting a 28% jump in total RPM.</p>
      
      <h3>3. Mandatory ASCI Disclosure Enforcement</h3>
      <p>The Advertising Standards Council of India (ASCI) has deployed automated AI surveillance to detect undeclared brand sponsorships in Reels and YouTube integrations. Using clear disclosures like <em>#PaidCollaboration</em> or <em>#Ad</em> within the first 3 lines of your caption is now legally mandatory to avoid penalties.</p>
      
      <blockquote>
        <strong>Key Action:</strong> Register for GST as soon as your annual brand receipts cross ₹20 Lakhs. This enables input tax credit on cameras, lighting, and editing workstations.
      </blockquote>',
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'published',
  'news',
  '4 min read',
  '["Creator News","YouTube India","Monetization Updates","Taxes"]'::jsonb,
  'Vikram Singh',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'Creator Taxation & Finance Strategist',
  timezone('utc'::text, '2026-07-22'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-1',
  'The 3-Hook Framework: How to Retain 70% of Viewers in the First 5 Seconds',
  'three-hook-framework',
  'Retaining viewers is the hardest part of YouTube. Learn the exact 3-step hook formula that top creators use to spike audience watch time and defeat the drop-off curve.',
  '<p>Every second counts in modern content creation. Data shows that the first 5 seconds of a video determine whether a viewer stays for the next 10 minutes or clicks away. To combat drop-off, professional production houses use the <strong>3-Hook Framework</strong>.</p>
      
      <h3>1. The Visual Hook</h3>
      <p>Never start your video with a generic logo or a slow intro. Start with action or a high-contrast visual that directly matches the thumbnail. If your thumbnail showed a giant mystery box, show that box immediately in the first frame. This visual alignment prevents "bounce rate" by confirming the viewer is in the right place.</p>
      
      <h3>2. The Auditory Hook</h3>
      <p>Sound design drives emotional engagement. Use a custom SFX hit (like a low riser, a whoosh, or a textured paper tear) combined with a curated music track that starts exactly on beat one. The audio should transition from high intensity during the hook to lower intensity during the transition to the body.</p>
      
      <h3>3. The Narrative Hook</h3>
      <p>State the problem and promise the payoff, but withhold the resolution. This creates an open "curiosity loop." For example, instead of saying <em>"Today we are reviewing this camera,"</em> say <em>"This camera has one fatal flaw that almost ruined my entire shoot, and in this video I will show you why."</em></p>
      
      <blockquote>
        <strong>Key Metric:</strong> Aim for a minimum of 70% retention at the 30-second mark in your YouTube Analytics. If it is lower, your hooks are underperforming.
      </blockquote>',
  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'published',
  'strategy',
  '4 min read',
  '["YouTube Retention","Video Editing","Hook Formula"]'::jsonb,
  'Kavya Nair',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'Video Retention & Storyboard Director',
  timezone('utc'::text, '2026-07-01'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-4',
  'Negotiating 6-Figure Brand Deals: The Pricing Formula Top Indian Creators Use',
  'negotiating-six-figure-brand-deals',
  'Stop charging solely based on subscriber count. Discover the multi-tier pricing framework that values audience purchasing power, niche exclusivity, and content licensing.',
  '<p>The biggest mistake emerging creators make when pitching to brands is sending a static rate card tied exclusively to subscriber count or standard CPMs. Media buyers evaluate creators on ROI, conversion affinity, and commercial usage rights.</p>
      
      <h3>1. Base Deliverable vs. Commercial Licensing</h3>
      <p>When a brand asks to sponsor a dedicated integration, they usually want to repurpose your video as a paid ad (Spark Ads or Meta Partnership Ads). Never bundle digital advertising rights into your baseline creation fee. Charge a 30% to 50% licensing fee per 30 days of paid usage rights.</p>
      
      <h3>2. The Exclusivity Premium</h3>
      <p>If a fintech or consumer tech brand asks you not to work with competitors for 60 days, calculate the opportunity cost. Category exclusivity locks down your calendar and warrants a 25% to 40% markup on the base agreement.</p>
      
      <h3>3. Multi-Platform Package Structuring</h3>
      <p>Pitching a YouTube dedicated video alone leaves money on the table. Always offer an integrated package: 1 YouTube Integration + 1 Instagram Reel cutdown + 1 Telegram or Community post. This increases your average deal size by 2.4x while delivering superior cross-channel attribution for the sponsor.</p>',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'published',
  'monetization',
  '6 min read',
  '["Sponsorships","Creator Monetization","Negotiation"]'::jsonb,
  'Kabir Mehta',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  'Brand Deal & Sponsorship Lead',
  timezone('utc'::text, '2026-07-14'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-2',
  'Omnichannel Repurposing: Turning One Video into 15 Viral Shorts',
  'omnichannel-repurposing-strategy',
  'Stop creating content from scratch. Discover the systematic workflow to turn a single 10-minute YouTube video into 15 high-converting vertical shorts without creative burnout.',
  '<p>Creating content is exhausting. If you spend 20 hours editing a long-form YouTube video and only post it once, you are leaving millions of potential impressions on the table. Here is the step-by-step framework to maximize your return on effort.</p>
      
      <h3>The Goldmining Stage</h3>
      <p>Go through your long-form video and find key high-retention moments. Look at the YouTube retention graph and extract the peaks. These peaks are natural candidates for shorts because they contain the highest concentration of value or humor.</p>
      
      <h3>The Vertical Adaptation</h3>
      <p>When crop-framing to 9:16, ensure your subject is always centered. Add high-contrast captions (use bold yellow/white combinations like the popular Hormozi style) to make the content understandable even when muted.</p>
      
      <h3>Cross-Platform Cadence</h3>
      <p>Post these short clips across YouTube Shorts, Instagram Reels, TikTok, and LinkedIn. Space them out over 14 days so you do not spam your audience, and include a clear call-to-action directing viewers to the full-length video.</p>',
  'https://images.unsplash.com/photo-1546074177-ffedd79d494d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'published',
  'production',
  '5 min read',
  '["Shorts","Reels","Repurposing","Workflows"]'::jsonb,
  'Priya Sharma',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'Omnichannel Video Strategist',
  timezone('utc'::text, '2026-07-05'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-3',
  'The Algorithmic Loophole: Optimizing Thumbnails and Titles for CTR',
  'algorithmic-loophole-ctr-optimization',
  'Before editing a single frame, design your thumbnail. Learn the A/B testing frameworks that increase click-through rates by up to 14% on browse features.',
  '<p>Your content could be the most valuable in the world, but if nobody clicks, nobody knows. Click-Through Rate (CTR) is the first gatekeeper of the YouTube algorithm. Here is how to optimize it before you film.</p>
      
      <h3>The Thumbnail-First Rule</h3>
      <p>Never make your thumbnail as an afterthought. Top creators spend up to 40% of their creative budget designing and validating the thumbnail concept before writing the script. The thumbnail is the pitch; the video is the delivery.</p>
      
      <h3>Designing for Mobile Screen Size</h3>
      <p>Keep your focus subject large, clear, and high contrast. 80% of views happen on mobile screens where thumbnails are less than 2 inches wide. Eliminate visual clutter: if an element does not explain the story, delete it.</p>
      
      <h3>The Rule of Split-Second Storytelling</h3>
      <p>The combination of your thumbnail and title should tell a story in under 0.5 seconds. If a viewer has to read or analyze for longer, you have lost them. Pair a high-emotion visual with a short, curiosity-inducing title of under 50 characters.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'published',
  'algorithm',
  '5 min read',
  '["CTR","Thumbnails","YouTube Algorithm"]'::jsonb,
  'Devansh Joshi',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  'Thumbnail & CTR Specialist',
  timezone('utc'::text, '2026-07-10'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());

INSERT INTO public.blog_posts (
  id, title, slug, excerpt, content, featured_image, status, category, read_time, tags, author_name, author_avatar, author_role, created_at, updated_at
) VALUES (
  'blog-5',
  'The 2026 YouTube Algorithm Playbook: Retention vs Satisfaction Signals',
  'youtube-algorithm-satisfaction-signals',
  'Watch time is no longer the sole metric. Understand how post-watch satisfaction surveys, repeat viewership, and share ratios dictate YouTube recommendations today.',
  '<p>For years, creators obsessed over pure Average View Duration (AVD) and Click-Through Rate (CTR). But in 2026, YouTube''s neural recommendation system emphasizes <em>Viewer Satisfaction</em> over raw clickbait hooks.</p>
      
      <h3>1. The Rise of Satisfaction Scoring</h3>
      <p>YouTube actively feeds post-video 5-star survey prompts to millions of viewers. A video with 80% retention that leaves viewers feeling deceived or unsatisfied receives negative recommendation suppression. Build content that delivers genuine payoff.</p>
      
      <h3>2. Repeat Viewership & Cohort Affinity</h3>
      <p>The algorithm rewards channels that turn casual visitors into habitual watchers. Tracking your "Returning Viewers" metric in YouTube Studio is now 3x more predictive of long-term channel health than monthly subscriber growth.</p>
      
      <h3>3. External Signal Multipliers: Shares & Saves</h3>
      <p>When viewers copy link to WhatsApp, share on X, or add to a custom playlist, the algorithm registers deep utility. Design at least one high-utility moment per video (a comparison chart, checklist, or summary graphic) that naturally encourages saving.</p>',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'published',
  'algorithm',
  '7 min read',
  '["Algorithm Updates","Viewer Satisfaction","Watch Time"]'::jsonb,
  'Isha Kapoor',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'Head of Algorithm & Audience Research',
  timezone('utc'::text, '2026-07-18'::timestamptz),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_role = EXCLUDED.author_role,
  updated_at = timezone('utc'::text, now());
