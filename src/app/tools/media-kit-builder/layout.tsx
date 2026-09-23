import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Influencer Media Kit & Creator Rate Card Generator | Creator Nest',
  description: 'Create a live, mobile-responsive influencer media kit and dynamic creator rate card in seconds. Includes brand deal pricing engine, lead capture CRM with UTM tracking, and standardized brand sponsorship contracts.',
  keywords: [
    'influencer media kit',
    'creator rate card',
    'youtube sponsorship calculator',
    'instagram pricing calculator',
    'media kit generator for content creators',
    'how to create an influencer media kit for brands',
    'influencer rate card template pdf excel',
    'how to track brand deals',
    'influencer brand agreement',
    'creator crm'
  ],
  alternates: {
    canonical: 'https://creatornest.in/tools/media-kit-builder',
  },
  openGraph: {
    title: 'Influencer Media Kit & Creator Rate Card Generator | Creator Nest',
    description: 'Build your live no-code media kit with dynamic rate card, brand deal CRM, and legal agreements.',
    url: 'https://creatornest.in/tools/media-kit-builder',
    type: 'website',
  },
};

export default function MediaKitBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
