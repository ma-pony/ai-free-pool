/**
 * 简化的分类种子脚本
 * 直接使用环境变量，不依赖 Env.ts
 * Run with: npx tsx scripts/seed-categories-simple.ts
 */

import { config } from 'dotenv';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CATEGORIES } from '../src/config/categories';
import { tags } from '../src/models/Schema';

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

// 从统一配置生成种子数据
const defaultCategories = CATEGORIES.map(cat => ({
  name: cat.nameZh,
  slug: cat.slug,
  nameEn: cat.nameEn,
}));

async function seedCategoryTags() {
  console.log('🌱 开始初始化分类标签...\n');

  let created = 0;
  let skipped = 0;

  for (const category of defaultCategories) {
    try {
      // 检查标签是否已存在
      const existing = await db
        .select()
        .from(tags)
        .where(and(eq(tags.slug, category.slug), eq(tags.type, 'category')))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  跳过 "${category.name}" (已存在)`);
        skipped++;
        continue;
      }

      // 创建标签
      await db.insert(tags).values({
        name: category.name,
        slug: category.slug,
        type: 'category',
      });

      console.log(`✅ 创建分类: "${category.name}" (${category.slug})`);
      created++;
    } catch (error) {
      console.error(`❌ 创建分类 "${category.name}" 时出错:`, error);
    }
  }

  console.log('\n📊 汇总:');
  console.log(`   ✅ 已创建: ${created}`);
  console.log(`   ⏭️  已跳过: ${skipped}`);
  console.log(`   📝 总计: ${defaultCategories.length}`);
  console.log('\n✨ 完成!');
}

// 运行种子函数
seedCategoryTags()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ 种子脚本失败:', error);
    await pool.end();
    process.exit(1);
  });
