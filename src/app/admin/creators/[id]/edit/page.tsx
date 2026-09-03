'use client';
// ============================================================
// Creator Nest — Admin: Edit Creator Profile
// /admin/creators/[id]/edit
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Loader2, Check, AlertTriangle,
  Video, Camera, Globe, Upload, Crop, ZoomIn, Move,
  Home, List, Star, TrendingUp, Image as ImageIcon,
  CheckSquare, Square, Eye, EyeOff, X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ── Strict Tech Niches & Categories ───────────────────────────
export const TECH_NICHES = [
  'EdTech & App Reviews',
  'AI & Automation',
  'Mobile Apps Review',
  'SaaS & Cloud Tools',
  'Full-Stack & DevOps',
  'Tech & Gadgets',
  'FinTech & Growth',
  'Cybersecurity & Data',
];

type Creator = {
  id: string | number;
  name: string;
  channelName?: string;
  niche: string;
  niches?: string[];
  platform: string;
  bio: string;
  img: string;
  location: string;
  avd: string;
  avgViewsLast10?: number | string;
  youtubeNum: number;
  instaNum: number;
  youtubeUrl: string;
  youtubeHandle: string;
  instaUrl: string;
  instaHandle: string;
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  businessEmail: string;
  whatsappNumber: string;
  contactPhone: string;
  show_on_home: boolean;
  show_on_roster: boolean;
  featured: boolean;
  topGrowing: boolean;
  rank: number;
  // ── Private Admin-Only Contact Fields ──────────────────
  // ⚠️  NEVER shown on public pages or creator-facing UI
  private_business_email?: string;
  private_contact_phone_1?: string;
  private_contact_phone_2?: string;
  private_whatsapp_number?: string;
  private_instagram_dm_handle?: string;
  private_twitter_dm_handle?: string;
  private_linkedin_dm_handle?: string;
  private_youtube_community_url?: string;
  private_telegram_handle?: string;
  private_snapchat_handle?: string;
  private_facebook_page_url?: string;
  private_discord_handle?: string;
  private_contact_notes?: string;
};

// ── Interactive Image Crop Modal ──────────────────────────────
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

  const generateCrop = () => {
    setIsProcessing(true);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetW = 800;
      const targetH = 1000;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      const imgAspect = img.width / img.height;
      const targetAspect = targetW / targetH;

      let sWidth = img.width;
      let sHeight = img.height;

      if (imgAspect > targetAspect) {
        sWidth = img.height * targetAspect;
      } else {
        sHeight = img.width / targetAspect;
      }

      sWidth = sWidth / zoom;
      sHeight = sHeight / zoom;

      const maxSX = Math.max(0, img.width - sWidth);
      const maxSY = Math.max(0, img.height - sHeight);

      const sx = maxSX * (posX / 100);
      const sy = maxSY * (posY / 100);

      ctx.fillStyle = '#06090F';
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);

      canvas.toBlob(
        blob => {
          setIsProcessing(false);
          if (blob) onSaveCropped(blob);
        },
        'image/jpeg',
        0.92
      );
    };
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
              <p className="text-xs text-gray-400">Position the creator's face so it stays perfectly visible</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Frame */}
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
                className="w-full h-full object-cover transition-transform duration-75 pointer-events-none"
                style={{
                  objectPosition: `${posX}% ${posY}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${posX}% ${posY}%`,
                }}
              />
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
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${posX}% ${posY}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${posX}% ${posY}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-gray-500 text-center max-w-[100px]">Leaderboard & Table</div>
          </div>
        </div>

        {/* Adjuster Controls */}
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
              <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5" /> Zoom & Scale</span>
              <span className="text-cyan-400 font-mono font-bold">{zoom.toFixed(1)}x</span>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={generateCrop}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,254,0.35)] disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isProcessing ? 'Framing Image...' : 'Apply & Save Cropped Photo'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Profile Photo Upload & Adjust Field ───────────────────────
