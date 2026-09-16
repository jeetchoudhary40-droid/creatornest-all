'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Calendar, ArrowRight, Search, Clock, 
  Sparkles, CheckCircle2, TrendingUp, X, Newspaper 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BlogPost, BLOG_CATEGORIES } from './blogData';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface BlogClientViewProps {
  initialPosts: BlogPost[];
}

export default function BlogClientView({ initialPosts }: BlogClientViewProps) {
  const { isHindi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Filter posts based on search query and category
  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      
      const title = (isHindi ? (post.title_hi || post.title) : post.title).toLowerCase();
      const excerpt = (isHindi ? (post.excerpt_hi || post.excerpt) : post.excerpt).toLowerCase();
      const tags = (isHindi ? (post.tags_hi || post.tags) : post.tags) || [];
      const author = post.author?.full_name?.toLowerCase() || '';

      const matchesSearch = !query || 
        title.includes(query) ||
        excerpt.includes(query) ||
        tags.some(tag => tag.toLowerCase().includes(query)) ||
        author.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, searchQuery, selectedCategory, isHindi]);

  const featuredPost = useMemo(() => {
    if (searchQuery) return null;
    const explicit = filteredPosts.find(p => p.featured);
    return explicit || (selectedCategory === 'all' ? filteredPosts[0] : null);
  }, [filteredPosts, searchQuery, selectedCategory]);

  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter(p => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubscribed(true);
  };

  const getCategoryName = (catId: string) => {
    const found = BLOG_CATEGORIES.find(c => c.id === catId);
    if (!found) return catId;
    return isHindi ? (found.name_hi || found.name) : found.name;
  };

  return (
    <div className="min-h-screen bg-[#070B11] text-white">
      {/* Hero Header */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#00F2FE]/15 to-[#4FACFE]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Top Bar with Language Switcher */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest border border-primary/25 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> 
              {isHindi ? 'क्रिएटर नेस्ट इनसाइट्स और न्यूज़' : 'Creator Nest Insights & Playbooks'}
            </div>
            <LanguageSwitcher compact className="hidden sm:inline-flex" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
              {isHindi ? (
                <>
                  कंटेंट को बनाएं एक <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#a855f7]">
                    हाई-ग्रोथ क्रिएटर ब्रांड
                  </span>
                </>
              ) : (
                <>
                  Turn Content into a <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#a855f7]">
                    High-Growth Creator Brand
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              {isHindi 
                ? 'क्रिएटर्स न्यूज़, नए सरकारी नियम, रिटेंशन फ्रेमवर्क, और 100+ भारतीय क्रिएटर्स पर टेस्टेड स्पॉन्सरशिप प्लेबुक्स।'
                : 'Proven retention frameworks, creator policy news, high-ticket brand deal negotiation, and algorithm playbooks tested across 100+ Indian creators.'
              }
            </p>
          </motion.div>

          {/* Mobile Language Switcher */}
          <div className="sm:hidden flex justify-center mb-6">
            <LanguageSwitcher compact />
          </div>

          {/* Search bar */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="max-w-xl mx-auto relative mb-6 sm:mb-8"
          >
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder={isHindi ? "रणनीतियां, न्यूज़, स्पॉन्सरशिप डील्स और रिटेंशन खोजें..." : "Search strategies, news, brand deals, retention..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm md:text-base backdrop-blur-md transition-all shadow-lg"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Category Filter Pills (Including Creator's News) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          >
            {BLOG_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const isNews = cat.id === 'news';
              const label = isHindi ? (cat.name_hi || cat.name) : cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-[#4FACFE] text-black shadow-[0_0_20px_rgba(0,242,254,0.3)] font-bold'
                      : isNews
                      ? 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 hover:text-white'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isNews && <Newspaper className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Results indicator if searching or filtering */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 text-xs sm:text-sm text-gray-400">
            <div>
              {isHindi ? 'कुल' : 'Found'}{' '}
              <span className="font-bold text-white">{filteredPosts.length}</span>{' '}
              {isHindi ? 'आर्टिकल्स' : `article${filteredPosts.length === 1 ? '' : 's'}`}
              {selectedCategory !== 'all' && (
                <span> {isHindi ? 'में' : 'in'} <span className="text-primary font-medium">{getCategoryName(selectedCategory)}</span></span>
              )}
              {searchQuery && (
                <span> {isHindi ? 'खोज' : 'matching'} &ldquo;<span className="text-white font-medium">{searchQuery}</span>&rdquo;</span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-primary hover:underline text-xs font-semibold cursor-pointer"
            >
              {isHindi ? 'फ़िल्टर हटाएं' : 'Reset filters'}
            </button>
          </div>
        )}

        {/* 1. Spotlight / Featured Article */}
        {featuredPost && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 sm:mb-14"
          >
            <div className="relative group bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Image side */}
                <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden bg-white/5 min-h-[260px] sm:min-h-[300px]">
                  <img
                    src={featuredPost.featured_image}
                    alt={isHindi ? (featuredPost.title_hi || featuredPost.title) : featuredPost.title}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070B11] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#070B11]/80" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary text-black font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-black" /> 
                      {isHindi ? 'खास गाइड' : 'Spotlight Guide'}
                    </span>
                  </div>
                </div>

                {/* Content side */}
                <div className="lg:col-span-5 p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-400 font-medium mb-3 sm:mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-white/10 text-gray-300 uppercase tracking-wider text-[10px] font-bold">
                        {getCategoryName(featuredPost.category)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> 
                        {isHindi ? (featuredPost.readTime_hi || featuredPost.readTime) : featuredPost.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <Link href={`/blog/${featuredPost.slug}`} className="block group">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-primary transition-colors leading-tight mb-3 sm:mb-4">
                        {isHindi ? (featuredPost.title_hi || featuredPost.title) : featuredPost.title}
                      </h2>
                    </Link>

                    <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 sm:line-clamp-4 mb-5">
                      {isHindi ? (featuredPost.excerpt_hi || featuredPost.excerpt) : featuredPost.excerpt}
                    </p>

                    {/* Tags */}
                    {((isHindi ? featuredPost.tags_hi : featuredPost.tags) || featuredPost.tags) && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {((isHindi ? featuredPost.tags_hi : featuredPost.tags) || featuredPost.tags).map(tag => (
                          <span key={tag} className="text-[11px] sm:text-xs px-2.5 py-1 rounded-md bg-white/5 text-gray-400 border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {featuredPost.author?.avatar_url && (
                        <img
                          src={featuredPost.author.avatar_url}
                          alt={featuredPost.author.full_name}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-primary/30"
                        />
                      )}
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white leading-snug">{featuredPost.author?.full_name}</div>
                        <div className="text-[10px] sm:text-xs text-gray-400">
                          {isHindi ? (featuredPost.author?.role_hi || featuredPost.author?.role || 'क्रिएटर स्ट्रैटेजिस्ट') : (featuredPost.author?.role || 'Creator Strategist')}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-black font-bold text-xs sm:text-sm border border-primary/30 transition-all duration-200 shrink-0"
                    >
                      {isHindi ? 'गाइड पढ़ें' : 'Read Guide'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* 2. Blog Posts Grid */}
        {gridPosts.length === 0 && !featuredPost ? (
          <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 text-gray-500 mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {isHindi ? 'कोई आर्टिकल नहीं मिला' : 'No articles found'}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6 text-xs sm:text-sm">
              {isHindi 
                ? 'आपकी खोज के अनुसार कोई आर्टिकल नहीं मिला। कृपया दूसरा कीवर्ड या कैटेगरी चुनें।' 
                : "We couldn't find any articles matching your search criteria. Try adjusting your query or category filter."}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all cursor-pointer"
            >
              {isHindi ? 'सभी आर्टिकल्स दिखाएं' : 'Show All Articles'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {gridPosts.map((post, index) => {
              const displayTitle = isHindi ? (post.title_hi || post.title) : post.title;
              const displayExcerpt = isHindi ? (post.excerpt_hi || post.excerpt) : post.excerpt;
              const displayReadTime = isHindi ? (post.readTime_hi || post.readTime) : post.readTime;
              const isNews = post.category === 'news';

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,242,254,0.12)] flex flex-col"
                >
                  {/* Cover Image */}
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-white/5">
                    {post.featured_image ? (
                      <img 
                        src={post.featured_image} 
                        alt={displayTitle} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070B11]/90 via-transparent to-transparent opacity-80" />
                    
                    {/* Category Pill Over Image */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md border ${
                        isNews 
                          ? 'bg-red-500/80 text-white border-red-400/40' 
                          : 'bg-black/60 text-primary border-primary/20'
                      }`}>
                        {getCategoryName(post.category)}
                      </span>
                    </div>

                    {/* Read Time */}
                    <div className="absolute bottom-3 right-3 text-[10px] sm:text-[11px] text-gray-300 font-medium px-2 py-0.5 rounded bg-black/60 backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" /> {displayReadTime}
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </time>
                      </div>

                      <Link href={`/blog/${post.slug}`} className="block mb-2.5">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {displayTitle}
                        </h3>
                      </Link>

                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                        {displayExcerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {post.author?.avatar_url && (
                          <img 
                            src={post.author.avatar_url} 
                            alt={post.author.full_name} 
                            className="w-6 h-6 rounded-full object-cover border border-white/10" 
                          />
                        )}
                        <span className="text-[11px] sm:text-xs text-gray-300 font-medium truncate max-w-[110px]">
                          {post.author?.full_name || 'Creator Nest'}
                        </span>
                      </div>

                      <Link 
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-primary font-bold text-xs group-hover:gap-2 transition-all shrink-0"
                      >
                        {isHindi ? 'पढ़ें' : 'Read'} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* 3. Newsletter / Creator Playbook Strip */}
        <section className="mt-16 sm:mt-20 relative bg-gradient-to-r from-white/[0.07] via-white/[0.04] to-white/[0.07] border border-white/10 rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
              <TrendingUp className="w-3.5 h-3.5" /> {isHindi ? 'फ्री क्रिएटर इंटेलिजेंस' : 'Free Creator Intelligence'}
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
              {isHindi ? (
                <>हर हफ्ते पाएं <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#4FACFE]">2-मिनट का क्रिएटर प्लेबुक</span></>
              ) : (
                <>Get the Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#4FACFE]">2-Minute Creator Playbook</span></>
              )}
            </h2>
            
            <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
              {isHindi 
                ? 'हर मंगलवार, टॉप ब्रांड स्पॉन्सरशिप रेट्स, नए नियम और वीडियो हुक की रिपोर्ट सीधे आपके इनबॉक्स में। कोई स्पैम नहीं।'
                : 'Every Tuesday, we break down top brand sponsorship rates, algorithm shifts, and video hooks straight to your inbox. Zero spam.'
              }
            </p>

            {isSubscribed ? (
              <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4" /> 
                {isHindi ? 'धन्यवाद! मंगलवार को अपना इनबॉक्स चेक करें।' : "You're in! Check your inbox this Tuesday."}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder={isHindi ? "अपना ईमेल दर्ज करें..." : "Enter your creator email..."}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-auto flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-primary to-[#4FACFE] text-black font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isHindi ? '15k+ क्रिएटर्स से जुड़ें' : 'Join 15k+ Creators'}
                </button>
              </form>
            )}

            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-3 sm:mt-4">
              {isHindi 
                ? '15,000+ भारतीय क्रिएटर्स और यूट्यूबर्स का भरोसा। कभी भी अनसब्सक्राइब करें।'
                : 'Join 15,000+ top Indian creators, YouTubers & agencies. Unsubscribe anytime.'
              }
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
