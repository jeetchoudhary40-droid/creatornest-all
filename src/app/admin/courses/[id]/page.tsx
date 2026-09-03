'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { adminInsert, adminUpdate, adminDelete } from '@/lib/adminDb';
import {
  Plus, Edit, Trash2, X, Save, GripVertical, ChevronLeft,
  PlayCircle, BarChart3, ExternalLink, Loader2, BookOpen, Eye, Upload
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const VIDEO_TYPES = [
  { id: 'youtube', label: 'YouTube', icon: '▶', color: '#FF0000', placeholder: 'https://youtube.com/watch?v=... or https://youtu.be/...' },
  { id: 'google_drive', label: 'Google Drive', icon: '▲', color: '#34A853', placeholder: 'https://drive.google.com/file/d/YOUR_FILE_ID/view' },
];

export default function CourseCurriculumBuilder() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [sectionForm, setSectionForm] = useState({ section_title: '', sort_order: 0 });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '',
    video_type: 'youtube' as 'youtube' | 'google_drive',
    video_url: '',
    thumbnail_url: '',
    is_free: false,
    sort_order: 0,
  });

  useEffect(() => { fetchCourseData(); }, [courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (courseData) setCourse(courseData);

    const { data: sectionData } = await supabase
      .from('course_sections').select('*').eq('course_id', courseId).order('sort_order');
    const { data: lessonData } = await supabase
      .from('course_lessons').select('*')
      .in('section_id', sectionData?.map(s => s.id) || [])
      .order('sort_order');

    if (sectionData) {
      setSections(sectionData.map(s => ({ ...s, lessons: lessonData?.filter(l => l.section_id === s.id) || [] })));
    }
    setLoading(false);
  };

  const handleOpenSectionModal = (section?: any) => {
    setError('');
    if (section) {
      setEditingSection(section);
      setSectionForm({ section_title: section.section_title, sort_order: section.sort_order });
    } else {
      setEditingSection(null);
      setSectionForm({ section_title: '', sort_order: sections.length * 10 });
    }
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingSection) {
        await adminUpdate('course_sections', editingSection.id, sectionForm);
      } else {
        await adminInsert('course_sections', { ...sectionForm, course_id: courseId });
      }
      setIsSectionModalOpen(false);
      fetchCourseData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section AND all its lessons?')) return;
    try {
      await adminDelete('course_sections', id);
      fetchCourseData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleOpenLessonModal = (sectionId: string, lesson?: any) => {
    setError('');
    setActiveSectionId(sectionId);
    setImageFile(null);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        duration: lesson.duration || '',
        video_type: lesson.video_type || 'youtube',
        video_url: lesson.video_url || '',
        thumbnail_url: lesson.thumbnail_url || '',
        is_free: lesson.is_free || false,
        sort_order: lesson.sort_order || 0,
      });
    } else {
      const section = sections.find(s => s.id === sectionId);
      setEditingLesson(null);
      setLessonForm({
        title: '', description: '', duration: '', video_type: 'youtube',
        video_url: '', thumbnail_url: '', is_free: false,
        sort_order: (section?.lessons.length || 0) * 10,
      });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    setSaving(true);
    setError('');
    try {
      let finalThumbnailUrl = lessonForm.thumbnail_url;
      
      if (imageFile) {
        setUploadingImage(true);
        const imageExt = imageFile.name.split('.').pop();
        const imageName = `${Date.now()}-lesson.${imageExt}`;
        const { data: imgData, error: imgError } = await supabase.storage
          .from('tools-assets')
          .upload(`lesson-thumbnails/${imageName}`, imageFile);
        
        if (imgError) throw new Error('Failed to upload thumbnail: ' + imgError.message);
        
        const { data: { publicUrl } } = supabase.storage.from('tools-assets').getPublicUrl(`lesson-thumbnails/${imageName}`);
        finalThumbnailUrl = publicUrl;
        setUploadingImage(false);
      }

      const cleanData = { ...lessonForm, thumbnail_url: finalThumbnailUrl };

      if (editingLesson) {
        await adminUpdate('course_lessons', editingLesson.id, cleanData);
      } else {
        await adminInsert('course_lessons', { ...cleanData, section_id: activeSectionId });
      }
      setIsLessonModalOpen(false);
      fetchCourseData();
    } catch (err: any) {
      setError(err.message);
      setUploadingImage(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await adminDelete('course_lessons', id);
      fetchCourseData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-surface border border-white/5 p-6 rounded-2xl">
        <Link href="/admin/courses" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm w-fit transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{course?.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{sections.length} sections</span>
              <span>{totalLessons} lessons</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${course?.is_published ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                {course?.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/nschool/course/${courseId}`}
              target="_blank"
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors text-gray-300"
            >
              <Eye className="w-4 h-4" /> Preview
            </Link>
            <Link
              href={`/admin/courses/${courseId}/analytics`}
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors text-gray-300"
            >
              <BarChart3 className="w-4 h-4 text-secondary" /> Analytics
            </Link>
            <button
              onClick={() => handleOpenSectionModal()}
              className="bg-primary text-background px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="text-center p-16 bg-surface border border-dashed border-white/10 rounded-2xl">
            <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-gray-400 font-semibold">No curriculum yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Section" to start building your course structure</p>
          </div>
        ) : (
          sections.map(section => (
            <div key={section.id} className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
              <div className="bg-white/[0.04] px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
                  <div>
                    <h3 className="font-bold text-white">{section.section_title}</h3>
                    <p className="text-xs text-gray-500">{section.lessons.length} lessons</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenLessonModal(section.id)}
                    className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors border border-primary/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Lesson
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button onClick={() => handleOpenSectionModal(section)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteSection(section.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {section.lessons.length === 0 ? (
                  <p className="text-sm text-gray-500 italic pl-12 py-3">No lessons yet — click "Add Lesson" above.</p>
                ) : (
                  section.lessons.map((lesson: any) => {
                    const vType = VIDEO_TYPES.find(v => v.id === lesson.video_type) || VIDEO_TYPES[0];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between pl-4 pr-3 py-3 bg-background/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-gray-600 cursor-grab flex-shrink-0" />
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: `${lesson.video_url ? vType.color : '#374151'}15`, color: lesson.video_url ? vType.color : '#6B7280' }}>
                            {vType.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-200">{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {lesson.duration && <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">{lesson.duration}</span>}
                              {lesson.is_free && <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-bold">Free Preview</span>}
                              {lesson.video_url ? (
                                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{vType.label}</span>
                              ) : (
                                <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-bold">⚠ No Video</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenLessonModal(section.id, lesson)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">{editingSection ? 'Edit Section' : 'New Section'}</h2>
              <button onClick={() => setIsSectionModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Section Title</label>
                <input
                  type="text"
                  value={sectionForm.section_title}
                  onChange={e => setSectionForm({ ...sectionForm, section_title: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none"
                  placeholder="e.g. Module 1: Introduction"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button onClick={() => setIsSectionModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white">Cancel</button>
              <button
                onClick={handleSaveSection}
                disabled={saving || !sectionForm.section_title}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-background disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">{editingLesson ? 'Edit Lesson' : 'New Lesson'}</h2>
              <button onClick={() => setIsLessonModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Lesson Title *</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none"
                  placeholder="e.g. Why AI Changes Scriptwriting Forever"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Lesson Description <span className="text-gray-500 font-normal">(optional)</span></label>
                <textarea
                  value={lessonForm.description}
                  onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none resize-none"
                  placeholder="Brief description of what this lesson covers..."
                />
              </div>

              {/* Video Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Video Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {VIDEO_TYPES.map(vt => (
                    <button
                      key={vt.id}
                      type="button"
                      onClick={() => setLessonForm({ ...lessonForm, video_type: vt.id as any, video_url: '' })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        lessonForm.video_type === vt.id
                          ? 'text-white'
                          : 'bg-background border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                      style={lessonForm.video_type === vt.id ? { background: `${vt.color}20`, borderColor: `${vt.color}60`, color: vt.color } : {}}
                    >
                      <span>{vt.icon}</span> {vt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Video URL</label>
                <input
                  type="url"
                  value={lessonForm.video_url}
                  onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none"
                  placeholder={VIDEO_TYPES.find(v => v.id === lessonForm.video_type)?.placeholder}
                />
                {lessonForm.video_url && lessonForm.video_type === 'youtube' && (
                  <p className="text-xs text-blue-400 mt-1.5">✓ YouTube — will play with branded player (no YT branding, no recommendations)</p>
                )}
                {lessonForm.video_url && lessonForm.video_type === 'google_drive' && (
                  <p className="text-xs text-green-400 mt-1.5">✓ Google Drive — download button will be blocked for viewers</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Lesson Thumbnail <span className="text-gray-500 font-normal">(shown when video is locked)</span></label>
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
                    value={lessonForm.thumbnail_url}
                    onChange={e => { setLessonForm(f => ({ ...f, thumbnail_url: e.target.value })); setImageFile(null); }}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                    placeholder="https://..."
                  />
                </div>
                
                {(lessonForm.thumbnail_url || imageFile) && (
                  <div className="mt-4 rounded-xl overflow-hidden w-full aspect-video max-w-xs border border-white/10 relative">
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : lessonForm.thumbnail_url} 
                      alt="Thumbnail Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      Preview
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={lessonForm.duration}
                    onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none"
                    placeholder="e.g. 5 min"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={lessonForm.sort_order}
                    onChange={e => setLessonForm({ ...lessonForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/8 transition-colors">
                <input
                  type="checkbox"
                  checked={lessonForm.is_free}
                  onChange={e => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Free Preview Lesson</p>
                  <p className="text-xs text-gray-500 mt-0.5">Anyone can watch this — great for hook lessons</p>
                </div>
              </label>
            </div>

            <div className="p-6 border-t border-white/5 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setIsLessonModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white">Cancel</button>
              <button
                onClick={handleSaveLesson}
                disabled={saving || uploadingImage || !lessonForm.title}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-background disabled:opacity-50 flex items-center gap-2"
              >
                {(saving || uploadingImage) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {uploadingImage ? 'Uploading...' : saving ? 'Saving...' : 'Save Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
