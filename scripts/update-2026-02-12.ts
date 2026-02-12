#!/usr/bin/env tsx

/**
 * 2026-02-12 数据更新
 * 
 * 更新内容：
 * 1. 阿里云百炼 - 有效期从"90天"更新为"永久有效"
 * 2. NVIDIA NIM - 从"1000次免费调用"更新为"无限调用（40 RPM限制）"
 * 
 * 执行步骤：
 * 1. 标记旧活动为 expired
 * 2. 创建新活动（包含 zh/en/fr 三种语言）
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

// 生成 slug
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

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log('🔄 开始更新数据...\n');

  // 1. 更新阿里云百炼活动
  console.log('📝 更新阿里云百炼活动...');
  
  // 查找阿里云百炼平台
  const aliyunPlatform = await db
    .select()
    .from(platforms)
    .where(eq(platforms.name, '阿里云百炼平台'))
    .limit(1);

  if (aliyunPlatform.length === 0) {
    console.log('❌ 未找到阿里云百炼平台');
  } else {
    const platformId = aliyunPlatform[0].id;
    
    // 查找旧活动（status = 'published'）
    const oldCampaigns = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.platformId, platformId),
          eq(campaigns.status, 'published')
        )
      );

    if (oldCampaigns.length > 0) {
      console.log(`  找到 ${oldCampaigns.length} 个活动，标记为 expired`);
      
      for (const campaign of oldCampaigns) {
        await db
          .update(campaigns)
          .set({ status: 'expired' })
          .where(eq(campaigns.id, campaign.id));
        console.log(`  ✅ 已标记活动 ${campaign.id} 为 expired`);
      }
    }

    // 创建新活动
    const newCampaign = {
      platformId,
      slug: generateSlug('阿里云百炼每模型100万tokens免费额度-永久有效'),
      status: 'published',
      officialLink: 'https://www.aliyun.com/minisite/goods?userCode=gsjtjf7x',
      freeCredit: '每模型100万tokens（永久有效）',
      aiModels: ['Qwen3-Max', 'Qwen3-Coder-Plus', 'Qwen3-Flash', 'Qwen-Plus', 'Qwen-Turbo', 'DeepSeek-R1', 'DeepSeek-V3', 'Kimi-K2', 'MiniMax', 'GLM'],
    };

    const [insertedCampaign] = await db.insert(campaigns).values(newCampaign).returning();
    console.log(`  ✅ 创建新活动 ${insertedCampaign.id}`);

    // 添加翻译
    const translations = [
      {
        campaignId: insertedCampaign.id,
        locale: 'zh',
        title: '阿里云百炼每模型100万tokens免费额度',
        description: '首次开通自动发放免费额度，每个模型100万tokens，永久有效。支持千问全系、DeepSeek全系、Kimi系列、MiniMax系列、GLM智谱系列等主流模型。',
      },
      {
        campaignId: insertedCampaign.id,
        locale: 'en',
        title: 'Aliyun Bailian 1M Free Tokens Per Model',
        description: 'Free quota automatically granted upon first activation, 1 million tokens per model, permanently valid. Supports Qwen series, DeepSeek series, Kimi series, MiniMax series, GLM series and other mainstream models.',
      },
      {
        campaignId: insertedCampaign.id,
        locale: 'fr',
        title: 'Aliyun Bailian - 1M tokens gratuits par modèle',
        description: 'Quota gratuit automatiquement accordé lors de la première activation, 1 million de tokens par modèle, valable en permanence. Supporte les séries Qwen, DeepSeek, Kimi, MiniMax, GLM et d\'autres modèles courants.',
      },
    ];

    await db.insert(campaignTranslations).values(translations);
    console.log('  ✅ 添加三语言翻译\n');
  }

  // 2. 更新 NVIDIA NIM 活动
  console.log('📝 更新 NVIDIA NIM 活动...');
  
  const nvidiaPlatform = await db
    .select()
    .from(platforms)
    .where(eq(platforms.name, 'NVIDIA NIM'))
    .limit(1);

  if (nvidiaPlatform.length === 0) {
    console.log('❌ 未找到 NVIDIA NIM 平台');
  } else {
    const platformId = nvidiaPlatform[0].id;
    
    // 查找旧活动（status = 'published'）
    const oldNvidiaCampaigns = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.platformId, platformId),
          eq(campaigns.status, 'published')
        )
      );

    if (oldNvidiaCampaigns.length > 0) {
      console.log(`  找到 ${oldNvidiaCampaigns.length} 个活动，标记为 expired`);
      
      for (const campaign of oldNvidiaCampaigns) {
        await db
          .update(campaigns)
          .set({ status: 'expired' })
          .where(eq(campaigns.id, campaign.id));
        console.log(`  ✅ 已标记活动 ${campaign.id} 为 expired`);
      }
    }

    // 创建新活动
    const newNvidiaCampaign = {
      platformId,
      slug: generateSlug('NVIDIA-NIM-免费无限调用-40RPM'),
      status: 'published',
      officialLink: 'https://build.nvidia.com/explore/discover',
      freeCredit: '无限调用（40 RPM）',
      aiModels: ['LLaMA-3.3', 'Mistral', 'Nemotron', 'DeepSeek', 'Kimi', 'Minimax'],
    };

    const [insertedNvidiaCampaign] = await db.insert(campaigns).values(newNvidiaCampaign).returning();
    console.log(`  ✅ 创建新活动 ${insertedNvidiaCampaign.id}`);

    // 添加翻译
    const nvidiaTranslations = [
      {
        campaignId: insertedNvidiaCampaign.id,
        locale: 'zh',
        title: 'NVIDIA NIM 免费无限调用',
        description: '无限次API调用，速率限制每分钟40次请求（40 RPM）。支持Kimi、Minimax等开源模型的GPU加速推理。',
      },
      {
        campaignId: insertedNvidiaCampaign.id,
        locale: 'en',
        title: 'NVIDIA NIM Free Unlimited Calls',
        description: 'Unlimited API calls with 40 requests per minute rate limit (40 RPM). Supports GPU-accelerated inference for Kimi, Minimax and other open-source models.',
      },
      {
        campaignId: insertedNvidiaCampaign.id,
        locale: 'fr',
        title: 'Appels illimités gratuits NVIDIA NIM',
        description: 'Appels API illimités avec limite de 40 requêtes par minute (40 RPM). Supporte l\'inférence GPU accélérée pour Kimi, Minimax et d\'autres modèles open-source.',
      },
    ];

    await db.insert(campaignTranslations).values(nvidiaTranslations);
    console.log('  ✅ 添加三语言翻译\n');
  }

  console.log('✅ 数据更新完成！');
}

main().catch(console.error);
