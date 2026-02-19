#!/usr/bin/env tsx
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { platforms, campaigns, campaignTranslations } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

function slug(t: string) {
  return t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/-{2,}/g, '-');
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema: { platforms, campaigns, campaignTranslations } });

  // 1. New platform: Vast.ai
  console.log('Adding Vast.ai...');
  const [vastP] = await db.insert(platforms).values({
    name: 'Vast.ai', slug: 'vast-ai', website: 'https://vast.ai',
    description: 'GPU云平台，提供Serverless API和GPU租赁服务',
  }).returning({ id: platforms.id });

  const [vastC] = await db.insert(campaigns).values({
    platformId: vastP.id, slug: 'vast-ai-startup-program-2026',
    status: 'published', freeCredit: '最高$2,500免费GPU credits',
    officialLink: 'https://vast.ai/business/startups',
    aiModels: ['Serverless API', 'GPU Cloud'],
    difficultyLevel: 'medium',
  }).returning({ id: campaigns.id });

  await db.insert(campaignTranslations).values([
    { campaignId: vastC.id, locale: 'zh', title: 'Vast.ai Startup Program', description: '新创团队可获最高$2,500免费GPU credits，24/7优先支持，无长期承诺。支持Serverless API和GPU租赁。' },
    { campaignId: vastC.id, locale: 'en', title: 'Vast.ai Startup Program', description: 'Startups get up to $2,500 free GPU credits with 24/7 priority support, no long-term commitment. Includes Serverless API and GPU rental.' },
    { campaignId: vastC.id, locale: 'fr', title: 'Programme Startup Vast.ai', description: 'Les startups obtiennent jusqu\'à 2 500 $ de crédits GPU gratuits avec support prioritaire 24/7, sans engagement à long terme.' },
  ]);
  console.log('✅ Vast.ai added');

  // 2. New platform: 小米 MiMo
  console.log('Adding 小米 MiMo...');
  const [mimoP] = await db.insert(platforms).values({
    name: '小米MiMo', slug: 'xiaomi-mimo', website: 'https://dev.mi.com/mimo',
    description: '小米AI大模型API平台，提供MiMo系列模型',
  }).returning({ id: platforms.id });

  const [mimoC] = await db.insert(campaigns).values({
    platformId: mimoP.id, slug: 'xiaomi-mimo-free-credits-2026',
    status: 'published', freeCredit: '注册送免费额度（20元+）',
    officialLink: 'https://dev.mi.com/mimo',
    aiModels: ['MiMo'],
    difficultyLevel: 'easy',
  }).returning({ id: campaigns.id });

  await db.insert(campaignTranslations).values([
    { campaignId: mimoC.id, locale: 'zh', title: '小米MiMo API免费额度', description: '新老用户可领取专属免费额度，API输入价格0.7元/百万tokens。' },
    { campaignId: mimoC.id, locale: 'en', title: 'Xiaomi MiMo API Free Credits', description: 'New and existing users can claim free credits. API input pricing at ¥0.7/M tokens.' },
    { campaignId: mimoC.id, locale: 'fr', title: 'Crédits gratuits API Xiaomi MiMo', description: 'Les utilisateurs nouveaux et existants peuvent réclamer des crédits gratuits. Tarif API : 0,7 ¥/M tokens en entrée.' },
  ]);
  console.log('✅ 小米MiMo added');

  // 3. New campaign: 阿里云百炼 贺岁活动 + 邀请返利
  console.log('Adding 阿里云百炼 贺岁活动...');
  const aliP = await db.query.platforms.findFirst({ where: eq(platforms.name, '阿里云百炼平台') });
  if (aliP) {
    const [aliC] = await db.insert(campaigns).values({
      platformId: aliP.id, slug: 'aliyun-bailian-spring-2026',
      status: 'published', freeCredit: '新客7000万Tokens+100图+50秒视频+邀请返利最高3000元',
      officialLink: 'https://www.aliyun.com/benefit/ai/discount?userCode=gsjtjf7x',
      startDate: new Date('2026-02-14'), endDate: new Date('2026-03-31'),
      difficultyLevel: 'easy',
    }).returning({ id: campaigns.id });

    await db.insert(campaignTranslations).values([
      { campaignId: aliC.id, locale: 'zh', title: '千问3.5 AI贺岁迎新活动', description: '低至4.5折。新客免费领7000万Tokens+100图+50秒视频，邀请返利每人30元，最高3000元优惠券。2026年2月14日-3月31日。' },
      { campaignId: aliC.id, locale: 'en', title: 'Qwen 3.5 AI Spring Festival Promo', description: 'Up to 55% off. New users get 70M free tokens + 100 images + 50s video. Referral bonus ¥30/invite, up to ¥3000 coupons. Feb 14 - Mar 31, 2026.' },
      { campaignId: aliC.id, locale: 'fr', title: 'Promo Nouvel An Qwen 3.5 AI', description: 'Jusqu\'à 55% de réduction. Nouveaux utilisateurs : 70M tokens + 100 images + 50s vidéo gratuits. Parrainage : 30¥/invité, jusqu\'à 3000¥. 14 fév - 31 mars 2026.' },
    ]);
    console.log('✅ 阿里云百炼贺岁活动 added');
  }

  // 4. New campaign: 火山引擎 新春放价
  console.log('Adding 火山引擎 新春放价...');
  const volcP = await db.query.platforms.findFirst({ where: eq(platforms.name, '火山引擎') });
  if (volcP) {
    const [volcC] = await db.insert(campaigns).values({
      platformId: volcP.id, slug: 'volcengine-spring-2026',
      status: 'published', freeCredit: 'AI节省统一计划抵扣按量付费',
      officialLink: 'https://console.volcengine.com/auth/signup?rc=FSK4RWF7',
      difficultyLevel: 'easy',
    }).returning({ id: campaigns.id });

    await db.insert(campaignTranslations).values([
      { campaignId: volcC.id, locale: 'zh', title: 'AI贺岁新春放价', description: '豆包大模型/视频生成/图像创作模型可购买AI节省统一计划抵扣按量付费。2026年2月活动。' },
      { campaignId: volcC.id, locale: 'en', title: 'AI Spring Festival Sale', description: 'Doubao LLM/video/image models available with AI Savings Plan for pay-as-you-go discount. Feb 2026 promo.' },
      { campaignId: volcC.id, locale: 'fr', title: 'Promo Nouvel An AI', description: 'Modèles Doubao LLM/vidéo/image disponibles avec plan d\'économie AI pour réduction à l\'utilisation. Promo fév 2026.' },
    ]);
    console.log('✅ 火山引擎新春放价 added');
  }

  // Final count
  const allP = await db.query.platforms.findMany({ columns: { id: true } });
  const allC = await db.query.campaigns.findMany({ columns: { id: true, status: true } });
  console.log(`\nDone! Platforms: ${allP.length}, Campaigns: ${allC.length} (active: ${allC.filter(c => c.status !== 'expired').length})`);
}

main().catch(e => { console.error(e); process.exit(1); });
