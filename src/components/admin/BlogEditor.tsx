'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminInsert, adminUpdate, adminUpsert } from '@/lib/adminDb';
import { supabase } from '@/lib/supabase';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Upload, User, Sparkles } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export const INDIAN_AUTHORS = [
  {
    name: 'Ananya Verma',
    role: 'Lead Creator Economy Analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    gender: 'Female',
  },
  {
    name: 'Aarav Mehta',
    role: 'Head of Emerging AI Technologies',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    gender: 'Male',
  },
  {
    name: 'Pooja Sundaram',
    role: 'Head of Legal & Creator Policy',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    gender: 'Female',
  },
  {
    name: 'Rohan Singhania',
    role: 'Head of Talent Partnerships',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    gender: 'Male',
  },
  {
    name: 'Amit Patel',
    role: 'Lead Finfluencer & Compliance Advisor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    gender: 'Male',
  },
  {
    name: 'Divya Reddy',
    role: 'Regional Creator Insights Director',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    gender: 'Female',
  },
  {
    name: 'Vikram Singh',
    role: 'Creator Taxation & Finance Strategist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    gender: 'Male',
  },
  {
    name: 'Kavya Nair',
    role: 'Video Retention & Storyboard Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    gender: 'Female',
  },
  {
    name: 'Kabir Mehta',
    role: 'Brand Deal & Sponsorship Lead',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    gender: 'Male',
  },
  {
    name: 'Priya Sharma',
    role: 'Omnichannel Video Strategist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    gender: 'Female',
  },
  {
    name: 'Devansh Joshi',
    role: 'Thumbnail & CTR Specialist',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    gender: 'Male',
  },
  {
    name: 'Isha Kapoor',
    role: 'Head of Algorithm & Audience Research',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    gender: 'Female',
  },
];

interface BlogEditorProps {
  initialData?: any;
}

