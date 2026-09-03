export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  created_at: string;
  status: 'published' | 'draft';
  author?: {
    full_name: string;
    avatar_url: string;
  };
}

export const STATIC_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The 3-Hook Framework: How to Retain 70% of Viewers in the First 5 Seconds',
    slug: 'three-hook-framework',
    excerpt: 'Retaining viewers is the hardest part of YouTube. Learn the exact hook formula that top creators use to keep audience attention spiked.',
    featured_image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: new Date('2026-07-01').toISOString(),
    status: 'published',
    author: {
      full_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    content: `
      <p>Every second counts in modern content creation. Data shows that the first 5 seconds of a video determine whether a viewer stays for the next 10 minutes or clicks away. To combat drop-off, professional production houses use the <strong>3-Hook Framework</strong>.</p>
      
      <h3>1. The Visual Hook</h3>
      <p>Never start your video with a generic logo or a slow intro. Start with action or a high-contrast visual that directly matches the thumbnail. If your thumbnail showed a giant mystery box, show that box immediately in the first frame. This visual alignment prevents "bounce rate" by confirming the viewer is in the right place.</p>
      
      <h3>2. The Auditory Hook</h3>
      <p>Sound design drives emotional engagement. Use a custom SFX hit (like a low riser, a whoosh, or a textured paper tear) combined with a curated music track that starts exactly on beat one. The audio should transition from high intensity during the hook to lower intensity during the transition to the body.</p>
      
      <h3>3. The Narrative Hook</h3>
      <p>State the problem and promise the payoff, but withhold the resolution. This creates an open "curiosity loop." For example, instead of saying <em>"Today we are reviewing this camera,"</em> say <em>"This camera has one fatal flaw that almost ruined my entire shoot, and in this video I will show you why."</em></p>
      
      <blockquote>
        <strong>Key Metric:</strong> Aim for a minimum of 70% retention at the 30-second mark in your YouTube Analytics. If it is lower, your hooks are underperforming.
      </blockquote>
    `
  },
  {
    id: 'blog-2',
    title: 'Omnichannel Repurposing: Turning One Video into 15 Viral Shorts',
    slug: 'omnichannel-repurposing-strategy',
    excerpt: 'Stop creating content from scratch. Discover the systematic workflow to turn a single 10-minute YouTube video into 15 high-converting vertical shorts.',
    featured_image: 'https://images.unsplash.com/photo-1546074177-ffedd79d494d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: new Date('2026-07-05').toISOString(),
    status: 'published',
    author: {
      full_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    content: `
      <p>Creating content is exhausting. If you spend 20 hours editing a long-form YouTube video and only post it once, you are leaving millions of potential impressions on the table. Here is the step-by-step framework to maximize your return on effort.</p>
      
      <h3>The Goldmining Stage</h3>
      <p>Go through your long-form video and find key high-retention moments. Look at the YouTube retention graph and extract the peaks. These peaks are natural candidates for shorts because they contain the highest concentration of value or humor.</p>
      
      <h3>The Vertical Adaptation</h3>
      <p>When crop-framing to 9:16, ensure your subject is always centered. Add high-contrast captions (use bold yellow/white combinations like the popular Hermozi style) to make the content understandable even when muted.</p>
      
      <h3>Cross-Platform Cadence</h3>
      <p>Post these short clips across YouTube Shorts, Instagram Reels, TikTok, and LinkedIn. Space them out over 14 days so you do not spam your audience, and include a clear call-to-action directing viewers to the full-length video.</p>
    `
  },
  {
    id: 'blog-3',
    title: 'The Algorithmic Loophole: Optimizing Thumbnails and Titles for CTR',
    slug: 'algorithmic-loophole-ctr-optimization',
    excerpt: 'Before editing a single frame, design your thumbnail. Learn the A/B testing frameworks that increase click-through rates by up to 14%.',
    featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: new Date('2026-07-10').toISOString(),
    status: 'published',
    author: {
      full_name: 'Marcus Chen',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    content: `
      <p>Your content could be the most valuable in the world, but if nobody clicks, nobody knows. Click-Through Rate (CTR) is the first gatekeeper of the YouTube algorithm. Here is how to optimize it before you film.</p>
      
      <h3>The Thumbnail-First Rule</h3>
      <p>Never make your thumbnail as an afterthought. Top creators spend up to 40% of their creative budget designing and validating the thumbnail concept before writing the script. The thumbnail is the pitch; the video is the delivery.</p>
      
      <h3>Designing for Mobile Screen Size</h3>
      <p>Keep your focus subject large, clear, and high contrast. 80% of views happen on mobile screens where thumbnails are less than 2 inches wide. Eliminate visual clutter: if an element does not explain the story, delete it.</p>
      
      <h3>The Rule of Split-Second Storytelling</h3>
      <p>The combination of your thumbnail and title should tell a story in under 0.5 seconds. If a viewer has to read or analyze for longer, you have lost them. Pair a high-emotion visual with a short, curiosity-inducing title of under 50 characters.</p>
    `
  }
];
