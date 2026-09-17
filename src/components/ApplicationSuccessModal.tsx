'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MessageSquare, Sparkles, X, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  name?: string;
  role?: string;
  source?: string;
  title?: string;
  message?: string;
}

export default function ApplicationSuccessModal({
  isOpen,
  onClose,
  name,
  role,
  title = 'Application Received!',
  message = 'Thank you for sharing your details. Our talent management desk has received your submission and will review your profile shortly.',
}: ApplicationSuccessModalProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918766077505';

  // Haptic feedback on mobile when confirmation appears
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 80, 40]);
      } catch (_) {
        // Ignore devices that block vibration
      }
    }
  }, [isOpen]);

  const waText = encodeURIComponent(
    `Hi CreatorNest! 👋 I just submitted my application${name ? ` (Name: *${name}*)` : ''}${role ? ` for *${role}*` : ''}. Excited to connect with your talent desk!`
  );
  const waUrl = `https://wa.me/${whatsappNumber}?text=${waText}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-[#0B0F17] border border-primary/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,242,254,0.25)] text-center overflow-hidden z-10 my-auto"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-secondary" />

            {/* Close Icon Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close confirmation"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing Icon Badge */}
            <div className="relative mx-auto w-20 h-20 mb-5">
              <div className="absolute inset-0 bg-primary/25 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-primary/15 border-2 border-primary/40 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Status Pills */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 border border-primary/25 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Status: Successfully Dispatched</span>
            </div>

            {/* Main Title */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              {title}
            </h3>

            {/* Personalized Name Greeting if Available */}
            {name && (
              <p className="text-primary font-semibold text-sm sm:text-base mb-2">
                Welcome to the Nest, {name}!
              </p>
            )}

            {/* Description */}
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
              {message}
            </p>

            {/* Info Badges */}
            <div className="grid grid-cols-2 gap-2.5 bg-white/[0.03] border border-white/5 p-3.5 rounded-2xl mb-6 text-left text-xs">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-400 text-[11px]">Response Window</div>
                  <div className="text-white font-semibold">Within 24 Hours</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-400 text-[11px]">Channels</div>
                  <div className="text-white font-semibold">WhatsApp & Email</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.35)] active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Instant WhatsApp Track</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition-all border border-white/10 cursor-pointer active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
