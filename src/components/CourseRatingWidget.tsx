import { useState } from 'react';
import { Star, MessageSquare, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CourseRatingWidgetProps {
  courseId: string;
  userId: string;
  onSubmitted?: () => void;
}

export default function CourseRatingWidget({ courseId, userId, onSubmitted }: CourseRatingWidgetProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const { error: dbError } = await supabase.from('course_ratings').insert({
        course_id: courseId,
        user_id: userId,
        rating,
        review_text: reviewText.trim() || null,
        is_approved: false // Requires admin approval
      });

      if (dbError) {
        if (dbError.code === '23505') { // Unique violation
          setError('You have already rated this course.');
        } else {
          setError(dbError.message);
        }
      } else {
        setSubmitted(true);
        if (onSubmitted) onSubmitted();
      }
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Thank you for your feedback!</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">Your rating has been submitted and is pending admin approval. We appreciate your input!</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Rate this Course</h3>
        <p className="text-gray-400 text-sm">How would you rate your learning experience?</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-2 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Leave a Review <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute top-3.5 left-4 w-5 h-5 text-gray-500" />
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others what you thought about this course..."
              rows={4}
              className="w-full bg-background border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm focus:border-primary/50 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full flex items-center justify-center gap-2 bg-primary text-background font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
}
