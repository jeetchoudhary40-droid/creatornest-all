'use client';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rohan V.',
    niche: 'Gaming & Tech',
    quote:
      'Creator Nest completely changed my direction. Within 3 months I had my first ₹2L brand deal and 400K new subscribers. The system works.',
    metric: '400K Subs in 3 Months',
    avatar: 'RV',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Aisha K.',
    niche: 'Lifestyle & Fashion',
    quote:
      "I was posting daily with zero growth. Creator Nest audited my content in week 1 and rebuilt my entire strategy. I'm now earning ₹3.5L/month consistently.",
    metric: '₹3.5L/Month Revenue',
    avatar: 'AK',
    color: 'from-pink-500 to-rose-600',
  },
  {
    name: 'Kabir M.',
    niche: 'Comedy & Entertainment',
    quote:
      "The mentorship is elite. They helped me understand the business side of content — not just views. Now I have a team and multiple income streams.",
    metric: '2.4M Followers',
    avatar: 'KM',
    color: 'from-orange-500 to-amber-600',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-14 bg-surface/30 border-y border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm text-primary font-medium">Creator Success Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Real Creators. <span className="text-primary italic">Real Results.</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            Hear from creators who transformed their channels into businesses.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="bg-surface border border-white/5 hover:border-primary/20 rounded-2xl p-5 sm:p-6 flex flex-col space-y-4 transition-all group shadow-xl relative"
            >
              {/* Quote icon */}
              <Quote className="w-7 h-7 text-primary/30 absolute top-5 right-5" />

              {/* Stars */}
              <div className="flex space-x-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 text-primary fill-primary" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-gray-300 leading-relaxed text-xs sm:text-sm italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Metric Badge */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-primary text-xs font-bold w-fit">
                🚀 {t.metric}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-3 pt-2 border-t border-white/5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-black text-white text-xs`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-white text-sm group-hover:text-primary transition-colors">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.niche}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
