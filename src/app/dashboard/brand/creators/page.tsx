'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Camera, Play, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function CreatorRosterPage() {
  const [search, setSearch] = useState('');
  // Fetching creators list
  const { data: creators, error, isLoading } = useSWR('/creators?limit=20', fetcher);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Camera className="w-4 h-4" />;
      case 'youtube': return <Play className="w-4 h-4" />;
      case 'twitter':
      case 'x': return <MessageCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 bg-[#05070A] min-h-screen text-gray-300 font-sans p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/brand" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Creator Roster</h1>
            <p className="text-gray-400 mt-1">Manage and discover creators for your next campaign.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search creators..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-secondary transition-colors w-64"
              />
            </div>
            <button className="bg-surface border border-white/10 p-2 rounded-lg text-gray-400 hover:text-white hover:border-white/30 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="bg-primary text-background font-bold px-4 py-2 rounded-lg hover:bg-white transition-colors">
              Invite Creator
            </button>
          </div>
        </div>

        {/* Filters/Tags Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All Creators', 'Fashion', 'Tech', 'Gaming', 'Lifestyle', 'Beauty', 'Fitness'].map((tag) => (
            <button key={tag} className="whitespace-nowrap px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors">
              {tag}
            </button>
          ))}
        </div>

        {/* Creators Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface border border-white/5 rounded-2xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 bg-red-500/10 rounded-2xl border border-red-500/20">
            Failed to load creators. Please try again.
          </div>
        ) : !creators || creators.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-white/5 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2">No creators found</h3>
            <p className="text-gray-400">Invite creators to join your roster to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={creator.id} 
                className="bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all group cursor-pointer"
              >
                {/* Banner/Header */}
                <div className="h-24 bg-gradient-to-r from-primary/20 to-blue-600/20 relative">
                  <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full border-4 border-[#05070A] bg-[#1a1f2e] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                    {creator.profile_image_url ? (
                      <img src={creator.profile_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      creator.business_name?.charAt(0) || 'C'
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-[#05070A]/50 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    4.9
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-4 pt-10">
                  <h3 className="font-bold text-white truncate text-lg">{creator.business_name || 'Anonymous Creator'}</h3>
                  <div className="flex items-center text-gray-500 text-xs mt-1 space-x-2">
                    {creator.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {creator.country}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {creator.categories?.slice(0, 3).map((cat: string) => (
                      <span key={cat} className="px-2 py-0.5 bg-white/5 text-gray-300 rounded text-[10px] uppercase tracking-wider font-semibold">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Platforms */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {creator.platforms?.slice(0, 3).map((plat: string) => (
                        <div key={plat} className="text-gray-400 hover:text-white" title={plat}>
                          {getPlatformIcon(plat) || <span className="text-[10px] bg-white/10 px-1 rounded">{plat.substring(0, 2)}</span>}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View Profile →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
