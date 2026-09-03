'use client';

import { useState, use, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, PlayCircle, CheckCircle2, Circle, Lock, Menu, X, MessageSquare, Download, Play, Loader2,
  BookOpen, Copy, Check, Calculator, Sparkles, ArrowRight, Video, FileText, ChevronRight, Share2, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabase } from '@/lib/supabase';
import SecureVideoPlayer from '@/components/SecureVideoPlayer';
import CourseRatingWidget from '@/components/CourseRatingWidget';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';
import { getCourseById } from '@/app/nschool/coursesData';
import { COURSE_17_HINDI, COURSE_17_METADATA_HINDI } from '@/app/nschool/course17Hindi';

const PLAN_ORDER = { free: 0, silver: 1, gold: 2, platinum: 3 };

// ── Markdown Content Renderer ────────────────────────────────────────────────
function MarkdownArticle({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Parse lines into logical blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentTable: string[] = [];
  let inTable = false;

  const flushTable = (tableLines: string[], keyIdx: number) => {
    if (tableLines.length === 0) return null;
    const headerLine = tableLines[0];
    const headers = headerLine.split('|').map(s => s.trim()).filter(Boolean);
    const rows = tableLines.slice(2).map(r => r.split('|').map(s => s.trim()).filter(Boolean));

    return (
      <div key={`table-${keyIdx}`} className="my-5 -mx-1 sm:mx-0 overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1522] shadow-xl custom-scrollbar">
        <table className="w-full text-left text-xs sm:text-sm min-w-[340px]">
          <thead className="bg-[#182333] border-b border-white/10 text-cyan-300 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 sm:px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02] hover:bg-white/[0.04]'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 sm:px-4 py-2.5 text-slate-300">
                    <FormattedInline text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  let blockIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      currentTable.push(line);
      continue;
    } else if (inTable) {
      blocks.push(flushTable(currentTable, blockIdx++));
      currentTable = [];
      inTable = false;
    }

    // Horizontal Rule
    if (line.trim() === '---') {
      blocks.push(<hr key={blockIdx++} className="my-6 sm:my-8 border-white/10" />);
      continue;
    }

    // Main Header (H3)
    if (line.startsWith('### ')) {
      const headingText = line.replace('### ', '');
      blocks.push(
        <div key={blockIdx++} className="pt-4 sm:pt-6 pb-2">
          <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-1.5 sm:w-2 h-5 sm:h-6 rounded-full bg-cyan-400 inline-block shrink-0" />
            <span className="leading-snug">{headingText}</span>
          </h3>
        </div>
      );
      continue;
    }

    // Sub Header (H4)
    if (line.startsWith('#### ')) {
      const headingText = line.replace('#### ', '');
      blocks.push(
        <h4 key={blockIdx++} className="text-sm sm:text-lg font-extrabold text-cyan-300 pt-3 sm:pt-4 pb-1">
          {headingText}
        </h4>
      );
      continue;
    }

    // Alert Callout (> ⚠️ or > 💡)
    if (line.startsWith('> ⚠️') || line.startsWith('> 💡')) {
      const isWarn = line.startsWith('> ⚠️');
      blocks.push(
        <div 
          key={blockIdx++} 
          className={`my-3 sm:my-4 p-3.5 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 sm:gap-3 ${
            isWarn 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <span className="text-base sm:text-lg shrink-0">{isWarn ? '⚠️' : '💡'}</span>
          <div className="flex-1 font-medium">
            <FormattedInline text={line.replace(/^>\s*[⚠️💡]\s*/, '')} />
          </div>
        </div>
      );
      continue;
    }

    // Blockquote / Pitch Template (> "...")
    if (line.startsWith('> ')) {
      const quoteText = line.replace(/^>\s*/, '').replace(/^"/, '').replace(/"$/, '');
      const currentIdx = blockIdx++;
      blocks.push(
        <div key={currentIdx} className="my-4 sm:my-5 p-4 sm:p-6 rounded-2xl bg-[#09101A] border border-cyan-500/30 relative group shadow-lg">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 gap-2 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> Ready Pitch Script
            </span>
            <button
              onClick={() => handleCopy(quoteText, currentIdx)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto"
            >
              {copiedIndex === currentIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedIndex === currentIdx ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>
          <div className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed italic break-words">
            "{quoteText}"
          </div>
        </div>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const bulletText = line.trim().replace(/^[\*\-]\s+/, '');
      blocks.push(
        <div key={blockIdx++} className="flex items-start gap-2.5 my-1.5 sm:my-2 text-slate-300 text-xs sm:text-sm leading-relaxed pl-1 sm:pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 sm:mt-2 shrink-0" />
          <div className="flex-1">
            <FormattedInline text={bulletText} />
          </div>
        </div>
      );
      continue;
    }

    // Numbered List
    if (/^\d+\.\s+/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (match) {
        const [, num, itemText] = match;
        blocks.push(
          <div key={blockIdx++} className="flex items-start gap-2.5 my-2 text-slate-300 text-xs sm:text-sm leading-relaxed pl-1 sm:pl-2">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-[10px] sm:text-[11px] font-bold shrink-0 mt-0.5">
              {num}
            </span>
            <div className="flex-1">
              <FormattedInline text={itemText} />
            </div>
          </div>
        );
        continue;
      }
    }

    // Math formula block ($$...$$)
    if (line.includes('$$')) {
      const mathContent = line.replace(/\$\$/g, '').replace(/\\text\{/g, '').replace(/\}/g, '').replace(/\\times/g, '×').replace(/\\Big\(/g, '(').replace(/\\Big\)/g, ')');
      blocks.push(
        <div key={blockIdx++} className="my-4 sm:my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#16202E] to-[#0E1522] border border-emerald-500/30 text-center shadow-xl overflow-x-auto">
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-emerald-400 mb-1.5">Mathematical Pricing Formula</div>
          <div className="text-sm sm:text-lg font-black text-white tracking-wide font-mono break-words leading-normal">
            {mathContent}
          </div>
        </div>
      );
      continue;
    }

    // Normal paragraph
    if (line.trim().length > 0) {
      blocks.push(
        <p key={blockIdx++} className="my-2.5 sm:my-3 text-slate-300 text-xs sm:text-base leading-relaxed">
          <FormattedInline text={line} />
        </p>
      );
    }
  }

  if (inTable && currentTable.length > 0) {
    blocks.push(flushTable(currentTable, blockIdx++));
  }

  return <div className="space-y-1">{blocks}</div>;
}

// ── Inline Text Formatter (Bold, Code, Colors) ──────────────────────────────
function FormattedInline({ text }: { text: string }) {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-mono text-[11px] sm:text-xs border border-cyan-800/40 break-all">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

export default function CourseLearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get('lesson');
  const { user } = useAuth();
  const { isHindi, t } = useLanguage();
  
  // 1. Instant Synchronous Cache Resolution (0ms Latency)
  const synchronousCourse = useMemo(() => getCourseById(id), [id]);
  const synchronousSections = useMemo(() => synchronousCourse?.curriculum || [], [synchronousCourse]);
  const synchronousLessons = useMemo(() => synchronousSections.flatMap((s: any) => s.lessons), [synchronousSections]);

  const [course, setCourse] = useState<any>(synchronousCourse || null);
  const [sections, setSections] = useState<any[]>(synchronousSections);
  const [loading, setLoading] = useState(!synchronousCourse);
  
  const [activeLesson, setActiveLesson] = useState<any>(() => {
    if (synchronousLessons.length > 0) {
      const match = initialLessonId ? synchronousLessons.find((l: any) => l.id === initialLessonId) : null;
      return match || synchronousLessons[0];
    }
    return null;
  });

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile: closed by default, desktop handled responsively
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'qna' | 'rating'>('overview');
  const [showVideoCompanion, setShowVideoCompanion] = useState(false);

  // Initialize desktop sidebar on large screen
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Sync active lesson instantly when URL param changes
  useEffect(() => {
    if (initialLessonId && sections.length > 0) {
      const allL = sections.flatMap((s: any) => s.lessons);
      const match = allL.find((l: any) => l.id === initialLessonId);
      if (match && match.id !== activeLesson?.id) {
        setActiveLesson(match);
      }
    }
  }, [initialLessonId, sections]);

  // Non-blocking background sync for progress & database updates
  useEffect(() => {
    let isMounted = true;

    const backgroundSync = async () => {
      try {
        const targetId = getUUIDFromStaticId(id);
        
        // 1. Fetch DB Course
        const { data: courseData } = await supabase.from('courses').select('*').eq('id', targetId).single();
        if (courseData && isMounted) {
          setCourse((prev: any) => ({ ...prev, ...courseData }));
        }

        // 2. Fetch DB Sections & Lessons if available
        const { data: sectionData } = await supabase.from('course_sections').select('*').eq('course_id', targetId).order('sort_order');
        if (sectionData && sectionData.length > 0) {
          const { data: lessonData } = await supabase.from('course_lessons').select('*').in('section_id', sectionData.map(s => s.id)).order('sort_order');
          
          const loadedSections = sectionData.map(section => {
            const lessons = lessonData?.filter(l => l.section_id === section.id) || [];
            return {
              id: section.id,
              section_title: section.title,
              lessons: lessons.map(l => ({
                id: l.id,
                title: l.title,
                duration: l.duration,
                video_url: l.video_url,
                is_free: l.is_free,
                description: l.content || l.description
              }))
            };
          });

          if (isMounted && loadedSections.length > 0) {
            setSections(loadedSections);
            const flat = loadedSections.flatMap(s => s.lessons);
            if (flat.length > 0 && !activeLesson) {
              const matched = initialLessonId ? flat.find(l => l.id === initialLessonId) : null;
              setActiveLesson(matched || flat[0]);
            }
          }
        }

        // 3. Fetch User Progress
        if (user?.id && isMounted) {
          const { data: progressData } = await supabase.from('user_lesson_progress').select('lesson_id').eq('user_id', user.id).eq('is_completed', true);
          if (progressData && isMounted) {
            setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
          }
        }
      } catch (err) {
        // Quietly fallback to synchronous local data
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    backgroundSync();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const userTier = user?.plan_tier ?? 'free';
  const canAccessFull = course ? PLAN_ORDER[userTier as keyof typeof PLAN_ORDER] >= PLAN_ORDER[course.plan as keyof typeof PLAN_ORDER] : false;
  const allFlattenedLessons = sections.flatMap(s => s.lessons);
  const progress = allFlattenedLessons.length > 0 ? Math.round((completedLessons.size / allFlattenedLessons.length) * 100) : 0;
  const isReadingCourse = course?.duration?.toLowerCase().includes('reading') || Number(course?.id) === 17 || String(id).includes('brand-deal');

  // Multi-language resolver for Course 17
  const getLocalizedLesson = (lesson: any) => {
    if (!lesson) return { title: '', description: '' };
    if (isHindi && (Number(course?.id) === 17 || String(id).includes('brand-deal'))) {
      for (const sKey of Object.keys(COURSE_17_HINDI)) {
        const sec = COURSE_17_HINDI[sKey];
        if (sec.lessons[lesson.id]) {
          return sec.lessons[lesson.id];
        }
      }
    }
    return {
      title: lesson.title,
      description: lesson.description || ''
    };
  };

  const getLocalizedSectionTitle = (section: any) => {
    if (isHindi && (Number(course?.id) === 17 || String(id).includes('brand-deal'))) {
      if (COURSE_17_HINDI[section.id]) {
        return COURSE_17_HINDI[section.id].section_title;
      }
    }
    return section.section_title;
  };

  const currentLocalized = getLocalizedLesson(activeLesson);

  const handleLessonClick = (lesson: any) => {
    if (!lesson.is_free && !canAccessFull) {
      window.location.href = '/pricing';
      return;
    }
    setActiveLesson(lesson);
    // Auto-close drawer on mobile when choosing lesson
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleComplete = async (lessonId: string) => {
    if (!user?.id) {
      alert(isHindi ? "प्रोग्रेस सेव करने के लिए कृपया लॉग इन करें!" : "Please log in to save your progress!");
      return;
    }

    const isCurrentlyCompleted = completedLessons.has(lessonId);
    
    // Optimistic UI Update
    setCompletedLessons(prev => {
      const next = new Set(prev);
      if (isCurrentlyCompleted) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });

    try {
      if (isCurrentlyCompleted) {
        await supabase.from('user_lesson_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
      } else {
        await supabase.from('user_lesson_progress').upsert({
          user_id: user.id,
          course_id: getUUIDFromStaticId(id),
          lesson_id: lessonId,
          is_completed: true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = allFlattenedLessons.findIndex((l: any) => l.id === activeLesson?.id);
    if (currentIndex < allFlattenedLessons.length - 1) {
      handleLessonClick(allFlattenedLessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = allFlattenedLessons.findIndex((l: any) => l.id === activeLesson?.id);
    if (currentIndex > 0) {
      handleLessonClick(allFlattenedLessons[currentIndex - 1]);
    }
  };

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-400 text-sm">{isHindi ? 'कोर्स लोड हो रहा है...' : 'Loading course environment...'}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl font-bold mb-2">{isHindi ? 'कोर्स नहीं मिला' : 'Course not found'}</h2>
        <p className="text-gray-400 text-sm mb-6">{isHindi ? 'यह कोर्स मौजूद नहीं है या हटा दिया गया है।' : 'The course you are looking for does not exist or has been removed.'}</p>
        <Link href="/nschool" className="px-5 py-2.5 bg-primary text-background font-bold text-sm rounded-xl">
          {isHindi ? 'एन स्कूल पर वापस जाएं' : 'Back to N School'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] flex flex-col lg:flex-row text-slate-100 antialiased overflow-x-hidden relative">
      
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation Drawer */}
      <motion.aside
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -340),
          width: sidebarOpen ? '320px' : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? '320px' : '0px')
        }}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0C121B] border-r border-white/10 flex flex-col flex-shrink-0 transition-transform duration-300 overflow-hidden shadow-2xl lg:shadow-none ${
          sidebarOpen ? 'w-[300px] sm:w-[320px]' : 'w-0 pointer-events-none lg:pointer-events-auto'
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link href={`/nschool/course/${id}`} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors">
            <ChevronLeft className="w-4 h-4" /> {isHindi ? 'कोर्स विवरण पर लौटें' : 'Back to Course Overview'}
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5 cursor-pointer"
            aria-label="Close Curriculum"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 mb-1 block">
            {isReadingCourse ? (isHindi ? '📖 संपूर्ण रीडिंग मास्टरक्लास' : '📖 Reading Masterclass') : (isHindi ? '🎓 वीडियो कोर्स' : '🎓 Video Course')}
          </span>
          <h2 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug mb-3">
            {(isHindi && (Number(course?.id) === 17 || String(id).includes('brand-deal'))) ? COURSE_17_METADATA_HINDI.title : course.title}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full" 
                style={{ background: 'linear-gradient(90deg, #10B981, #00F2FE)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-black text-cyan-300">{progress}% {isHindi ? 'पूर्ण' : 'Completed'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {sections.length === 0 && <p className="text-gray-500 text-sm text-center py-10">No curriculum available yet.</p>}
          {sections.map((section: any) => (
            <div key={section.id} className="space-y-1.5">
              <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 pt-2">
                {getLocalizedSectionTitle(section)}
              </h3>
              <div className="space-y-1">
                {section.lessons.map((lesson: any) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isCompleted = completedLessons.has(lesson.id);
                  const isLocked = !lesson.is_free && !canAccessFull;
                  const localizedLesson = getLocalizedLesson(lesson);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 shadow-md' 
                          : 'hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4 text-slate-600" />
                        ) : isActive ? (
                          <BookOpen className="w-4 h-4 text-cyan-400 animate-pulse" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm leading-tight ${isActive ? 'text-white font-bold' : isLocked ? 'text-slate-500' : 'text-slate-300'}`}>
                          {localizedLesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {lesson.duration && <span className="text-[10px] text-slate-400 font-medium">{lesson.duration}</span>}
                          {lesson.is_free && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-extrabold tracking-wide">FREE</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#070A0F] relative">
        
        {activeLesson ? (
          <>
            {/* Responsive Top Bar Header */}
            <header className="h-16 border-b border-white/10 bg-[#0C121B]/95 backdrop-blur-md sticky top-0 z-30 flex items-center px-3 sm:px-6 justify-between flex-shrink-0 gap-2">
              
              {/* Left: Menu Trigger & Title */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button 
                  onClick={() => setSidebarOpen(true)} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 border border-white/10"
                  aria-label="Open Curriculum Drawer"
                >
                  <Menu className="w-4 h-4 text-cyan-400" /> 
                  <span className="hidden xs:inline">{isHindi ? 'पाठ्यक्रम' : 'Chapters'}</span>
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {isReadingCourse ? (isHindi ? 'गाइड' : 'Read') : 'Video'}
                    </span>
                    {activeLesson.duration && (
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:inline">⏱️ {activeLesson.duration}</span>
                    )}
                  </div>
                  <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
                    {currentLocalized.title}
                  </h1>
                </div>
              </div>
              
              {/* Right: Language Switcher & Complete Button */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                <LanguageSwitcher compact className="scale-90 sm:scale-100" />

                <button 
                  onClick={() => toggleComplete(activeLesson.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    completedLessons.has(activeLesson.id) 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                  title={completedLessons.has(activeLesson.id) ? 'Completed' : 'Mark Done'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {completedLessons.has(activeLesson.id) ? (isHindi ? 'पूर्ण' : 'Completed') : (isHindi ? 'पूर्ण करें' : 'Mark Done')}
                  </span>
                </button>
              </div>
            </header>

            {/* Optional Video Player */}
            {(!isReadingCourse || showVideoCompanion) && (
              <div 
                className="flex-shrink-0 bg-black w-full relative flex items-center justify-center border-b border-white/10 bg-cover bg-center overflow-hidden aspect-video lg:aspect-auto lg:h-[50vh]"
              >
                {!activeLesson.is_free && !canAccessFull ? (
                  <div className="text-center p-6 relative z-10 w-full h-full flex flex-col items-center justify-center min-h-[30vh]">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{isHindi ? 'प्रीमियम लेसन' : 'Premium Lesson'}</h3>
                    <p className="text-slate-400 text-xs mb-4 max-w-xs mx-auto">
                      {isHindi ? `यह मॉड्यूल ${course.plan} प्लान का हिस्सा है। पूरा एक्सेस अनलॉक करने के लिए अपग्रेड करें।` : `This module is part of the ${course.plan} plan. Upgrade your membership to unlock full access.`}
                    </p>
                    <Link href="/pricing" className="inline-flex items-center justify-center px-5 py-2 rounded-xl font-bold text-xs bg-cyan-400 text-black shadow-lg">
                      {isHindi ? 'अनलॉक करें' : 'Upgrade to Unlock'}
                    </Link>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center mx-auto">
                    <SecureVideoPlayer 
                      key={activeLesson.id}
                      videoUrl={activeLesson.video_url} 
                      isCompleted={completedLessons.has(activeLesson.id)}
                      onComplete={() => {
                        if (!completedLessons.has(activeLesson.id)) toggleComplete(activeLesson.id);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Reading & Educational Article Body */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-10">
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                
                {/* Article Header Card */}
                <div className="bg-gradient-to-br from-[#101724] via-[#0E1522] to-[#070A0F] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ⭐ {isHindi ? 'ऑफिशियल मास्टरक्लास' : 'Official Masterclass'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isHindi ? 'मॉड्यूल: ' : 'Module: '}{sections.find((s: any) => s.lessons?.some((l: any) => l.id === activeLesson.id))?.section_title || 'Core Syllabus'}
                      </span>
                      {activeLesson.duration && (
                        <span className="text-[10px] sm:text-xs text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                          {activeLesson.duration}
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                      {currentLocalized.title}
                    </h1>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {isHindi 
                        ? 'इस स्टेप-बाय-स्टेप रीडिंग मॉड्यूल को ध्यान से पढ़ें। सभी फॉर्मूले, प्राइसिंग गाइड और पिच टेम्पलेट्स भारतीय क्रिएटर्स के लिए व्यावहारिक और उपयोगी हैं।'
                        : 'Follow this step-by-step reading module. All formulas, templates, and scripts are practical, tested for Indian creators, and ready to use.'
                      }
                    </p>

                    {/* Quick Tools Bar */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
                      <Link
                        href="/tools/brand-deal-calculator"
                        target="_blank"
                        className="px-3.5 py-2 rounded-xl text-xs font-black text-black flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #10B981, #00F2FE)' }}
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'ब्रांड डील कैलकुलेटर' : 'Open Calculator'}</span>
                      </Link>

                      {isReadingCourse && activeLesson.video_url && (
                        <button
                          onClick={() => setShowVideoCompanion(!showVideoCompanion)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{showVideoCompanion ? (isHindi ? 'वीडियो छुपाएं' : 'Hide Video') : (isHindi ? 'वीडियो देखें' : 'Watch Video')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Horizontally Scrollable Tab Bar for Mobile */}
                <div className="flex items-center gap-4 sm:gap-6 border-b border-white/10 pb-1 overflow-x-auto custom-scrollbar no-scrollbar whitespace-nowrap -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                  {[
                    { id: 'overview', label: isHindi ? '📖 रीडिंग गाइड' : '📖 Reading Guide' },
                    { id: 'resources', label: isHindi ? '📁 रिसोर्सेज' : '📁 Templates' },
                    { id: 'qna', label: isHindi ? '💬 कम्युनिटी चर्चा' : '💬 Q&A' },
                    { id: 'rating', label: isHindi ? '⭐ रेटिंग दें' : '⭐ Rate' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative shrink-0 cursor-pointer ${
                        activeTab === tab.id ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="learn-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[250px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-6 sm:space-y-8">
                      {currentLocalized.description ? (
                        <div className="bg-[#0C121B] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl space-y-4">
                          <MarkdownArticle content={currentLocalized.description} />
                        </div>
                      ) : (
                        <div className="bg-[#0C121B] border border-white/10 rounded-2xl sm:rounded-3xl p-6 text-slate-300 text-sm">
                          <p>{currentLocalized.title}</p>
                        </div>
                      )}

                      {/* Interactive Calculator Callout Banner */}
                      <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-500/20 via-[#131D2C] to-[#0E1522] border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl text-center md:text-left">
                        <div className="space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" /> {isHindi ? '1-क्लिक लाइव टूल' : '1-Click Interactive Tool'}
                          </div>
                          <h3 className="text-base sm:text-xl font-black text-white">
                            {isHindi ? 'अपने चैनल की ब्रांड डील कीमत (₹) कैलकुलेट करें' : "Calculate Your Channel's Brand Deal Value in ₹"}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                            {isHindi 
                              ? 'अपना यूट्यूब या इंस्टाग्राम हैंडल और औसत व्यूज दर्ज करें। हमारा 2026 एल्गोरिदम आपकी 1-डील फीस और सही मार्केट रेट्स की गणना करता है।'
                              : 'Enter your YouTube or Instagram handle and average views. Our 2026 algorithm calculates your exact 1-deal fee, dedicated video rates, and agency negotiation caps.'
                            }
                          </p>
                        </div>
                        <Link
                          href="/tools/brand-deal-calculator"
                          target="_blank"
                          className="w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs sm:text-sm text-black transition-all shrink-0 shadow-xl hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, #10B981, #00F2FE)' }}
                        >
                          <span>{isHindi ? 'मेरी प्राइसिंग कैलकुलेट करें' : 'Calculate My Rates'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Bottom Lesson Navigation */}
                      <div className="pt-4 border-t border-white/10 flex flex-row justify-between items-center gap-3">
                        <button 
                          onClick={handlePrevLesson}
                          disabled={allFlattenedLessons.findIndex((l: any) => l.id === activeLesson.id) === 0}
                          className="flex-1 sm:flex-initial px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 shrink-0" /> 
                          <span>{isHindi ? 'पिछला' : 'Previous'}</span>
                        </button>
                        <button 
                          onClick={handleNextLesson}
                          disabled={allFlattenedLessons.findIndex((l: any) => l.id === activeLesson.id) === allFlattenedLessons.length - 1}
                          className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-black shadow-lg transition-transform hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #00F2FE, #10B981)' }}
                        >
                          <span>{isHindi ? 'अगला अध्याय' : 'Next Chapter'}</span>
                          <ChevronRight className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className="space-y-4">
                      <div className="p-4 sm:p-6 rounded-2xl bg-[#0C121B] border border-white/10 space-y-4">
                        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>{isHindi ? 'शामिल टेम्पलेट्स व चीटशीट्स' : 'Included Templates & Cheatsheets'}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white">{isHindi ? 'कोल्ड ईमेल पिच टेम्पलेट' : 'Cold Email Pitch Template'}</p>
                              <p className="text-[11px] text-slate-400">{isHindi ? 'कॉपी व कस्टमाइज करने के लिए तैयार' : 'Word/Text format ready to customize'}</p>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Module 5.1</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white">{isHindi ? '13 निश मल्टीप्लायर रेट कार्ड' : '13 Niches Multiplier Rate Card'}</p>
                              <p className="text-[11px] text-slate-400">{isHindi ? '2026 भारतीय CPM व CPV बेंचमार्क' : '2026 Indian CPM & CPV benchmarks'}</p>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Module 3.2</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'qna' && (
                    <div className="text-center py-8 sm:py-12 bg-[#0C121B] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                      <MessageSquare className="w-10 h-10 text-cyan-400 mx-auto mb-3 opacity-80" />
                      <h3 className="text-white font-bold text-base sm:text-lg mb-1">{isHindi ? 'क्रिएटर डील कम्युनिटी' : 'Creator Deal Community'}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mb-5 max-w-md mx-auto">
                        {isHindi ? 'एजेंसी नेगोशिएशन, रेट कार्ड्स और ब्रांड अनुबंधों पर सवाल पूछें।' : 'Ask questions about agency negotiations, rate cards, and brand contracts.'}
                      </p>
                      <Link href="/community" className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl text-xs sm:text-sm font-bold inline-block shadow-lg">
                        {isHindi ? 'कम्युनिटी चर्चा खोलें' : 'Open Creator Discussion'}
                      </Link>
                    </div>
                  )}
                  
                  {activeTab === 'rating' && (
                    <div className="py-4 bg-[#0C121B] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
                      <CourseRatingWidget 
                        courseId={course.id} 
                        userId={user?.id || ''} 
                        onSubmitted={() => {}} 
                      />
                      {!user && (
                        <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl text-slate-400 text-xs sm:text-sm mt-4">
                          {isHindi ? 'रेटिंग देने के लिए कृपया ' : 'Please '}
                          <Link href={`/login?next=/nschool/course/${id}/learn`} className="text-cyan-400 hover:underline font-bold">
                            {isHindi ? 'लॉग इन करें' : 'log in'}
                          </Link>
                          {isHindi ? '।' : ' to rate this masterclass.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 flex-col p-6 text-center">
            <BookOpen className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-xs sm:text-sm">{isHindi ? 'सीखना शुरू करने के लिए पाठ्यक्रम से कोई अध्याय चुनें।' : 'Select a chapter from the curriculum to begin learning.'}</p>
          </div>
        )}
      </main>
    </div>
  );
}
