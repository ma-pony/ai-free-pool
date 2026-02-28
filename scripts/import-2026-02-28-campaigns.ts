#!/usr/bin/env tsx

/**
 * 2026-02-28 新增活动：OpenAI/Anthropic 注册赠送 + 腾讯混元小程序成长计划
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

function generateSlug(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/-{2,}/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

type CampaignData = {
  platformName: string;
  title: string;
  titleEn: string;
  titleFr: string;
  description: string;
  descriptionEn: string;
  descriptionFr: string;
  officialLink: string;
  freeCredit: string;
  aiModels: string[];
};

const campaignsData: CampaignData[] = [
  {
    platformName: 'OpenAI',
    title: '新用户注册赠送 $5 API 额度',
    titleEn: '$5 Free API Credits for New Users',
    titleFr: '5 $ de crédits API gratuits pour les nouveaux utilisateurs',
    description: '新用户注册 OpenAI API 即可获得 $5 免费额度，3个月内有效。可用于 GPT-4o、GPT-4.1、o3 等全系列模型。',
    descriptionEn: 'New users get $5 free API credits upon registration, valid for 3 months. Usable with GPT-4o, GPT-4.1, o3 and all available models.',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent 5 $ de crédits API gratuits à l\'inscription, valables 3 mois. Utilisables avec GPT-4o, GPT-4.1, o3 et tous les modèles disponibles.',
    officialLink: 'https://platform.openai.com/signup',
    freeCredit: '$5 USD（3个月有效）',
    aiModels: ['GPT-4o', 'GPT-4.1', 'o3', 'o4-mini'],
  },
  {
    platformName: 'Anthropic',
    title: '新用户注册赠送 $5 API 额度',
    titleEn: '$5 Free API Credits for New Users',
    titleFr: '5 $ de crédits API gratuits pour les nouveaux utilisateurs',
    description: '新用户注册 Anthropic API 即可获得 $5 免费额度，需手机号验证。可用于 Claude 全系列模型。',
    descriptionEn: 'New users get $5 free API credits upon registration, phone verification required. Usable with all Claude models.',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent 5 $ de crédits API gratuits à l\'inscription, vérification téléphonique requise. Utilisables avec tous les modèles Claude.',
    officialLink: 'https://console.anthropic.com/',
    freeCredit: '$5 USD',
    aiModels: ['Claude Opus 4', 'Claude Sonnet 4', 'Claude Haiku 3.5'],
  },
  {
    platformName: '腾讯混元',
    title: 'AI小程序成长计划 - 1亿Token免费额度',
    titleEn: 'AI Mini Program Growth Plan - 100M Free Tokens',
    titleFr: 'Plan de croissance des mini-programmes IA - 100M de tokens gratuits',
    description: '腾讯混元推出AI小程序成长计划，提供1亿Token混元2.0免费额度、1万张文生图额度，以及免费云开发资源和AI算力支持。面向小程序开发者。',
    descriptionEn: 'Tencent Hunyuan AI Mini Program Growth Plan offers 100M free Hunyuan 2.0 tokens, 10K text-to-image credits, plus free cloud development resources and AI computing support. For mini program developers.',
    descriptionFr: 'Le plan de croissance des mini-programmes IA de Tencent Hunyuan offre 100M de tokens Hunyuan 2.0 gratuits, 10K crédits de génération d\'images, ainsi que des ressources cloud gratuites. Pour les développeurs de mini-programmes.',
    officialLink: 'https://cloud.tencent.com/act/pro/wechat-miniprogram-ai',
    freeCredit: '1亿Token + 1万张文生图',
    aiModels: ['混元2.0'],
  },
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  for (const c of campaignsData) {
    // Find platform
    const [platform] = await db.select().from(platforms).where(eq(platforms.name, c.platformName));
    if (!platform) { console.log(`❌ Platform not found: ${c.platformName}`); continue; }

    const slug = `${generateSlug(platform.name)}-${generateSlug(c.titleEn)}`;

    // Check if campaign already exists
    const [existing] = await db.select().from(campaigns).where(eq(campaigns.slug, slug));
    if (existing) { console.log(`⏭️ Already exists: ${slug}`); continue; }

    // Insert campaign
    const [newCampaign] = await db.insert(campaigns).values({
      platformId: platform.id,
      slug,
      status: 'published',
      freeCredit: c.freeCredit,
      officialLink: c.officialLink,
      aiModels: c.aiModels,
      difficultyLevel: 'easy',
    }).returning();

    // Insert translations (zh/en/fr)
    const translations = [
      { campaignId: newCampaign.id, locale: 'zh', title: c.title, description: c.description, isAiGenerated: false },
      { campaignId: newCampaign.id, locale: 'en', title: c.titleEn, description: c.descriptionEn, isAiGenerated: false },
      { campaignId: newCampaign.id, locale: 'fr', title: c.titleFr, description: c.descriptionFr, isAiGenerated: true },
    ];
    await db.insert(campaignTranslations).values(translations);

    console.log(`✅ Added: ${c.platformName} - ${c.title} (${slug})`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
