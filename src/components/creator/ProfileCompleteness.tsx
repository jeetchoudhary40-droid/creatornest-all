'use client';
// ============================================================
// Creator Nest — Profile Completeness Widget
// src/components/creator/ProfileCompleteness.tsx
// ============================================================

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import type { IntelligentCreator } from '@/types/creator';

interface Props {
  creator: Partial<IntelligentCreator>;
  showSuggestions?: boolean;
  onEditClick?: (section: string) => void;
}

// Which fields map to which sections
const SECTIONS = [
  {
    label:    'Identity',
    section:  'identity',
    color:    '#00F2FE',
    fields:   ['full_name', 'tagline', 'bio', 'cover_photo_url'] as (keyof IntelligentCreator)[],
  },
  {
    label:    'Category & Niche',
    section:  'category',
    color:    '#8B5CF6',
    fields:   ['primary_category', 'primary_niche', 'content_formats', 'upload_frequency'] as (keyof IntelligentCreator)[],
  },
  {
    label:    'Analytics',
    section:  'analytics',
    color:    '#F59E0B',
    fields:   ['engagement_rate', 'audience_age_18_24', 'audience_gender_male'] as (keyof IntelligentCreator)[],
  },
  {
    label:    'Commercial',
    section:  'commercial',
    color:    '#10B981',
    fields:   ['rate_ig_reel', 'rate_dedicated_video', 'business_email', 'media_kit_url'] as (keyof IntelligentCreator)[],
  },
  {
    label:    'AI Strategy',
    section:  'strategy',
    color:    '#EC4899',
    fields:   ['seo_keywords', 'ai_growth_insight', 'strategy_goals'] as (keyof IntelligentCreator)[],
  },
];

function fieldFilled(creator: Partial<IntelligentCreator>, field: keyof IntelligentCreator): boolean {
  const val = creator[field];
  if (val === undefined || val === null) return false;
  if (typeof val === 'string')  return val.trim().length > 0;
  if (typeof val === 'number')  return val > 0;
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val))       return val.length > 0;
  return false;
}

function sectionPct(creator: Partial<IntelligentCreator>, fields: (keyof IntelligentCreator)[]): number {
  const filled = fields.filter(f => fieldFilled(creator, f)).length;
  return Math.round((filled / fields.length) * 100);
}

export default function ProfileCompleteness({ creator, showSuggestions = true, onEditClick }: Props) {
  const pct = creator.profile_completeness_pct ?? 0;

  const getColor = () => {
    if (pct >= 80) return '#10B981';
    if (pct >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getLabel = () => {
    if (pct >= 90) return 'Excellent';
    if (pct >= 75) return 'Good';
    if (pct >= 50) return 'Fair';
    return 'Needs Work';
  };

  const color = getColor();

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Profile Completeness</p>
          <p className="text-xs text-gray-500 mt-0.5">Higher = better AI insights & discoverability</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color }}>{pct}%</p>
          <p className="text-xs font-semibold" style={{ color }}>{getLabel()}</p>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
        />
      </div>

      {/* Section Breakdown */}
      {showSuggestions && (
        <div className="space-y-2">
          {SECTIONS.map(({ label, section, color: sColor, fields }) => {
            const secPct  = sectionPct(creator, fields);
            const missing = fields.filter(f => !fieldFilled(creator, f)).length;
            return (
              <button
                key={section}
                onClick={() => onEditClick?.(section)}
                className="w-full flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/5 text-left"
              >
                {secPct === 100
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: sColor }} />
                  : <AlertCircle  className="w-4 h-4 flex-shrink-0" style={{ color: sColor }} />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{label}</span>
                    <span className="text-xs text-gray-500">
                      {secPct === 100 ? '✓' : `${missing} missing`}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${secPct}%`, background: sColor }}
                    />
                  </div>
                </div>
                {secPct < 100 && <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
