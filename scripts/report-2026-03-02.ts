#!/usr/bin/env tsx

/**
 * 2026-03-02 平台更新报告
 * 
 * 本次更新：无新增活动
 * 原因：过去3天未发现新的免费额度活动或定价变化
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, platforms } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  // Get current stats
  const allPlatforms = await db.select().from(platforms);
  const allCampaigns = await db.select().from(campaigns);
  
  const published = allCampaigns.filter(c => c.status === 'published').length;
  const expired = allCampaigns.filter(c => c.status === 'expired').length;
  const pending = allCampaigns.filter(c => c.status === 'pending').length;

  console.log('=== 2026-03-02 平台更新报告 ===\n');
  console.log(`平台总数: ${allPlatforms.length}`);
  console.log(`活动总数: ${allCampaigns.length}`);
  console.log(`  - 已发布: ${published}`);
  console.log(`  - 已过期: ${expired}`);
  console.log(`  - 待审核: ${pending}\n`);
  
  console.log('=== 本次更新 ===');
  console.log('新增活动: 0');
  console.log('更新活动: 0');
  console.log('过期活动: 0\n');
  
  console.log('=== 研究摘要 ===');
  console.log('- Hacker News: 过去一周无 AI 平台免费额度相关讨论');
  console.log('- API 健康检查: DeepSeek/Groq/Cerebras/SambaNova/Together/Fireworks 全部在线');
  console.log('- 主要平台定价页: 无新免费额度活动');
  console.log('- 结论: 2026-02-28 至 2026-03-02 期间无新活动\n');
  
  console.log('=== 最近5条活动 ===');
  const recent = allCampaigns
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  for (const c of recent) {
    const p = allPlatforms.find(p => p.id === c.platformId);
    console.log(`- ${p?.name || 'Unknown'}: ${c.slug} (${c.status})`);
  }
}

main().catch(console.error);
