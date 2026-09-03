import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | India’s Premier Creator Growth Agency & Influencer Ecosystem',
  description: 'Learn about Creator Nest — our mission, leadership, and proven framework turning raw digital talent into high-grossing, iconic creator brands with ₹5Cr+ in closed brand deals.',
  keywords: [
    'about creator nest',
    'creator management company',
    'influencer marketing founders',
    'creator economy india',
    'top influencer agencies mission'
  ],
  alternates: {
    canonical: 'https://creatornest.in/about',
  },
  openGraph: {
    title: 'About Us | Creator Nest — India’s Creator Growth Ecosystem',
    description: 'We turn raw talent into scalable, monetizable brands. 100+ Creators. ₹5Cr+ in Brand Deals Closed.',
    url: 'https://creatornest.in/about',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
