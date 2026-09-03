'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, DollarSign, Calendar, Settings, LogOut, Bell, MessageSquare, Video, Star } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function CreatorDashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'creator' && user.role !== 'admin' && user.role !== 'super_admin') {
        router.push('/dashboard/user');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070A]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Fetch Dashboard Stats
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR('/dashboard/stats', fetcher);
  
  // Fetch Campaigns
  const { data: campaigns, error: campaignsError, isLoading: campaignsLoading } = useSWR('/campaigns?limit=3', fetcher);

  // Fetch Tasks
  const { data: tasksDue } = useSWR('/dashboard/tasks-due', fetcher);
  
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold uppercase">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user?.full_name || 'Loading...'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Creator Manager'}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', href: '/dashboard/creator', active: true },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/creator/analytics' },
              { icon: <DollarSign className="w-5 h-5" />, label: 'Brand Deals', href: '/dashboard/creator/campaigns' },
              { icon: <Calendar className="w-5 h-5" />, label: 'Content Calendar', href: '/dashboard/creator/calendar' },
              { icon: <MessageSquare className="w-5 h-5" />, label: 'Coaching Chat', href: '/dashboard/creator/chat' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-primary/10 text-primary font-medium' 
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
            <Link href="/dashboard/creator/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
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
          <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications?.unread_count > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-[10px] text-white font-bold rounded-full border-2 border-[#05070A]">
                  {unreadNotifications.unread_count > 9 ? '9+' : unreadNotifications.unread_count}
                </span>
              )}
            </button>
            <Link href="/" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Exit to Site
            </Link>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/20 to-blue-600/20 border border-primary/20 rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 🚀</h2>
              <p className="text-primary/80">You have {stats?.active_campaigns || 0} active campaigns going on right now.</p>
            </div>
            <Link href="/dashboard/creator/campaigns" className="hidden sm:block bg-primary text-background font-bold px-6 py-2.5 rounded-xl hover:bg-white transition-colors">
              Review Deals
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Creators Managed', value: statsLoading ? '...' : (stats?.total_creators || '0'), trend: '+12%', icon: <TrendingUp className="text-green-400 w-6 h-6" /> },
              { label: 'Active Campaigns', value: statsLoading ? '...' : (stats?.active_campaigns || '0'), trend: '+5%', icon: <DollarSign className="text-primary w-6 h-6" /> },
              { label: 'Total Brands', value: statsLoading ? '...' : (stats?.total_brands || '0'), trend: '-1%', icon: <LayoutDashboard className="text-secondary w-6 h-6" /> },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-surface border border-white/5 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 font-medium">{stat.label}</span>
                  <div className="p-2 bg-white/5 rounded-lg">{stat.icon}</div>
                </div>
                <div className="flex items-end space-x-3">
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                  <span className={`text-sm font-medium mb-1 ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profile Health & Diagnostics */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Star className="w-32 h-32" />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-lg font-bold text-white">Profile Health</h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                {(user?.onboarding_data?.pricing_tier || 'Micro').toUpperCase()} TIER
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Authenticity Score */}
              <div className="bg-[#05070A] rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-yellow-400 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-white">{user?.onboarding_data?.authenticity_score || '85'}</span>
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Authenticity</p>
                <p className="text-[10px] text-gray-500 mt-1">Real Audience Index</p>
              </div>

              {/* Brand Safety Score */}
              <div className="bg-[#05070A] rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-white">{user?.onboarding_data?.brand_safety_score || '92'}</span>
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Brand Safety</p>
                <p className="text-[10px] text-gray-500 mt-1">Family Friendly</p>
              </div>

              {/* Category Info */}
              <div className="bg-[#05070A] rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 text-green-400">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Category</p>
                <p className="text-sm font-bold text-white mt-1">{user?.onboarding_data?.primary_category || 'Technology'}</p>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Deals */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Active Brand Deals</h3>
                <Link href="/dashboard/creator/campaigns" className="text-sm text-primary hover:text-white transition-colors">View All</Link>
              </div>
              <div className="space-y-4">
                {campaignsLoading ? (
                  <div className="text-center text-gray-500 py-4">Loading deals...</div>
                ) : campaignsError ? (
                  <div className="text-center text-red-500 py-4">Failed to load</div>
                ) : campaigns && campaigns.length > 0 ? campaigns.map((deal: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{deal.title}</p>
                        <p className={`text-xs ${deal.status === 'completed' ? 'text-green-400' : 'text-secondary'}`}>
                          {deal.status}
                        </p>
                      </div>
                    </div>
                    <span className="text-white font-bold">₹{(deal.budget || 0).toLocaleString()}</span>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-4">No active deals found.</div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Action Items</h3>
                <Link href="/dashboard/creator/tasks" className="text-sm text-primary hover:text-white transition-colors">View All</Link>
              </div>
              <div className="space-y-4">
                {!tasksDue ? (
                  <div className="text-center text-gray-500 py-4">Loading tasks...</div>
                ) : tasksDue?.overdue_tasks?.length === 0 && tasksDue?.due_today?.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No tasks due today. You are all caught up! 🚀</div>
                ) : (
                  <>
                    {tasksDue?.overdue_tasks?.map((task: any) => (
                      <div key={task.id} className="flex items-start space-x-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-500/20 transition-colors"></div>
                        <div>
                          <p className="text-gray-300 font-medium">{task.title}</p>
                          <p className="text-xs text-red-400">Overdue</p>
                        </div>
                      </div>
                    ))}
                    {tasksDue?.due_today?.map((task: any) => (
                      <div key={task.id} className="flex items-start space-x-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 border-2 border-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"></div>
                        <div>
                          <p className="text-gray-300 font-medium">{task.title}</p>
                          <p className="text-xs text-primary">Due Today</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
