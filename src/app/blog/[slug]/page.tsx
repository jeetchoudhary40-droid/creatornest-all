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
  const staticPost = STATIC_POSTS.find(p => p.slug === slug);

  // 1. Query Supabase for any live database updates
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
        ...staticPost,
        ...data,
        category: data.category || staticPost?.category || 'strategy',
        readTime: data.read_time || data.readTime || staticPost?.readTime || '5 min read',
        tags: data.tags || staticPost?.tags || ['Creator Economy'],
        author: data.author_name ? {
          full_name: data.author_name,
          avatar_url: data.author_avatar || staticPost?.author?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          role: data.author_role || staticPost?.author?.role || 'Lead Creator Economy Analyst'
        } : (data.author || staticPost?.author || {
          full_name: 'Ananya Verma',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          role: 'Lead Creator Economy Analyst'
        })
      };
    }
  } catch {
    // Graceful fallback to static post
  }

  // 2. Return static post if no DB override exists
  if (staticPost) {
    return staticPost;
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) return { title: 'Post Not Found | Creator Nest' };

  const pageTitle = post.meta_title ? { absolute: post.meta_title } : `${post.title} | Creator Nest Blog`;
  const rawTitle = post.meta_title || `${post.title} | Creator Nest Blog`;
  const metaDescription = post.meta_description || post.excerpt;

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: post.tags || ['creator strategy', 'youtube growth', 'brand deals', 'creator news'],
    alternates: {
      canonical: `https://creatornest.in/blog/${post.slug}`,
    },
    openGraph: {
      title: rawTitle,
      description: metaDescription,
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
      title: rawTitle,
      description: metaDescription,
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
