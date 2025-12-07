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
 */
export async function getStatistics(): Promise<Statistics> {
  try {
    // 获取已发布的活动数量
    const campaignsResult = await db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.status, 'published'));

    const totalCampaigns = campaignsResult[0]?.count || 0;

    // 获取活跃平台数量
    const platformsResult = await db
      .select({ count: count() })
      .from(platforms);

    const activePlatforms = platformsResult[0]?.count || 0;

    // 获取社区贡献数量（反馈数）
    const reactionsResult = await db
      .select({ count: count() })
      .from(reactions);

    const communityContributions = reactionsResult[0]?.count || 0;

    return {
      totalCampaigns,
      activePlatforms,
      communityContributions,
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
