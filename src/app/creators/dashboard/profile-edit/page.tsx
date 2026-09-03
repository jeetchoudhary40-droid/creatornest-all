'use client';
// ============================================================
// Creator Nest — Creator Self-Update Profile Form
// src/app/creators/dashboard/profile-edit/page.tsx
// Creator-facing form — limited fields (no admin-only data)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, CheckCircle2, Loader2, AlertCircle,
  User, Tag, Smartphone, DollarSign, TrendingUp, Globe
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { mapDbRowToCreator, NICHE_TAXONOMY, CONTENT_FORMATS, CONTENT_STYLES, calculateCompleteness } from '@/types/creator';
import type { IntelligentCreator } from '@/types/creator';
import { allCreators } from '@/app/creators/roster/rosterData';
import ProfileCompleteness from '@/components/creator/ProfileCompleteness';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Creator-visible tabs (subset of admin 8-tab — no admin-only fields)
const TABS = [
  { id: 'identity',   label: 'Identity',  icon: User       },
  { id: 'niche',      label: 'Niche',     icon: Tag        },
  { id: 'platforms',  label: 'Platforms', icon: Smartphone },
  { id: 'rates',      label: 'Rates',     icon: DollarSign },
  { id: 'strategy',   label: 'Strategy',  icon: TrendingUp },
  { id: 'contact',    label: 'Contact',   icon: Globe      },
];

// ── Reusable field components ─────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-300">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-500">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none bg-white/5 border border-white/10 focus:border-cyan-500/50 transition-colors";
const selectCls = "w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10 focus:border-cyan-500/50 appearance-none transition-colors";

