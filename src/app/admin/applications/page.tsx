'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Search, Loader2, CheckCircle2, X, Trash2,
  Video, Briefcase, Users, Mail, Phone, MessageSquare,
  Sparkles, RefreshCw, ExternalLink, Calendar, ShieldCheck,
  Check, Clock, UserPlus, Eye, EyeOff, CheckCheck,
  Download, FileText, Send, Save
} from 'lucide-react';
import Link from 'next/link';

export type SubmissionLead = {
  id: string;
  timestamp: string;
  istTime?: string;
  source: string;
  role: string;
  applicantName: string;
  applicantEmail: string;
  subject?: string;
  isRead: boolean;
  readAt?: string | null;
  status?: 'pending' | 'accepted' | 'rejected' | 'contacted';
  adminNotes?: string;
  data: Record<string, any>;
  updated_at?: string;
};

export default function AdminApplicationsPage() {
  const [leads, setLeads] = useState<SubmissionLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read' | 'creator' | 'brand' | 'team' | 'contact'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<SubmissionLead | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/applications', { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success && Array.isArray(json.applications)) {
        setLeads(json.applications);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Toggle Read / Unread for a single lead
  const handleToggleRead = async (leadId: string, currentIsRead: boolean) => {
    const newIsRead = !currentIsRead;
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isRead: newIsRead, readAt: newIsRead ? new Date().toISOString() : null } : l));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, isRead: newIsRead } : null);
    }

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: leadId, isRead: newIsRead }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to toggle read status:', err);
      fetchLeads();
    }
  };

  // Mark all inquiries as read
  const handleMarkAllAsRead = async () => {
    if (!confirm('Are you sure you want to mark all unread inquiries as read?')) return;
    setBatchLoading(true);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => ({ ...l, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  // Update lifecycle status (pending, contacted, accepted, rejected)
  const handleUpdateStatus = async (leadId: string, newStatus: 'pending' | 'accepted' | 'rejected' | 'contacted') => {
    setSavingStatus(true);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSavingStatus(false);
    }
  };

  // Save Admin Internal Notes
  const handleSaveNotes = async (leadId: string) => {
    setSavingNotes(true);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: leadId, adminNotes: notesInput }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, adminNotes: notesInput } : l));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, adminNotes: notesInput } : null);
        }
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Select a lead and auto-mark as read
  const handleSelectLead = (lead: SubmissionLead) => {
    setSelectedLead(lead);
    setNotesInput(lead.adminNotes || '');
    // Automatically mark as read when opened by admin
    if (!lead.isRead) {
      handleToggleRead(lead.id, false);
    }
  };

  // Delete an inquiry record
  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this submission record permanently?')) return;
    try {
      const res = await fetch(`/api/admin/applications?id=${leadId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLead && selectedLead.id === leadId) setSelectedLead(null);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const getPhoneFromLead = (lead: SubmissionLead) => {
    return (
      lead.data?.['Contact Number / WhatsApp'] ||
      lead.data?.['Phone / WhatsApp'] ||
      lead.data?.['Phone / Direct Line'] ||
      lead.data?.['WhatsApp'] ||
      lead.data?.['Phone'] ||
      lead.data?.['Phone Number'] ||
      ''
    );
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (leads.length === 0) {
      alert('No inquiries to export.');
      return;
    }
    const headers = ['ID', 'Date', 'Status', 'Read Status', 'Applicant Name', 'Email', 'Phone', 'Source', 'Role', 'Subject', 'Notes'];
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${l.istTime || l.timestamp}"`,
      `"${l.status || 'pending'}"`,
      `"${l.isRead ? 'Read' : 'Unread'}"`,
      `"${(l.applicantName || '').replace(/"/g, '""')}"`,
      `"${(l.applicantEmail || '').replace(/"/g, '""')}"`,
      `"${getPhoneFromLead(l)}"`,
      `"${(l.source || '').replace(/"/g, '""')}"`,
      `"${l.role || ''}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${(l.adminNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `creatornest_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const counts = useMemo(() => {
    return {
      all: leads.length,
      unread: leads.filter(l => !l.isRead).length,
      read: leads.filter(l => l.isRead).length,
      creator: leads.filter(l => l.role === 'creator').length,
      brand: leads.filter(l => l.role === 'brand').length,
      team: leads.filter(l => l.role === 'career' || l.role === 'team' || l.role === 'team_member').length,
      contact: leads.filter(l => l.role === 'general' || l.source?.toLowerCase().includes('contact')).length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (l.applicantName || '').toLowerCase().includes(query) ||
        (l.applicantEmail || '').toLowerCase().includes(query) ||
        (l.source || '').toLowerCase().includes(query) ||
        (l.subject || '').toLowerCase().includes(query) ||
        JSON.stringify(l.data || {}).toLowerCase().includes(query);

      let matchesTab = true;
      if (activeTab === 'unread') matchesTab = !l.isRead;
      else if (activeTab === 'read') matchesTab = l.isRead;
      else if (activeTab === 'creator') matchesTab = l.role === 'creator';
      else if (activeTab === 'brand') matchesTab = l.role === 'brand';
      else if (activeTab === 'team') matchesTab = l.role === 'career' || l.role === 'team' || l.role === 'team_member';
      else if (activeTab === 'contact') matchesTab = l.role === 'general' || l.source?.toLowerCase().includes('contact');

      return matchesSearch && matchesTab;
    });
  }, [leads, searchQuery, activeTab]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inbound Inquiries & Applications CRM</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Applications Inbox</h1>
            {counts.unread > 0 && (
              <span className="px-2.5 py-1 bg-primary text-background font-extrabold text-xs rounded-full shadow-[0_0_15px_rgba(0,242,254,0.4)] animate-pulse">
                {counts.unread} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time inquiries from all website forms backed up to <span className="font-mono text-primary font-medium">data/submissions.json</span>.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {counts.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={batchLoading}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read ({counts.unread})</span>
            </button>
          )}

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-surface border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Download CSV report"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchLeads}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-surface border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Pill Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Inquiries', count: counts.all, highlight: false },
            { key: 'unread', label: '🔴 Unread', count: counts.unread, highlight: counts.unread > 0 },
            { key: 'read', label: '✓ Read', count: counts.read, highlight: false },
            { key: 'creator', label: '🎬 Creators', count: counts.creator, highlight: false },
            { key: 'brand', label: '🏢 Brands', count: counts.brand, highlight: false },
            { key: 'team', label: '💼 Team', count: counts.team, highlight: false },
            { key: 'contact', label: '📬 Contact Desk', count: counts.contact, highlight: false },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                  : tab.highlight
                  ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                  : 'bg-surface/60 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                activeTab === tab.key 
                  ? 'bg-background/30 text-background font-black' 
                  : tab.highlight 
                  ? 'bg-primary/20 text-primary font-black' 
                  : 'bg-white/10 text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone, details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-surface/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider w-12 text-center">Read</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant / Contact</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Category / Source</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Lifecycle Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Received</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-primary" />
                    <span className="text-sm font-medium">Loading inquiries inbox...</span>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-600 opacity-60" />
                    <p className="text-sm font-semibold text-white">No inquiries found</p>
                    <p className="text-xs text-gray-500 mt-1">Try switching tabs or resetting your search filter.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const phone = getPhoneFromLead(lead);
                  const status = lead.status || 'pending';
                  const isUnread = !lead.isRead;

                  return (
                    <tr 
                      key={lead.id} 
                      className={`transition-colors hover:bg-white/[0.025] ${
                        isUnread ? 'bg-primary/[0.04] border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* 1-Click Read / Unread Toggle Icon */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleRead(lead.id, lead.isRead)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer text-gray-400 hover:text-white"
                          title={lead.isRead ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          {isUnread ? (
                            <div className="relative">
                              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block animate-pulse shadow-[0_0_8px_#00F2FE]" />
                            </div>
                          ) : (
                            <CheckCheck className="w-4 h-4 text-gray-500 hover:text-primary transition-colors" />
                          )}
                        </button>
                      </td>

                      {/* Applicant Name & Contact */}
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-2.5">
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className={`text-sm ${isUnread ? 'font-black text-white' : 'font-semibold text-gray-200'}`}>
                                {lead.applicantName || 'Anonymous Applicant'}
                              </p>
                              {isUnread && (
                                <span className="px-1.5 py-0.2 bg-primary/20 border border-primary/40 text-primary text-[9px] font-black uppercase rounded-md tracking-wider">
                                  NEW
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{lead.applicantEmail || 'No email provided'}</p>
                            {phone && (
                              <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5 flex items-center space-x-1">
                                <Phone className="w-3 h-3 inline" />
                                <span>{phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Source */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            lead.role === 'creator'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : lead.role === 'brand'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : lead.role === 'career' || lead.role === 'team' || lead.role === 'team_member'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}>
                            {lead.role?.replace('_', ' ') || 'General'}
                          </span>
                          <p className="text-[11px] text-gray-500 truncate max-w-[180px]">{lead.source}</p>
                        </div>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          status === 'accepted'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : status === 'contacted'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />
                          <span>{status}</span>
                        </span>
                      </td>

                      {/* Received Date */}
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-400">
                          <p className="font-medium text-gray-300">
                            {lead.istTime?.split(',')[0] || (lead.timestamp ? new Date(lead.timestamp).toLocaleDateString('en-IN') : '—')}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono">
                            {lead.istTime?.split(',')[1] || (lead.timestamp ? new Date(lead.timestamp).toLocaleTimeString('en-IN') : '')}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* WhatsApp Direct Connect */}
                          {phone && (
                            <a
                              href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.applicantName || '')}%2C%20greetings%20from%20Creator%20Nest!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all text-xs flex items-center space-x-1 cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => handleSelectLead(lead)}
                            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                          >
                            View Details
                          </button>

                          {/* Delete Lead */}
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEAD DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8 overflow-hidden"
          >
            {/* Top Glowing Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-secondary" />

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-extrabold text-white">
                    {selectedLead.applicantName || 'Application Lead'}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedLead.isRead ? 'bg-white/10 text-gray-400' : 'bg-primary/20 text-primary'
                  }`}>
                    {selectedLead.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Source: <strong className="text-white">{selectedLead.source}</strong> • {selectedLead.istTime || selectedLead.timestamp}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleRead(selectedLead.id, selectedLead.isRead)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1.5"
                  title="Toggle Read / Unread"
                >
                  {selectedLead.isRead ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      <span>Mark Unread</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>Mark Read</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => setSelectedLead(null)} 
                  className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lifecycle Status Switcher */}
            <div className="mb-6 p-3.5 bg-black/40 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Inquiry Status:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['pending', 'contacted', 'accepted', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedLead.id, st)}
                    disabled={savingStatus}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      (selectedLead.status || 'pending') === st
                        ? 'bg-primary text-background shadow-md shadow-primary/20'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Data Fields Breakdown */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(selectedLead.data || {}).map(([key, val]) => (
                <div key={key} className="bg-background/70 p-3 rounded-xl border border-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{key}</p>
                  <p className="text-sm text-white mt-1 break-words font-medium">
                    {typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://')) ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center space-x-1">
                        <span>{val}</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    ) : (
                      String(val || '—')
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Admin Internal Team Notes */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Internal Team Notes:
              </label>
              <div className="flex gap-2">
                <textarea
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="Add private note for this inquiry (e.g. 'Spoke on WhatsApp, following up on Thursday')..."
                  rows={2}
                  className="flex-1 bg-background border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all resize-none"
                />
                <button
                  onClick={() => handleSaveNotes(selectedLead.id)}
                  disabled={savingNotes}
                  className="px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingNotes ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-5 border-t border-white/10 mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {getPhoneFromLead(selectedLead) && (
                  <a
                    href={`https://wa.me/${getPhoneFromLead(selectedLead).replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedLead.applicantName || '')}%2C%20greetings%20from%20Creator%20Nest!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-green-500/20 flex items-center space-x-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {selectedLead.applicantEmail && (
                  <a
                    href={`mailto:${selectedLead.applicantEmail}?subject=Re:%20${encodeURIComponent(selectedLead.subject || 'Creator Nest Partnership')}`}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition-all flex items-center space-x-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href="/admin/users"
                  className="py-2.5 px-4 bg-primary text-background font-bold rounded-xl text-xs hover:bg-primary/90 transition-all flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create User Account</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
