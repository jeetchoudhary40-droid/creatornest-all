import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creatornest.in';
  const siteUrl = (rawSiteUrl.includes('localhost') || !rawSiteUrl.startsWith('http'))
    ? 'https://creatornest.in'
    : rawSiteUrl.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/dashboard/',
        '/profile',
        '/auth/',
        '/creators/dashboard/',
        '/brands/dashboard/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

