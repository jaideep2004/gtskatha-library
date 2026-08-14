import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
