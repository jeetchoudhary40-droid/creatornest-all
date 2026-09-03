'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  Clock, BookOpen, Star, ChevronRight, Play, Lock, CheckCircle2,
  Users, ArrowLeft, Zap, Crown, Download, Share2, ChevronDown,
  Brain, Target, TrendingUp, Palette, BarChart3, Calculator
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

import { ALL_COURSES, getCourseById } from '@/app/nschool/coursesData';
import { COURSE_17_HINDI, COURSE_17_METADATA_HINDI } from '@/app/nschool/course17Hindi';

const PLAN_ORDER = { free: 0, silver: 1, gold: 2, platinum: 3 };
const PLAN_COLORS: Record<string, string> = { free: '#10B981', silver: '#94A3B8', gold: '#F59E0B', platinum: '#00F2FE' };

// ── Curriculum Section ────────────────────────────────────────────────────────
function CurriculumSection({ 
  section, 
  userTier, 
  coursePlan, 
  courseId,
  isHindi
}: { 
  section: any; 
  userTier: string; 
  coursePlan: string; 
  courseId: string | number;
  isHindi: boolean;
}) {
  const [open, setOpen] = useState(true);
  const canAccess = PLAN_ORDER[userTier as keyof typeof PLAN_ORDER] >= (PLAN_ORDER[coursePlan as keyof typeof PLAN_ORDER] || 0);

  // Localize Section Title
  let sectionTitle = section.section_title || section.title;
  if (isHindi && (Number(courseId) === 17 || String(courseId).includes('brand-deal'))) {
    if (COURSE_17_HINDI[section.id]) {
      sectionTitle = COURSE_17_HINDI[section.id].section_title;
    }
  }

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] shadow-sm">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center justify-between p-4 bg-[#121A26]/70 hover:bg-[#182333] transition-colors cursor-pointer border-b border-white/5"
      >
        <span className="font-bold text-white text-sm text-left">{sectionTitle}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {section.lessons.length} {isHindi ? 'लेसन' : 'lessons'}
          </span>
          <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="divide-y divide-white/5 bg-[#090E17]">
          {section.lessons.map((lesson: any, i: number) => {
            const unlocked = lesson.is_free || canAccess;
            const targetHref = unlocked ? `/nschool/course/${courseId}/learn?lesson=${lesson.id}` : '/pricing';
            
            // Localize lesson title
            let lessonTitle = lesson.title;
            if (isHindi && (Number(courseId) === 17 || String(courseId).includes('brand-deal'))) {
              for (const sKey of Object.keys(COURSE_17_HINDI)) {
                if (COURSE_17_HINDI[sKey].lessons[lesson.id]) {
                  lessonTitle = COURSE_17_HINDI[sKey].lessons[lesson.id].title;
                }
              }
            }

            return (
              <Link
                key={i}
                href={targetHref}
                className="flex items-center gap-3.5 p-3.5 hover:bg-white/[0.04] transition-all group cursor-pointer"
              >
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105" 
                  style={{ background: unlocked ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.04)' }}
                >
                  {unlocked
                    ? <BookOpen className="w-4 h-4 text-[#00F2FE]" />
                    : <Lock className="w-3.5 h-3.5 text-gray-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm ${unlocked ? 'text-slate-200 group-hover:text-[#00F2FE] transition-colors font-semibold' : 'text-gray-500'}`}>
                    {lessonTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lesson.is_free && (
                      <span className="text-[9px] text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {isHindi ? 'फ्री रीडिंग' : 'FREE READ'}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0 group-hover:text-slate-200 font-mono">
                  {lesson.duration}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Course Detail Page ───────────────────────────────────────────────────
export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { isHindi } = useLanguage();
  
  const initialCourse = getCourseById(id);
  const [course, setCourse] = useState<any>(initialCourse || null);
  const [loading, setLoading] = useState(!initialCourse);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchCourse() {
      try {
        const targetId = getUUIDFromStaticId(id);
        const { data: dbCourse } = await supabase.from('courses').select('*').eq('id', targetId).single();
        
        if (dbCourse && isMounted) {
          const { data: sections } = await supabase.from('course_sections').select('*').eq('course_id', targetId).order('sort_order');
          const { data: lessons } = await supabase.from('course_lessons').select('*').in('section_id', sections?.map(s => s.id) || []).order('sort_order');
          
          const curriculum = sections?.map(s => ({
            ...s,
            lessons: lessons?.filter(l => l.section_id === s.id) || []
          })) || [];
          
          setCourse({ ...dbCourse, curriculum });
        }
      } catch (err) {
        // Fallback remains active
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCourse();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (user && course) {
      setEnrolled(true);
    }
  }, [user, course]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[#070B11]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen flex-col bg-[#070B11]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 pt-32 text-center px-4">
          <BookOpen className="w-16 h-16 text-gray-700" />
          <h1 className="text-2xl font-bold text-white">{isHindi ? 'कोर्स नहीं मिला' : 'Course Not Found'}</h1>
          <p className="text-gray-400">{isHindi ? 'यह कोर्स मौजूद नहीं है या हटा दिया गया है।' : "This course doesn't exist or may have moved."}</p>
          <Link href="/nschool" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'rgba(0,242,254,0.15)', color: '#00F2FE' }}>
            <ArrowLeft className="w-4 h-4" /> {isHindi ? 'सभी कोर्सेज देखें' : 'Browse All Courses'}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const userTier = user?.plan_tier ?? 'free';
  const canAccess = PLAN_ORDER[userTier as keyof typeof PLAN_ORDER] >= (PLAN_ORDER[course.plan as keyof typeof PLAN_ORDER] || 0);

  const Icon = course.icon || BookOpen;
  const totalLessons = course.curriculum?.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0) || 0;

  // Localized Course Details
  const isCourse17 = Number(course.id) === 17 || String(id).includes('brand-deal');
  const courseTitle = (isHindi && isCourse17) ? COURSE_17_METADATA_HINDI.title : course.title;
  const courseCategory = (isHindi && isCourse17) ? COURSE_17_METADATA_HINDI.category : course.category;
  const courseLevel = (isHindi && isCourse17) ? COURSE_17_METADATA_HINDI.level : course.level;
  const courseDuration = (isHindi && isCourse17) ? COURSE_17_METADATA_HINDI.duration : course.duration;
  const courseDesc = (isHindi && isCourse17) ? (COURSE_17_METADATA_HINDI.long_desc || COURSE_17_METADATA_HINDI.short_desc) : (course.long_desc || course.short_desc);
  const courseOutcomes = (isHindi && isCourse17) ? COURSE_17_METADATA_HINDI.outcomes : course.outcomes;

  return (
    <main className="flex min-h-screen flex-col bg-[#070B11] text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-10 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 70% 50%, ${course.accent}12 0%, transparent 60%)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb & Language Switcher Row */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/nschool" className="hover:text-white transition-colors flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> {isHindi ? 'एन स्कूल' : 'N School'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span style={{ color: course.accent }} className="font-semibold">{courseCategory}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white truncate max-w-[220px] font-bold">{courseTitle}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">Language / भाषा:</span>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Course Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider" style={{ background: `${course.accent}18`, color: course.accent, border: `1px solid ${course.accent}30` }}>
                  {courseCategory}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400 font-bold bg-emerald-500/10">
                  {courseLevel}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: `${PLAN_COLORS[course.plan]}18`, color: PLAN_COLORS[course.plan], border: `1px solid ${PLAN_COLORS[course.plan]}30` }}>
                  {(course.plan || 'free').charAt(0).toUpperCase() + (course.plan || 'free').slice(1)} {isHindi ? 'प्लान' : 'Plan'}
                </span>
              </div>

              {/* Title & Description */}
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {courseTitle}
              </motion.h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {courseDesc}
              </p>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-slate-300 py-3 border-y border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating || '5.0'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Users className="w-4 h-4 text-cyan-400" />
                  {(course.students_count || 2450).toLocaleString()} {isHindi ? 'क्रिएटर्स जुड़े' : 'students'}
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  {courseDuration}
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  {totalLessons} {isHindi ? 'लेसन' : 'lessons'}
                </div>
              </div>

              {/* What You'll Learn */}
              {courseOutcomes && courseOutcomes.length > 0 && (
                <div className="bg-[#0C121B] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl">
                  <h2 className="text-base sm:text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span>{isHindi ? 'आप इस कोर्स से क्या सीखेंगे' : "What You'll Learn in This Course"}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {courseOutcomes.map((outcome: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1 text-emerald-400" />
                        <span className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum Header & Sections */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {isHindi ? 'कोर्स का संपूर्ण पाठ्यक्रम' : 'Course Curriculum'}
                  </h2>
                  <span className="text-xs text-slate-400 font-bold">
                    {totalLessons} {isHindi ? 'अध्याय' : 'Chapters'}
                  </span>
                </div>

                <div className="space-y-3">
                  {course.curriculum?.map((section: any, i: number) => (
                    <CurriculumSection 
                      key={i} 
                      section={section} 
                      userTier={userTier} 
                      coursePlan={course.plan || 'free'} 
                      courseId={course.id}
                      isHindi={isHindi}
                    />
                  ))}
                  {(!course.curriculum || course.curriculum.length === 0) && (
                    <p className="text-gray-500 italic py-4">Curriculum is being updated. Check back soon!</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Sticky Action Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <div className="rounded-3xl overflow-hidden border border-white/15 bg-[#0C121B] shadow-2xl">
                  
                  {/* Course Visual */}
                  <div className="aspect-video relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/20 via-[#101724] to-[#0B0F15]">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={courseTitle} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-emerald-500/30 bg-emerald-500/20 shadow-lg">
                        <Icon className="w-10 h-10 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Price Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                          {isHindi ? 'एक्सेस मूल्य' : 'Access Price'}
                        </span>
                        <p className="text-2xl font-black text-emerald-400">
                          {course.plan === 'free' ? (isHindi ? '100% मुफ्त' : 'Free Access') : `${course.plan} Plan`}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-extrabold border border-cyan-500/30">
                        {isHindi ? 'सर्टिफाइड' : 'Certified'}
                      </span>
                    </div>

                    {/* Primary CTA */}
                    <Link
                      href={`/nschool/course/${id}/learn`}
                      className="w-full py-3.5 px-5 rounded-2xl text-[#05080E] text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #10B981, #00F2FE)' }}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{isHindi ? 'रीडिंग गाइड शुरू करें' : 'Start Reading Masterclass'}</span>
                    </Link>

                    {/* Quick Calculator Link */}
                    {isCourse17 && (
                      <Link
                        href="/tools/brand-deal-calculator"
                        target="_blank"
                        className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isHindi ? 'प्राइसिंग कैलकुलेटर खोलें' : 'Open Brand Deal Calculator'}</span>
                      </Link>
                    )}

                    <div className="text-[11px] text-slate-400 text-center">
                      ⚡ {isHindi ? 'तत्काल एक्सेस • कोई क्रेडिट कार्ड जरूरी नहीं' : 'Instant 1-Click Access • No Card Required'}
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
