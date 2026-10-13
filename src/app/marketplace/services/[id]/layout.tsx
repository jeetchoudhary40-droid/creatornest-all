import { Metadata } from 'next';
import { ITEMS, getServiceSlug, slugify, SERVICE_ID_BY_SLUG, SERVICE_SLUG_MAP } from '@/app/marketplace/marketData';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cleanId = (id || '').trim().toLowerCase();

  const service = ITEMS.find((item) => {
    if (item.type !== 'service') return false;
    const itemSlug = (item.slug || getServiceSlug(item)).toLowerCase();
    const itemId = String(item.id).toLowerCase();
    return (
      itemSlug === cleanId ||
      itemId === cleanId ||
      slugify(item.title) === cleanId ||
      SERVICE_ID_BY_SLUG[cleanId] === itemId ||
      SERVICE_SLUG_MAP[cleanId] === itemSlug
    );
  });

  if (!service) {
    return {
      title: 'Creator Service | Creator Nest',
      description: 'Hire vetted creator professionals and specialists on Creator Nest.',
    };
  }

  const slug = service.slug || getServiceSlug(service);
  const canonicalUrl = `https://creatornest.in/marketplace/services/${slug}`;
  const title = `${service.title} | Done-For-You Creator Service | Creator Nest`;
  const description = service.desc || 'Professional done-for-you service for YouTube, Instagram, and digital creators.';

  return {
    title: { absolute: title },
    description,
    keywords: [
      service.title,
      service.category,
      'Creator Services',
      'Done-For-You',
      'YouTube Management',
      'Instagram Management',
      'Creator Nest',
      ...(service.tags || []),
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Creator Nest',
      type: 'website',
      images: service.thumbnailUrl
        ? [{ url: service.thumbnailUrl, width: 1200, height: 630, alt: service.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: service.thumbnailUrl ? [service.thumbnailUrl] : undefined,
    },
  };
}

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