function Input({ value, onChange, placeholder, type = 'text' }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />;
}
function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} resize-none`} />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
      {options.map(o => <option key={o.value} value={o.value} style={{ background: '#0B0F14' }}>{o.label}</option>)}
    </select>
  );
}
function NumberInput({ value, onChange, prefix = '₹', placeholder }: { value: number; onChange: (v: number) => void; prefix?: string; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-white/5 border border-white/10 focus-within:border-cyan-500/50 transition-colors">
      <span className="text-gray-500 text-xs flex-shrink-0">{prefix}</span>
      <input type="number" value={value || ''} onChange={e => onChange(Number(e.target.value))} placeholder={placeholder ?? '0'} className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1" />
    </div>
  );
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0" style={{ background: checked ? '#00F2FE' : 'rgba(255,255,255,0.1)' }} onClick={() => onChange(!checked)}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: checked ? '22px' : '2px' }} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}
function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState(value.join(', '));
  return (
    <input type="text" value={text}
      onChange={e => { setText(e.target.value); onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean)); }}
      placeholder={placeholder ?? 'Comma-separated'} className={inputCls} />
  );
}

// ── Completeness Bar ──────────────────────────────────────────
function CompletenessBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="rounded-2xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white">Profile Strength</span>
        <span className="text-sm font-black" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
      </div>
      <p className="text-[10px] text-gray-500 mt-1.5">
        {pct < 50 ? 'Add more details to unlock AI insights' : pct < 80 ? 'Good — add rates and strategy to maximize discoverability' : 'Excellent! Your profile is highly discoverable'}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function CreatorProfileEdit() {
  const router = useRouter();

  const creatorId = typeof window !== 'undefined'
    ? (localStorage.getItem('creator_id') || '1')
    : '1';

  const [form,    setForm]    = useState<Partial<IntelligentCreator>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    const activeId = creatorId || '1';
    supabase.from('creator_roster').select('*').eq('id', activeId).single()
      .then(({ data }: { data: Record<string, unknown> | null }) => {
        if (data) {
          setForm(mapDbRowToCreator(data));
        } else {
          const staticItem = allCreators.find(c => String(c.id) === String(activeId)) || allCreators[0];
          setForm(mapDbRowToCreator({
            id: activeId,
            name: staticItem?.name || 'Samir J.',
            full_name: staticItem?.name || 'Samir J.',
            display_name: `@${(staticItem?.name || 'samirj').toLowerCase().replace(/\s+/g, '')}`,
            tagline: 'High-energy gaming streams & viral challenge videos',
            bio: staticItem?.bio || "India's top gaming creator known for high-energy streams.",
            niche: staticItem?.niche || 'Entertainment',
            primary_category: staticItem?.niche || 'Entertainment',
            primary_niche: 'Gaming & Streams',
            location_city: staticItem?.location || 'Hyderabad',
            img: staticItem?.img || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
            youtube_subscribers: staticItem?.youtubeNum || 4500000,
            instagram_followers: staticItem?.instaNum || 1200000,
            total_reach: 5700000,
            engagement_rate: 5.2,
            business_email: 'samir@creatornest.in',
            rate_dedicated_video: 150000,
            rate_ig_reel: 60000,
            rate_youtube_short: 45000,
            rate_negotiable: true,
            open_to_collab: true,
          }));
        }
        setLoading(false);
      });
  }, [creatorId]);

  const set = useCallback(<K extends keyof IntelligentCreator>(key: K, val: IntelligentCreator[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = async () => {
    if (!creatorId) return;
    setSaving(true); setError('');
    try {
      // Only send creator-allowed fields — never send admin-only fields
      const allowedFields: (keyof IntelligentCreator)[] = [
        'full_name','channel_name','display_name','tagline','bio','profile_photo_url','cover_photo_url',
        'location_city','location_state','location_country','primary_language','content_language','timezone',
        'primary_category','primary_niche','secondary_niche','niche_tags','content_formats',
        'content_style','content_tone','upload_frequency','content_pillars',
        'brand_categories','brand_categories_blacklist','best_posting_day','best_posting_time',
        'youtube_url','youtube_handle','youtube_channel_id',
        'insta_url','insta_handle','tiktok_url','tiktok_handle',
        'twitter_url','twitter_handle','linkedin_url','linkedin_handle',
        'podcast_url','newsletter_url','website_url','primary_platform',
        'rate_dedicated_video','rate_integrated_video','rate_youtube_short',
        'rate_ig_reel','rate_ig_story_set','rate_package_bundle','rate_ambassador_monthly',
        'rate_negotiable','barter_collab_open','barter_min_value','open_to_collab',
        'collab_lead_time_days','media_kit_url','preferred_collab_type',
        'strategy_goals','seasonal_peak_months','content_gap_notes',
        'business_email','contact_phone','whatsapp_number','preferred_contact_method',
      ];

      const safeFields = Object.fromEntries(
        allowedFields.filter(k => form[k] !== undefined).map(k => [k, form[k]])
      );

      const res = await fetch('/api/creator/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, fields: safeFields, updatedBy: 'creator_self', source: 'Manual' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const completeness = calculateCompleteness(form);
  const niches = NICHE_TAXONOMY[form.primary_category ?? ''] ?? [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F14' }}>
      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
    </div>
  );

  const tabs: Record<string, React.ReactNode> = {

    identity: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Full Name"><Input value={form.full_name ?? ''} onChange={v => set('full_name', v)} placeholder="Your full name" /></Field>
        <Field label="Channel Name"><Input value={form.channel_name ?? ''} onChange={v => set('channel_name', v)} placeholder="Channel name (e.g. Election Guide)" /></Field>
        <Field label="Display Name / Handle"><Input value={form.display_name ?? ''} onChange={v => set('display_name', v)} placeholder="@yourhandle" /></Field>
        <Field label="Your Tagline" hint="One line that describes you best">
          <Input value={form.tagline ?? ''} onChange={v => set('tagline', v)} placeholder="Making tech simple for India" />
        </Field>
        <Field label="Primary Language">
          <Select value={form.primary_language ?? 'Hindi'} onChange={v => set('primary_language', v)} options={[
            { value: 'Hindi', label: 'Hindi' }, { value: 'English', label: 'English' },
            { value: 'Hindi-English', label: 'Hindi-English Mix' }, { value: 'Tamil', label: 'Tamil' },
            { value: 'Telugu', label: 'Telugu' }, { value: 'Kannada', label: 'Kannada' },
            { value: 'Malayalam', label: 'Malayalam' }, { value: 'Bengali', label: 'Bengali' },
          ]} />
        </Field>
        <Field label="Bio (Public)" hint="What brands and followers see">
          <Textarea value={form.bio ?? ''} onChange={v => set('bio', v)} placeholder="Your creator story..." rows={4} />
        </Field>
        <Field label="Profile Photo URL"><Input value={form.profile_photo_url ?? ''} onChange={v => set('profile_photo_url', v)} placeholder="https://..." /></Field>
        <Field label="Cover/Banner Photo URL"><Input value={form.cover_photo_url ?? ''} onChange={v => set('cover_photo_url', v)} placeholder="https://..." /></Field>
        <Field label="City"><Input value={form.location_city ?? ''} onChange={v => set('location_city', v)} placeholder="Mumbai" /></Field>
      </div>
    ),

    niche: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Primary Category">
          <Select value={form.primary_category ?? ''} onChange={v => { set('primary_category', v); set('primary_niche', ''); }}
            options={[{ value: '', label: 'Select category' }, ...Object.keys(NICHE_TAXONOMY).map(k => ({ value: k, label: k }))]} />
        </Field>
        <Field label="Primary Niche">
          <Select value={form.primary_niche ?? ''} onChange={v => set('primary_niche', v)}
            options={[{ value: '', label: niches.length ? 'Select niche' : 'Pick category first' }, ...niches.map(n => ({ value: n, label: n }))]} />
        </Field>
        <Field label="Niche Tags" hint="Up to 10, comma-separated">
          <TagsInput value={form.niche_tags ?? []} onChange={v => set('niche_tags', v)} placeholder="tech review, unboxing, hindi" />
        </Field>
        <Field label="Content Style">
          <Select value={form.content_style ?? ''} onChange={v => set('content_style', v)}
            options={[{ value: '', label: 'Select style' }, ...CONTENT_STYLES.map(s => ({ value: s, label: s }))]} />
        </Field>
        <Field label="Upload Frequency">
          <Select value={form.upload_frequency ?? ''} onChange={v => set('upload_frequency', v)} options={[
            { value: '', label: 'Select' }, { value: 'Daily', label: 'Daily' },
            { value: '3 videos/week', label: '3 videos/week' }, { value: '2 videos/week', label: '2 videos/week' },
            { value: '1 video/week', label: '1 video/week' }, { value: 'Bi-weekly', label: 'Bi-weekly' },
          ]} />
        </Field>
        <Field label="Content Pillars" hint="Your main recurring topics">
          <TagsInput value={form.content_pillars ?? []} onChange={v => set('content_pillars', v)} placeholder="Reviews, Tips, Vlogs" />
        </Field>
        <Field label="Brands You Accept" hint="Brand categories you're open to">
          <TagsInput value={form.brand_categories ?? []} onChange={v => set('brand_categories', v)} placeholder="Tech, Finance, EdTech" />
        </Field>
        <Field label="Brand Blacklist" hint="Categories you won't promote">
          <TagsInput value={form.brand_categories_blacklist ?? []} onChange={v => set('brand_categories_blacklist', v)} placeholder="Alcohol, Gambling" />
        </Field>
      </div>
    ),

    platforms: (
      <div className="space-y-6">
        <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="text-sm font-bold text-red-400">🎬 YouTube</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Channel URL"><Input value={form.youtube_url ?? ''} onChange={v => set('youtube_url', v)} placeholder="https://youtube.com/@..." /></Field>
            <Field label="Your Handle"><Input value={form.youtube_handle ?? ''} onChange={v => set('youtube_handle', v)} placeholder="@YourHandle" /></Field>
            <Field label="Channel ID" hint="Paste your UC... ID for auto-sync">
              <Input value={form.youtube_channel_id ?? ''} onChange={v => set('youtube_channel_id', v)} placeholder="UCxxxxx" />
            </Field>
          </div>
        </div>
        <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)' }}>
          <p className="text-sm font-bold text-pink-400">📸 Instagram</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Profile URL"><Input value={form.insta_url ?? ''} onChange={v => set('insta_url', v)} placeholder="https://instagram.com/..." /></Field>
            <Field label="Handle"><Input value={form.insta_handle ?? ''} onChange={v => set('insta_handle', v)} placeholder="@handle" /></Field>
          </div>
        </div>
        <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <p className="text-sm font-bold text-gray-300">Other Platforms</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Twitter/X Handle"><Input value={form.twitter_handle ?? ''} onChange={v => set('twitter_handle', v)} placeholder="@handle" /></Field>
            <Field label="LinkedIn Handle"><Input value={form.linkedin_handle ?? ''} onChange={v => set('linkedin_handle', v)} placeholder="username" /></Field>
            <Field label="TikTok Handle"><Input value={form.tiktok_handle ?? ''} onChange={v => set('tiktok_handle', v)} placeholder="@handle" /></Field>
            <Field label="Website"><Input value={form.website_url ?? ''} onChange={v => set('website_url', v)} placeholder="https://yoursite.com" /></Field>
            <Field label="Newsletter URL"><Input value={form.newsletter_url ?? ''} onChange={v => set('newsletter_url', v)} placeholder="https://substack.com/..." /></Field>
            <Field label="Podcast URL"><Input value={form.podcast_url ?? ''} onChange={v => set('podcast_url', v)} placeholder="https://..." /></Field>
          </div>
        </div>
      </div>
    ),

    rates: (
      <div className="space-y-5">
        <div className="p-3 rounded-xl text-xs text-gray-400"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          💰 Set your rates in Indian Rupees (₹). Leave 0 if you don't offer that format. Brands see this on your profile.
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Dedicated YT Video"><NumberInput value={form.rate_dedicated_video ?? 0} onChange={v => set('rate_dedicated_video', v)} /></Field>
          <Field label="Integrated YT Video"><NumberInput value={form.rate_integrated_video ?? 0} onChange={v => set('rate_integrated_video', v)} /></Field>
          <Field label="YouTube Short"><NumberInput value={form.rate_youtube_short ?? 0} onChange={v => set('rate_youtube_short', v)} /></Field>
          <Field label="Instagram Reel"><NumberInput value={form.rate_ig_reel ?? 0} onChange={v => set('rate_ig_reel', v)} /></Field>
          <Field label="IG Story Set (3–5)"><NumberInput value={form.rate_ig_story_set ?? 0} onChange={v => set('rate_ig_story_set', v)} /></Field>
          <Field label="Multi-Platform Bundle"><NumberInput value={form.rate_package_bundle ?? 0} onChange={v => set('rate_package_bundle', v)} /></Field>
          <Field label="Brand Ambassador /mo"><NumberInput value={form.rate_ambassador_monthly ?? 0} onChange={v => set('rate_ambassador_monthly', v)} /></Field>
          <Field label="Barter Min Value ₹" hint="Min product value for barter"><NumberInput value={form.barter_min_value ?? 0} onChange={v => set('barter_min_value', v)} /></Field>
        </div>
        <div className="space-y-3 pt-2 border-t border-white/5">
          <Toggle checked={form.rate_negotiable ?? true} onChange={v => set('rate_negotiable', v)} label="My rates are negotiable" />
          <Toggle checked={form.barter_collab_open ?? false} onChange={v => set('barter_collab_open', v)} label="Open to barter collaborations" />
          <Toggle checked={form.open_to_collab ?? true} onChange={v => set('open_to_collab', v)} label="Currently accepting brand deals" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lead Time Needed (days)" hint="How many days to deliver">
            <NumberInput value={form.collab_lead_time_days ?? 14} onChange={v => set('collab_lead_time_days', v)} prefix="~" />
          </Field>
          <Field label="Media Kit URL"><Input value={form.media_kit_url ?? ''} onChange={v => set('media_kit_url', v)} placeholder="https://drive.google.com/..." /></Field>
        </div>
      </div>
    ),

    strategy: (
      <div className="space-y-5">
        <Field label="My Creator Goals" hint="What do you want to achieve in the next 6–12 months?">
          <TagsInput value={form.strategy_goals ?? []} onChange={v => set('strategy_goals', v)} placeholder="Grow to 5M, Launch course, Podcast" />
        </Field>
        <Field label="Seasonal Peak Months" hint="When does your content perform best?">
          <TagsInput value={form.seasonal_peak_months ?? []} onChange={v => set('seasonal_peak_months', v)} placeholder="Oct, Nov, Dec" />
        </Field>
        <Field label="Best Day to Post">
          <Select value={form.best_posting_day ?? ''} onChange={v => set('best_posting_day', v)} options={[
            { value: '', label: 'Not sure' },
            ...['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => ({ value: d, label: d }))
          ]} />
        </Field>
        <Field label="Best Time to Post"><Input value={form.best_posting_time ?? ''} onChange={v => set('best_posting_time', v)} placeholder="7:00 PM IST" /></Field>
        <Field label="My Best Performing Content Type">
          <Input value={form.best_performing_category ?? ''} onChange={v => set('best_performing_category', v)} placeholder="e.g. Unboxing Videos" />
        </Field>
        <Field label="Areas I Want to Improve" hint="Used by AI to generate better recommendations">
          <Textarea value={form.content_gap_notes ?? ''} onChange={v => set('content_gap_notes', v)} placeholder="I want to improve Shorts, start a podcast..." rows={3} />
        </Field>
      </div>
    ),

    contact: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Business Email" hint="For brand collaborations">
          <Input value={form.business_email ?? ''} onChange={v => set('business_email', v)} placeholder="collabs@youremail.com" />
        </Field>
        <Field label="WhatsApp Number">
          <Input value={form.whatsapp_number ?? ''} onChange={v => set('whatsapp_number', v)} placeholder="+91-9876543210" />
        </Field>
        <Field label="Phone Number">
          <Input value={form.contact_phone ?? ''} onChange={v => set('contact_phone', v)} placeholder="+91-9876543210" />
        </Field>
        <Field label="Preferred Contact Method">
          <Select value={form.preferred_contact_method ?? 'Email'} onChange={v => set('preferred_contact_method', v as IntelligentCreator['preferred_contact_method'])} options={[
            { value: 'Email', label: 'Email' }, { value: 'WhatsApp', label: 'WhatsApp' }, { value: 'Phone', label: 'Phone' },
          ]} />
        </Field>
        <Field label="Typical Response Time" hint="How fast do you usually reply?">
          <Select value={String(form.response_time_hrs ?? 24)} onChange={v => set('response_time_hrs', Number(v))} options={[
            { value: '2', label: 'Within 2 hours' }, { value: '6', label: 'Within 6 hours' },
            { value: '24', label: 'Within 24 hours' }, { value: '48', label: 'Within 48 hours' },
            { value: '72', label: 'Within 3 days' },
          ]} />
        </Field>
      </div>
    ),
  };

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0B0F14' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5" style={{ background: 'rgba(11,15,20,0.92)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white">Update My Profile</h1>
            <p className="text-[11px] text-gray-500">Your profile strength: {completeness}%</p>
          </div>
          <button onClick={handleSave} disabled={saving || !creatorId}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #00F2FE 0%, #0070F3 100%)', color: saved ? '#10B981' : '#0B0F14' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
        {/* Tab Nav */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all"
              style={{ color: activeTab === tab.id ? '#00F2FE' : '#6B7280', borderBottomColor: activeTab === tab.id ? '#00F2FE' : 'transparent' }}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {!creatorId && (
          <div className="p-4 rounded-xl text-sm text-amber-300 flex items-center gap-2"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Please log in to update your profile.
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl text-sm text-red-300 flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Completeness bar */}
        <CompletenessBar pct={completeness} />

        {/* Tab Form */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border p-6"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
            {tabs[activeTab]}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Save */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || !creatorId}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #00F2FE 0%, #0070F3 100%)', color: saved ? '#10B981' : '#0B0F14' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Changes Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
