'use client';
// ============================================================
// Creator Nest — Sync Status Indicator
// src/components/creator/SyncStatus.tsx
// Shows auto-sync status, last synced time, and manual trigger
// ============================================================

import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  creatorId:         string;
  autoSyncEnabled:   boolean;
  lastApiSync?:      string;
  dataSource?:       string;
  aiLastEnriched?:   string;
  syncErrorLog?:     string;
  onSyncComplete?:   () => void;
}

function timeAgo(isoString?: string): string {
  if (!isoString) return 'Never';
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / (1000 * 60));
  return mins > 0 ? `${mins}m ago` : 'Just now';
}

export default function SyncStatus({
  creatorId,
  autoSyncEnabled,
  lastApiSync,
  dataSource,
  aiLastEnriched,
  syncErrorLog,
  onSyncComplete,
}: Props) {
  const [syncingYT, setSyncingYT] = useState(false);
  const [syncingAI, setSyncingAI] = useState(false);
  const [syncMsg,   setSyncMsg]   = useState('');

  const triggerSync = async (type: 'youtube' | 'ai') => {
    const endpoint = type === 'youtube' ? '/api/creator/sync-youtube' : '/api/creator/ai-enrich';
    if (type === 'youtube') setSyncingYT(true);
    else setSyncingAI(true);
    setSyncMsg('');

    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ creatorId, force: true }),
      });
      const data = await res.json();

      if (data.skipped) {
        setSyncMsg(`⏳ ${data.reason}`);
      } else if (data.success) {
        setSyncMsg(type === 'youtube' ? '✅ YouTube stats synced!' : '✅ AI enrichment complete!');
        onSyncComplete?.();
      } else {
        setSyncMsg(`❌ Error: ${data.error}`);
      }
    } catch {
      setSyncMsg('❌ Sync failed — check console');
    } finally {
      if (type === 'youtube') setSyncingYT(false);
      else setSyncingAI(false);
      setTimeout(() => setSyncMsg(''), 5000);
    }
  };

  const hasError = Boolean(syncErrorLog);

  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: hasError ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: autoSyncEnabled ? '#10B981' : '#6B7280' }}
          />
          <span className="text-xs font-semibold text-white">
            Auto-Sync: {autoSyncEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
        {dataSource && (
          <span className="text-[10px] px-2 py-0.5 rounded-full text-gray-400 border border-white/10">
            {dataSource}
          </span>
        )}
      </div>

      {/* Sync times */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 rounded-xl bg-white/[0.03]">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] text-gray-500">API Sync</span>
          </div>
          <p className="text-xs font-semibold text-white">{timeAgo(lastApiSync)}</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-white/[0.03]">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-gray-500">AI Enriched</span>
          </div>
          <p className="text-xs font-semibold text-white">{timeAgo(aiLastEnriched)}</p>
        </div>
      </div>

      {/* Error */}
      {hasError && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-300 leading-relaxed">{syncErrorLog}</p>
        </div>
      )}

      {/* Manual trigger buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => triggerSync('youtube')}
          disabled={syncingYT}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          style={{ background: 'rgba(0,242,254,0.1)', color: '#00F2FE', border: '1px solid rgba(0,242,254,0.2)' }}
        >
          <RefreshCw className={`w-3 h-3 ${syncingYT ? 'animate-spin' : ''}`} />
          {syncingYT ? 'Syncing...' : 'Sync YT'}
        </button>
        <button
          onClick={() => triggerSync('ai')}
          disabled={syncingAI}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <Zap className={`w-3 h-3 ${syncingAI ? 'animate-pulse' : ''}`} />
          {syncingAI ? 'Enriching...' : 'AI Enrich'}
        </button>
      </div>

      {/* Status message */}
      <AnimatePresence>
        {syncMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-center text-gray-300"
          >
            {syncMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
