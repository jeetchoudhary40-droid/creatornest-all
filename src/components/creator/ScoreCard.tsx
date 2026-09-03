'use client';
// ============================================================
// Creator Nest — Creator Score Card Component
// src/components/creator/ScoreCard.tsx
// ============================================================

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { CREATOR_TIERS, type CreatorTier, type GrowthVelocity } from '@/types/creator';

interface Props {
  creatorScore:    number;
  creatorTier:     CreatorTier;
  influenceScore:  number;
  authenticityScore: number;
  growthVelocity:  GrowthVelocity;
  totalReach:      number;
  compact?:        boolean;
}

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function ScoreMeter({ value, color, label }: { value: number; color: string; label: string }) {
  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="5" stroke="rgba(255,255,255,0.06)" />
          <motion.circle
            cx="32" cy="32" r={radius}
            fill="none" strokeWidth="5"
            stroke={color}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
          {Math.round(value)}
        </span>
      </div>
      <span className="text-[10px] text-gray-500 text-center">{label}</span>
    </div>
  );
}

export default function ScoreCard({
  creatorScore,
  creatorTier,
  influenceScore,
  authenticityScore,
  growthVelocity,
  totalReach,
  compact = false,
}: Props) {
  const tier  = CREATOR_TIERS[creatorTier] ?? CREATOR_TIERS.micro;

  const GrowthIcon =
    growthVelocity === 'Rising'   ? TrendingUp   :
    growthVelocity === 'Declining' ? TrendingDown : Minus;

  const growthColor =
    growthVelocity === 'Rising'   ? '#10B981' :
    growthVelocity === 'Declining' ? '#EF4444' : '#6B7280';

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: tier.color }} />
            <span className="text-sm font-bold text-white">Creator Intelligence</span>
          </div>
          <p className="text-xs text-gray-500">AI-powered platform score</p>
        </div>
        {/* Tier badge */}
        <div
          className="px-2.5 py-1 rounded-lg text-xs font-black border"
          style={{ background: tier.bg, color: tier.color, borderColor: `${tier.color}40` }}
        >
          {tier.label.toUpperCase()}
        </div>
      </div>

      {/* Main score */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black border-2"
            style={{ background: `${tier.color}15`, color: tier.color, borderColor: `${tier.color}40` }}
          >
            {Math.round(creatorScore)}
          </div>
          <span className="absolute -bottom-1 -right-1 text-[10px] bg-black border border-white/10 rounded px-1 text-gray-400">
            /100
          </span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Total Reach</p>
          <p className="text-xl font-black text-white">{formatReach(totalReach)}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <GrowthIcon className="w-3.5 h-3.5" style={{ color: growthColor }} />
            <span className="text-xs font-semibold" style={{ color: growthColor }}>
              {growthVelocity}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      {!compact && (
        <div className="flex items-center justify-around pt-2 border-t border-white/5">
          <ScoreMeter value={influenceScore}   color="#8B5CF6" label="Influence" />
          <ScoreMeter value={authenticityScore} color="#10B981" label="Authenticity" />
          <ScoreMeter value={Math.min(100, creatorScore * 1.1)} color={tier.color} label="Overall" />
        </div>
      )}
    </div>
  );
}
