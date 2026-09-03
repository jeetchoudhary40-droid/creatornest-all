'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Users, PlayCircle, Clock, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CourseAnalytics() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    // Fetch Course
    const { data: courseData } = await supabase.from('courses').select('title').eq('id', courseId).single();
    if (courseData) setCourse(courseData);

    // Fetch Enrollments (with profiles)
    const { data: enrollmentData } = await supabase
      .from('user_course_enrollments')
      .select('*, profiles(full_name, email, avatar_url)')
      .eq('course_id', courseId);
    if (enrollmentData) setEnrollments(enrollmentData);

    // Fetch Lesson Progress (with lessons)
    const { data: progressData } = await supabase
      .from('user_lesson_progress')
      .select('*, course_lessons(title)')
      .eq('course_id', courseId);
    if (progressData) setLessonProgress(progressData);

    setLoading(false);
  };

  if (loading) return <div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  // Analytics Calculations
  const totalStudents = enrollments.length;
  const totalCompleted = enrollments.filter(e => e.status === 'completed').length;
  const completionRate = totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0;
  const totalVideoPlays = lessonProgress.reduce((sum, p) => sum + (p.play_count || 0), 0);

  // Group by Lesson
  const lessonStats = lessonProgress.reduce((acc: any, curr: any) => {
    const lessonTitle = curr.course_lessons?.title || 'Unknown Lesson';
    if (!acc[lessonTitle]) {
      acc[lessonTitle] = { plays: 0, completions: 0 };
    }
    acc[lessonTitle].plays += (curr.play_count || 0);
    if (curr.is_completed) acc[lessonTitle].completions += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-surface border border-white/5 p-6 rounded-2xl">
        <Link href={`/admin/courses/${courseId}`} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm w-fit transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Curriculum
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Analytics: {course?.title}</h1>
        <p className="text-sm text-gray-400">Track student enrollments, video views, and course completion rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-sm">Total Students</h3>
          </div>
          <p className="text-3xl font-black text-white">{totalStudents}</p>
        </div>
        <div className="bg-surface border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <Trophy className="w-5 h-5" />
            <h3 className="font-bold text-sm">Completions</h3>
          </div>
          <p className="text-3xl font-black text-white">{totalCompleted}</p>
        </div>
        <div className="bg-surface border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-sm">Completion Rate</h3>
          </div>
          <p className="text-3xl font-black text-white">{completionRate}%</p>
        </div>
        <div className="bg-surface border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-pink-400 mb-2">
            <PlayCircle className="w-5 h-5" />
            <h3 className="font-bold text-sm">Total Video Plays</h3>
          </div>
          <p className="text-3xl font-black text-white">{totalVideoPlays}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Students Table */}
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold text-lg text-white">Enrolled Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-xs uppercase font-semibold text-gray-300">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {enrollments.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No students enrolled yet.</td></tr>
                )}
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {e.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{e.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-[10px]">{e.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${e.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {e.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">{e.completion_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Video Performance Table */}
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold text-lg text-white">Video Analytics (Per Lesson)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-xs uppercase font-semibold text-gray-300">
                <tr>
                  <th className="px-6 py-4">Lesson Title</th>
                  <th className="px-6 py-4 text-right">Total Plays</th>
                  <th className="px-6 py-4 text-right">Completions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.keys(lessonStats).length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No video data yet.</td></tr>
                )}
                {Object.entries(lessonStats).map(([title, stats]: [string, any]) => (
                  <tr key={title} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-300">{title}</td>
                    <td className="px-6 py-4 text-right text-white">{stats.plays}</td>
                    <td className="px-6 py-4 text-right text-green-400 font-bold">{stats.completions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
