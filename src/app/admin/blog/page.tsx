'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { adminDelete, adminUpdate } from '@/lib/adminDb';
import { BookOpen, Plus, Edit, Trash2, CheckCircle2, XCircle, Loader2, Eye, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { STATIC_POSTS, BlogPost } from '@/app/blog/blogData';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // 1. Fetch posts from Supabase if table exists
      let dbPosts: any[] = [];
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          dbPosts = data;
        }
      } catch (err) {
        // Supabase table may not exist yet
      }

      // 2. Read local overrides and deleted IDs from localStorage
      let localOverrides: Record<string, any> = {};
      let localDeletedIds: string[] = [];
      try {
        const overridesStr = localStorage.getItem('cn_blog_overrides');
        if (overridesStr) localOverrides = JSON.parse(overridesStr);
        const deletedStr = localStorage.getItem('cn_blog_deleted_ids');
        if (deletedStr) localDeletedIds = JSON.parse(deletedStr);
      } catch (e) {}

      const deletedSet = new Set(localDeletedIds);

      // 3. Format DB posts
      const dbSlugs = new Set(dbPosts.map((p: any) => p.slug));
      const dbIds = new Set(dbPosts.map((p: any) => String(p.id)));

      // 4. Map static posts that aren't already represented in DB
      const staticList = STATIC_POSTS
        .filter(sp => !dbSlugs.has(sp.slug) && !dbIds.has(sp.id))
        .map(sp => ({
          id: sp.id,
          title: sp.title,
          slug: sp.slug,
          excerpt: sp.excerpt,
          content: sp.content,
          featured_image: sp.featured_image,
          status: sp.status,
          category: sp.category,
          created_at: sp.created_at,
          author_name: sp.author?.full_name || 'Ananya Verma',
          author_avatar: sp.author?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          author_role: sp.author?.role || 'Lead Creator Economy Analyst',
          is_static: true,
        }));

      // Combine both lists
      let combined = [...dbPosts, ...staticList];

      // Apply local overrides
      combined = combined.map(post => {
        if (localOverrides[post.id]) {
          return { ...post, ...localOverrides[post.id] };
        }
        if (localOverrides[post.slug]) {
          return { ...post, ...localOverrides[post.slug] };
        }
        return post;
      });

      // Exclude deleted posts
      combined = combined.filter(
        p => !deletedSet.has(p.id) && !deletedSet.has(p.slug) && p.status !== 'deleted'
      );

      setPosts(combined);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      // Fallback to static posts
      setPosts(
        STATIC_POSTS.map(sp => ({
          id: sp.id,
          title: sp.title,
          slug: sp.slug,
          excerpt: sp.excerpt,
          content: sp.content,
          featured_image: sp.featured_image,
          status: sp.status,
          category: sp.category,
          created_at: sp.created_at,
          author_name: sp.author?.full_name || 'Ananya Verma',
          author_avatar: sp.author?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          author_role: sp.author?.role || 'Lead Creator Economy Analyst',
          is_static: true,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      // 1. Try deleting from Supabase
      try {
        await adminDelete('blog_posts', id);
      } catch (err) {
        // Table might not exist or record is purely static
      }

      // 2. Persist deletion in localStorage
      try {
        const deletedStr = localStorage.getItem('cn_blog_deleted_ids');
        const deletedArr: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (!deletedArr.includes(id)) deletedArr.push(id);
        if (slug && !deletedArr.includes(slug)) deletedArr.push(slug);
        localStorage.setItem('cn_blog_deleted_ids', JSON.stringify(deletedArr));

        // Also clean up any override
        const overridesStr = localStorage.getItem('cn_blog_overrides');
        if (overridesStr) {
          const overrides = JSON.parse(overridesStr);
          delete overrides[id];
          delete overrides[slug];
          localStorage.setItem('cn_blog_overrides', JSON.stringify(overrides));
        }
      } catch (e) {}

      // Refresh list
      fetchPosts();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleToggleStatus = async (post: any) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      // 1. Try updating in Supabase
      try {
        await adminUpdate('blog_posts', post.id, { status: newStatus });
      } catch (err) {}

      // 2. Persist in local overrides
      try {
        const overridesStr = localStorage.getItem('cn_blog_overrides');
        const overrides = overridesStr ? JSON.parse(overridesStr) : {};
        overrides[post.id] = { ...(overrides[post.id] || post), status: newStatus };
        if (post.slug) overrides[post.slug] = { ...(overrides[post.slug] || post), status: newStatus };
        localStorage.setItem('cn_blog_overrides', JSON.stringify(overrides));
      } catch (e) {}

      fetchPosts();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Blog Manager</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {posts.length} Posts
              </span>
            </div>
            <p className="text-sm text-gray-400">View, edit, or publish articles with Indian author credentials</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/new"
            className="bg-primary text-background px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> Write Post
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blogs by title, slug, or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-primary/50 outline-none transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="w-full sm:w-auto bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:border-primary/50 outline-none transition-colors"
        >
          <option value="all">All Categories</option>
          <option value="news">Creator's News</option>
          <option value="strategy">Growth & Strategy</option>
          <option value="monetization">Brand Deals & Revenue</option>
          <option value="algorithm">Algorithm & CTR</option>
          <option value="production">Production & Workflows</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider bg-white/[0.01]">
                <th className="px-6 py-4 font-semibold">Post Title & Niche</th>
                <th className="px-6 py-4 font-semibold">Author & Editor</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Published</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-sm font-medium">Loading blog articles...</p>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm font-semibold text-gray-300">No blog posts found</p>
                    <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or click "Write Post".</p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map(post => {
                  const authorName = post.author_name || post.author?.full_name || 'Ananya Verma';
                  const authorAvatar =
                    post.author_avatar ||
                    post.author?.avatar_url ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
                  const authorRole = post.author_role || post.author?.role || 'Creator Economy Analyst';

                  return (
                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-md">
                          {post.featured_image ? (
                            <img
                              src={post.featured_image}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                              <BookOpen className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="font-semibold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                              {post.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400">
                                {post.category || 'strategy'}
                              </span>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{post.excerpt}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-8 h-8 rounded-full object-cover border border-primary/30 shrink-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-200 leading-tight">{authorName}</p>
                            <p className="text-[11px] text-gray-500 leading-tight">{authorRole}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-gray-400">/{post.slug}</td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(post)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            post.status === 'published'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          {post.status === 'published' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-400">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            title="Preview on live site"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit blog post"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.slug, post.title)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete blog post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
