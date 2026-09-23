import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Deal Pricing & Capacity Calculator | Creator Nest',
  description: 'Calculate your exact creator rate card in ₹, deliverable pricing, CPM/CPE, and compare rates across 13 niches for YouTube & Instagram.',
  keywords: [
    'brand deal calculator',
    'creator rate card calculator',
    'influencer pricing india',
    'youtube sponsorship calculator',
    'instagram deliverable rates',
    'cpm cpe calculator'
  ],
  alternates: {
    canonical: 'https://creatornest.in/tools/brand-deal-calculator',
  },
  openGraph: {
    title: 'Brand Deal Pricing & Capacity Calculator — Creator Nest',
    description: 'Calculate your exact creator rate card in ₹ and deliverable pricing for brand sponsorships.',
    url: 'https://creatornest.in/tools/brand-deal-calculator',
    type: 'website',
  },
};

export default function BrandDealCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
