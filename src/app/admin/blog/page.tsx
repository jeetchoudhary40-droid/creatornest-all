'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { adminDelete, adminUpdate } from '@/lib/adminDb';
import { BookOpen, Plus, Edit, Trash2, CheckCircle2, XCircle, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminDelete('blog_posts', id);
      fetchPosts();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleToggleStatus = async (post: any) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await adminUpdate('blog_posts', post.id, { status: newStatus });
      fetchPosts();
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Blog Manager</h1>
            <p className="text-sm text-gray-400">Manage and publish blog posts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/new"
            className="bg-primary text-background px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Write Post
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Post</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading posts...
                </td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No blog posts yet. Click "Write Post" to get started!
                </td></tr>
              ) : posts.map(post => (
                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.featured_image ? (
                        <img src={post.featured_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white text-sm">{post.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{post.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">/{post.slug}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(post)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        post.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {post.status === 'published' ? <><CheckCircle2 className="w-3 h-3" /> Published</> : <><XCircle className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {post.status === 'published' && (
                        <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white transition-colors" title="Preview">
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link href={`/admin/blog/${post.id}`} className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(post.id, post.title)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
