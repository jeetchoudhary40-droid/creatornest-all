'use client';

import Link from 'next/link';
import { Calendar, User, Clock, ChevronRight, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { BlogPost, BLOG_CATEGORIES } from '../blogData';
import { useLanguage } from '@/context/LanguageContext';
import ArticleReadingTools from './ArticleReadingTools';

interface ArticleClientViewProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function ArticleClientView({ post, relatedPosts }: ArticleClientViewProps) {
  const { isHindi } = useLanguage();

  const title = isHindi ? (post.title_hi || post.title) : post.title;
  const excerpt = isHindi ? (post.excerpt_hi || post.excerpt) : post.excerpt;
  const content = isHindi ? (post.content_hi || post.content) : post.content;
  const readTime = isHindi ? (post.readTime_hi || post.readTime) : post.readTime;
  const tags = (isHindi ? post.tags_hi : post.tags) || post.tags || [];
  const authorRole = isHindi ? (post.author?.role_hi || post.author?.role || 'क्रिएटर स्ट्रैटेजिस्ट') : (post.author?.role || 'Creator Strategist');

  const categoryObj = BLOG_CATEGORIES.find(c => c.id === post.category);
  const categoryName = isHindi 
    ? (categoryObj?.name_hi || categoryObj?.name || 'क्रिएटर प्लेबुक') 
    : (categoryObj?.name || 'Creator Playbook');

  return (
    <>
      {/* Sticky Progress Bar & Top Action Bar with Language Switcher */}
      <ArticleReadingTools title={title} slug={post.slug} />

      <main className="flex-1 pt-24 sm:pt-32 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb Navigation for Mobile & Desktop */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <Link href="/" className="hover:text-white transition-colors shrink-0">
              {isHindi ? 'होम' : 'Home'}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
            <Link href="/blog" className="hover:text-primary transition-colors shrink-0">
              {isHindi ? 'ब्लॉग' : 'Blog'}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
            <span className="text-gray-300 truncate">{title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-8 sm:mb-10 text-left">
            {/* Category badge and read time */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider border ${
                post.category === 'news'
                  ? 'bg-red-500/15 text-red-300 border-red-500/30'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {categoryName}
              </span>
              <span className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-300 font-medium px-2 py-1 rounded-md bg-white/5 border border-white/5">
                <Clock className="w-3 h-3 text-primary" /> {readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed mb-6 font-normal">
              {excerpt}
            </p>
            
            {/* Author & Date metadata bar */}
            <div className="flex items-center justify-between border-y border-white/10 py-3 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-2.5">
                {post.author?.avatar_url ? (
                  <img 
                    src={post.author.avatar_url} 
                    alt={post.author.full_name} 
                    className="w-8 h-8 rounded-full object-cover border border-primary/40 shrink-0" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm leading-tight">
                    {post.author?.full_name || 'Creator Nest Team'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400">
                    {authorRole}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </time>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 sm:mb-12 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-xl bg-white/5 aspect-video relative">
              <img 
                src={post.featured_image} 
                alt={title} 
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Quick Takeaways Box */}
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-white/[0.02] to-transparent border border-primary/25">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <Lightbulb className="w-4 h-4 text-primary" /> 
              {isHindi ? 'ज़रूरी बातें' : 'Quick Takeaway'}
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {excerpt}
            </p>
          </div>

          {/* Article Body Styled with .blog-content */}
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-10 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold mr-1">
                {isHindi ? 'टैग्स:' : 'Tags:'}
              </span>
              {tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Box */}
          <div className="mt-10 p-5 sm:p-6 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {post.author?.avatar_url && (
              <img 
                src={post.author.avatar_url} 
                alt={post.author.full_name} 
                className="w-14 h-14 rounded-xl object-cover border border-primary/30 shrink-0"
              />
            )}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                {isHindi ? 'लेखक:' : 'Written by'} {post.author?.full_name || 'Creator Nest Team'}
              </h3>
              <p className="text-xs text-primary font-medium mb-1.5">
                {authorRole}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {isHindi 
                  ? 'भारत के शीर्ष क्रिएटर्स को उनके चैनल की रीच बढ़ाने, ब्रांड स्पॉन्सरशिप्स को सुरक्षित करने और डिजिटल ब्रांड खड़ा करने में मदद करना।'
                  : 'Empowering creators across India to scale watch time, optimize revenue streams, and build enduring digital brands.'}
              </p>
            </div>
          </div>

          {/* Creator CTA */}
          <div className="mt-10 p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-[#4FACFE]/10 border border-primary/20 rounded-2xl text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 
              {isHindi ? 'अपनी कमाई बढ़ाएं' : 'Scale Your Reach'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              {isHindi ? 'ब्रांड डील्स और चैनल ग्रोथ चाहते हैं?' : 'Want Brand Deals & Channel Scaling?'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-5 max-w-md mx-auto leading-relaxed">
              {isHindi 
                ? 'क्रिएटर नेस्ट के एक्सक्लूसिव रोस्टर से जुड़ें। हम आपके लिए हाई-पेइंग ब्रांड डील्स और मैनेजमेंट संभालते हैं।'
                : 'Join India\'s leading creators. We handle high-paying brand negotiations, sponsorships, and growth management.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                href="/join"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-[#4FACFE] text-black font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(0,242,254,0.25)] hover:scale-105 transition-all text-center"
              >
                {isHindi ? 'क्रिएटर रोस्टर में जुड़ें' : 'Apply to Creator Roster'}
              </Link>
              <Link
                href="/blog"
                className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm rounded-xl transition-all text-center"
              >
                {isHindi ? 'और आर्टिकल्स देखें' : 'More Articles'}
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-14 pt-8 border-t border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white mb-6">
                {isHindi ? 'सुझाए गए प्लेबुक्स और न्यूज़' : 'Recommended Playbooks & News'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((relPost) => {
                  const relTitle = isHindi ? (relPost.title_hi || relPost.title) : relPost.title;
                  const relReadTime = isHindi ? (relPost.readTime_hi || relPost.readTime) : relPost.readTime;

                  return (
                    <Link
                      key={relPost.id}
                      href={`/blog/${relPost.slug}`}
                      className="group bg-white/[0.02] border border-white/5 hover:border-primary/30 rounded-xl p-3.5 transition-all flex flex-col justify-between hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="aspect-video rounded-lg overflow-hidden mb-2.5 bg-white/5">
                          <img 
                            src={relPost.featured_image} 
                            alt={relTitle} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">
                          {relReadTime}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {relTitle}
                        </h4>
                      </div>
                      <div className="inline-flex items-center gap-1 text-primary text-[11px] font-bold pt-2 mt-2 border-t border-white/5">
                        {isHindi ? 'पढ़ें' : 'Read'} <ArrowRight className="w-3 h-3" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </article>
      </main>
    </>
  );
}
