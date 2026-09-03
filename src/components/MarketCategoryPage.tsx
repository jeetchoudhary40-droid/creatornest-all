'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Star, Sparkles, Search, Video, FileText, 
  Palette, Target, Users, Mic, Laptop, FolderOpen, 
  Megaphone, Brain, Wrench, GraduationCap, Coins, Rocket 
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { ITEMS as staticItems } from '@/app/marketplace/marketData';

import { supabase } from '@/lib/supabase';
import * as Lucide from 'lucide-react';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

interface MarketCategoryPageProps {
  categoryType: 'tool' | 'service' | 'template' | 'prompt';
  pageTitle: string;
  pageSubtitle: string;
  pageDescription: string;
}

const PLAN_COLORS: Record<string, string> = { free: '#6B7280', silver: '#C0C0C0', gold: '#F59E0B', platinum: '#00F2FE' };

const getFallbackThumbnail = (item: any) => {
  if (item.thumbnail_url) return item.thumbnail_url;
  
  if (item.type === 'service') {
    const serviceImages: Record<string, string> = {
      s1: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop', // Professional Video Editing
      s2: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', // AI Content Generation
      s3: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop', // Clickworthy Thumbnail Design
      s4: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop', // Channel Strategy & Audit
      s5: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop', // Social Media Management
      s6: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=600&auto=format&fit=crop', // Voice Over & Dubbing
      s7: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=600&auto=format&fit=crop', // Storytelling & Hook Coaching
      s8: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop', // Brand Deal Pitching
      s9: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=600&auto=format&fit=crop', // Digital Product & Community Builder
      s10: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', // Tech Support for Creators & Channel Audit
    };
    return serviceImages[item.id] || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop';
  }
  
  if (item.type === 'tool') {
    return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop'; // AI tech
  }
  
  if (item.type === 'template') {
    return 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600&auto=format&fit=crop'; // productivity/templates
  }

  if (item.type === 'prompt') {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'; // ChatGPT prompt tech
  }

  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
};

const getLucideIcon = (iconName: string) => {
  if (!iconName) return Sparkles;
  return (Lucide as any)[iconName] || Sparkles;
};

const getCategoryIcon = (catName: string) => {
  const name = catName.toLowerCase();
  if (name.includes('all')) return Sparkles;
  if (name.includes('audit') || name.includes('analysis')) return Search;
  if (name.includes('strategy') || name.includes('goal')) return Target;
  if (name.includes('coach') || name.includes('skill') || name.includes('learn')) return GraduationCap;
  if (name.includes('prod') || name.includes('video') || name.includes('edit')) return Video;
  if (name.includes('monet') || name.includes('pay') || name.includes('brand') || name.includes('deal')) return Coins;
  if (name.includes('scale') || name.includes('ip') || name.includes('rocket')) return Rocket;
  
  // Fallbacks
  if (name.includes('seo') || name.includes('script') || name.includes('writing') || name.includes('content')) return FileText;
  if (name.includes('design') || name.includes('graphic') || name.includes('thumbnail') || name.includes('art')) return Palette;
  if (name.includes('management') || name.includes('social') || name.includes('channel')) return Users;
  if (name.includes('voice') || name.includes('audio') || name.includes('dubbing') || name.includes('mic')) return Mic;
  if (name.includes('notion') || name.includes('template')) return FolderOpen;
  
  return Laptop;
};

const getStaticItemsForCategory = (categoryType: string) => {
  const filteredStatic = staticItems.filter(item => item.type === categoryType);
  return filteredStatic.map(item => {
    let priceVal = 0;
    if (item.meta && item.meta.includes('₹')) {
      const numStr = item.meta.replace(/[^0-9]/g, '');
      if (numStr) priceVal = parseInt(numStr, 10);
    }
    return { ...item, short_desc: item.desc, price: priceVal };
  });
};

