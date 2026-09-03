'use client';
// ============================================================
// Creator Nest — Admin Master Creator Profile View
// src/app/admin/creators/[id]/page.tsx
// Single Source of Truth: public.creator_roster
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Edit2, Sparkles, MapPin, Mail, Phone,
  Globe, CheckCircle2, Video, Camera, TrendingUp, RefreshCw, Link2, EyeOff
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { mapDbRowToCreator, CREATOR_TIERS, getCreatorSlug } from '@/types/creator';
import type { IntelligentCreator, CreatorTier } from '@/types/creator';
import { allCreators as staticCreators } from '@/app/creators/roster/rosterData';
import ScoreCard from '@/components/creator/ScoreCard';
import SyncStatus from '@/components/creator/SyncStatus';
import RateCard from '@/components/creator/RateCard';
import AudienceChart from '@/components/creator/AudienceChart';
import ProfileCompleteness from '@/components/creator/ProfileCompleteness';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreatorMasterProfileView() {
  const params    = useParams();
  const router    = useRouter();
  const creatorId = params.id as string;

  const [creator, setCreator] = useState<Partial<IntelligentCreator> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const rawParam = decodeURIComponent(creatorId);
      const cleanHandle = rawParam.replace(/^@/, '');

      // 1. Try ID match
      let { data, error } = await supabase
        .from('creator_roster')
        .select('*')
        .eq('id', rawParam)
        .maybeSingle();

      // 2. Try handle / display_name match
      if (!data) {
        const { data: handleMatch } = await supabase
          .from('creator_roster')
          .select('*')
          .or(`youtube_handle.ilike.%${cleanHandle}%,insta_handle.ilike.%${cleanHandle}%,display_name.ilike.%${cleanHandle}%`)
          .limit(1)
          .maybeSingle();
        if (handleMatch) data = handleMatch;
      }

      if (data) {
        const mapped = mapDbRowToCreator(data);
        
        // Fetch social accounts
        try {
          const accountsRes = await fetch(`/api/creator/social-accounts?creatorId=${data.id}`);
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            mapped.social_accounts = accountsData.accounts || [];
          }
        } catch (e) {
          console.warn('Failed to fetch social accounts:', e);
        }

        setCreator(mapped);
      } else {
        const staticItem = staticCreators.find(c => 
          String(c.id) === rawParam ||
          (c.name && c.name.toLowerCase().replace(/\s+/g, '') === cleanHandle.toLowerCase()) ||
          c.name === rawParam
        ) || staticCreators[0];

        setCreator(mapDbRowToCreator({
          id:                   staticItem?.id ?? rawParam,
          name:                 staticItem?.name || `Creator ${rawParam}`,
          full_name:            staticItem?.name || `Creator ${rawParam}`,
          channel_name:         staticItem?.channelName || '',
          display_name:         `@${(staticItem?.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          tagline:              staticItem?.bio?.split('.')[0] ?? 'Top content creator',
          bio:                  staticItem?.bio ?? 'Creator producing viral content across platforms.',
          profile_photo_url:    staticItem?.img ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
          img:                  staticItem?.img ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
          cover_photo_url:      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
          location:             staticItem?.location ?? 'Mumbai',
          location_city:        staticItem?.location ?? 'Mumbai',
          primary_category:     staticItem?.niche ?? 'Technology',
          primary_niche:        staticItem?.niche ?? 'Technology',
          youtube_subscribers:  staticItem?.youtubeNum ?? 1200000,
          instagram_followers:  staticItem?.instaNum ?? 450000,
          total_reach:          (staticItem?.youtubeNum ?? 1200000) + (staticItem?.instaNum ?? 450000),
          engagement_rate:      5.2,
          business_email:       `collabs@creatornest.in`,
          crm_status:           'Active',
          creator_score:        88,
          creator_tier:         'macro',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [creatorId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B0F14]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center text-gray-400 mt-20">Creator master profile not found.</div>
    );
  }

  const photo = creator.profile_photo_url || creator.cover_photo_url || '';
  const tier  = CREATOR_TIERS[creator.creator_tier ?? 'micro'] ?? CREATOR_TIERS.micro;

  return (
    <div className="space-y-8 pb-20 bg-[#0B0F14] min-h-screen text-white">
      {/* Top Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5">
        {creator.cover_photo_url && (
          <div className="h-44 w-full relative">
            <Image src={creator.cover_photo_url} alt="Cover Banner" fill className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] to-transparent" />
          </div>
        )}

        <div className="p-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 md:-mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-[#0B0F14] bg-white/10 shadow-2xl flex-shrink-0">
              {photo ? (
                <Image src={photo} alt={creator.full_name ?? 'Creator'} fill className="object-cover" sizes="112px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-cyan-400">
                  {(creator.full_name ?? 'C')[0]}
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-white">{creator.full_name}</h1>
                {creator.is_verified_creator && <Sparkles className="w-4 h-4 text-cyan-400" />}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border"
                  style={{ background: tier.bg, color: tier.color, borderColor: `${tier.color}40` }}>
                  {tier.label.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {(creator.channel_name || (creator as any).channelName) ? `${creator.channel_name || (creator as any).channelName} • ` : ''}
                {creator.display_name} • {creator.primary_category} ({creator.primary_niche || creator.niche})
              </p>
              {creator.tagline && <p className="text-xs text-cyan-300/90 mt-1 italic">"{creator.tagline}"</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
            <button onClick={() => router.push('/admin/creators')} className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors" title="Back to Roster">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const slug = getCreatorSlug(creator);
                const link = `${window.location.origin}/admin/creators/${encodeURIComponent(slug)}`;
                navigator.clipboard.writeText(link);
                alert(`Master Profile Link copied to clipboard!\n${link}`);
              }}
              className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 font-bold px-4 py-3 rounded-xl flex items-center space-x-2 transition-all"
              title="Copy Master Profile Link"
            >
              <Link2 className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
            <Link
              href={`/admin/creators/${encodeURIComponent(getCreatorSlug(creator))}/edit`}
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black px-6 py-3 rounded-xl flex items-center space-x-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Master Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left 2 Columns: Profile Details ─────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Reach</p>
              <p className="text-xl font-black text-white mt-1">{((creator.total_reach ?? 0)/1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">YouTube Subs</p>
              <p className="text-xl font-black text-red-400 mt-1">{((creator.youtube_subscribers ?? 0)/1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Instagram Followers</p>
              <p className="text-xl font-black text-pink-400 mt-1">{((creator.instagram_followers ?? 0)/1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Engagement Rate</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{creator.engagement_rate ?? 4.8}%</p>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Creator Overview</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{creator.bio}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs text-gray-400">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /> {creator.location_city || creator.location || 'India'}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-400" /> {creator.business_email || 'Not specified'}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-400" /> {creator.contact_phone || creator.whatsapp_number || 'Not specified'}</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /> {creator.primary_language || 'Hindi'}</div>
            </div>
          </div>

          {/* ── Private Admin Contact Info ── */}
          {(() => {
            const hasPrivate = [
              creator.private_business_email,
              creator.private_contact_phone_1,
              creator.private_contact_phone_2,
              creator.private_whatsapp_number,
              creator.private_instagram_dm_handle,
              creator.private_twitter_dm_handle,
              creator.private_linkedin_dm_handle,
              creator.private_telegram_handle,
              creator.private_snapchat_handle,
              creator.private_discord_handle,
              creator.private_facebook_page_url,
              creator.private_youtube_community_url,
              creator.private_contact_notes,
            ].some(v => v && String(v).trim());
            if (!hasPrivate) return null;
            return (
              <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-amber-300">
                  <EyeOff className="w-4 h-4" />
                  Private Contact Info
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 font-black tracking-widest">ADMIN ONLY</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
                  {creator.private_business_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-gray-400 mr-1">Biz Email:</span>
                      <a href={`mailto:${creator.private_business_email}`} className="text-amber-300 hover:underline truncate">{creator.private_business_email}</a>
                    </div>
                  )}
                  {creator.private_contact_phone_1 && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-gray-400 mr-1">Phone 1:</span>
                      <a href={`tel:${creator.private_contact_phone_1}`} className="text-amber-300 hover:underline">{creator.private_contact_phone_1}</a>
                    </div>
                  )}
                  {creator.private_contact_phone_2 && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-gray-400 mr-1">Phone 2:</span>
                      <a href={`tel:${creator.private_contact_phone_2}`} className="text-amber-300 hover:underline">{creator.private_contact_phone_2}</a>
                    </div>
                  )}
                  {creator.private_whatsapp_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 flex-shrink-0">💬</span>
                      <span className="text-gray-400 mr-1">WhatsApp:</span>
                      <a href={`https://wa.me/${creator.private_whatsapp_number.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">{creator.private_whatsapp_number}</a>
                    </div>
                  )}
                  {creator.private_instagram_dm_handle && (
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400 flex-shrink-0 text-[11px] font-bold">IG</span>
                      <span className="text-gray-400 mr-1">Instagram DM:</span>
                      <a href={`https://instagram.com/${creator.private_instagram_dm_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">{creator.private_instagram_dm_handle}</a>
                    </div>
                  )}
                  {creator.private_twitter_dm_handle && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 flex-shrink-0 text-[11px] font-bold">𝕏</span>
                      <span className="text-gray-400 mr-1">Twitter DM:</span>
                      <a href={`https://twitter.com/${creator.private_twitter_dm_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">{creator.private_twitter_dm_handle}</a>
                    </div>
                  )}
                  {creator.private_linkedin_dm_handle && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 flex-shrink-0 text-[11px] font-bold">in</span>
                      <span className="text-gray-400 mr-1">LinkedIn:</span>
                      <a href={`https://linkedin.com/${creator.private_linkedin_dm_handle.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">{creator.private_linkedin_dm_handle}</a>
                    </div>
                  )}
                  {creator.private_telegram_handle && (
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 flex-shrink-0 text-[11px] font-bold">TG</span>
                      <span className="text-gray-400 mr-1">Telegram:</span>
                      <a href={`https://t.me/${creator.private_telegram_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">{creator.private_telegram_handle}</a>
                    </div>
                  )}
                  {creator.private_snapchat_handle && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 flex-shrink-0 text-[11px] font-bold">SC</span>
                      <span className="text-gray-400 mr-1">Snapchat:</span>
                      <span className="text-amber-300">{creator.private_snapchat_handle}</span>
                    </div>
                  )}
                  {creator.private_discord_handle && (
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 flex-shrink-0 text-[11px] font-bold">DC</span>
                      <span className="text-gray-400 mr-1">Discord:</span>
                      <span className="text-amber-300">{creator.private_discord_handle}</span>
                    </div>
                  )}
                  {creator.private_facebook_page_url && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 flex-shrink-0 text-[11px] font-bold">FB</span>
                      <span className="text-gray-400 mr-1">Facebook:</span>
                      <a href={creator.private_facebook_page_url} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline truncate">{creator.private_facebook_page_url}</a>
                    </div>
                  )}
                  {creator.private_youtube_community_url && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 flex-shrink-0 text-[11px] font-bold">YT</span>
                      <span className="text-gray-400 mr-1">YT Community:</span>
                      <a href={creator.private_youtube_community_url} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline truncate">{creator.private_youtube_community_url}</a>
                    </div>
                  )}
                </div>
                {creator.private_contact_notes && (
                  <div className="pt-3 border-t border-amber-500/15">
                    <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider mb-1">Admin Notes</p>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{creator.private_contact_notes}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Linked Channels (Multi-Channel Support) */}
          {creator.social_accounts && creator.social_accounts.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Linked Channels & Accounts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {creator.social_accounts.map((acc: any) => (
                  <a
                    key={acc.id}
                    href={acc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        {acc.platform === 'youtube' && <span className="text-red-400">▶</span>}
                        {acc.platform === 'instagram' && <span className="text-pink-400">📸</span>}
                        {acc.platform === 'tiktok' && <span className="text-white">🎵</span>}
                        {acc.platform === 'twitter' && <span className="text-blue-400">🐦</span>}
                        {acc.platform === 'linkedin' && <span className="text-blue-500">in</span>}
                        <span className="capitalize">{acc.platform}</span>
                        {acc.is_primary && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[9px] uppercase tracking-wider ml-1">Primary</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5">{acc.handle}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{acc.followers >= 1000000 ? `${(acc.followers/1000000).toFixed(1)}M` : acc.followers >= 1000 ? `${(acc.followers/1000).toFixed(0)}K` : acc.followers}</p>
                      <p className="text-[10px] text-gray-500">Followers</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rate Card Component */}
          <RateCard
            rates={{
              rate_dedicated_video:  creator.rate_dedicated_video,
              rate_integrated_video: creator.rate_integrated_video,
              rate_youtube_short:    creator.rate_youtube_short,
              rate_ig_reel:          creator.rate_ig_reel,
              rate_ig_story_set:     creator.rate_ig_story_set,
              rate_package_bundle:   creator.rate_package_bundle,
              rate_negotiable:       creator.rate_negotiable,
              barter_collab_open:    creator.barter_collab_open,
            }}
          />

          {/* Audience Chart Component */}
          <AudienceChart
            genderMale={creator.audience_gender_male ?? 50}
            genderFemale={creator.audience_gender_female ?? 50}
            age1824={creator.audience_age_18_24 ?? 40}
            age2534={creator.audience_age_25_34 ?? 35}
            indiaPct={creator.audience_india_pct ?? 85}
          />
        </div>

        {/* ── Right Column: Master Intelligence Sidebar ──────── */}
        <div className="space-y-6">
          <ScoreCard
            creatorScore={creator.creator_score ?? 85}
            creatorTier={creator.creator_tier ?? 'micro'}
            influenceScore={creator.influence_score ?? 80}
            authenticityScore={creator.authenticity_score ?? 90}
            growthVelocity={creator.growth_velocity ?? 'Stable'}
            totalReach={creator.total_reach ?? 1000000}
          />

          <ProfileCompleteness creator={creator} />

          <SyncStatus
            creatorId={creator.id || creatorId}
            autoSyncEnabled={creator.auto_sync_enabled ?? true}
            lastApiSync={creator.last_api_sync}
            dataSource={creator.data_source}
            aiLastEnriched={creator.ai_last_enriched}
            syncErrorLog={creator.sync_error_log}
            onSyncComplete={fetchProfile}
          />
        </div>
      </div>
    </div>
  );
}
