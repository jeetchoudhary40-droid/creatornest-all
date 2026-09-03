'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BrandDealCalculator from '@/components/BrandDealCalculator';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, Calculator } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function BrandDealCalculatorPage() {
  const { isHindi } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col bg-[#070B11] text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-6 relative overflow-hidden border-b border-white/10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none -z-10 bg-emerald-500/15" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/marketplace" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> {isHindi ? 'मार्केटप्लेस' : 'Marketplace'}
            </Link>
            <span className="text-gray-600">/</span>
            <Link href="/tools" className="hover:text-primary transition-colors font-semibold">
              {isHindi ? 'एआई टूल्स' : 'AI Tools'}
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-primary font-bold">{isHindi ? 'ब्रांड डील प्राइसिंग कैलकुलेटर' : 'Brand Deal Pricing & Capacity Calculator'}</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-xl">
                <Calculator className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_0_8px_currentColor]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {isHindi ? 'फ्री क्रिएटर टूल' : 'Free Creator Tool'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/20">
                    {isHindi ? 'भारत 2026 एडिशन' : 'India 2026 Edition'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-primary" /> {isHindi ? 'सत्यापित 70/30 प्राइसिंग एल्गोरिदम' : 'Verified 70/30 Pricing Algorithm'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {isHindi ? 'ब्रांड डील प्राइसिंग व कैपेसिटी कैलकुलेटर' : 'Brand Deal Pricing & Capacity Calculator'}
                </h1>
                <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  {isHindi 
                    ? 'अपनी ब्रांड डील का सही रेट कार्ड (₹), प्रति-डिलीवरेबल प्राइसिंग, इफेक्टिव CPM और 13 केटेगरीज के अनुसार सही मार्केट वैल्यू जानें।'
                    : 'Calculate your exact creator rate card in ₹ (INR), deliverable pricing, effective CPM/CPE, and compare deliverable rates across 13 niches.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Calculator Engine */}
      <section className="py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BrandDealCalculator />
        </div>
      </section>

      <Footer />
    </main>
  );
}
