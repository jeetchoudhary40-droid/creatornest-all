import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogClientView from './BlogClientView';
import { STATIC_POSTS, BlogPost } from './blogData';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Blog & Creator Playbooks | Growth, Monetization & Algorithm Insights',
  description: 'Master the creator economy with Creator Nest playbooks. Retention frameworks, 6-figure brand deal negotiation strategies, thumbnail CTR A/B testing, and YouTube algorithm guides.',
  keywords: [
    'creator economy blog',
    'youtube growth strategies',
    'brand deals negotiation india',
    'creator monetization playbook',
    'thumbnail ctr optimization',
    'youtube algorithm 2026',
    'influencer marketing guide',
    'creator nest articles'
  ],
  alternates: {
    canonical: 'https://creatornest.in/blog',
  },
  openGraph: {
    title: 'Creator Nest Blog | Growth, Monetization & Algorithm Playbooks',
    description: 'Battle-tested creator growth strategies, brand deal pricing models, and algorithm updates for top digital creators.',
    url: 'https://creatornest.in/blog',
    siteName: 'Creator Nest',
    images: [
      {
        url: '/images/og-cover.png',
        width: 1200,
        height: 630,
        alt: 'Creator Nest Blog & Playbooks',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Nest Blog | Fueling Creators to Become Brands',
    description: 'Battle-tested creator growth strategies, brand deal pricing models, and algorithm updates.',
    images: ['/images/og-cover.png'],
  }
};

async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);

    const { data: dbPosts, error } = await supabase
      .from('blog_posts')
      .select('*, author:author_id(full_name, avatar_url)')
      .eq('status', 'published')
      .abortSignal(controller.signal)
      .order('created_at', { ascending: false });

    clearTimeout(timeout);

    if (!error && dbPosts && dbPosts.length > 0) {
      return dbPosts.map((dbPost: any) => {
        const matchingStatic = STATIC_POSTS.find(p => p.slug === dbPost.slug);
        return {
          ...dbPost,
          category: dbPost.category || matchingStatic?.category || 'strategy',
          readTime: dbPost.readTime || matchingStatic?.readTime || '5 min read',
          tags: dbPost.tags || matchingStatic?.tags || ['Creator Growth'],
          featured: dbPost.featured ?? matchingStatic?.featured ?? false,
          author: dbPost.author || matchingStatic?.author || {
            full_name: 'Creator Nest Team',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            role: 'Creator Strategist'
          }
        };
      });
    }
  } catch {
    // Return static posts instantly
  }

  return STATIC_POSTS;
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  // JSON-LD Structured Data for SEO Rich Snippets
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Creator Nest Blog & Playbooks',
    description: 'Actionable creator economy playbooks, brand deal negotiations, and YouTube algorithm frameworks.',
    url: 'https://creatornest.in/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Creator Nest',
      url: 'https://creatornest.in',
      logo: 'https://creatornest.in/images/og-cover.png',
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://creatornest.in/blog/${post.slug}`,
      datePublished: post.created_at,
      image: post.featured_image,
      author: {
        '@type': 'Person',
        name: post.author?.full_name || 'Creator Nest Team',
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://creatornest.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://creatornest.in/blog',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <BlogClientView initialPosts={posts} />
      <Footer />
    </>
  );
}
