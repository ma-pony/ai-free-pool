#!/usr/bin/env tsx

/**
 * 导入字节系 AI 平台（豆包、Trae、即梦）到数据库
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
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const newPlatformsData = [
  // 1. 豆包
  {
    platform: {
      name: '豆包',
      nameEn: 'Doubao',
      website: 'https://www.doubao.com',
      description: '字节跳动旗下 AI 对话平台，提供通用对话、编程、写作等多种 AI 能力，支持中文和多语言',
      descriptionEn: 'ByteDance AI chatbot platform, provides general chat, coding, writing and other AI capabilities, supports Chinese and multiple languages',
    },
    campaign: {
      title: '豆包免费 AI 对话',
      titleEn: 'Doubao Free AI Chat',
      titleFr: 'Chat AI gratuit Doubao',
      description: '豆包提供免费 AI 对话服务，支持通用对话、编程辅助、创意写作、文档分析等多种功能。新用户注册即可无限使用基础模型，高级模型每日赠送免费额度。无需信用卡，手机号注册即可使用。',
      descriptionEn: 'Doubao provides free AI chat service, supports general chat, coding assistance, creative writing, document analysis and more. New users get unlimited access to basic models, free daily quota for advanced models. No credit card needed, phone registration required.',
      descriptionFr: 'Doubao fournit un service de chat AI gratuit, supporte la conversation générale, l\'assistance au codage, l\'écriture créative, l\'analyse de documents et plus. Les nouveaux utilisateurs ont un accès illimité aux modèles de base, quota quotidien gratuit pour les modèles avancés. Pas de carte de crédit nécessaire, inscription par téléphone requise.',
      officialLink: 'https://www.doubao.com',
      freeCredit: '基础模型无限使用，高级模型每日免费额度',
      aiModels: ['Doubao-Pro', 'Doubao-Lite', 'Doubao-Seed-2.0', 'Doubao-Vision'],
      difficultyLevel: 'easy',
    },
  },

  // 2. Trae
  {
    platform: {
      name: 'Trae',
      nameEn: 'Trae',
      website: 'https://trae.ai',
      description: '字节跳动旗下 AI IDE，内置 Doubao Seed 2.0 Code 模型，支持 AI 辅助编程、代码补全、智能重构',
      descriptionEn: 'ByteDance AI IDE with built-in Doubao Seed 2.0 Code model, supports AI-assisted coding, code completion, intelligent refactoring',
    },
    campaign: {
      title: 'Trae 免费 AI 编程 IDE',
      titleEn: 'Trae Free AI Coding IDE',
      titleFr: 'IDE de programmation AI gratuit Trae',
      description: 'Trae 是字节跳动推出的 AI 原生 IDE，内置 Doubao Seed 2.0 Code 模型。支持 AI 对话式编程、代码补全、智能重构、Bug 修复等功能。完全免费，无需信用卡，支持 macOS 和 Windows。',
      descriptionEn: 'Trae is an AI-native IDE launched by ByteDance, with built-in Doubao Seed 2.0 Code model. Supports AI conversational coding, code completion, intelligent refactoring, bug fixing and more. Completely free, no credit card needed, supports macOS and Windows.',
      descriptionFr: 'Trae est un IDE natif AI lancé par ByteDance, avec le modèle Doubao Seed 2.0 Code intégré. Supporte le codage conversationnel AI, la complétion de code, le refactoring intelligent, la correction de bugs et plus. Entièrement gratuit, pas de carte de crédit nécessaire, supporte macOS et Windows.',
      officialLink: 'https://trae.ai',
      freeCredit: '完全免费',
      aiModels: ['Doubao-Seed-2.0-Code', 'Doubao-Pro'],
      difficultyLevel: 'easy',
    },
  },

  // 3. 即梦（Seedance）
  {
    platform: {
      name: '即梦',
      nameEn: 'Jimeng (Seedance)',
      website: 'https://jimeng.jianying.com',
      description: '字节跳动旗下 AI 视频生成平台，基于 Seedance 2.0 模型，支持文生视频、图生视频，原生音画同步',
      descriptionEn: 'ByteDance AI video generation platform, based on Seedance 2.0 model, supports text-to-video, image-to-video, native audio-video sync',
    },
    campaign: {
      title: '即梦 Seedance 2.0 免费 AI 视频生成',
      titleEn: 'Jimeng Seedance 2.0 Free AI Video Generation',
      titleFr: 'Génération vidéo AI gratuite Jimeng Seedance 2.0',
      description: '即梦是字节跳动推出的 AI 视频生成平台，基于 Seedance 2.0 模型。支持文生视频、图生视频，原生音画同步，中文口型毫秒级匹配。新用户注册赠送免费积分，60秒视频约消耗360积分（约10.5元）。',
      descriptionEn: 'Jimeng is an AI video generation platform by ByteDance, based on Seedance 2.0 model. Supports text-to-video, image-to-video, native audio-video sync, millisecond-level Chinese lip-sync. New users get free credits, 60s video costs about 360 credits (~$1.5).',
      descriptionFr: 'Jimeng est une plateforme de génération vidéo AI par ByteDance, basée sur le modèle Seedance 2.0. Supporte texte-vers-vidéo, image-vers-vidéo, synchronisation audio-vidéo native, lip-sync chinois au niveau milliseconde. Les nouveaux utilisateurs reçoivent des crédits gratuits, une vidéo de 60s coûte environ 360 crédits (~1,5$).',
      officialLink: 'https://jimeng.jianying.com',
      freeCredit: '新用户赠送免费积分',
      aiModels: ['Seedance-2.0', 'Seedance-2.0-Pro'],
      difficultyLevel: 'easy',
    },
  },
];

async function main() {
  console.log('开始导入字节系 AI 平台...\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  try {
    let platformSuccess = 0;
    let campaignSuccess = 0;

    for (const data of newPlatformsData) {
      const slug = generateSlug(data.platform.nameEn);

      const existing = await db
        .select()
        .from(platforms)
        .where(eq(platforms.slug, slug))
        .limit(1);

      let platformId: string;

      if (existing.length > 0) {
        platformId = existing[0]!.id;
        console.log(`✓ 平台已存在: ${data.platform.name} (${slug})`);
      } else {
        const [newPlatform] = await db
          .insert(platforms)
          .values({
            name: data.platform.name,
            slug,
            website: data.platform.website,
            description: data.platform.description,
            status: 'active',
          })
          .returning();

        platformId = newPlatform!.id;
        platformSuccess++;
        console.log(`✓ 创建平台: ${data.platform.name} (${slug})`);
      }

      const campaignSlug = generateSlug(`${data.platform.nameEn}-${data.campaign.titleEn}`);

      const existingCampaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.slug, campaignSlug))
        .limit(1);

      if (existingCampaign.length > 0) {
        console.log(`  ⏭ 活动已存在，跳过: ${data.campaign.title}`);
        continue;
      }

      const [newCampaign] = await db
        .insert(campaigns)
        .values({
          platformId,
          slug: campaignSlug,
          status: 'published',
          freeCredit: data.campaign.freeCredit,
          officialLink: data.campaign.officialLink,
          aiModels: data.campaign.aiModels,
          difficultyLevel: data.campaign.difficultyLevel as 'easy' | 'medium' | 'hard',
          isFeatured: false,
          needsVerification: false,
        })
        .returning();

      await db.insert(campaignTranslations).values([
        {
          campaignId: newCampaign!.id,
          locale: 'zh',
          title: data.campaign.title,
          description: data.campaign.description,
          isAiGenerated: false,
        },
        {
          campaignId: newCampaign!.id,
          locale: 'en',
          title: data.campaign.titleEn,
          description: data.campaign.descriptionEn,
          isAiGenerated: false,
        },
        {
          campaignId: newCampaign!.id,
          locale: 'fr',
          title: data.campaign.titleFr,
          description: data.campaign.descriptionFr,
          isAiGenerated: false,
        },
      ]);

      campaignSuccess++;
      console.log(`  ✓ 创建活动: ${data.campaign.title}`);
    }

    console.log(`\n=== 导入完成 ===`);
    console.log(`新增平台: ${platformSuccess} 个`);
    console.log(`新增活动: ${campaignSuccess} 个`);
    console.log(`总计处理: ${newPlatformsData.length} 个平台\n`);
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ 数据导入成功完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 数据导入失败:', error);
    process.exit(1);
  });
