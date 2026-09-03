import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Partner with Creator Nest Ecosystem',
  description: 'Get in touch with Creator Nest. Contact our talent directors, brand partnership team, and campaign strategists directly for tech creator management and SaaS sponsorships.',
  keywords: [
    'contact creator nest',
    'tech creator management',
    'saas brand partnerships',
    'influencer marketing inquiry',
    'creator management contact',
    'hire tech creator agency india'
  ],
  alternates: {
    canonical: 'https://creatornest.in/contact',
  },
  openGraph: {
    title: 'Contact Us | Creator Nest Ecosystem',
    description: 'Get in touch with our team for exclusive tech creator representation and high-converting B2B & SaaS campaigns.',
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
