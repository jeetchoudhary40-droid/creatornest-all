'use client';
// ============================================================
// Creator Nest — Rate Card Component
// src/components/creator/RateCard.tsx
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ChevronDown, ChevronUp, Handshake, Package } from 'lucide-react';

interface RateItem {
  label:     string;
  field:     string;
  value:     number;
  platform:  'YouTube' | 'Instagram' | 'Bundle';
  icon:      string;
}

interface Props {
  rates: {
    rate_dedicated_video?:   number;
    rate_integrated_video?:  number;
    rate_youtube_short?:     number;
    rate_ig_reel?:           number;
    rate_ig_story_set?:      number;
    rate_package_bundle?:    number;
    rate_ambassador_monthly?: number;
    rate_negotiable?:        boolean;
    barter_collab_open?:     boolean;
    barter_min_value?:       number;
    currency?:               string;
  };
  editable?: boolean;
  onSave?:   (rates: Record<string, number | boolean>) => void;
}

const RATE_ITEMS: RateItem[] = [
  { label: 'Dedicated Video',   field: 'rate_dedicated_video',   value: 0, platform: 'YouTube',   icon: '🎬' },
  { label: 'Integrated Video',  field: 'rate_integrated_video',  value: 0, platform: 'YouTube',   icon: '▶️' },
  { label: 'YouTube Short',     field: 'rate_youtube_short',     value: 0, platform: 'YouTube',   icon: '⚡' },
  { label: 'Instagram Reel',    field: 'rate_ig_reel',           value: 0, platform: 'Instagram', icon: '🎭' },
  { label: 'Story Set (3–5)',   field: 'rate_ig_story_set',      value: 0, platform: 'Instagram', icon: '📸' },
  { label: 'Multi-Platform Bundle', field: 'rate_package_bundle', value: 0, platform: 'Bundle',   icon: '📦' },
  { label: 'Brand Ambassador/mo',  field: 'rate_ambassador_monthly', value: 0, platform: 'Bundle', icon: '👑' },
];

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const PLATFORM_COLORS: Record<string, string> = {
  YouTube:   '#EF4444',
  Instagram: '#EC4899',
  Bundle:    '#8B5CF6',
};

export default function RateCard({ rates, editable = false, onSave }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [draft,    setDraft]    = useState<Record<string, number | boolean>>({});

  const startEdit = () => {
    const initial: Record<string, number | boolean> = {};
    RATE_ITEMS.forEach(item => {
      initial[item.field] = (rates[item.field as keyof typeof rates] as number) ?? 0;
    });
    initial.rate_negotiable    = rates.rate_negotiable    ?? true;
    initial.barter_collab_open = rates.barter_collab_open ?? false;
    initial.barter_min_value   = rates.barter_min_value   ?? 0;
    setDraft(initial);
    setEditing(true);
  };

  const handleSave = () => {
    onSave?.(draft);
    setEditing(false);
  };

  const currency = rates.currency ?? 'INR';
  const hasRates = RATE_ITEMS.some(item => (rates[item.field as keyof typeof rates] as number ?? 0) > 0);
  const visibleItems = expanded ? RATE_ITEMS : RATE_ITEMS.slice(0, 4);

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Rate Card</span>
          {rates.rate_negotiable && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
              Negotiable
            </span>
          )}
        </div>
        {editable && !editing && (
          <button
            onClick={startEdit}
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Edit Rates
          </button>
        )}
      </div>

      {!hasRates && !editing && (
        <p className="text-xs text-gray-500 text-center py-2">
          No rates set yet. {editable ? 'Click "Edit Rates" to add.' : 'Contact the creator for pricing.'}
        </p>
      )}

      {/* Rate Items */}
      <div className="space-y-2">
        {visibleItems.map(item => {
          const val = editing
            ? (draft[item.field] as number ?? 0)
            : (rates[item.field as keyof typeof rates] as number ?? 0);
          const color = PLATFORM_COLORS[item.platform];

          return (
            <motion.div
              key={item.field}
              layout
              className="flex items-center justify-between gap-3 rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-base">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{item.label}</p>
                  <div
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                    style={{ background: `${color}18`, color }}
                  >
                    {item.platform}
                  </div>
                </div>
              </div>

              {editing ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    value={draft[item.field] as number ?? ''}
                    onChange={e => setDraft(prev => ({ ...prev, [item.field]: Number(e.target.value) }))}
                    className="w-24 text-right text-xs font-bold text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                    placeholder="0"
                  />
                </div>
              ) : (
                <span
                  className="text-sm font-black flex-shrink-0"
                  style={{ color: val > 0 ? '#10B981' : '#374151' }}
                >
                  {val > 0 ? formatINR(val) : '—'}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Show more toggle */}
      {!editing && RATE_ITEMS.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Show less' : `+${RATE_ITEMS.length - 4} more rates`}
        </button>
      )}

      {/* Barter info */}
      {(rates.barter_collab_open || editing) && (
        <div
          className="flex items-center gap-2 p-2.5 rounded-xl text-xs"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <Handshake className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="text-purple-300">
            Open to barter collabs{rates.barter_min_value && rates.barter_min_value > 0
              ? ` (min ₹${rates.barter_min_value.toLocaleString('en-IN')} product value)`
              : ''}
          </span>
        </div>
      )}

      {/* Save / Cancel */}
      {editing && (
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff' }}
          >
            Save Rate Card
          </button>
        </div>
      )}
    </div>
  );
}
