// ============================================================
// Creator Nest — Social Account Types
// src/types/socialAccount.ts
// ============================================================

export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'other';

export interface SocialAccount {
  id?: string;
  creator_id: string;
  platform: PlatformType;
  handle: string;
  url: string;
  channel_id?: string;      // specific to YouTube
  followers: number;
  is_primary: boolean;
  stats_json?: Record<string, any>; // for storing extra analytics payload
  last_synced?: string;
  created_at?: string;
}
