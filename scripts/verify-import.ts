#!/usr/bin/env tsx

/**
 * 验证导入的数据
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log('=== 验证导入的数据 ===\n');

  // 查询所有平台
  const allPlatforms = await db.select().from(platforms);
  console.log(`📊 平台总数: ${allPlatforms.length}\n`);

  for (const platform of allPlatforms) {
    console.log(`🏢 ${platform.name} (${platform.slug})`);
    console.log(`   网站: ${platform.website}`);
    console.log(`   描述: ${platform.description}`);
    console.log(`   状态: ${platform.status}`);

    // 查询该平台的活动
    const platformCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.platformId, platform.id));

    console.log(`   活动数: ${platformCampaigns.length}`);

    for (const campaign of platformCampaigns) {
      // 查询活动的翻译
      const translations = await db
        .select()
        .from(campaignTranslations)
        .where(eq(campaignTranslations.campaignId, campaign.id));

      const zhTranslation = translations.find(t => t.locale === 'zh');
      const enTranslation = translations.find(t => t.locale === 'en');

      console.log(`\n   📢 活动: ${zhTranslation?.title || campaign.slug}`);
      console.log(`      Slug: ${campaign.slug}`);
      console.log(`      状态: ${campaign.status}`);
      console.log(`      免费额度: ${campaign.freeCredit}`);
      console.log(`      官方链接: ${campaign.officialLink}`);
      console.log(`      AI模型: ${campaign.aiModels?.join(', ') || '无'}`);
      console.log(`      难度: ${campaign.difficultyLevel || '未设置'}`);

      if (zhTranslation) {
        console.log(`      中文标题: ${zhTranslation.title}`);
        console.log(`      中文描述: ${zhTranslation.description}`);
      }

      if (enTranslation) {
        console.log(`      英文标题: ${enTranslation.title}`);
        console.log(`      英文描述: ${enTranslation.description}`);
      }
    }
    console.log('');
  }

  console.log('\n✅ 验证完成');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  });
