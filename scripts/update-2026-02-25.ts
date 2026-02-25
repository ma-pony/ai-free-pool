#!/usr/bin/env tsx

/**
 * 2026-02-25 增量更新
 * 1. 火山引擎: 新增两个限时活动（新春特惠 + 2月补贴）
 * 2. SambaNova: 更新 aiModels 列表
 * 3. Google AI Studio: 更新 aiModels 列表 + 描述
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

function generateSlug(text: string): string {
  return text.toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
    .replace(/-{2,}/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL not set');

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log('=== 2026-02-25 增量更新 ===\n');

  // --- 1. 火山引擎: 新增两个限时活动 ---
  console.log('--- 火山引擎: 新增限时活动 ---');

  const volcPlatform = await db.select().from(platforms)
    .where(eq(platforms.name, '火山引擎')).limit(1);

  if (volcPlatform.length === 0) {
    console.log('✗ 火山引擎平台未找到');
  } else {
    const volcId = volcPlatform[0]!.id;

    // 活动1: 新春限时特惠
    const slug1 = 'volcengine-coding-plan-spring-2026';
    const existing1 = await db.select().from(campaigns)
      .where(eq(campaigns.slug, slug1)).limit(1);

    if (existing1.length > 0) {
      console.log(`✓ 活动已存在，跳过: 新春限时特惠 (${slug1})`);
    } else {
      const [c1] = await db.insert(campaigns).values({
        platformId: volcId,
        slug: slug1,
        status: 'published',
        freeCredit: '购买Lite赠20元代金券/Pro赠100元代金券',
        officialLink: 'https://www.volcengine.com/activity/codingplan',
        aiModels: ['Doubao-Seed-Code', 'DeepSeek-V3.2', 'GLM-4.7', 'Kimi-k2-thinking', 'Kimi-K2.5'],
        difficultyLevel: 'easy',
        isFeatured: false,
        needsVerification: false,
        endDate: new Date('2026-02-28T23:59:59+08:00'),
      }).returning();

      await db.insert(campaignTranslations).values([
        {
          campaignId: c1!.id,
          locale: 'zh',
          title: '火山引擎Coding Plan新春限时特惠',
          description: '2026年2月活动：购买/续费Lite套餐赠20元续费代金券（有效期40天），购买/续费Pro套餐赠100元续费代金券（有效期40天）。支持Doubao-Seed-Code、DeepSeek-V3.2、GLM-4.7等模型，可接入Claude Code、Cursor、OpenClaw等工具。',
          isAiGenerated: false,
        },
        {
          campaignId: c1!.id,
          locale: 'en',
          title: 'Volcengine Coding Plan Spring 2026 Promotion',
          description: 'Feb 2026 promotion: Purchase/renew Lite plan to get ¥20 renewal voucher (valid 40 days), Pro plan to get ¥100 renewal voucher (valid 40 days). Supports Doubao-Seed-Code, DeepSeek-V3.2, GLM-4.7 and more.',
          isAiGenerated: false,
        },
        {
          campaignId: c1!.id,
          locale: 'fr',
          title: 'Promotion Printemps 2026 Volcengine Coding Plan',
          description: 'Promotion février 2026 : Achat/renouvellement Lite = bon de 20¥ (valide 40 jours), Pro = bon de 100¥ (valide 40 jours). Supporte Doubao-Seed-Code, DeepSeek-V3.2, GLM-4.7 et plus.',
          isAiGenerated: false,
        },
      ]);
      console.log(`✓ 新增活动: 新春限时特惠 (${slug1}), endDate=2026-02-28`);
    }

    // 活动2: 2月特别补贴（仅新用户）
    const slug2 = 'volcengine-coding-plan-feb-subsidy-2026';
    const existing2 = await db.select().from(campaigns)
      .where(eq(campaigns.slug, slug2)).limit(1);

    if (existing2.length > 0) {
      console.log(`✓ 活动已存在，跳过: 2月特别补贴 (${slug2})`);
    } else {
      const [c2] = await db.insert(campaigns).values({
        platformId: volcId,
        slug: slug2,
        status: 'published',
        freeCredit: '新用户Lite包月8.9元/Pro包月44.9元',
        officialLink: 'https://www.volcengine.com/activity/codingplan',
        aiModels: ['Doubao-Seed-Code', 'DeepSeek-V3.2', 'GLM-4.7', 'Kimi-k2-thinking', 'Kimi-K2.5'],
        difficultyLevel: 'easy',
        isFeatured: false,
        needsVerification: false,
        endDate: new Date('2026-02-28T23:59:59+08:00'),
      }).returning();

      await db.insert(campaignTranslations).values([
        {
          campaignId: c2!.id,
          locale: 'zh',
          title: '火山引擎Coding Plan 2月特别补贴（新用户）',
          description: '2026年2月9日-28日，仅限新用户：Lite包月8.9元、包季54元；Pro包月44.9元、包季270元。支持Doubao-Seed-Code、DeepSeek-V3.2、GLM-4.7等模型。',
          isAiGenerated: false,
        },
        {
          campaignId: c2!.id,
          locale: 'en',
          title: 'Volcengine Coding Plan Feb Special Subsidy (New Users)',
          description: 'Feb 9-28, 2026, new users only: Lite monthly ¥8.9, quarterly ¥54; Pro monthly ¥44.9, quarterly ¥270. Supports Doubao-Seed-Code, DeepSeek-V3.2, GLM-4.7 and more.',
          isAiGenerated: false,
        },
        {
          campaignId: c2!.id,
          locale: 'fr',
          title: 'Subvention spéciale février Volcengine Coding Plan (Nouveaux utilisateurs)',
          description: '9-28 février 2026, nouveaux utilisateurs uniquement : Lite mensuel 8,9¥, trimestriel 54¥ ; Pro mensuel 44,9¥, trimestriel 270¥. Supporte Doubao-Seed-Code, DeepSeek-V3.2, GLM-4.7 et plus.',
          isAiGenerated: false,
        },
      ]);
      console.log(`✓ 新增活动: 2月特别补贴 (${slug2}), endDate=2026-02-28`);
    }
  }

  // --- 2. SambaNova: 更新 aiModels ---
  console.log('\n--- SambaNova: 更新模型列表 ---');

  const sambaSlug = 'sambanova-sambanova-free-inference-tier';
  const sambaCampaigns = await db.select().from(campaigns)
    .where(eq(campaigns.slug, sambaSlug)).limit(1);

  if (sambaCampaigns.length === 0) {
    // 尝试模糊匹配
    const allSamba = await db.select().from(campaigns)
      .innerJoin(platforms, eq(campaigns.platformId, platforms.id))
      .where(eq(platforms.name, 'SambaNova'));
    console.log(`SambaNova 活动数: ${allSamba.length}`);
    for (const s of allSamba) {
      console.log(`  - ${s.campaigns.slug} (status: ${s.campaigns.status})`);
    }
  } else {
    const oldModels = sambaCampaigns[0]!.aiModels;
    const newModels = [
      'DeepSeek-R1-0528', 'DeepSeek-V3.1', 'DeepSeek-V3.2',
      'Llama-4-Maverick-17B-128E', 'Llama-4-Scout-17B-16E',
      'Meta-Llama-3.3-70B', 'Meta-Llama-3.1-8B',
      'Qwen3-32B', 'Qwen2.5-Coder-32B',
      'ALLaM-7B-Instruct-preview',
    ];

    if (JSON.stringify(oldModels) === JSON.stringify(newModels)) {
      console.log('✓ SambaNova 模型列表无变化，跳过');
    } else {
      // 标记旧活动 expired，创建新版本
      await db.update(campaigns)
        .set({ status: 'expired' })
        .where(eq(campaigns.id, sambaCampaigns[0]!.id));

      const newSlug = `${sambaSlug}-v${Date.now().toString(36)}`;
      const [newC] = await db.insert(campaigns).values({
        platformId: sambaCampaigns[0]!.platformId,
        slug: newSlug,
        status: 'published',
        freeCredit: sambaCampaigns[0]!.freeCredit,
        officialLink: sambaCampaigns[0]!.officialLink,
        aiModels: newModels,
        difficultyLevel: 'easy',
        isFeatured: false,
        needsVerification: false,
      }).returning();

      // 复制翻译
      const oldTranslations = await db.select().from(campaignTranslations)
        .where(eq(campaignTranslations.campaignId, sambaCampaigns[0]!.id));

      for (const t of oldTranslations) {
        await db.insert(campaignTranslations).values({
          campaignId: newC!.id,
          locale: t.locale,
          title: t.title,
          description: t.description,
          isAiGenerated: t.isAiGenerated,
        });
      }

      console.log(`✓ SambaNova 模型列表已更新 (${newSlug})`);
      console.log(`  旧: ${JSON.stringify(oldModels)}`);
      console.log(`  新: ${JSON.stringify(newModels)}`);
    }
  }

  // --- 3. Google AI Studio: 更新 aiModels ---
  console.log('\n--- Google AI Studio: 更新模型列表 ---');

  const googleSlug = 'google-ai-studio-google-ai-studio-free-quota';
  const googleCampaigns = await db.select().from(campaigns)
    .where(eq(campaigns.slug, googleSlug)).limit(1);

  if (googleCampaigns.length === 0) {
    const allGoogle = await db.select().from(campaigns)
      .innerJoin(platforms, eq(campaigns.platformId, platforms.id))
      .where(eq(platforms.name, 'Google AI Studio'));
    console.log(`Google AI Studio 活动数: ${allGoogle.length}`);
    for (const g of allGoogle) {
      console.log(`  - ${g.campaigns.slug} (status: ${g.campaigns.status})`);
    }
  } else {
    const oldModels = googleCampaigns[0]!.aiModels;
    const newModels = ['Gemini 3.1 Pro', 'Gemini 3 Pro', 'Gemini 3 Flash', 'Gemini 2.5 Flash', 'Gemini 2.5 Pro', 'Veo', 'Nano'];

    if (JSON.stringify(oldModels) === JSON.stringify(newModels)) {
      console.log('✓ Google AI Studio 模型列表无变化，跳过');
    } else {
      await db.update(campaigns)
        .set({ status: 'expired' })
        .where(eq(campaigns.id, googleCampaigns[0]!.id));

      const newSlug = `${googleSlug}-v${Date.now().toString(36)}`;
      const [newC] = await db.insert(campaigns).values({
        platformId: googleCampaigns[0]!.platformId,
        slug: newSlug,
        status: 'published',
        freeCredit: '大部分模型免费',
        officialLink: googleCampaigns[0]!.officialLink,
        aiModels: newModels,
        difficultyLevel: 'easy',
        isFeatured: false,
        needsVerification: false,
      }).returning();

      const oldTranslations = await db.select().from(campaignTranslations)
        .where(eq(campaignTranslations.campaignId, googleCampaigns[0]!.id));

      for (const t of oldTranslations) {
        await db.insert(campaignTranslations).values({
          campaignId: newC!.id,
          locale: t.locale,
          title: t.title,
          description: t.locale === 'zh'
            ? '注册账号，大部分模型都有免费额度。现已支持 Gemini 3.1 Pro Preview、Gemini 3 Pro/Flash 等最新模型。'
            : t.locale === 'en'
            ? 'Register an account, most models have free quota. Now supports Gemini 3.1 Pro Preview, Gemini 3 Pro/Flash and other latest models.'
            : 'Créez un compte, la plupart des modèles ont un quota gratuit. Supporte maintenant Gemini 3.1 Pro Preview, Gemini 3 Pro/Flash et d\'autres modèles récents.',
          isAiGenerated: false,
        });
      }

      console.log(`✓ Google AI Studio 模型列表已更新 (${newSlug})`);
      console.log(`  旧: ${JSON.stringify(oldModels)}`);
      console.log(`  新: ${JSON.stringify(newModels)}`);
    }
  }

  console.log('\n=== 更新完成 ===');
}

main().catch(console.error);
