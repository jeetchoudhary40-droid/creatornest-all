import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Marketplace | AI Tools, Masterclasses & Creator Templates',
  description: 'Curated AI tools, certified creator masterclasses, production scaling services, and high-converting templates for digital creators and brands.',
  keywords: [
    'creator marketplace india',
    'ai tools for creators',
    'creator templates',
    'youtube tools',
    'instagram reels scripts',
    'creator skool',
    'creator nest marketplace'
  ],
  alternates: {
    canonical: 'https://creatornest.in/marketplace',
  },
  openGraph: {
    title: 'Creator Marketplace | AI Tools, Masterclasses & Creator Templates — Creator Nest',
    description: 'Curated AI tools, verified masterclasses, and high-converting creator templates to scale your brand.',
    url: 'https://creatornest.in/marketplace',
    type: 'website',
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
