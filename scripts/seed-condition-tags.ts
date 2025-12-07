/**
 * 参与条件种子脚本
 * Run with: npx tsx scripts/seed-condition-tags.ts
 */

import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CONDITION_TAGS } from '../src/config/conditionTags';
import { conditionTags } from '../src/models/Schema';

// 加载环境变量
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// 创建数据库连接
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 1,
});
const db = drizzle({ client: pool });

async function seedConditionTags() {
  console.log('🌱 开始初始化参与条件标签...\n');

  let created = 0;
  const skipped = 0;
  let updated = 0;

  for (const condition of CONDITION_TAGS) {
    try {
      // 检查标签是否已存在
      const existing = await db
        .select()
        .from(conditionTags)
        .where(eq(conditionTags.slug, condition.slug))
        .limit(1);

      if (existing.length > 0) {
        // 更新现有标签（以防配置有变化）
        await db
          .update(conditionTags)
          .set({
            name: condition.nameZh,
            type: condition.type,
            difficultyWeight: condition.difficultyWeight,
          })
          .where(eq(conditionTags.slug, condition.slug));

        console.log(`🔄 更新条件: "${condition.nameZh}" (${condition.slug})`);
        updated++;
        continue;
      }

      // 创建新标签
      await db.insert(conditionTags).values({
        name: condition.nameZh,
        slug: condition.slug,
        type: condition.type,
        difficultyWeight: condition.difficultyWeight,
      });

      console.log(`✅ 创建条件: "${condition.nameZh}" (${condition.slug}) - ${condition.type}`);
      created++;
    } catch (error) {
      console.error(`❌ 处理条件 "${condition.nameZh}" 时出错:`, error);
    }
  }

  console.log('\n📊 汇总:');
  console.log(`   ✅ 已创建: ${created}`);
  console.log(`   🔄 已更新: ${updated}`);
  console.log(`   ⏭️  已跳过: ${skipped}`);
  console.log(`   📝 总计: ${CONDITION_TAGS.length}`);

  // 按类型统计
  const requirements = CONDITION_TAGS.filter(t => t.type === 'requirement').length;
  const benefits = CONDITION_TAGS.filter(t => t.type === 'benefit').length;
  console.log(`\n📋 类型统计:`);
  console.log(`   🔒 要求类: ${requirements}`);
  console.log(`   ✨ 优势类: ${benefits}`);

  console.log('\n✨ 完成!');
}

// 运行种子函数
seedConditionTags()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ 种子脚本失败:', error);
    await pool.end();
    process.exit(1);
  });
