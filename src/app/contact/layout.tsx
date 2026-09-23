import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Partner with Creator Nest Ecosystem',
  description: 'Get in touch with Creator Nest. Contact our talent directors, brand partnership team, and campaign strategists directly for creator talent management and high-impact brand sponsorships.',
  keywords: [
    'contact creator nest',
    'creator talent management',
    'influencer brand partnerships',
    'creator rate card inquiries',
    'brand sponsorship agency',
    'hire content creators india',
    'influencer marketing campaigns'
  ],
  alternates: {
    canonical: 'https://creatornest.in/contact',
  },
  openGraph: {
    title: 'Contact Us | Creator Nest Ecosystem',
    description: 'Get in touch with our team for exclusive creator talent representation and high-converting brand partnership campaigns.',
    url: 'https://creatornest.in/contact',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
