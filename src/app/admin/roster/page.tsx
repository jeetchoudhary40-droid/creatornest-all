'use client';
// ============================================================
// Creator Nest — Admin: Roster Arrangement
// /admin/roster
// Manage display order for Home Page and Roster Page
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Home, List, Save, Loader2, Check, AlertTriangle,
  GripVertical, Eye, EyeOff, Star, TrendingUp, Video,
  Camera, Edit2, ChevronUp, ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Creator = {
  id: string | number;
  name: string;
  channelName?: string;
  niche: string;
  niches?: string[];
  platform: string;
  youtube: string;
  youtubeNum: number;
  instagram: string;
  instaNum: number;
  avd: string;
  avgViewsLast10?: number | string;
  rank: number;
  featured: boolean;
  topGrowing: boolean;
  img: string;
  show_on_home: boolean;
  show_on_roster: boolean;
  location: string;
};

type Tab = 'home' | 'roster';

function formatNum(n: number | string | undefined): string {
  const num = Number(n);
  if (!num || isNaN(num)) return '—';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

// ── Draggable Creator Row ──────────────────────────────────────
function DraggableCreatorRow({
  creator,
  index,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  field,
}: {
  creator: Creator;
  index: number;
  onToggle: (id: string | number, field: 'show_on_home' | 'show_on_roster', value: boolean) => void;
  onMoveUp: (id: string | number) => void;
  onMoveDown: (id: string | number) => void;
  isFirst: boolean;
  isLast: boolean;
  field: 'show_on_home' | 'show_on_roster';
}) {
  const isVisible = field === 'show_on_home' ? creator.show_on_home : creator.show_on_roster;

  return (
    <Reorder.Item
      value={creator}
      id={String(creator.id)}
      className="select-none"
    >
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors cursor-grab active:cursor-grabbing ${
          isVisible
            ? 'bg-white/[0.03] border-white/8 hover:bg-white/[0.05]'
            : 'bg-white/[0.01] border-white/5 opacity-60 hover:opacity-80'
        }`}
      >
        {/* Drag handle + order */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <GripVertical className="w-4 h-4 text-gray-600" />
          <span className="text-xs font-mono text-gray-500 w-5 text-center">{index + 1}</span>
        </div>

        {/* Move buttons (for non-drag alternative) */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); onMoveUp(creator.id); }}
            disabled={isFirst}
            className="p-0.5 rounded hover:bg-white/10 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onMoveDown(creator.id); }}
            disabled={isLast}
            className="p-0.5 rounded hover:bg-white/10 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
          {creator.img ? (
            <Image src={creator.img} alt={creator.name} fill className="object-cover object-top" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">
              {creator.name?.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
            <span>{creator.name}</span>
            {creator.channelName && (
              <span className="text-[11px] font-normal text-cyan-400">({creator.channelName})</span>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{creator.niches && creator.niches.length > 0 ? creator.niches.join(', ') : creator.niche}</span>
            {creator.youtubeNum > 0 && (
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3 text-red-400" />{formatNum(creator.youtubeNum)}
              </span>
            )}
            {creator.instaNum > 0 && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3 text-pink-400" />{formatNum(creator.instaNum)}
              </span>
            )}
            {creator.avgViewsLast10 ? (
              <span className="text-emerald-400 font-semibold">
                {formatNum(creator.avgViewsLast10)} avg views
              </span>
            ) : null}
          </div>
        </div>

        {/* Badges */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {creator.featured && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-medium">
              Featured
            </span>
          )}
          {creator.topGrowing && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 font-medium">
              Growing
            </span>
          )}
        </div>

        {/* Visibility toggle */}
        <button
          onClick={e => { e.stopPropagation(); onToggle(creator.id, field, !isVisible); }}
          className={`flex-shrink-0 p-2 rounded-xl transition-colors ${
            isVisible ? 'bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20' : 'bg-white/5 text-gray-500 hover:text-gray-300'
          }`}
          title={isVisible ? 'Click to hide' : 'Click to show'}
        >
          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Edit link */}
        <Link
          href={`/admin/creators/${creator.id}/edit`}
          onClick={e => e.stopPropagation()}
          className="flex-shrink-0 p-2 rounded-xl text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          title="Edit creator"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
      </div>
    </Reorder.Item>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminRosterPage() {
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [homeOrder, setHomeOrder] = useState<Creator[]>([]);
  const [rosterOrder, setRosterOrder] = useState<Creator[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load ────────────────────────────────────────────────────
  const fetchCreators = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roster');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const creators: Creator[] = json.creators;
      setAllCreators(creators);

      // Home order: all creators sorted by rank (show_on_home first)
      const home = [...creators].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
      setHomeOrder(home);

      // Roster order: same but separate list
      const roster = [...creators].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
      setRosterOrder(roster);
    } catch (err: any) {
      setError(err.message || 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCreators(); }, []);

  // ── Reorder handlers ────────────────────────────────────────
  const moveItem = (list: Creator[], setList: (v: Creator[]) => void, id: string | number, dir: 'up' | 'down') => {
    const idx = list.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return;
    const newList = [...list];
    if (dir === 'up' && idx > 0) {
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    } else if (dir === 'down' && idx < newList.length - 1) {
      [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    }
    setList(newList);
  };

  // ── Toggle visibility ───────────────────────────────────────
  const handleToggle = async (id: string | number, field: 'show_on_home' | 'show_on_roster', value: boolean) => {
    // Optimistic update
    const update = (list: Creator[]) => list.map(c => String(c.id) === String(id) ? { ...c, [field]: value } : c);
    setHomeOrder(prev => update(prev));
    setRosterOrder(prev => update(prev));
    setAllCreators(prev => update(prev));

    try {
      const res = await fetch('/api/admin/roster', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id, field, value }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(`Visibility updated`);
    } catch (err: any) {
      // Revert
      const revert = (list: Creator[]) => list.map(c => String(c.id) === String(id) ? { ...c, [field]: !value } : c);
      setHomeOrder(prev => revert(prev));
      setRosterOrder(prev => revert(prev));
      setAllCreators(prev => revert(prev));
      showToast('Failed to update visibility', 'error');
    }
  };

  // ── Save order ──────────────────────────────────────────────
  const saveOrder = async () => {
    setSaving(true);
    setError('');
    try {
      // Use current active tab order to derive ranks
      const items = (activeTab === 'home' ? homeOrder : rosterOrder).map((c, idx) => ({
        id: c.id,
        rank: idx + 1,
      }));

      const res = await fetch('/api/admin/roster', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', items }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      showToast('Order saved successfully!');
      // Refresh to get updated ranks
      fetchCreators();
    } catch (err: any) {
      setError(err.message || 'Failed to save order');
      showToast('Failed to save order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentList = activeTab === 'home' ? homeOrder : rosterOrder;
  const currentField: 'show_on_home' | 'show_on_roster' = activeTab === 'home' ? 'show_on_home' : 'show_on_roster';
  const visibleCount = currentList.filter(c => activeTab === 'home' ? c.show_on_home : c.show_on_roster).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl font-medium text-sm shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Roster Arrangement</h1>
          <p className="text-gray-400 text-sm mt-1">
            Drag to reorder · Toggle visibility · Changes apply immediately on save
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/creators"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Manage Creators
          </Link>
          <button
            onClick={saveOrder}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,242,254,0.2)] ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105'
            } disabled:opacity-60 disabled:scale-100`}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : saved ? <><Check className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save Order</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/8 rounded-2xl w-fit">
        {([
          { id: 'home', label: 'Home Page', icon: Home, color: 'cyan' },
          { id: 'roster', label: 'Roster Page', icon: List, color: 'purple' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? tab.color === 'cyan'
                  ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/20'
                  : 'bg-purple-400/15 text-purple-400 border border-purple-400/20'
                : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/8 rounded-xl">
        <div className="text-sm text-gray-400">
          <span className="text-white font-semibold">{visibleCount}</span> of{' '}
          <span className="text-white font-semibold">{currentList.length}</span> creators visible on{' '}
          {activeTab === 'home' ? 'home page' : 'roster page'}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
          <GripVertical className="w-3.5 h-3.5" />
          Drag rows to reorder
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-600 pb-2">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-cyan-400" /> Visible</span>
            <span className="flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5" /> Hidden</span>
            <span className="flex items-center gap-1.5"><ChevronUp className="w-3.5 h-3.5" /><ChevronDown className="w-3.5 h-3.5" /> Move</span>
            <span className="flex items-center gap-1.5"><GripVertical className="w-3.5 h-3.5" /> Drag to reorder</span>
          </div>

          {/* Draggable list */}
          <Reorder.Group
            axis="y"
            values={activeTab === 'home' ? homeOrder : rosterOrder}
            onReorder={activeTab === 'home' ? setHomeOrder : setRosterOrder}
            className="space-y-2"
          >
            {currentList.map((creator, idx) => (
              <DraggableCreatorRow
                key={String(creator.id)}
                creator={creator}
                index={idx}
                onToggle={handleToggle}
                onMoveUp={id => moveItem(
                  activeTab === 'home' ? homeOrder : rosterOrder,
                  activeTab === 'home' ? setHomeOrder : setRosterOrder,
                  id, 'up'
                )}
                onMoveDown={id => moveItem(
                  activeTab === 'home' ? homeOrder : rosterOrder,
                  activeTab === 'home' ? setHomeOrder : setRosterOrder,
                  id, 'down'
                )}
                isFirst={idx === 0}
                isLast={idx === currentList.length - 1}
                field={currentField}
              />
            ))}
          </Reorder.Group>

          {currentList.length === 0 && (
            <div className="text-center py-16 text-gray-500 text-sm">
              No creators found.{' '}
              <Link href="/admin/creators" className="text-cyan-400 hover:underline">
                Add some creators first →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Save hint */}
      {!loading && currentList.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-xs text-gray-600">
            Reorder by dragging rows or using ↑↓ buttons, then click "Save Order" to apply.
          </p>
          <button
            onClick={saveOrder}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105'
            } disabled:opacity-60`}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : saved ? <><Check className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save Order</>}
          </button>
        </div>
      )}
    </div>
  );
}
