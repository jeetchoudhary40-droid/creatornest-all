import { MetadataRoute } from 'next';
import { ITEMS } from './marketplace/marketData';
import { STATIC_POSTS } from './blog/blogData';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creatornest.in';

  // Base static routes
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/marketplace', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/tools/media-kit-builder', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/tools/youtube-engagement-calculator', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/tools/brand-deal-calculator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/creators/roster', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/join', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/brands', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/creators', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/services', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const staticSitemaps = routes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Dynamic service detail pages
  const dynamicServices = ITEMS.filter(item => item.type === 'service').map((service) => ({
    url: `${siteUrl}/marketplace/services/${service.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic tool detail pages
  const dynamicTools = ITEMS.filter(item => item.type === 'tool').map((tool) => ({
    url: `${siteUrl}/marketplace/item/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic blog detail pages
  const dynamicBlogPosts = STATIC_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticSitemaps, ...dynamicServices, ...dynamicTools, ...dynamicBlogPosts];
}
