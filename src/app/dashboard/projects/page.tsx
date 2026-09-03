'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Kanban, List, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, MessageSquare, Paperclip, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const MOCK_PROJECTS = [
  { id: '1', title: 'YouTube Thumbnail Pack', status: 'in-progress', dueDate: '2026-06-10', unreadMsgs: 2, client: 'Creator Team' },
  { id: '2', title: 'Channel SEO Audit', status: 'pending', dueDate: '2026-06-15', unreadMsgs: 0, client: 'Strategy Team' },
  { id: '3', title: 'Shorts Video Editing', status: 'completed', dueDate: '2026-05-28', unreadMsgs: 0, client: 'Editing Team' },
];

export default function DashboardProjectsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center p-4">
          <AlertCircle className="w-16 h-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6 text-center max-w-md">You need to sign in to view your projects and service bookings.</p>
          <Link href="/login" className="bg-primary text-background px-6 py-2.5 rounded-lg font-bold text-sm">
            Sign In with Google
          </Link>
        </div>
      </main>
    );
  }

  const filteredProjects = MOCK_PROJECTS.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns = [
    { id: 'pending', label: 'Pending Start', color: '#F59E0B' },
    { id: 'in-progress', label: 'In Progress', color: '#00F2FE' },
    { id: 'completed', label: 'Completed', color: '#10B981' },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Projects</h1>
            <p className="text-sm text-gray-400">Manage your active service bookings and team communications.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-white/10">
              <Plus className="w-4 h-4" /> Book New Service
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-surface border border-white/10 rounded-lg flex p-1">
              <button 
                onClick={() => setView('kanban')}
                className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="bg-surface border border-white/10 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Board View */}
        {view === 'kanban' ? (
          <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
            <div className="flex gap-6 min-w-max h-full">
              {columns.map(col => (
                <div key={col.id} className="w-80 flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                      <h3 className="font-semibold text-white">{col.label}</h3>
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {filteredProjects.filter(p => p.status === col.id).length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 flex flex-col gap-3 min-h-[200px] rounded-xl bg-white/[0.02] p-2 border border-white/5">
                    {filteredProjects.filter(p => p.status === col.id).map(project => (
                      <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                        <motion.div 
                          layoutId={`card-${project.id}`}
                          className="bg-surface border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/50 group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{project.client}</span>
                            <button className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-semibold text-white mb-4 text-sm leading-tight">{project.title}</h4>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                              {project.unreadMsgs > 0 && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {project.unreadMsgs}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Paperclip className="w-3.5 h-3.5" />
                                2
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-1.5 text-xs ${project.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`}>
                              {project.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                    {filteredProjects.filter(p => p.status === col.id).length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg text-xs text-gray-600 font-medium">
                        No projects
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Project Name</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Due Date</th>
                  <th className="px-6 py-4 font-bold">Assigned Team</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, i) => (
                  <tr key={project.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/projects/${project.id}`} className="font-semibold text-white group-hover:text-primary transition-colors text-sm flex items-center gap-2">
                        {project.title}
                        {project.unreadMsgs > 0 && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase" style={{ 
                        background: `${columns.find(c => c.id === project.status)?.color}15`, 
                        color: columns.find(c => c.id === project.status)?.color 
                      }}>
                        {columns.find(c => c.id === project.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {project.client}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
}
