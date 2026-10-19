'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  RefreshCw, Shield, Bot, Check, ArrowLeft, ExternalLink,
  History, Eye, Sliders, Play, RotateCcw, Lock, Info, AlertCircle, Copy,
  Key, Settings, Cpu, X, Zap, Loader2, Search, Video, Filter, Globe
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AuditItem {
  category: string;
  severity: string;
  title: string;
  description: string;
  affectedItem?: string;
  currentValue?: string;
  recommendedAction: string;
}

interface DraftChange {
  id: string;
  channelId: string;
  channelTitle: string;
  videoId?: string;
  videoTitle?: string;
  thumbnailUrl?: string;
  itemType: string;
  fieldName: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
  charCount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  createdAt: string;
}

interface ChangeLog {
  id: string;
  channelId: string;
  videoId?: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  publishedAt: string;
  status: 'published' | 'rolled_back';
}

export type AiProvider = 'auto' | 'gemini' | 'openai' | 'claude';
export type LanguageMode = 'mixed' | 'hinglish' | 'hindi' | 'english' | 'auto';

export default function YouTubeChannelOptimizerPage() {
  const [handle, setHandle] = useState('@SavitaMaan-g8p');
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'review' | 'publisher' | 'checklist'>('audit');

  // Language Mode state (Mixed, Hinglish, Hindi, English, Auto)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageMode>('mixed');

  // AI Provider & Custom API Keys state
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('auto');
  const [customKeys, setCustomKeys] = useState<{ gemini: string; openai: string; claude: string }>({
    gemini: '',
    openai: '',
    claude: '',
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInputTemp, setKeyInputTemp] = useState<{ gemini: string; openai: string; claude: string }>({
    gemini: '',
    openai: '',
    claude: '',
  });

  // YouTube Channel OAuth & Direct API State
  const [accessToken, setAccessToken] = useState('');
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [tempTokenInput, setTempTokenInput] = useState('');
  const [singlePublishingId, setSinglePublishingId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{
    active: boolean;
    current: number;
    total: number;
    message: string;
  } | null>(null);

  // Channel Video Inventory Filter & Single Queue State
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoStatusFilter, setVideoStatusFilter] = useState<'all' | 'needs_fix' | 'optimal' | 'in_queue' | 'published'>('all');
  const [singleQueueingId, setSingleQueueingId] = useState<string | null>(null);

  // Load custom keys, OAuth token, language, and provider on mount
  React.useEffect(() => {
    try {
      const savedProvider = (localStorage.getItem('creatornest_yt_ai_provider') as AiProvider) || 'auto';
      setSelectedProvider(savedProvider);

      const savedLang = (localStorage.getItem('creatornest_yt_ai_language') as LanguageMode) || 'mixed';
      setSelectedLanguage(savedLang);

      const savedGemini = localStorage.getItem('creatornest_yt_gemini_key') || '';
      const savedOpenai = localStorage.getItem('creatornest_yt_openai_key') || '';
      const savedClaude = localStorage.getItem('creatornest_yt_claude_key') || '';

      const loadedKeys = { gemini: savedGemini, openai: savedOpenai, claude: savedClaude };
      setCustomKeys(loadedKeys);
      setKeyInputTemp(loadedKeys);

      const savedToken = localStorage.getItem('creatornest_yt_oauth_token') || '';
      setAccessToken(savedToken);
      setTempTokenInput(savedToken);
    } catch (e) {
      console.warn('localStorage not accessible', e);
    }
  }, []);

  const handleSelectLanguage = (lang: LanguageMode) => {
    setSelectedLanguage(lang);
    try {
      localStorage.setItem('creatornest_yt_ai_language', lang);
    } catch {}
    const label = lang === 'mixed' ? 'Mixed (Hinglish + Hindi + English)' : lang === 'hinglish' ? 'Hinglish (Roman)' : lang === 'hindi' ? 'शुद्ध हिन्दी (Devanagari)' : lang === 'english' ? 'English' : 'Auto-Detect';
    showToast(`AI Language set to ${label}!`);
  };

  const handleSaveKeys = () => {
    try {
      localStorage.setItem('creatornest_yt_gemini_key', keyInputTemp.gemini.trim());
      localStorage.setItem('creatornest_yt_openai_key', keyInputTemp.openai.trim());
      localStorage.setItem('creatornest_yt_claude_key', keyInputTemp.claude.trim());
      localStorage.setItem('creatornest_yt_ai_provider', selectedProvider);
      setCustomKeys({
        gemini: keyInputTemp.gemini.trim(),
        openai: keyInputTemp.openai.trim(),
        claude: keyInputTemp.claude.trim(),
      });
      setShowKeyModal(false);
      showToast('API Keys saved successfully! Used for YouTube suggestions.');
    } catch (e) {
      showToast('Failed to save API keys to local storage.');
    }
  };

  const handleClearKeys = () => {
    try {
      localStorage.removeItem('creatornest_yt_gemini_key');
      localStorage.removeItem('creatornest_yt_openai_key');
      localStorage.removeItem('creatornest_yt_claude_key');
      const cleared = { gemini: '', openai: '', claude: '' };
      setCustomKeys(cleared);
      setKeyInputTemp(cleared);
      showToast('Custom API keys cleared. Using system defaults.');
    } catch (e) {}
  };

  const handleSaveToken = () => {
    const clean = tempTokenInput.trim();
    setAccessToken(clean);
    try {
      if (clean) localStorage.setItem('creatornest_yt_oauth_token', clean);
      else localStorage.removeItem('creatornest_yt_oauth_token');
      setShowOAuthModal(false);
      showToast(clean ? 'YouTube Channel Access Token saved! Direct publishing active.' : 'Token cleared.');
    } catch {
      showToast('Failed to save token to local storage.');
    }
  };

  const handleDisconnectChannel = () => {
    setAccessToken('');
    setTempTokenInput('');
    try {
      localStorage.removeItem('creatornest_yt_oauth_token');
      showToast('YouTube Channel disconnected.');
    } catch {}
  };

  // Audit state
  const [auditData, setAuditData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Review Queue state
  const [drafts, setDrafts] = useState<DraftChange[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'titles' | 'descriptions' | 'tags' | 'pending' | 'approved' | 'published'>('all');

  // Change Log state
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [testingAi, setTestingAi] = useState<boolean>(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string; sampleTitle?: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTestAiConnection = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/youtube/automation/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          provider: selectedProvider,
          customKeys: {
            gemini: keyInputTemp.gemini.trim() || customKeys.gemini || undefined,
            openai: keyInputTemp.openai.trim() || customKeys.openai || undefined,
            claude: keyInputTemp.claude.trim() || customKeys.claude || undefined,
          },
        }),
      });
      const data = await res.json();
      setAiTestResult(data);
      if (data.success) {
        showToast(data.message || 'AI Connection Verified Active!');
      } else {
        showToast(data.message || 'AI test returned fallback.');
      }
    } catch (e: any) {
      setAiTestResult({ success: false, message: e.message || 'Failed to ping AI service' });
      showToast(`AI Test Failed: ${e.message}`);
    } finally {
      setTestingAi(false);
    }
  };

  // 1. Run live audit via official YouTube API
  const handleRunAudit = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/youtube/automation/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelHandle: handle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to audit channel.');

      setAuditData(data.audit);
      showToast(`Channel "${data.audit.title}" successfully audited.`);

      // Also fetch any existing drafts and change logs
      fetchDrafts(data.audit.title);
      fetchLogs(data.audit.title);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching channel data.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch drafts
  const fetchDrafts = async (channelId: string) => {
    try {
      const res = await fetch(`/api/youtube/automation/review?channelId=${encodeURIComponent(channelId)}`);
      const data = await res.json();
      if (data.drafts) setDrafts(data.drafts);
    } catch (e) {
      console.warn('Failed to fetch drafts', e);
    }
  };

  // 3. Fetch change logs
  const fetchLogs = async (channelId: string) => {
    try {
      const res = await fetch(`/api/youtube/automation/rollback?channelId=${encodeURIComponent(channelId)}`);
      const data = await res.json();
      if (data.logs) setChangeLogs(data.logs);
    } catch (e) {
      console.warn('Failed to fetch logs', e);
    }
  };

  // 4. Generate AI suggestions
  const handleGenerateFixes = async () => {
    if (!auditData) return;
    setGeneratingAi(true);
    try {
      const vList = auditData.auditedVideos || auditData.videos || [];
      const flagged = vList.filter((v: any) => v.issues && v.issues.length > 0);
      const videosToFix = flagged.length > 0 ? flagged : vList;
      const res = await fetch('/api/youtube/automation/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelTitle: auditData.title,
          channelDescription: auditData.description,
          flaggedVideos: videosToFix,
          provider: selectedProvider,
          languageMode: selectedLanguage,
          customKeys: {
            gemini: customKeys.gemini || undefined,
            openai: customKeys.openai || undefined,
            claude: customKeys.claude || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed.');

      const modelLabel =
        data.providerUsed === 'openai'
          ? 'OpenAI ChatGPT (GPT-4o)'
          : data.providerUsed === 'claude'
          ? 'Anthropic Claude 3.5 Sonnet'
          : data.providerUsed === 'gemini'
          ? 'Google Gemini 2.5 Flash'
          : 'Smart Heuristic Engine';

      showToast(`Generated ${data.drafts.length} complete, sensible SEO suggestions using ${modelLabel}! Zero word truncation.`);
      fetchDrafts(auditData.title);
      setActiveTab('review');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setGeneratingAi(false);
    }
  };

  // 5. Review action (Approve, Edit, Reject)
  const handleUpdateDraft = async (draftId: string, status: 'approved' | 'rejected', customText?: string) => {
    try {
      const res = await fetch('/api/youtube/automation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          status,
          editedValue: customText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDrafts(prev => prev.map(d => (d.id === draftId ? { ...d, status, suggestedValue: customText || d.suggestedValue } : d)));
        showToast(`Draft ${status === 'approved' ? 'Approved' : 'Rejected'}.`);
        setEditingDraftId(null);
      }
    } catch (e: any) {
      showToast(`Failed to update draft: ${e.message}`);
    }
  };

  // 6. Bulk approve
  const handleBulkApprove = async () => {
    if (!auditData) return;
    try {
      const res = await fetch('/api/youtube/automation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulkApprove: true,
          channelId: auditData.title,
        }),
      });
      const data = await res.json();
      showToast(data.message || 'Bulk approved.');
      fetchDrafts(auditData.title);
    } catch (e: any) {
      showToast(`Bulk approve failed: ${e.message}`);
    }
  };

  // 6B. Bulk approve only titles
  const handleBulkApproveTitles = async () => {
    if (!auditData) return;
    try {
      const pendingTitleDrafts = drafts.filter(d => d.itemType === 'video_title' && d.status === 'pending');
      if (pendingTitleDrafts.length === 0) {
        showToast('No pending titles to approve in queue.');
        return;
      }
      for (const d of pendingTitleDrafts) {
        await fetch('/api/youtube/automation/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftId: d.id, status: 'approved' }),
        });
      }
      setDrafts(prev => prev.map(d => d.itemType === 'video_title' && d.status === 'pending' ? { ...d, status: 'approved' } : d));
      showToast(`Approved all ${pendingTitleDrafts.length} pending sensible titles!`);
    } catch (e: any) {
      showToast(`Bulk title approve failed: ${e.message}`);
    }
  };

  // 6C. Queue single video title fix with language override support
  const handleGenerateSingleVideoFix = async (video: any, overrideLang?: LanguageMode) => {
    if (!auditData) return;
    setSingleQueueingId(video.id);
    const langToUse = overrideLang || selectedLanguage;
    try {
      const res = await fetch('/api/youtube/automation/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelTitle: auditData.title,
          channelDescription: auditData.description,
          flaggedVideos: [video],
          provider: selectedProvider,
          languageMode: langToUse,
          customKeys: {
            gemini: customKeys.gemini || undefined,
            openai: customKeys.openai || undefined,
            claude: customKeys.claude || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate title fix.');

      showToast(`Generated ${langToUse.toUpperCase()} title for "${video.title.slice(0, 30)}..."!`);
      await fetchDrafts(auditData.title);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setSingleQueueingId(null);
    }
  };

  // 7A. Publish SINGLE change to live YouTube (One-by-One mode)
  const handlePublishSingle = async (draftId: string) => {
    if (!accessToken) {
      setShowOAuthModal(true);
      showToast('Connect your YouTube channel via OAuth or Access Token to apply live.');
      return;
    }
    setSinglePublishingId(draftId);
    try {
      const res = await fetch('/api/youtube/automation/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          accessToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update YouTube.');

      setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'published' } : d));
      showToast('Successfully applied change live on YouTube! 🎉');
      if (auditData) fetchLogs(auditData.title);
    } catch (e: any) {
      showToast(`Publish error: ${e.message}`);
    } finally {
      setSinglePublishingId(null);
    }
  };

  // 7B. Copy to clipboard & Deep-link into YouTube Studio (Manual 1-click fallback)
  const handleCopyAndOpenStudio = (draft: DraftChange) => {
    try {
      navigator.clipboard.writeText(draft.suggestedValue);
      let studioUrl = 'https://studio.youtube.com';
      if (draft.videoId) {
        studioUrl = `https://studio.youtube.com/video/${draft.videoId}/edit`;
      } else if (draft.itemType === 'channel_description') {
        studioUrl = `https://studio.youtube.com/channel/${auditData?.channelId || ''}/editing/details`;
      }
      window.open(studioUrl, '_blank');
      showToast(`Copied ${draft.fieldName} to clipboard! YouTube Studio opened.`);
    } catch {
      showToast('Failed to copy to clipboard.');
    }
  };

  // 7C. Publish ALL approved changes automatically (Batch mode)
  const handlePublishApproved = async () => {
    if (!auditData) return;
    const approvedDrafts = drafts.filter(d => d.status === 'approved');
    if (approvedDrafts.length === 0) {
      showToast('No approved changes to apply. Click "Approve" on items first.');
      return;
    }

    if (!accessToken) {
      setShowOAuthModal(true);
      showToast('Please connect your YouTube Channel via OAuth or Access Token to apply live.');
      return;
    }

    setPublishing(true);
    setBatchProgress({ active: true, current: 0, total: approvedDrafts.length, message: 'Starting automatic update...' });

    let appliedCount = 0;
    for (let i = 0; i < approvedDrafts.length; i++) {
      const draft = approvedDrafts[i];
      setBatchProgress({
        active: true,
        current: i + 1,
        total: approvedDrafts.length,
        message: `Applying [${i + 1}/${approvedDrafts.length}]: ${draft.itemType.replace('_', ' ')} (${draft.videoTitle || draft.channelTitle})...`
      });

      try {
        const res = await fetch('/api/youtube/automation/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draftId: draft.id,
            accessToken,
          }),
        });
        if (res.ok) {
          appliedCount++;
          setDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, status: 'published' } : d));
        }
      } catch (err) {
        console.warn(`Failed to publish draft ${draft.id}:`, err);
      }
    }

    setPublishing(false);
    setBatchProgress(null);
    showToast(`Successfully applied ${appliedCount} of ${approvedDrafts.length} changes live on YouTube!`);
    fetchDrafts(auditData.title);
    fetchLogs(auditData.title);
    setActiveTab('publisher');
  };

  // 8. Rollback a change
  const handleRollback = async (logId: string) => {
    try {
      const res = await fetch('/api/youtube/automation/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, accessToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rollback failed.');

      showToast(data.message || 'Change successfully rolled back.');
      if (auditData) fetchLogs(auditData.title);
    } catch (e: any) {
      showToast(`Rollback error: ${e.message}`);
    }
  };

  const totalAuditedVideos = auditData?.auditedVideos || auditData?.videos || [];
  const videosNeedingTitleFix = totalAuditedVideos.filter((v: any) => {
    const hasTitleIssue = v.issues && v.issues.some((i: string) => i.toLowerCase().includes('title'));
    return hasTitleIssue || (v.title || '').length > 65 || (v.title || '').length < 15;
  });
  const optimalVideosCount = Math.max(0, totalAuditedVideos.length - videosNeedingTitleFix.length);

  const titleDrafts = drafts.filter(d => d.itemType === 'video_title');
  const titleDraftsPending = titleDrafts.filter(d => d.status === 'pending');
  const titleDraftsApproved = titleDrafts.filter(d => d.status === 'approved');
  const titleDraftsPublished = titleDrafts.filter(d => d.status === 'published');

  const filteredDrafts = drafts.filter((d) => {
    if (queueFilter === 'titles') return d.itemType === 'video_title';
    if (queueFilter === 'descriptions') return d.itemType === 'video_description' || d.itemType === 'channel_description';
    if (queueFilter === 'tags') return d.itemType === 'video_tags';
    if (queueFilter === 'pending') return d.status === 'pending';
    if (queueFilter === 'approved') return d.status === 'approved';
    if (queueFilter === 'published') return d.status === 'published';
    return true;
  });

  const filteredVideosList = totalAuditedVideos.filter((v: any) => {
    if (videoSearchQuery) {
      const q = videoSearchQuery.toLowerCase();
      const matchTitle = (v.title || '').toLowerCase().includes(q);
      const matchId = (v.id || '').toLowerCase().includes(q);
      if (!matchTitle && !matchId) return false;
    }

    const hasTitleIssue = v.issues && v.issues.some((i: string) => i.toLowerCase().includes('title'));
    const isTooLong = (v.title || '').length > 65;
    const isTooShort = (v.title || '').length < 15;
    const needsTitleFix = hasTitleIssue || isTooLong || isTooShort;

    const draft = drafts.find(d => d.videoId === v.id && d.itemType === 'video_title');

    if (videoStatusFilter === 'needs_fix') return needsTitleFix && (!draft || draft.status !== 'published');
    if (videoStatusFilter === 'optimal') return !needsTitleFix;
    if (videoStatusFilter === 'in_queue') return !!draft && (draft.status === 'pending' || draft.status === 'approved');
    if (videoStatusFilter === 'published') return !!draft && draft.status === 'published';

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-red-500/30 selection:text-white">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-3 rounded-xl shadow-2xl font-medium flex items-center gap-3 border border-red-400/30 backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
          <span>/</span>
          <span className="text-red-400 font-medium">YouTube Channel Optimizer & Policy Automation</span>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-b from-red-950/40 via-slate-900/40 to-black/60 border border-red-500/20 p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Bot className="w-3.5 h-3.5" />
              Automated Compliance & Review Engine
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              YouTube Channel <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">Policy Audit & Optimizer</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
              Automatically scan your channel against YouTube Partner Program (YPP) requirements and Monetization Policies. Propose SEO-compliant titles, descriptions, and tags with a human approval queue and one-click rollback.
            </p>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Enter channel handle (e.g. @SavitaMaan-g8p) or channel URL"
                  className="w-full bg-black/60 border border-slate-700 focus:border-red-500 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all text-base"
                />
              </div>
              <button
                onClick={handleRunAudit}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 cursor-pointer text-base"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {loading ? 'Auditing Channel...' : 'Run Audit'}
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-400">
              <span>Try sample:</span>
              <button
                onClick={() => setHandle('@SavitaMaan-g8p')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                @SavitaMaan-g8p (Your Channel)
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Main Content Area */}
        {auditData && (
          <div className="space-y-8">
            {/* Channel Profile Banner & Quick KPI */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Channel Info Card */}
              <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl backdrop-blur-md">
                <div className="flex items-start gap-4">
                  {auditData.avatarUrl ? (
                    <img
                      src={auditData.avatarUrl}
                      alt={auditData.title}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500/40 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-bold text-2xl text-white shrink-0">
                      YT
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white truncate">{auditData.title}</h2>
                      {auditData.isMonetized ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                          Monetized
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                          Needs Optimization
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">{auditData.handle}</p>
                    <p className="text-slate-300 text-xs mt-2 line-clamp-2">
                      {auditData.description || '(No channel description configured - Reviewers will flag this!)'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-center">
                  <div className="bg-black/40 rounded-xl p-3 border border-slate-800/60">
                    <p className="text-xs text-slate-400">Subscribers</p>
                    <p className="text-lg font-black text-white mt-1">{auditData.subscribers.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-slate-800/60">
                    <p className="text-xs text-slate-400">Total Views</p>
                    <p className="text-lg font-black text-white mt-1">{auditData.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-slate-800/60">
                    <p className="text-xs text-slate-400">Videos</p>
                    <p className="text-lg font-black text-white mt-1">{auditData.videoCount}</p>
                  </div>
                </div>
              </div>

              {/* Monetization Score Card */}
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-400">Monetization Score</p>
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className={`text-5xl font-black ${auditData.monetizationScore >= 80 ? 'text-emerald-400' : auditData.monetizationScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {auditData.monetizationScore}
                    </span>
                    <span className="text-slate-500 font-bold">/100</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {auditData.monetizationScore >= 80
                      ? 'Channel adheres to YouTube monetization policies and metadata guidelines.'
                      : 'High risk of human review rejection under Repetitious Content or Spam Policies.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>1K Subs Threshold</span>
                    <span className={auditData.yppMetrics.subscriberThresholdMet ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {auditData.yppMetrics.subscriberThresholdMet ? 'Achieved' : 'Not Met'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-emerald-500"
                      style={{ width: `${Math.min(100, (auditData.subscribers / 1000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Auto-Fix Trigger Card with Multi-Provider Support */}
              <div className="rounded-3xl bg-gradient-to-br from-red-950/60 to-slate-900 border border-red-500/30 p-6 flex flex-col justify-between shadow-xl backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400">
                      <Sparkles className="w-4 h-4" />
                      AI Action Engine
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Gemini Active
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleTestAiConnection}
                        disabled={testingAi}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-blue-300 border border-blue-500/30 transition-all cursor-pointer disabled:opacity-50"
                        title="Ping Gemini API to verify speed and model connection"
                      >
                        {testingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-amber-300" />}
                        <span>{testingAi ? 'Testing...' : 'Test AI'}</span>
                      </button>

                      <button
                        onClick={() => setShowKeyModal(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                        title="Configure Google Gemini, ChatGPT, and Claude API Keys"
                      >
                        <Key className="w-3 h-3 text-amber-400" />
                        <span>API Keys</span>
                        {(customKeys.gemini || customKeys.openai || customKeys.claude) && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Generate Compliant Fixes</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Automatically propose high-CTR, SEO titles under 70 chars, structured descriptions, chapters, and clean tags for flagged videos.
                  </p>

                  {/* AI Model Provider Selector */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Select AI Model:</span>
                      <span className="text-red-400 font-bold lowercase text-[10px]">
                        {selectedProvider === 'auto' ? 'smart fallback' : selectedProvider}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedProvider('auto')}
                        className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all flex items-center gap-1.5 ${
                          selectedProvider === 'auto'
                            ? 'bg-red-500/20 border-red-500 text-white font-bold shadow-sm shadow-red-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className="truncate">Auto Fallback</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProvider('gemini')}
                        className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all flex items-center gap-1.5 ${
                          selectedProvider === 'gemini'
                            ? 'bg-blue-500/20 border-blue-500 text-white font-bold shadow-sm shadow-blue-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Bot className="w-3 h-3 text-blue-400" />
                        <span className="truncate">Google Gemini</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProvider('openai')}
                        className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all flex items-center gap-1.5 ${
                          selectedProvider === 'openai'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        <span className="truncate">ChatGPT (GPT-4o)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProvider('claude')}
                        className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all flex items-center gap-1.5 ${
                          selectedProvider === 'claude'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-sm shadow-amber-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span className="truncate">Claude 3.5 Sonnet</span>
                      </button>
                    </div>
                  </div>

                  {/* Language Mode Selector (Hindi / Hinglish / Mixed / English) */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-rose-400" />
                        <span>AI Suggestion Language</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {selectedLanguage === 'mixed' && 'Mixed: Eng + Hindi/Hinglish (Best CTR)'}
                        {selectedLanguage === 'hinglish' && 'Hinglish (Roman Hindi)'}
                        {selectedLanguage === 'hindi' && 'शुद्ध हिन्दी (Devanagari)'}
                        {selectedLanguage === 'english' && 'Global English'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleSelectLanguage('mixed')}
                        className={`px-2.5 py-2 rounded-xl border text-left font-medium transition-all flex flex-col gap-0.5 cursor-pointer ${
                          selectedLanguage === 'mixed'
                            ? 'bg-gradient-to-r from-rose-500/20 to-red-500/20 border-red-500 text-white font-bold shadow-sm shadow-red-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          🌐 Mixed (Eng + Hindi)
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">High CTR bilingual hook</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectLanguage('hinglish')}
                        className={`px-2.5 py-2 rounded-xl border text-left font-medium transition-all flex flex-col gap-0.5 cursor-pointer ${
                          selectedLanguage === 'hinglish'
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-sm shadow-amber-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          🇮🇳 Hinglish
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">Roman script Hindi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectLanguage('hindi')}
                        className={`px-2.5 py-2 rounded-xl border text-left font-medium transition-all flex flex-col gap-0.5 cursor-pointer ${
                          selectedLanguage === 'hindi'
                            ? 'bg-orange-500/20 border-orange-500 text-white font-bold shadow-sm shadow-orange-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-orange-400 font-bold">
                          🕉️ शुद्ध हिन्दी
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">देवनागरी लिपि (Pure Hindi)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectLanguage('english')}
                        className={`px-2.5 py-2 rounded-xl border text-left font-medium transition-all flex flex-col gap-0.5 cursor-pointer ${
                          selectedLanguage === 'english'
                            ? 'bg-blue-500/20 border-blue-500 text-white font-bold shadow-sm shadow-blue-500/20'
                            : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-blue-400 font-bold">
                          🇬🇧 English
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">Global English titles</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateFixes}
                  disabled={generatingAi}
                  className="w-full mt-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer text-sm"
                >
                  {generatingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                  {generatingAi ? 'Generating AI Suggestions...' : 'Generate AI Fixes'}
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 space-x-2 sm:space-x-4">
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'audit'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Audit & Issues ({auditData.issues?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('review')}
                className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'review'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4 text-red-400" />
                Human Review Queue ({drafts.filter(d => d.status === 'pending').length} Pending)
              </button>

              <button
                onClick={() => setActiveTab('publisher')}
                className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'publisher'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4 text-emerald-400" />
                Publisher & Rollback Log ({changeLogs.length})
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'checklist'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-4 h-4 text-blue-400" />
                Human-Only Checklist
              </button>
            </div>

            {/* TAB 1: Audit & Flagged Issues */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                {/* Summary Alert */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Policy & SEO Evaluation Summary</h4>
                      <p className="text-xs text-slate-400">
                        {auditData.policySummary.repetitiousTitlesCount > 0 && `${auditData.policySummary.repetitiousTitlesCount} repetitious titles detected. `}
                        {auditData.policySummary.phoneNumbersInTitles > 0 && `${auditData.policySummary.phoneNumbersInTitles} phone numbers in titles. `}
                        {auditData.policySummary.missingDescriptionsCount > 0 && `${auditData.policySummary.missingDescriptionsCount} videos with missing descriptions.`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateFixes}
                    className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Auto-Generate Fixes with AI
                  </button>
                </div>

                {/* Issues List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditData.issues?.map((issue: AuditItem, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          issue.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          issue.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{issue.category}</span>
                      </div>

                      <h4 className="font-bold text-white text-base">{issue.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{issue.description}</p>

                      {issue.currentValue && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 text-xs font-mono text-red-300 truncate">
                          Current: {issue.currentValue}
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span><strong>Recommended:</strong> {issue.recommendedAction}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🎬 Channel Video Library & Title Health Auditor */}
                <div className="mt-8 pt-8 border-t border-slate-800 space-y-5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <Video className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Channel Video Library &amp; Title Health Manager</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {totalAuditedVideos.length} Total Videos
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Monitor title lengths, mobile truncation risks (&gt;65 chars), and repetitious content across all uploads. Propose complete, sensible AI titles with zero word slicing.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleGenerateFixes}
                        disabled={generatingAi}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {generatingAi ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Queueing All Videos...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Queue All Videos Requiring Updates ({videosNeedingTitleFix.length})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Audited</p>
                      <p className="text-xl font-black text-white mt-0.5">{totalAuditedVideos.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
                      <p className="text-[11px] text-amber-300 uppercase font-bold tracking-wider">Update Required</p>
                      <p className="text-xl font-black text-amber-400 mt-0.5">{videosNeedingTitleFix.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-center">
                      <p className="text-[11px] text-purple-300 uppercase font-bold tracking-wider">In Review Queue</p>
                      <p className="text-xl font-black text-purple-400 mt-0.5">{titleDraftsPending.length + titleDraftsApproved.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                      <p className="text-[11px] text-emerald-300 uppercase font-bold tracking-wider">Live on YouTube</p>
                      <p className="text-xl font-black text-emerald-400 mt-0.5">{titleDraftsPublished.length}</p>
                    </div>
                  </div>

                  {/* Search & Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={videoSearchQuery}
                        onChange={(e) => setVideoSearchQuery(e.target.value)}
                        placeholder="Search channel videos by title..."
                        className="w-full bg-black/50 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setVideoStatusFilter('all')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          videoStatusFilter === 'all'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'bg-black/40 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        All ({totalAuditedVideos.length})
                      </button>
                      <button
                        onClick={() => setVideoStatusFilter('needs_fix')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          videoStatusFilter === 'needs_fix'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-black/40 text-amber-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        ⚠️ Needs Title Fix ({videosNeedingTitleFix.length})
                      </button>
                      <button
                        onClick={() => setVideoStatusFilter('optimal')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          videoStatusFilter === 'optimal'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-black/40 text-emerald-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        ✅ Optimal ({optimalVideosCount})
                      </button>
                      <button
                        onClick={() => setVideoStatusFilter('in_queue')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          videoStatusFilter === 'in_queue'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-black/40 text-purple-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        📌 In Queue ({titleDraftsPending.length + titleDraftsApproved.length})
                      </button>
                      <button
                        onClick={() => setVideoStatusFilter('published')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          videoStatusFilter === 'published'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-black/40 text-blue-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        🚀 Live ({titleDraftsPublished.length})
                      </button>
                    </div>
                  </div>

                  {/* Video List Items */}
                  <div className="space-y-3">
                    {filteredVideosList.length === 0 ? (
                      <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                        <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No videos match the selected filter or search query.</p>
                      </div>
                    ) : (
                      filteredVideosList.map((v: any) => {
                        const hasTitleIssue = v.issues && v.issues.some((i: string) => i.toLowerCase().includes('title'));
                        const isTooLong = (v.title || '').length > 65;
                        const isTooShort = (v.title || '').length < 15;
                        const needsFix = hasTitleIssue || isTooLong || isTooShort;
                        const draft = drafts.find(d => d.videoId === v.id && d.itemType === 'video_title');

                        return (
                          <div
                            key={v.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                              draft?.status === 'published'
                                ? 'bg-blue-950/15 border-blue-500/30'
                                : draft?.status === 'approved'
                                ? 'bg-emerald-950/15 border-emerald-500/30'
                                : draft?.status === 'pending'
                                ? 'bg-purple-950/20 border-purple-500/40'
                                : needsFix
                                ? 'bg-slate-900/90 border-amber-500/30'
                                : 'bg-slate-900/50 border-slate-800'
                            }`}
                          >
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              {/* Thumbnail */}
                              <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 shadow-md">
                                {v.thumbnailUrl ? (
                                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                                    YT
                                  </div>
                                )}
                              </div>

                              {/* Title, Metrics & Badges */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-white text-sm truncate max-w-xl" title={v.title}>
                                    {v.title}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    (v.title || '').length <= 65
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  }`}>
                                    {(v.title || '').length} chars {(v.title || '').length > 65 ? '(Truncation Risk)' : '✓'}
                                  </span>
                                  {draft?.status === 'published' ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                      ✅ Live on YouTube
                                    </span>
                                  ) : draft?.status === 'approved' ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      🟣 Approved
                                    </span>
                                  ) : draft?.status === 'pending' ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      🟡 Draft in Queue
                                    </span>
                                  ) : needsFix ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      ⚠️ Update Required
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                      🟢 Optimal Title
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                                  <span>{v.views?.toLocaleString() || 0} views</span>
                                  <span>&bull;</span>
                                  <a
                                    href={`https://www.youtube.com/watch?v=${v.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 text-[11px]"
                                  >
                                    Watch <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <span>&bull;</span>
                                  <a
                                    href={`https://studio.youtube.com/video/${v.id}/edit`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-[11px]"
                                  >
                                    Studio Edit <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>

                                {/* Suggested Title Preview if draft exists */}
                                {draft && (
                                  <div className="p-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs text-purple-200 font-mono">
                                    <span className="text-slate-400 font-sans font-medium mr-1.5">Proposed Fix ({draft.suggestedValue.length} chars • Complete Words):</span>
                                    <strong className="text-emerald-300">{draft.suggestedValue}</strong>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                              {draft ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setActiveTab('review');
                                      setQueueFilter('titles');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <span>Review in Queue</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                  {draft.status === 'approved' && (
                                    <button
                                      onClick={() => handlePublishSingle(draft.id)}
                                      disabled={singlePublishingId === draft.id}
                                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
                                    >
                                      {singlePublishingId === draft.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-amber-300" />}
                                      <span>Apply Live</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleGenerateSingleVideoFix(v)}
                                  disabled={singleQueueingId === v.id}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  {singleQueueingId === v.id ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Generating Fix...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Queue AI Title Fix</span>
                                      <span className="text-[10px] px-1 py-0.2 rounded bg-black/40 font-mono text-rose-300 border border-white/10 uppercase">
                                        {selectedLanguage}
                                      </span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Human Review Queue */}
            {activeTab === 'review' && (
              <div className="space-y-6">
                {/* Channel OAuth Connection Status Bar */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  accessToken
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-amber-950/20 border-amber-500/30'
                }`}>
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      accessToken
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {accessToken ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {accessToken ? 'Live YouTube API Connected' : 'YouTube Channel Not Connected for Direct API Push'}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          accessToken
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {accessToken ? 'OAuth Active' : 'Manual / Studio Mode'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {accessToken
                          ? 'Ready to publish changes directly to your real YouTube Channel via official Data API v3.'
                          : 'Connect your OAuth Access Token to apply changes live with 1 click, or use "Copy & Open Studio" on any card for instant manual paste.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {accessToken ? (
                      <>
                        <button
                          onClick={() => setShowOAuthModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Change Token
                        </button>
                        <button
                          onClick={handleDisconnectChannel}
                          className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowOAuthModal(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Connect YouTube Channel / Add Token</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Batch Progress Bar */}
                {batchProgress?.active && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        {batchProgress.message}
                      </span>
                      <span className="font-mono text-red-300 font-bold">
                        {batchProgress.current} / {batchProgress.total} ({Math.round((batchProgress.current / batchProgress.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 transition-all duration-300 rounded-full"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Title Queue Management & Channel Coverage Progress Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900/80 to-purple-950/20 border border-blue-500/30 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Sliders className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">Channel Title Queue &amp; Coverage Tracker</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {titleDrafts.length} / {videosNeedingTitleFix.length || totalAuditedVideos.length} Titles Checked
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {totalAuditedVideos.length} videos audited on this channel &bull;{' '}
                          <strong className="text-amber-300">{videosNeedingTitleFix.length} require title optimization</strong> &bull;{' '}
                          <strong className="text-emerald-400">{titleDraftsApproved.length + titleDraftsPublished.length} resolved</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleGenerateFixes}
                        disabled={generatingAi}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {generatingAi ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Checking &amp; Queueing All Videos...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Queue All Videos Requiring Updates</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar of Title Coverage */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                      <span>Queue Resolution Progress:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {videosNeedingTitleFix.length > 0
                          ? `${Math.min(100, Math.round(((titleDraftsApproved.length + titleDraftsPublished.length) / Math.max(1, videosNeedingTitleFix.length)) * 100))}% Resolved`
                          : '100% Up to Date'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                        style={{
                          width: `${
                            videosNeedingTitleFix.length > 0
                              ? Math.min(100, Math.round(((titleDraftsApproved.length + titleDraftsPublished.length) / Math.max(1, videosNeedingTitleFix.length)) * 100))
                              : 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Queue Filter Tabs Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setQueueFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        queueFilter === 'all'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      All Queue ({drafts.length})
                    </button>
                    <button
                      onClick={() => setQueueFilter('titles')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        queueFilter === 'titles'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>📌 Titles Only</span>
                      <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded-full font-bold">
                        {titleDrafts.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setQueueFilter('descriptions')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        queueFilter === 'descriptions'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Descriptions ({drafts.filter(d => d.itemType.includes('desc')).length})
                    </button>
                    <button
                      onClick={() => setQueueFilter('tags')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        queueFilter === 'tags'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Tags ({drafts.filter(d => d.itemType === 'video_tags').length})
                    </button>
                    <button
                      onClick={() => setQueueFilter('pending')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        queueFilter === 'pending'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Pending ({drafts.filter(d => d.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setQueueFilter('approved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        queueFilter === 'approved'
                          ? 'bg-emerald-700 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Approved ({drafts.filter(d => d.status === 'approved').length})
                    </button>
                    <button
                      onClick={() => setQueueFilter('published')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        queueFilter === 'published'
                          ? 'bg-blue-700 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Live on YouTube ({drafts.filter(d => d.status === 'published').length})
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Showing {filteredDrafts.length} of {drafts.length}
                  </span>
                </div>

                {/* Review Header Bar */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Review Before Publishing</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Apply changes <strong className="text-white">one-by-one</strong> on individual cards below, or approve multiple items and click <strong className="text-emerald-400">Apply All Approved Live</strong>.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleBulkApprove}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Approve All Pending
                    </button>
                    <button
                      onClick={handleBulkApproveTitles}
                      disabled={titleDraftsPending.length === 0}
                      className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-bold transition-all border border-purple-500/40 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                      Approve All Titles ({titleDraftsPending.length})
                    </button>
                    <button
                      onClick={handlePublishApproved}
                      disabled={publishing || drafts.filter(d => d.status === 'approved').length === 0}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Applying to YouTube...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Apply All Approved Live ({drafts.filter(d => d.status === 'approved').length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 100% Resolved Celebratory Banner */}
                {videosNeedingTitleFix.length > 0 && (titleDraftsApproved.length + titleDraftsPublished.length) >= videosNeedingTitleFix.length && (
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">🎉 All Channel Video Titles Fully Checked &amp; Optimized!</h4>
                        <p className="text-xs text-emerald-300 mt-0.5">
                          100% of videos requiring updates now have complete, sensible, mobile-friendly SEO titles approved or live on YouTube.
                        </p>
                      </div>
                    </div>
                    {drafts.filter(d => d.status === 'approved').length > 0 && (
                      <button
                        onClick={handlePublishApproved}
                        disabled={publishing}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Publish All Approved Live ({drafts.filter(d => d.status === 'approved').length})</span>
                      </button>
                    )}
                  </div>
                )}

                {filteredDrafts.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                    <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-300">No Drafts in this View</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {drafts.length === 0
                        ? 'Click the "Queue All Videos Requiring Updates" button above to generate sensible, policy-compliant titles and metadata.'
                        : 'No items match the selected filter. Try clicking "All Queue" to view all suggestions.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        className={`p-6 rounded-3xl border transition-all ${
                          draft.status === 'approved' ? 'bg-emerald-950/20 border-emerald-500/40' :
                          draft.status === 'rejected' ? 'bg-red-950/20 border-red-500/30 opacity-60' :
                          draft.status === 'published' ? 'bg-blue-950/20 border-blue-500/40 shadow-lg shadow-blue-950/20' :
                          'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        {/* Header: Item Type, Field, Status, and Video Link */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/60">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {draft.itemType.replace('_', ' ')}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              draft.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                              draft.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              draft.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {draft.status === 'published' ? '✅ LIVE ON YOUTUBE' : draft.status.toUpperCase()}
                            </span>
                            {draft.itemType === 'video_title' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                📌 SEO Title
                              </span>
                            )}
                            {draft.videoTitle && (
                              <span className="text-xs text-slate-400 font-medium truncate max-w-sm">
                                📹 {draft.videoTitle}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>Field: <strong className="text-slate-200 font-mono">{draft.fieldName}</strong></span>
                            {draft.videoId && (
                              <a
                                href={`https://www.youtube.com/watch?v=${draft.videoId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 text-[11px]"
                              >
                                View on YouTube <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Diff Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Current State */}
                          <div className="p-4 rounded-2xl bg-black/50 border border-slate-800">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Original State</p>
                            <p className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{draft.currentValue || '(Empty)'}</p>
                          </div>

                          {/* Proposed State */}
                          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                  {draft.itemType === 'video_title' ? 'Sensible SEO Title' : 'AI Proposed State'}
                                </p>
                                {draft.itemType === 'video_title' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                    Complete Words
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                draft.suggestedValue.length <= 65 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {draft.suggestedValue.length} / 65 chars
                              </span>
                            </div>

                            {editingDraftId === draft.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editedText}
                                  onChange={(e) => setEditedText(e.target.value)}
                                  className="w-full h-24 bg-black/60 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                                />
                                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                                  <span className={editedText.length > 65 ? 'text-amber-400' : 'text-emerald-400'}>
                                    {editedText.length} / 65 chars {editedText.length > 65 ? '(Mobile truncation risk)' : '✓'}
                                  </span>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setEditingDraftId(null)}
                                      className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDraft(draft.id, 'approved', editedText)}
                                      className="px-3 py-1 rounded-lg bg-emerald-600 text-xs font-bold text-white cursor-pointer"
                                    >
                                      Save &amp; Approve
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-emerald-200 font-mono font-medium leading-relaxed whitespace-pre-wrap">
                                {draft.suggestedValue}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Language Switcher & Regeneration for Video Titles */}
                        {draft.itemType === 'video_title' && (
                          <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-rose-400" />
                              <span className="text-xs font-semibold text-slate-300">
                                Regenerate in another language:
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                disabled={singleQueueingId === draft.videoId}
                                onClick={() => {
                                  const matchingVideo = totalAuditedVideos.find((v: any) => v.id === draft.videoId) || { id: draft.videoId, title: draft.currentValue, description: '' };
                                  handleGenerateSingleVideoFix(matchingVideo, 'mixed');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Regenerate with Mixed English + Hindi/Hinglish"
                              >
                                <span>🌐 Mixed</span>
                              </button>

                              <button
                                type="button"
                                disabled={singleQueueingId === draft.videoId}
                                onClick={() => {
                                  const matchingVideo = totalAuditedVideos.find((v: any) => v.id === draft.videoId) || { id: draft.videoId, title: draft.currentValue, description: '' };
                                  handleGenerateSingleVideoFix(matchingVideo, 'hinglish');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Regenerate in Roman script Hinglish"
                              >
                                <span>🇮🇳 Hinglish</span>
                              </button>

                              <button
                                type="button"
                                disabled={singleQueueingId === draft.videoId}
                                onClick={() => {
                                  const matchingVideo = totalAuditedVideos.find((v: any) => v.id === draft.videoId) || { id: draft.videoId, title: draft.currentValue, description: '' };
                                  handleGenerateSingleVideoFix(matchingVideo, 'hindi');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Regenerate in Pure Devanagari Hindi (हिन्दी)"
                              >
                                <span>🕉️ हिन्दी</span>
                              </button>

                              <button
                                type="button"
                                disabled={singleQueueingId === draft.videoId}
                                onClick={() => {
                                  const matchingVideo = totalAuditedVideos.find((v: any) => v.id === draft.videoId) || { id: draft.videoId, title: draft.currentValue, description: '' };
                                  handleGenerateSingleVideoFix(matchingVideo, 'english');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Regenerate in English"
                              >
                                <span>🇬🇧 English</span>
                              </button>

                              {singleQueueingId === draft.videoId && (
                                <span className="flex items-center gap-1.5 text-xs text-amber-300 font-mono pl-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Writing new title...</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Reason Note & Action Buttons */}
                        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <p className="text-xs text-slate-400 max-w-xl">
                            <strong className="text-slate-300">Policy Rationale:</strong> {draft.reason}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Copy & Open in Studio Button (Always accessible) */}
                            <button
                              onClick={() => handleCopyAndOpenStudio(draft)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Copies AI fix to clipboard and opens this video edit page in YouTube Studio"
                            >
                              <Copy className="w-3.5 h-3.5 text-blue-400" />
                              <span>Copy & Open Studio</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>

                            {/* Human Review Actions */}
                            {draft.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingDraftId(draft.id);
                                    setEditedText(draft.suggestedValue);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleUpdateDraft(draft.id, 'rejected')}
                                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-medium transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleUpdateDraft(draft.id, 'approved')}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                              </>
                            )}

                            {/* Single Live YouTube Publish (One-by-One) */}
                            <button
                              onClick={() => handlePublishSingle(draft.id)}
                              disabled={singlePublishingId === draft.id || draft.status === 'published'}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                                draft.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-50'
                              }`}
                              title={draft.status === 'published' ? 'Already updated live on YouTube' : 'Applies this single change live to your YouTube channel via Data API'}
                            >
                              {singlePublishingId === draft.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Applying Live...</span>
                                </>
                              ) : draft.status === 'published' ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Applied Live</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                                  <span>⚡ Apply Live to YouTube</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Publisher & Rollback Log */}
            {activeTab === 'publisher' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
                  <h3 className="text-base font-bold text-white mb-1">Official YouTube Publishing & Rollback</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Every modification applied through the YouTube Data API is version-controlled with a timestamp and exact previous state for guaranteed one-click rollback.
                  </p>

                  {changeLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No changes have been published yet. Approve items in the Review Queue and click &quot;Publish Approved&quot;.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-3 px-4 font-semibold">Published At</th>
                            <th className="py-3 px-4 font-semibold">Field</th>
                            <th className="py-3 px-4 font-semibold">Previous Value</th>
                            <th className="py-3 px-4 font-semibold">New Value</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {changeLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                                {new Date(log.publishedAt).toLocaleTimeString()}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">{log.fieldName}</td>
                              <td className="py-3 px-4 text-red-300 font-mono truncate max-w-xs">{log.oldValue}</td>
                              <td className="py-3 px-4 text-emerald-300 font-mono truncate max-w-xs">{log.newValue}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  log.status === 'published' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {log.status === 'published' ? 'Active' : 'Rolled Back'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {log.status === 'published' && (
                                  <button
                                    onClick={() => handleRollback(log.id)}
                                    className="px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Rollback
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Human-Only Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white">Google Reserved Human Steps</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Under YouTube Developer Terms, third-party automation tools must <strong>never</strong> automate or submit these sensitive settings on your behalf. You must confirm these manually in YouTube Studio:
                  </p>

                  <div className="space-y-3">
                    {auditData.humanChecklist?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-white text-sm">{item.item}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                        </div>
                        <a
                          href={item.studioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <span>Open in Studio</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI API Keys Configuration Modal */}
        <AnimatePresence>
          {showKeyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Provider API Keys</h3>
                    <p className="text-xs text-slate-400">Google Gemini • OpenAI ChatGPT • Anthropic Claude</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 mb-6 leading-relaxed">
                  You can use different API keys for each provider. Keys are saved securely in your browser&apos;s local storage and passed to the optimizer engine. If left empty, Creator Nest will use the server defaults.
                </p>

                <div className="space-y-4 text-xs">
                  {/* Google Gemini */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-blue-400" />
                        Google Gemini API Key
                      </label>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        Get Free Key <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={keyInputTemp.gemini}
                      onChange={(e) => setKeyInputTemp({ ...keyInputTemp, gemini: e.target.value })}
                      placeholder="Optional custom key (Default server Gemini key is active)"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-mono"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Model: gemini-2.5-flash</span>
                      <span className="text-emerald-400 font-semibold">
                        {keyInputTemp.gemini ? 'Custom key provided' : 'Server default active'}
                      </span>
                    </div>
                  </div>

                  {/* OpenAI ChatGPT */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        OpenAI ChatGPT API Key
                      </label>
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        Get OpenAI Key <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={keyInputTemp.openai}
                      onChange={(e) => setKeyInputTemp({ ...keyInputTemp, openai: e.target.value })}
                      placeholder="sk-proj-..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Model: gpt-4o</span>
                      <span className={keyInputTemp.openai ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {keyInputTemp.openai ? 'Custom key entered' : 'Not configured'}
                      </span>
                    </div>
                  </div>

                  {/* Anthropic Claude */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Anthropic Claude API Key
                      </label>
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        Get Claude Key <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={keyInputTemp.claude}
                      onChange={(e) => setKeyInputTemp({ ...keyInputTemp, claude: e.target.value })}
                      placeholder="sk-ant-api03-..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Model: claude-3-5-sonnet-20241022</span>
                      <span className={keyInputTemp.claude ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                        {keyInputTemp.claude ? 'Custom key entered' : 'Not configured'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Connection Test Feedback Banner */}
                {aiTestResult && (
                  <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    aiTestResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-red-950/40 border-red-500/40 text-red-200'
                  }`}>
                    {aiTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                    <div className="space-y-1">
                      <p className="font-semibold">{aiTestResult.message}</p>
                      {aiTestResult.sampleTitle && (
                        <p className="font-mono text-[11px] text-emerald-300/90 bg-black/40 px-2 py-1 rounded border border-emerald-500/20">
                          Sample Test Title: &quot;{aiTestResult.sampleTitle}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearKeys}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Clear Keys
                    </button>
                    <button
                      type="button"
                      onClick={handleTestAiConnection}
                      disabled={testingAi}
                      className="px-3.5 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {testingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
                      <span>{testingAi ? 'Testing Key...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveKeys}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                    >
                      Save API Keys
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* YouTube Channel OAuth Connection Modal */}
        <AnimatePresence>
          {showOAuthModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowOAuthModal(false)}
                  className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Connect YouTube Channel for Live Publishing</h3>
                    <p className="text-xs text-slate-400">Official YouTube Data API v3 • Direct Live Channel Updates</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 mb-5 leading-relaxed">
                  To update your actual YouTube video titles, descriptions, and tags directly from Creator Nest, you can connect your YouTube account using an OAuth 2.0 Access Token, or use the 1-click Studio Manual Mode.
                </p>

                {/* Two Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Option A: Direct API */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-red-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Option 1: Direct Live API</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Enables the <strong className="text-white">&quot;Apply Live to YouTube&quot;</strong> and <strong className="text-white">&quot;Apply All Approved (Automatic)&quot;</strong> buttons to execute updates directly via the YouTube API without leaving this dashboard.
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      Fully Automated
                    </span>
                  </div>

                  {/* Option B: Studio Manual Mode */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Copy className="w-4 h-4 text-blue-400" />
                      <span>Option 2: 1-Click Studio Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      No API tokens or credentials required! Click <strong className="text-white">&quot;Copy &amp; Open Studio&quot;</strong> on any draft to copy the AI text and open YouTube Studio directly on that video.
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                      Zero Setup Required
                    </span>
                  </div>
                </div>

                {/* Direct API Token Input */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-xs flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      OAuth 2.0 Access Token
                    </label>
                    <a
                      href="https://developers.google.com/oauthplayground"
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-400 hover:text-red-300 text-xs inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Open Google OAuth Playground</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <input
                    type="password"
                    value={tempTokenInput}
                    onChange={(e) => setTempTokenInput(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs font-mono"
                  />

                  {/* 30-Second Guide */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                    <p className="font-bold text-slate-200">How to get your YouTube token in 30 seconds:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Open <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-red-400 underline">Google OAuth Playground</a></li>
                      <li>Under Step 1, select <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">YouTube Data API v3</code> &rarr; check <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">https://www.googleapis.com/auth/youtube</code></li>
                      <li>Click <strong className="text-white">Authorize APIs</strong> &amp; select your YouTube channel Google account</li>
                      <li>In Step 2, click <strong className="text-white">Exchange authorization code for tokens</strong></li>
                      <li>Copy the generated <strong className="text-emerald-400">Access token</strong> and paste it into the box above</li>
                    </ol>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOAuthModal(false);
                      showToast('Using 1-Click Studio Manual Mode.');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Continue with Studio Mode
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOAuthModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveToken}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                    >
                      Save &amp; Connect Channel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
