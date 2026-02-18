#!/usr/bin/env tsx
/**
 * 2026-02-18 新增平台：xAI (Grok)
 * 每月 $25 免费 API 额度，数据共享计划额外 $150/月
 */
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

function generateSlug(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/-{2,}/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function main() {
  // 1. 创建 xAI 平台
  const existing = await db.select().from(platforms).where(eq(platforms.slug, 'xai'));
  let platformId: string;

  if (existing.length > 0) {
    platformId = existing[0].id;
    console.log('xAI platform exists:', platformId);
  } else {
    console.error('xAI platform not found! Run platform creation first.');
    return;
  }

  // 2. 创建活动：每月 $25 免费额度
  const [campaign] = await db.insert(campaigns).values({
    platformId,
    slug: generateSlug('xAI Monthly Free API Credits'),
    officialLink: 'https://console.x.ai/',
    freeCredit: '每月 $25 免费 API 额度',
    aiModels: ['Grok 4', 'Grok 4.1 Fast', 'Grok Code Fast', 'Grok 3', 'Grok 3 Mini'],
    status: 'published',
  }).returning();
  console.log('Created campaign:', campaign.id);

  // 3. 三语言翻译
  const translations = [
    {
      campaignId: campaign.id,
      locale: 'zh',
      title: 'xAI 每月 $25 免费 API 额度',
      description: '注册 xAI 开发者账号即可获得每月 $25 免费 API 额度，支持 Grok 4 全系列模型。参与数据共享计划可额外获得 $150/月额度。兼容 OpenAI SDK，迁移简单。',
    },
    {
      campaignId: campaign.id,
      locale: 'en',
      title: 'xAI $25 Monthly Free API Credits',
      description: 'Sign up for an xAI developer account to receive $25 in free API credits monthly, supporting the full Grok 4 model lineup. Opt into the data sharing program for an additional $150/month. Compatible with OpenAI SDK for easy migration.',
    },
    {
      campaignId: campaign.id,
      locale: 'fr',
      title: 'xAI 25 $ de crédits API gratuits par mois',
      description: "Inscrivez-vous pour un compte développeur xAI et recevez 25 $ de crédits API gratuits par mois, prenant en charge toute la gamme de modèles Grok 4. Optez pour le programme de partage de données pour 150 $/mois supplémentaires. Compatible avec le SDK OpenAI.",
    },
  ];

  await db.insert(campaignTranslations).values(translations);
  console.log('Created 3 translations for campaign:', campaign.id);
  console.log('Done!');
}

main().catch(console.error);
