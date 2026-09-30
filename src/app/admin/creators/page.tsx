'use client';
// ============================================================
// Creator Nest — Admin: Creator Management & YouTube Auto-Profiling
// /admin/creators
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Loader2,
  Save, Video, Camera, Check, Home, List, AlertTriangle,
  Upload, ImageIcon, Crop, Sparkles, CheckSquare, Square,
  Users, TrendingUp, DollarSign, Briefcase, Copy, Move,
  BarChart3, PieChart, MapPin, Globe, Filter, ChevronDown, ChevronUp, Key
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

// ── Strict Tech Niches & Categories (Matching Roster Page) ────
const TECH_NICHES = [
  'News & Media',
  'EdTech & App Reviews',
  'AI & Automation',
  'Mobile Apps Review',
  'SaaS & Cloud Tools',
  'Full-Stack & DevOps',
  'Tech & Gadgets',
  'FinTech & Growth',
  'Cybersecurity & Data',
];

const CREATOR_TIERS = ['nano', 'micro', 'mid', 'macro', 'mega', 'elite'] as const;

export type Creator = {
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
  location: string;
  avd: string;
  avgViewsLast10?: number | string;
  topGrowing: boolean;
  featured: boolean;
  rank: number;
  img: string;
  bio: string;
  show_on_home: boolean;
  show_on_roster: boolean;
  businessEmail: string;
  whatsappNumber: string;
  contactPhone: string;
  youtubeUrl: string;
  youtubeHandle: string;
  instaUrl: string;
  instaHandle: string;
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  admin_updated_img?: boolean;
  admin_img_updated_at?: string;

  // Extended YouTube & Engagement Stats
  engagementRate?: number;
  totalViews?: number;
  videoCount?: number;

  // Audience Demographics
  audience_india_pct?: number;
  audience_tier1_city_pct?: number;
  audience_top_countries?: { country: string; pct: number }[];
  audience_top_cities?: { city: string; pct: number }[];
  audience_age_13_17?: number;
  audience_age_18_24?: number;
  audience_age_25_34?: number;
  audience_age_35_44?: number;
  audience_age_45_plus?: number;
  audience_gender_male?: number;
  audience_gender_female?: number;
  audience_income_segment?: 'High' | 'Upper-Middle' | 'Middle' | 'Mass-Market';
  audience_interests?: string[];

  // Commercial Sponsorship Rates (INR ₹)
  deal_rate_dedicated_min?: number;
  deal_rate_dedicated_max?: number;
  deal_rate_integration_min?: number;
  deal_rate_integration_max?: number;
  deal_rate_short_min?: number;
  deal_rate_short_max?: number;
  brand_categories?: string[];
  ai_brand_fit_summary?: string;
  ai_growth_insight?: string;
  creator_score?: number;
  creator_tier?: 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | 'elite';
};

const EMPTY: Partial<Creator> = {
  name: '',
  channelName: '',
  niche: 'AI & Automation',
  niches: ['AI & Automation'],
  platform: 'Youtube',
  bio: '',
  img: '',
  youtubeNum: 0,
  instaNum: 0,
  location: 'India',
  avd: '70%',
  avgViewsLast10: 0,
  engagementRate: 0,
  topGrowing: false,
  featured: false,
  show_on_home: false,
  show_on_roster: true,
  businessEmail: '',
  whatsappNumber: '',
  contactPhone: '',
  youtubeUrl: '',
  youtubeHandle: '',
  instaUrl: '',
  instaHandle: '',
  linkedinUrl: '',
  twitterUrl: '',
  websiteUrl: '',
  // Audience Demographics Defaults
  audience_india_pct: 86,
  audience_tier1_city_pct: 60,
  audience_top_countries: [{ country: 'India', pct: 86 }, { country: 'United States', pct: 5 }],
  audience_top_cities: [{ city: 'Delhi NCR', pct: 24 }, { city: 'Mumbai', pct: 19 }, { city: 'Bengaluru', pct: 16 }],
  audience_age_13_17: 8,
  audience_age_18_24: 52,
  audience_age_25_34: 30,
  audience_age_35_44: 7,
  audience_age_45_plus: 3,
  audience_gender_male: 75,
  audience_gender_female: 25,
  audience_income_segment: 'Upper-Middle',
  audience_interests: ['Smartphones & Gadgets', 'AI Tools & Automation', 'Productivity & Software'],
  deal_rate_dedicated_min: 0,
  deal_rate_dedicated_max: 0,
  deal_rate_integration_min: 0,
  deal_rate_integration_max: 0,
  deal_rate_short_min: 0,
  deal_rate_short_max: 0,
  brand_categories: ['Consumer Tech', 'SaaS & Cloud Tools', 'EdTech & Upskilling'],
  ai_brand_fit_summary: '',
  creator_score: 70,
  creator_tier: 'micro',
};

function formatNum(n: number | string | undefined): string {
  const num = Number(n);
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
}

function formatInr(n: number | undefined): string {
  if (!n) return '0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${n.toLocaleString()}`;
}

