export type Language = 'en' | 'hi';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // ── Navbar ──
  nav_home: { en: 'Home', hi: 'होम' },
  nav_roster: { en: 'Roster', hi: 'क्रिएटर रोस्टर' },
  nav_marketplace: { en: 'Market Place', hi: 'मार्केटप्लेस' },
  nav_about: { en: 'About Us', hi: 'हमारे बारे में' },
  nav_contact: { en: 'Contact Us', hi: 'संपर्क करें' },
  nav_login: { en: 'Login', hi: 'लॉग इन' },
  nav_register: { en: 'Join Roster', hi: 'ज्वाइन करें' },
  nav_dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  nav_logout: { en: 'Sign Out', hi: 'लॉग आउट' },
  nav_switch_lang: { en: 'English', hi: 'हिंदी' },

  // ── Common CTAs ──
  btn_calculate: { en: 'Calculate My Brand Deal Pricing', hi: 'मेरी ब्रांड डील प्राइसिंग कैलकुलेट करें' },
  btn_try_free: { en: 'Try Free', hi: 'फ्री में इस्तेमाल करें' },
  btn_read_free: { en: 'Read Free Guide', hi: 'फ्री गाइड पढ़ें' },
  btn_enroll: { en: 'Enroll Now', hi: 'अभी शुरू करें' },
  btn_copy: { en: 'Copy Template', hi: 'टेम्पलेट कॉपी करें' },
  btn_copied: { en: 'Copied!', hi: 'कॉपी हो गया!' },
  btn_prev: { en: 'Previous Chapter', hi: 'पिछला अध्याय' },
  btn_next: { en: 'Next Chapter', hi: 'अगला अध्याय' },
  btn_mark_complete: { en: 'Mark Complete', hi: 'पूरा मार्क करें' },
  btn_completed: { en: 'Completed', hi: 'पूरा हो गया' },
  btn_open_calc: { en: 'Open Calculator', hi: 'कैलकुलेटर खोलें' },

  // ── Brand Deal Calculator ──
  calc_title: { en: 'Brand Deal Pricing & Channel Capacity Calculator', hi: 'ब्रांड डील प्राइसिंग व चैनल कैपेसिटी कैलकुलेटर' },
  calc_subtitle: { en: 'Discover your true sponsorship value in ₹ based on 2026 Indian creator benchmarks.', hi: '2026 के भारतीय क्रिएटर बेंचमार्क के आधार पर अपनी ब्रांड डील की असली कीमत (₹) जानें।' },
  calc_platform: { en: 'Select Primary Platform', hi: 'अपना मुख्य प्लेटफॉर्म चुनें' },
  calc_handle_yt: { en: 'YouTube Channel Handle or Link', hi: 'यूट्यूब चैनल हैंडल या लिंक' },
  calc_handle_ig: { en: 'Instagram Profile Handle', hi: 'इंस्टाग्राम प्रोफाइल हैंडल' },
  calc_handle_ph_yt: { en: 'e.g. @TechGuideHindi or channel link', hi: 'उदा. @TechGuideHindi या चैनल लिंक' },
  calc_handle_ph_ig: { en: 'e.g. @creatorshub.in', hi: 'उदा. @creatorshub.in' },
  calc_handle_req: { en: 'Please enter your handle or channel link to calculate pricing.', hi: 'प्राइसिंग कैलकुलेट करने के लिए कृपया अपना हैंडल या लिंक दर्ज करें।' },
  calc_followers: { en: 'Total Followers / Subscribers', hi: 'कुल सब्सक्राइबर्स / फॉलोअर्स' },
  calc_views: { en: 'Average Organic Views Per Post / Video', hi: 'प्रति वीडियो / पोस्ट औसत व्यूज' },
  calc_niche: { en: 'Select Content Niche', hi: 'अपनी कंटेंट केटेगरी (Niche) चुनें' },
  calc_audience_geo: { en: 'Audience Geographic Demographics', hi: 'ऑडियंस शहर केटेगरी (City Tier)' },
  calc_one_deal_hero: { en: 'Estimated 1-Deal Sponsorship Fee', hi: '1 ब्रांड डील की अनुमानित कमाई' },
  calc_one_deal_sub: { en: 'Fair market commercial rate for one dedicated branded deliverable.', hi: 'एक डेडिकेटेड ब्रांडेड वीडियो / रील के लिए सही व निष्पक्ष मार्केट रेट।' },
  calc_dedicated: { en: 'Dedicated Full Video', hi: 'फुल डेडिकेटेड वीडियो' },
  calc_integrated: { en: 'Integrated Mid-Roll Mention', hi: 'इंटीग्रेटेड मिड-रोल (60-90s)' },
  calc_stories: { en: '3-Frame Story Set + Link', hi: '3-फ्रेम स्टोरी सेट + लिंक' },
  calc_retainer: { en: 'Monthly Brand Ambassador Retainer', hi: 'मंथली ब्रांड एंबेसडर पार्टनरशिप' },
  calc_disclaimer_title: { en: 'Testing Phase & Market Variance Notice', hi: 'टेस्टिंग फेज व डिस्क्लेमर सूचना' },
  calc_disclaimer_text: { en: 'Our pricing engine uses 2026 Indian creator benchmarks. Final commercial payouts may vary depending on brand marketing budgets, negotiation, and deliverable scope.', hi: 'हमारा प्राइसिंग इंजन 2026 के भारतीय क्रिएटर डेटा पर आधारित है। अंतिम पेमेंट ब्रांड के बजट, बातचीत और काम के आधार पर भिन्न हो सकती है।' },

  // ── Marketplace & Creator Skool ──
  market_all: { en: 'All Assets', hi: 'सभी रिसोर्सेज' },
  market_tools: { en: 'AI Tools', hi: 'एआई टूल्स' },
  market_skillup: { en: 'Creator Skool', hi: 'क्रिएटर स्कूल' },
  market_templates: { en: 'Templates', hi: 'टेम्पलेट्स' },
  market_services: { en: 'Creator Services', hi: 'क्रिएटर सर्विसेज' },
  market_search_ph: { en: 'Search AI tools, courses, templates...', hi: 'एआई टूल्स, कोर्सेज, टेम्पलेट्स खोजें...' },

  // ── Course Player ──
  course_overview: { en: 'Overview & Reading Guide', hi: 'विवरण व हिंदी-इंग्लिश गाइड' },
  course_resources: { en: 'Templates & Resources', hi: 'टेम्पलेट्स व रिसोर्सेज' },
  course_qna: { en: 'Creator Discussion', hi: 'क्रिएटर कम्युनिटी चर्चा' },
  course_rate: { en: 'Rate Masterclass', hi: 'कोर्स को रेटिंग दें' },
  course_reading_time: { en: 'Reading Guide', hi: 'रीडिंग गाइड' },
  course_calculator_cta: { en: 'Calculate Your Brand Deal Rates', hi: 'अपनी ब्रांड डील प्राइसिंग कैलकुलेट करें' },
  course_calculator_sub: { en: 'Use Creator Nest’s India 2026 pricing engine to calculate your exact 1-deal fee in ₹.', hi: 'क्रिएटर नेस्ट के 2026 प्राइसिंग कैलकुलेटर से अपनी सही डील प्राइस (₹) जानें।' }
};
