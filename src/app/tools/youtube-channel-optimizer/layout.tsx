import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI YouTube Channel Policy Optimizer & Automation Engine | Creator Nest',
  description: 'Automated YouTube Partner Program audit, monetization policy compliance, AI metadata optimizer with human-in-the-loop review queue and one-click rollback.',
  alternates: {
    canonical: 'https://creatornest.in/tools/youtube-channel-optimizer',
  },
  openGraph: {
    title: 'AI YouTube Channel Policy Optimizer & Automation Engine | Creator Nest',
    description: 'Automated YouTube Partner Program audit, monetization policy compliance, and SEO metadata optimizer with human review queue.',
    url: 'https://creatornest.in/tools/youtube-channel-optimizer',
    siteName: 'Creator Nest',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
