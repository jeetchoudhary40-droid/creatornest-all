'use client';
// ============================================================
// Creator Nest — Admin: Creator Management
// /admin/creators
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Loader2,
  Save, Video, Camera, Check, Home, List, AlertTriangle,
  Upload, ImageIcon, Crop, ZoomIn, Move, Sparkles, CheckSquare, Square
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ── Strict Tech Niches & Categories (Matching Roster Page) ────
const TECH_NICHES = [
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
  avd: '',
  avgViewsLast10: 0,
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
};

function formatNum(n: number | string | undefined): string {
  const num = Number(n);
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
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
  const [posY, setPosY] = useState(15); // Default 15% (Focuses on face/top)
  const [posX, setPosX] = useState(50); // Default 50% (Center)
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
      const targetH = 1000; // 4:5 aspect ratio
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Calculate source crop area based on zoom & offset
      const imgAspect = img.width / img.height;
      const targetAspect = targetW / targetH; // 0.8

      let sWidth = img.width;
      let sHeight = img.height;

      if (imgAspect > targetAspect) {
        // Image is wider than 4:5
        sWidth = img.height * targetAspect;
      } else {
        // Image is taller than 4:5
        sHeight = img.width / targetAspect;
      }

      // Apply zoom
      sWidth = sWidth / zoom;
      sHeight = sHeight / zoom;

      // Calculate position offset
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
              <p className="text-xs text-gray-400">Position the creator's face so it never gets cut off</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Frame (4:5 Ratio) */}
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
              {/* Image preview with object positioning */}
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

              {/* Grid overlay for rule of thirds / face placement */}
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

          {/* Circular avatar preview */}
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
            <div className="text-[10px] text-gray-500 text-center max-w-[100px]">Leaderboard & Table preview</div>
          </div>
        </div>

        {/* Adjuster Controls */}
        <div className="space-y-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
          {/* Quick Presets */}
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

          {/* Vertical Slider */}
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

          {/* Zoom Slider */}
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

// ── Profile Photo Upload & Adjust Component ───────────────────
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
    // Open crop adjuster with selected image
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
    <div className="flex flex-col items-center gap-3">
      {/* Crop Modal */}
      {rawImageForCrop && (
        <ImageCropModal
          imageSrc={rawImageForCrop}
          onCancel={() => setRawImageForCrop(null)}
          onSaveCropped={uploadBlob}
        />
      )}

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.[0]) handleSelectedFile(e.dataTransfer.files[0]);
        }}
        className={`relative w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden
          ${dragging
            ? 'border-cyan-400 bg-cyan-400/10 scale-[1.01]'
            : currentImg
            ? 'border-white/20 hover:border-cyan-400/50'
            : 'border-white/15 hover:border-cyan-400/40 bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
        style={{ aspectRatio: '4/5', maxHeight: 240 }}
      >
        {currentImg ? (
          <>
            <Image
              src={currentImg}
              alt="preview"
              fill
              className="object-cover object-top"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Crop className="w-6 h-6 text-cyan-300" />
              <span className="text-white text-xs font-bold">Adjust & Crop</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-500" />
              )}
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
          {currentImg ? 'Change Photo' : 'Select Photo'}
        </button>
        {currentImg && (
          <button
            type="button"
            onClick={() => setRawImageForCrop(currentImg)}
            className="p-2 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center justify-center"
            title="Re-frame / Adjust Crop"
          >
            <Crop className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Niche Multi-Select Component ──────────────────────────────
function NicheMultiSelect({
  selectedNiches,
  onChange,
}: {
  selectedNiches: string[];
  onChange: (niches: string[]) => void;
}) {
  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      // Don't allow empty, maintain at least 1
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
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-cyan-400/50 transition-colors">
      {prefix && <span className="text-gray-500 text-xs flex-shrink-0">{prefix}</span>}
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

function FTextarea({
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
      rows={3}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none resize-none focus:border-cyan-400/50 transition-colors"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
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

// ── Creator Form Modal ────────────────────────────────────────
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
  const selectedNiches = Array.isArray(data.niches) && data.niches.length > 0
    ? data.niches
    : (data.niche ? [data.niche] : ['AI & Automation']);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl z-10 flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-0">
            {/* Left Col — Photo with crop tool */}
            <div className="w-full md:w-64 flex-shrink-0 p-5 border-b md:border-b-0 md:border-r border-white/8 bg-white/[0.01]">
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">Profile Photo (4:5)</p>
              <ImageUpload
                currentImg={data.img || ''}
                onUploaded={url => onChange('img', url)}
              />
            </div>

            {/* Right Col — Form fields */}
            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
              {/* Identity & Multi-Niche */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Creator Profile</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FL label="Creator Full Name *">
                    <FInput value={data.name || ''} onChange={v => onChange('name', v)} placeholder="e.g. Jeet Choudhary" />
                  </FL>

                  <FL label="Channel Name *">
                    <FInput value={data.channelName || ''} onChange={v => onChange('channelName', v)} placeholder="e.g. Election Guide" />
                  </FL>

                  {/* Multi-Niche Selection */}
                  <NicheMultiSelect
                    selectedNiches={selectedNiches}
                    onChange={niches => {
                      onChange('niches', niches);
                      onChange('niche', niches[0] || 'AI & Automation');
                    }}
                  />

                  <FL label="Location">
                    <FInput value={data.location || ''} onChange={v => onChange('location', v)} placeholder="e.g. Delhi, Bangalore" />
                  </FL>

                  <FL label="Avg View Duration (AVD)">
                    <FInput value={data.avd || ''} onChange={v => onChange('avd', v)} placeholder="e.g. 82%" />
                  </FL>

                  <FL label="Short Bio" full>
                    <FTextarea value={data.bio || ''} onChange={v => onChange('bio', v)} placeholder="Short creator bio & focus..." />
                  </FL>
                </div>
              </div>

              {/* YouTube & Reach Stats */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">YouTube & Video Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FL label="YouTube Channel URL" full>
                    <FInput value={data.youtubeUrl || ''} onChange={v => onChange('youtubeUrl', v)} placeholder="https://youtube.com/@handle" />
                  </FL>
                  <FL label="Handle">
                    <FInput value={data.youtubeHandle || ''} onChange={v => onChange('youtubeHandle', v)} placeholder="@handle" prefix="YT" />
                  </FL>
                  <FL label="Subscribers">
                    <FInput value={data.youtubeNum || ''} onChange={v => onChange('youtubeNum', v)} type="number" placeholder="e.g. 110000" />
                  </FL>

                  {/* Average Views for Last 10 Videos */}
                  <FL label="Avg Views (Last 10 Videos) *" full>
                    <FInput
                      value={data.avgViewsLast10 || ''}
                      onChange={v => onChange('avgViewsLast10', v)}
                      type="number"
                      placeholder="e.g. 85000 (Average views across recent 10 videos)"
                    />
                  </FL>
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Instagram</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FL label="Profile URL" full>
                    <FInput value={data.instaUrl || ''} onChange={v => onChange('instaUrl', v)} placeholder="https://instagram.com/handle" />
                  </FL>
                  <FL label="Handle">
                    <FInput value={data.instaHandle || ''} onChange={v => onChange('instaHandle', v)} placeholder="@handle" prefix="IG" />
                  </FL>
                  <FL label="Followers">
                    <FInput value={data.instaNum || ''} onChange={v => onChange('instaNum', v)} type="number" placeholder="e.g. 45000" />
                  </FL>
                </div>
              </div>

              {/* Other Links & Contact */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Social Links & Contact Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FL label="LinkedIn URL">
                    <FInput value={data.linkedinUrl || ''} onChange={v => onChange('linkedinUrl', v)} placeholder="https://linkedin.com/in/..." />
                  </FL>
                  <FL label="Twitter / X URL">
                    <FInput value={data.twitterUrl || ''} onChange={v => onChange('twitterUrl', v)} placeholder="https://x.com/handle" />
                  </FL>
                  <FL label="Website URL" full>
                    <FInput value={data.websiteUrl || ''} onChange={v => onChange('websiteUrl', v)} placeholder="https://yoursite.com" />
                  </FL>
                  <FL label="Business Email">
                    <FInput value={data.businessEmail || ''} onChange={v => onChange('businessEmail', v)} placeholder="collabs@creatornest.in" />
                  </FL>
                  <FL label="WhatsApp Number">
                    <FInput value={data.whatsappNumber || ''} onChange={v => onChange('whatsappNumber', v)} placeholder="+91 98765 43210" />
                  </FL>
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Display Settings</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Toggle checked={Boolean(data.show_on_home)} onChange={v => onChange('show_on_home', v)} label="Show on Home Page" />
                  <Toggle checked={Boolean(data.show_on_roster)} onChange={v => onChange('show_on_roster', v)} label="Show on Roster Page" />
                  <Toggle checked={Boolean(data.featured)} onChange={v => onChange('featured', v)} label="Featured (# Top Rated)" />
                  <Toggle checked={Boolean(data.topGrowing)} onChange={v => onChange('topGrowing', v)} label="Top Growing (Trending)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 flex-shrink-0 bg-[#0d1117]">
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

// ── Main Page ─────────────────────────────────────────────────
export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Creator | null>(null);

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

  const filtered = creators.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.niche?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q);
    const matchNiche = !filterNiche || c.niche === filterNiche || (c.niches && c.niches.includes(filterNiche));
    return matchSearch && matchNiche;
  });

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
      const res = await fetch('/api/admin/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Server error');
      showToast(`"${formData.name}" added!`);
      setShowAdd(false);
      fetchCreators();
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
      const res = await fetch('/api/admin/roster', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editCreator!.id, ...formData }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Server error');
      showToast(`"${formData.name}" updated!`);
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
      const res = await fetch(`/api/admin/roster?id=${deleteTarget.id}`, { method: 'DELETE' });
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
      const res = await fetch('/api/admin/roster', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: creator.id, field, value }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    } catch {
      setCreators(prev => prev.map(c => c.id === creator.id ? { ...c, [field]: !value } : c));
      showToast('Failed to update', 'error');
    }
  };

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

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <CreatorForm
            title="Onboard New Creator"
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
            title={`Edit: ${editCreator.name}`}
            data={formData}
            onChange={handleFieldChange}
            onSubmit={handleEdit}
            submitting={submitting}
            onClose={() => setEditCreator(null)}
            error={formError}
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
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Creator Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            {creators.length} creators · {creators.filter(c => c.show_on_home).length} on home · {creators.filter(c => c.show_on_roster).length} on roster
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
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Creator
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, category, location..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>
        <select
          value={filterNiche}
          onChange={e => setFilterNiche(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/50 appearance-none"
        >
          <option value="" style={{ background: '#0d1117' }}>All Categories</option>
          {TECH_NICHES.map(n => <option key={n} value={n} style={{ background: '#0d1117' }}>{n}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-black text-gray-500 border-b border-white/5">
                <th className="px-5 py-4">Creator</th>
                <th className="px-5 py-4">Categories</th>
                <th className="px-5 py-4">Reach</th>
                <th className="px-5 py-4">Avg Views (Last 10)</th>
                <th className="px-5 py-4">Rank</th>
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
                    <td colSpan={9} className="px-5 py-5"><div className="h-4 bg-white/5 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-gray-500 text-sm">
                    No creators found.{' '}
                    <button onClick={openAdd} className="text-cyan-400 hover:underline">Add one now →</button>
                  </td>
                </tr>
              ) : filtered.map(creator => (
                <tr key={creator.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Creator info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                        {creator.img ? (
                          <Image src={creator.img} alt={creator.name} fill className="object-cover object-top" unoptimized />
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
                        <div className="text-xs text-gray-500">{creator.location}</div>
                      </div>
                    </div>
                  </td>

                  {/* Niches / Categories */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(creator.niches && creator.niches.length > 0 ? creator.niches : [creator.niche]).map(n => (
                        <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium whitespace-nowrap">
                          {n}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Reach */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      {creator.youtubeNum > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <Video className="w-3 h-3 text-red-400 flex-shrink-0" />
                          {formatNum(creator.youtubeNum)}
                        </div>
                      )}
                      {creator.instaNum > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <Camera className="w-3 h-3 text-pink-400 flex-shrink-0" />
                          {formatNum(creator.instaNum)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Avg Views Last 10 Videos */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-emerald-400">
                      {creator.avgViewsLast10 ? formatNum(creator.avgViewsLast10) : '—'}
                    </span>
                  </td>

                  {/* Rank */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-400 font-mono">#{creator.rank}</span>
                  </td>

                  {/* Home Toggle */}
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggle(creator, 'show_on_home', !creator.show_on_home)}
                      className={`p-1.5 rounded-lg transition-colors ${creator.show_on_home ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                      title={creator.show_on_home ? 'Shown on home' : 'Hidden from home'}
                    >
                      <Home className="w-4 h-4" />
                    </button>
                  </td>

                  {/* Roster Toggle */}
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggle(creator, 'show_on_roster', !creator.show_on_roster)}
                      className={`p-1.5 rounded-lg transition-colors ${creator.show_on_roster ? 'text-purple-400 bg-purple-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      {creator.show_on_roster ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Featured Toggle */}
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggle(creator, 'featured', !creator.featured)}
                      className={`p-1.5 rounded-lg transition-colors text-base ${creator.featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      ★
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(creator)}
                        className="p-2 rounded-xl hover:bg-cyan-400/10 text-gray-500 hover:text-cyan-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(creator)}
                        className="p-2 rounded-xl hover:bg-red-400/10 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-600">
          {filtered.length} of {creators.length} creators ·{' '}
          <Link href="/admin/roster" className="text-cyan-400 hover:underline">Arrange display order →</Link>
        </div>
      </div>
    </div>
  );
}
