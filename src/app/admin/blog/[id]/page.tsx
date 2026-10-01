'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BlogEditor from '@/components/admin/BlogEditor';
import { Loader2 } from 'lucide-react';
import { STATIC_POSTS } from '@/app/blog/blogData';

export default function EditBlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      const postId = Array.isArray(id) ? id[0] : id;

      // 1. Check local overrides from previous edits
      try {
        const localOverridesStr = typeof window !== 'undefined' ? localStorage.getItem('cn_blog_overrides') : null;
        if (localOverridesStr) {
          const overrides = JSON.parse(localOverridesStr);
          if (overrides[postId]) {
            setPost(overrides[postId]);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      // 2. Query Supabase
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .or(`id.eq.${postId},slug.eq.${postId}`)
          .single();

        if (!error && data) {
          setPost(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Table may not exist yet or record is purely static
      }

      // 3. Fallback to STATIC_POSTS
      const staticMatch = STATIC_POSTS.find(p => p.id === postId || p.slug === postId);
      if (staticMatch) {
        setPost({
          id: staticMatch.id,
          title: staticMatch.title,
          slug: staticMatch.slug,
          excerpt: staticMatch.excerpt,
          content: staticMatch.content,
          featured_image: staticMatch.featured_image,
          status: staticMatch.status,
          category: staticMatch.category,
          author_name: staticMatch.author?.full_name || 'Ananya Verma',
          author_avatar:
            staticMatch.author?.avatar_url ||
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          author_role: staticMatch.author?.role || 'Lead Creator Economy Analyst',
        });
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center text-gray-400 py-16 bg-surface border border-white/5 rounded-2xl">
        <p className="text-lg font-bold text-white mb-2">Post Not Found</p>
        <p className="text-sm text-gray-500">The requested blog post could not be located in database or static playbooks.</p>
      </div>
    );
  }

  return <BlogEditor initialData={post} />;
}
