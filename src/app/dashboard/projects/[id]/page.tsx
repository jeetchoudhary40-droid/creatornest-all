'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Paperclip, Send, Download, FileVideo, CheckCircle2, Clock, MapPin, MoreVertical, UploadCloud
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const MOCK_PROJECT = {
  id: '1',
  title: 'YouTube Thumbnail Pack',
  status: 'in-progress',
  dueDate: '2026-06-10',
  description: 'Design 5 custom thumbnails for the upcoming "Algorithm Deep Dive" series.',
  client: 'Creator Team',
  timeline: [
    { status: 'Order Placed', date: 'June 1, 2026', done: true },
    { status: 'Requirements Gathered', date: 'June 2, 2026', done: true },
    { status: 'In Progress', date: 'June 3, 2026', done: true },
    { status: 'First Draft Review', date: 'Pending', done: false },
    { status: 'Final Delivery', date: 'Pending', done: false },
  ]
};

const MOCK_MESSAGES = [
  { id: 1, sender: 'team', text: 'Hi! We received your order. Could you share your brand guidelines?', time: '10:00 AM, Jun 2', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: 2, sender: 'user', text: 'Sure, here is the PDF.', time: '11:30 AM, Jun 2', hasAttachment: true },
  { id: 3, sender: 'team', text: 'Thanks! We will have the first drafts ready by Friday.', time: '11:45 AM, Jun 2', avatar: 'https://i.pravatar.cc/150?img=33' },
];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: string;
    text: string;
    time: string;
    avatar?: string;
    hasAttachment?: boolean;
  }>>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
    }]);
    setNewMessage('');
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{MOCK_PROJECT.title}</h1>
                <span className="bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  In Progress
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-2xl">{MOCK_PROJECT.description}</p>
            </div>

            <div className="flex items-center gap-4 bg-surface border border-white/10 rounded-xl p-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock className="w-4 h-4 text-primary" />
                  {new Date(MOCK_PROJECT.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned To</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary border border-primary/30">CT</div>
                  {MOCK_PROJECT.client}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
          
          {/* Main Chat Area */}
          <div className="lg:col-span-2 flex flex-col bg-surface border border-white/10 rounded-2xl overflow-hidden h-full">
            {/* Chat Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02]">
              <h2 className="font-semibold text-white text-sm">Project Discussion</h2>
              <button className="text-gray-400 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.sender === 'team' && (
                    <img src={msg.avatar} alt="Team" className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0" />
                  )}
                  
                  <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-xs font-semibold text-gray-300">{msg.sender === 'user' ? 'You' : 'Creator Nest Team'}</span>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-background rounded-tr-sm' 
                        : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'
                    }`}>
                      {msg.text}
                    </div>

                    {msg.hasAttachment && (
                      <div className="mt-2 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 pr-4 w-64 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                          <FileVideo className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">Brand_Guidelines.pdf</p>
                          <p className="text-[10px] text-gray-400">1.2 MB</p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/[0.02] border-t border-white/10">
              <form onSubmit={handleSend} className="flex items-end gap-3 bg-background border border-white/10 rounded-xl p-2 focus-within:border-primary/50 transition-colors">
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white resize-none max-h-32 min-h-[40px] py-2 custom-scrollbar"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Timeline & Files */}
          <div className="flex flex-col gap-6">
            
            {/* Timeline */}
            <div className="bg-surface border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-6 text-sm">Project Timeline</h3>
              <div className="space-y-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10 -z-10" />
                
                {MOCK_PROJECT.timeline.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start z-10 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      step.done 
                        ? 'bg-primary text-background' 
                        : 'bg-background border-2 border-white/20 text-transparent'
                    }`}>
                      {step.done && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.status}</p>
                      <p className="text-xs text-gray-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Files */}
            <div className="bg-surface border border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">Shared Files</h3>
                <button className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" /> Upload
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Mock File */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 flex items-center justify-center flex-shrink-0">
                    <Paperclip className="w-4 h-4 text-[#EF4444]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Brand_Guidelines.pdf</p>
                    <p className="text-[10px] text-gray-500">Uploaded Jun 2</p>
                  </div>
                  <Download className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Empty state if needed */}
              {/* <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-xs text-gray-400 max-w-[200px]">No files shared yet. Upload assets to get started.</p>
              </div> */}
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
