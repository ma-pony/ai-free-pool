import { eq, sql } from 'drizzle-orm';
import { db } from '../src/libs/DB';
import { campaigns, campaignTranslations, platforms, platformTranslations } from '../src/models/Schema';

async function main() {
  // 检查活动翻译
  console.log('=== 活动翻译检查 ===');
  const allCampaigns = await db.select().from(campaigns).where(eq(campaigns.status, 'published'));
  
  for (const c of allCampaigns) {
    const trans = await db.select().from(campaignTranslations).where(eq(campaignTranslations.campaignId, c.id));
    const locales = trans.map(t => t.locale).sort();
    const missing = ['en', 'zh', 'fr'].filter(l => !locales.includes(l));
    if (missing.length > 0) {
      const zhTitle = trans.find(t => t.locale === 'zh')?.title || trans.find(t => t.locale === 'en')?.title || c.slug;
      console.log(`❌ ${zhTitle} | 缺少: ${missing.join(', ')} | 有: ${locales.join(', ')}`);
    }
  }

  // 检查平台翻译
  console.log('\n=== 平台翻译检查 ===');
  const hasPlatformTrans = await db.select().from(platformTranslations).limit(1);
  if (hasPlatformTrans.length === 0) {
    console.log('⚠️ platformTranslations 表为空，平台可能不使用翻译表');
  } else {
    const allPlatforms = await db.select().from(platforms);
    for (const p of allPlatforms) {
      const trans = await db.select().from(platformTranslations).where(eq(platformTranslations.platformId, p.id));
      const locales = trans.map(t => t.locale).sort();
      const missing = ['en', 'zh', 'fr'].filter(l => !locales.includes(l));
      if (missing.length > 0) {
        console.log(`❌ ${p.name} | 缺少: ${missing.join(', ')} | 有: ${locales.join(', ')}`);
      }
    }
  }

  console.log('\n✅ 检查完成');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