// ── Interactive Image Crop & Framing Modal ────────────────────
function ImageCropModal({
  imageSrc,
  onCancel,
  onSaveCropped,
}: {
  imageSrc: string;
  onCancel: () => void;
  onSaveCropped: (croppedBlob: Blob) => void;
}) {
  const [zoom, setZoom] = useState(1.0);
  const [posY, setPosY] = useState(15);
  const [posX, setPosX] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({ x: 0, y: 0, posX: 50, posY: 15 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, posX, posY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = ((e.clientX - dragStartRef.current.x) / 300) * 100;
    const dy = ((e.clientY - dragStartRef.current.y) / 375) * 100;
    setPosX(Math.max(0, Math.min(100, dragStartRef.current.posX - dx)));
    setPosY(Math.max(0, Math.min(100, dragStartRef.current.posY - dy)));
  };

  const handleMouseUp = () => setIsDragging(false);

  const applyCrop = async () => {
    setIsProcessing(true);
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const targetWidth = 600;
      const targetHeight = 750;
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.fillStyle = '#06090F';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const naturalAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = targetWidth / targetHeight;

      let drawWidth, drawHeight;
      if (naturalAspect > targetAspect) {
        drawHeight = targetHeight * zoom;
        drawWidth = drawHeight * naturalAspect;
      } else {
        drawWidth = targetWidth * zoom;
        drawHeight = drawWidth / naturalAspect;
      }

      const offsetX = ((targetWidth - drawWidth) * posX) / 100;
      const offsetY = ((targetHeight - drawHeight) * posY) / 100;

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      canvas.toBlob(
        blob => {
          if (blob) {
            onSaveCropped(blob);
          } else {
            alert('Failed to generate image');
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.92
      );
    } catch (err: any) {
      alert('Error cropping image: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0D1117] border border-white/15 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Adjust Photo & Face Focus</h3>
              <p className="text-xs text-gray-400">Position the creator's face so it never gets cut off</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-6 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Card View (4:5)</span>
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-52 h-64 rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(0,242,254,0.25)] bg-[#06090F] cursor-grab active:cursor-grabbing select-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Framing preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-75 pointer-events-none"
                style={{
                  objectPosition: `${posX}% ${posY}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${posX}% ${posY}%`,
                }}
              />
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/15">
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-cyan-400/30 bg-cyan-400/[0.03]" />
                <div className="border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-white/10" />
                <div className="border-r border-white/10" />
                <div />
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-cyan-300 backdrop-blur-sm pointer-events-none">
                Drag to position
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Avatar View</span>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Avatar preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${posX}% ${posY}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${posX}% ${posY}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-gray-500 text-center max-w-[100px]">Leaderboard & Table preview</div>
          </div>
        </div>

        <div className="space-y-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Quick Presets:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setPosY(10); setPosX(50); setZoom(1.0); }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
              >
                ✨ Face Focus (Top)
              </button>
              <button
                type="button"
                onClick={() => { setPosY(50); setPosX(50); setZoom(1.0); }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => { setPosY(15); setPosX(50); setZoom(1.0); }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 hover:text-white"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5" /> Vertical Focus (Top vs Bottom)</span>
              <span className="text-cyan-400 font-mono font-bold">{posY <= 25 ? 'Top / Face' : posY >= 75 ? 'Bottom' : 'Middle'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={posY}
              onChange={e => setPosY(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Zoom Scale</span>
              <span className="text-cyan-400 font-mono font-bold">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            disabled={isProcessing}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Cropped Frame
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Interactive Image Upload ──────────────────────────────────
function ImageUpload({
  currentImg,
  onUploaded,
}: {
  currentImg: string;
  onUploaded: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  const handleSelectedFile = (file: File) => {
    setUploadError('');
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) setRawImageForCrop(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadBlob = async (blob: Blob) => {
    setRawImageForCrop(null);
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', blob, 'creator-profile.jpg');
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onUploaded(json.url);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {rawImageForCrop && (
        <ImageCropModal
          imageSrc={rawImageForCrop}
          onCancel={() => setRawImageForCrop(null)}
          onSaveCropped={uploadBlob}
        />
      )}

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.[0]) handleSelectedFile(e.dataTransfer.files[0]);
        }}
        className={`relative w-44 h-56 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
          dragging
            ? 'border-cyan-400 bg-cyan-400/10 scale-102'
            : currentImg
            ? 'border-white/20 hover:border-cyan-400/60'
            : 'border-dashed border-white/20 hover:border-cyan-400/50 hover:bg-white/[0.02]'
        }`}
      >
        {currentImg ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImg}
              alt="Profile photo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Crop className="w-6 h-6 text-cyan-300" />
              <span className="text-white text-xs font-bold">Adjust & Crop</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {uploading ? <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /> : <ImageIcon className="w-6 h-6 text-gray-500" />}
            </div>
            <div>
              <p className="text-white text-xs font-bold">{uploading ? 'Uploading...' : 'Upload & Crop Photo'}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">Click or drag & drop</p>
            </div>
          </div>
        )}

        {uploading && currentImg && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> {uploadError}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          if (e.target.files?.[0]) handleSelectedFile(e.target.files[0]);
        }}
      />

      <div className="w-full flex gap-1.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 py-2 rounded-xl text-xs font-bold border border-white/15 text-gray-300 hover:text-white hover:border-cyan-400/50 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          {currentImg ? 'Replace' : 'Upload'}
        </button>
        {currentImg && (
          <button
            type="button"
            onClick={() => setRawImageForCrop(currentImg)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all flex items-center gap-1"
            title="Re-adjust framing"
          >
            <Crop className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Multi-Niche Selector ──────────────────────────────────────
function NicheMultiSelect({
  selectedNiches,
  onChange,
}: {
  selectedNiches: string[];
  onChange: (niches: string[]) => void;
}) {
  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      if (selectedNiches.length > 1) {
        onChange(selectedNiches.filter(n => n !== niche));
      }
    } else {
      onChange([...selectedNiches, niche]);
    }
  };

  return (
    <div className="space-y-2 col-span-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Categories & Niches (Select Multiple for Brand Matching) <span className="text-cyan-400">*</span>
        </label>
        <span className="text-[10px] text-cyan-400 font-bold">{selectedNiches.length} Selected</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {TECH_NICHES.map(n => {
          const isSelected = selectedNiches.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggleNiche(n)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                  : 'bg-white/[0.03] text-gray-400 border border-white/10 hover:border-white/25 hover:text-gray-200'
              }`}
            >
              {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> : <Square className="w-3.5 h-3.5 text-gray-600" />}
              <span>{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Form Input Helpers ────────────────────────────────────────
function FL({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.06] transition-all ${
          prefix ? 'pl-9 pr-3' : 'px-3.5'
        }`}
      />
    </div>
  );
}

function FTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.06] transition-all resize-none"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

// ── Creator Form Modal (With YouTube Auto-Profiling & Tabbed View) ──
function CreatorForm({
  data,
  onChange,
  onSubmit,
  submitting,
  onClose,
  title,
  error,
}: {
  data: Partial<Creator>;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  submitting: boolean;
  onClose: () => void;
  title: string;
  error?: string;
}) {
  const [activeTab, setActiveTab] = useState<'profile' | 'youtube' | 'audience' | 'deals' | 'contact'>('profile');
  const [ytSearchQuery, setYtSearchQuery] = useState(data.youtubeUrl || data.youtubeHandle || '');
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedNiches = Array.isArray(data.niches) && data.niches.length > 0
    ? data.niches
    : (data.niche ? [data.niche] : ['AI & Automation']);

  const handleAutoProfile = async () => {
    if (!ytSearchQuery.trim()) {
      setProfileMsg({ type: 'error', text: 'Please enter a YouTube handle, URL, or channel ID.' });
      return;
    }
    setIsProfiling(true);
    setProfileMsg(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch('/api/admin/creators/auto-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: ytSearchQuery.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to auto-profile YouTube creator');

      const p = json.profile;
      // Auto-fill form
      onChange('name', p.name);
      onChange('channelName', p.channelName);
      onChange('youtubeUrl', p.youtubeUrl);
      onChange('youtubeHandle', p.youtubeHandle);
      onChange('youtube', p.youtube);
      onChange('youtubeNum', p.youtubeNum);
      onChange('avgViewsLast10', p.avgViewsLast10);
      onChange('engagementRate', p.engagementRate);
      onChange('totalViews', p.totalViews);
      onChange('videoCount', p.videoCount);
      onChange('niche', p.niche);
      onChange('niches', p.niches);
      onChange('location', p.location);
      onChange('bio', p.bio);
      if (p.img && (!data.img || !data.admin_updated_img)) onChange('img', p.img);
      if (p.businessEmail && !data.businessEmail) onChange('businessEmail', p.businessEmail);
      onChange('avd', p.avd);

      // Audience Demographics
      onChange('audience_india_pct', p.audience_india_pct);
      onChange('audience_tier1_city_pct', p.audience_tier1_city_pct);
      onChange('audience_top_countries', p.audience_top_countries);
      onChange('audience_top_cities', p.audience_top_cities);
      onChange('audience_age_13_17', p.audience_age_13_17);
      onChange('audience_age_18_24', p.audience_age_18_24);
      onChange('audience_age_25_34', p.audience_age_25_34);
      onChange('audience_age_35_44', p.audience_age_35_44);
      onChange('audience_age_45_plus', p.audience_age_45_plus);
      onChange('audience_gender_male', p.audience_gender_male);
      onChange('audience_gender_female', p.audience_gender_female);
      onChange('audience_income_segment', p.audience_income_segment);
      onChange('audience_interests', p.audience_interests);

      // Commercials
      onChange('deal_rate_dedicated_min', p.deal_rate_dedicated_min);
      onChange('deal_rate_dedicated_max', p.deal_rate_dedicated_max);
      onChange('deal_rate_integration_min', p.deal_rate_integration_min);
      onChange('deal_rate_integration_max', p.deal_rate_integration_max);
      onChange('deal_rate_short_min', p.deal_rate_short_min);
      onChange('deal_rate_short_max', p.deal_rate_short_max);
      onChange('brand_categories', p.brand_categories);
      onChange('ai_brand_fit_summary', p.ai_brand_fit_summary);
      onChange('ai_growth_insight', p.ai_growth_insight);
      onChange('creator_score', p.creator_score);
      onChange('creator_tier', p.creator_tier);

      setProfileMsg({
        type: 'success',
        text: `🎉 Auto-profiled "${p.channelName}"! Verified ${p.youtube} subscribers, ${p.avgViewsLast10.toLocaleString()} avg views, ${p.engagementRate}% ER, & audience pricing populated.`
      });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Auto-profiling error.' });
    } finally {
      setIsProfiling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-[#0d1117] border border-white/10 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0 bg-[#0A0E14]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {title}
                {data.creator_tier && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {data.creator_tier} Tier
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">Master profiling & brand deal intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ⚡ One-Click YouTube Auto-Profiling Top Bar */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-red-950/40 via-purple-950/30 to-[#0A0E14] border-b border-white/10 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white shrink-0">
              <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                <YouTubeIcon className="w-4 h-4 text-red-500" />
              </div>
              <span className="hidden md:inline">Auto-Profile via YouTube:</span>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={ytSearchQuery}
                onChange={e => setYtSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAutoProfile(); } }}
                placeholder="Paste YouTube handle (@channel), channel link, or channel ID..."
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-3.5 pr-24 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400/80 transition-colors"
              />
              <button
                type="button"
                onClick={handleAutoProfile}
                disabled={isProfiling || !ytSearchQuery.trim()}
                className="absolute right-1 top-1 bottom-1 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProfiling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isProfiling ? 'Fetching...' : '⚡ Auto-Profile'}
              </button>
            </div>
          </div>

          {/* Profile Status Messages */}
          {profileMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2.5 px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}
            >
              <span>{profileMsg.text}</span>
              <button type="button" onClick={() => setProfileMsg(null)} className="text-gray-400 hover:text-white ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-white/8 bg-[#0B0F15] overflow-x-auto">
          {[
            { id: 'profile', label: '1. Identity & Niches', icon: Users },
            { id: 'youtube', label: '2. YouTube Stats', icon: YouTubeIcon },
            { id: 'audience', label: '3. Audience Demographics', icon: PieChart },
            { id: 'deals', label: '4. Brand Deals & Rates', icon: DollarSign },
            { id: 'contact', label: '5. Contact & Socials', icon: Briefcase },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer select-none ${
                  active
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-400/[0.04]'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Profile & Niches */}
          {activeTab === 'profile' && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo Upload with interactive framing */}
              <div className="w-full md:w-56 flex-shrink-0 flex flex-col items-center">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2.5">Profile Photo (4:5)</p>
                <ImageUpload
                  currentImg={data.img || ''}
                  onUploaded={url => onChange('img', url)}
                />
              </div>

              {/* Identity Form */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FL label="Creator Full Name *">
                    <FInput value={data.name || ''} onChange={v => onChange('name', v)} placeholder="e.g. Jeet Choudhary" />
                  </FL>

                  <FL label="Channel Name *">
                    <FInput value={data.channelName || ''} onChange={v => onChange('channelName', v)} placeholder="e.g. Election Guide" />
                  </FL>

                  <NicheMultiSelect
                    selectedNiches={selectedNiches}
                    onChange={niches => {
                      onChange('niches', niches);
                      onChange('niche', niches[0] || 'AI & Automation');
                    }}
                  />

                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Target Location & Indian City/State Focus (Manual & Hyperlocal) <span className="text-cyan-400">*</span>
                      </label>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {data.location && data.location !== 'India' && data.location !== 'Pan-India'
                          ? '📍 Hyperlocal / Regional Creator'
                          : '🌐 Nationwide / Pan-India'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <FInput
                          value={data.location || ''}
                          onChange={v => onChange('location', v)}
                          placeholder="e.g. Churu, Rajasthan or Jaipur or Delhi NCR or Pan-India"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onChange('location', 'Pan-India');
                          onChange('audience_top_cities', [
                            { city: 'Delhi NCR', pct: 24 },
                            { city: 'Mumbai', pct: 19 },
                            { city: 'Bengaluru', pct: 16 },
                            { city: 'Pune', pct: 9 },
                            { city: 'Hyderabad', pct: 8 },
                          ]);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                          data.location === 'Pan-India' || data.location === 'India'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                        }`}
                      >
                        🌐 Pan-India
                      </button>
                    </div>

                    {/* Quick Indian City Presets */}
                    <div className="space-y-1.5 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-semibold">Quick Indian City Presets (Click to set location & audience split):</span>
                        <span className="text-cyan-400 text-[10px]">Shortlist for Local Brand Deals</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Churu, Rajasthan',
                          'Jaipur, Rajasthan',
                          'Delhi NCR',
                          'Mumbai',
                          'Bengaluru',
                          'Pune',
                          'Lucknow, UP',
                          'Indore, MP',
                          'Patna, Bihar',
                          'Ahmedabad',
                          'Hyderabad',
                          'Chandigarh',
                        ].map(city => {
                          const isSelected = data.location === city;
                          return (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                onChange('location', city);
                                const cityName = city.split(',')[0].trim();
                                const stateName = city.split(',')[1]?.trim() || '';
                                onChange('audience_top_cities', [
                                  { city: cityName, pct: 48 },
                                  ...(stateName ? [{ city: stateName + ' (Regional)', pct: 28 }] : []),
                                  { city: 'Delhi NCR', pct: 14 },
                                  { city: 'Other Cities', pct: 10 },
                                ]);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_8px_rgba(0,242,254,0.2)]'
                                  : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-200'
                              }`}
                            >
                              📍 {city}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <FL label="Avg View Duration (AVD)" full>
                    <FInput value={data.avd || ''} onChange={v => onChange('avd', v)} placeholder="e.g. 78% or 4m 32s" />
                  </FL>

                  <FL label="Creator Bio" full>
                    <FTextarea value={data.bio || ''} onChange={v => onChange('bio', v)} rows={3} placeholder="Creator background, topic focus, channel mission..." />
                  </FL>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: YouTube Stats */}
          {activeTab === 'youtube' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FL label="YouTube Channel URL" full>
                  <FInput value={data.youtubeUrl || ''} onChange={v => onChange('youtubeUrl', v)} placeholder="https://youtube.com/@handle" />
                </FL>

                <FL label="YouTube Handle">
                  <FInput value={data.youtubeHandle || ''} onChange={v => onChange('youtubeHandle', v)} placeholder="@handle" prefix="YT" />
                </FL>

                <FL label="Subscribers Count *">
                  <FInput value={data.youtubeNum || ''} onChange={v => {
                    const num = Number(v) || 0;
                    onChange('youtubeNum', num);
                    onChange('youtube', formatNum(num));
                  }} type="number" placeholder="e.g. 110000" />
                </FL>

                <FL label="Average Views (Last 10-20 Videos) *">
                  <FInput
                    value={data.avgViewsLast10 || ''}
                    onChange={v => onChange('avgViewsLast10', Number(v) || 0)}
                    type="number"
                    placeholder="e.g. 17500"
                  />
                </FL>

                <FL label="True Engagement Rate (%)">
                  <FInput
                    value={data.engagementRate || ''}
                    onChange={v => onChange('engagementRate', Number(v) || 0)}
                    type="number"
                    placeholder="e.g. 3.4"
                  />
                </FL>

                <FL label="Total Lifetime Views">
                  <FInput
                    value={data.totalViews || ''}
                    onChange={v => onChange('totalViews', Number(v) || 0)}
                    type="number"
                    placeholder="e.g. 12500000"
                  />
                </FL>

                <FL label="Total Published Videos">
                  <FInput
                    value={data.videoCount || ''}
                    onChange={v => onChange('videoCount', Number(v) || 0)}
                    type="number"
                    placeholder="e.g. 142"
                  />
                </FL>
              </div>

              {/* YouTube Summary Banner */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Subscribers</span>
                  <p className="text-lg font-bold text-white mt-0.5">{formatNum(data.youtubeNum)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Avg Views</span>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatNum(data.avgViewsLast10)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Engagement Rate</span>
                  <p className="text-lg font-bold text-cyan-400 mt-0.5">{data.engagementRate ? `${data.engagementRate}%` : '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">AVD</span>
                  <p className="text-lg font-bold text-yellow-400 mt-0.5">{data.avd || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Audience Demographics */}
          {activeTab === 'audience' && (
            <div className="space-y-6">
              {/* Geographic Overview */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Geographic Concentration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 font-medium">India Audience Reach:</span>
                      <span className="text-cyan-400 font-bold">{data.audience_india_pct ?? 86}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={data.audience_india_pct ?? 86}
                      onChange={e => onChange('audience_india_pct', Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 font-medium">Tier-1 Metro Concentration:</span>
                      <span className="text-emerald-400 font-bold">{data.audience_tier1_city_pct ?? 60}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={data.audience_tier1_city_pct ?? 60}
                      onChange={e => onChange('audience_tier1_city_pct', Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                </div>

                {/* Top Cities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                      Top Target Cities in Audience Base:
                    </span>
                    <span className="text-[10px] text-gray-500">Edit or add custom cities for local brand targeting</span>
                  </div>

                  {/* City Badges with delete button */}
                  <div className="flex flex-wrap gap-2">
                    {(data.audience_top_cities && data.audience_top_cities.length > 0 ? data.audience_top_cities : [
                      { city: 'Delhi NCR', pct: 24 },
                      { city: 'Mumbai', pct: 19 },
                      { city: 'Bengaluru', pct: 16 },
                      { city: 'Pune', pct: 9 },
                    ]).map((c: any, i: number) => (
                      <span key={i} className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-2 group">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-medium text-white">{c.city}</span>
                        <strong className="text-cyan-400 font-mono">{c.pct}%</strong>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (data.audience_top_cities || []).filter((_: any, idx: number) => idx !== i);
                            onChange('audience_top_cities', updated);
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                          title="Remove city"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add City Inline Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      id="new-city-name"
                      placeholder="Add custom city/district (e.g. Churu, Sikar, Jaipur)..."
                      className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 flex-1"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = document.getElementById('new-city-name') as HTMLInputElement;
                          const pctInput = document.getElementById('new-city-pct') as HTMLInputElement;
                          if (input?.value.trim()) {
                            const current = data.audience_top_cities || [];
                            const pct = Number(pctInput?.value) || 20;
                            onChange('audience_top_cities', [...current, { city: input.value.trim(), pct }]);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <input
                      type="number"
                      id="new-city-pct"
                      defaultValue={35}
                      min={1}
                      max={100}
                      placeholder="%"
                      className="w-16 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 text-center font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-city-name') as HTMLInputElement;
                        const pctInput = document.getElementById('new-city-pct') as HTMLInputElement;
                        if (input?.value.trim()) {
                          const current = data.audience_top_cities || [];
                          const pct = Number(pctInput?.value) || 20;
                          onChange('audience_top_cities', [...current, { city: input.value.trim(), pct }]);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      + Add City
                    </button>
                  </div>
                </div>
              </div>

              {/* Age & Gender Demographics */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-4 h-4" /> Age & Gender Distribution
                </h3>

                {/* Gender Split Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-blue-400 font-bold">♂ Male: {data.audience_gender_male ?? 75}%</span>
                    <span className="text-pink-400 font-bold">♀ Female: {data.audience_gender_female ?? 25}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={data.audience_gender_male ?? 75}
                    onChange={e => {
                      const m = Number(e.target.value);
                      onChange('audience_gender_male', m);
                      onChange('audience_gender_female', 100 - m);
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-500 to-pink-500"
                  />
                </div>

                {/* Age Brackets */}
                <div className="space-y-2">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
                    Audience Age Brackets (%):
                  </span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                      { label: '13–17', field: 'audience_age_13_17', val: data.audience_age_13_17 ?? 8 },
                      { label: '18–24', field: 'audience_age_18_24', val: data.audience_age_18_24 ?? 52 },
                      { label: '25–34', field: 'audience_age_25_34', val: data.audience_age_25_34 ?? 30 },
                      { label: '35–44', field: 'audience_age_35_44', val: data.audience_age_35_44 ?? 7 },
                      { label: '45+',   field: 'audience_age_45_plus', val: data.audience_age_45_plus ?? 3 },
                    ].map(bracket => (
                      <div key={bracket.field} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{bracket.label}</span>
                        <input
                          type="number"
                          value={bracket.val}
                          onChange={e => onChange(bracket.field, Number(e.target.value))}
                          className="w-full bg-transparent text-center text-sm font-bold text-cyan-300 mt-1 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Income Segment */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <FL label="Purchasing Power / Income Segment">
                    <select
                      value={data.audience_income_segment || 'Upper-Middle'}
                      onChange={e => onChange('audience_income_segment', e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/60"
                    >
                      <option value="High" style={{ background: '#0d1117' }}>High / Premium</option>
                      <option value="Upper-Middle" style={{ background: '#0d1117' }}>Upper-Middle</option>
                      <option value="Middle" style={{ background: '#0d1117' }}>Middle Class</option>
                      <option value="Mass-Market" style={{ background: '#0d1117' }}>Mass-Market</option>
                    </select>
                  </FL>

                  <FL label="Primary Interests (Comma separated)">
                    <FInput
                      value={(data.audience_interests || []).join(', ')}
                      onChange={v => onChange('audience_interests', v.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="Smartphones, AI, Software, Career..."
                    />
                  </FL>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Brand Deals & Rates */}
          {activeTab === 'deals' && (
            <div className="space-y-6">
              {/* Sponsorship Rate Cards */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Sponsorship Rate Projections (INR ₹)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-white block">Dedicated Video</span>
                    <div className="flex gap-2">
                      <FInput value={data.deal_rate_dedicated_min || ''} onChange={v => onChange('deal_rate_dedicated_min', Number(v) || 0)} type="number" placeholder="Min ₹" prefix="₹" />
                      <FInput value={data.deal_rate_dedicated_max || ''} onChange={v => onChange('deal_rate_dedicated_max', Number(v) || 0)} type="number" placeholder="Max ₹" prefix="₹" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-white block">Integration (60s-90s)</span>
                    <div className="flex gap-2">
                      <FInput value={data.deal_rate_integration_min || ''} onChange={v => onChange('deal_rate_integration_min', Number(v) || 0)} type="number" placeholder="Min ₹" prefix="₹" />
                      <FInput value={data.deal_rate_integration_max || ''} onChange={v => onChange('deal_rate_integration_max', Number(v) || 0)} type="number" placeholder="Max ₹" prefix="₹" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-white block">Short / Reel Feature</span>
                    <div className="flex gap-2">
                      <FInput value={data.deal_rate_short_min || ''} onChange={v => onChange('deal_rate_short_min', Number(v) || 0)} type="number" placeholder="Min ₹" prefix="₹" />
                      <FInput value={data.deal_rate_short_max || ''} onChange={v => onChange('deal_rate_short_max', Number(v) || 0)} type="number" placeholder="Max ₹" prefix="₹" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Tier & Pitch Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FL label="Creator Tier">
                    <select
                      value={data.creator_tier || 'micro'}
                      onChange={e => onChange('creator_tier', e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/60"
                    >
                      {CREATOR_TIERS.map(t => (
                        <option key={t} value={t} style={{ background: '#0d1117' }}>{t.toUpperCase()}</option>
                      ))}
                    </select>
                  </FL>

                  <FL label="Creator Quality Score (0-100)">
                    <FInput value={data.creator_score || 75} onChange={v => onChange('creator_score', Number(v) || 0)} type="number" placeholder="e.g. 84" />
                  </FL>
                </div>

                <FL label="Best-Fit Brand Verticals (Comma separated)" full>
                  <FInput
                    value={(data.brand_categories || []).join(', ')}
                    onChange={v => onChange('brand_categories', v.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="SaaS, Consumer Tech, EdTech, FinTech..."
                  />
                </FL>

                <FL label="AI Brand Fit Pitch Summary" full>
                  <FTextarea
                    value={data.ai_brand_fit_summary || ''}
                    onChange={v => onChange('ai_brand_fit_summary', v)}
                    rows={3}
                    placeholder="Concise 2-sentence summary ready for brand manager outreach and campaign pitch..."
                  />
                </FL>
              </div>
            </div>
          )}

          {/* TAB 5: Contact & Socials */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FL label="Business Inquiry Email">
                  <FInput value={data.businessEmail || ''} onChange={v => onChange('businessEmail', v)} placeholder="collabs@channel.com" />
                </FL>

                <FL label="WhatsApp Number">
                  <FInput value={data.whatsappNumber || ''} onChange={v => onChange('whatsappNumber', v)} placeholder="+91 98765 43210" />
                </FL>

                <FL label="Contact Phone">
                  <FInput value={data.contactPhone || ''} onChange={v => onChange('contactPhone', v)} placeholder="+91 98765 43210" />
                </FL>

                <FL label="Instagram Profile URL">
                  <FInput value={data.instaUrl || ''} onChange={v => onChange('instaUrl', v)} placeholder="https://instagram.com/handle" />
                </FL>

                <FL label="Instagram Handle">
                  <FInput value={data.instaHandle || ''} onChange={v => onChange('instaHandle', v)} placeholder="@handle" prefix="IG" />
                </FL>

                <FL label="Instagram Followers">
                  <FInput value={data.instaNum || ''} onChange={v => onChange('instaNum', Number(v) || 0)} type="number" placeholder="45000" />
                </FL>

                <FL label="LinkedIn URL">
                  <FInput value={data.linkedinUrl || ''} onChange={v => onChange('linkedinUrl', v)} placeholder="https://linkedin.com/in/..." />
                </FL>

                <FL label="Twitter / X URL">
                  <FInput value={data.twitterUrl || ''} onChange={v => onChange('twitterUrl', v)} placeholder="https://x.com/handle" />
                </FL>

                <FL label="Personal / Portfolio Website" full>
                  <FInput value={data.websiteUrl || ''} onChange={v => onChange('websiteUrl', v)} placeholder="https://yoursite.com" />
                </FL>
              </div>

              {/* Display Toggles */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Visibility & Badges</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Toggle checked={Boolean(data.show_on_home)} onChange={v => onChange('show_on_home', v)} label="Show on Home Page" />
                  <Toggle checked={Boolean(data.show_on_roster)} onChange={v => onChange('show_on_roster', v)} label="Show on Public Roster" />
                  <Toggle checked={Boolean(data.featured)} onChange={v => onChange('featured', v)} label="Featured (# Top Rated)" />
                  <Toggle checked={Boolean(data.topGrowing)} onChange={v => onChange('topGrowing', v)} label="Top Growing (Trending)" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 flex-shrink-0 bg-[#0A0E14]">
          {error ? (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </p>
          ) : <span />}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Save Creator'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Brand Pitch & Intelligence Modal ──────────────────────────
function BrandPitchModal({
  creator,
  onClose,
}: {
  creator: Creator;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const pitchText = `
Creator Pitch: ${creator.name} (${creator.channelName || creator.youtubeHandle || 'YouTube Creator'})
- Reach: ${formatNum(creator.youtubeNum)} Subscribers | ${formatNum(creator.avgViewsLast10)} Avg Views per Video
- Engagement Rate: ${creator.engagementRate || '3.5'}% (High-intent audience)
- Demographics: ${creator.audience_gender_male || 75}% Male | ${creator.audience_india_pct || 86}% India | Dominant: 18-24 yrs
- Primary Niche: ${creator.niche} (${(creator.niches || []).join(', ')})
- Commercial Estimates:
  • Dedicated Video: ${formatInr(creator.deal_rate_dedicated_min)} - ${formatInr(creator.deal_rate_dedicated_max)}
  • Integration (60s): ${formatInr(creator.deal_rate_integration_min)} - ${formatInr(creator.deal_rate_integration_max)}
- Brand Fit Summary: ${creator.ai_brand_fit_summary || 'Top performer for tech and growth campaigns.'}
Official Partnership via Creator Nest: collabs@creatornest.in
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#0D1117] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-cyan-400/40 bg-white/5">
              {creator.img ? (
                <Image src={creator.img} alt={creator.name} fill className="object-cover object-top" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">{creator.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {creator.name}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {creator.creator_tier || 'Micro'} Tier
                </span>
              </h3>
              <p className="text-xs text-gray-400">{creator.channelName || creator.youtubeHandle} · {creator.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audience Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Subscribers</span>
            <p className="text-base font-bold text-white mt-0.5">{formatNum(creator.youtubeNum)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Avg Views</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{formatNum(creator.avgViewsLast10)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Engagement Rate</span>
            <p className="text-base font-bold text-cyan-400 mt-0.5">{creator.engagementRate || '3.5'}%</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">India Audience</span>
            <p className="text-base font-bold text-yellow-400 mt-0.5">{creator.audience_india_pct || 86}%</p>
          </div>
        </div>

        {/* Commercials Card */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Commercial Rate Projections</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 font-medium block">Dedicated Video</span>
              <p className="text-xs font-bold text-white mt-1">
                {formatInr(creator.deal_rate_dedicated_min)} - {formatInr(creator.deal_rate_dedicated_max)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 font-medium block">Integration (60s)</span>
              <p className="text-xs font-bold text-white mt-1">
                {formatInr(creator.deal_rate_integration_min)} - {formatInr(creator.deal_rate_integration_max)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 font-medium block">Shorts / Reel</span>
              <p className="text-xs font-bold text-white mt-1">
                {formatInr(creator.deal_rate_short_min)} - {formatInr(creator.deal_rate_short_max)}
              </p>
            </div>
          </div>
        </div>

        {/* Brand Pitch Text Box */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest block">AI Brand Pitch Summary</span>
          <p className="text-xs text-gray-300 leading-relaxed">
            {creator.ai_brand_fit_summary ||
              `Reaches an engaged audience of ${formatNum(creator.youtubeNum)} subscribers with ${formatNum(creator.avgViewsLast10)} avg views. High-intent ${creator.niche} demographics ideal for brand integrations and sponsor ROI.`}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">Ready to share with prospective brand sponsors</span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
            {copied ? 'Pitch Copied!' : 'Copy Pitch for Brands'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteConfirm({
  creator,
  onConfirm,
  onCancel,
  loading,
}: {
  creator: Creator;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-[#0d1117] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
          <h3 className="text-lg font-bold text-white">Delete Creator?</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Permanently removes <span className="text-white font-semibold">{creator.name}</span>. Cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-400 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Master Creators Page ─────────────────────────────────
export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterMinEr, setFilterMinEr] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterBudget, setFilterBudget] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Creator | null>(null);
  const [viewPitchTarget, setViewPitchTarget] = useState<Creator | null>(null);
  const [credsModalCreator, setCredsModalCreator] = useState<any>(null);
  const [credsCopied, setCredsCopied] = useState(false);

  const [formData, setFormData] = useState<Partial<Creator>>({ ...EMPTY });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roster');
      const json = await res.json();
      if (json.success) setCreators(json.creators);
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCreators(); }, []);

  // Multi-dimensional Brand Deal Shortlisting Filters
  const filtered = creators.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.channelName?.toLowerCase().includes(q) ||
      c.niche?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      (c.brand_categories && c.brand_categories.some(b => b.toLowerCase().includes(q)));

    const matchNiche = !filterNiche || c.niche === filterNiche || (c.niches && c.niches.includes(filterNiche));

    // Tier filter
    let matchTier = true;
    if (filterTier) {
      const subs = Number(c.youtubeNum) || 0;
      if (filterTier === 'nano') matchTier = subs < 10000;
      else if (filterTier === 'micro') matchTier = subs >= 10000 && subs < 100000;
      else if (filterTier === 'mid') matchTier = subs >= 100000 && subs < 500000;
      else if (filterTier === 'macro') matchTier = subs >= 500000 && subs < 2000000;
      else if (filterTier === 'mega') matchTier = subs >= 2000000;
    }

    // Engagement filter
    let matchEr = true;
    if (filterMinEr) {
      const min = Number(filterMinEr);
      const er = Number(c.engagementRate) || 0;
      matchEr = er >= min;
    }

    // Gender filter
    let matchGender = true;
    if (filterGender === 'male') {
      matchGender = (c.audience_gender_male ?? 70) >= 60;
    } else if (filterGender === 'female') {
      matchGender = (c.audience_gender_female ?? 30) >= 40;
    }

    // Budget range filter (Dedicated video rate)
    let matchBudget = true;
    if (filterBudget) {
      const minRate = c.deal_rate_dedicated_min || (Number(c.avgViewsLast10 || 0) * 0.25);
      if (filterBudget === 'under25k') matchBudget = minRate <= 25000;
      else if (filterBudget === '25k-50k') matchBudget = minRate > 25000 && minRate <= 50000;
      else if (filterBudget === '50k-1l') matchBudget = minRate > 50000 && minRate <= 100000;
      else if (filterBudget === '1l+') matchBudget = minRate > 100000;
    }

    // Target City / State filter
    const matchCity =
      !filterCity ||
      c.location?.toLowerCase().includes(filterCity.toLowerCase()) ||
      (c.audience_top_cities && c.audience_top_cities.some((ct: any) => ct.city?.toLowerCase().includes(filterCity.toLowerCase())));

    return matchSearch && matchNiche && matchTier && matchEr && matchGender && matchBudget && matchCity;
  });

  const activeFilterCount = [filterTier, filterMinEr, filterGender, filterBudget, filterCity].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setFilterNiche('');
    setFilterTier('');
    setFilterMinEr('');
    setFilterGender('');
    setFilterBudget('');
    setFilterCity('');
  };

  const handleFieldChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const openAdd = () => {
    setFormData({ ...EMPTY, niches: ['AI & Automation'], niche: 'AI & Automation' });
    setFormError('');
    setShowAdd(true);
  };

  const openEdit = (c: Creator) => {
    setFormData({
      ...c,
      niches: c.niches && c.niches.length > 0 ? c.niches : [c.niche || 'AI & Automation'],
    });
    setFormError('');
    setEditCreator(c);
  };

  const handleAdd = async () => {
    if (!formData.name?.trim()) { setFormError('Creator name is required'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch('/api/admin/roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Server error');
      showToast(`"${formData.name}" onboarded & account created!`);
      setShowAdd(false);
      fetchCreators();
      if (json.user_account) {
        setCredsModalCreator({
          name: formData.name,
          numeric_id: json.user_account.numeric_id,
          email: json.user_account.email,
          default_password: json.user_account.default_password || 'Creator@123',
        });
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to add creator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.name?.trim()) { setFormError('Creator name is required'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch('/api/admin/roster', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: editCreator!.id, ...formData }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Server error');
      showToast(`"${formData.name}" updated successfully!`);
      setEditCreator(null);
      fetchCreators();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`/api/admin/roster?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchCreators();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (creator: Creator, field: string, value: boolean) => {
    setCreators(prev => prev.map(c => c.id === creator.id ? { ...c, [field]: value } : c));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch('/api/admin/roster', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'toggle', id: creator.id, field, value }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    } catch {
      setCreators(prev => prev.map(c => c.id === creator.id ? { ...c, [field]: !value } : c));
      showToast('Failed to update', 'error');
    }
  };

  // Top Level Roster Stats
  const totalSubscribers = creators.reduce((acc, c) => acc + (Number(c.youtubeNum) || 0), 0);
  const avgRosterEr = creators.length > 0
    ? (creators.reduce((acc, c) => acc + (Number(c.engagementRate) || 3.0), 0) / creators.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
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

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <CreatorForm
            title="Onboard & Auto-Profile Creator"
            data={formData}
            onChange={handleFieldChange}
            onSubmit={handleAdd}
            submitting={submitting}
            onClose={() => setShowAdd(false)}
            error={formError}
          />
        )}
        {editCreator && (
          <CreatorForm
            title={`Edit & Re-Profile: ${editCreator.name}`}
            data={formData}
            onChange={handleFieldChange}
            onSubmit={handleEdit}
            submitting={submitting}
            onClose={() => setEditCreator(null)}
            error={formError}
          />
        )}
        {viewPitchTarget && (
          <BrandPitchModal
            creator={viewPitchTarget}
            onClose={() => setViewPitchTarget(null)}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            creator={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
        {credsModalCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141A] border border-cyan-500/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Creator Credentials Issued</h3>
                    <p className="text-xs text-cyan-400 font-bold">{credsModalCreator.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCredsModalCreator(null)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                A verified creator account has been provisioned with the standard default password. The creator will be prompted to change this password on their first login.
              </p>

              <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">Creator User ID:</span>
                  <div className="flex items-center space-x-2">
                    <strong className="text-white text-sm">{credsModalCreator.numeric_id || credsModalCreator.user_numeric_id || 'CR-102'}</strong>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credsModalCreator.numeric_id || credsModalCreator.user_numeric_id || 'CR-102');
                        showToast('Creator ID copied!');
                      }}
                      className="text-cyan-400 hover:underline text-[11px] font-sans"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">Login Email:</span>
                  <div className="flex items-center space-x-2">
                    <strong className="text-gray-200">{credsModalCreator.email || credsModalCreator.businessEmail || credsModalCreator.account_email}</strong>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credsModalCreator.email || credsModalCreator.businessEmail || credsModalCreator.account_email);
                        showToast('Email copied!');
                      }}
                      className="text-cyan-400 hover:underline text-[11px] font-sans"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">Default Password:</span>
                  <div className="flex items-center space-x-2">
                    <strong className="text-amber-300 font-bold">{credsModalCreator.default_password || 'Creator@123'}</strong>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credsModalCreator.default_password || 'Creator@123');
                        showToast('Password copied!');
                      }}
                      className="text-amber-400 hover:underline text-[11px] font-sans"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-gray-400 font-sans">Portal URL:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">https://creatornest.in/login</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://creatornest.in/login');
                        showToast('Portal URL copied!');
                      }}
                      className="text-cyan-400 hover:underline text-[11px] font-sans"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = credsModalCreator.numeric_id || credsModalCreator.user_numeric_id || 'CR-102';
                    const em = credsModalCreator.email || credsModalCreator.businessEmail || credsModalCreator.account_email;
                    const pw = credsModalCreator.default_password || 'Creator@123';
                    const text = `🎉 Welcome to Creator Nest!\n\nYour official Creator Portal access is ready:\n• Login Portal: https://creatornest.in/login\n• User ID: ${id}\n• Email: ${em}\n• Default Password: ${pw}\n\nPlease log in and update your password on your first login.`;
                    navigator.clipboard.writeText(text);
                    setCredsCopied(true);
                    showToast('Full invitation copied to clipboard!');
                    setTimeout(() => setCredsCopied(false), 2500);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{credsCopied ? 'Copied Invitation!' : 'Copy WhatsApp / Email Invitation'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCredsModalCreator(null)}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2.5">
            <span>Creator Roster & Brand Profiling</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              YouTube API Enabled
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {creators.length} verified creators · {formatNum(totalSubscribers)} collective reach · Avg {avgRosterEr}% ER
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/roster"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            Arrange Order
          </Link>
          <button
            onClick={openAdd}
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Onboard Creator
          </button>
        </div>
      </header>

      {/* Brand Deal Shortlisting & Filter Panel */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, channel, location, brand vertical..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>
          <select
            value={filterNiche}
            onChange={e => setFilterNiche(e.target.value)}
            className="bg-[#0D1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="">All Tech Categories</option>
            {TECH_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              showAdvancedFilters || activeFilterCount > 0
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Brand Deal Shortlisting</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-400 text-black text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Advanced Shortlisting Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-white/8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
            >
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Creator Reach Tier</label>
                <select
                  value={filterTier}
                  onChange={e => setFilterTier(e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="">All Reach Tiers</option>
                  <option value="nano">Nano (&lt; 10K)</option>
                  <option value="micro">Micro (10K - 100K)</option>
                  <option value="mid">Mid-Tier (100K - 500K)</option>
                  <option value="macro">Macro (500K - 2M)</option>
                  <option value="mega">Mega (2M+)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Min. Engagement Rate</label>
                <select
                  value={filterMinEr}
                  onChange={e => setFilterMinEr(e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="">All ER Levels</option>
                  <option value="2.0">≥ 2.0% ER</option>
                  <option value="3.0">≥ 3.0% (High Engagement)</option>
                  <option value="4.5">≥ 4.5% (Elite Viral ER)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Audience Gender Bias</label>
                <select
                  value={filterGender}
                  onChange={e => setFilterGender(e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male Skewed (&gt; 60%)</option>
                  <option value="female">Female Skewed (&gt; 40%)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Target City / State</label>
                <input
                  type="text"
                  value={filterCity}
                  onChange={e => setFilterCity(e.target.value)}
                  placeholder="e.g. Churu, Rajasthan..."
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Sponsorship Deal Range</label>
                <div className="flex gap-2">
                  <select
                    value={filterBudget}
                    onChange={e => setFilterBudget(e.target.value)}
                    className="flex-1 bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/50"
                  >
                    <option value="">Any Budget</option>
                    <option value="under25k">Under ₹25K</option>
                    <option value="25k-50k">₹25K - ₹50K</option>
                    <option value="50k-1l">₹50K - ₹1 Lakh</option>
                    <option value="1l+">₹1 Lakh+</option>
                  </select>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Reset all filters"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Creators Table */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-black text-gray-500 border-b border-white/5">
                <th className="px-5 py-4">Creator / Channel</th>
                <th className="px-5 py-4">Category & Niches</th>
                <th className="px-5 py-4">Reach & Views</th>
                <th className="px-5 py-4">Engagement (ER)</th>
                <th className="px-5 py-4">Audience Snapshot</th>
                <th className="px-5 py-4">Est. Deal Rate</th>
                <th className="px-5 py-4 text-center">Home</th>
                <th className="px-5 py-4 text-center">Roster</th>
                <th className="px-5 py-4 text-center">Featured</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={10} className="px-5 py-5"><div className="h-4 bg-white/5 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center text-gray-500 text-sm">
                    No creators match these filters.{' '}
                    <button onClick={resetFilters} className="text-cyan-400 hover:underline">Reset filters</button> or{' '}
                    <button onClick={openAdd} className="text-cyan-400 hover:underline">Onboard new creator →</button>
                  </td>
                </tr>
              ) : filtered.map(creator => {
                const subs = Number(creator.youtubeNum) || 0;
                const er = Number(creator.engagementRate) || 0;
                return (
                  <tr key={creator.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Creator Identity */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                          {creator.img ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={creator.img} alt={creator.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-bold">
                              {creator.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                            <span>{creator.name}</span>
                            {creator.channelName && (
                              <span className="text-[11px] font-normal text-cyan-400">({creator.channelName})</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <span>{creator.location}</span>
                            {creator.youtubeHandle && (
                              <span className="text-gray-400 font-mono text-[10px]">{creator.youtubeHandle}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Niches */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(creator.niches && creator.niches.length > 0 ? creator.niches : [creator.niche]).slice(0, 2).map(n => (
                          <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium whitespace-nowrap">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Reach */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Video className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span>{formatNum(subs)} Subs</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-medium pl-5">
                          ~{creator.avgViewsLast10 ? formatNum(creator.avgViewsLast10) : '—'} avg views
                        </div>
                      </div>
                    </td>

                    {/* True Engagement Rate */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        er >= 4.0
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : er >= 2.5
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        {er ? `${er}%` : '3.2%'}
                      </span>
                    </td>

                    {/* Audience Snapshot */}
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="font-semibold text-blue-400">♂ {creator.audience_gender_male ?? 75}%</span>
                          <span className="text-gray-600">·</span>
                          <span className="text-cyan-300">{creator.audience_age_18_24 ? `${creator.audience_age_18_24}% 18-24` : '18-24 Dominant'}</span>
                        </div>
                        <div className="text-gray-500 text-[10px]">
                          🇮🇳 {creator.audience_india_pct ?? 86}% India · {creator.audience_income_segment || 'Upper-Mid'}
                        </div>
                      </div>
                    </td>

                    {/* Sponsorship Deal Rate */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">
                          {creator.deal_rate_dedicated_min
                            ? `${formatInr(creator.deal_rate_dedicated_min)} - ${formatInr(creator.deal_rate_dedicated_max)}`
                            : '₹35K - ₹65K'}
                        </span>
                        <span className="text-[10px] text-gray-500">Dedicated Vid</span>
                      </div>
                    </td>

                    {/* Home Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggle(creator, 'show_on_home', !creator.show_on_home)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${creator.show_on_home ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                        title={creator.show_on_home ? 'Shown on home' : 'Hidden from home'}
                      >
                        <Home className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Roster Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggle(creator, 'show_on_roster', !creator.show_on_roster)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${creator.show_on_roster ? 'text-purple-400 bg-purple-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                      >
                        {creator.show_on_roster ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggle(creator, 'featured', !creator.featured)}
                        className={`p-1.5 rounded-lg transition-colors text-base cursor-pointer ${creator.featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                      >
                        ★
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCredsModalCreator(creator)}
                          className="p-2 rounded-xl hover:bg-amber-400/10 text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
                          title="View Login Credentials (ID & Default Password)"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewPitchTarget(creator)}
                          className="p-2 rounded-xl hover:bg-cyan-400/10 text-cyan-400/80 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="View Brand Intelligence & Pitch"
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(creator)}
                          className="p-2 rounded-xl hover:bg-cyan-400/10 text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(creator)}
                          className="p-2 rounded-xl hover:bg-red-400/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-500 flex items-center justify-between">
          <span>{filtered.length} of {creators.length} creators shortlisted</span>
          <Link href="/admin/roster" className="text-cyan-400 hover:underline">
            Arrange display order →
          </Link>
        </div>
      </div>
    </div>
  );
}
