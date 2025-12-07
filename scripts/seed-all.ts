/**
 * 统一初始化脚本 - 初始化所有基础数据
 * Run with: npx tsx scripts/seed-all.ts
 */

import { config } from 'dotenv';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CATEGORIES } from '../src/config/categories';
import { CONDITION_TAGS } from '../src/config/conditionTags';
import { conditionTags, tags } from '../src/models/Schema';

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

// ============================================================================
// 1. 初始化分类标签
// ============================================================================
async function seedCategories() {
  console.log('📂 初始化分类标签...\n');

  let created = 0;
  let skipped = 0;

  const categoryData = CATEGORIES.map(cat => ({
    name: cat.nameZh,
    slug: cat.slug,
    nameEn: cat.nameEn,
  }));

  for (const category of categoryData) {
    try {
      const existing = await db
        .select()
        .from(tags)
        .where(and(eq(tags.slug, category.slug), eq(tags.type, 'category')))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⏭️  跳过分类: "${category.name}"`);
        skipped++;
        continue;
      }

      await db.insert(tags).values({
        name: category.name,
        slug: category.slug,
        type: 'category',
      });

      console.log(`  ✅ 创建分类: "${category.name}" (${category.slug})`);
      created++;
    } catch (error) {
      console.error(`  ❌ 创建分类 "${category.name}" 时出错:`, error);
    }
  }

  console.log(`\n  📊 分类汇总: 创建 ${created}, 跳过 ${skipped}\n`);
  return { created, skipped };
}

// ============================================================================
// 2. 初始化参与条件标签
// ============================================================================
async function seedConditions() {
  console.log('🏷️  初始化参与条件标签...\n');

  let created = 0;
  let updated = 0;

  for (const condition of CONDITION_TAGS) {
    try {
      const existing = await db
        .select()
        .from(conditionTags)
        .where(eq(conditionTags.slug, condition.slug))
        .limit(1);

      if (existing.length > 0) {
        // 更新现有标签
        await db
          .update(conditionTags)
          .set({
            name: condition.nameZh,
            type: condition.type,
            difficultyWeight: condition.difficultyWeight,
          })
          .where(eq(conditionTags.slug, condition.slug));

        console.log(`  🔄 更新条件: "${condition.nameZh}" (${condition.slug})`);
        updated++;
        continue;
      }

      await db.insert(conditionTags).values({
        name: condition.nameZh,
        slug: condition.slug,
        type: condition.type,
        difficultyWeight: condition.difficultyWeight,
      });

      console.log(`  ✅ 创建条件: "${condition.nameZh}" (${condition.slug})`);
      created++;
    } catch (error) {
      console.error(`  ❌ 处理条件 "${condition.nameZh}" 时出错:`, error);
    }
  }

  const requirements = CONDITION_TAGS.filter(t => t.type === 'requirement').length;
  const benefits = CONDITION_TAGS.filter(t => t.type === 'benefit').length;

  console.log(`\n  📊 条件汇总: 创建 ${created}, 更新 ${updated}`);
  console.log(`  📋 类型统计: 要求类 ${requirements}, 优势类 ${benefits}\n`);

  return { created, updated };
}

// ============================================================================
// 主函数
// ============================================================================
async function seedAll() {
  console.log('🌱 开始初始化所有基础数据...\n');
  console.log('='.repeat(60));
  console.log('\n');

  try {
    // 1. 初始化分类
    const categoryStats = await seedCategories();

    console.log('='.repeat(60));
    console.log('\n');

    // 2. 初始化参与条件
    const conditionStats = await seedConditions();

    console.log('='.repeat(60));
    console.log('\n');

    // 总结
    console.log('✨ 所有数据初始化完成！\n');
    console.log('📊 总体统计:');
    console.log(`   📂 分类: ${categoryStats.created} 个已创建, ${categoryStats.skipped} 个已存在`);
    console.log(`   🏷️  条件: ${conditionStats.created} 个已创建, ${conditionStats.updated} 个已更新`);
    console.log('\n');
    console.log('💡 下一步:');
    console.log('   1. 重启开发服务器以应用更改');
    console.log('   2. 访问活动列表页查看筛选器');
    console.log('   3. 为现有活动添加分类和条件标签');
    console.log('\n');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  }
}

// 运行初始化
seedAll()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ 脚本执行失败:', error);
    await pool.end();
    process.exit(1);
  });
