'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Play, 
  Camera, 
  TrendingUp, 
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';

// Mock Creators Data for Marketplace
const creatorsList = [
  {
    id: 'c1',
    name: 'Rohan Sharma',
    niche: 'Tech & Gadgets',
    image: 'R',
    aiSummary: 'Highly loyal tech audience. Exceptional AVD of 6m45s makes him ideal for deep-dive product reviews and tutorials.',
    metrics: {
      platform: 'YouTube',
      reach: '1.2M Subs',
      ctr: '8.4%',
      engagement: 'High'
    }
  },
  {
    id: 'c2',
    name: 'Priya Style',
    niche: 'Fashion & Lifestyle',
    image: 'P',
    aiSummary: 'Incredible conversion rates on fashion hauls. Her audience actively clicks affiliate links with a 4.2% IG engagement rate.',
    metrics: {
      platform: 'Instagram',
      reach: '450K Follows',
      ctr: 'N/A',
      engagement: '4.2%'
    }
  },
  {
    id: 'c3',
    name: 'Code with Raj',
    niche: 'Education & Coding',
    image: 'C',
    aiSummary: 'Extremely high trust factor. Best suited for SaaS tools, coding bootcamps, and developer hardware promotions.',
    metrics: {
      platform: 'YouTube',
      reach: '850K Subs',
      ctr: '7.1%',
      engagement: 'Very High'
    }
  }
];

export default function BrandMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Brand Topbar */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Logo />
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider ml-4">
            <CheckCircle2 className="w-3 h-3" /> Verified Brand
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-secondary font-bold">Discover Creators</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">My Campaigns</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contracts & Payments</a>
          </nav>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <Link href="/login" className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-white/5 bg-background p-6 overflow-y-auto">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Platform</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-gray-300 hover:text-white cursor-pointer"><input type="checkbox" className="accent-secondary" defaultChecked /> YouTube</label>
                <label className="flex items-center gap-3 text-sm text-gray-300 hover:text-white cursor-pointer"><input type="checkbox" className="accent-secondary" defaultChecked /> Instagram</label>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Niche / Category</label>
              <div className="space-y-2">
                {['Tech', 'Fashion', 'Education', 'Gaming', 'Finance'].map(niche => (
                  <label key={niche} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white cursor-pointer">
                    <input type="checkbox" className="accent-secondary" /> {niche}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Audience Size</label>
              <select className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-secondary transition-all">
                <option>Any Size</option>
                <option>10K - 100K (Micro)</option>
                <option>100K - 500K (Mid)</option>
                <option>500K - 1M (Macro)</option>
                <option>1M+ (Mega)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Marketplace Main Area */}
        <main className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto bg-surface/30 relative">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Creator Discovery</h1>
                <p className="text-gray-400 mt-1">Find the perfect partner for your next campaign.</p>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search by name, niche, or keyword..." 
                  className="w-full bg-background border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-secondary/50 transition-all shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Creator Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {creatorsList.map(creator => (
                <motion.div 
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-surface border border-white/5 hover:border-secondary/30 rounded-3xl overflow-hidden group cursor-pointer transition-all shadow-lg"
                  onClick={() => setSelectedCreator(creator)}
                >
                  <div className="p-6 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 blur-[40px] rounded-full group-hover:bg-secondary/20 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-2xl border-2 border-white/10">
                        {creator.image}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl group-hover:text-secondary transition-colors">{creator.name}</h3>
                        <p className="text-sm text-gray-400">{creator.niche}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-background/50 space-y-4">
                    <div className="bg-secondary/5 border border-secondary/10 p-4 rounded-2xl relative">
                      <Star className="absolute top-2 right-2 w-4 h-4 text-secondary/50" />
                      <p className="text-[10px] uppercase font-black tracking-widest text-secondary mb-1">AI Match Summary</p>
                      <p className="text-sm text-gray-300 leading-relaxed italic">"{creator.aiSummary}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-surface border border-white/5 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          {creator.metrics.platform === 'YouTube' ? <Play className="w-4 h-4 text-red-500" /> : <Camera className="w-4 h-4 text-pink-500" />}
                          <span className="text-xs text-gray-500 font-medium">Reach</span>
                        </div>
                        <p className="font-bold">{creator.metrics.reach}</p>
                      </div>
                      <div className="bg-surface border border-white/5 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-gray-500 font-medium">Engagement</span>
                        </div>
                        <p className="font-bold">{creator.metrics.engagement}</p>
                      </div>
                    </div>

                    <button className="w-full mt-2 bg-white/5 hover:bg-secondary hover:text-background text-white font-bold py-3 rounded-xl transition-all border border-white/10 hover:border-secondary flex items-center justify-center gap-2">
                      View Full Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Profile Modal Overlay (Mock) */}
      <AnimatePresence>
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedCreator(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-surface/90 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold">Creator Profile</h2>
                <button onClick={() => setSelectedCreator(null)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 flex-1">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-4xl border-4 border-surface shadow-xl">
                    {selectedCreator.image}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{selectedCreator.name}</h1>
                    <p className="text-gray-400">{selectedCreator.niche}</p>
                  </div>
                </div>

                <div className="bg-secondary/10 border border-secondary/20 p-6 rounded-2xl mb-8">
                  <h3 className="text-secondary font-bold mb-2 flex items-center gap-2"><Star className="w-5 h-5" /> Why Hire Me (AI Analysis)</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{selectedCreator.aiSummary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-background border border-white/5 p-6 rounded-2xl text-center">
                    <p className="text-gray-500 mb-2">Total Reach</p>
                    <p className="text-3xl font-bold">{selectedCreator.metrics.reach}</p>
                  </div>
                  <div className="bg-background border border-white/5 p-6 rounded-2xl text-center">
                    <p className="text-gray-500 mb-2">Platform</p>
                    <p className="text-3xl font-bold flex items-center justify-center gap-2">
                      {selectedCreator.metrics.platform === 'YouTube' ? <Play className="text-red-500 w-8 h-8" /> : <Camera className="text-pink-500 w-8 h-8" />}
                    </p>
                  </div>
                </div>

                <button className="w-full bg-secondary text-background font-black text-lg py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(var(--color-secondary),0.3)] flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Request Campaign Proposal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
