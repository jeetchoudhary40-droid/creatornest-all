'use client';

import { useState, useEffect } from 'react';
import { Share2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface ArticleReadingToolsProps {
  title: string;
  slug: string;
}

export default function ArticleReadingTools({ title, slug }: ArticleReadingToolsProps) {
  const { isHindi } = useLanguage();
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: isHindi 
            ? `क्रिएटर नेस्ट से यह आर्टिकल पढ़ें: ${title}`
            : `Check out this creator playbook from Creator Nest: ${title}`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* Sticky Reading Progress Bar for Mobile & Desktop */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-primary to-[#4FACFE] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(0,242,254,0.8)]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Action Bar (Back + Language Switcher + Share) */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-white/5 max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-400 hover:text-primary transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isHindi ? 'सभी आर्टिकल्स' : 'Back to Articles'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Switcher right in the reading bar */}
          <LanguageSwitcher compact layoutIdPrefix="article-reading" />

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 text-[11px] sm:text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
            title={isHindi ? 'आर्टिकल शेयर करें' : 'Share article'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{isHindi ? 'कॉपी हुआ!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-primary" />
                <span>{isHindi ? 'शेयर' : 'Share'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
