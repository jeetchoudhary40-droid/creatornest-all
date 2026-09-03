'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { adminUpdateWhere, adminDelete } from '@/lib/adminDb';
import { Star, CheckCircle2, XCircle, Trash2, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
    ))}
  </div>
);

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const fetchRatings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('course_ratings')
      .select('*, courses(title), profiles(full_name, email)')
      .order('created_at', { ascending: false });
    if (data) setRatings(data);
    setLoading(false);
  };

  useEffect(() => { fetchRatings(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminUpdateWhere('course_ratings', { id }, { is_approved: true });
      fetchRatings();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminUpdateWhere('course_ratings', { id }, { is_approved: false });
      fetchRatings();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this rating?')) return;
    try {
      await adminDelete('course_ratings', id);
      fetchRatings();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = ratings.filter(r => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-white/5 p-6 rounded-2xl">
        <Link href="/admin/courses" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Course Ratings Manager</h1>
            <p className="text-sm text-gray-400 mt-0.5">Approve or reject user submitted reviews before they go public</p>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'approved'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors capitalize ${filter === f ? 'bg-primary text-background' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
              >
                {f} {f === 'pending' && ratings.filter(r => !r.is_approved).length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {ratings.filter(r => !r.is_approved).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">{filter === 'pending' ? 'No pending ratings to review!' : 'No ratings found.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(r => (
              <div key={r.id} className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StarDisplay rating={r.rating} />
                    <span className="text-xs font-bold text-gray-400 px-2 py-0.5 rounded-full bg-white/5">
                      {r.courses?.title || 'Unknown Course'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${r.is_approved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {r.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {r.review_text && (
                    <p className="text-sm text-gray-300 mb-2 italic">"{r.review_text}"</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{r.profiles?.full_name || 'Anonymous'}</span>
                    <span>·</span>
                    <span>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!r.is_approved && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold transition-colors border border-green-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {r.is_approved && (
                    <button
                      onClick={() => handleReject(r.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold transition-colors border border-yellow-500/20"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Un-approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
