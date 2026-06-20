import type { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import Katha from '@/models/Katha';
import Series from '@/models/Series';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const staticRoutes = ['', '/audio', '/video', '/series', '/topics', '/search', '/terms', '/privacy', '/disclaimer'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? 'daily' as const : 'hourly' as const,
    priority: path ? 0.8 : 1,
  }));

  try {
    await connectDB();
    const [kathas, series] = await Promise.all([
      Katha.find({
        status: { $ne: 'archived' },
        $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
      }).select('slug type updatedAt createdAt').lean(),
      Series.find({ archived: { $ne: true } }).select('slug').lean(),
    ]);

    return [
      ...staticRoutes,
      ...kathas.map((katha) => ({
        url: `${baseUrl}/${katha.type}/${katha.slug}`,
        lastModified: katha.updatedAt || katha.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })),
      ...series.map((item) => ({
        url: `${baseUrl}/series/${item.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
