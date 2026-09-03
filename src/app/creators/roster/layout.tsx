import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Roster | Top Indian Creators & Influencers for Brand Deals',
  description: 'Explore the official Creator Nest talent roster. Discover top Indian YouTubers, Instagram influencers, Tech, Finance, Gaming, and Lifestyle creators available for high-converting brand sponsorships.',
  keywords: [
    'creator roster',
    'indian creators list',
    'top youtubers in india',
    'hire instagram influencers',
    'influencer marketing roster',
    'tech creators india',
    'finance creators india',
    'gaming creators roster',
    'brand sponsorships creator list',
    'creator nest roster'
  ],
  alternates: {
    canonical: 'https://creatornest.in/creators/roster',
  },
  openGraph: {
    title: 'Creator Roster | Top Indian Creators & Influencers — Creator Nest',
    description: 'Explore verified Indian creators with high engagement. Partner with top talent across YouTube, Instagram, and podcasts for high-converting campaigns.',
    url: 'https://creatornest.in/creators/roster',
    type: 'website',
  },
};

export default function RosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
