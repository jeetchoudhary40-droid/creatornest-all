import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { STATIC_POSTS } from '../blogData';

// Revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published');

    if (posts && posts.length > 0) {
      return posts.map((post) => ({
        slug: post.slug,
      }));
    }
  } catch (err) {
    console.warn("generateStaticParams failed, falling back to static params", err);
  }

  return STATIC_POSTS.map(p => ({ slug: p.slug }));
}

async function getPost(slug: string) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:author_id(full_name, avatar_url)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!error && data) return data;
  } catch (err) {
    console.warn("Supabase fetch failed for blog post detail, falling back to static", err);
  }

  const staticPost = STATIC_POSTS.find(p => p.slug === slug);
  return staticPost || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Creator Nest Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>

          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
              </div>
              
              {/* If you link author_id to profiles, it would render here. 
                  For now we just show a static fallback if no author is linked */}
              <div className="flex items-center gap-2">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt={post.author.full_name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-400" />
                  </div>
                )}
                <span>{post.author?.full_name || 'Creator Nest Team'}</span>
              </div>
            </div>
          </header>

          {post.featured_image && (
            <div className="mb-16 rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-white/5 aspect-video relative">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

        </article>
      </main>

      <Footer />
    </div>
  );
}
