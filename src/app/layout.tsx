import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
  ? process.env.NEXT_PUBLIC_SITE_URL
  : 'https://creatornest.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Creator Nest | Fueling Creators to Become Brands",
    template: "%s | Creator Nest",
  },
  applicationName: "Creator Nest",
  appleWebApp: {
    title: "Creator Nest",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  description: "Creator Nest is India’s premier creator growth ecosystem and creators’ first choice for brand deals. Turning passionate creators into iconic household brands with high-trust partnerships.",
  keywords: [
    "creator nest",
    "creator management agency",
    "creator economy india",
    "fueling creators to become brands",
    "creators first choice brand deals",
    "creator growth ecosystem india",
    "influencer marketing agency india",
    "top talent management agency",
    "brand deals for creators",
    "education creators india",
    "tech influencer agency",
    "entertainment creators",
    "lifestyle influencers",
    "gaming creators agency",
    "youtube creator management",
    "instagram influencer agency",
    "creator monetization platform",
    "creator roster india"
  ],
  authors: [{ name: "Creator Nest", url: "https://creatornest.in" }],
  creator: "Creator Nest",
  publisher: "Creator Nest",
  formatDetection: {
    email: true,
    telephone: true,
    address: true,
  },
  alternates: {
    canonical: 'https://creatornest.in/',
  },
  openGraph: {
    title: "Creator Nest | Fueling Creators to Become Brands",
    description: "Creator Nest is India’s premier creator growth ecosystem and creators’ first choice for brand deals. Turning passionate creators into iconic household brands.",
    url: "https://creatornest.in/",
    siteName: "Creator Nest",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Creator Nest — Fueling Creators to Become Brands",
      }
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Nest | Fueling Creators to Become Brands",
    description: "Creator Nest is India’s premier creator growth ecosystem and creators’ first choice for brand deals. 100+ Creators. ₹5Cr+ Brand Deals Closed.",
    images: ["/images/og-cover.png"],
    creator: "@creatornest",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  category: "technology, marketing, creator economy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B0F14",
};

import Providers from "./providers";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://creatornest.in/#organization',
  name: 'Creator Nest',
  legalName: 'Creator Nest',
  alternateName: ['CreatorNest', 'Creator Nest India', 'CreatorNest Media'],
  url: 'https://creatornest.in/',
  logo: {
    '@type': 'ImageObject',
    '@id': 'https://creatornest.in/#logo',
    url: 'https://creatornest.in/icon-512.png',
    caption: 'Creator Nest',
    width: 512,
    height: 512,
  },
  image: 'https://creatornest.in/images/og-cover.png',
  description: "Creator Nest is India’s premier creator growth ecosystem and the #1 trusted network for digital creators and brands. Born to fuel creators into iconic household brands, Creator Nest bridges ambitious talent across Tech, Education, Gaming, Lifestyle, and Entertainment with high-ROI brand deals, production scaling, and transparent contracts.",
  sameAs: [
    'https://www.instagram.com/creatornestmedia/',
    'https://www.youtube.com/@CreatorNestMedia',
    'https://twitter.com/creatornest',
    'https://linkedin.com/company/creatornest'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91 9460990011',
    contactType: 'customer service',
    email: 'hello@creatornest.in',
    areaServed: 'IN',
    availableLanguage: ['en', 'hi']
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN'
  },
  knowsAbout: [
    'Influencer Marketing',
    'Creator Economy',
    'Brand Deals & Sponsorships',
    'Talent Management',
    'YouTube Creator Strategy',
    'Instagram Influencer Campaigns',
    'UGC Video Ads'
  ]
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://creatornest.in/#website',
  name: 'Creator Nest',
  alternateName: ['CreatorNest', 'Creator Nest India', 'CreatorNest Media', 'The Creator Nest'],
  url: 'https://creatornest.in/',
  inLanguage: 'en-IN',
  publisher: {
    '@id': 'https://creatornest.in/#organization'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BXMTNP8PSS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-BXMTNP8PSS');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        <Providers>
          {children}
          <ScrollToTopButton />
          <WhatsAppWidget />
        </Providers>
      </body>
    </html>
  );
}
