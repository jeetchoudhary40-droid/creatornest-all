import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Creator Nest',
    short_name: 'Creator Nest',
    description: "India's premier creator growth ecosystem & creators' first choice for brand deals.",
    start_url: '/',
    display: 'standalone',
    background_color: '#070B11',
    theme_color: '#00F2FE',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
