import { MetadataRoute } from 'next';
import { ITEMS } from './marketplace/marketData';
import { STATIC_POSTS } from './blog/blogData';

export default function sitemap(): MetadataRoute.Sitemap {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creatornest.in';
  // Always guarantee production domain for search engine indexing
  const siteUrl = (rawSiteUrl.includes('localhost') || !rawSiteUrl.startsWith('http'))
    ? 'https://creatornest.in'
    : rawSiteUrl.replace(/\/$/, '');

  // Base static high-priority routes
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/creators/roster', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/marketplace', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/tools/media-kit-builder', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/tools/youtube-engagement-calculator', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/tools/brand-deal-calculator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/nschool', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/prompts', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/templates', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/brands', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/creators', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/join', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/join/careers', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/pricing', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/services', priority: 0.7, changeFrequency: 'monthly' as const },
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
    priority: 0.7,
  }));

  // Dynamic tool & template detail pages
  const dynamicItems = ITEMS.filter(item => item.type === 'tool' || item.type === 'template').map((item) => ({
    url: `${siteUrl}/marketplace/item/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic course detail pages
  const dynamicCourses = ITEMS.filter(item => item.type === 'course').map((course) => ({
    url: `${siteUrl}/nschool/course/${course.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic blog detail pages
  const dynamicBlogPosts = STATIC_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticSitemaps, ...dynamicServices, ...dynamicItems, ...dynamicCourses, ...dynamicBlogPosts];
}

