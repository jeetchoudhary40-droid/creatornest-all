'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminInsert, adminUpdate } from '@/lib/adminDb';
import { supabase } from '@/lib/supabase';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
    status: initialData?.status || 'draft',
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
        
        const { data: { publicUrl } } = supabase.storage.from('tools-assets').getPublicUrl(`blog-images/${imageName}`);
        finalImageUrl = publicUrl;
        setUploadingImage(false);
      }

      const postData = {
        ...formData,
        featured_image: finalImageUrl,
        // Assuming the author_id will be handled or is null for now if we don't have it directly. 
        // In a real app, you'd set this to the current user's ID.
      };

      if (initialData) {
        await adminUpdate('blog_posts', initialData.id, postData);
      } else {
        await adminInsert('blog_posts', postData);
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
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{initialData ? 'Edit Post' : 'Write New Post'}</h1>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || uploadingImage}
          className="bg-primary text-background px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {(saving || uploadingImage) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Post'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Content *</label>
              <ReactQuill 
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData(f => ({ ...f, content }))}
                modules={modules}
                className="bg-background border border-white/10 rounded-xl text-white focus-within:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-white/5 p-6 rounded-2xl space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Post Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">URL Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                placeholder="my-awesome-post"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={e => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors resize-none"
                placeholder="A brief summary of the post..."
              />
            </div>

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
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate text-white">{imageFile ? imageFile.name : 'Upload Image'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <div className="flex-1 border-t border-white/10"></div>
                  <span>OR</span>
                  <div className="flex-1 border-t border-white/10"></div>
                </div>

                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={e => { setFormData(f => ({ ...f, featured_image: e.target.value })); setImageFile(null); }}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>

              {(formData.featured_image || imageFile) && (
                <div className="mt-4 rounded-xl overflow-hidden w-full aspect-video border border-white/10 relative">
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
      <style dangerouslySetInnerHTML={{__html: `
        .quill-wrapper .ql-toolbar {
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          padding: 12px;
        }
        .quill-wrapper .ql-container {
          border: none;
          min-height: 400px;
          font-size: 1rem;
        }
        .quill-wrapper .ql-editor {
          min-height: 400px;
          padding: 1.5rem;
        }
        .quill-wrapper .ql-stroke { stroke: #9ca3af; }
        .quill-wrapper .ql-fill { fill: #9ca3af; }
        .quill-wrapper .ql-picker { color: #9ca3af; }
        .quill-wrapper .ql-picker-options {
          background-color: #1a1b23;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .quill-wrapper button:hover .ql-stroke { stroke: #00f2fe; }
        .quill-wrapper button:hover .ql-fill { fill: #00f2fe; }
        .quill-wrapper .ql-active .ql-stroke { stroke: #00f2fe; }
        .quill-wrapper .ql-active .ql-fill { fill: #00f2fe; }
      `}} />
    </div>
  );
}
