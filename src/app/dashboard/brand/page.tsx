'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, PieChart, Briefcase, Settings, LogOut, Bell, Plus, Search, Star } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function BrandDashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [recommendedCreators, setRecommendedCreators] = useState<any[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'brand' && user.role !== 'admin' && user.role !== 'super_admin') {
        router.push('/dashboard/user');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070A]">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  useEffect(() => {
    if (!user) return;
    const fetchCreators = async () => {
      try {
        const res = await api.get('/creators?limit=10');
        // The API returns either a list of creators or a paginated response { items: [...] }
        const creatorsList = res.data?.data?.items || res.data?.data || res.data?.items || res.data || [];
        setRecommendedCreators(Array.isArray(creatorsList) ? creatorsList : []);
      } catch (err) {
        console.error('Error fetching creators', err);
      } finally {
        setLoadingCreators(false);
      }
    };
    fetchCreators();
  }, []);
  
  // Fetch Dashboard Stats
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR('/dashboard/stats', fetcher);
  
  // Fetch Active Campaigns
  const { data: campaigns, error: campaignsError, isLoading: campaignsLoading } = useSWR('/campaigns?limit=5', fetcher);

  // Fetch Unread Notifications Count
  const { data: unreadNotifications } = useSWR('/notifications/unread-count', fetcher);

  return (
    <div className="flex h-screen bg-[#05070A] overflow-hidden text-gray-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface/50 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-background font-black text-xl uppercase">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user?.full_name || 'Loading...'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Brand'}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Campaigns', href: '/dashboard/brand', active: true },
              { icon: <Users className="w-5 h-5" />, label: 'Creator Roster', href: '/dashboard/brand/creators' },
              { icon: <PieChart className="w-5 h-5" />, label: 'ROI Analytics', href: '/dashboard/brand/analytics' },
              { icon: <Briefcase className="w-5 h-5" />, label: 'Invoices & Billing', href: '/dashboard/brand/invoices' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-secondary/10 text-secondary font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/5">
          <nav className="space-y-2">
            <Link href="/dashboard/brand/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button onClick={logout} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-surface/30 sticky top-0 z-10 backdrop-blur-md">
          <h1 className="text-xl font-bold text-white">Campaign Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search creators..." 
                className="bg-surface border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications?.unread_count > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-[10px] text-white font-bold rounded-full border-2 border-[#05070A]">
                  {unreadNotifications.unread_count > 9 ? '9+' : unreadNotifications.unread_count}
                </span>
              )}
            </button>
            <Link href="/dashboard/brand/campaigns/new" className="bg-secondary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Active Campaigns', value: statsLoading ? '...' : (stats?.active_campaigns || '0'), color: 'text-white' },
              { label: 'Total Creators', value: statsLoading ? '...' : (stats?.total_creators || '0'), color: 'text-white' },
              { label: 'Monthly Revenue', value: statsLoading ? '...' : `₹${(stats?.monthly_revenue || 0).toLocaleString()}`, color: 'text-secondary' },
              { label: 'Outstanding Invoices', value: statsLoading ? '...' : `₹${(stats?.outstanding_invoices || 0).toLocaleString()}`, color: 'text-white' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-surface border border-white/5 rounded-2xl p-5"
              >
                <span className="text-gray-400 font-medium text-sm block mb-2">{stat.label}</span>
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Campaigns Table */}
          <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Active Campaigns</h3>
              <div className="flex space-x-2">
                <button className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors">All</button>
                <button className="text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5">Drafts</button>
                <button className="text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5">Completed</button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Campaign Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Creators</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Budget</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaignsLoading ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading campaigns...</td></tr>
                  ) : campaignsError ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-red-500">Failed to load campaigns</td></tr>
                  ) : campaigns && campaigns.length > 0 ? campaigns.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{row.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          row.status === 'active' ? 'bg-green-500/10 text-green-400' :
                          row.status === 'completed' ? 'bg-secondary/10 text-secondary' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {row.creators_count || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-medium">₹{(row.budget || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/brand/campaigns/${row.id}`} className="text-secondary hover:text-white text-sm font-medium transition-colors">Manage</Link>
                      </td>
                    </tr>
                  )) : (
                     <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No active campaigns found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discover Creators (Driven by new Profile Analytics) */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Recommended Creators</span>
              </h3>
              <Link href="/dashboard/brand/creators" className="text-sm text-secondary hover:text-white transition-colors">View Directory</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loadingCreators ? (
                <div className="text-gray-500">Loading creators...</div>
              ) : recommendedCreators.length === 0 ? (
                <div className="text-gray-500">No creators available.</div>
              ) : (
                recommendedCreators.map((creator: any) => (
                    <div key={creator.id} className="bg-surface/50 border border-white/5 rounded-2xl p-5 hover:border-secondary/30 transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/brand/creators/${creator.id}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background font-bold text-lg">
                            {creator.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <h4 className="font-bold text-white group-hover:text-secondary transition-colors">{creator.full_name}</h4>
                            <p className="text-xs text-gray-500">{creator.niche?.[0] || creator.primary_category || 'General'}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase rounded border border-yellow-400/20">
                          {(creator.talent_score || creator.authenticity_score || 0) > 9 ? 'High Trust' : 'Verified'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm border-t border-b border-white/5 py-3 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Total Reach</p>
                          <p className="font-bold text-white">
                            {creator.total_followers >= 1000000 
                              ? (creator.total_followers / 1000000).toFixed(1) + 'M' 
                              : creator.total_followers >= 1000 
                                ? (creator.total_followers / 1000).toFixed(1) + 'K' 
                                : creator.total_followers || '0'}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Pricing Tier</p>
                          <p className="font-bold text-secondary uppercase">{creator.creator_type || creator.pricing_tier || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Base Pricing Snapshot</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 truncate max-w-[120px]">
                            {creator.deliverable_pricing ? Object.keys(creator.deliverable_pricing)[0]?.replace('_', ' ') : 'Standard Post'}
                          </span>
                          <span className="font-bold text-white">
                            {creator.deliverable_pricing && Object.values(creator.deliverable_pricing as Record<string, number>)[0] 
                              ? `₹${(Object.values(creator.deliverable_pricing as Record<string, number>)[0] as number).toLocaleString()}` 
                              : 'Contact for Details'}
                          </span>
                        </div>
                      </div>
                    </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
