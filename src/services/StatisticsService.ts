/**
 * Statistics Service
 * 获取网站统计数据
 */

import { count, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { campaigns, platforms, reactions } from '@/models/Schema';

export type Statistics = {
  totalCampaigns: number;
  activePlatforms: number;
  communityContributions: number;
};

/**
 * 获取网站统计数据
 * Optimized: Parallel queries instead of sequential
 */
export async function getStatistics(): Promise<Statistics> {
  try {
    // 并行执行所有查询
    const [campaignsResult, platformsResult, reactionsResult] = await Promise.all([
      // 获取已发布的活动数量
      db.select({ count: count() }).from(campaigns).where(eq(campaigns.status, 'published')),
      // 获取活跃平台数量
      db.select({ count: count() }).from(platforms),
      // 获取社区贡献数量（反馈数）
      db.select({ count: count() }).from(reactions),
    ]);

    return {
      totalCampaigns: campaignsResult[0]?.count || 0,
      activePlatforms: platformsResult[0]?.count || 0,
      communityContributions: reactionsResult[0]?.count || 0,
    };
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    // 返回默认值
    return {
      totalCampaigns: 0,
      activePlatforms: 0,
      communityContributions: 0,
    };
  }
}
