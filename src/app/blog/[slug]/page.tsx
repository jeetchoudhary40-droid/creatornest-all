import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { STATIC_POSTS, BlogPost } from '../blogData';
import ArticleClientView from './ArticleClientView';

// Revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  // Pre-render all static posts immediately for instant navigation
  return STATIC_POSTS.map(p => ({ slug: p.slug }));
}

async function getPost(slug: string): Promise<BlogPost | null> {
  // 1. Fast path: Match static post immediately (0ms delay, zero network lag)
  const staticPost = STATIC_POSTS.find(p => p.slug === slug);
  if (staticPost) {
    return staticPost;
  }

  // 2. Fallback: If not in static posts, query Supabase with a tight 1s timeout
  try {
    const { supabase } = await import('@/lib/supabase');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:author_id(full_name, avatar_url)')
      .eq('slug', slug)
      .eq('status', 'published')
      .abortSignal(controller.signal)
      .single();

    clearTimeout(timeout);

    if (!error && data) {
      return {
        ...data,
        category: data.category || 'strategy',
        readTime: data.readTime || '5 min read',
        tags: data.tags || ['Creator Economy'],
        author: data.author || {
          full_name: 'Creator Nest Team',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          role: 'Creator Strategist'
        }
      };
    }
  } catch {
    // Graceful fallback
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) return { title: 'Post Not Found | Creator Nest' };

  return {
    title: `${post.title} | Creator Nest Blog`,
    description: post.excerpt,
    keywords: post.tags || ['creator strategy', 'youtube growth', 'brand deals', 'creator news'],
    alternates: {
      canonical: `https://creatornest.in/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Creator Nest Blog`,
      description: post.excerpt,
      url: `https://creatornest.in/blog/${post.slug}`,
      siteName: 'Creator Nest',
      images: post.featured_image ? [
        {
          url: post.featured_image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author?.full_name || 'Creator Nest'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
      creator: '@creatornest',
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Related posts (excluding current post)
  const relatedPosts = STATIC_POSTS.filter(p => p.slug !== post.slug).slice(0, 3);

  // Schema.org BlogPosting structured data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
    datePublished: post.created_at,
    dateModified: post.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://creatornest.in/blog/${post.slug}`,
    },
    author: {
      '@type': 'Person',
      name: post.author?.full_name || 'Creator Nest Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Creator Nest',
      logo: {
        '@type': 'ImageObject',
        url: 'https://creatornest.in/images/og-cover.png',
      },
    },
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
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://creatornest.in/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070B11] text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />
      
      {/* Client view with language switching reactivity */}
      <ArticleClientView post={post} relatedPosts={relatedPosts} />

      <Footer />
    </div>
  );
}
