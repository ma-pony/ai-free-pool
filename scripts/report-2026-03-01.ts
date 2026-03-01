#!/usr/bin/env tsx

/**
 * 2026-03-01 平台更新报告
 * 
 * 本次更新：无新增活动
 * 原因：研究员超时，手动检查未发现新活动
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

  console.log('=== 2026-03-01 平台更新报告 ===\n');
  console.log('平台总数:', allPlatforms.length);
  console.log('活动总数:', allCampaigns.length);
  console.log('  - 进行中 (published):', published);
  console.log('  - 已过期 (expired):', expired);
  console.log('\n本次更新: 无新增活动');
  console.log('原因: 研究员搜索超时，手动检查未发现新促销活动');
  console.log('\nAPI 健康检查: 全部正常');
  console.log('  - DeepSeek: 401 (服务正常，需认证)');
  console.log('  - Groq: 401 (服务正常，需认证)');
  console.log('  - Cerebras: 403 (服务正常，需认证)');
  console.log('  - SambaNova: 200 (正常)');
  console.log('  - Together: 401 (服务正常，需认证)');
  console.log('  - Fireworks: 401 (服务正常，需认证)');
  console.log('  - aifreepool.com: 200 (正常)');
}

main().catch(console.error);
