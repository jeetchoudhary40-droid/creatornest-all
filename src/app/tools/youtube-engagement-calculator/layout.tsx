import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YouTube Engagement Rate Calculator (Free by Views) | Creator Nest',
  description: 'Calculate your true YouTube engagement rate by views, likes, and comments. Free engagement checker with creator benchmarks, CPM viability score, and 1-click media kit export.',
  keywords: [
    'youtube engagement rate checker',
    'free youtube engagement rate calculator by views',
    'youtube er calculator',
    'influencer engagement rate benchmarks',
    'how to calculate youtube engagement rate',
    'youtube sponsorship calculator',
    'creator nest tools'
  ],
  alternates: {
    canonical: 'https://creatornest.in/tools/youtube-engagement-calculator',
  },
  openGraph: {
    title: 'YouTube Engagement Rate Calculator (Free by Views) | Creator Nest',
    description: 'Calculate your real YouTube engagement rate against verified industry benchmarks and turn your stats into a high-paying brand rate card.',
    url: 'https://creatornest.in/tools/youtube-engagement-calculator',
    type: 'website',
  },
};

export default function YouTubeEngagementCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