function ImageUploadField({
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
      if (e.target?.result) {
        setRawImageForCrop(e.target.result as string);
      }
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
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
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
    <div className="md:col-span-2 space-y-2">
      {rawImageForCrop && (
        <ImageCropModal
          imageSrc={rawImageForCrop}
          onCancel={() => setRawImageForCrop(null)}
          onSaveCropped={uploadBlob}
        />
      )}

      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Profile Photo (4:5 Face Focus)</label>
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/8">
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.[0]) handleSelectedFile(e.dataTransfer.files[0]);
          }}
          className={`relative w-28 h-36 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed flex-shrink-0 flex items-center justify-center transition-all ${
            dragging ? 'border-cyan-400 bg-cyan-400/10' : currentImg ? 'border-white/20 hover:border-cyan-400/50' : 'border-white/15 hover:border-cyan-400/40 bg-white/5'
          }`}
        >
          {currentImg ? (
            <>
              <Image src={currentImg} alt="preview" fill className="object-cover object-top" unoptimized />
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <Crop className="w-5 h-5 text-cyan-300" />
                <span className="text-white text-[10px] font-bold">Crop / Adjust</span>
              </div>
            </>
          ) : (
            <div className="text-center p-2">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-gray-500 mx-auto" />
                  <span className="text-[10px] text-gray-400 block mt-1">Upload</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <p className="text-sm text-white font-semibold">{currentImg ? 'Photo loaded & framed' : 'Upload a profile photo'}</p>
          <p className="text-xs text-gray-500">Supports JPG, PNG, WebP. Click & adjust to center face for our card designs.</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-cyan-400/40 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {currentImg ? 'Change Photo' : 'Select Photo from Computer'}
            </button>
            {currentImg && (
              <button
                type="button"
                onClick={() => setRawImageForCrop(currentImg)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1"
              >
                <Crop className="w-3.5 h-3.5" />
                Adjust Crop
              </button>
            )}
          </div>
          {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          if (e.target.files?.[0]) handleSelectedFile(e.target.files[0]);
        }}
      />
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
    <div className="space-y-2 md:col-span-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Categories & Niches (Select Multiple for Filter Matching) <span className="text-cyan-400">*</span>
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

// ── Basic Form Helpers ────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
      <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({
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
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-cyan-400/50 transition-colors">
      {prefix && <span className="text-gray-500 text-xs flex-shrink-0 select-none">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1 min-w-0"
      />
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={4}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none resize-none focus:border-cyan-400/50 transition-colors"
    />
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <div>
        <div className="text-sm text-white font-medium">{label}</div>
        {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
      </div>
    </label>
  );
}

// ── Main Edit Page ────────────────────────────────────────────
export default function EditCreatorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<Partial<Creator>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/roster');
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const creator = json.creators.find((c: any) => String(c.id) === String(id));
        if (!creator) {
          setNotFound(true);
        } else {
          setData({
            ...creator,
            niches: creator.niches && creator.niches.length > 0 ? creator.niches : [creator.niche || 'AI & Automation'],
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load creator');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const set = (field: string, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!data.name?.trim()) { setError('Creator name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/roster', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <p className="text-gray-400">Loading creator profile...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto" />
        <p className="text-white text-xl font-bold">Creator not found</p>
        <p className="text-gray-400 text-sm">The creator with ID &quot;{id}&quot; does not exist in the roster.</p>
        <Link href="/admin/creators" className="inline-flex items-center gap-2 text-cyan-400 hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Creators
        </Link>
      </div>
    </div>
  );

  const selectedNiches = Array.isArray(data.niches) && data.niches.length > 0
    ? data.niches
    : (data.niche ? [data.niche] : ['AI & Automation']);

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/creators"
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{data.name || 'Edit Creator'}</h1>
            <p className="text-gray-400 text-sm mt-0.5">Edit profile details, categories & stats</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {error}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105'
            } disabled:opacity-60 disabled:scale-100 shadow-[0_0_20px_rgba(0,242,254,0.3)]`}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/8 rounded-2xl">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
          {data.img ? (
            <Image src={data.img} alt={data.name || ''} fill className="object-cover object-top" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>
        <div>
          <div className="font-bold text-white text-lg flex items-center gap-2">
            <span>{data.name || '—'}</span>
            {data.channelName && (
              <span className="text-xs font-normal text-cyan-400">({data.channelName})</span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {selectedNiches.join(' · ')} · {data.location || '—'}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {data.youtubeNum ? <span className="flex items-center gap-1"><Video className="w-3 h-3 text-red-400" />{data.youtubeNum.toLocaleString()}</span> : null}
            {data.instaNum ? <span className="flex items-center gap-1"><Camera className="w-3 h-3 text-pink-400" />{data.instaNum.toLocaleString()}</span> : null}
            {data.avgViewsLast10 ? <span className="text-emerald-400 font-bold">Avg: {Number(data.avgViewsLast10).toLocaleString()} views</span> : null}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          {data.show_on_home && <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">On Home</span>}
          {data.show_on_roster && <span className="text-xs px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-400 border border-purple-400/20">On Roster</span>}
          {data.featured && <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">Featured</span>}
          {data.topGrowing && <span className="text-xs px-2.5 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">Top Growing</span>}
        </div>
      </div>

      {/* ── Identity ── */}
      <Section title="Creator Identity & Categories">
        <ImageUploadField currentImg={data.img || ''} onUploaded={url => set('img', url)} />
        <Field label="Creator Full Name *">
          <Input value={data.name || ''} onChange={v => set('name', v)} placeholder="Full name (e.g. Jeet Choudhary)" />
        </Field>
        <Field label="Channel Name *">
          <Input value={data.channelName || ''} onChange={v => set('channelName', v)} placeholder="Channel name (e.g. Election Guide)" />
        </Field>
        <NicheMultiSelect
          selectedNiches={selectedNiches}
          onChange={niches => {
            set('niches', niches);
            set('niche', niches[0] || 'AI & Automation');
          }}
        />
        <Field label="Location">
          <Input value={data.location || ''} onChange={v => set('location', v)} placeholder="e.g. Delhi, Mumbai, Bangalore" />
        </Field>
        <Field label="Bio" full>
          <Textarea value={data.bio || ''} onChange={v => set('bio', v)} placeholder="Short creator bio / tagline..." />
        </Field>
      </Section>

      {/* ── YouTube & Video Performance ── */}
      <Section title="YouTube & Video Performance">
        <Field label="YouTube Channel URL" full>
          <Input value={data.youtubeUrl || ''} onChange={v => set('youtubeUrl', v)} placeholder="https://youtube.com/@handle" />
        </Field>
        <Field label="Handle">
          <Input value={data.youtubeHandle || ''} onChange={v => set('youtubeHandle', v)} placeholder="@YourHandle" prefix="YT" />
        </Field>
        <Field label="Subscribers">
          <Input value={data.youtubeNum || ''} onChange={v => set('youtubeNum', Number(v))} type="number" placeholder="e.g. 110000" />
        </Field>
        <Field label="Average Views for Last 10 Videos *" full>
          <Input
            value={data.avgViewsLast10 || ''}
            onChange={v => set('avgViewsLast10', Number(v))}
            type="number"
            placeholder="e.g. 85000 (Average views across recent 10 videos)"
          />
        </Field>
      </Section>

      {/* ── Instagram ── */}
      <Section title="Instagram">
        <Field label="Instagram Profile URL" full>
          <Input value={data.instaUrl || ''} onChange={v => set('instaUrl', v)} placeholder="https://instagram.com/handle" />
        </Field>
        <Field label="Handle">
          <Input value={data.instaHandle || ''} onChange={v => set('instaHandle', v)} placeholder="@yourhandle" prefix="IG" />
        </Field>
        <Field label="Followers">
          <Input value={data.instaNum || ''} onChange={v => set('instaNum', Number(v))} type="number" placeholder="e.g. 45000" />
        </Field>
      </Section>

      {/* ── Other Social Links ── */}
      <Section title="Other Social Links & Contact">
        <Field label="LinkedIn URL">
          <Input value={data.linkedinUrl || ''} onChange={v => set('linkedinUrl', v)} placeholder="https://linkedin.com/in/..." />
        </Field>
        <Field label="Twitter / X URL">
          <Input value={data.twitterUrl || ''} onChange={v => set('twitterUrl', v)} placeholder="https://x.com/handle" />
        </Field>
        <Field label="Website URL" full>
          <Input value={data.websiteUrl || ''} onChange={v => set('websiteUrl', v)} placeholder="https://yourwebsite.com" />
        </Field>
        <Field label="Business Email">
          <Input value={data.businessEmail || ''} onChange={v => set('businessEmail', v)} placeholder="creator@email.com" />
        </Field>
        <Field label="WhatsApp Number">
          <Input value={data.whatsappNumber || ''} onChange={v => set('whatsappNumber', v)} placeholder="+91 98765 43210" />
        </Field>
      </Section>

      {/* ── Private Contact Info (Admin Only) ── */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30">
            <EyeOff className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest">Private — Admin Only</span>
          </div>
          <p className="text-[11px] text-amber-500/70">Never shown on public pages or creator-facing UI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Emails */}
          <Field label="Business / Collab Email (Private)" full>
            <Input
              value={data.private_business_email || ''}
              onChange={v => set('private_business_email', v)}
              placeholder="creator@personalemail.com"
            />
          </Field>

          {/* Phone Numbers */}
          <Field label="Contact Phone — Primary">
            <Input
              value={data.private_contact_phone_1 || ''}
              onChange={v => set('private_contact_phone_1', v)}
              placeholder="+91 98765 43210"
              prefix="📞"
            />
          </Field>
          <Field label="Contact Phone — Secondary">
            <Input
              value={data.private_contact_phone_2 || ''}
              onChange={v => set('private_contact_phone_2', v)}
              placeholder="+91 99999 00000"
              prefix="📞"
            />
          </Field>

          {/* WhatsApp */}
          <Field label="WhatsApp Number (Private)">
            <Input
              value={data.private_whatsapp_number || ''}
              onChange={v => set('private_whatsapp_number', v)}
              placeholder="+91 98765 43210"
              prefix="💬"
            />
          </Field>

          {/* Social DM Handles */}
          <Field label="Instagram (DM Handle)">
            <Input
              value={data.private_instagram_dm_handle || ''}
              onChange={v => set('private_instagram_dm_handle', v)}
              placeholder="@creatorhandle"
              prefix="IG"
            />
          </Field>
          <Field label="Twitter / X (DM Handle)">
            <Input
              value={data.private_twitter_dm_handle || ''}
              onChange={v => set('private_twitter_dm_handle', v)}
              placeholder="@twitterhandle"
              prefix="𝕏"
            />
          </Field>
          <Field label="LinkedIn (Profile Handle)">
            <Input
              value={data.private_linkedin_dm_handle || ''}
              onChange={v => set('private_linkedin_dm_handle', v)}
              placeholder="in/yourname"
              prefix="in"
            />
          </Field>
          <Field label="Telegram Handle">
            <Input
              value={data.private_telegram_handle || ''}
              onChange={v => set('private_telegram_handle', v)}
              placeholder="@telegramhandle"
              prefix="TG"
            />
          </Field>
          <Field label="Snapchat Handle">
            <Input
              value={data.private_snapchat_handle || ''}
              onChange={v => set('private_snapchat_handle', v)}
              placeholder="snapchatuser"
              prefix="SC"
            />
          </Field>
          <Field label="Discord Handle">
            <Input
              value={data.private_discord_handle || ''}
              onChange={v => set('private_discord_handle', v)}
              placeholder="username#1234 or invite link"
              prefix="DC"
            />
          </Field>
          <Field label="Facebook Page URL" full>
            <Input
              value={data.private_facebook_page_url || ''}
              onChange={v => set('private_facebook_page_url', v)}
              placeholder="https://facebook.com/pagename"
            />
          </Field>
          <Field label="YouTube Community / About URL" full>
            <Input
              value={data.private_youtube_community_url || ''}
              onChange={v => set('private_youtube_community_url', v)}
              placeholder="https://youtube.com/@handle/community"
            />
          </Field>

          {/* Admin Notes */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Admin Contact Notes
            </label>
            <Textarea
              value={data.private_contact_notes || ''}
              onChange={v => set('private_contact_notes', v)}
              placeholder="e.g. Best time to reach: evenings IST. Prefers WhatsApp. Manager: Rahul (+91 ...)."
            />
          </div>
        </div>
      </div>

      {/* ── Stats & Order ── */}
      <Section title="Stats & Display Rank">
        <Field label="Avg View Duration (AVD)">
          <Input value={data.avd || ''} onChange={v => set('avd', v)} placeholder="e.g. 75%" />
        </Field>
        <Field label="Display Order (Rank)">
          <Input value={data.rank || ''} onChange={v => set('rank', Number(v))} type="number" placeholder="e.g. 1 = first" />
        </Field>
      </Section>

      {/* ── Display Settings ── */}
      <Section title="Display Settings">
        <Toggle
          checked={Boolean(data.show_on_home)}
          onChange={v => set('show_on_home', v)}
          label="Show on Home Page"
          desc="Feature this creator in the homepage roster section"
        />
        <Toggle
          checked={Boolean(data.show_on_roster)}
          onChange={v => set('show_on_roster', v)}
          label="Show on Roster Page"
          desc="Display this creator in the main /creators/roster catalog"
        />
        <Toggle
          checked={Boolean(data.featured)}
          onChange={v => set('featured', v)}
          label="Featured (# Top Rated)"
          desc="Show golden 'Top Rated' badge on their card"
        />
        <Toggle
          checked={Boolean(data.topGrowing)}
          onChange={v => set('topGrowing', v)}
          label="Top Growing (Trending)"
          desc="Show green 'Trending' badge on their card"
        />
      </Section>
    </div>
  );
}