export default function MarketCategoryPage({ categoryType, pageTitle, pageSubtitle, pageDescription }: MarketCategoryPageProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>(() => getStaticItemsForCategory(categoryType));
  const [categories, setCategories] = useState<string[]>(() => {
    const initialItems = getStaticItemsForCategory(categoryType);
    const uniqueCats = Array.from(new Set(initialItems.map(t => t.category).filter(Boolean)));
    return ['All', ...uniqueCats];
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initialItems = getStaticItemsForCategory(categoryType);
    setItems(initialItems);
    const uniqueCats = Array.from(new Set(initialItems.map(t => t.category).filter(Boolean)));
    setCategories(['All', ...uniqueCats]);
    setActiveCategory('All');
    
    loadStaticItems();
  }, [categoryType]);

  const loadStaticItems = async () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cn_market_items');
      if (cached) {
        const parsed = JSON.parse(cached);
        const filteredCached = parsed.filter((item: any) => item.item_type === categoryType);
        if (filteredCached.length > 0) {
          const mappedCached = filteredCached.map((item: any) => ({
            id: item.id,
            type: item.item_type,
            title: item.title,
            desc: item.short_desc,
            short_desc: item.short_desc,
            long_desc: item.long_desc,
            category: item.category,
            icon: getLucideIcon(item.icon),
            accent: item.accent,
            plan: item.plan,
            price: item.price,
            rating: item.rating,
            thumbnail_url: item.thumbnail_url,
            file_url: item.file_url,
            external_url: item.external_url,
            tags: item.tags || [],
            details: {
              features: item.features?.features || [],
              packages: item.features?.packages || [],
              faqs: item.features?.faqs || []
            }
          }));
          setItems(mappedCached);
          const uniqueCats = Array.from(new Set(mappedCached.map((t: any) => t.category).filter(Boolean))) as string[];
          setCategories(['All', ...uniqueCats]);
        }
      }
    }

    try {
      // 1. Fetch from database first
      const { data: dbItems, error } = await supabase
        .from('market_items')
        .select('*')
        .eq('item_type', categoryType)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (!error && dbItems && dbItems.length > 0) {
        const mapped = dbItems.map(item => ({
          id: item.id,
          type: item.item_type,
          title: item.title,
          desc: item.short_desc,
          short_desc: item.short_desc,
          long_desc: item.long_desc,
          category: item.category,
          icon: getLucideIcon(item.icon),
          accent: item.accent,
          plan: item.plan,
          price: item.price,
          rating: item.rating,
          thumbnail_url: item.thumbnail_url,
          file_url: item.file_url,
          external_url: item.external_url,
          tags: item.tags || [],
          details: {
            features: item.features?.features || [],
            packages: item.features?.packages || [],
            faqs: item.features?.faqs || []
          }
        }));
        setItems(mapped);
        const uniqueCats = Array.from(new Set(mapped.map(t => t.category).filter(Boolean)));
        setCategories(['All', ...uniqueCats]);
        
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('cn_market_items');
          let allItems = cached ? JSON.parse(cached) : [];
          allItems = allItems.filter((i: any) => i.item_type !== categoryType);
          allItems = [...allItems, ...dbItems];
          localStorage.setItem('cn_market_items', JSON.stringify(allItems));
        }
        return;
      }

      // 2. If table is empty or offline, fall back to local static data
      const filteredStatic = staticItems.filter(item => item.type === categoryType);
      
      // Background auto-seeding if Supabase table is online but currently empty
      if (!error && dbItems && dbItems.length === 0) {
        const seedPayload = filteredStatic.map((item, idx) => {
          let priceVal = 0;
          if (item.meta && item.meta.includes('₹')) {
            const numStr = item.meta.replace(/[^0-9]/g, '');
            if (numStr) priceVal = parseInt(numStr, 10);
          }
          return {
            id: getUUIDFromStaticId(String(item.id)),
            item_type: item.type,
            title: item.title,
            short_desc: item.desc,
            long_desc: item.details?.longDesc || item.desc,
            category: item.category,
            icon: item.icon?.name || item.icon?.displayName || 'Wrench',
            accent: item.accent || '#00F2FE',
            plan: item.plan || 'free',
            price: priceVal,
            rating: item.rating || 5.0,
            thumbnail_url: getFallbackThumbnail(item),
            file_url: '',
            external_url: item.href || '',
            tags: item.tags || [],
            features: {
              features: item.details?.features || [],
              packages: item.details?.packages || [],
              faqs: item.details?.faqs || []
            },
            is_published: true,
            sort_order: idx
          };
        });
        await supabase.from('market_items').insert(seedPayload);
      }

      const mapped = filteredStatic.map(item => {
        let priceVal = 0;
        if (item.meta && item.meta.includes('₹')) {
          const numStr = item.meta.replace(/[^0-9]/g, '');
          if (numStr) priceVal = parseInt(numStr, 10);
        }
        return { ...item, short_desc: item.desc, price: priceVal };
      });
      setItems(mapped);
      const uniqueCats = Array.from(new Set(mapped.map(t => t.category).filter(Boolean)));
      setCategories(['All', ...uniqueCats]);
    } catch (e) {
      console.error('Error fetching market items', e);
    }
  };

  const filtered = items.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || 
      t.title.toLowerCase().includes(q) || 
      (t.short_desc && t.short_desc.toLowerCase().includes(q)) || 
      (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(q)));
    return matchCat && matchSearch;
  });

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-8 relative overflow-hidden bg-background">
        {/* Fine grid overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,242,254,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,242,254,0.08) 0%, transparent 80%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                {pageSubtitle}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {pageTitle}
              </h1>
              <p className="text-gray-400 text-xs mt-1 max-w-xl">
                {pageDescription}
              </p>
            </div>
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface/60 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section className="pb-24 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filters */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="bg-surface/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="space-y-1">
                    {categories.map(c => {
                      const Icon = getCategoryIcon(c);
                      const active = activeCategory === c;
                      return (
                        <button key={c} onClick={() => setActiveCategory(c)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            active 
                              ? 'bg-primary/15 text-primary shadow-[0_0_15px_rgba(0,242,254,0.1)] font-bold' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{c}</span>
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            active ? 'bg-primary/20 text-primary font-bold' : 'bg-white/5 text-gray-500'
                          }`}>
                            {c === 'All' ? items.length : items.filter(item => item.category === c).length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Category pills */}
            <div className="flex flex-wrap gap-2 mb-6 lg:hidden">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    activeCategory === c 
                      ? 'bg-primary/15 border-primary/30 text-primary font-bold shadow-[0_0_10px_rgba(0,242,254,0.15)]' 
                      : 'border-white/10 text-gray-500 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Content Grid */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {filtered.map((item, i) => {
                  const accent = item.accent || '#00F2FE';
                  return (
                    <Link href={item.href || `/marketplace/item/${item.id}`} key={item.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-surface border border-white/5 rounded-3xl overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col h-full hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 relative"
                      >
                        {/* Glow Behind */}
                        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: accent }} />

                        <div className="aspect-video w-full relative overflow-hidden bg-white/5">
                          <img 
                            src={getFallbackThumbnail(item)} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {item.category && (
                            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 text-white shadow-lg">
                              {item.category}
                            </div>
                          )}
                          
                          {item.plan !== 'free' && (
                            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-md" 
                              style={{ background: 'rgba(0,0,0,0.7)', color: PLAN_COLORS[item.plan], border: `1px solid ${PLAN_COLORS[item.plan]}40` }}>
                              <Crown className="w-3 h-3" /> {(item.plan || 'silver').toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1 relative z-10">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">{item.title}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{item.short_desc}</p>
                          
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-5">
                              {item.tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-gray-500">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            {item.rating ? (
                              <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-yellow-400 font-bold text-sm">{item.rating}</span>
                              </div>
                            ) : (
                              <div className="text-xs font-semibold text-gray-500">New</div>
                            )}

                            <div className="font-black text-white text-lg">
                              {item.price > 0 ? `₹${item.price}` : 'Free'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20 bg-surface/50 rounded-3xl border border-white/5 mt-6">
                  <p className="text-gray-400">No items found matching your search or filters.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
