'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { adminInsert, adminUpdate, adminDelete } from '@/lib/adminDb';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, X, Save, BookOpen, Loader2, ListVideo,
  Eye, EyeOff, CheckCircle2, XCircle, Star, Tag, Users, Clock, Image as ImageIcon, Upload
} from 'lucide-react';
import Link from 'next/link';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

const CATEGORIES = ['AI Tools', 'Growth', 'Monetization', 'Production', 'Brand Deals', 'Social Media', 'Business', 'Design', 'Marketing', 'Writing'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const PLANS = ['free', 'silver', 'gold', 'platinum'];

const PLAN_COLORS: Record<string, string> = {
  free: '#6B7280', silver: '#C0C0C0', gold: '#F59E0B', platinum: '#00F2FE'
};

const emptyForm = () => ({
  title: '',
  short_desc: '',
  long_desc: '',
  instructor: 'Creator Nest Team',
  category: 'AI Tools',
  level: 'Beginner',
  duration: '',
  plan: 'free',
  accent: '#00F2FE',
  thumbnail_url: '',
  tags: [] as string[],
  outcomes: ['', '', '', ''] as string[],
  is_published: false,
});

const RAW_STATIC_COURSES = [
  {
    id: '1',
    title: 'ChatGPT for Script Writing',
    short_desc: 'Master AI-powered scriptwriting — hooks, storytelling arcs, and viral formats using ChatGPT prompts built for creators.',
    long_desc: 'Master AI-powered scriptwriting — hooks, storytelling arcs, and viral formats using ChatGPT prompts built for creators.',
    level: 'Beginner',
    duration: '45 min',
    rating: 4.9,
    students: 1240,
    instructor: 'Creator Nest Team',
    category: 'AI Tools',
    plan: 'free',
    accent: '#00F2FE',
    icon: 'Brain',
    outcomes: [
      'Write a full YouTube script in under 10 minutes using AI',
      'Create 5 different viral hook formulas for any niche',
      'Build a ChatGPT prompt library personalised to your voice',
      'Adapt scripts across platforms (YouTube, Reels, Shorts)'
    ],
    tags: ['ChatGPT', 'Scripts', 'AI'],
    is_published: true,
    user_course_enrollments: [{ count: 1240 }]
  },
  {
    id: '2',
    title: 'Midjourney Thumbnail Mastery',
    short_desc: 'Create scroll-stopping thumbnails with Midjourney. Learn prompting, style tuning, and A/B testing workflows.',
    long_desc: 'Create scroll-stopping thumbnails with Midjourney. Learn prompting, style tuning, and A/B testing workflows.',
    level: 'Intermediate',
    duration: '1.5 hrs',
    rating: 4.8,
    students: 980,
    instructor: 'Creator Nest Team',
    category: 'AI Tools',
    plan: 'free',
    accent: '#3B82F6',
    icon: 'Palette',
    outcomes: [
      'Prompt Midjourney for thumb layout and compositions',
      'Generate photorealistic characters and text overlays',
      'Understand thumbnail design psychology & click-through rates',
      'Perform color grading and character separation in Photoshop'
    ],
    tags: ['Midjourney', 'Thumbnails', 'Design'],
    is_published: true,
    user_course_enrollments: [{ count: 980 }]
  },
  {
    id: '3',
    title: 'AI Video Generation with Runway & Sora',
    short_desc: 'Produce cinematic B-roll and effects using Runway ML and OpenAI Sora. No camera required.',
    long_desc: 'Produce cinematic B-roll and effects using Runway ML and OpenAI Sora. No camera required.',
    level: 'Advanced',
    duration: '2 hrs',
    rating: 4.7,
    students: 650,
    instructor: 'Creator Nest Team',
    category: 'AI Tools',
    plan: 'free',
    accent: '#10B981',
    icon: 'Video',
    outcomes: [
      'Write prompts to generate video assets from scratch',
      'Control camera motions, lighting, and camera pans in Gen-2',
      'Combine multiple AI video generations with text overlays',
      'Build cinematic video workflows with B-roll'
    ],
    tags: ['Runway', 'Sora', 'Video AI'],
    is_published: true,
    user_course_enrollments: [{ count: 650 }]
  },
  {
    id: '4',
    title: 'Landing Your First Brand Deal',
    short_desc: 'Step-by-step playbook to pitch brands, negotiate rates, and close your first paid collaboration — even under 10K followers.',
    long_desc: 'Step-by-step playbook to pitch brands, negotiate rates, and close your first paid collaboration — even under 10K followers.',
    level: 'Beginner',
    duration: '1 hr',
    rating: 4.9,
    students: 2150,
    instructor: 'Creator Nest Team',
    category: 'Brand Deals',
    plan: 'free',
    accent: '#F59E0B',
    icon: 'Target',
    outcomes: [
      'Assemble a professional media kit that wins brands',
      'Calculate outbound pitching pricing & fee rates',
      'Write highly successful outbound cold emails to agencies',
      'Review exclusivity and standard brand deal contracts'
    ],
    tags: ['Pitching', 'Negotiation', 'First Deal'],
    is_published: true,
    user_course_enrollments: [{ count: 2150 }]
  }
];

const STATIC_COURSES = RAW_STATIC_COURSES.map(c => ({
  ...c,
  id: getUUIDFromStaticId(String(c.id))
}));

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>(() => STATIC_COURSES);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'media'>('basic');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState(emptyForm());

  const fetchCourses = async () => {
    setLoading(true);

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cn_courses');
      if (cached) {
        setCourses(JSON.parse(cached));
      }
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, user_course_enrollments(count)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setCourses(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cn_courses', JSON.stringify(data));
        }
      } else {
        if (courses.length === 0) {
          setCourses(STATIC_COURSES);
        }
      }
    } catch (e) {
      console.warn("Database fetch failed, keeping static courses", e);
      if (courses.length === 0) {
        setCourses(STATIC_COURSES);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpenModal = (course?: any) => {
    setError('');
    setActiveTab('basic');
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title || '',
        short_desc: course.short_desc || '',
        long_desc: course.long_desc || '',
        instructor: course.instructor || 'Creator Nest Team',
        category: course.category || 'AI Tools',
        level: course.level || 'Beginner',
        duration: course.duration || '',
        plan: course.plan || 'free',
        accent: course.accent || '#00F2FE',
        thumbnail_url: course.thumbnail_url || '',
        tags: course.tags || [],
        outcomes: course.outcomes?.length ? [...course.outcomes, ...Array(Math.max(0, 4 - course.outcomes.length)).fill('')] : ['', '', '', ''],
        is_published: course.is_published || false,
      });
    } else {
      setEditingCourse(null);
      setFormData(emptyForm());
    }
    setTagInput('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { setError('Course title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let finalThumbnailUrl = formData.thumbnail_url;
      
      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        const imageExt = imageFile.name.split('.').pop();
        const imageName = `${Date.now()}-course.${imageExt}`;
        const { data: imgData, error: imgError } = await supabase.storage
          .from('tools-assets')
          .upload(`course-thumbnails/${imageName}`, imageFile);
        
        if (imgError) throw new Error('Failed to upload thumbnail: ' + imgError.message);
        
        const { data: { publicUrl } } = supabase.storage.from('tools-assets').getPublicUrl(`course-thumbnails/${imageName}`);
        finalThumbnailUrl = publicUrl;
        setUploadingImage(false);
      }

      const cleanData = {
        ...formData,
        thumbnail_url: finalThumbnailUrl,
        outcomes: formData.outcomes.filter(o => o.trim()),
        tags: formData.tags.filter(t => t.trim()),
      };
      
      let updatedList = [];
      if (editingCourse) {
        try {
          await adminUpdate('courses', editingCourse.id, cleanData);
        } catch (dbErr) {
          console.warn("Offline: Updating course locally", dbErr);
        }
        updatedList = courses.map(c => c.id === editingCourse.id ? { ...c, ...cleanData } : c);
        setCourses(updatedList);
        setIsModalOpen(false);
      } else {
        let insertedId = `course-${Date.now()}`;
        try {
          const response = await adminInsert('courses', cleanData);
          if (response && response.data && response.data.length > 0) {
            insertedId = response.data[0].id;
          }
        } catch (dbErr) {
          console.warn("Offline: Inserting course locally", dbErr);
        }
        
        const newCourse = {
          id: insertedId,
          ...cleanData,
          user_course_enrollments: [{ count: 0 }]
        };
        updatedList = [newCourse, ...courses];
        setCourses(updatedList);
        setIsModalOpen(false);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('cn_courses', JSON.stringify(updatedList));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save. Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
      setUploadingImage(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also delete all sections and lessons.`)) return;
    try {
      await adminDelete('courses', id);
    } catch (err: any) {
      console.warn("Offline: Deleting course locally", err);
    }
    const updatedList = courses.filter(c => c.id !== id);
    setCourses(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cn_courses', JSON.stringify(updatedList));
    }
  };

  const handleTogglePublish = async (course: any) => {
    try {
      await adminUpdate('courses', course.id, { is_published: !course.is_published });
    } catch (err: any) {
      console.warn("Offline: Toggling publish locally", err);
    }
    const updatedList = courses.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c);
    setCourses(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cn_courses', JSON.stringify(updatedList));
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setFormData(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const updateOutcome = (i: number, val: string) => {
    const next = [...formData.outcomes];
    next[i] = val;
    setFormData(f => ({ ...f, outcomes: next }));
  };

  const addOutcome = () => setFormData(f => ({ ...f, outcomes: [...f.outcomes, ''] }));
  const removeOutcome = (i: number) => setFormData(f => ({ ...f, outcomes: f.outcomes.filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Course Manager</h1>
            <p className="text-sm text-gray-400">Build and publish your courses</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/courses/ratings" className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors">
            <Star className="w-4 h-4 text-yellow-400" /> Ratings
          </Link>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-background px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Level</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Students</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading courses...
                </td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  No courses yet. Click "Add Course" to get started!
                </td></tr>
              ) : courses.map(course => (
                <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${course.accent || '#00F2FE'}20` }}>
                          <BookOpen className="w-5 h-5" style={{ color: course.accent || '#00F2FE' }} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white text-sm">{course.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{course.short_desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{course.category || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{course.level}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase" style={{ background: `${PLAN_COLORS[course.plan]}15`, color: PLAN_COLORS[course.plan] }}>
                      {course.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      {course.students_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {course.total_ratings > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{course.rating}</span>
                        <span className="text-xs text-gray-500">({course.total_ratings})</span>
                      </div>
                    ) : <span className="text-xs text-gray-600">No ratings</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        course.is_published ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {course.is_published ? <><CheckCircle2 className="w-3 h-3" /> Published</> : <><XCircle className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/nschool/course/${course.id}`} target="_blank" className="p-2 text-gray-400 hover:text-white transition-colors" title="Preview">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/courses/${course.id}`} className="p-2 text-primary hover:text-primary/80 transition-colors" title="Curriculum Builder">
                        <ListVideo className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleOpenModal(course)} className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(course.id, course.title)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
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

      {/* Course Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">All fields match the public course page</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-white/5 flex-shrink-0 px-6">
                {[
                  { id: 'basic', label: 'Basic Info' },
                  { id: 'content', label: 'Content & Curriculum' },
                  { id: 'media', label: 'Media & Tags' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex-shrink-0">
                  ⚠️ {error}
                </div>
              )}

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">Course Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                        placeholder="e.g. ChatGPT for Script Writing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">Short Description <span className="text-gray-500 font-normal">(shown on course card)</span></label>
                      <textarea
                        value={formData.short_desc}
                        onChange={e => setFormData(f => ({ ...f, short_desc: e.target.value }))}
                        rows={2}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors resize-none"
                        placeholder="One-liner that makes people click..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">Long Description <span className="text-gray-500 font-normal">(shown on course detail page)</span></label>
                      <textarea
                        value={formData.long_desc}
                        onChange={e => setFormData(f => ({ ...f, long_desc: e.target.value }))}
                        rows={4}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors resize-none"
                        placeholder="Detailed description. Explain what the student will achieve and why this course is different..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">Instructor Name</label>
                      <input
                        type="text"
                        value={formData.instructor}
                        onChange={e => setFormData(f => ({ ...f, instructor: e.target.value }))}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                        placeholder="Creator Nest Team"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">Category</label>
                        <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">Level</label>
                        <select value={formData.level} onChange={e => setFormData(f => ({ ...f, level: e.target.value }))} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
                          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">Total Duration</label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={e => setFormData(f => ({ ...f, duration: e.target.value }))}
                          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                          placeholder="e.g. 45 min, 2 hrs"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1.5">Plan Required</label>
                        <select value={formData.plan} onChange={e => setFormData(f => ({ ...f, plan: e.target.value }))} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
                          {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Publish Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div>
                        <p className="font-semibold text-white text-sm">Publish Course</p>
                        <p className="text-xs text-gray-500 mt-0.5">Make this course visible to all users</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, is_published: !f.is_published }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_published ? 'bg-primary' : 'bg-gray-600'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-300">What You'll Learn <span className="text-gray-500 font-normal">(outcomes)</span></label>
                        <button onClick={addOutcome} className="text-xs text-primary flex items-center gap-1 hover:underline">
                          <Plus className="w-3 h-3" /> Add item
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.outcomes.map((outcome, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <input
                              type="text"
                              value={outcome}
                              onChange={e => updateOutcome(i, e.target.value)}
                              className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                              placeholder={`Learning outcome ${i + 1}...`}
                            />
                            <button onClick={() => removeOutcome(i)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <p className="text-sm font-semibold text-primary mb-1">📚 Curriculum Builder</p>
                      <p className="text-xs text-gray-400">After saving this course, you will be automatically redirected to the <strong>Curriculum Builder</strong> to add Sections and Lessons.</p>
                    </div>
                  </div>
                )}

                {/* Media & Tags Tab */}
                {activeTab === 'media' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">Thumbnail Image</label>
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
                              <p className="text-sm font-bold truncate text-white">{imageFile ? imageFile.name : 'Upload New Thumbnail Image'}</p>
                              <p className="text-xs text-gray-500">PNG, JPG, WebP</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <div className="flex-1 border-t border-white/10"></div>
                          <span>OR PROVIDE URL</span>
                          <div className="flex-1 border-t border-white/10"></div>
                        </div>

                        <input
                          type="url"
                          value={formData.thumbnail_url}
                          onChange={e => { setFormData(f => ({ ...f, thumbnail_url: e.target.value })); setImageFile(null); }}
                          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                          placeholder="https://..."
                        />
                      </div>
                      
                      {(formData.thumbnail_url || imageFile) && (
                        <div className="mt-4 rounded-xl overflow-hidden w-full aspect-video max-w-xs border border-white/10 relative">
                          <img 
                            src={imageFile ? URL.createObjectURL(imageFile) : formData.thumbnail_url} 
                            alt="Thumbnail Preview" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                            Preview
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">Accent Color <span className="text-gray-500 font-normal">(theme color for this course)</span></label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={formData.accent}
                          onChange={e => setFormData(f => ({ ...f, accent: e.target.value }))}
                          className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input
                          type="text"
                          value={formData.accent}
                          onChange={e => setFormData(f => ({ ...f, accent: e.target.value }))}
                          className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                        />
                        <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: formData.accent }} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                          className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                          placeholder="Type a tag and press Enter..."
                        />
                        <button onClick={addTag} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-colors">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 flex justify-between items-center flex-shrink-0">
                <div className="flex gap-2">
                  {(['basic', 'content', 'media'] as const).map((tab, i) => (
                    <div key={tab} className={`w-2 h-2 rounded-full transition-colors ${activeTab === tab ? 'bg-primary' : 'bg-white/20'}`} />
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-colors">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={saving || uploadingImage || !formData.title}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-background hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {(saving || uploadingImage) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {uploadingImage ? 'Uploading...' : saving ? 'Saving...' : 'Save Course'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
