'use client';
// ============================================================
// Creator Nest — Audience Demographics Chart
// src/components/creator/AudienceChart.tsx
// ============================================================

import { motion } from 'framer-motion';
import { Users, Globe, MapPin } from 'lucide-react';

interface AudienceCountry { country: string; pct: number; }
interface AudienceCity    { city:    string; pct: number; }

interface Props {
  genderMale:   number;
  genderFemale: number;
  genderOther?: number;
  age1317?:     number;
  age1824:      number;
  age2534:      number;
  age3544?:     number;
  age45plus?:   number;
  topCountries?:  AudienceCountry[];
  topCities?:     AudienceCity[];
  audienceInterests?: string[];
  indiaPct?:    number;
  incomeSegment?: string;
  compact?:     boolean;
}

// ── Horizontal bar helper ─────────────────────────────────────
function Bar({ label, pct, color, delay = 0 }: { label: string; pct: number; color: string; delay?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-gray-400">{label}</span>
        <span className="text-[11px] font-bold text-white">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Donut chart for gender ────────────────────────────────────
function GenderDonut({ male, female, other = 0 }: { male: number; female: number; other?: number }) {
  const size    = 80;
  const r       = 28;
  const circ    = 2 * Math.PI * r;
  const mSlice  = (male   / 100) * circ;
  const fSlice  = (female / 100) * circ;
  const oSlice  = (other  / 100) * circ;

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10" stroke="rgba(255,255,255,0.04)" />
          {/* Male — blue */}
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10"
            stroke="#3B82F6"
            strokeDasharray={`${mSlice} ${circ}`}
            strokeDashoffset={0}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${mSlice} ${circ}` }}
            transition={{ duration: 0.8 }}
          />
          {/* Female — pink */}
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10"
            stroke="#EC4899"
            strokeDasharray={`${fSlice} ${circ}`}
            strokeDashoffset={-mSlice}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${fSlice} ${circ}` }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
          {/* Other — purple */}
          {other > 0 && (
            <motion.circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="10"
              stroke="#8B5CF6"
              strokeDasharray={`${oSlice} ${circ}`}
              strokeDashoffset={-(mSlice + fSlice)}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${oSlice} ${circ}` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Users className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { label: 'Male',   pct: male,   color: '#3B82F6' },
          { label: 'Female', pct: female, color: '#EC4899' },
          ...(other > 0 ? [{ label: 'Other', pct: other, color: '#8B5CF6' }] : []),
        ].map(({ label, pct, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[11px] text-gray-400">{label}</span>
            <span className="text-[11px] font-bold text-white ml-auto pl-3">{pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Country flag emoji helper ─────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  India: '🇮🇳', 'United States': '🇺🇸', US: '🇺🇸', UK: '🇬🇧',
  'United Kingdom': '🇬🇧', Canada: '🇨🇦', Australia: '🇦🇺',
  UAE: '🇦🇪', Singapore: '🇸🇬', Germany: '🇩🇪', Pakistan: '🇵🇰',
};

// ── Main Component ────────────────────────────────────────────
export default function AudienceChart({
  genderMale, genderFemale, genderOther = 0,
  age1317 = 0, age1824, age2534, age3544 = 0, age45plus = 0,
  topCountries = [], topCities = [],
  audienceInterests = [],
  indiaPct = 0, incomeSegment,
  compact = false,
}: Props) {

  const AGE_GROUPS = [
    { label: '13–17', pct: age1317,  color: '#60A5FA' },
    { label: '18–24', pct: age1824,  color: '#00F2FE' },
    { label: '25–34', pct: age2534,  color: '#8B5CF6' },
    { label: '35–44', pct: age3544,  color: '#F59E0B' },
    { label: '45+',   pct: age45plus,color: '#6B7280' },
  ].filter(g => g.pct > 0);

  return (
    <div
      className="rounded-2xl border p-5 space-y-5"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-bold text-white">Audience Demographics</span>
        {indiaPct > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
            style={{ background: 'rgba(255,153,0,0.15)', color: '#FF9900', border: '1px solid rgba(255,153,0,0.3)' }}>
            🇮🇳 {indiaPct.toFixed(0)}% India
          </span>
        )}
      </div>

      {/* Gender Donut */}
      {(genderMale > 0 || genderFemale > 0) && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 font-semibold">Gender Split</p>
          <GenderDonut male={genderMale} female={genderFemale} other={genderOther} />
        </div>
      )}

      {/* Age Distribution */}
      {AGE_GROUPS.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 font-semibold">Age Distribution</p>
          <div className="space-y-2">
            {AGE_GROUPS.map((g, i) => (
              <Bar key={g.label} label={g.label} pct={g.pct} color={g.color} delay={i * 0.08} />
            ))}
          </div>
        </div>
      )}

      {/* Top Countries */}
      {!compact && topCountries.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 font-semibold flex items-center gap-1">
            <Globe className="w-3 h-3" /> Top Countries
          </p>
          <div className="space-y-2">
            {topCountries.slice(0, 5).map((c, i) => (
              <div key={c.country} className="flex items-center gap-2">
                <span className="text-base w-5 text-center">{FLAG_MAP[c.country] ?? '🌍'}</span>
                <span className="text-[11px] text-gray-300 flex-1">{c.country}</span>
                <div className="w-24 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.07 }}
                  />
                </div>
                <span className="text-[11px] font-bold text-white w-8 text-right">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Cities */}
      {!compact && topCities.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Top Cities
          </p>
          <div className="flex flex-wrap gap-2">
            {topCities.slice(0, 6).map(c => (
              <div key={c.city}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-gray-300">{c.city}</span>
                <span className="text-cyan-400 font-bold">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Interests */}
      {audienceInterests.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 font-semibold">Audience Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {audienceInterests.map(interest => (
              <span key={interest}
                className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Income Segment */}
      {incomeSegment && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[11px] text-gray-500">Income Segment</span>
          <span className="text-[11px] font-semibold text-amber-400">{incomeSegment}</span>
        </div>
      )}
    </div>
  );
}
