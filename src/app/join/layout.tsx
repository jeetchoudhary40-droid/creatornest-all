import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join the Ecosystem | Apply as Creator, Brand, or Creative Talent',
  description: 'Apply to join Creator Nest. Whether you are a creator aiming for scale and brand deals, a brand looking for high-ROI influencer marketing campaigns, or top creative talent (video editors, DOPs).',
  keywords: [
    'join creator nest',
    'apply as creator',
    'creator management application',
    'influencer agency onboarding',
    'brand partnership application',
    'hire video editors',
    'creator economy jobs'
  ],
  alternates: {
    canonical: 'https://creatornest.in/join',
  },
  openGraph: {
    title: 'Join the Ecosystem | Creator Nest',
    description: 'Partner with India\'s premier creator growth agency. Apply as a creator, brand partner, or creative talent.',
    url: 'https://creatornest.in/join',
    type: 'website',
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