export default function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featured_image: initialData?.featured_image || '',
    status: initialData?.status || 'published',
    category: initialData?.category || 'strategy',
    author_name:
      initialData?.author_name || initialData?.author?.full_name || INDIAN_AUTHORS[0].name,
    author_avatar:
      initialData?.author_avatar || initialData?.author?.avatar_url || INDIAN_AUTHORS[0].avatar,
    author_role:
      initialData?.author_role || initialData?.author?.role || INDIAN_AUTHORS[0].role,
  });

  // Auto-generate slug from title if it's a new post and slug is empty
  useEffect(() => {
    if (!initialData && formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(f => ({ ...f, slug: generatedSlug }));
    }
  }, [formData.title, initialData, formData.slug]);

  const handleAuthorSelect = (authorName: string) => {
    const selected = INDIAN_AUTHORS.find(a => a.name === authorName);
    if (selected) {
      setFormData(f => ({
        ...f,
        author_name: selected.name,
        author_avatar: selected.avatar,
        author_role: selected.role,
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      setError('Title and Slug are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let finalImageUrl = formData.featured_image;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        const imageExt = imageFile.name.split('.').pop();
        const imageName = `${Date.now()}-blog.${imageExt}`;
        const { data: imgData, error: imgError } = await supabase.storage
          .from('tools-assets')
          .upload(`blog-images/${imageName}`, imageFile);

        if (imgError) throw new Error('Failed to upload image: ' + imgError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from('tools-assets').getPublicUrl(`blog-images/${imageName}`);
        finalImageUrl = publicUrl;
        setUploadingImage(false);
      }

      const postData = {
        id: initialData?.id || formData.slug,
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featured_image: finalImageUrl,
        status: formData.status,
        category: formData.category,
        author_name: formData.author_name,
        author_avatar: formData.author_avatar,
        author_role: formData.author_role,
        updated_at: new Date().toISOString(),
      };

      // 1. Save in local cache overrides for instant responsiveness
      try {
        const localOverridesStr = localStorage.getItem('cn_blog_overrides');
        const overrides = localOverridesStr ? JSON.parse(localOverridesStr) : {};
        overrides[postData.id] = postData;
        overrides[postData.slug] = postData;
        localStorage.setItem('cn_blog_overrides', JSON.stringify(overrides));

        // If it was in deleted list, remove it
        const deletedStr = localStorage.getItem('cn_blog_deleted_ids');
        if (deletedStr) {
          let deletedArr: string[] = JSON.parse(deletedStr);
          deletedArr = deletedArr.filter(d => d !== postData.id && d !== postData.slug);
          localStorage.setItem('cn_blog_deleted_ids', JSON.stringify(deletedArr));
        }
      } catch (e) {}

      // 2. Persist to Supabase database
      try {
        await adminUpsert('blog_posts', postData);
      } catch (dbErr: any) {
        console.warn('Supabase DB sync note:', dbErr.message);
      }

      router.push('/admin/blog');
    } catch (err: any) {
      setError(err.message || 'Failed to save post.');
      setUploadingImage(false);
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Header Card */}
      <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{initialData ? 'Edit Blog Post' : 'Write New Blog Post'}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Author assigned: {formData.author_name}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || uploadingImage}
          className="bg-primary text-background px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {saving || uploadingImage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Section (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-white/5 p-6 rounded-2xl space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Post Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary/50 outline-none transition-colors"
                placeholder="Enter an engaging title..."
              />
            </div>

            <div className="quill-wrapper">
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Content Body *</label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={content => setFormData(f => ({ ...f, content }))}
                modules={modules}
                className="bg-background border border-white/10 rounded-xl text-white focus-within:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls (Right 1 column) */}
        <div className="space-y-6">
          {/* Author Selection Card (Indian Authors) */}
          <div className="bg-surface border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <label className="block text-sm font-semibold text-white">Author & Editor (Indian)</label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Select Indian Author Profile</label>
              <select
                value={formData.author_name}
                onChange={e => handleAuthorSelect(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-colors"
              >
                {INDIAN_AUTHORS.map(a => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({a.gender}) — {a.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Preview Card */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
              <img
                src={formData.author_avatar}
                alt={formData.author_name}
                className="w-12 h-12 rounded-full object-cover border border-primary/40 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white leading-tight">{formData.author_name}</p>
                <p className="text-xs text-primary font-medium truncate mt-0.5">{formData.author_role}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Custom Author Name</label>
              <input
                type="text"
                value={formData.author_name}
                onChange={e => setFormData(f => ({ ...f, author_name: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary/50 outline-none"
                placeholder="Author Name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Custom Author Avatar URL</label>
              <input
                type="url"
                value={formData.author_avatar}
                onChange={e => setFormData(f => ({ ...f, author_avatar: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary/50 outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Publishing Settings Card */}
          <div className="bg-surface border border-white/5 p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Post Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-colors"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-colors"
              >
                <option value="strategy">Growth & Strategy</option>
                <option value="news">Creator's News</option>
                <option value="monetization">Brand Deals & Revenue</option>
                <option value="algorithm">Algorithm & CTR</option>
                <option value="production">Production & Workflows</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">URL Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none transition-colors font-mono"
                placeholder="my-awesome-post"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Short Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={e => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none transition-colors resize-none"
                placeholder="A brief summary of the post..."
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Featured Image</label>
              <div className="space-y-3">
                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group bg-white/5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold truncate text-white">
                        {imageFile ? imageFile.name : 'Upload New Image'}
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={e => {
                    setFormData(f => ({ ...f, featured_image: e.target.value }));
                    setImageFile(null);
                  }}
                  className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-primary/50 outline-none transition-colors"
                  placeholder="Or paste image URL (https://...)"
                />
              </div>

              {(formData.featured_image || imageFile) && (
                <div className="mt-3 rounded-xl overflow-hidden w-full aspect-video border border-white/10 relative">
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : formData.featured_image}
                    alt="Featured preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS overrides for react-quill dark mode */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .quill-wrapper .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          background: rgba(255, 255, 255, 0.02) !important;
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
        }
        .quill-wrapper .ql-container {
          border: none !important;
          font-family: inherit !important;
          font-size: 0.95rem !important;
          min-height: 380px !important;
          color: #e2e8f0 !important;
          border-bottom-left-radius: 0.75rem !important;
          border-bottom-right-radius: 0.75rem !important;
        }
        .quill-wrapper .ql-stroke {
          stroke: #94a3b8 !important;
        }
        .quill-wrapper .ql-fill {
          fill: #94a3b8 !important;
        }
        .quill-wrapper .ql-picker {
          color: #94a3b8 !important;
        }
        .quill-wrapper .ql-picker-options {
          background-color: #0d131f !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem !important;
        }
      `,
        }}
      />
    </div>
  );
}
