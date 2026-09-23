import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Membership Plans | Creator Nest Growth Ecosystem',
  description: 'Flexible creator plans from Free to Platinum. Unlock unlimited AI tools, masterclasses, templates, and dedicated talent management.',
  keywords: [
    'creator nest pricing',
    'creator membership plans',
    'ai tools pricing',
    'creator economy membership'
  ],
  alternates: {
    canonical: 'https://creatornest.in/pricing',
  },
  openGraph: {
    title: 'Pricing & Plans | Creator Nest Growth Ecosystem',
    description: 'Flexible creator plans from Free to Platinum. Unlock tools, masterclasses, and brand deals.',
    url: 'https://creatornest.in/pricing',
    type: 'website',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
