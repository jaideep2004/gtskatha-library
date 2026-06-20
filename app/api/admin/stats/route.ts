import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Katha from '@/models/Katha';
import User from '@/models/User';
import Series from '@/models/Series';
import Category from '@/models/Category';
import UserNotification from '@/models/UserNotification';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const results = await Promise.allSettled([
      Katha.countDocuments(),                                                          // 0: kathaCount
      Katha.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),        // 1: totalViews
      User.countDocuments(),                                                           // 2: userCount
      Series.countDocuments(),                                                         // 3: seriesCount
      Category.countDocuments(),                                                       // 4: categoryCount
      UserNotification.countDocuments({ isRead: false }),                             // 5: unreadNotificationCount
      Katha.find().sort({ createdAt: -1 }).limit(10)
        .select('title slug type createdAt').lean(),                                   // 6: recentActivity
    ]);

    function getValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
      return result.status === 'fulfilled' ? result.value : fallback;
    }

    const kathaCount = getValue(results[0], null as unknown as number);
    const viewsAgg = getValue(results[1], []) as Array<{ total: number }>;
    const totalViews = viewsAgg[0]?.total ?? 0;
    const userCount = getValue(results[2], null as unknown as number);
    const seriesCount = getValue(results[3], null as unknown as number);
    const categoryCount = getValue(results[4], null as unknown as number);
    const unreadNotificationCount = getValue(results[5], null as unknown as number);
    const recentActivity = getValue(results[6], []) as Array<{
      title: string;
      slug: string;
      type: string;
      createdAt: Date;
    }>;

    return NextResponse.json({
      success: true,
      data: {
        kathaCount: results[0].status === 'fulfilled' ? kathaCount : null,
        totalViews: results[1].status === 'fulfilled' ? totalViews : null,
        userCount: results[2].status === 'fulfilled' ? userCount : null,
        seriesCount: results[3].status === 'fulfilled' ? seriesCount : null,
        categoryCount: results[4].status === 'fulfilled' ? categoryCount : null,
        unreadNotificationCount: results[5].status === 'fulfilled' ? unreadNotificationCount : null,
        recentActivity: results[6].status === 'fulfilled' ? recentActivity : null,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/stats', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
