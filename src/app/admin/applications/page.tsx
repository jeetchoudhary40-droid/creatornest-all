'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Search, Loader2, CheckCircle2, X, Trash2,
  Video, Briefcase, Users, Mail, Phone, MessageSquare,
  Sparkles, RefreshCw, ExternalLink, Calendar, ShieldCheck,
  Check, Clock, UserPlus
} from 'lucide-react';
import Link from 'next/link';

type SubmissionLead = {
  id: string;
  timestamp: string;
  istTime?: string;
  source: string;
  role: string;
  applicantName: string;
  applicantEmail: string;
  subject?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'contacted';
  adminNotes?: string;
  data: Record<string, any>;
};

export default function AdminApplicationsPage() {
  const [leads, setLeads] = useState<SubmissionLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<SubmissionLead | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/applications');
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

  const handleUpdateStatus = async (leadId: string, newStatus: 'pending' | 'accepted' | 'rejected' | 'contacted') => {
    setSavingStatus(true);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this submission record?')) return;
    try {
      const res = await fetch(`/api/admin/applications?id=${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLead && selectedLead.id === leadId) setSelectedLead(null);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const getPhoneFromLead = (lead: SubmissionLead) => {
    return lead.data?.['Phone'] || lead.data?.['WhatsApp'] || lead.data?.['Phone Number'] || lead.data?.['WhatsApp Number'] || '';
  };

  const filteredLeads = leads.filter(l => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (l.applicantName || '').toLowerCase().includes(query) ||
      (l.applicantEmail || '').toLowerCase().includes(query) ||
      (l.source || '').toLowerCase().includes(query) ||
      JSON.stringify(l.data || {}).toLowerCase().includes(query);

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'creator' && l.role === 'creator') ||
      (activeTab === 'brand' && l.role === 'brand') ||
      (activeTab === 'team' && (l.role === 'career' || l.role === 'team' || l.role === 'team_member')) ||
      (activeTab === 'contact' && (l.role === 'general' || l.source?.includes('Contact')));

    return matchesSearch && matchesTab;
  });

  const counts = {
    all: leads.length,
    creator: leads.filter(l => l.role === 'creator').length,
    brand: leads.filter(l => l.role === 'brand').length,
    team: leads.filter(l => l.role === 'career' || l.role === 'team' || l.role === 'team_member').length,
    contact: leads.filter(l => l.role === 'general' || l.source?.includes('Contact')).length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inbound Applications CRM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Applications Inbox</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time leads from the Join page & Contact form backed up to <span className="font-mono text-primary">data/submissions.json</span>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLeads}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-surface border border-white/10 hover:border-white/20 text-gray-300 rounded-xl text-sm font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Leads', count: counts.all },
            { key: 'creator', label: '🎬 Creators', count: counts.creator },
            { key: 'brand', label: '🏢 Brands', count: counts.brand },
            { key: 'team', label: '💼 Team / Freelancers', count: counts.team },
            { key: 'contact', label: '📬 Contact Inquiries', count: counts.contact },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                  : 'bg-surface/60 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.key ? 'bg-background/25' : 'bg-white/10'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search leads..."
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
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Channel / Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Received</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading leads inbox...</span>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const phone = getPhoneFromLead(lead);
                  const status = lead.status || 'pending';
                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white text-sm">{lead.applicantName || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">{lead.applicantEmail}</p>
                          {phone && (
                            <p className="text-[11px] text-primary/80 font-mono mt-0.5">{phone}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          lead.role === 'creator'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : lead.role === 'brand'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : lead.role === 'career' || lead.role === 'team'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {lead.role?.replace('_', ' ') || 'General'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          status === 'accepted'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : status === 'contacted'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400">
                          {lead.istTime || (lead.timestamp ? new Date(lead.timestamp).toLocaleString() : '—')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {phone && (
                            <a
                              href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.applicantName || '')}%2C%20greetings%20from%20Creator%20Nest!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all text-xs flex items-center space-x-1"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete lead"
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
            className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>{selectedLead.applicantName || 'Application Lead'}</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedLead.source} • {selectedLead.istTime || selectedLead.timestamp}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Quick Select */}
            <div className="mb-6 p-3 bg-black/30 rounded-xl border border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase">Lead Status:</span>
              <div className="flex items-center space-x-1.5">
                {(['pending', 'contacted', 'accepted', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedLead.id, st)}
                    disabled={savingStatus}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      (selectedLead.status || 'pending') === st
                        ? 'bg-primary text-background'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Data Fields */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {Object.entries(selectedLead.data || {}).map(([key, val]) => (
                <div key={key} className="bg-background/60 p-3 rounded-xl border border-white/5">
                  <p className="text-[11px] font-bold uppercase text-gray-400">{key}</p>
                  <p className="text-sm text-white mt-0.5 break-words font-medium">
                    {typeof val === 'string' && val.startsWith('http') ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center space-x-1">
                        <span>{val}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      String(val || '—')
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Action to Create User Account */}
            <div className="pt-6 border-t border-white/10 mt-6 flex items-center space-x-3">
              <Link
                href="/admin/users"
                className="flex-1 py-3 bg-primary text-background font-bold rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 text-center"
              >
                <UserPlus className="w-4 h-4" />
                <span>Issue User ID in User Manager</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
