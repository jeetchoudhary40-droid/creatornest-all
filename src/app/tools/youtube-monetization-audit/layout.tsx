import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YouTube Monetization Channel Audit Tool (Free YPP Checker) | Creator Nest',
  description: 'Run a deep AI audit on any YouTube channel. Check 1,000 subscriber and 4,000 watch hour YPP eligibility, get 12-point policy compliance matrix, Indian CPM revenue projections in ₹ INR, and a prioritized action plan.',
  keywords: [
    'youtube monetization channel audit',
    'youtube partner program eligibility checker',
    'ypp audit tool',
    'youtube watch hours checker',
    'youtube revenue calculator india inr',
    'youtube monetization policy audit',
    'ai youtube channel audit',
    'creator nest ai tools'
  ],
  alternates: {
    canonical: 'https://creatornest.in/tools/youtube-monetization-audit',
  },
  openGraph: {
    title: 'YouTube Monetization Channel Audit Tool (Free YPP Checker) | Creator Nest',
    description: 'Comprehensive AI audit for YouTube channels: YPP eligibility checklist, 12-point compliance matrix, monthly ad revenue projections in ₹ INR, and prioritized action plan.',
    url: 'https://creatornest.in/tools/youtube-monetization-audit',
    type: 'website',
  },
};

export default function YouTubeMonetizationAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
