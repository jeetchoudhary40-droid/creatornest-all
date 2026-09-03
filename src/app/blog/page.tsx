'use client';

import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { STATIC_POSTS } from './blogData';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<any[]>(() => STATIC_POSTS);

  useEffect(() => {
    const loadBlogs = async () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cn_blog_posts');
        if (cached) {
          setPosts(JSON.parse(cached));
        }
      }

      try {
        const { data: dbPosts, error } = await supabase
          .from('blog_posts')
          .select('*, author:author_id(full_name, avatar_url)')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && dbPosts && dbPosts.length > 0) {
          setPosts(dbPosts);
          if (typeof window !== 'undefined') {
            localStorage.setItem('cn_blog_posts', JSON.stringify(dbPosts));
          }
          return;
        }

        // Auto-seed to Supabase if empty and no error occurred
        if (!error && dbPosts && dbPosts.length === 0) {
          const seedPayload = STATIC_POSTS.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            content: p.content,
            featured_image: p.featured_image,
            created_at: p.created_at,
            status: p.status
          }));
          await supabase.from('blog_posts').insert(seedPayload);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
              <BookOpen className="w-4 h-4" /> Creator Nest Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
              Insights, news, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE]">creator tips</span>
            </h1>
            <p className="text-xl text-gray-400">
              Stay up to date with the latest from the Creator Nest ecosystem and learn how to grow your channel.
            </p>
          </motion.div>
        </div>

        {/* Blog grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-gray-500 mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
            <p className="text-gray-400">Check back soon for our latest updates and articles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,242,254,0.1)] flex flex-col"
              >
                <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-white/5">
                  {post.featured_image ? (
                    <img 
                      src={post.featured_image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                </Link>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all mt-auto"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
