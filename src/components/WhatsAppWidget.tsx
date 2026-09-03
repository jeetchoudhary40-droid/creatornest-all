'use client';
// ============================================================
// Creator Nest — Smart Adaptive WhatsApp Widget
// Optimized for both Mobile (1-tap deep-link) & PC (WhatsApp Web + Instant QR Code)
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Sparkles, CheckCheck, Briefcase, Video, HelpCircle,
  QrCode, ExternalLink, Laptop, Smartphone, Copy, Check, Clock,
  MessageCircle, Zap, ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918766077505';

interface QuickOption {
  id: string;
  icon: typeof Video;
  label: string;
  sub: string;
  tag: string;
  msg: string;
}

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'qr'>('chat');
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // ── Device Detection & Time check ─────────────────────────
  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent || '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsMobile(mobileRegex.test(ua) || (isTouch && window.innerWidth < 768));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Calculate IST Time for online hours (9:00 AM to 10:00 PM IST)
    const checkWorkingHours = () => {
      const now = new Date();
      // IST is UTC + 5:30
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));
      const istHour = istDate.getHours();
      setIsOnline(istHour >= 9 && istHour < 22);
    };

    checkWorkingHours();
    const interval = setInterval(checkWorkingHours, 60000);

    return () => {
      window.removeEventListener('resize', checkDevice);
      clearInterval(interval);
    };
  }, []);

  // Show subtle notification prompt after 4s on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) setShowNotificationBadge(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  // ── Context-Aware Topics ──────────────────────────────────
  const quickOptions: QuickOption[] = useMemo(() => {
    const isRoster = pathname?.includes('/roster') || pathname?.includes('/creators');
    const isBrands = pathname?.includes('/brands');

    return [
      {
        id: 'creator',
        icon: Video,
        label: "I'm a Creator",
        sub: "Apply for exclusive talent management & brand deals",
        tag: "CREATOR DESK",
        msg: "Hi Creator Nest team! 👋 I'm a creator interested in joining your talent roster and scaling my channel sponsorships & brand deals.",
      },
      {
        id: 'brand',
        icon: Briefcase,
        label: isRoster ? "Book Creators from Roster" : "I'm a Brand / Agency",
        sub: isRoster ? "Inquire about rates & availability for top creators" : "Book verified creators for high-ROI campaigns",
        tag: isRoster ? "ROSTER BOOKING" : "BRAND CAMPAIGNS",
        msg: isRoster
          ? "Hi Creator Nest team! 🎬 We are looking to book creators from your roster for an upcoming brand campaign. Can you share availability & rate cards?"
          : "Hi Creator Nest team! 🏢 We are a brand looking to execute a high-ROI influencer marketing campaign with your creators.",
      },
      {
        id: 'digital_ip',
        icon: Sparkles,
        label: "Digital IP & Show Co-Production",
        sub: "Explore original show & podcast production",
        tag: "ORIGINAL IP",
        msg: "Hi Creator Nest team, I'd like to discuss co-producing an original Digital IP / branded content series with your creators.",
      },
      {
        id: 'general',
        icon: HelpCircle,
        label: "General Partnerships",
        sub: "Speak with our partnerships director",
        tag: "PARTNERSHIPS",
        msg: "Hello Creator Nest, I would like to learn more about your creator incubation and talent growth ecosystem.",
      },
    ];
  }, [pathname]);

  // ── Smart Launch Routing ──────────────────────────────────
  const getWhatsAppUrl = (message: string, targetMode?: 'web' | 'app') => {
    const cleanNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message || "Hi Creator Nest team! I'd like to connect.");

    if (isMobile || targetMode === 'app') {
      // Direct deep link for mobile/desktop app
      return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
    }
    // Direct WhatsApp Web for PC
    return `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
  };

  const launchWhatsApp = (message: string, mode?: 'web' | 'app') => {
    const url = getWhatsAppUrl(message, mode);
    window.open(url, '_blank', 'noopener,noreferrer');
    setHasInteracted(true);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    launchWhatsApp(customMsg.trim());
    setCustomMsg('');
    setIsOpen(false);
  };

  const handleSelectOption = (opt: QuickOption) => {
    launchWhatsApp(opt.msg);
    setIsOpen(false);
    setHasInteracted(true);
  };

  const activeMessage = customMsg.trim() || "Hi Creator Nest team! I'd like to connect with your talent & campaign desk.";
  const qrTargetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(activeMessage)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrTargetUrl)}&color=00f2fe&bgcolor=0a0e17&margin=8`;

  const copyMessageText = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end select-none">
      
      {/* ── Expanded WhatsApp Card ─────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-4 w-[92vw] sm:w-[410px] bg-[#0A0E17]/98 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            style={{ maxHeight: isMobile ? '82vh' : '620px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] p-4 text-white relative flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-white shadow-inner">
                      <span className="text-base tracking-wider">CN</span>
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-[#128C7E] rounded-full ${
                        isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-black text-white text-base leading-tight">Creator Nest Desk</h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    </div>
                    <p className="text-emerald-100 text-xs font-medium flex items-center gap-1 mt-0.5">
                      <Zap className="w-3 h-3 text-emerald-300" />
                      {isOnline ? 'Online Now · Replies in < 5 mins' : 'Offline · Replies at 9:00 AM IST'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop Tabs: Quick Chat vs QR Code */}
              {!isMobile && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/15 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'chat'
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>PC / Web Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('qr')}
                    className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'qr'
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan with Phone</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── TAB 1: Chat View (Default for Mobile & PC) ───── */}
            {activeTab === 'chat' ? (
              <>
                {/* Chat Body */}
                <div className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-[#0A0E17] to-[#06090F]">
                  {/* Agent Intro Bubble */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-sm p-3.5 text-xs text-gray-200 space-y-1.5 shadow-sm">
                    <p className="font-bold text-white flex items-center space-x-1.5">
                      <span>👋 Welcome to Creator Nest!</span>
                    </p>
                    <p className="text-gray-300 leading-relaxed text-[11px] sm:text-xs">
                      How can our team assist you today? Select a department below or type your brief for direct WhatsApp connection:
                    </p>
                  </div>

                  {/* Quick Preset Action Chips */}
                  <div className="space-y-2 pt-0.5">
                    {quickOptions.map(opt => {
                      const Icon = opt.icon;
                      return (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectOption(opt)}
                          className="w-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#25D366]/50 p-3 rounded-2xl flex items-start space-x-3 text-left transition-all group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] shrink-0 mt-0.5 group-hover:bg-[#25D366] group-hover:text-black transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#25D366] transition-colors truncate">
                                {opt.label}
                              </p>
                              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {opt.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-snug line-clamp-1 mt-0.5">
                              {opt.sub}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct PC Launch Actions (for Desktop users) */}
                {!isMobile && (
                  <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Direct connection options:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => launchWhatsApp(customMsg || "Hi Creator Nest team!", 'web')}
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> WhatsApp Web
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => launchWhatsApp(customMsg || "Hi Creator Nest team!", 'app')}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Laptop className="w-3 h-3" /> App
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Message Composer Footer */}
                <form onSubmit={handleSendCustom} className="p-3 bg-[#080B10] border-t border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    value={customMsg}
                    onChange={e => setCustomMsg(e.target.value)}
                    placeholder="Type your brief or question..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#25D366]/60 transition-colors"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#159a8b] hover:to-[#28e670] text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#25D366]/20 active:scale-95 shrink-0"
                    aria-label="Send WhatsApp message"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              /* ── TAB 2: Instant QR Code (For PC Users) ───────── */
              <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-[#0A0E17] to-[#06090F] flex-1 text-center">
                <div>
                  <h5 className="font-bold text-white text-sm">Scan to Chat from Your Phone</h5>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Point your phone camera or WhatsApp scanner to connect instantly
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="p-3 rounded-2xl bg-[#0A0E17] border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(0,242,254,0.2)] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeImageUrl}
                    alt="WhatsApp QR Code"
                    width={180}
                    height={180}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyMessageText}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Link!' : 'Copy WhatsApp Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchWhatsApp(activeMessage, 'web')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Web</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Trigger Button ──────────────────────────── */}
      <div className="relative flex items-center">
        {/* Floating Tooltip Pill (when closed) */}
        {!isOpen && showNotificationBadge && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center space-x-2 bg-[#0E131F]/90 backdrop-blur-md border border-[#25D366]/40 text-white text-xs font-bold py-2 px-3.5 rounded-full mr-3 shadow-xl pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span>Chat on WhatsApp</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasInteracted(true);
            setShowNotificationBadge(false);
          }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] border-2 border-white/20 transition-transform cursor-pointer"
          aria-label="Open WhatsApp live chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center justify-center"
              >
                {/* Official WhatsApp SVG Icon */}
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread Alert Ping */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-background"></span>
            </span>
          )}
        </motion.button>
      </div>

    </div>
  );
}
